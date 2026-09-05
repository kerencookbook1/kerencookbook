'use client'

import { useEffect, useState } from 'react'

type Theme = 'modern' | 'editorial'

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

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'modern' ? 'עבור לעיצוב כהה' : 'עבור לעיצוב בהיר'}
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom))',
        left: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        border: 'none',
        borderRadius: 999,
        minHeight: 44,
        padding: '0 14px 0 10px',
        background: theme === 'modern' ? '#0a0a0a' : '#f8f8f6',
        color: theme === 'modern' ? '#f8f8f6' : '#0a0a0a',
        fontSize: '.75rem',
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,.25)',
        transition: 'background .25s, color .25s',
        letterSpacing: '.02em',
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1 }}>
        {theme === 'modern' ? '◑' : '○'}
      </span>
      {theme === 'modern' ? 'עיצוב כהה' : 'עיצוב בהיר'}
    </button>
  )
}
