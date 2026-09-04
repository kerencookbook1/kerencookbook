"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

type IconName = "book" | "calendar" | "camera" | "home" | "plus" | "user";

const items = [
  { href: "/", label: "בית", icon: "home" as const, exact: true },
  { href: "/recipes", label: "המתכונים שלי", icon: "book" as const },
  { href: "/recipes/new", label: "מתכון חדש", icon: "plus" as const },
  { href: "/import/photo", label: "צילום מתכון", icon: "camera" as const },
  { href: "/meal-plans", label: "תכנון ארוחות", icon: "calendar" as const },
  { href: "/profile", label: "הפרופיל שלי", icon: "user" as const },
];

function Icon({ name }: { name: IconName }) {
  const props = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...props}><path d="m3.5 10 8.5-7 8.5 7v9.5H14v-6h-4v6H3.5Z" /></svg>;
  if (name === "book") return <svg {...props}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22Z" /><path d="M5 4.5V22M8.5 6h7" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "camera") return <svg {...props}><path d="M4 7.5h3l1.2-2h7.6l1.2 2h3v11H4Z" /><circle cx="12" cy="13" r="3.4" /></svg>;
  if (name === "calendar") return <svg {...props}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
  return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
}

export function AppNavigation() {
  const pathname = usePathname();
  return <nav className="app-navigation" aria-label="ניווט ראשי">
    <Link className="sidebar-brand" href="/"><span className="brand-flower" aria-hidden="true">*</span><span>המטבח של קרן</span></Link>
    <div className="navigation-items">{items.map((item) => {
      const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
      return <Link className={`sidebar-link ${active ? "is-active" : ""} ${item.icon === "plus" ? "is-add" : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>;
    })}</div>
    <Link className="sidebar-profile" href="/profile"><span className="sidebar-avatar" aria-hidden="true">כ</span><span><strong>קרן כהן</strong><small>הפרופיל שלי</small></span></Link>
    <form action={logout}>
      <button type="submit" className="sidebar-link" style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'right' }}>
        <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>יציאה</span>
      </button>
    </form>
  </nav>;
}
