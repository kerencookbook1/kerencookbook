'use client'

import { useSearch } from './search-provider'

/** Compact icon-only button (used in sidebar top / bottom nav). */
export function SearchTrigger({ className, style, label }: { className?: string; style?: React.CSSProperties; label?: string }) {
  const { open } = useSearch()
  return (
    <button
      type="button"
      className={className}
      onClick={open}
      aria-label="חיפוש חכם"
      style={style}
    >
      <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      {label && <span>{label}</span>}
    </button>
  )
}

/**
 * Wide search bar-shaped trigger, used to replace the fake search-box
 * on the home page topbar. Looks like an input, opens the dialog on click.
 */
export function SearchBarTrigger({ placeholder = 'חיפוש מתכון, מרכיב, קטגוריה…' }: { placeholder?: string }) {
  const { open } = useSearch()
  return (
    <button
      type="button"
      onClick={open}
      className="search-box"
      aria-label="פתחי חיפוש חכם"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', minHeight: 46, border: '1px solid var(--line)',
        borderRadius: 12, padding: '0 14px', background: '#fffdfa',
        color: 'var(--muted)', fontFamily: 'inherit', fontSize: '.95rem',
        cursor: 'pointer', textAlign: 'right',
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span style={{ flex: 1 }}>{placeholder}</span>
      <span style={{
        fontSize: '.72rem', border: '1px solid var(--line)',
        borderRadius: 6, padding: '2px 6px', color: 'var(--muted)',
      }}>⌘K</span>
    </button>
  )
}
