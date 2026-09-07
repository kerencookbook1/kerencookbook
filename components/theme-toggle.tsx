'use client'

import { useEffect, useState } from 'react'

type Theme = 'modern' | 'editorial'

/**
 * Sidebar-styled theme toggle. Placed inside AppNavigation's bottom
 * area (above the profile link). Only visible on desktop where the
 * sidebar is shown; on mobile it collapses into the icon-only mode
 * used by the bottom nav.
 */
export function ThemeToggle() {
  const [{ mounted, theme }, setState] = useState<{ mounted: boolean; theme: Theme }>({
    mounted: false,
    theme: 'modern',
  })

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'modern'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ mounted: true, theme: saved })
  }, [])

  function toggle() {
    const next: Theme = theme === 'modern' ? 'editorial' : 'modern'
    setState(prev => ({ ...prev, theme: next }))
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const label = theme === 'modern' ? 'עיצוב כהה' : 'עיצוב בהיר'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'modern' ? 'עבור לעיצוב כהה' : 'עבור לעיצוב בהיר'}
      className="sidebar-link theme-toggle-link"
      suppressHydrationWarning
    >
      <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {mounted && theme === 'modern' ? (
          // Moon icon — click to go dark
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        ) : (
          // Sun icon — click to go light
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m4.93 19.07 1.41-1.41" />
            <path d="m17.66 6.34 1.41-1.41" />
          </>
        )}
      </svg>
      <span suppressHydrationWarning>{mounted ? label : 'עיצוב כהה'}</span>
    </button>
  )
}
