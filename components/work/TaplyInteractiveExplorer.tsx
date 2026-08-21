"use client";

/**
 * components/work/TaplyInteractiveExplorer.tsx
 *
 * Interactive visual exploration component for Taply on /work/taply.
 * Implements a 5-stage architectural pipeline simulator reflecting:
 *
 *   1. NFC Hardware & Dynamic QR Scan Ingestion (Sub-80ms Edge SLA)
 *   2. RFC 6350 vCard Normalization & Payload Optimization (1.4 KB vs 48.6 KB)
 *   3. Multi-Tenant Enterprise Hierarchy & RBAC Matrix
 *   4. High-Performance Redis Analytics Buffer (Atomic HINCRBY & Celery Batching)
 *   5. Real-Time Webhook Pipeline & AES-256 Production Security Invariants
 *
 * Strictly free of unicode emojis and em dashes across all UI and data layers.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export type TaplyTabKey = "scan" | "vcard" | "rbac" | "cache" | "webhooks";

export interface TaplyTabMeta {
  id: TaplyTabKey;
  step: string;
  label: string;
  badge: string;
  tag: string;
}

export const TAPLY_TABS: TaplyTabMeta[] = [
  {
    id: "scan",
    step: "01",
    label: "NFC / QR Ingestion",
    badge: "SCAN",
    tag: "Sub-80ms Edge SLA",
  },
  {
    id: "vcard",
    step: "02",
    label: "vCard Compression",
    badge: "PAYLOAD",
    tag: "97% Reduction",
  },
  {
    id: "rbac",
    step: "03",
    label: "Multi-Tenant RBAC",
    badge: "ENTERPRISE",
    tag: "Hierarchical Teams",
  },
  {
    id: "cache",
    step: "04",
    label: "Analytics Buffer",
    badge: "ATOMIC",
    tag: "Zero DB Stampede",
  },
  {
    id: "webhooks",
    step: "05",
    label: "CRM Webhook Stream",
    badge: "PIPELINE",
    tag: "AES-256 Hardened",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Main Taply Interactive Explorer Container
   ───────────────────────────────────────────────────────────────────────────── */
export function TaplyInteractiveExplorer() {
  const [activeTab, setActiveTab] = useState<TaplyTabKey>("scan");

  return (
    <div className="w-full space-y-6">
      {/* 5-Tab Navigation Bar */}
      <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
        {TAPLY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-1 min-w-[155px] items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-code-bg border-amber/50 text-t1 shadow-sm border"
                  : "hover:bg-bg/40 text-t3 hover:text-t2 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-1.5 py-0.5 rounded shrink-0">
                  {tab.badge}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber font-mono text-[10px] font-bold tracking-wider uppercase">
                      {tab.step}
                    </span>
                    <span className="font-display text-[13px] font-semibold truncate">
                      {tab.label}
                    </span>
                  </div>
                  <span className="text-t3 font-mono text-[10.5px] block truncate">
                    {tab.tag}
                  </span>
                </div>
              </div>
              {isActive ? (
                <span className="bg-amber h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--amber)] shrink-0 ml-2" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Container */}
      <div className="border-border bg-code-bg relative min-h-[460px] overflow-hidden rounded-2xl border p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === "scan" && <ScanSimulator key="scan" />}
          {activeTab === "vcard" && <VcardCompressorViewer key="vcard" />}
          {activeTab === "rbac" && <MultiTenantRbacExplorer key="rbac" />}
          {activeTab === "cache" && <AnalyticsBufferSimulator key="cache" />}
          {activeTab === "webhooks" && <WebhookSecurityStream key="webhooks" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. Scan Simulator Component (Sub-80ms Edge SLA)
   ───────────────────────────────────────────────────────────────────────────── */
function ScanSimulator() {
  const [scanType, setScanType] = useState<"nfc" | "qr">("nfc");
  const [isScanning, setIsScanning] = useState(false);
  const [measuredLatency, setMeasuredLatency] = useState(54);
  const [scanCount, setScanCount] = useState(148);

  const triggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    const latency = Math.floor(Math.random() * 24) + 46; // 46ms - 70ms
    setTimeout(() => {
      setMeasuredLatency(latency);
      setScanCount((prev) => prev + 1);
      setIsScanning(false);
    }, 320);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header & Interactive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded">
              MODULE 01
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-t1">
              Client Trigger & Sub-80ms Edge SLA
            </h3>
          </div>
          <p className="text-xs text-t3 mt-1">
            Simulate physical NFC tap or dynamic QR shortlink resolution via Cloudflare Edge Workers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-surface rounded-lg p-1 border border-border flex gap-1">
            <button
              onClick={() => setScanType("nfc")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
                scanType === "nfc"
                  ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                  : "text-t3 hover:text-t2"
              )}
            >
              [NFC 13.56MHz]
            </button>
            <button
              onClick={() => setScanType("qr")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
                scanType === "qr"
                  ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                  : "text-t3 hover:text-t2"
              )}
            >
              [Dynamic QR]
            </button>
          </div>

          <button
            onClick={triggerScan}
            disabled={isScanning}
            className="bg-acc text-code-bg hover:bg-acc/90 font-mono font-bold px-4 py-1.5 text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-code-bg border-t-transparent rounded-full" />
            ) : (
              <span>[!]</span>
            )}
            {isScanning ? "Resolving..." : "Trigger Scan"}
          </button>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Edge Latency</span>
          <div className="text-2xl font-bold text-acc mt-1 font-mono">{measuredLatency}ms</div>
          <span className="text-[10.5px] text-acc font-mono mt-1 flex items-center gap-1">
            <span>[OK]</span> Sub-80ms SLA Met
          </span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Routing Layer</span>
          <div className="text-sm font-semibold text-t1 mt-1">Cloudflare Edge</div>
          <span className="text-[10px] text-t3 font-mono mt-1 block">V8 Isolate Workers</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Protocol Standard</span>
          <div className="text-sm font-semibold text-t1 mt-1">
            {scanType === "nfc" ? "NDEF URI Record" : "SVG Vector Stream"}
          </div>
          <span className="text-[10px] text-t3 font-mono mt-1 block">ISO/IEC 14443-A</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Simulated Taps</span>
          <div className="text-2xl font-bold text-amber mt-1 font-mono">{scanCount}</div>
          <span className="text-[10px] text-amber font-mono mt-1 block">Buffer Queue Active</span>
        </div>
      </div>

      {/* 3-Box Sequential Pipeline Breakdown */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono text-t3 uppercase tracking-wider block">
          Sequential Ingestion Architecture
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface/50 border border-border rounded-xl p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-amber font-bold mb-1">[STEP 01: CLIENT]</div>
            <div className="font-semibold text-t1 text-sm">Physical Scan Intercept</div>
            <p className="text-xs text-t2 mt-1.5 leading-relaxed">
              Mobile OS intercepts NDEF record on 13.56 MHz frequency or QR scan, opening shortlink <code className="text-acc font-mono">gettaply.me/c/NFC_88A</code>.
            </p>
            <div className="mt-3 text-[10px] font-mono text-t3 bg-code-bg/80 p-2 rounded border border-border/40">
              Duration: ~8ms (Mobile OS Local)
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-amber font-bold mb-1">[STEP 02: EDGE ISOLATE]</div>
            <div className="font-semibold text-t1 text-sm">GeoIP & Privacy Fingerprint</div>
            <p className="text-xs text-t2 mt-1.5 leading-relaxed">
              Edge Worker validates shortlink UID status, hashes visitor IP via SHA-256 with daily salts, and extracts ISO country code.
            </p>
            <div className="mt-3 text-[10px] font-mono text-t3 bg-code-bg/80 p-2 rounded border border-border/40">
              Duration: ~22ms (Cloudflare Edge)
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono text-amber font-bold mb-1">[STEP 03: CACHE & QUEUE]</div>
            <div className="font-semibold text-t1 text-sm">Profile Cache Hit & Async Buffer</div>
            <p className="text-xs text-t2 mt-1.5 leading-relaxed">
              Returns pre-rendered profile payload or vCard stream while dispatching an asynchronous TapEvent to Redis atomic buffer.
            </p>
            <div className="mt-3 text-[10px] font-mono text-t3 bg-code-bg/80 p-2 rounded border border-border/40">
              Duration: ~24ms (Redis L1 Cache Hit)
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. vCard Compressor & Normalizer Viewer (1.4 KB vs 48.6 KB)
   ───────────────────────────────────────────────────────────────────────────── */
function VcardCompressorViewer() {
  const [vcardMode, setVcardMode] = useState<"vcard" | "raw">("vcard");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded">
              MODULE 02
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-t1">
              Data Transformation & Payload Optimization
            </h3>
          </div>
          <p className="text-xs text-t3 mt-1">
            Quantifying byte-level payload reduction between RFC 6350 vCard 4.0 and bloated multi-link web pages.
          </p>
        </div>

        <div className="bg-surface rounded-lg p-1 border border-border flex gap-1">
          <button
            onClick={() => setVcardMode("vcard")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              vcardMode === "vcard"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Optimized vCard (1.4 KB)]
          </button>
          <button
            onClick={() => setVcardMode("raw")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              vcardMode === "raw"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Raw Multi-Link DOM (48.6 KB)]
          </button>
        </div>
      </div>

      {/* Code Viewer Stage */}
      <div className="bg-surface/80 border border-border rounded-xl p-4 overflow-x-auto font-mono text-xs text-t2 leading-relaxed">
        {vcardMode === "vcard" ? (
          <pre className="text-acc">
{`BEGIN:VCARD
VERSION:4.0
N:Alam;Mahboob;;;
FN:Mahboob Alam
ORG:Nexbell Inc
TITLE:Software and DevOps Engineer
TEL;TYPE=CELL,VOICE:+917908184346
EMAIL;TYPE=WORK,INTERNET:connect.mahboobalam@gmail.com
URL;TYPE=WORK:https://gettaply.me/p/mehboob
ADR;TYPE=WORK:;;Koramangala;Bengaluru;560095;India
NOTE:Building high-throughput physical-to-digital infrastructure.
PHOTO;ENCODING=b;TYPE=JPEG:/9j/4AAQSkZJRgABAQEASABIAAD...
END:VCARD`}
          </pre>
        ) : (
          <pre className="text-t3">
{`<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdn.thirdparty.com/heavy-bundle.js"></script>
  <script src="https://analytics.tracker.io/tag.js?id=UA-994821"></script>
  <link rel="stylesheet" href="/styles/bloated-framework.min.css">
  <meta property="og:image" content="https://assets.gettaply.me/avatars/uncompressed_raw.png">
</head>
<body class="theme-default profile-container-heavy render-blocking">
  <div id="app" class="hydration-boundary">
    <!-- 48.6 KB of nested DOM wrappers, unminified fonts, tracking beacons, and redundant inline SVGs -->
  </div>
</body>
</html>`}
          </pre>
        )}
      </div>

      {/* Metric Chips Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface/60 border border-border rounded-xl p-3">
          <div className="text-[10px] font-mono text-t3 uppercase">Payload Size</div>
          <div className="text-sm font-bold text-acc mt-0.5 font-mono">1.4 KB vs 48.6 KB</div>
          <span className="text-[10px] text-acc font-mono">97.1% reduction</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-3">
          <div className="text-[10px] font-mono text-t3 uppercase">Asset Pipeline</div>
          <div className="text-sm font-bold text-t1 mt-0.5">Sharp + Brotli</div>
          <span className="text-[10px] text-t3 font-mono">Base64 WebP thumbnail</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-3">
          <div className="text-[10px] font-mono text-t3 uppercase">OS Contact Parsing</div>
          <div className="text-sm font-bold text-t1 mt-0.5">iOS & Android Native</div>
          <span className="text-[10px] text-acc font-mono">Zero app install</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-3">
          <div className="text-[10px] font-mono text-t3 uppercase">Standard RFC</div>
          <div className="text-sm font-bold text-amber mt-0.5">RFC 6350 vCard 4.0</div>
          <span className="text-[10px] text-amber font-mono">Strict compliant</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Multi-Tenant Enterprise Hierarchy & RBAC Explorer
   ───────────────────────────────────────────────────────────────────────────── */
function MultiTenantRbacExplorer() {
  const [activePersona, setActivePersona] = useState<"exec" | "sales" | "eng">("exec");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header & Persona Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded">
              MODULE 03
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-t1">
              Multi-Tenant RBAC & Enterprise Hierarchy
            </h3>
          </div>
          <p className="text-xs text-t3 mt-1">
            Demonstrating organizational inheritance, brand-lock policies, and CRM pipelines across enterprise roles.
          </p>
        </div>

        <div className="bg-surface rounded-lg p-1 border border-border flex gap-1">
          <button
            onClick={() => setActivePersona("exec")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              activePersona === "exec"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Executive Founder]
          </button>
          <button
            onClick={() => setActivePersona("sales")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              activePersona === "sales"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Enterprise Sales]
          </button>
          <button
            onClick={() => setActivePersona("eng")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              activePersona === "eng"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Engineering Lead]
          </button>
        </div>
      </div>

      {/* Hierarchy Tree & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tree Representation */}
        <div className="bg-surface/60 border border-border rounded-xl p-5">
          <div className="text-xs font-mono text-amber uppercase mb-3 font-bold">
            [DIR] Multi-Tenant Organization Tree
          </div>
          <div className="font-mono text-xs space-y-2 text-t2">
            <div className="text-t1 font-bold">[ORG] Acme Global Enterprise</div>
            <div className="pl-4 border-l border-border space-y-2">
              <div className="text-t2">[REGION] North America Division</div>
              <div className="pl-4 border-l border-border space-y-1.5">
                <div
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    activePersona === "sales"
                      ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                      : "text-t3"
                  )}
                >
                  ├── [TEAM] Enterprise Sales Team
                  <div className="pl-4 text-[11px] text-t3">└── Sarah Jenkins (Brand Locked)</div>
                </div>
                <div
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    activePersona === "eng"
                      ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                      : "text-t3"
                  )}
                >
                  └── [TEAM] Solutions Architecture
                  <div className="pl-4 text-[11px] text-t3">└── Alex Rivera (Tech Badges)</div>
                </div>
              </div>
              <div
                className={cn(
                  "p-1.5 rounded transition-colors",
                  activePersona === "exec"
                    ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                    : "text-t3"
                )}
              >
                └── [EXEC] Executive Leadership Team
                <div className="pl-4 text-[11px] text-t3">└── Mehboob Alam (Vanity Domain)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Role Permission Matrix */}
        <div className="bg-surface/60 border border-border rounded-xl p-5 space-y-4">
          <div className="text-xs font-mono text-acc uppercase font-bold">
            [MATRIX] Active Role Permissions
          </div>

          {activePersona === "exec" && (
            <div className="space-y-2.5 text-xs text-t2">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Target Vanity URL:</span>
                <span className="font-mono text-acc">gettaply.me/p/mehboob</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Brand Lock Status:</span>
                <span className="font-mono text-amber">Unlocked (Custom Themes)</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">CRM Integration:</span>
                <span className="font-mono text-t1">Salesforce + HubSpot Bi-directional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t3">Data Retention:</span>
                <span className="font-mono text-t1">Unlimited Multi-Year History</span>
              </div>
            </div>
          )}

          {activePersona === "sales" && (
            <div className="space-y-2.5 text-xs text-t2">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Target Vanity URL:</span>
                <span className="font-mono text-acc">gettaply.me/p/sarah-sales</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Brand Lock Status:</span>
                <span className="font-mono text-acc">Enforced by Corporate Policy</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Lead Capture Gate:</span>
                <span className="font-mono text-amber">Mandatory Form Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t3">CRM Webhook:</span>
                <span className="font-mono text-t1">Auto-Push to HubSpot Leads Queue</span>
              </div>
            </div>
          )}

          {activePersona === "eng" && (
            <div className="space-y-2.5 text-xs text-t2">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Target Vanity URL:</span>
                <span className="font-mono text-acc">gettaply.me/p/alex-dev</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">Tech Endpoints:</span>
                <span className="font-mono text-t1">GitHub, GitLab, Cal.com Booking</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-t3">WiFi Sharing:</span>
                <span className="font-mono text-acc">Fernet-Encrypted QR Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t3">Brand Lock Status:</span>
                <span className="font-mono text-t3">Standard Tech Layout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. High-Performance Redis Analytics Buffer & Atomicity Simulator
   ───────────────────────────────────────────────────────────────────────────── */
function AnalyticsBufferSimulator() {
  const [tapCounter, setTapCounter] = useState(8420);
  const [viewCounter, setViewCounter] = useState(24910);
  const [redisLogs, setRedisLogs] = useState<string[]>([
    "[REDIS] HINCRBY analytics:card:104:counters taps 1 -> 8420 (0.18ms)",
    "[CACHE] GET profile:mehboob:v14 -> HIT (TTL: 86400s, 0.22ms)",
    "[WORKER] Celery worker batch-sync: 150 items flushed to PostgreSQL",
  ]);

  const triggerRedisIncr = () => {
    const nextTaps = tapCounter + 1;
    const nextViews = viewCounter + Math.floor(Math.random() * 3) + 1;
    setTapCounter(nextTaps);
    setViewCounter(nextViews);
    const logTime = new Date().toISOString().substring(11, 19);
    const newLogs = [
      `[${logTime}] HINCRBY analytics:card:104:counters taps 1 -> ${nextTaps} (0.14ms)`,
      `[${logTime}] HINCRBY analytics:card:104:counters views 2 -> ${nextViews} (0.16ms)`,
      ...redisLogs.slice(0, 4),
    ];
    setRedisLogs(newLogs);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded">
              MODULE 04
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-t1">
              High-Throughput Analytics Buffer & Atomicity
            </h3>
          </div>
          <p className="text-xs text-t3 mt-1">
            Atomic Redis HINCRBY buffers prevent database write stampedes under high-concurrency conference loads.
          </p>
        </div>

        <button
          onClick={triggerRedisIncr}
          className="bg-acc text-code-bg hover:bg-acc/90 font-mono font-bold px-4 py-1.5 text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <span>[+]</span> Simulate Taps (Trigger HINCRBY)
        </button>
      </div>

      {/* Counters & State Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Buffered Tap Counter</span>
          <div className="text-2xl font-bold text-amber mt-1 font-mono">{tapCounter.toLocaleString()}</div>
          <span className="text-[10px] text-t3 font-mono mt-1 block">Key: analytics:card:104:taps</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">Buffered View Counter</span>
          <div className="text-2xl font-bold text-acc mt-1 font-mono">{viewCounter.toLocaleString()}</div>
          <span className="text-[10px] text-t3 font-mono mt-1 block">Key: analytics:card:104:views</span>
        </div>

        <div className="bg-surface/60 border border-border rounded-xl p-4">
          <span className="text-[10px] font-mono text-t3 uppercase">PostgreSQL DB Load</span>
          <div className="text-2xl font-bold text-t1 mt-1 font-mono">0% Locks</div>
          <span className="text-[10px] text-acc font-mono mt-1 block">Batch syncer runs every 60s</span>
        </div>
      </div>

      {/* Live Redis Terminal Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-t3">
          <span className="flex items-center gap-1.5">[CLI] Live Redis Ingestion Stream</span>
          <span className="text-acc">Latency: &lt;0.25ms</span>
        </div>
        <div className="bg-surface/90 border border-border rounded-xl p-4 font-mono text-xs space-y-1.5 text-t2 overflow-x-auto">
          {redisLogs.map((log, i) => (
            <div key={i} className={i === 0 ? "text-acc font-semibold" : "text-t3"}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. Real-Time Webhook Stream & Security Invariants Sandbox
   ───────────────────────────────────────────────────────────────────────────── */
function WebhookSecurityStream() {
  const [streamFilter, setStreamFilter] = useState<"all" | "lead">("all");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-2 py-0.5 rounded">
              MODULE 05
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-t1">
              Real-Time Webhook Pipeline & Security Invariants
            </h3>
          </div>
          <p className="text-xs text-t3 mt-1">
            Enterprise event dispatch channels hardened with AES-256 field-level encryption and anti-spoofing tokens.
          </p>
        </div>

        <div className="bg-surface rounded-lg p-1 border border-border flex gap-1">
          <button
            onClick={() => setStreamFilter("all")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              streamFilter === "all"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [All Events]
          </button>
          <button
            onClick={() => setStreamFilter("lead")}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors",
              streamFilter === "lead"
                ? "bg-amber/15 text-amber border border-amber/30 font-semibold"
                : "text-t3 hover:text-t2"
            )}
          >
            [Leads Only]
          </button>
        </div>
      </div>

      {/* Security Invariants & Webhook Stream Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Invariants Checklist */}
        <div className="bg-surface/60 border border-border rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-acc uppercase font-bold">
            [SEC] Production Security Invariants
          </div>
          <div className="space-y-2.5 text-xs text-t2">
            <div className="p-3 rounded-lg bg-code-bg/70 border border-border/40">
              <div className="font-semibold text-t1 flex items-center gap-1.5">
                <span className="text-acc font-mono">[1]</span> SHA-256 IP Deduplication
              </div>
              <p className="text-[11px] text-t3 mt-1 leading-relaxed">
                Visitor IP addresses are immediately hashed with daily salted nonces and never stored in plaintext (GDPR & CCPA compliant).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-code-bg/70 border border-border/40">
              <div className="font-semibold text-t1 flex items-center gap-1.5">
                <span className="text-acc font-mono">[2]</span> AES-256 Field Encryption
              </div>
              <p className="text-[11px] text-t3 mt-1 leading-relaxed">
                Lead contact submissions, phone numbers, and WiFi passwords use Fernet/AES-256 database-level field encryption.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-code-bg/70 border border-border/40">
              <div className="font-semibold text-t1 flex items-center gap-1.5">
                <span className="text-acc font-mono">[3]</span> Signed Anti-Cloning Tokens
              </div>
              <p className="text-[11px] text-t3 mt-1 leading-relaxed">
                High-security enterprise cards verify signed timestamped cryptographic nonces to prevent physical card replication.
              </p>
            </div>
          </div>
        </div>

        {/* Live Webhook Feed */}
        <div className="bg-surface/60 border border-border rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-amber uppercase font-bold">
            [FEED] Live Webhook Stream
          </div>
          <div className="font-mono text-[11px] bg-code-bg/90 p-4 rounded-xl border border-border/60 space-y-3 overflow-x-auto">
            {streamFilter === "all" && (
              <div className="text-acc">
                <span className="text-t3">[STREAM]</span> event: card.scanned<br />
                <span className="text-t2">data: &#123;&quot;card_id&quot;: &quot;c_901&quot;, &quot;geo&quot;: &quot;San Francisco, CA&quot;, &quot;device&quot;: &quot;iOS 18&quot;, &quot;latency&quot;: &quot;52ms&quot;&#125;</span>
              </div>
            )}

            <div className="text-amber">
              <span className="text-t3">[STREAM]</span> event: lead.captured<br />
              <span className="text-t2">data: &#123;&quot;lead_id&quot;: &quot;ld_441&quot;, &quot;name&quot;: &quot;Elena Rostova&quot;, &quot;crm_sync&quot;: &quot;hubspot&quot;, &quot;status&quot;: &quot;200_OK&quot;&#125;</span>
            </div>

            {streamFilter === "all" && (
              <div className="text-t3">
                <span className="text-t3">[STREAM]</span> event: directory.sync<br />
                <span className="text-t2">data: &#123;&quot;tenant_id&quot;: &quot;acme_corp&quot;, &quot;active_cards&quot;: 128, &quot;status&quot;: &quot;healthy&quot;&#125;</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
