'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type SearchRecipe = {
  id: string
  title: string
  category: string | null
  image_url: string | null
  ingredientNames: string[]
  prep_time: number | null
  cook_time: number | null
}

type MatchedRecipe = SearchRecipe & { score: number; matchedIngredients: string[] }

function normalize(s: string): string {
  return s.toLowerCase().replace(/[.,;:!?()\-\/]/g, ' ').replace(/\s+/g, ' ').trim()
}

function scoreMatch(query: string, recipe: SearchRecipe): { score: number; matchedIngredients: string[] } {
  const q = normalize(query)
  if (!q) return { score: 0, matchedIngredients: [] }
  const terms = q.split(' ').filter((t) => t.length >= 1)

  const title = normalize(recipe.title)
  const category = recipe.category ? normalize(recipe.category) : ''
  const ingredients = recipe.ingredientNames.map(normalize)

  let score = 0
  const matched: string[] = []

  for (const term of terms) {
    if (title === term) score += 20
    else if (title.startsWith(term)) score += 12
    else if (title.includes(term)) score += 8

    if (category && category.includes(term)) score += 4

    for (const ing of ingredients) {
      if (ing.includes(term)) {
        score += 2
        if (!matched.includes(ing)) matched.push(ing)
      }
    }
  }
  return { score, matchedIngredients: matched.slice(0, 3) }
}

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<SearchRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const loadedRef = useRef(false)

  // Fetch recipes once on first open
  useEffect(() => {
    if (!isOpen || loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    fetch('/api/my-recipes')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setRecipes(data.recipes ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [isOpen])

  // Reset query + focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setHighlightIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [isOpen])

  // Keyboard: Esc closes; arrows navigate results; Enter opens
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx((i) => i + 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx((i) => Math.max(0, i - 1)) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const results: MatchedRecipe[] = useMemo(() => {
    if (!query.trim()) {
      // No query: show most recent recipes as suggestions
      return recipes.slice(0, 6).map((r) => ({ ...r, score: 0, matchedIngredients: [] }))
    }
    return recipes
      .map((r) => {
        const { score, matchedIngredients } = scoreMatch(query, r)
        return { ...r, score, matchedIngredients }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
  }, [query, recipes])

  useEffect(() => {
    if (highlightIdx >= results.length) setHighlightIdx(Math.max(0, results.length - 1))
  }, [highlightIdx, results.length])

  if (!isOpen) return null

  const activeResult = results[highlightIdx]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="חיפוש מתכונים"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(20, 15, 8, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(40px, 8vh, 80px) 16px 16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, 100%)',
          maxHeight: '80vh',
          display: 'grid', gridTemplateRows: 'auto 1fr auto',
          background: 'var(--surface)', borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0,0,0,.35)',
          overflow: 'hidden',
        }}
      >
        {/* Search input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 20px', borderBottom: '1px solid var(--line)',
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlightIdx(0) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeResult) {
                e.preventDefault()
                window.location.href = `/recipes/${activeResult.id}`
              }
            }}
            placeholder="חפשי מתכון, מרכיב, קטגוריה…"
            aria-label="חיפוש"
            style={{
              flex: 1, border: 0, outline: 'none', background: 'transparent',
              fontSize: '1.1rem', fontFamily: 'inherit', color: 'var(--ink)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור חיפוש"
            style={{
              border: 0,
              background: 'var(--terracotta-dark, #4d7c0f)',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px 14px',
              fontSize: '.85rem',
              fontWeight: 700,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 36,
              boxShadow: '0 1px 2px rgba(0,0,0,.08)',
            }}
          >
            <span aria-hidden style={{ fontSize: '1rem' }}>✕</span>
            <span>סגירה</span>
          </button>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto' }}>
          {loading && <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>טוען מתכונים…</p>}
          {error && <p style={{ padding: 24, textAlign: 'center', color: '#8a1c14' }}>שגיאה: {error}</p>}
          {!loading && !error && recipes.length === 0 && (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
              עדיין אין מתכונים לחפש. <Link href="/import" onClick={onClose} className="text-button">הוסיפי מתכון</Link>
            </p>
          )}
          {!loading && !error && results.length === 0 && query.trim() && (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
              לא נמצאו מתכונים עבור &quot;{query}&quot;
            </p>
          )}
          {results.length > 0 && (
            <>
              {!query.trim() && (
                <p style={{ padding: '10px 20px 4px', color: 'var(--muted)', fontSize: '.82rem', fontWeight: 700 }}>
                  אחרונים
                </p>
              )}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {results.map((r, i) => {
                  const isActive = i === highlightIdx
                  const totalMinutes = (r.prep_time ?? 0) + (r.cook_time ?? 0)
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/recipes/${r.id}`}
                        onClick={onClose}
                        onMouseEnter={() => setHighlightIdx(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 20px',
                          borderBottom: '1px solid var(--line)',
                          background: isActive ? '#fff8ee' : 'transparent',
                          textDecoration: 'none', color: 'inherit',
                          transition: 'background 120ms',
                        }}
                      >
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e8d5c0', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 800, color: 'var(--ink)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.title}
                          </p>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>
                            {r.category && <span>{r.category}</span>}
                            {totalMinutes > 0 && <span>· {totalMinutes} דק׳</span>}
                            {r.matchedIngredients.length > 0 && (
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                · תואם: {r.matchedIngredients.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end',
          padding: '10px 20px', borderTop: '1px solid var(--line)',
          background: '#f4efe2', color: 'var(--muted)', fontSize: '.78rem',
        }}>
          <span>↑↓ ניווט</span>
          <span>↵ פתח</span>
          <span>Esc סגור</span>
        </div>
      </div>
    </div>
  )
}
