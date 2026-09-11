'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { AISLES, aisleIcon, aisleOrder, guessAisle, type Aisle } from '@/lib/aisles'
import {
  addShoppingItem,
  clearCheckedShoppingItems,
  deleteShoppingItem,
  toggleShoppingItem,
} from '@/lib/actions/shopping'

let cachedSuggestions: string[] | null = null

type Item = {
  id: string
  name: string
  amount: string | null
  unit: string | null
  aisle: string | null
  is_checked: boolean
  source_recipe_id: string | null
  created_at: string
}

export function ShoppingList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [busy, startTransition] = useTransition()
  const [draft, setDraft] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>(cachedSuggestions ?? [])

  useEffect(() => {
    if (cachedSuggestions) return
    let alive = true
    fetch('/api/ingredients/suggestions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.suggestions) return
        cachedSuggestions = data.suggestions
        setSuggestions(data.suggestions)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const grouped = useMemo(() => {
    const byAisle = new Map<string, Item[]>()
    for (const it of items) {
      const key = it.aisle ?? 'אחר'
      const arr = byAisle.get(key) ?? []
      arr.push(it)
      byAisle.set(key, arr)
    }
    return Array.from(byAisle.entries())
      .sort(([a], [b]) => aisleOrder(a) - aisleOrder(b))
      .map(([aisle, list]) => ({
        aisle,
        items: list.sort((a, b) => Number(a.is_checked) - Number(b.is_checked) || a.name.localeCompare(b.name, 'he')),
      }))
  }, [items])

  const checkedCount = items.filter((i) => i.is_checked).length

  function handleToggle(id: string, next: boolean) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, is_checked: next } : i)))  // optimistic
    startTransition(async () => {
      const res = await toggleShoppingItem(id, next)
      if (!res.ok) setItems((arr) => arr.map((i) => (i.id === id ? { ...i, is_checked: !next } : i)))
    })
  }

  function handleDelete(id: string) {
    const backup = items
    setItems((arr) => arr.filter((i) => i.id !== id))  // optimistic
    startTransition(async () => {
      const res = await deleteShoppingItem(id)
      if (!res.ok) setItems(backup)
    })
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = draft.trim()
    if (!name) return
    const aisle = guessAisle(name)
    const tempId = `temp-${Date.now()}`
    const optimistic: Item = {
      id: tempId, name, amount: null, unit: null, aisle,
      is_checked: false, source_recipe_id: null, created_at: new Date().toISOString(),
    }
    setItems((arr) => [...arr, optimistic])
    setDraft('')
    startTransition(async () => {
      const res = await addShoppingItem({ name, aisle })
      if (!res.ok) setItems((arr) => arr.filter((i) => i.id !== tempId))
      // NOTE: real id will appear on next revalidation; optimistic row keeps its temp id for this session
    })
  }

  function handleClearChecked() {
    if (!confirm(`למחוק ${checkedCount} פריטים מסומנים?`)) return
    const backup = items
    setItems((arr) => arr.filter((i) => !i.is_checked))  // optimistic
    startTransition(async () => {
      const res = await clearCheckedShoppingItems()
      if (!res.ok) setItems(backup)
    })
  }

  return (
    <div style={{ display: 'grid', gap: 20, marginTop: 8 }}>
      {/* Add item */}
      <datalist id="shopping-suggestions">
        {suggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <form onSubmit={handleAdd} className="upload-panel" style={{ padding: 16, display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="הוסיפי פריט… (התחל להקליד — נציע השלמות)"
          list="shopping-suggestions"
          autoComplete="off"
          style={{
            flex: 1,
            minHeight: 46,
            border: '1px solid #cfbfae',
            borderRadius: 10,
            padding: '0 14px',
            background: '#fffdfa',
            fontSize: '1rem',
          }}
        />
        <button type="submit" className="primary-button" disabled={!draft.trim() || busy} style={{ minWidth: 100 }}>
          הוסיפי
        </button>
      </form>

      {/* Summary + clear */}
      {items.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {items.length} פריטים · {checkedCount} סומנו
          </p>
          {checkedCount > 0 && (
            <button type="button" className="outline-button" onClick={handleClearChecked} disabled={busy}>
              נקי {checkedCount} פריטים שסומנו
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>הרשימה שלך ריקה. הוסיפי פריט למעלה, או פתחי מתכון ולחצי &quot;הוסף לרשימת קניות&quot;.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {grouped.map(({ aisle, items: aisleItems }) => {
            const done = aisleItems.every((i) => i.is_checked)
            return (
              <section key={aisle} className="upload-panel" style={{ padding: 16, opacity: done ? 0.65 : 1 }}>
                <h2 style={{ margin: '0 0 12px', fontFamily: 'Georgia, serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden="true">{aisleIcon(aisle)}</span>
                  {aisle}
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)', fontWeight: 400, fontFamily: 'inherit' }}>
                    ({aisleItems.length})
                  </span>
                </h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
                  {aisleItems.map((item) => (
                    <li key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 8px', borderBottom: '1px solid var(--line)',
                    }}>
                      <input
                        type="checkbox"
                        checked={item.is_checked}
                        onChange={(e) => handleToggle(item.id, e.target.checked)}
                        style={{ width: 22, height: 22, cursor: 'pointer', accentColor: 'var(--terracotta)' }}
                        aria-label={`סמני ${item.name} כנרכש`}
                      />
                      <span style={{
                        flex: 1,
                        textDecoration: item.is_checked ? 'line-through' : 'none',
                        color: item.is_checked ? 'var(--muted)' : 'var(--ink)',
                      }}>
                        {item.amount && <strong style={{ color: 'var(--terracotta-dark)' }}>{item.amount}</strong>}
                        {item.unit && <span style={{ color: 'var(--muted)' }}> {item.unit}</span>}
                        {' '}{item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`הסירי ${item.name}`}
                        style={{
                          border: 0, background: 'transparent', color: 'var(--muted)',
                          cursor: 'pointer', padding: 4, fontSize: '1rem',
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* Aisle legend */}
      {items.length > 0 && (
        <details style={{ marginTop: 20 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '.85rem' }}>
            כל המעברים באפליקציה
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {AISLES.map((a) => (
              <span key={a.id} className="recipe-tag" style={{ background: '#f4efe2', color: '#4a3d30' }}>
                {a.icon} {a.id}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
