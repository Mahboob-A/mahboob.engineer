/**
 * game/types.ts
 *
 * Cross-cutting type definitions used across Phaser scenes, entities,
 * and the React bridge. Kept in one file so the Phaser world and the
 * React side agree on shape.
 *
 * Source: master §5.4 + data/projects.ts (every project's
 * game_building + game_district fits this vocabulary).
 */

/* The slug is the project's `slug` field from data/projects.ts.
   We accept any string at the type level so the bridge can carry
   new slugs without a registry update. The consumer resolves to
   PROJECTS_BY_SLUG[slug]?.name and falls back to the raw slug. */
export type ProjectSlug = string;

/* Three villains — names match STACK learning-domain techs in
   data/stack.ts. Consonant with master §5.4 villain system. */
export type VillainId = "gopher-king" | "terraform-titan" | "ebpf-phantom";

/* The 3 special buildings from master §5.4 (Backend Diaries HQ,
   Skills Academy, Contact Bureau) use the "special" type. They
   open specific React routes (`/writing`, `/stack`, `/contact`)
   rather than project case-study overlays. */
export type OverlayType = "project" | "villain" | "special";

/** Payload carried on every `OPEN_OVERLAY` bridge event. */
export interface OverlayPayload {
  /** Project slug, villain id, or special-building id (per overlayType). */
  slug: string;
  /** Which overlay class to render. */
  overlayType: OverlayType;
  /** Optional human-readable title for the overlay header. */
  title?: string;
}