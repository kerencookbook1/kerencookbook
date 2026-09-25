import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppNavigation } from "../components/app-navigation";
import { SearchProvider } from "./_components/search-provider";
import { ThemeInit } from "./_components/theme-init";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "המטבח של קרן",
  description: "ספר המתכונים האישי של קרן",
  applicationName: "המטבח של קרן",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="he" dir="rtl" data-theme="modern" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&family=Space+Grotesk:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeInit />
        <SearchProvider>
          <div className="app-frame">
            <AppNavigation />
            <div className="app-page">
              {children}
              <div className="page-watermark" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-watermark.png" alt="" />
              </div>
            </div>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
