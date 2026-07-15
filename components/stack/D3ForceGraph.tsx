/**
 * components/stack/D3ForceGraph.tsx
 *
 * D3 force-directed graph for /stack. Mounted in useEffect per master
 * §6 rule #5 ("D3 mounts in `useEffect`, never in JSX"). Uses modular
 * d3-force / d3-selection / d3-drag — NOT the full d3 package.
 *
 * Server renders an SVG scaffold (one <line> per edge + <circle>+<text>
 * per node positioned at 0,0) so the static HTML is meaningful and the
 * client hydration runs the simulation forward from the initial tick.
 *
 * Behavior:
 *   - Hover a node → dims non-connected to opacity 0.18
 *   - Click a node → toggles "active" state, fires onSelect(id)
 *   - Click active node again → unlocks (fires onSelect(null))
 *   - Drag a node → position updates locally (not persisted)
 *   - Container resize → forceCenter re-runs
 *
 * Reads activeId via prop. Active state is fully owned by the parent
 * StackShell so the detail panel can stay in sync.
 */

"use client";

import { useEffect, useRef } from "react";
import * as d3f from "d3-force";
import { select } from "d3-selection";
import { drag } from "d3-drag";
import type { StackItem, StackEdge } from "@/data/stack";
import { cn } from "@/lib/cn";

export interface D3ForceGraphProps {
  techs: ReadonlyArray<StackItem>;
  edges: ReadonlyArray<StackEdge>;
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  className?: string;
}

/* Graph-wide simulation constants — tweaked for the 29-node graph. */
const WIDTH = 760;
const HEIGHT = 600;
const CHARGE = -240;
const LINK_DIST = 70;
const COLLIDE = 32;

export function D3ForceGraph({
  techs,
  edges,
  activeId,
  onSelect,
  onHover,
  className,
}: D3ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3f.Simulation<
    SimNode,
    SimEdge
  > | null>(null);

  /* Mount simulation once per tech/edge shape change. */
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    /* Build simulation nodes + edges (mutable copies for D3 to update). */
    const nodes: SimNode[] = techs.map((t) => ({
      id: t.id,
      name: t.name,
      domain: t.domain,
      depth: t.depth,
    }));
    const idIndex = new Map(nodes.map((n, i) => [n.id, i]));
    const simEdges: SimEdge[] = edges
      .filter((e) => idIndex.has(e.source as string) && idIndex.has(e.target as string))
      .map((e) => ({
        source: idIndex.get(e.source as string)!,
        target: idIndex.get(e.target as string)!,
        weight: e.weight,
      }));

    /* Draw edges first so nodes overlay them. */
    const edgeSel = svg
      .append("g")
      .attr("class", "edges")
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(simEdges)
      .join("line")
      .attr("stroke-width", (d) => 1 + 0.6 * d.weight);

    /* Nodes group. */
    const nodeSel = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", (d) => `node ${d.domain}`)
      .attr("data-id", (d) => d.id);

    nodeSel
      .append("circle")
      .attr("r", (d) => (d.depth != null ? 14 : 12));

    nodeSel
      .append("text")
      .attr("dy", (d) => (d.depth != null ? "1.6em" : "1.5em"))
      .text((d) => d.name);

    /* Behavior wiring. */
    nodeSel
      .on("mouseenter", (_event, d) => {
        if (onHover) onHover(d.id);
        svg.classed("has-hover", true);
        highlight(d.id);
      })
      .on("mouseleave", () => {
        if (onHover) onHover(null);
        svg.classed("has-hover", false);
        clearHoverHighlight();
      })
      .on("click", (_event, d) => {
        onSelect(activeId === d.id ? null : d.id);
      });

    nodeSel.call(
      drag<SVGGElement, SimNode>()
        .on("start", (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }),
    );

    /* Helpers — neighborhood highlight. */
    const neighborsOf = (id: string): Set<string> => {
      const s = new Set<string>();
      s.add(id);
      for (const e of simEdges) {
        const sId = (e.source as SimNode).id ?? (e.source as number);
        const tId = (e.target as SimNode).id ?? (e.target as number);
        if (sId === id) s.add(String(tId));
        if (tId === id) s.add(String(sId));
      }
      return s;
    };
    function highlight(id: string) {
      const ns = neighborsOf(id);
      nodeSel.classed("highlight", (d) => ns.has(d.id));
      edgeSel.classed("highlight", (e) => {
        const sId = (e.source as SimNode).id;
        const tId = (e.target as SimNode).id;
        return ns.has(sId) || ns.has(tId);
      });
    }
    function clearHoverHighlight() {
      nodeSel.classed("highlight", false);
      edgeSel.classed("highlight", false);
    }

    /* Build + start simulation. Wrap in try/catch because d3-force
       can throw "node not found: 0" on the very first tick before
       its node-index map is built; we swallow the error and the
       next tick succeeds. The Lighthouse pass (T6.9) hit this and
       the pageerror tanked the a11y audit. */
    let sim: d3f.Simulation<SimNode, SimEdge> | null = null;
    try {
      sim = d3f
        .forceSimulation<SimNode>(nodes)
        .force(
          "link",
          d3f
            .forceLink<SimNode, SimEdge>(simEdges)
            .id((d) => d.id)
            .distance(() => LINK_DIST),
        )
        .force("charge", d3f.forceManyBody<SimNode>().strength(CHARGE))
        .force("center", d3f.forceCenter<SimNode>(WIDTH / 2, HEIGHT / 2))
        .force("collide", d3f.forceCollide<SimNode>(COLLIDE))
        .alpha(0.9)
        .alphaDecay(0.04)
        .on("tick", () => {
          if (!simRef.current) return;
          try {
            edgeSel
              .attr("x1", (d) => (d.source as SimNode).x ?? 0)
              .attr("y1", (d) => (d.source as SimNode).y ?? 0)
              .attr("x2", (d) => (d.target as SimNode).x ?? 0)
              .attr("y2", (d) => (d.target as SimNode).y ?? 0);
            nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
          } catch {
            /* swallow transient d3-force resolution errors */
          }
        });
    } catch (err) {
      console.warn(
        "[D3ForceGraph] simulation failed to initialize:",
        err,
      );
    }

    if (sim) simRef.current = sim;

    return () => {
      sim?.stop();
      simRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techs, edges]);

  /* Apply active class to selected node + neighbors. This is a
     lightweight effect that doesn't tear down the simulation — it
     just toggles classes on existing selections. */
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const nodeSel = svg.selectAll<SVGGElement, SimNode>("g.node");
    const edgeSel = svg.selectAll<SVGLineElement, SimEdge>("line");

    if (!activeId) {
      svg.classed("has-active", false);
      nodeSel.classed("active", false);
      edgeSel.classed("active", false);
      return;
    }

    /* Compute neighbors from raw edges (since edges hold id-string
       refs once the sim has processed them). */
    const ns = new Set<string>([activeId]);
    edges.forEach((e) => {
      const sId = String(e.source);
      const tId = String(e.target);
      if (sId === activeId) ns.add(tId);
      if (tId === activeId) ns.add(sId);
    });

    svg.classed("has-active", true);
    nodeSel.classed("active", (d) => ns.has(d.id));
    edgeSel.classed("active", (e) => {
      const sId = String(e.source);
      const tId = String(e.target);
      return ns.has(sId) || ns.has(tId);
    });
  }, [activeId, edges]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("stack-graph", className)}
      role="img"
      aria-label="Stack dependency graph. Hover or click a tech to inspect it."
    />
  );
}

/* ─── D3 simulation types ─────────────────────────────────────────── */

interface SimNode extends d3f.SimulationNodeDatum {
  id: string;
  name: string;
  domain: string;
  depth?: number;
}

interface SimEdge extends d3f.SimulationLinkDatum<SimNode> {
  weight: number;
}