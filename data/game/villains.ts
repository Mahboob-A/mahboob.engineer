/**
 * data/game/villains.ts
 *
 * Villain metadata registry for the in-game encounter system (T4.7).
 * Each villain represents an area the user is still deepening. The HP
 * value is a game stat: lower = weaker encounter = more headroom left.
 * Updated by hand as progress happens; no auto-derivation, no
 * localStorage.
 *
 * 2 villains map to 2 areas of ongoing growth: `go` (the language
 * behind Safebox) and `linux` (networking and systems internals).
 *
 * Consumed by:
 *   - game/scenes/overlays/VillainOverlay.tsx (encounter card).
 *   - game/entities/Villain.ts (procedural sprite color).
 */

import type { VillainId } from "@/game/types";

export interface VillainData {
  id: VillainId;
  /** Display name (e.g. "The Gopher King"). */
  name: string;
  /** Subtitle shown under the name (e.g. "Warden of Concurrency"). */
  title: string;
  /** Short label for the area being learned (e.g. "Go Language"). */
  learningArea: string;
  /**
   * Hit points. Lower = weaker encounter. Tracks how far along the
   * topic is. The HP bar width in VillainOverlay = hp / 100 × barWidth.
   */
  hp: number;
  /** Bullet list — stuff already comfortable with. */
  whatIKnow: string[];
  /** Bullet list — current focus areas. */
  whatImLearning: string[];
  /** Current training resources (courses / books / docs). */
  activeResources: string[];
  /** The villain's opening line when the player encounters it. */
  encounterLine: string;
}

export const VILLAINS: VillainData[] = [
  {
    id: "gopher-king",
    name: "The Gopher King",
    title: "Warden of Concurrency",
    learningArea: "Go Language",
    hp: 30,
    whatIKnow: [
      "Go syntax, types, and standard library basics",
      "Goroutines and channels conceptually",
      "Go modules and project structure",
    ],
    whatImLearning: [
      "Writing idiomatic Go. Interfaces, composition over inheritance",
      "Building container runtime internals in Go",
      "gRPC services and protobuf in Go",
    ],
    activeResources: [
      "Building Systems with Go, by Poridhi",
      "Container runtime internals series",
    ],
    encounterLine:
      "Monster Message: You approach the Go territories. You know the basics, but concurrency at scale? Come back stronger.",
  },
  {
    id: "linux-networker",
    name: "The Network Hydra",
    title: "Weaver of Namespaces",
    learningArea: "Linux Networking",
    hp: 40,
    whatIKnow: [
      "Linux namespaces and cgroups, used in Algocode production",
      "Network namespaces, veth pairs, bridges from Poridhi specialisation",
      "The Linux Networking series on Medium, which is the public version of this muscle",
    ],
    whatImLearning: [
      "Kernel packet filtering and traffic control hooks",
      "Cilium CNI internals",
      "Kernel tracing and observability tooling",
    ],
    activeResources: [
      "Linux networking deep-dive — Poridhi",
      "Brendan Gregg's Systems Performance",
    ],
    encounterLine:
      "Monster Message: You've touched the kernel surface. Namespaces, cgroups. Good. But the real power is deeper. Much deeper.",
  },
];

/** Map by id for O(1) lookup from VillainOverlay. */
export const VILLAIN_BY_ID: Readonly<Record<VillainId, VillainData>> =
  Object.freeze(
    VILLAINS.reduce<Record<VillainId, VillainData>>((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {} as Record<VillainId, VillainData>),
  );
