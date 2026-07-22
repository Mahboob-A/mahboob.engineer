/**
 * data/game/villains.ts
 *
 * Villain metadata registry for the in-game encounter system (T4.7).
 * Each villain represents a "learning area" — an honest reflection of
 * what the user is still leveling up on. The HP value is the user's
 * self-rated depth (0–100, where higher = more known). Updated by hand
 * when learning progresses; no auto-derivation, no localStorage.
 *
 * 3 villains map to 3 of the 4 STACK learning-domain techs (`go`,
 * `terraform`, `ebpf`; the 4th — `k8s` — is partially covered by
 * production work but still has remaining depth, so it doesn't get
 * its own villain).
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
   * Honest self-rating 0–100. Lower = more to learn. The HP bar
   * width in VillainOverlay = hp / 100 × barWidth. Updates by hand
   * when learning progresses.
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
    id: "terraform-titan",
    name: "Terraform Titan",
    title: "Lord of Infrastructure as Code",
    learningArea: "Terraform",
    hp: 50,
    whatIKnow: [
      "Core Terraform concepts. Providers, resources, state",
      "Writing basic HCL modules for AWS",
      "Already shipped Pulumi IaC (Python) in production",
    ],
    whatImLearning: [
      "Advanced module composition and remote state",
      "Terraform Cloud and team workflows",
      "Replacing manual Pulumi config with full Terraform parity",
    ],
    activeResources: [
      "Mastering AWS & DevOps — Poridhi Season 4",
      "Official Terraform AWS provider docs",
    ],
    encounterLine:
      "Monster Message: Half your infrastructure is already code. The other half still lives in someone's head. Finish the job.",
  },
  {
    id: "ebpf-phantom",
    name: "The eBPF Phantom",
    title: "Ghost of the Kernel Layer",
    learningArea: "eBPF / Kernel Networking",
    hp: 40,
    whatIKnow: [
      "Linux namespaces and cgroups, used in Algocode production",
      "Network namespaces, veth pairs, bridges from Poridhi specialisation",
      "eBPF conceptual understanding: What it hooks into and why",
    ],
    whatImLearning: [
      "Writing actual eBPF programs (XDP, TC hooks)",
      "Cilium CNI internals",
      "Kernel tracing with bpftrace",
    ],
    activeResources: [
      "Linux networking deep-dive — Poridhi",
      "Brendan Gregg's BPF Performance Tools",
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
