"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "./theme-toggle";

type IconName = "home" | "book" | "add" | "chef" | "cart" | "calendar" | "user";

type NavItem = {
  href: string;
  label: string;
  mobileLabel?: string;  // shorter label for bottom nav slots
  icon: IconName;
  exact?: boolean;
  mobile?: boolean;   // include in bottom nav
  desktop?: boolean;  // include in sidebar
  section?: string;   // grouping header for sidebar
  highlight?: boolean; // primary CTA styling
};

const items: NavItem[] = [
  { href: "/",         label: "בית",          icon: "home",     exact: true, mobile: true,  desktop: true },
  // Recipes
  { href: "/recipes",  label: "המתכונים שלי", mobileLabel: "מתכונים", icon: "book",     mobile: true,  desktop: true, section: "מתכונים" },
  { href: "/import",   label: "הוספת מתכון",  mobileLabel: "הוספה",   icon: "add",      mobile: true,  desktop: true, highlight: true },
  // Tools
  { href: "/pantry",   label: "מה יש לי בבית?", icon: "chef",   mobile: false, desktop: true, section: "כלים" },
  { href: "/shopping", label: "רשימת קניות",  mobileLabel: "קניות",   icon: "cart",     mobile: true,  desktop: true },
  { href: "/meals",    label: "תכנון ארוחות", icon: "calendar", mobile: false, desktop: true },
];

// Rendered separately at the bottom of the desktop sidebar (above logout).
// Kept in the mobile bottom nav via its own entry.
const bottomItems: NavItem[] = [
  { href: "/profile", label: "הפרופיל שלי", mobileLabel: "פרופיל", icon: "user", mobile: true, desktop: true },
];

function Icon({ name }: { name: IconName }) {
  const props = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return <svg {...props}><path d="m3.5 10 8.5-7 8.5 7v9.5H14v-6h-4v6H3.5Z" /></svg>;
    case "book":
      return <svg {...props}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2Z" /><path d="M4 5v14" /><path d="M8 7h7" /><path d="M8 11h7" /></svg>;
    case "add":
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>;
    case "chef":
      return <svg {...props}><path d="M6 13a4 4 0 0 1-4-4 4 4 0 0 1 4-4 5 5 0 0 1 5-3 5 5 0 0 1 5 3 4 4 0 0 1 4 4 4 4 0 0 1-4 4" /><path d="M6 13v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" /></svg>;
    case "cart":
      return <svg {...props}><circle cx="9" cy="21" r="1.4" /><circle cx="18" cy="21" r="1.4" /><path d="M2 3h3l3 12h11l2-9H7" /></svg>;
    case "calendar":
      return <svg {...props}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 10h18" /><path d="M8 3v3" /><path d="M16 3v3" /></svg>;
    case "user":
      return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
  }
}

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppNavigation() {
  const pathname = usePathname();
  const mobileItems = [...items, ...bottomItems].filter((i) => i.mobile !== false);
  const desktopItems = items.filter((i) => i.desktop !== false);
  const desktopBottomItems = bottomItems.filter((i) => i.desktop !== false);

  // Group desktop items by section for the sidebar
  const sections: { title: string | null; items: NavItem[] }[] = []
  for (const item of desktopItems) {
    if (item.section) {
      sections.push({ title: item.section, items: [item] })
    } else if (sections.length > 0) {
      sections[sections.length - 1].items.push(item)
    } else {
      sections.push({ title: null, items: [item] })
    }
  }

  return (
    <nav className="app-navigation" aria-label="ניווט ראשי">
      {/* Desktop sidebar brand */}
      <Link className="sidebar-brand" href="/">
        <span className="brand-flower" aria-hidden="true">*</span>
        <span>המטבח של קרן</span>
      </Link>

      {/* Desktop sidebar — grouped sections */}
      <div className="navigation-sections">
        {sections.map((section, si) => (
          <div key={si} className="nav-section">
            {section.title && <p className="nav-section-title">{section.title}</p>}
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${active ? " is-active" : ""}${item.highlight ? " is-add" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile bottom bar — only mobile items, no sections */}
      <div className="navigation-items">
        {mobileItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${active ? " is-active" : ""}${item.highlight ? " is-add" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.mobileLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop sidebar: theme toggle + profile + logout at bottom */}
      <div className="sidebar-bottom">
        <ThemeToggle />
        {desktopBottomItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <form action={logout} className="sidebar-logout">
          <button type="submit" className="sidebar-link">
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>יציאה</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
