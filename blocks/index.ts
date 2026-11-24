/**
 * Parabola blocks: full-width page sections for the page builder, built from
 * components and primitives. Their own import path (not the main barrel), so
 * apps that don't build pages never load them:
 *   import { … } from "@beltechi/parabola/blocks";
 * Props are plain data (see docs/reference.md's block contract).
 */
export { DsNewsletterBlock, type DsNewsletterBlockProps } from "./newsletter";
