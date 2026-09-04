import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppNavigation } from "../components/app-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "המטבח של קרן",
  description: "ספר המתכונים האישי של קרן",
  applicationName: "המטבח של קרן",
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body><div className="app-frame"><AppNavigation /><div className="app-page">{children}</div></div></body>
    </html>
  );
}
