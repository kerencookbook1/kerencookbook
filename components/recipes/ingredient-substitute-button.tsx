'use client'

import { useEffect, useRef, useState } from 'react'

type Substitute = { name: string; ratio: string; note?: string }

type Props = {
  ingredientName: string
  recipeTitle?: string
  otherIngredients?: string[]
}

/**
 * Small "חלופה?" chip next to every ingredient. On click, POSTs the
 * ingredient (+ light context) to /api/ingredient-substitute and pops a
 * card of 2-3 AI-suggested substitutes. Results are cached per ingredient
 * for the lifetime of the component so re-opening the popover is instant.
 */
export function IngredientSubstituteButton({
  ingredientName,
  recipeTitle,
  otherIngredients,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subs, setSubs] = useState<Substitute[] | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  async function toggle() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    // Skip fetching if we already have a cached result
    if (subs || loading) return

    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/ingredient-substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient: ingredientName,
          recipeTitle,
          otherIngredients,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? `שגיאה ${r.status}`)
      setSubs(Array.isArray(data.substitutes) ? data.substitutes : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`הצע חלופה ל־${ingredientName}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          background: open ? '#4d7c0f' : '#EAF1E3',
          color: open ? '#fff' : '#3f6212',
          border: '1px solid #4d7c0f',
          borderRadius: 999,
          fontSize: '.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all .15s ease',
        }}
      >
        <span aria-hidden>🔄</span>
        <span>חלופה?</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`חלופות ל־${ingredientName}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineStart: 0,
            zIndex: 40,
            minWidth: 280,
            maxWidth: 360,
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            boxShadow: '0 12px 32px -8px rgba(0,0,0,.18), 0 4px 12px -4px rgba(0,0,0,.08)',
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: '.75rem',
              fontWeight: 700,
              color: '#525252',
              letterSpacing: '.04em',
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: '1px solid #f0e5d0',
            }}
          >
            חלופות ל־<span style={{ color: '#4d7c0f' }}>{ingredientName}</span>
          </div>

          {loading && (
            <div
              role="status"
              style={{ padding: '10px 4px', fontSize: '.85rem', color: '#525252', textAlign: 'center' }}
            >
              🤖 חושב על חלופות…
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{ padding: '10px 4px', fontSize: '.85rem', color: '#8a1c14', textAlign: 'center' }}
            >
              {error}
            </div>
          )}

          {!loading && !error && subs && subs.length === 0 && (
            <div style={{ padding: '10px 4px', fontSize: '.85rem', color: '#525252', textAlign: 'center' }}>
              לא נמצאה חלופה טובה למרכיב הזה.
            </div>
          )}

          {!loading && !error && subs && subs.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {subs.map((s, i) => (
                <li
                  key={i}
                  style={{
                    padding: '8px 10px',
                    background: '#fffdf6',
                    border: '1px solid #f0e5d0',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '.95rem', fontWeight: 700, color: '#171717' }}>{s.name}</span>
                    <span
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: '#4d7c0f',
                        background: '#EAF1E3',
                        padding: '2px 8px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.ratio}
                    </span>
                  </div>
                  {s.note && (
                    <div style={{ marginTop: 4, fontSize: '.78rem', color: '#525252', lineHeight: 1.45 }}>
                      {s.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
