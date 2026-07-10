// components/layout/index.ts — barrel for the chrome + layout shell.
// Phase 3+ pages can `import { InnerLayout, BackLink, InnerPageHeader, Navbar, Footer } from "@/components/layout"`.

export { Navbar } from "./Navbar";
export { Footer } from "./Footer";
export { BackLink } from "./BackLink";
export type { BackLinkProps } from "./BackLink";
export { InnerPageHeader } from "./InnerPageHeader";
export type { InnerPageHeaderProps } from "./InnerPageHeader";
export { InnerLayout } from "./InnerLayout";
export type { InnerLayoutProps } from "./InnerLayout";
