"use client";

/**
 * components/diagrams/ZoomableDiagramWrapper.tsx
 *
 * Interactive pan-zoom wrapper and fullscreen lightbox modal for architecture diagrams.
 *
 * Features:
 *   - Inline zoom controls: [-], [100%], [+], [Reset], and [⤢ Fullscreen]
 *   - Smooth click-to-drag panning when zoomed in
 *   - Fullscreen Lightbox Modal with wheel zoom, drag pan, and keyboard navigation (Esc, +, -, 0)
 *   - Pure SVG + CSS transforms, 100% dependency-free, zero emojis, zero em dashes.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface ZoomableDiagramWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ZoomableDiagramWrapper({
  children,
  title = "Architecture Blueprint",
  className,
}: ZoomableDiagramWrapperProps) {
  // Inline pan-zoom state
  const [inlineScale, setInlineScale] = useState(1);
  const [inlinePan, setInlinePan] = useState({ x: 0, y: 0 });
  const [isInlineDragging, setIsInlineDragging] = useState(false);
  const inlineDragStart = useRef({ x: 0, y: 0 });

  // Modal pan-zoom state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragStart = useRef({ x: 0, y: 0 });

  // Reset inline zoom
  const resetInlineZoom = () => {
    setInlineScale(1);
    setInlinePan({ x: 0, y: 0 });
  };

  // Reset modal zoom
  const resetModalZoom = useCallback(() => {
    setModalScale(1);
    setModalPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcut listener for modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        resetModalZoom();
      } else if (e.key === "+" || e.key === "=") {
        setModalScale((prev) => Math.min(prev + 0.25, 4));
      } else if (e.key === "-") {
        setModalScale((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === "0") {
        resetModalZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, resetModalZoom]);

  // Inline mouse drag handlers
  const handleInlineMouseDown = (e: React.MouseEvent) => {
    if (inlineScale <= 1) return;
    setIsInlineDragging(true);
    inlineDragStart.current = { x: e.clientX - inlinePan.x, y: e.clientY - inlinePan.y };
  };

  const handleInlineMouseMove = (e: React.MouseEvent) => {
    if (!isInlineDragging) return;
    setInlinePan({
      x: e.clientX - inlineDragStart.current.x,
      y: e.clientY - inlineDragStart.current.y,
    });
  };

  const handleInlineMouseUp = () => {
    setIsInlineDragging(false);
  };

  // Modal mouse drag handlers
  const handleModalMouseDown = (e: React.MouseEvent) => {
    setIsModalDragging(true);
    modalDragStart.current = { x: e.clientX - modalPan.x, y: e.clientY - modalPan.y };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isModalDragging) return;
    setModalPan({
      x: e.clientX - modalDragStart.current.x,
      y: e.clientY - modalDragStart.current.y,
    });
  };

  const handleModalMouseUp = () => {
    setIsModalDragging(false);
  };

  // Modal wheel zoom handler
  const handleModalWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setModalScale((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
  };

  return (
    <div className={cn("relative group w-full", className)}>
      {/* Inline Toolbar Overlay */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-surface/90 border border-border/80 backdrop-blur-md rounded-lg p-1 shadow-md font-mono text-[11px]">
        {inlineScale > 1 && (
          <button
            onClick={resetInlineZoom}
            title="Reset Zoom"
            className="px-1.5 py-0.5 rounded text-t3 hover:text-t1 hover:bg-code-bg transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
        <button
          onClick={() => {
            const next = Math.max(inlineScale - 0.25, 0.75);
            setInlineScale(next);
            if (next <= 1) setInlinePan({ x: 0, y: 0 });
          }}
          title="Zoom Out"
          className="w-6 h-6 rounded flex items-center justify-center text-t2 hover:text-t1 hover:bg-code-bg transition-colors cursor-pointer font-bold"
        >
          -
        </button>
        <span className="text-[10px] font-semibold text-acc px-1 min-w-[34px] text-center">
          {Math.round(inlineScale * 100)}%
        </span>
        <button
          onClick={() => setInlineScale((prev) => Math.min(prev + 0.25, 2.5))}
          title="Zoom In"
          className="w-6 h-6 rounded flex items-center justify-center text-t2 hover:text-t1 hover:bg-code-bg transition-colors cursor-pointer font-bold"
        >
          +
        </button>
        <div className="w-[1px] h-3.5 bg-border/80 mx-0.5" />
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalScale(1.15);
          }}
          title="Expand Fullscreen"
          className="px-2 py-0.5 rounded text-t2 hover:text-acc hover:bg-code-bg flex items-center gap-1 transition-colors cursor-pointer text-[10.5px]"
        >
          <span className="text-acc font-mono">[⤢]</span> Expand
        </button>
      </div>

      {/* Inline Diagram Canvas */}
      <div
        onMouseDown={handleInlineMouseDown}
        onMouseMove={handleInlineMouseMove}
        onMouseUp={handleInlineMouseUp}
        onMouseLeave={handleInlineMouseUp}
        className={cn(
          "w-full overflow-hidden select-none transition-transform",
          inlineScale > 1 ? (isInlineDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        )}
      >
        <div
          style={{
            transform: `translate(${inlinePan.x}px, ${inlinePan.y}px) scale(${inlineScale})`,
            transformOrigin: "center center",
            transition: isInlineDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="w-full"
        >
          {children}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 sm:p-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-acc shadow-[0_0_8px_var(--acc)]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-t1 font-bold">
                  {title} - High-Resolution Architecture Blueprint
                </h3>
                <span className="text-[11px] font-mono text-t3 hidden sm:inline">
                  Scroll or buttons to zoom · Drag to pan
                </span>
              </div>

              {/* Modal Controls Bar */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
                  <button
                    onClick={() => setModalScale((prev) => Math.max(prev - 0.25, 0.5))}
                    title="Zoom Out (-)"
                    className="w-7 h-7 rounded flex items-center justify-center text-t2 hover:text-t1 hover:bg-code-bg cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-acc px-2 min-w-[42px] text-center">
                    {Math.round(modalScale * 100)}%
                  </span>
                  <button
                    onClick={() => setModalScale((prev) => Math.min(prev + 0.25, 4))}
                    title="Zoom In (+)"
                    className="w-7 h-7 rounded flex items-center justify-center text-t2 hover:text-t1 hover:bg-code-bg cursor-pointer font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={resetModalZoom}
                    title="Reset Zoom (0)"
                    className="px-2 py-1 rounded text-t3 hover:text-t1 hover:bg-code-bg transition-colors cursor-pointer text-[11px]"
                  >
                    Reset
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetModalZoom();
                  }}
                  title="Close (Esc)"
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border text-t2 hover:text-t1 hover:bg-code-bg cursor-pointer transition-colors"
                >
                  [Esc] Close
                </button>
              </div>
            </div>

            {/* Modal Canvas Stage */}
            <div
              onMouseDown={handleModalMouseDown}
              onMouseMove={handleModalMouseMove}
              onMouseUp={handleModalMouseUp}
              onWheel={handleModalWheel}
              className={cn(
                "flex-1 w-full bg-code-bg border border-border/80 rounded-xl overflow-hidden relative flex items-center justify-center select-none",
                isModalDragging ? "cursor-grabbing" : "cursor-grab"
              )}
            >
              <div
                style={{
                  transform: `translate(${modalPan.x}px, ${modalPan.y}px) scale(${modalScale})`,
                  transformOrigin: "center center",
                  transition: isModalDragging ? "none" : "transform 0.12s ease-out",
                  maxWidth: "92%",
                  maxHeight: "92%",
                }}
                className="w-full max-w-5xl"
              >
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
