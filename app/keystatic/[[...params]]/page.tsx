/**
 * app/keystatic/[[...params]]/page.tsx
 *
 * Keystatic admin mount. Catch-all dynamic segment so the admin
 * serves all internal routes (collection browser, single-entry
 * editor, dashboard, etc.).
 *
 * Keystatic 5.x integration: `makePage(config)` returns a JSX
 * component that owns the entire admin UI. The component is a
 * Client Component (uses browser APIs); we mark the file 'use client'
 * so Turbopack/Next include Keystatic's runtime in the client bundle.
 *
 * Note: this means the admin renders inside the root layout's
 * <Navbar/> + <main> + <Footer/> shell. The admin UI is meant to
 * run as its own SPA; in production it may benefit from a dedicated
 * route group that swaps out the root layout. For now, the layout
 * shell is light enough that the admin still works.
 */
"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";

export default makePage(config);