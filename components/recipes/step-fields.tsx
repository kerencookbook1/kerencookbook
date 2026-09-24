'use client'

import { useState } from 'react'
import type { StepItem } from '@/lib/validations/recipes'

type Props = {
  initial?: StepItem[]
  onChange: (items: StepItem[]) => void
}

export function StepFields({ initial = [], onChange }: Props) {
  const [items, setItems] = useState<StepItem[]>(
    initial.length > 0 ? initial : [{ title: '', body: '', durationSeconds: null }]
  )
  const [showTitles, setShowTitles] = useState(() =>
    (initial ?? []).some((s) => s.title && s.title.trim())
  )

  function update(index: number, field: keyof StepItem, value: string | number | null) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setItems(next)
    onChange(next)
  }

  function add() {
    const next = [...items, { title: '', body: '', durationSeconds: null }]
    setItems(next)
    onChange(next)
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    onChange(next)
  }

  return (
    <div className="step-fields">
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.85rem', cursor: 'pointer', color: 'var(--muted)' }}>
          <input
            type="checkbox"
            checked={showTitles}
            onChange={(e) => setShowTitles(e.target.checked)}
          />
          הצג כותרות סעיף לשלבים
        </label>
      </div>

      {items.map((item, i) => (
        <div key={i} className="step-row">
          {showTitles && (
            <input
              type="text"
              placeholder={`כותרת סעיף (למשל: הכנת הרוטב) — אופציונלי`}
              value={item.title ?? ''}
              onChange={(e) => update(i, 'title', e.target.value)}
              className="step-title-input"
              aria-label={`כותרת שלב ${i + 1}`}
            />
          )}
          <div className="step-row-inner">
            <span className="step-number" aria-hidden>{i + 1}</span>
            <textarea
              placeholder={`תיאור שלב ${i + 1} *`}
              value={item.body}
              onChange={(e) => update(i, 'body', e.target.value)}
              rows={3}
              aria-label={`שלב ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`הסר שלב ${i + 1}`}
              disabled={items.length === 1}
              className="remove-btn"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-button">
        + הוסף שלב
      </button>
    </div>
  )
}
