"use client";

/**
 * components/work/UnthinkInteractiveExplorer.tsx
 *
 * Interactive visual exploration component for UnThink on /work/unthink.
 * Implements an interactive multi-stage pipeline simulator reflecting:
 *
 *   1. 1-Click Browser Capture & Sub-300ms SLA Ingestion
 *   2. Clutter-Free DOM Normalization (Raw HTML vs Clean Markdown toggle)
 *   3. Zero-Decision Dual-Tree AI Taxonomic Routing (Topic vs Source)
 *   4. Deterministic Epoch Cache Invalidation (Atomic Redis INCR versioning)
 *   5. Real-Time SSE Stream & Security Hardening Posture
 *
 * Strictly free of emojis and em dashes across all UI and data layers.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

type TabKey = "capture" | "dom" | "ai" | "cache" | "sse";

interface TabMeta {
  id: TabKey;
  step: string;
  label: string;
  badge: string;
  tag: string;
}

const TABS: TabMeta[] = [
  {
    id: "capture",
    step: "01",
    label: "1-Click Capture",
    badge: "CAPTURE",
    tag: "Sub-300ms SLA",
  },
  {
    id: "dom",
    step: "02",
    label: "DOM Stripper",
    badge: "CLEAN",
    tag: "96% Reduction",
  },
  {
    id: "ai",
    step: "03",
    label: "Dual Taxonomy",
    badge: "ROUTING",
    tag: "Zero-Decision AI",
  },
  {
    id: "cache",
    step: "04",
    label: "Epoch Caching",
    badge: "EPOCH",
    tag: "<1ms Invalidation",
  },
  {
    id: "sse",
    step: "05",
    label: "SSE & Security",
    badge: "SANDBOX",
    tag: "Non-Root EC2",
  },
];

export function UnthinkInteractiveExplorer() {
  const [activeTab, setActiveTab] = useState<TabKey>("capture");

  return (
    <div className="w-full space-y-6">
      {/* Interactive Tabs Header */}
      <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-1 min-w-[140px] items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-code-bg border-amber/50 text-t1 shadow-sm border"
                  : "hover:bg-bg/40 text-t3 hover:text-t2 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-1.5 py-0.5 rounded">
                  {tab.badge}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber font-mono text-[10px] font-bold tracking-wider uppercase">
                      {tab.step}
                    </span>
                    <span className="font-display text-[13px] font-semibold">
                      {tab.label}
                    </span>
                  </div>
                  <span className="text-t3 font-mono text-[10.5px]">
                    {tab.tag}
                  </span>
                </div>
              </div>
              {isActive ? (
                <span className="bg-amber h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--amber)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Container */}
      <div className="border-border bg-code-bg relative min-h-[460px] overflow-hidden rounded-2xl border p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === "capture" && <CaptureSimulator key="capture" />}
          {activeTab === "dom" && <DomStripperViewer key="dom" />}
          {activeTab === "ai" && <AiTaxonomyExplorer key="ai" />}
          {activeTab === "cache" && <EpochCacheSimulator key="cache" />}
          {activeTab === "sse" && <SseSecurityStream key="sse" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. Capture Simulator Component
   ───────────────────────────────────────────────────────────────────────────── */
function CaptureSimulator() {
  const [captured, setCaptured] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState(24);

  const handleCapture = () => {
    if (captured) return;
    const randomLatency = Math.floor(Math.random() * 80) + 210; // 210ms - 290ms
    setLatency(randomLatency);
    setCaptured(true);
    setQuotaRemaining((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setCaptured(false);
    setLatency(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-semibold tracking-wider uppercase">
            Interactive Module 01
          </span>
          <h3 className="font-display text-t1 text-[20px] font-bold">
            1-Click Context Menu and Sub-300ms SLA Ingestion
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="border-border rounded-md border bg-bg/50 px-2.5 py-1 text-t2">
            Quota: <strong className="text-amber">{quotaRemaining}/25</strong> saves today
          </span>
          <span className="border-border rounded-md border bg-bg/50 px-2.5 py-1 text-acc">
            MV3 Token Bridge: 0ms
          </span>
        </div>
      </div>

      <p className="text-t2 text-[14.5px] leading-relaxed">
        Highlight technical text on any webpage to trigger the simulated extension capture.
        UnThink returns an asynchronous optimistic acknowledgment within 300ms, allowing the developer
        to maintain reading focus while background Celery queues normalize and file the fragment.
      </p>

      {/* Simulated Web Page Card */}
      <div className="relative rounded-xl border border-border bg-surface p-5 shadow-inner">
        <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-[11px] text-t3">
              browser://docs.redis.io/commands/incr
            </span>
          </div>
          <span className="font-mono text-[11px] text-acc">Active Selection</span>
        </div>

        <div className="space-y-3 font-mono text-[13px] text-t2">
          <p className="text-t3 text-[12px] italic">{"// Distributed Systems and Cache Notes"}</p>
          <div
            onClick={handleCapture}
            className={cn(
              "cursor-pointer rounded-lg border p-3.5 transition-all duration-200 select-none",
              captured
                ? "border-acc/60 bg-acc/10 text-t1"
                : "border-acc/40 bg-acc/10 hover:border-acc/70 hover:bg-acc/15 text-t1"
            )}
          >
            <p className="font-medium">
              &quot;Atomic INCR on user:&#123;id&#125;:cache_version allows instant logical invalidation of all
              multidimensional query caches without flushing keys or blocking the event loop.&quot;
            </p>
          </div>
        </div>

        {/* Interactive Action Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {!captured ? (
            <button
              onClick={handleCapture}
              className="bg-acc hover:bg-acc/90 font-mono text-[12px] font-semibold text-black flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>[+]</span> Right-Click Send to UnThink
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="border-acc/40 bg-acc/10 font-mono text-[12px] text-acc flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 font-medium">
                <span>[OK]</span> Captured in {latency}ms (SLA &lt;300ms Met)
              </span>
              <button
                onClick={handleReset}
                className="hover:border-border font-mono text-[11.5px] text-t3 hover:text-t1 rounded-lg border border-transparent px-3 py-1.5 transition-colors cursor-pointer"
              >
                Reset Demo
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-[11px] text-t3">
            <span>Storage:</span>
            <span className="text-t2 font-medium">chrome.storage.sync</span>
            <span>·</span>
            <span>Popup Boot:</span>
            <span className="text-acc font-medium">&lt;10ms</span>
          </div>
        </div>
      </div>

      {/* Behind-the-Scenes Architecture Step */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 font-mono text-[12px]">
        <div className="rounded-lg border border-border/80 bg-surface/50 p-3">
          <p className="text-acc font-semibold">1. Context Menu Trigger</p>
          <p className="text-t3 mt-1 text-[11px]">
            MV3 content script captures highlighted DOM, canonical URL, and title in &lt;15ms.
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-surface/50 p-3">
          <p className="text-acc font-semibold">2. Django 5.1 Ingestion</p>
          <p className="text-t3 mt-1 text-[11px]">
            Validates JWT auth, enqueues raw fragment to Redis broker, returns 201 Created.
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-surface/50 p-3">
          <p className="text-t2 font-semibold">3. Celery AI Dispatch</p>
          <p className="text-t3 mt-1 text-[11px]">
            Asynchronous worker initiates zero-shot dual classification and Markdown normalization.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. DOM Stripper (Raw HTML vs Clean Markdown)
   ───────────────────────────────────────────────────────────────────────────── */
function DomStripperViewer() {
  const [viewMode, setViewMode] = useState<"clean" | "raw">("clean");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-semibold tracking-wider uppercase">
            Interactive Module 02
          </span>
          <h3 className="font-display text-t1 text-[20px] font-bold">
            DOM Clutter-Stripper and Trafilatura Normalization
          </h3>
        </div>
        {/* Toggle Switch */}
        <div className="border-border bg-surface flex rounded-lg border p-1 font-mono text-xs">
          <button
            onClick={() => setViewMode("clean")}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer",
              viewMode === "clean"
                ? "bg-acc text-bg shadow-sm"
                : "text-t3 hover:text-t1"
            )}
          >
            Clean Markdown (1.2 KB)
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer",
              viewMode === "raw"
                ? "bg-amber text-bg shadow-sm"
                : "text-t3 hover:text-t1"
            )}
          >
            Raw Web DOM (34.8 KB)
          </button>
        </div>
      </div>

      <p className="text-t2 text-[14.5px] leading-relaxed">
        Web pages contain tracking scripts, ads, cookie popups, and nested divs that pollute search indices.
        UnThink strips all structural clutter in background Celery workers, converting raw DOM snippets into clean,
        pure GitHub-flavored Markdown.
      </p>

      {/* Code Viewer */}
      <div className="border-border bg-surface relative rounded-xl border p-4 font-mono text-[12.5px] leading-relaxed shadow-inner">
        <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2 text-[11px] text-t3">
          <span>{viewMode === "clean" ? "output/fragment.md" : "dom/selection.html"}</span>
          <span className={viewMode === "clean" ? "text-acc font-semibold" : "text-amber font-semibold"}>
            {viewMode === "clean" ? "[OK] 96.5% Payload Reduction" : "[WARN] Contains 14 Scripts & 8 Ads"}
          </span>
        </div>

        <pre className="max-h-[220px] overflow-x-auto overflow-y-auto text-t2">
          {viewMode === "clean" ? (
            <code>{`---
title: "Redis Epoch Cache Invalidation"
source: "https://letsunthink.tech"
author: "Mahboob Alam"
captured_at: "2026-08-21T11:42:00Z"
---

### Deterministic Versioning

Atomic \`INCR\` on \`user:{id}:cache_version\` invalidates all paginated query keys in \`<1ms\`:

\`\`\`python
def invalidate_user_cache(user_id: int):
    redis_client.incr(f"user:{user_id}:cache_version")
\`\`\`
`}</code>
          ) : (
            <code className="text-t3/80">{`<div class="ad-wrapper-top" data-ad-id="74291">
  <iframe src="https://ads.doubleclick.net/ad?slot=banner" width="728" height="90"></iframe>
</div>
<article class="post-content v2-theme font-sans antialiased" data-tracking-session="9x881a">
  <div class="author-bar-sticky cookie-consent-banner">
    <button class="accept-all-btn" onclick="trackUserConsent('allow')">Accept Cookies</button>
  </div>
  <p class="paragraph-1 text-slate-800 leading-7">
    Atomic <span class="highlight-code font-mono">INCR</span> on 
    <span class="var-name">user:{id}:cache_version</span> invalidates all paginated query keys...
  </p>
  <script src="https://analytics.tiktok.com/pixel.js?v=2"></script>
  <script src="https://cdn.segment.com/analytics.js/v1/write_key"></script>
</article>`}</code>
          )}
        </pre>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 font-mono text-[11.5px]">
        <div className="border-border rounded-lg border bg-bg/40 p-2.5">
          <span className="text-t3 block">Payload Size</span>
          <span className="text-t1 font-bold">{viewMode === "clean" ? "1.2 KB" : "34.8 KB"}</span>
        </div>
        <div className="border-border rounded-lg border bg-bg/40 p-2.5">
          <span className="text-t3 block">Tracking Scripts</span>
          <span className="text-acc font-bold">{viewMode === "clean" ? "0 Cleaned" : "14 Active"}</span>
        </div>
        <div className="border-border rounded-lg border bg-bg/40 p-2.5">
          <span className="text-t3 block">Stripping Engine</span>
          <span className="text-t1 font-bold">Trafilatura + LXML</span>
        </div>
        <div className="border-border rounded-lg border bg-bg/40 p-2.5">
          <span className="text-t3 block">Scraping Fallback</span>
          <span className="text-amber font-bold">Firecrawl API</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Zero-Decision Dual-Tree AI Taxonomy Explorer
   ───────────────────────────────────────────────────────────────────────────── */
interface FragmentSample {
  id: string;
  label: string;
  snippet: string;
  topicPath: string[];
  sourcePath: string[];
  tags: string[];
  confidence: string;
  model: string;
}

const SAMPLES: FragmentSample[] = [
  {
    id: "redis",
    label: "Redis Caching",
    snippet: "Atomic INCR on user:{id}:cache_version guarantees O(1) logical invalidation across complex paginated trees.",
    topicPath: ["Technology", "Backend", "Distributed Systems", "Redis Caching"],
    sourcePath: ["Web", "Medium", "The Backend Diaries"],
    tags: ["redis", "distributed-systems", "caching", "invalidation"],
    confidence: "99.4%",
    model: "Fireworks AI (Llama-3-70B)",
  },
  {
    id: "postgres",
    label: "PostgreSQL GIN",
    snippet: "CREATE INDEX idx_fragments_tags_gin ON fragments USING GIN (tags array_ops); gives sub-5ms array queries.",
    topicPath: ["Technology", "Databases", "PostgreSQL", "Indexing"],
    sourcePath: ["Documentation", "PostgreSQL Docs", "Chapter 11"],
    tags: ["postgres", "gin-index", "sql-optimization", "database"],
    confidence: "98.9%",
    model: "Google Gemini 2.0 Flash",
  },
  {
    id: "docker",
    label: "Linux Non-Root",
    snippet: "RUN addgroup -S appgroup && adduser -S appuser -G appgroup with cap_drop: ALL prevents host privilege escalation.",
    topicPath: ["Security", "DevSecOps", "Container Hardening"],
    sourcePath: ["GitHub", "letsunthink", "docker-compose.prod.yml"],
    tags: ["docker", "security", "devops", "linux-capabilities"],
    confidence: "99.1%",
    model: "Fireworks AI (Llama-3-70B)",
  },
];

function AiTaxonomyExplorer() {
  const [selectedSample, setSelectedSample] = useState<FragmentSample>(SAMPLES[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-semibold tracking-wider uppercase">
            Interactive Module 03
          </span>
          <h3 className="font-display text-t1 text-[20px] font-bold">
            Zero-Decision Dual-Tree AI Taxonomic Routing
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSample(s)}
              className={cn(
                "font-mono text-xs rounded-md px-2.5 py-1 transition-colors cursor-pointer",
                selectedSample.id === s.id
                  ? "bg-amber text-bg font-semibold"
                  : "border border-border text-t3 hover:text-t1"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-t2 text-[14.5px] leading-relaxed">
        UnThink eliminates manual filing friction by filing every fragment into two simultaneous hierarchies:
        a <strong>Conceptual Topic Tree</strong> and a <strong>Source Origin Tree</strong>. Multi-model AI failover
        guarantees zero downtime classification.
      </p>

      {/* Dual Tree Interactive Visualization */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 font-mono text-[12px]">
        {/* Tree 1: Conceptual Topic Hierarchy */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-amber font-semibold flex items-center gap-1.5">
              <span>[DIR]</span> 1. Conceptual Topic Tree
            </span>
            <span className="text-t3 text-[11px]">Subject Taxonomy</span>
          </div>
          <div className="space-y-2 text-t2">
            {selectedSample.topicPath.map((node, idx) => (
              <div
                key={node}
                className="flex items-center gap-2"
                style={{ paddingLeft: `${idx * 16}px` }}
              >
                <span className="text-t3">{idx === selectedSample.topicPath.length - 1 ? ">" : "+"}</span>
                <span className={cn(
                  idx === selectedSample.topicPath.length - 1
                    ? "text-acc font-semibold bg-acc/10 px-2 py-0.5 rounded"
                    : "text-t2"
                )}>
                  {node}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tree 2: Source Origin Hierarchy */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-acc font-semibold flex items-center gap-1.5">
              <span>[SRC]</span> 2. Source Origin Tree
            </span>
            <span className="text-t3 text-[11px]">Context Taxonomy</span>
          </div>
          <div className="space-y-2 text-t2">
            {selectedSample.sourcePath.map((node, idx) => (
              <div
                key={node}
                className="flex items-center gap-2"
                style={{ paddingLeft: `${idx * 16}px` }}
              >
                <span className="text-t3">{idx === selectedSample.sourcePath.length - 1 ? ">" : "+"}</span>
                <span className={cn(
                  idx === selectedSample.sourcePath.length - 1
                    ? "text-amber font-semibold bg-amber/10 px-2 py-0.5 rounded"
                    : "text-t2"
                )}>
                  {node}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Metadata & Auto-Tags */}
      <div className="border-border/80 bg-surface/60 rounded-xl border p-4 font-mono text-[12px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-t3">Classifier Engine:</span>
            <span className="text-t1 font-medium">{selectedSample.model}</span>
            <span className="text-acc bg-acc/10 px-2 py-0.5 rounded text-[11px] font-semibold">
              Confidence: {selectedSample.confidence}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-t3 text-[11px] mr-1">Auto-Tags:</span>
            {selectedSample.tags.map((tag) => (
              <span key={tag} className="border-border bg-bg/60 text-t2 rounded border px-2 py-0.5 text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. Deterministic Epoch Cache Invalidation Simulator
   ───────────────────────────────────────────────────────────────────────────── */
function EpochCacheSimulator() {
  const [epochVersion, setEpochVersion] = useState(42);
  const [invalidationTime, setInvalidationTime] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([
    "user:42:cache_version initialized at v42",
    "Cached query key: feed:user:42:v42:page:1 (HIT)",
    "Cached query key: tree:user:42:v42:counts (HIT)",
  ]);

  const handleBumpEpoch = () => {
    const nextVer = epochVersion + 1;
    const latency = (Math.random() * 0.4 + 0.2).toFixed(2); // 0.20ms - 0.60ms
    setEpochVersion(nextVer);
    setInvalidationTime(Number(latency));
    setLog((prev) => [
      `Atomic INCR user:42:cache_version -> v${nextVer} in ${latency}ms (0 keys flushed)`,
      `Logical Invalidation: previous v${epochVersion} query keys automatically bypassed`,
      `New cache entry registered: feed:user:42:v${nextVer}:page:1 (WARM)`,
      ...prev.slice(0, 3),
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-semibold tracking-wider uppercase">
            Interactive Module 04
          </span>
          <h3 className="font-display text-t1 text-[20px] font-bold">
            Deterministic Epoch Invalidation and Mutex Locking
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="border-border rounded-md border bg-bg/50 px-2.5 py-1 text-acc">
            Current Epoch: <strong className="text-t1 font-bold">v{epochVersion}</strong>
          </span>
          {invalidationTime ? (
            <span className="border-acc/40 bg-acc/10 rounded-md border px-2.5 py-1 text-acc font-semibold">
              Invalidation: {invalidationTime}ms
            </span>
          ) : null}
        </div>
      </div>

      <p className="text-t2 text-[14.5px] leading-relaxed">
        In complex multidimensional query spaces (paginated feeds, nested folders with live counts, tag clouds),
        running <code className="text-amber bg-surface px-1 rounded">KEYS *</code> or clearing Redis caches causes event loop blocking and database stampedes.
        UnThink binds all cache keys to a user-level epoch version. Bumping the epoch logically invalidates all dependent queries in sub-millisecond time.
      </p>

      {/* Interactive State Board */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 font-mono text-[12px]">
        {/* Active Cache State */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-t1 font-semibold flex items-center gap-1.5">
              <span>[CACHE]</span> Redis Active Cache Keys
            </span>
            <span className="text-acc font-mono text-[11px]">TTL: 3600s</span>
          </div>

          <div className="space-y-2">
            <div className="rounded border border-border/60 bg-code-bg p-2 flex items-center justify-between">
              <span className="text-amber">user:42:cache_version</span>
              <span className="bg-amber/20 text-amber px-2 py-0.5 rounded font-bold">{epochVersion}</span>
            </div>
            <div className="rounded border border-border/60 bg-code-bg p-2 flex items-center justify-between text-t2">
              <span>feed:user:42:v{epochVersion}:page:1</span>
              <span className="text-acc font-semibold">20 Items (HIT)</span>
            </div>
            <div className="rounded border border-border/60 bg-code-bg p-2 flex items-center justify-between text-t2">
              <span>tree:user:42:v{epochVersion}:counts</span>
              <span className="text-acc font-semibold">148 Nodes (HIT)</span>
            </div>
          </div>

          <button
            onClick={handleBumpEpoch}
            className="w-full bg-amber hover:bg-amber/90 font-mono text-[12px] font-semibold text-bg flex items-center justify-center gap-2 rounded-lg py-2.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>[+]</span> Simulate Fragment Save (Trigger Atomic INCR)
          </button>
        </div>

        {/* Real-time Redis Execution Log */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-t1 font-semibold flex items-center gap-1.5">
              <span>[LOG]</span> Redis Pipeline Operations Log
            </span>
            <span className="text-t3 text-[11px]">Real-Time Execution</span>
          </div>

          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
            {log.map((entry, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded text-[11px] font-mono leading-relaxed",
                  idx === 0
                    ? "bg-acc/10 text-acc border border-acc/30"
                    : "bg-code-bg text-t3"
                )}
              >
                &gt; {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. SSE Real-Time Stream & Production Security Hardening
   ───────────────────────────────────────────────────────────────────────────── */
function SseSecurityStream() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-semibold tracking-wider uppercase">
            Interactive Module 05
          </span>
          <h3 className="font-display text-t1 text-[20px] font-bold">
            Real-Time SSE Streaming and AWS EC2 Container Hardening
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="border-acc/40 bg-acc/10 text-acc rounded-md border px-2.5 py-1 font-semibold">
            SSE Connected (:8001)
          </span>
        </div>
      </div>

      <p className="text-t2 text-[14.5px] leading-relaxed">
        FastAPI handles asynchronous Server-Sent Events (SSE) to update the React SPA instantly as AI workers complete classification,
        while production containers run with hardened Linux security profiles on AWS EC2.
      </p>

      {/* Stream & Security Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 font-mono text-[12px]">
        {/* Live SSE Stream Terminal */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-acc font-semibold flex items-center gap-1.5">
              <span>[SSE]</span> Live SSE Event Channel
            </span>
            <span className="text-t3 text-[11px]">Stream: /api/v1/events/</span>
          </div>

          <div className="space-y-2 bg-code-bg rounded-lg p-3 border border-border/60 text-t2 text-[11.5px]">
            <p className="text-t3">event: fragment.created</p>
            <p className="text-amber">data: &#123;&quot;id&quot;: &quot;frag_882a&quot;, &quot;status&quot;: &quot;queued&quot;&#125;</p>
            <div className="border-t border-border/40 my-1.5" />
            <p className="text-t3">event: ai.classification.done</p>
            <p className="text-acc">data: &#123;&quot;id&quot;: &quot;frag_882a&quot;, &quot;topic&quot;: &quot;Redis Caching&quot;, &quot;latency_ms&quot;: 240&#125;</p>
            <div className="border-t border-border/40 my-1.5" />
            <p className="text-t3">event: dashboard.tree.sync</p>
            <p className="text-t1 font-semibold">data: &#123;&quot;action&quot;: &quot;refresh_counts&quot;, &quot;epoch&quot;: &quot;v43&quot;&#125;</p>
          </div>
        </div>

        {/* Security Invariants Checklist */}
        <div className="border-border bg-surface rounded-xl border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-t1 font-semibold flex items-center gap-1.5">
              <span>[SYS]</span> Production Security Invariants
            </span>
            <span className="text-amber text-[11px]">AWS EC2 Hardened</span>
          </div>

          <div className="space-y-2 text-[11.5px]">
            <div className="border-border/60 bg-code-bg flex items-center justify-between rounded border p-2">
              <span className="text-t2">Non-Root User Execution</span>
              <span className="text-acc font-semibold">[OK] UID 10001</span>
            </div>
            <div className="border-border/60 bg-code-bg flex items-center justify-between rounded border p-2">
              <span className="text-t2">Linux Kernel Capabilities</span>
              <span className="text-acc font-semibold">[OK] cap_drop: ALL</span>
            </div>
            <div className="border-border/60 bg-code-bg flex items-center justify-between rounded border p-2">
              <span className="text-t2">Nginx Reverse Proxy Gateway</span>
              <span className="text-acc font-semibold">[OK] Unprivileged Alpine (:443)</span>
            </div>
            <div className="border-border/60 bg-code-bg flex items-center justify-between rounded border p-2">
              <span className="text-t2">Internal Port Isolation</span>
              <span className="text-acc font-semibold">[OK] 0 Exposed Host Ports</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
