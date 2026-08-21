"use client";

/**
 * components/work/UnThinkSimulation.tsx
 *
 * Master Interactive Simulation Engine for UnThink on /work/unthink.
 * Direct architectural reproduction of the live UnThink sandbox from letsunthink.tech.
 *
 * Implements:
 *   1. 7 Specialized User Personas (Engineers, Tech-Pros, Lawyers, Doctors, Researchers, Writers, Knowledge Seekers)
 *   2. Interactive Fragment Click with authentic Chrome Right-Click Context Menu
 *   3. Sub-300ms Async Ingestion Workflow with Real-time Loading Transition to Step 2
 *   4. Full Interactive Mock Dashboard (Step 2) with:
 *      - Recursive Collapsible Taxonomy Tree Navigation
 *      - Source Origin and Tag Filters
 *      - In-Card Expandable AI Summary Panels
 *      - Cmd+K Fast Search Modal with Calculated Query Latency (<150ms)
 *      - Detailed Fragment Inspector Modal
 *
 * Strictly free of emojis and em dashes across all UI and data layers.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  PersonaId,
  ArticleParagraph,
  MockFragment,
  PERSONA_THEMES,
  PERSONA_ARTICLES,
  PERSONA_FOLDERS,
  INITIAL_MOCK_DATA,
} from "./unthink-simulation-data";

export default function UnThinkSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePersona, setActivePersona] = useState<PersonaId>("engineers");
  const [dashboardFragments, setDashboardFragments] = useState<MockFragment[]>(
    () => INITIAL_MOCK_DATA["engineers"] || []
  );
  const [selectedFragment, setSelectedFragment] = useState<ArticleParagraph | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fragment: ArticleParagraph;
  } | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cookingToast, setCookingToast] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (PERSONA_FOLDERS["engineers"] || []).forEach((f) => {
      if (f.hasChildren && f.level === 0) {
        initial[f.path] = true;
      }
    });
    return initial;
  });
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null);
  const [activeSourceFilter, setActiveSourceFilter] = useState<string | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<MockFragment | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = PERSONA_THEMES[activePersona];

  // Handler to switch persona and reset relevant state cleanly
  const handleSelectPersona = (key: PersonaId) => {
    setActivePersona(key);
    setDashboardFragments(INITIAL_MOCK_DATA[key] || []);
    setSelectedFragment(null);
    setContextMenu(null);
    setShowDashboard(false);
    setIsProcessing(false);
    setCookingToast(false);
    setActiveFolderFilter(null);
    setActiveSourceFilter(null);
    setActiveTagFilter(null);
    setExpandedCard(null);
    setSearchOpen(false);
    setSearchQuery("");
    setExpandedCardIds(new Set());

    const initialExpanded: Record<string, boolean> = {};
    (PERSONA_FOLDERS[key] || []).forEach((f) => {
      if (f.hasChildren && f.level === 0) {
        initialExpanded[f.path] = true;
      }
    });
    setExpandedFolders(initialExpanded);
  };

  // Keyboard shortcut listener for Cmd+K search and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setExpandedCard(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle clicking a fragment card in Step 1 to spawn the Chrome context menu
  const handleCardClick = (para: ArticleParagraph, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Clamp coordinates so menu stays neatly inside container bounds
    const x = Math.max(12, Math.min(rawX, rect.width - 260));
    const y = Math.max(12, Math.min(rawY + 4, rect.height - 180));

    setSelectedFragment(para);
    setContextMenu({ x, y, fragment: para });
  };

  // Trigger Send to UnThink from the context menu
  const handleSendToUnThink = (para?: ArticleParagraph) => {
    const target = para || selectedFragment;
    if (!target) return;

    setContextMenu(null);
    setIsProcessing(true);

    const newFragment: MockFragment = {
      id: `capture-${Date.now()}`,
      title: "Simulated Capture",
      content: target.text,
      folder: target.folder,
      sourceDomain: target.domain,
      summary: `Automated summary from ${target.domain}: "${target.text.substring(0, 50)}..."`,
      tags: ["Clips", "Ingested"],
      date: "Just now",
      status: "processing",
    };

    setDashboardFragments((prev) => [newFragment, ...prev]);

    // Expand ancestor folders
    if (target.folder) {
      const parts = target.folder.split("/");
      let current = "";
      const nextExpanded = { ...expandedFolders };
      for (let i = 0; i < parts.length - 1; i++) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        nextExpanded[current] = true;
      }
      setExpandedFolders(nextExpanded);
    }

    setTimeout(() => {
      setShowDashboard(true);
      setIsProcessing(false);

      // Transition loading status to completed
      setTimeout(() => {
        setDashboardFragments((curr) =>
          curr.map((f) => (f.id === newFragment.id ? { ...f, status: "completed" } : f))
        );
      }, 1400);
    }, 800);
  };

  // Filtered fragment cards
  const filteredFragments = useMemo(() => {
    return dashboardFragments.filter((f) => {
      if (activeSourceFilter) return f.sourceDomain === activeSourceFilter;
      if (activeTagFilter) return f.tags && f.tags.includes(activeTagFilter);
      if (activeFolderFilter) return f.folder === activeFolderFilter;
      return true;
    });
  }, [dashboardFragments, activeFolderFilter, activeSourceFilter, activeTagFilter]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
    return dashboardFragments.filter((f) =>
      queryWords.some(
        (word) =>
          f.title.toLowerCase().includes(word) ||
          f.content.toLowerCase().includes(word) ||
          (f.summary && f.summary.toLowerCase().includes(word)) ||
          f.folder.toLowerCase().includes(word)
      )
    );
  }, [dashboardFragments, searchQuery]);

  // Search latency calculation
  const searchLatency = useMemo(() => {
    if (!searchQuery.trim()) return 52;
    let hash = 0;
    for (let i = 0; i < searchQuery.length; i++) {
      hash = (hash << 5) - hash + searchQuery.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 95) + 45; // 45ms to 140ms
  }, [searchQuery]);

  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    dashboardFragments.forEach((f) => {
      if (f.sourceDomain) set.add(f.sourceDomain);
    });
    return Array.from(set);
  }, [dashboardFragments]);

  const getFolderCount = (folderPath: string) => {
    return dashboardFragments.filter((f) => f.folder === folderPath).length;
  };

  const isFolderVisible = (folder: { path: string; level: number }) => {
    if (folder.level === 0) return true;
    const parts = folder.path.split("/");
    let current = "";
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      if (!expandedFolders[current]) return false;
    }
    return true;
  };

  const toggleFolderExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleCardExpanded = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTagClick = useCallback((tag: string) => {
    setActiveTagFilter(tag);
    setActiveFolderFilter(null);
    setActiveSourceFilter(null);
  }, []);

  return (
    <section className="relative my-16 rounded-2xl border border-[#2B4A3A]/40 bg-[#121C13]/90 p-6 md:p-10 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#5CC9A0]/10 text-[#5CC9A0] border border-[#5CC9A0]/30 mb-3">
          Product Sandbox Engine
        </div>
        <h3 className="text-2xl md:text-4xl font-display font-bold text-[#F0FDF4] tracking-tight m-0">
          Experience the Zero-Friction Capture Loop
        </h3>
        <p className="text-sm text-[#A7D4B2] mt-2 max-w-xl mx-auto font-sans leading-relaxed">
          Test UnThink&apos;s real product workflow: Click any fragment below to open the simulated browser context menu, click &quot;Send selection to UnThink&quot;, and watch the automated dual-tree pipeline classify and file it instantly.
        </p>
      </div>

      {/* 1. Persona Tabs */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-[#2B4A3A]/40 pb-5 mb-8">
        {(Object.keys(PERSONA_ARTICLES) as PersonaId[]).map((key) => {
          const isActive = activePersona === key;
          const label = key.replace("-", " ");
          return (
            <button
              key={key}
              onClick={() => handleSelectPersona(key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium uppercase tracking-wider border cursor-pointer transition-all"
              style={{
                backgroundColor: isActive ? theme.accentDark : "rgba(32, 49, 35, 0.6)",
                color: isActive ? "#121C13" : "#A7D4B2",
                borderColor: isActive ? theme.accentDark : "rgba(43, 74, 58, 0.4)",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Step 1: Article Ingestion Sandbox */}
      {!showDashboard && (
        <div className="space-y-6" onClick={() => setContextMenu(null)}>
          <div ref={containerRef} className="relative rounded-xl bg-[#172318] p-6 border border-[#2B4A3A]/50">
            <div className="mb-4 pb-3 border-b border-[#2B4A3A]/40">
              <p className="text-xs text-[#A7D4B2] font-mono m-0 font-semibold">
                Step 1: Click any fragment card below to open the simulated browser context menu and clip to UnThink.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERSONA_ARTICLES[activePersona].map((para, i) => {
                const isSelected = selectedFragment?.text === para.text && Boolean(contextMenu);
                return (
                  <div
                    key={i}
                    onClick={(e) => handleCardClick(para, e)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? "border-[#5CC9A0] bg-[#1C2C1E] shadow-lg"
                        : "border-[#2B4A3A]/40 bg-[#1C2C1E]/60 hover:bg-[#1C2C1E] hover:border-[#5CC9A0]/60"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold bg-[#121C13] border border-[#2B4A3A]/60 px-2 py-0.5 rounded text-[#5CC9A0] block w-fit mb-2">
                      Source: {para.domain}
                    </span>
                    <p className="m-0 text-xs md:text-[13px] text-[#E8F5E9] leading-relaxed">
                      {para.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Authentic Chrome Right-Click Style Context Menu */}
            {contextMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu(null);
                  }}
                />
                <div
                  className="absolute z-50 bg-[#142016] border border-[#2B4A3A] rounded-lg shadow-2xl py-1.5 min-w-[240px] font-sans text-xs text-[#F0FDF4] select-none animate-in zoom-in-95 duration-100"
                  style={{
                    top: contextMenu.y,
                    left: contextMenu.x,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[11px] text-[#6E8B75] flex justify-between cursor-not-allowed opacity-60">
                    <span>Copy</span>
                    <span className="font-mono text-[10px]">Ctrl+C</span>
                  </div>
                  <div className="px-3 py-1.5 text-[11px] text-[#6E8B75] truncate cursor-not-allowed opacity-60">
                    Search Google for selection
                  </div>
                  <div className="border-b border-[#2B4A3A]/60 my-1" />
                  <button
                    onClick={() => handleSendToUnThink(contextMenu.fragment)}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-[#5CC9A0] bg-[#5CC9A0]/15 hover:bg-[#5CC9A0] hover:text-[#121C13] flex items-center justify-between transition-colors cursor-pointer border-none font-mono"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold">[-&gt;]</span> Send selection to UnThink
                    </span>
                    <span className="text-[10px] opacity-75">Alt+Shift+S</span>
                  </button>
                  <div className="border-b border-[#2B4A3A]/60 my-1" />
                  <div className="px-3 py-1.5 text-[11px] text-[#6E8B75] flex justify-between cursor-not-allowed opacity-60">
                    <span>Inspect</span>
                    <span className="font-mono text-[10px]">Ctrl+Shift+I</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading Ingestion Screen */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#121C13]/85 backdrop-blur-xs flex flex-col justify-center items-center z-50 animate-in fade-in duration-150 font-mono">
          <div className="w-10 h-10 border-2 border-t-[#5CC9A0] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-bold text-[#5CC9A0] uppercase tracking-widest">
            Ingesting Fragment into AI Taxonomy Pipeline...
          </span>
        </div>
      )}

      {/* Step 2: Interactive Mock Dashboard Sandbox */}
      {showDashboard && (
        <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-400">
          <div className="bg-[#1C2C1E] rounded-xl p-4 border border-[#5CC9A0]/30 flex justify-between items-center text-left">
            <div>
              <p className="text-xs font-mono text-[#5CC9A0] m-0 font-medium">
                [OK] Fragment ingested into taxonomy. Explore recursive folders or hit Cmd+K search.
              </p>
            </div>
            <button
              onClick={() => setShowDashboard(false)}
              className="text-xs font-mono font-bold underline bg-transparent border-none text-[#5CC9A0] cursor-pointer hover:text-white"
            >
              Reset and Try Another Clip
            </button>
          </div>

          {/* Dashboard Workspace Window */}
          <div className="w-full border border-[#2B4A3A]/60 rounded-2xl overflow-hidden bg-[#172318] shadow-2xl flex flex-col md:flex-row h-[560px]">
            {/* Sidebar */}
            <aside className="w-full md:w-60 bg-[#121C13] border-b md:border-b-0 md:border-r border-[#2B4A3A]/40 flex flex-col shrink-0 select-none text-left">
              <div className="px-4 py-3 border-b border-[#2B4A3A]/40 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-[#F0FDF4]">
                  UnThink<span className="text-[#5CC9A0]">.</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase text-[#121C13] bg-[#5CC9A0] px-1.5 py-0.5 rounded">
                  SANDBOX
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-4 font-mono text-xs">
                {/* All Fragments */}
                <div>
                  <span className="text-[9px] font-bold text-[#6E8B75] uppercase tracking-wider block px-2 mb-1.5">
                    My Library
                  </span>
                  <div
                    onClick={() => {
                      setActiveFolderFilter(null);
                      setActiveSourceFilter(null);
                      setActiveTagFilter(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      !activeFolderFilter && !activeSourceFilter && !activeTagFilter
                        ? "bg-[#203123] text-[#5CC9A0] font-bold border border-[#5CC9A0]/30"
                        : "text-[#A7D4B2] hover:bg-[#1C2C1E]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px]">[DIR]</span> All Fragments
                    </span>
                    <span className="text-[9px] bg-[#172318] px-1.5 py-0.5 rounded border border-[#2B4A3A]/60 text-[#F0FDF4]">
                      {dashboardFragments.length}
                    </span>
                  </div>

                  {/* Taxonomy Folders */}
                  <div className="mt-1 space-y-0.5">
                    {(PERSONA_FOLDERS[activePersona] || []).map((folder) => {
                      if (!isFolderVisible(folder)) return null;
                      const isSelected = activeFolderFilter === folder.path && !activeSourceFilter && !activeTagFilter;
                      const count = getFolderCount(folder.path);
                      const isExpanded = expandedFolders[folder.path] === true;

                      return (
                        <div
                          key={folder.id}
                          onClick={() => {
                            setActiveFolderFilter(folder.path);
                            setActiveSourceFilter(null);
                            setActiveTagFilter(null);
                          }}
                          className={`px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-[11px] ${
                            isSelected
                              ? "bg-[#203123] text-[#5CC9A0] font-bold border border-[#5CC9A0]/30"
                              : "text-[#A7D4B2] hover:bg-[#1C2C1E]"
                          }`}
                          style={{ paddingLeft: `${folder.level * 10 + 8}px` }}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {folder.hasChildren ? (
                              <button
                                onClick={(e) => toggleFolderExpand(folder.path, e)}
                                className="w-3.5 h-3.5 flex items-center justify-center border-none bg-transparent hover:bg-white/10 rounded cursor-pointer text-[9px] text-[#A7D4B2] shrink-0 font-mono"
                              >
                                {isExpanded ? "v" : ">"}
                              </button>
                            ) : (
                              <span className="w-3.5 text-center opacity-40 text-[9px]">-</span>
                            )}
                            <span className="truncate">{folder.name}</span>
                          </div>
                          {count > 0 && (
                            <span className="text-[9px] bg-[#172318] px-1 py-0.2 rounded border border-[#2B4A3A]/60 text-[#A7D4B2]">
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sources Panel */}
                <div className="border-t border-[#2B4A3A]/40 pt-3">
                  <span className="text-[9px] font-bold text-[#6E8B75] uppercase tracking-wider block px-2 mb-1.5">
                    Sources
                  </span>
                  <div className="space-y-0.5">
                    {uniqueSources.map((src) => {
                      const isSelected = activeSourceFilter === src && !activeTagFilter;
                      const count = dashboardFragments.filter((f) => f.sourceDomain === src).length;
                      return (
                        <div
                          key={src}
                          onClick={() => {
                            setActiveSourceFilter(src);
                            setActiveFolderFilter(null);
                            setActiveTagFilter(null);
                          }}
                          className={`px-3 py-1 rounded-lg flex justify-between items-center cursor-pointer transition-colors text-[11px] ${
                            isSelected
                              ? "bg-[#203123] text-[#5CC9A0] font-bold border border-[#5CC9A0]/30"
                              : "text-[#A7D4B2] hover:bg-[#1C2C1E]"
                          }`}
                        >
                          <span className="truncate font-mono">{src}</span>
                          {count > 0 && (
                            <span className="text-[9px] bg-[#172318] px-1.5 py-0.2 rounded border border-[#2B4A3A]/60 text-[#A7D4B2]">
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Quota Gauge */}
              <div className="p-3 border-t border-[#2B4A3A]/40 bg-[#172318]/50">
                <div className="flex justify-between text-[10px] text-[#A7D4B2] font-mono mb-1">
                  <span>Monthly saves</span>
                  <span>{dashboardFragments.length}/250</span>
                </div>
                <div className="w-full bg-[#1C2C1E] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5CC9A0] transition-all"
                    style={{ width: `${Math.min(100, (dashboardFragments.length / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </aside>

            {/* Dashboard Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full bg-[#172318]">
              {/* Dashboard Subheader */}
              <header className="px-5 h-12 border-b border-[#2B4A3A]/40 flex justify-between items-center shrink-0 text-left bg-[#121C13]/60 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#5CC9A0] bg-[#203123] border border-[#5CC9A0]/30 px-2 py-0.5 rounded">
                    {activeTagFilter
                      ? `#${activeTagFilter}`
                      : activeSourceFilter
                      ? activeSourceFilter
                      : activeFolderFilter
                      ? activeFolderFilter
                      : "All Fragments"}
                  </span>
                  <span className="text-[11px] font-mono text-[#6E8B75]">
                    ({filteredFragments.length} found)
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="px-3 py-1 rounded-lg border border-[#2B4A3A]/60 bg-[#172318] text-xs text-[#A7D4B2] hover:text-[#5CC9A0] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Search</span>
                    <span className="text-[9px] font-bold bg-[#121C13] px-1 py-0.2 rounded border border-[#2B4A3A]/60 text-[#5CC9A0]">
                      Cmd+K
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const val = prompt("Enter snippet content to save manually:");
                      if (val) {
                        setCookingToast(true);
                        const customFrag: MockFragment = {
                          id: `custom-${Date.now()}`,
                          title: "Manual Snippet",
                          content: val,
                          folder: PERSONA_FOLDERS[activePersona][0]?.path || "Infrastructure",
                          sourceDomain: "manual-save",
                          summary: "Manually entered fragment save. In production, the UnThink pipeline extracts entities and tags automatically.",
                          tags: ["Manual", "Captured"],
                          date: "Just now",
                          status: "processing",
                        };
                        setDashboardFragments((prev) => [customFrag, ...prev]);
                        setTimeout(() => {
                          setCookingToast(false);
                          setDashboardFragments((curr) =>
                            curr.map((f) => (f.id === customFrag.id ? { ...f, status: "completed" } : f))
                          );
                        }, 3000);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-[#5CC9A0] text-[#121C13] font-bold text-xs cursor-pointer border-none hover:bg-[#4ebfad]"
                  >
                    + Save
                  </button>
                </div>
              </header>

              {/* Fragment Grid */}
              <div className="flex-1 overflow-y-auto p-5 text-left">
                {filteredFragments.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-[#6E8B75]">
                    No fragments match your active filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                    {filteredFragments.map((frag) => {
                      const isPending = frag.status === "processing";
                      const isExpanded = expandedCardIds.has(frag.id);

                      return (
                        <div
                          key={frag.id}
                          onClick={() => {
                            if (!isPending) toggleCardExpanded(frag.id);
                          }}
                          onDoubleClick={() => {
                            if (!isPending) setExpandedCard(frag);
                          }}
                          className="bg-[#1C2C1E]/80 p-4 rounded-xl border border-[#2B4A3A]/50 hover:border-[#5CC9A0]/50 transition-all cursor-pointer flex flex-col gap-2 relative group"
                        >
                          {isPending && (
                            <div className="absolute inset-0 bg-[#121C13]/90 rounded-xl flex flex-col items-center justify-center gap-1.5 z-10 font-mono">
                              <div className="w-4 h-4 border-2 border-t-[#5CC9A0] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                              <span className="text-[10px] text-[#5CC9A0] uppercase tracking-wider font-semibold">
                                Classifying with AI...
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5CC9A0] bg-[#121C13] border border-[#2B4A3A]/60 px-1.5 py-0.5 rounded">
                              {frag.folder}
                            </span>
                            <span className="text-[9px] text-[#6E8B75] font-mono">{frag.date}</span>
                          </div>

                          <p className="m-0 text-xs text-[#E8F5E9] line-clamp-3 leading-relaxed font-sans">
                            {frag.content}
                          </p>

                          {/* In-Card Expanded AI Summary Panel */}
                          {isExpanded && (
                            <div className="mt-2 border-t border-[#2B4A3A]/40 pt-2 text-xs space-y-2 animate-in fade-in duration-100 font-mono">
                              <div className="bg-[#121C13] p-2.5 rounded-lg border border-[#2B4A3A]/50 space-y-1.5">
                                <div className="text-[9px] uppercase font-bold text-[#5CC9A0]">
                                  AI Summary:
                                </div>
                                <p className="m-0 text-[11px] text-[#A7D4B2] italic leading-relaxed">
                                  {frag.summary}
                                </p>

                                {/* Tag Pills */}
                                {frag.tags && frag.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {frag.tags.map((t) => (
                                      <span
                                        key={t}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTagClick(t);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-[#203123] hover:bg-[#5CC9A0] hover:text-[#121C13] text-[9px] text-[#5CC9A0] cursor-pointer"
                                      >
                                        #{t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-1 border-t border-[#2B4A3A]/30 pt-2 font-mono text-[9px]">
                            <span className="text-[#6E8B75] truncate max-w-[140px]">
                              {frag.sourceDomain}
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCard(frag);
                              }}
                              className="text-[#5CC9A0] hover:underline cursor-pointer"
                            >
                              Expand details &gt;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Search Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 bg-[#121C13]/80 backdrop-blur-xs flex items-start justify-center pt-20 z-50 text-left px-4 animate-in fade-in duration-150 font-mono">
          <div className="bg-[#172318] rounded-2xl w-full max-w-xl border border-[#2B4A3A] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#2B4A3A]/60 flex items-center gap-3">
              <input
                type="text"
                placeholder="Query keywords (e.g. docker, redis, pgvector, dosage)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs w-full text-[#F0FDF4] placeholder-[#6E8B75]"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-xs text-[#A7D4B2] hover:text-white bg-transparent border-none cursor-pointer"
              >
                [Esc]
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
              {searchQuery.trim().length === 0 ? (
                <div className="text-center text-xs text-[#6E8B75] py-6">
                  Type keywords to test semantic intent recall.
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="flex justify-between text-[10px] text-[#5CC9A0] font-bold pb-1 border-b border-[#2B4A3A]/40">
                    <span>{searchResults.length} Match(es)</span>
                    <span>Retrieved in {searchLatency} ms</span>
                  </div>
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setExpandedCard(res);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="p-3 rounded-xl border border-[#2B4A3A]/40 hover:bg-[#1C2C1E] cursor-pointer flex flex-col gap-1 transition-colors"
                    >
                      <div className="flex justify-between text-[9px] uppercase text-[#6E8B75]">
                        <span>{res.folder}</span>
                        <span>{res.date}</span>
                      </div>
                      <h6 className="m-0 text-xs font-bold text-[#F0FDF4]">{res.title}</h6>
                      <p className="m-0 text-[11px] text-[#A7D4B2] line-clamp-2">{res.content}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-xs text-red-400 py-6">
                  No matching fragments found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fragment Detail Modal */}
      {expandedCard && (
        <div className="fixed inset-0 bg-[#121C13]/80 backdrop-blur-xs flex items-center justify-center z-50 text-left p-4 animate-in fade-in duration-150 font-mono">
          <div className="max-w-lg w-full bg-[#172318] border border-[#2B4A3A] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-[#5CC9A0] bg-[#121C13] border border-[#2B4A3A]/60 px-2 py-0.5 rounded">
                  {expandedCard.folder}
                </span>
                <button
                  onClick={() => setExpandedCard(null)}
                  className="text-sm font-bold text-[#A7D4B2] hover:text-white bg-transparent border-none cursor-pointer"
                >
                  [x]
                </button>
              </div>

              <p className="font-sans text-xs md:text-sm text-[#F0FDF4] leading-relaxed my-2">
                {expandedCard.content}
              </p>

              <div className="bg-[#121C13] p-3 rounded-xl border border-[#2B4A3A]/50 space-y-2 mt-2">
                <div className="text-[10px] uppercase font-bold text-[#5CC9A0]">
                  UnThink Agent Summary
                </div>
                <p className="m-0 text-xs text-[#A7D4B2] italic leading-relaxed">
                  {expandedCard.summary}
                </p>

                {expandedCard.tags && expandedCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {expandedCard.tags.map((t) => (
                      <span
                        key={t}
                        onClick={() => {
                          handleTagClick(t);
                          setExpandedCard(null);
                        }}
                        className="px-2 py-0.5 rounded bg-[#203123] text-[9.5px] text-[#5CC9A0] cursor-pointer hover:bg-[#5CC9A0] hover:text-[#121C13]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Cooking Toast */}
      {cookingToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121C13] border border-[#5CC9A0]/40 text-[#F0FDF4] p-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4">
          <div className="w-3.5 h-3.5 border-2 border-t-[#5CC9A0] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <span>UnThink pipeline processing fragment in background...</span>
        </div>
      )}
    </section>
  );
}
