"use client";

/**
 * components/work/TaplySimulation.tsx
 *
 * Master interactive product sandbox for Taply on /work/taply.
 * Implements a unified state-managed simulation featuring:
 *
 *   1. Authenticated Dashboard with real-time stats and profile health
 *   2. Real-Time Profile Customizer with layout variants, palette picker, and live mini-card preview
 *   3. Simulated Public Profile Viewport with vCard download and live lead exchange form
 *   4. 2D Conference Networking Hall with 8 interactive attendees for simulated NFC taps
 *   5. Real-Time Analytics & Leads Inbox with pure responsive SVG Area Chart and CRM sync stream
 *
 * Strictly free of unicode emojis and em dashes across all UI and data layers.
 */

import React, { useState, useReducer, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

import {
  TaplyProfileState,
  NetworkingAttendee,
  CapturedLead,
  AnalyticsSummary,
  TimeSeriesDay,
  LayoutVariant,
  ProfileLink,
  INITIAL_TAPLY_PROFILE,
  HALL_ATTENDEES,
  INITIAL_LEADS,
  INITIAL_ANALYTICS,
  INITIAL_TIME_SERIES,
} from "./taply-simulation-data";

export type SandboxTab = "dashboard" | "customizer" | "public_link" | "networking" | "analytics";

// ─── STATE REDUCER & ACTIONS ────────────────────────────────────────────────

interface SandboxState {
  profile: TaplyProfileState;
  attendees: NetworkingAttendee[];
  leads: CapturedLead[];
  analytics: AnalyticsSummary;
  timeSeries: TimeSeriesDay[];
  lastTapNotification: string | null;
}

type SandboxAction =
  | { type: "UPDATE_PROFILE"; patch: Partial<TaplyProfileState> }
  | { type: "UPDATE_THEME"; patch: Partial<TaplyProfileState["theme_config"]> }
  | { type: "ADD_LINK"; link: ProfileLink }
  | { type: "DELETE_LINK"; id: number }
  | { type: "PUBLISH_PROFILE" }
  | { type: "TAP_ATTENDEE"; attendee: NetworkingAttendee }
  | { type: "SUBMIT_LEAD"; lead: Omit<CapturedLead, "id" | "timestamp" | "crm_synced"> }
  | { type: "CLEAR_NOTIFICATION" };

function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: { ...state.profile, ...action.patch, is_published: false },
      };
    case "UPDATE_THEME":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: false,
          theme_config: { ...state.profile.theme_config, ...action.patch },
        },
      };
    case "ADD_LINK":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: false,
          links: [...state.profile.links, action.link],
        },
      };
    case "DELETE_LINK":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: false,
          links: state.profile.links.filter((l) => l.id !== action.id),
        },
      };
    case "PUBLISH_PROFILE":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: true,
          published_at: "Published just now",
        },
      };
    case "TAP_ATTENDEE": {
      const att = action.attendee;
      if (att.has_tapped) return state;

      const newLead: CapturedLead = {
        id: `lead_${Date.now()}`,
        name: att.name,
        company: att.company,
        email: att.email,
        phone: att.phone,
        source: "nfc_tap",
        location: att.location,
        timestamp: "Just now",
        crm_synced: true,
      };

      const updatedAttendees = state.attendees.map((a) =>
        a.id === att.id ? { ...a, has_tapped: true } : a
      );

      const nextTaps = state.analytics.lifetime.taps + 1;
      const nextSaves = state.analytics.lifetime.saves + 1;
      const nextViews = state.analytics.lifetime.views + 1;

      const updatedTimeSeries = [...state.timeSeries];
      const lastIdx = updatedTimeSeries.length - 1;
      if (lastIdx >= 0) {
        updatedTimeSeries[lastIdx] = {
          ...updatedTimeSeries[lastIdx],
          taps: updatedTimeSeries[lastIdx].taps + 1,
          saves: updatedTimeSeries[lastIdx].saves + 1,
          views: updatedTimeSeries[lastIdx].views + 1,
        };
      }

      return {
        ...state,
        attendees: updatedAttendees,
        leads: [newLead, ...state.leads],
        analytics: {
          ...state.analytics,
          lifetime: {
            ...state.analytics.lifetime,
            taps: nextTaps,
            saves: nextSaves,
            views: nextViews,
          },
          last_30_days: {
            ...state.analytics.last_30_days,
            taps: state.analytics.last_30_days.taps + 1,
            saves: state.analytics.last_30_days.saves + 1,
            views: state.analytics.last_30_days.views + 1,
          },
          sources: {
            ...state.analytics.sources,
            nfc: state.analytics.sources.nfc + 1,
          },
        },
        timeSeries: updatedTimeSeries,
        lastTapNotification: `NFC Tap with ${att.name} (${att.company}) confirmed. Analytics updated (+1 Tap, +1 Lead).`,
      };
    }
    case "SUBMIT_LEAD": {
      const newLead: CapturedLead = {
        ...action.lead,
        id: `lead_form_${Date.now()}`,
        timestamp: "Just now",
        crm_synced: true,
      };
      return {
        ...state,
        leads: [newLead, ...state.leads],
        lastTapNotification: `Lead from ${newLead.name} received via Public Profile.`,
      };
    }
    case "CLEAR_NOTIFICATION":
      return { ...state, lastTapNotification: null };
    default:
      return state;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Master Component
   ───────────────────────────────────────────────────────────────────────────── */
export function TaplySimulation() {
  const [activeTab, setActiveTab] = useState<SandboxTab>("dashboard");
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [state, dispatch] = useReducer(sandboxReducer, {
    profile: INITIAL_TAPLY_PROFILE,
    attendees: HALL_ATTENDEES,
    leads: INITIAL_LEADS,
    analytics: INITIAL_ANALYTICS,
    timeSeries: INITIAL_TIME_SERIES,
    lastTapNotification: null,
  });

  const { profile, attendees, leads, analytics, timeSeries, lastTapNotification } = state;

  // Auto-dismiss toast notification after 4s
  useEffect(() => {
    if (lastTapNotification) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLEAR_NOTIFICATION" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastTapNotification]);

  const copyPublicLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadVcard = () => {
    const vcardContent = `BEGIN:VCARD\nVERSION:4.0\nFN:${profile.display_name}\nORG:${profile.company}\nTITLE:${profile.title}\nTEL:${profile.phone[0] || ""}\nEMAIL:${profile.email_addresses[0] || ""}\nURL:https://gettaply.me/p/${profile.username}\nNOTE:${profile.bio}\nEND:VCARD`;
    const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${profile.username}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {lastTapNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-surface border border-acc/50 text-t1 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-acc/20 text-acc flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
              [NFC]
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono font-bold text-acc uppercase">
                REAL-TIME EVENT DISPATCH
              </div>
              <p className="text-xs text-t2 mt-0.5 leading-relaxed">{lastTapNotification}</p>
            </div>
            <button
              onClick={() => dispatch({ type: "CLEAR_NOTIFICATION" })}
              className="text-t3 hover:text-t1 text-xs cursor-pointer p-1"
            >
              x
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <div className="border-border mb-6 flex flex-wrap items-baseline justify-between gap-2 border-t pt-6">
        <div className="flex items-baseline gap-3">
          <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full shadow-[0_0_8px_var(--acc)]" />
          <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
            Master Product Sandbox &amp; NFC Networking Hall
          </h2>
          <span className="text-t3 font-mono text-[11px] italic">
            portal &gt; builder &gt; viewport &gt; one tap &gt; telemetry
          </span>
        </div>
        <span className="text-acc font-mono text-[11px]">
          live interactive sandbox
        </span>
      </div>

      {/* 5-Tab Master Sandbox Navigation */}
      <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
        {[
          { id: "dashboard", label: "Dashboard", badge: "PORTAL" },
          { id: "customizer", label: "Profile Customizer", badge: "BUILDER" },
          { id: "public_link", label: "Public Profile Link", badge: "VIEWPORT" },
          { id: "networking", label: "NFC Networking Hall", badge: "ONE TAP" },
          { id: "analytics", label: "Analytics & Leads", badge: "TELEMETRY" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SandboxTab)}
              className={cn(
                "flex flex-1 min-w-[150px] items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-code-bg border-acc/50 text-t1 shadow-sm border"
                  : "hover:bg-bg/40 text-t3 hover:text-t2 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-acc border border-acc/30 bg-acc/10 px-1.5 py-0.5 rounded shrink-0">
                  {tab.badge}
                </span>
                <span className="font-display text-[12.5px] font-semibold text-t1 truncate">
                  {tab.label}
                </span>
              </div>
              {isActive ? (
                <span className="bg-acc h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--acc)] shrink-0 ml-2" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Sandbox Stage Container */}
      <div className="border-border bg-code-bg relative min-h-[520px] overflow-hidden rounded-2xl border p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Dashboard Greeting Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-mono text-t3">Good day,</span>
                  <h3 className="text-xl font-bold text-t1 mt-0.5">{profile.display_name}</h3>
                  <p className="text-xs text-t2">{profile.title} at {profile.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("public_link")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-t1 hover:bg-surface/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    View Public Profile <span className="font-mono text-acc">[-&gt;]</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Profile Views", value: analytics.lifetime.views, sub: "+12% 30d", color: "text-acc" },
                  { label: "Contact Saves", value: analytics.lifetime.saves, sub: "+8% 30d", color: "text-amber" },
                  { label: "NFC Taps", value: analytics.lifetime.taps, sub: "High Activity", color: "text-[#60A5FA]" },
                  { label: "QR Scans", value: analytics.lifetime.qr_scans, sub: "Direct Scans", color: "text-[#2DD4BF]" },
                ].map((stat, i) => (
                  <div key={i} className="bg-surface/60 border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-t3 font-medium">{stat.label}</span>
                      <span className={cn("font-mono text-xs font-bold", stat.color)}>[STAT]</span>
                    </div>
                    <div className="text-2xl font-bold text-t1 mt-2 font-mono">
                      {stat.value.toLocaleString()}
                    </div>
                    <span className="text-[10.5px] text-t3 font-mono mt-1 block">{stat.sub}</span>
                  </div>
                ))}
              </div>

              {/* Profile Completeness & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface/50 border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-t1 uppercase tracking-wider font-mono">
                      Profile Completeness
                    </span>
                    <span className="text-xs font-mono font-bold text-acc">100%</span>
                  </div>
                  <div className="w-full bg-code-bg rounded-full h-2 mb-4 overflow-hidden border border-border/40">
                    <div className="bg-gradient-to-r from-acc to-amber h-full rounded-full w-full" />
                  </div>
                  <div className="space-y-2 text-xs text-t2">
                    <div className="flex items-center gap-2">
                      <span className="text-acc font-mono">[OK]</span> Display Name &amp; Job Title configured
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-acc font-mono">[OK]</span> Profile Photo &amp; Cover Banner uploaded
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-acc font-mono">[OK]</span> 4 Active Social &amp; Booking Endpoints attached
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-acc font-mono">[OK]</span> RFC 6350 vCard &amp; QR Code Active
                    </div>
                  </div>
                </div>

                <div className="bg-surface/50 border border-border rounded-xl p-5">
                  <span className="text-xs font-semibold text-t1 uppercase tracking-wider font-mono block mb-3">
                    Quick Actions
                  </span>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setActiveTab("customizer")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-code-bg hover:bg-code-bg/80 border border-border/60 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-medium text-t1">Customize Card &amp; Theme</p>
                        <p className="text-[10.5px] text-t3">Edit layout, accent colors, and links</p>
                      </div>
                      <span className="text-t3 font-mono text-xs">[-&gt;]</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("networking")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-code-bg hover:bg-code-bg/80 border border-border/60 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-medium text-t1">Enter Networking Hall</p>
                        <p className="text-[10.5px] text-t3">Simulate NFC taps with attendees</p>
                      </div>
                      <span className="text-amber font-mono text-xs">[-&gt;]</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. PROFILE CUSTOMIZER VIEW */}
          {activeTab === "customizer" && (
            <motion.div
              key="customizer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-t1">Live Profile &amp; Card Customizer</h3>
                  <p className="text-xs text-t3">Changes reflect dynamically in the live public card preview.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: "PUBLISH_PROFILE" })}
                    className="bg-acc text-code-bg hover:bg-acc/90 font-semibold px-4 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-mono font-bold"
                  >
                    <span>[OK]</span> {profile.is_published ? "Published" : "Publish Profile"}
                  </button>
                </div>
              </div>

              {/* Controls (Left) vs Mini Preview (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Identity */}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                    <span className="text-xs font-mono text-acc uppercase font-bold">1. Card Identity</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-t3 block mb-1 font-mono">Display Name</label>
                        <input
                          type="text"
                          value={profile.display_name}
                          onChange={(e) => dispatch({ type: "UPDATE_PROFILE", patch: { display_name: e.target.value } })}
                          className="w-full bg-code-bg border border-border rounded-lg px-3 py-1.5 text-xs text-t1 focus:border-acc outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-t3 block mb-1 font-mono">Job Title</label>
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => dispatch({ type: "UPDATE_PROFILE", patch: { title: e.target.value } })}
                          className="w-full bg-code-bg border border-border rounded-lg px-3 py-1.5 text-xs text-t1 focus:border-acc outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-t3 block mb-1 font-mono">Company</label>
                        <input
                          type="text"
                          value={profile.company}
                          onChange={(e) => dispatch({ type: "UPDATE_PROFILE", patch: { company: e.target.value } })}
                          className="w-full bg-code-bg border border-border rounded-lg px-3 py-1.5 text-xs text-t1 focus:border-acc outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-t3 block mb-1 font-mono">Location</label>
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => dispatch({ type: "UPDATE_PROFILE", patch: { location: e.target.value } })}
                          className="w-full bg-code-bg border border-border rounded-lg px-3 py-1.5 text-xs text-t1 focus:border-acc outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Layout Variant & Themes */}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                    <span className="text-xs font-mono text-amber uppercase font-bold">2. Layout Variant &amp; Theme</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["classic", "hero", "compact", "banner"] as LayoutVariant[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => dispatch({ type: "UPDATE_THEME", patch: { variant: v } })}
                          className={cn(
                            "p-2 rounded-lg border text-left text-xs transition-all cursor-pointer font-mono",
                            profile.theme_config.variant === v
                              ? "border-acc bg-acc/10 text-acc font-semibold"
                              : "border-border text-t3 hover:text-t1"
                          )}
                        >
                          <span className="capitalize">{v}</span>
                        </button>
                      ))}
                    </div>

                    {/* Accent Color Presets */}
                    <div className="pt-2">
                      <label className="text-[11px] text-t3 block mb-1.5 font-mono">Card Accent Color</label>
                      <div className="flex items-center gap-2">
                        {["#5CC9A0", "#F59E0B", "#60A5FA", "#2DD4BF", "#818CF8", "#38BDF8"].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => dispatch({ type: "UPDATE_THEME", patch: { primary_color: hex } })}
                            style={{ backgroundColor: hex }}
                            className={cn(
                              "w-7 h-7 rounded-full border-2 transition-transform cursor-pointer",
                              profile.theme_config.primary_color === hex ? "border-white scale-110" : "border-transparent"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Social Links List */}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-t1 uppercase font-bold">3. Active Links</span>
                      <span className="text-[10px] text-t3 font-mono">{profile.links.length} attached</span>
                    </div>
                    <div className="space-y-1.5">
                      {profile.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-2.5 rounded-lg bg-code-bg border border-border/40 text-xs">
                          <span className="font-medium text-t1">{link.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-t3 font-mono">{link.url}</span>
                            <button
                              onClick={() => dispatch({ type: "DELETE_LINK", id: link.id })}
                              className="text-t3 hover:text-red-400 p-1 cursor-pointer font-mono text-[10px]"
                            >
                              [del]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Mini Viewport */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-surface/30 border border-border rounded-xl">
                  <div className="text-xs font-mono text-t3 mb-3 uppercase tracking-wider">Live Viewport Preview</div>
                  <div className="w-[290px] bg-[#161616] border border-border rounded-2xl p-4 text-white shadow-2xl relative overflow-hidden">
                    <div className="h-16 -mx-4 -mt-4 bg-gradient-to-r from-acc/30 to-amber/30 mb-3" />
                    <div className="w-14 h-14 rounded-full bg-surface border-2 border-white/20 -mt-10 mx-auto overflow-hidden">
                      <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-sm font-bold truncate">{profile.display_name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{profile.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{profile.company}</div>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={handleDownloadVcard}
                        style={{ backgroundColor: profile.theme_config.primary_color }}
                        className="w-full py-1.5 rounded-full text-xs font-semibold text-black cursor-pointer font-mono"
                      >
                        Save Contact (.vcf)
                      </button>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {profile.links.slice(0, 3).map((link) => (
                        <div key={link.id} className="p-2 rounded-lg bg-white/5 text-[11px] flex justify-between font-mono">
                          <span>{link.label}</span>
                          <span className="text-gray-400">[-&gt;]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("public_link")}
                    className="mt-4 text-xs font-mono text-acc hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open Full Viewport <span className="text-acc font-mono">[-&gt;]</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SIMULATED PUBLIC LINK VIEW */}
          {activeTab === "public_link" && (
            <motion.div
              key="public_link"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Address Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border text-xs font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-acc" />
                  <span className="text-t3 truncate">https://gettaply.me/p/{profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPublicLink}
                    className="px-2.5 py-1 rounded bg-code-bg border border-border text-t2 hover:text-t1 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="font-mono text-acc">{copiedLink ? "[OK]" : "[CP]"}</span>
                    {copiedLink ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-code-bg border border-border text-t2 hover:text-t1 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    [QR] View QR
                  </button>
                </div>
              </div>

              {/* Render Public Profile Card */}
              <div className="max-w-md mx-auto bg-[#161616] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6">
                <div className="h-28 -mx-6 -mt-6 bg-gradient-to-r from-acc/30 to-amber/30 relative" />
                <div className="relative -mt-12 text-center">
                  <img
                    src={profile.photo}
                    alt=""
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-[#161616] shadow-md"
                  />
                  <h1 className="text-lg font-bold mt-2">{profile.display_name}</h1>
                  <p className="text-xs text-gray-400">{profile.title} at {profile.company}</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">{profile.location}</p>
                  <p className="text-xs text-gray-300 mt-3 leading-relaxed px-4">{profile.bio}</p>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button
                    onClick={handleDownloadVcard}
                    style={{ backgroundColor: profile.theme_config.primary_color }}
                    className="px-5 py-2 rounded-full text-xs font-bold text-black flex items-center gap-1.5 shadow-lg cursor-pointer font-mono"
                  >
                    [VCF] Save Contact
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer font-mono text-xs"
                  >
                    [Q]
                  </button>
                </div>

                {/* Links */}
                <div className="mt-6 space-y-2">
                  {profile.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs transition-colors"
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="text-gray-400 font-mono text-[11px]">[-&gt;]</span>
                    </a>
                  ))}
                </div>

                {/* Lead Submission Form */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <span className="text-xs font-semibold text-gray-300 block mb-2 font-mono">
                    Exchange Contact / Send Lead
                  </span>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                      const company = (form.elements.namedItem("company") as HTMLInputElement).value;
                      if (name && email) {
                        dispatch({
                          type: "SUBMIT_LEAD",
                          lead: {
                            name,
                            email,
                            company: company || "Direct Visitor",
                            phone: "+1 (555) 000-0000",
                            source: "contact_form",
                            location: "Online Web Form",
                          },
                        });
                        form.reset();
                      }
                    }}
                    className="space-y-2"
                  >
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      name="company"
                      type="text"
                      placeholder="Your Company (Optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: profile.theme_config.primary_color }}
                      className="w-full py-2 rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                    >
                      Send Contact to Mehboob
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. NETWORKING HALL VIEW (ONE TAP ENGINE) */}
          {activeTab === "networking" && (
            <motion.div
              key="networking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-t1">2D Conference Networking Hall</h3>
                  <p className="text-xs text-t3">Tap attendees to exchange NFC digital cards and trigger real-time telemetry.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-acc bg-acc/10 px-2.5 py-1 rounded border border-acc/30 font-bold">
                    Tapped: {attendees.filter((a) => a.has_tapped).length} / {attendees.length} Attendees
                  </span>
                </div>
              </div>

              {/* 2D Attendee Grid Canvas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {attendees.map((attendee) => {
                  const isTapped = !!attendee.has_tapped;
                  return (
                    <div
                      key={attendee.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        isTapped
                          ? "bg-surface/30 border-acc/30 opacity-70"
                          : "bg-surface border-border hover:border-acc/60 hover:shadow-lg"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          style={{ backgroundColor: `${attendee.avatar_color}20`, color: attendee.avatar_color }}
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-border font-mono"
                        >
                          {attendee.avatar_initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-t1 truncate">{attendee.name}</h4>
                          <p className="text-[11px] text-t2 truncate">{attendee.role}</p>
                          <p className="text-[10px] text-t3 truncate">{attendee.company}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-t3 mt-3 leading-relaxed line-clamp-2">
                        {attendee.bio}
                      </p>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-t3">
                          {attendee.location}
                        </span>
                        <button
                          onClick={() => dispatch({ type: "TAP_ATTENDEE", attendee })}
                          disabled={isTapped}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all font-mono",
                            isTapped
                              ? "bg-acc/10 text-acc border border-acc/20 cursor-default"
                              : "bg-acc text-code-bg hover:bg-acc/90 shadow-sm cursor-pointer"
                          )}
                        >
                          {isTapped ? "[OK] Tapped" : "[+] Tap NFC"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 5. ANALYTICS & LEADS INBOX VIEW */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-t1">Live Analytics &amp; Captured Leads Inbox</h3>
                  <p className="text-xs text-t3">Real-time sync of all taps and form captures performed in the sandbox.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber bg-amber/10 px-2.5 py-1 rounded border border-amber/30 font-bold">
                    Total Leads: {leads.length}
                  </span>
                </div>
              </div>

              {/* Pure Responsive SVG Area Chart */}
              <div className="bg-surface/50 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-t3 uppercase">7-Day Daily Interaction Breakdown</span>
                  <div className="flex items-center gap-4 text-[10.5px] font-mono">
                    <span className="flex items-center gap-1.5 text-acc">
                      <span className="w-2.5 h-2.5 rounded bg-acc" /> NFC Taps
                    </span>
                    <span className="flex items-center gap-1.5 text-amber">
                      <span className="w-2.5 h-0.5 border-t border-dashed border-amber" /> Views
                    </span>
                  </div>
                </div>

                {/* SVG Chart Rendering */}
                <div className="w-full h-52 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="taplyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5CC9A0" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#5CC9A0" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="160" x2="700" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                    {/* Area fill for taps */}
                    <path
                      d={`M 0,${200 - (timeSeries[0].taps / 350) * 180} ` +
                        timeSeries.map((d, idx) => `L ${(idx / (timeSeries.length - 1)) * 700},${200 - (d.taps / 350) * 180}`).join(" ") +
                        ` L 700,200 L 0,200 Z`
                      }
                      fill="url(#taplyGrad)"
                    />

                    {/* Stroke line for taps */}
                    <path
                      d={`M 0,${200 - (timeSeries[0].taps / 350) * 180} ` +
                        timeSeries.map((d, idx) => `L ${(idx / (timeSeries.length - 1)) * 700},${200 - (d.taps / 350) * 180}`).join(" ")
                      }
                      fill="none"
                      stroke="#5CC9A0"
                      strokeWidth="2.5"
                    />

                    {/* Dashed line for views */}
                    <path
                      d={`M 0,${200 - (timeSeries[0].views / 350) * 180} ` +
                        timeSeries.map((d, idx) => `L ${(idx / (timeSeries.length - 1)) * 700},${200 - (d.views / 350) * 180}`).join(" ")
                      }
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Points on taps */}
                    {timeSeries.map((d, idx) => {
                      const cx = (idx / (timeSeries.length - 1)) * 700;
                      const cy = 200 - (d.taps / 350) * 180;
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#121C13"
                          stroke="#5CC9A0"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* X-Axis dates */}
                <div className="flex justify-between text-[10px] font-mono text-t3 mt-2">
                  {timeSeries.map((d, idx) => (
                    <span key={idx}>{d.date.slice(5)}</span>
                  ))}
                </div>
              </div>

              {/* Leads Inbox Table */}
              <div className="bg-surface/50 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-t1 uppercase font-bold">
                    Captured Leads &amp; CRM Dispatch Stream
                  </span>
                  <span className="text-xs text-t3 font-mono">HubSpot Auto-Sync: 200 OK</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border text-t3">
                        <th className="pb-2">Lead Name</th>
                        <th className="pb-2">Company</th>
                        <th className="pb-2">Channel</th>
                        <th className="pb-2">Location</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-t2">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-code-bg/40">
                          <td className="py-2.5 font-bold text-t1">{lead.name}</td>
                          <td className="py-2.5">{lead.company}</td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-code-bg border border-border text-[10px] text-acc">
                              {lead.source}
                            </span>
                          </td>
                          <td className="py-2.5 text-t3">{lead.location}</td>
                          <td className="py-2.5 text-acc font-semibold">[SYNCED]</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border p-6 rounded-2xl max-w-xs w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-t1">Scan to Connect</h3>
              <p className="text-xs text-t2">{profile.display_name}: Taply NFC</p>
              
              {/* Pure SVG QR Placeholder */}
              <div className="p-4 bg-white rounded-xl inline-block shadow-inner">
                <svg width="140" height="140" viewBox="0 0 140 140" className="text-black fill-current">
                  {/* Outer Frame */}
                  <rect x="10" y="10" width="40" height="40" rx="4" fill="black" />
                  <rect x="18" y="18" width="24" height="24" rx="2" fill="white" />
                  <rect x="24" y="24" width="12" height="12" fill="black" />

                  <rect x="90" y="10" width="40" height="40" rx="4" fill="black" />
                  <rect x="98" y="18" width="24" height="24" rx="2" fill="white" />
                  <rect x="104" y="24" width="12" height="12" fill="black" />

                  <rect x="10" y="90" width="40" height="40" rx="4" fill="black" />
                  <rect x="18" y="98" width="24" height="24" rx="2" fill="white" />
                  <rect x="24" y="104" width="12" height="12" fill="black" />

                  {/* Pattern grid */}
                  <rect x="60" y="15" width="8" height="8" fill="black" />
                  <rect x="75" y="25" width="8" height="8" fill="black" />
                  <rect x="60" y="45" width="8" height="8" fill="black" />
                  <rect x="75" y="60" width="8" height="8" fill="black" />
                  <rect x="20" y="65" width="8" height="8" fill="black" />
                  <rect x="40" y="75" width="8" height="8" fill="black" />
                  <rect x="60" y="85" width="8" height="8" fill="black" />
                  <rect x="90" y="65" width="8" height="8" fill="black" />
                  <rect x="115" y="75" width="8" height="8" fill="black" />
                  <rect x="75" y="110" width="8" height="8" fill="black" />
                  <rect x="105" y="105" width="8" height="8" fill="black" />
                  <rect x="95" y="120" width="8" height="8" fill="black" />
                  <rect x="120" y="120" width="8" height="8" fill="black" />
                </svg>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="w-full py-1.5 rounded-lg bg-code-bg border border-border text-xs text-t2 hover:text-t1 font-mono cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
