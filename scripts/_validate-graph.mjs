#!/usr/bin/env node
/**
 * scripts/_validate-graph.mjs
 *
 * One-off: validate the landing SkillGraph data.
 *   1. Every `rel` id and every EDGES endpoint resolves to a node.
 *   2. `rel` and EDGES stay in sync (each edge is reflected in both
 *      nodes' `rel` lists, so hover highlights match the drawn lines).
 *   3. No two node circles overlap.
 *   4. Every node fits inside the viewBox.
 *
 * Usage: node scripts/_validate-graph.mjs
 */

import { readFileSync } from "node:fs";

const src = readFileSync("components/sections/SkillGraph.tsx", "utf8");

const VIEWBOX = { w: 1180, h: 640 };

// Pull the NODES array out of the TS source.
const nodesSrc = src.slice(
  src.indexOf("const NODES: SkillNode[] = ["),
  src.indexOf("/** Edges: `[from, to]` lines."),
);

const nodes = [];
const nodeRe =
  /\{\s*id: "([a-z0-9-]+)",\s*(?:label: "([^"]*)",\s*(?:sub: "([^"]*)",\s*)?)?cx: (\d+),\s*cy: (\d+),\s*r: (\d+),\s*domain: "([a-z]+)",\s*rel: \[([^\]]*)\],?\s*\}/g;
let m;
while ((m = nodeRe.exec(nodesSrc)) !== null) {
  const rel = m[8]
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
  nodes.push({
    id: m[1],
    label: m[2] ?? m[1],
    sub: m[3],
    cx: +m[4],
    cy: +m[5],
    r: +m[6],
    domain: m[7],
    rel,
  });
}

const edgesSrc = src.slice(
  src.indexOf("/** Edges: `[from, to]` lines."),
  src.indexOf("/* ====", src.indexOf("/** Edges: `[from, to]` lines.")),
);
const edges = [...edgesSrc.matchAll(/\["([a-z0-9-]+)", "([a-z0-9-]+)"\]/g)].map(
  (x) => [x[1], x[2]],
);

let errors = 0;
const err = (msg) => {
  console.log("  ✗ " + msg);
  errors++;
};

console.log(`parsed ${nodes.length} nodes, ${edges.length} edges\n`);

const byId = new Map(nodes.map((n) => [n.id, n]));

console.log("1. id resolution");
for (const n of nodes) {
  for (const r of n.rel) {
    if (!byId.has(r)) err(`${n.id}.rel -> unknown node "${r}"`);
  }
}
for (const [a, b] of edges) {
  if (!byId.has(a)) err(`edge endpoint unknown "${a}"`);
  if (!byId.has(b)) err(`edge endpoint unknown "${b}"`);
}

console.log("2. rel <-> EDGES sync");
for (const [a, b] of edges) {
  if (!byId.get(a)?.rel.includes(b)) err(`edge ${a}-${b} missing from ${a}.rel`);
  if (!byId.get(b)?.rel.includes(a)) err(`edge ${a}-${b} missing from ${b}.rel`);
}
for (const n of nodes) {
  for (const r of n.rel) {
    if (!byId.has(r)) continue;
    const pair = [n.id, r].sort();
    const found = edges.some(
      ([a, b]) => [a, b].sort()[0] === pair[0] && [a, b].sort()[1] === pair[1],
    );
    if (!found) err(`${n.id}.rel lists "${r}" but no edge drawn between them`);
  }
}

console.log("3. node overlap");
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];
    const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
    const min = a.r + b.r;
    if (d < min) {
      err(
        `overlap: ${a.id} & ${b.id} — centres ${d.toFixed(1)}px apart, need ${min}px`,
      );
    }
  }
}

console.log("4. inside viewBox");
for (const n of nodes) {
  if (n.cx - n.r < 0 || n.cx + n.r > VIEWBOX.w) {
    err(`${n.id} overflows horizontally (cx=${n.cx}, r=${n.r})`);
  }
  if (n.cy - n.r < 0 || n.cy + n.r > VIEWBOX.h) {
    err(`${n.id} overflows vertically (cy=${n.cy}, r=${n.r})`);
  }
}

console.log(`\n${errors === 0 ? "✓ ALL CHECKS PASSED" : `✗ ${errors} problem(s)`}`);
process.exit(errors === 0 ? 0 : 1);
