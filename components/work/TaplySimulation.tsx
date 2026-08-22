"use client";

/**
 * components/work/TaplySimulation.tsx
 *
 * Master interactive product sandbox for Taply on /work/taply.
 * Implements a unified state-managed simulation featuring:
 *
 *   1. Authenticated Dashboard with real-time stats and interactive telemetry jump
 *   2. Real-Time Profile Customizer with 4 distinct layout variants (classic, hero, compact, banner)
 *   3. Conference Networking Hall with 8 interactive attendees for simulated NFC taps
 *   4. Real-Time Analytics & Leads Inbox with pure responsive SVG Area Chart and CRM sync stream
 *   5. Simulated Public Profile Viewport with 4 live layout variants, vCard download, and real scannable QR
 *
 * Tab Sequence:
 *   Dashboard [PORTAL] -> Profile Customizer [BUILDER] -> NFC Networking Hall [ONE TAP]
 *   -> Analytics & Leads [TELEMETRY] -> Public Profile Link [VIEWPORT]
 *
 * Strictly free of unicode emojis and em dashes across all UI and data layers.
 */

import React, { useState, useReducer, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { generateQrMatrix } from "@/lib/qr-generator";

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

export type SandboxTab = "dashboard" | "customizer" | "networking" | "analytics" | "public_link";

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
  | { type: "UPDATE_LINK"; id: number; patch: Partial<ProfileLink> }
  | { type: "DELETE_LINK"; id: number }
  | { type: "RESET_LINKS" }
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
    case "UPDATE_LINK":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: false,
          links: state.profile.links.map((l) =>
            l.id === action.id ? { ...l, ...action.patch } : l
          ),
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
    case "RESET_LINKS":
      return {
        ...state,
        profile: {
          ...state.profile,
          is_published: false,
          links: INITIAL_TAPLY_PROFILE.links,
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
   Real Scannable QR Code SVG Renderer
   ───────────────────────────────────────────────────────────────────────────── */
function ScannableQrSvg({ url, size = 140 }: { url: string; size?: number }) {
  const matrix = React.useMemo(() => {
    try {
      return generateQrMatrix(url);
    } catch {
      return generateQrMatrix("https://gettaply.me/p/mehboob");
    }
  }, [url]);

  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white rounded-lg p-1.5 shadow-md">
      {matrix.map((row, r) =>
        row.map((isDark, c) =>
          isDark ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Live Layout Variant Profile Renderer (Used in both Mini-Viewport & Public View)
   ───────────────────────────────────────────────────────────────────────────── */
function DynamicProfileCard({
  profile,
  onDownloadVcard,
  onOpenQr,
  isMini = false,
}: {
  profile: TaplyProfileState;
  onDownloadVcard: () => void;
  onOpenQr: () => void;
  isMini?: boolean;
}) {
  const variant = profile.theme_config.variant || "classic";
  const primaryColor = profile.theme_config.primary_color || "#5CC9A0";

  // 1. CLASSIC VARIANT (Centered avatar with halo, pill button, clean vertical list)
  if (variant === "classic") {
    return (
      <div className={cn("bg-[#141414] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative", isMini ? "p-4" : "p-6")}>
        <div className={cn("bg-gradient-to-r from-acc/30 to-amber/30 relative", isMini ? "h-16 -mx-4 -mt-4 mb-3" : "h-28 -mx-6 -mt-6 mb-4")} />
        <div className="relative text-center -mt-10 sm:-mt-12">
          <div className={cn("rounded-full mx-auto overflow-hidden border-4 border-[#141414] shadow-lg relative bg-surface", isMini ? "w-14 h-14" : "w-20 h-20")}>
            <Image unoptimized src={profile.photo} alt={profile.display_name} width={isMini ? 56 : 80} height={isMini ? 56 : 80} className="w-full h-full object-cover" />
          </div>
          <h2 className={cn("font-bold text-white mt-2 truncate", isMini ? "text-sm" : "text-lg")}>{profile.display_name}</h2>
          <p className={cn("text-gray-400 truncate", isMini ? "text-[11px]" : "text-xs")}>{profile.title} at {profile.company}</p>
          <p className={cn("text-gray-500 font-mono mt-0.5", isMini ? "text-[9.5px]" : "text-[11px]")}>{profile.location}</p>
          {!isMini && <p className="text-xs text-gray-300 mt-3 leading-relaxed px-4">{profile.bio}</p>}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={onDownloadVcard}
            style={{ backgroundColor: primaryColor }}
            className={cn("rounded-full font-bold text-black flex items-center justify-center gap-1.5 shadow-lg cursor-pointer font-mono", isMini ? "w-full py-1.5 text-[11px]" : "px-6 py-2 text-xs")}
          >
            [VCF] Save Contact
          </button>
          {!isMini && (
            <button onClick={onOpenQr} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer font-mono text-xs hover:bg-white/20">
              [Q]
            </button>
          )}
        </div>

        <div className={cn("space-y-1.5", isMini ? "mt-3" : "mt-6 space-y-2")}>
          {profile.links.slice(0, isMini ? 3 : profile.links.length).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={cn("flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-mono", isMini ? "p-2 text-[10.5px]" : "p-3 text-xs")}
            >
              <span className="font-medium text-gray-200 truncate">{link.label}</span>
              <span className="text-gray-400 shrink-0 ml-2">[-&gt;]</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // 2. HERO VARIANT (High impact large avatar, dark card, skills badges, 2-column link grid)
  if (variant === "hero") {
    return (
      <div className={cn("bg-[#0f1712] text-white border border-[#2B4A3A]/80 rounded-2xl overflow-hidden shadow-2xl relative", isMini ? "p-4" : "p-6")}>
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl overflow-hidden border-2 relative shrink-0 bg-surface", isMini ? "w-12 h-12" : "w-16 h-16")} style={{ borderColor: primaryColor }}>
            <Image unoptimized src={profile.photo} alt={profile.display_name} width={isMini ? 48 : 64} height={isMini ? 48 : 64} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn("font-bold text-white truncate", isMini ? "text-xs" : "text-base")}>{profile.display_name}</h2>
            <p className={cn("text-gray-400 truncate", isMini ? "text-[10px]" : "text-xs")}>{profile.title}</p>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-gray-400 font-mono flex items-center justify-between border-y border-white/10 py-1.5">
          <span>{profile.company}</span>
          <span className="text-gray-500">{profile.location}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {profile.skills.slice(0, isMini ? 3 : 5).map((skill, idx) => (
            <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={onDownloadVcard}
            style={{ backgroundColor: primaryColor }}
            className={cn("w-full rounded-lg font-bold text-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer font-mono", isMini ? "py-1.5 text-[11px]" : "py-2 text-xs")}
          >
            [VCF] Connect Instantly
          </button>
        </div>

        <div className={cn("grid gap-1.5", isMini ? "mt-3 grid-cols-1" : "mt-5 grid-cols-1 sm:grid-cols-2 gap-2")}>
          {profile.links.slice(0, isMini ? 3 : profile.links.length).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={cn("p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10.5px] font-mono flex items-center justify-between transition-colors", isMini ? "text-[10px]" : "text-xs")}
            >
              <span className="truncate text-gray-200">{link.label}</span>
              <span className="text-gray-400 ml-1">[-&gt;]</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // 3. COMPACT VARIANT (Horizontal executive badge format, left-aligned avatar, condensed buttons)
  if (variant === "compact") {
    return (
      <div className={cn("bg-[#121C13] text-white border border-[#2B4A3A] rounded-2xl overflow-hidden shadow-2xl relative", isMini ? "p-3.5" : "p-5")}>
        <div className="flex items-center gap-3">
          <div className={cn("rounded-full overflow-hidden border border-white/20 relative shrink-0 bg-surface", isMini ? "w-11 h-11" : "w-14 h-14")}>
            <Image unoptimized src={profile.photo} alt={profile.display_name} width={isMini ? 44 : 56} height={isMini ? 44 : 56} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn("font-bold text-white truncate", isMini ? "text-xs" : "text-sm")}>{profile.display_name}</h2>
            <p className={cn("text-gray-400 truncate", isMini ? "text-[10px]" : "text-[11px]")}>{profile.title}</p>
            <p className={cn("text-gray-500 font-mono truncate", isMini ? "text-[9px]" : "text-[10px]")}>{profile.company} · {profile.location}</p>
          </div>
          <button onClick={onOpenQr} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white font-mono text-[10px] shrink-0 cursor-pointer">
            [QR]
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={onDownloadVcard}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-1.5 rounded-md font-bold text-black text-[11px] font-mono cursor-pointer shadow-sm"
          >
            Save Card (.vcf)
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {profile.links.slice(0, isMini ? 3 : profile.links.length).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-1.5 px-2 rounded bg-white/5 hover:bg-white/10 text-[10.5px] font-mono text-gray-300 transition-colors"
            >
              <span className="truncate">{link.label}</span>
              <span className="text-gray-500 text-[9.5px]">[-&gt;]</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // 4. BANNER VARIANT (Full-bleed cover image with overlapping avatar & glassmorphism cards)
  return (
    <div className={cn("bg-[#111111] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative", isMini ? "p-4" : "p-6")}>
      <div className={cn("relative -mx-4 -mt-4 mb-3 overflow-hidden", isMini ? "h-20" : "h-32 -mx-6 -mt-6 mb-4")}>
        <Image unoptimized src={profile.cover_image} alt="" fill className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className={cn("rounded-full overflow-hidden border-2 border-white relative shadow-xl bg-surface", isMini ? "w-10 h-10" : "w-14 h-14")}>
            <Image unoptimized src={profile.photo} alt={profile.display_name} width={isMini ? 40 : 56} height={isMini ? 40 : 56} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <h2 className={cn("font-bold text-white truncate", isMini ? "text-sm" : "text-base")}>{profile.display_name}</h2>
        <p className={cn("text-gray-400 truncate", isMini ? "text-[10.5px]" : "text-xs")}>{profile.title} at {profile.company}</p>
        <p className={cn("text-gray-500 font-mono mt-0.5", isMini ? "text-[9.5px]" : "text-[11px]")}>{profile.location}</p>
      </div>

      <div className="mt-3">
        <button
          onClick={onDownloadVcard}
          style={{ backgroundColor: primaryColor }}
          className="w-full py-1.5 rounded-lg font-bold text-black text-xs font-mono cursor-pointer shadow-lg"
        >
          [VCF] Add to Contacts
        </button>
      </div>

      <div className={cn("space-y-1.5", isMini ? "mt-3" : "mt-4 space-y-2")}>
        {profile.links.slice(0, isMini ? 3 : profile.links.length).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono transition-colors"
          >
            <span className="truncate text-gray-200">{link.label}</span>
            <span className="text-gray-400">[-&gt;]</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Master Taply Simulation Component
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
    const targetUrl = `https://gettaply.me/p/${profile.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadVcard = () => {
    const vcardContent = `BEGIN:VCARD\nVERSION:4.0\nN:Alam;Mahboob;;;\nFN:${profile.display_name}\nORG:${profile.company}\nTITLE:${profile.title}\nTEL;TYPE=CELL,VOICE:${profile.phone[0] || "+917908184346"}\nEMAIL;TYPE=WORK,INTERNET:${profile.email_addresses[0] || "connect.mahboobalam@gmail.com"}\nURL;TYPE=WORK:https://gettaply.me/p/${profile.username}\nADR;TYPE=WORK:;;Koramangala;Bengaluru;560095;India\nNOTE:${profile.bio}\nEND:VCARD`;
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
      <div className="text-center mb-8 pt-6 border-t border-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-acc/10 text-acc border border-acc/30 mb-3">
          Taply Sandbox Engine
        </div>
        <h3 className="text-2xl md:text-4xl font-display font-bold text-t1 tracking-tight m-0">
          Experience the NFC Networking &amp; Profile Ecosystem
        </h3>
        <p className="text-sm text-t2 mt-2 max-w-xl mx-auto font-sans leading-relaxed">
          Explore Taply&apos;s complete multi-tenant product engine: customize profile layouts with real-time syncing, enter the Conference Hall to tap 8 attendees, inspect atomic Redis telemetry, and copy the live vCard profile.
        </p>
      </div>

      {/* 5-Tab Master Sandbox Navigation (Reordered) */}
      <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
        {[
          { id: "dashboard", label: "Dashboard", badge: "PORTAL" },
          { id: "customizer", label: "Profile Customizer", badge: "BUILDER" },
          { id: "networking", label: "NFC Networking Hall", badge: "ONE TAP" },
          { id: "analytics", label: "Analytics & Leads", badge: "TELEMETRY" },
          { id: "public_link", label: "Public Profile Link", badge: "VIEWPORT" },
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
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-t1 hover:bg-surface/80 flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
                  >
                    View Public Profile <span className="text-acc">[-&gt;]</span>
                  </button>
                </div>
              </div>

              {/* 4 Interactive Stat Cards (Clicking jumps to Analytics) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Profile Views", value: analytics.lifetime.views, sub: "+12% 30d", tag: "[+12%]", color: "text-acc" },
                  { label: "Contact Saves", value: analytics.lifetime.saves, sub: "+8% 30d", tag: "[+8%]", color: "text-amber" },
                  { label: "NFC Taps", value: analytics.lifetime.taps, sub: "High Activity", tag: "[HOT]", color: "text-[#60A5FA]" },
                  { label: "QR Scans", value: analytics.lifetime.qr_scans, sub: "Direct Scans", tag: "[DIRECT]", color: "text-[#2DD4BF]" },
                ].map((stat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab("analytics")}
                    className="bg-surface/60 hover:bg-surface/90 border border-border hover:border-acc/40 rounded-xl p-4 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-t3 font-medium group-hover:text-t2">{stat.label}</span>
                      <span className={cn("font-mono text-[10.5px] font-bold", stat.color)}>{stat.tag}</span>
                    </div>
                    <div className="text-2xl font-bold text-t1 mt-2 font-mono group-hover:text-acc transition-colors">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10.5px] text-t3 font-mono block">{stat.sub}</span>
                      <span className="text-[10px] font-mono text-t3 opacity-0 group-hover:opacity-100 transition-opacity text-acc">view telemetry &gt;</span>
                    </div>
                  </button>
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
                      <span className="text-acc font-mono">[OK]</span> 5 Active Social &amp; Booking Endpoints attached
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
                        <p className="text-xs font-medium text-t1">Customize Card &amp; 4 Themes</p>
                        <p className="text-[10.5px] text-t3">Switch between Classic, Hero, Compact, and Banner</p>
                      </div>
                      <span className="text-t3 font-mono text-xs">[-&gt;]</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("networking")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-code-bg hover:bg-code-bg/80 border border-border/60 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-medium text-t1">Enter Networking Hall</p>
                        <p className="text-[10.5px] text-t3">Simulate NFC taps with 8 global attendees</p>
                      </div>
                      <span className="text-amber font-mono text-xs">[-&gt;]</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. PROFILE CUSTOMIZER VIEW (4 Distinct Live Layout Variants) */}
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
                  <p className="text-xs text-t3">All edits update the live viewport instantly across 4 layout templates.</p>
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

              {/* Controls (Left) vs Mini Viewport (Right) */}
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

                  {/* 4 Layout Variant Templates */}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                    <span className="text-xs font-mono text-amber uppercase font-bold">2. Layout Variant &amp; Theme</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["classic", "hero", "compact", "banner"] as LayoutVariant[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => dispatch({ type: "UPDATE_THEME", patch: { variant: v } })}
                          className={cn(
                            "p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer font-mono",
                            profile.theme_config.variant === v
                              ? "border-acc bg-acc/15 text-acc font-bold shadow-sm"
                              : "border-border text-t3 hover:text-t1 hover:bg-code-bg/60"
                          )}
                        >
                          <span className="block font-bold uppercase text-[11px]">{v}</span>
                          <span className="text-[9.5px] text-t3 opacity-80 mt-0.5 block">
                            {v === "classic" && "Centered avatar"}
                            {v === "hero" && "High impact card"}
                            {v === "compact" && "Executive badge"}
                            {v === "banner" && "Full cover image"}
                          </span>
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
                              profile.theme_config.primary_color === hex ? "border-white scale-110 shadow-md" : "border-transparent"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Social Links */}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-t1 uppercase font-bold">3. Active Links</span>
                        <span className="text-[10px] text-t3 font-mono">({profile.links.length} attached)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newId = Date.now();
                            dispatch({
                              type: "ADD_LINK",
                              link: {
                                id: newId,
                                label: "New Link",
                                url: "https://",
                                link_type: "custom",
                              },
                            });
                          }}
                          className="px-2 py-1 bg-acc/10 text-acc hover:bg-acc/20 border border-acc/30 rounded text-[10.5px] font-mono font-semibold transition-colors cursor-pointer"
                        >
                          [+ Add Link]
                        </button>
                        <button
                          onClick={() => dispatch({ type: "RESET_LINKS" })}
                          className="px-2 py-1 text-t3 hover:text-t2 border border-border/50 rounded text-[10.5px] font-mono transition-colors cursor-pointer"
                          title="Reset to default links"
                        >
                          [reset]
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {profile.links.map((link) => (
                        <div
                          key={link.id}
                          className="p-2 rounded-lg bg-code-bg border border-border/60 text-xs space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link.label}
                              placeholder="Title"
                              onChange={(e) =>
                                dispatch({
                                  type: "UPDATE_LINK",
                                  id: link.id,
                                  patch: { label: e.target.value },
                                })
                              }
                              className="w-1/3 min-w-[90px] bg-surface/70 border border-border/60 rounded px-2 py-1 text-xs text-t1 font-medium focus:border-acc outline-none placeholder:text-t3/50"
                            />
                            <input
                              type="text"
                              value={link.url}
                              placeholder="https://..."
                              onChange={(e) =>
                                dispatch({
                                  type: "UPDATE_LINK",
                                  id: link.id,
                                  patch: { url: e.target.value },
                                })
                              }
                              className="flex-1 min-w-0 bg-surface/70 border border-border/60 rounded px-2 py-1 text-[11px] text-t2 font-mono focus:border-acc outline-none placeholder:text-t3/50"
                            />
                            <button
                              onClick={() => dispatch({ type: "DELETE_LINK", id: link.id })}
                              className="text-t3 hover:text-red-400 px-1.5 py-1 rounded bg-surface/40 hover:bg-red-500/10 border border-border/40 hover:border-red-400/40 cursor-pointer font-mono text-[10.5px] transition-colors shrink-0"
                              title="Delete link"
                            >
                              [del]
                            </button>
                          </div>
                        </div>
                      ))}

                      {profile.links.length === 0 && (
                        <div className="p-4 text-center border border-dashed border-border/60 rounded-lg text-t3 text-xs font-mono">
                          No active links. Click [+ Add Link] or [reset] to restore defaults.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Mini Viewport (Displays active variant) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-surface/30 border border-border rounded-xl">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-mono text-t3 uppercase tracking-wider">Live Viewport Preview</span>
                    <span className="text-[10px] font-mono text-acc uppercase bg-acc/10 px-2 py-0.5 rounded border border-acc/20">
                      {profile.theme_config.variant}
                    </span>
                  </div>

                  <div className="w-[290px]">
                    <DynamicProfileCard
                      profile={profile}
                      onDownloadVcard={handleDownloadVcard}
                      onOpenQr={() => setQrModalOpen(true)}
                      isMini={true}
                    />
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

          {/* 3. NETWORKING HALL VIEW (ONE TAP ENGINE) */}
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
                  <h3 className="text-lg font-semibold text-t1">Conference Networking Hall</h3>
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

          {/* 4. ANALYTICS & LEADS INBOX VIEW */}
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

          {/* 5. SIMULATED PUBLIC LINK VIEW (Final Viewport with 4 Layout Variants) */}
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
                  <span className="w-2.5 h-2.5 rounded-full bg-acc shrink-0" />
                  <span className="text-t3 truncate">https://gettaply.me/p/{profile.username}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyPublicLink}
                    className="px-2.5 py-1 rounded bg-code-bg border border-border text-t2 hover:text-t1 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <span className="text-acc">{copiedLink ? "[OK]" : "[CP]"}</span>
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

              {/* Render Selected Dynamic Profile Card */}
              <div className="max-w-md mx-auto">
                <DynamicProfileCard
                  profile={profile}
                  onDownloadVcard={handleDownloadVcard}
                  onOpenQr={() => setQrModalOpen(true)}
                  isMini={false}
                />

                {/* Lead Submission Form */}
                <div className="mt-6 p-5 rounded-2xl bg-[#141414] border border-white/10 text-white">
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
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-acc"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-acc"
                    />
                    <input
                      name="company"
                      type="text"
                      placeholder="Your Company (Optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-acc"
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: profile.theme_config.primary_color }}
                      className="w-full py-2 rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                    >
                      Send Contact to Mahboob
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real Scannable QR Code Modal */}
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
              <h3 className="text-sm font-bold text-t1 font-display">Scan to Connect</h3>
              <p className="text-xs text-t2">{profile.display_name}: Taply NFC</p>
              
              {/* Real Scannable QR Code SVG */}
              <div className="flex justify-center my-2">
                <ScannableQrSvg url={`https://gettaply.me/p/${profile.username}`} size={160} />
              </div>

              <p className="text-[10.5px] font-mono text-acc">
                https://gettaply.me/p/{profile.username}
              </p>

              <div className="flex gap-2 pt-1">
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
