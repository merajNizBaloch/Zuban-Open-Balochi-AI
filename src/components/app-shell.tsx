"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standaloneDocs = pathname === "/docs/editor";

  if (standaloneDocs) {
    return <main id="main-content" className="standalone-docs-main">{children}</main>;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <DisclaimerBanner />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
