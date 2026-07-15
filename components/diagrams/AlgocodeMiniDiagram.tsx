/**
 * components/diagrams/AlgocodeMiniDiagram.tsx
 *
 * Phase 6 (T7): the landing's Projects section now reuses the full
 * `AlgocodeDiagram` (the same component the Hero + /work/algocode
 * already render) so all three project cards share the rich +
 * animated visual language of the Hero reference.
 *
 * The original standalone mini (4 nodes, no animation) is gone —
 * see git history if you need it back. The re-export keeps the
 * `LANDING_SLUGS.map(... DIAGRAMS ...)` mapping in Projects.tsx
 * working unchanged.
 */

export { AlgocodeDiagram as AlgocodeMiniDiagram } from "./AlgocodeDiagram";