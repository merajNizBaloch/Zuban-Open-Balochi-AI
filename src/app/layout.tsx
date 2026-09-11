import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Zubán — Balochi Language Technology",
    template: "%s · Zubán",
  },
  description:
    "Open Balochi language technology for chat, translation, dictionary, speech, OCR, datasets and research.",
  applicationName: "Zubán",
  keywords: ["Balochi", "Baluchi", "Balochi AI", "Balochi dictionary", "Balochi translation", "Balochi speech"],
  icons: {
    icon: "/zuban-mark.webp",
    apple: "/zuban-mark.webp",
  },
  openGraph: {
    title: "Zubán — Balochi Language Technology",
    description: "Open tools, data and research for the Balochi language.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
