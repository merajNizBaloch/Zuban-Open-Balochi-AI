import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ExperienceProvider } from "@/components/experience-provider";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

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
    icon: "/zuban-mark.png",
    apple: "/zuban-mark.png",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("zuban-theme");
                var l = localStorage.getItem("zuban-ui-language");
                if (t === "makran" || t === "light") document.documentElement.dataset.theme = t;
                if (l === "bal" || l === "en") {
                  document.documentElement.dataset.language = l;
                  document.documentElement.lang = l === "bal" ? "bal" : "en";
                  document.documentElement.dir = l === "bal" ? "rtl" : "ltr";
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ExperienceProvider>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <DisclaimerBanner />
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ExperienceProvider>
      </body>
    </html>
  );
}
