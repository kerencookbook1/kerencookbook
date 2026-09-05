import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppNavigation } from "../components/app-navigation";
import { ThemeToggle } from "../components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "המטבח של קרן",
  description: "ספר המתכונים האישי של קרן",
  applicationName: "המטבח של קרן",
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Restore saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme')||'modern';document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Playfair+Display:wght@700;900&family=Space+Grotesk:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-frame">
          <AppNavigation />
          <div className="app-page">{children}</div>
        </div>
        <ThemeToggle />
      </body>
    </html>
  );
}
