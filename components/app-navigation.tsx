"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

type IconName = "home" | "search" | "bookmark" | "user";

const items: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/", label: "בית", icon: "home", exact: true },
  { href: "/recipes", label: "חיפוש", icon: "search" },
  { href: "/collections", label: "אוספים", icon: "bookmark" },
  { href: "/profile", label: "הפרופיל שלי", icon: "user" },
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

  if (name === "home") {
    return (
      <svg {...props}>
        <path d="m3.5 10 8.5-7 8.5 7v9.5H14v-6h-4v6H3.5Z" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  if (name === "bookmark") {
    return (
      <svg {...props}>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  // user (default)
  return (
    <svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-navigation" aria-label="ניווט ראשי">
      {/* Desktop sidebar brand */}
      <Link className="sidebar-brand" href="/">
        <span className="brand-flower" aria-hidden="true">*</span>
        <span>המטבח של קרן</span>
      </Link>

      {/* Nav items — renders as sidebar links on desktop, bottom bar on mobile */}
      <div className="navigation-items">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      </div>

      {/* Desktop sidebar: profile + logout */}
      <Link className="sidebar-profile" href="/profile">
        <span className="sidebar-avatar" aria-hidden="true">כ</span>
        <span>
          <strong>קרן כהן</strong>
          <small>הפרופיל שלי</small>
        </span>
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="sidebar-link"
          style={{ width: "100%", border: 0, background: "transparent", cursor: "pointer", textAlign: "right" }}
        >
          <svg
            width={21}
            height={21}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>יציאה</span>
        </button>
      </form>
    </nav>
  );
}
