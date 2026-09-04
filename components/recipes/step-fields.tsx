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

  function updateBody(index: number, value: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, body: value } : item
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
      {items.map((item, i) => (
        <div key={i} className="step-row">
          <span className="step-number" aria-hidden>{i + 1}</span>
          <textarea
            placeholder={`תיאור שלב ${i + 1} *`}
            value={item.body}
            onChange={e => updateBody(i, e.target.value)}
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
      ))}
      <button type="button" onClick={add} className="text-button">
        + הוסף שלב
      </button>
    </div>
  )
}
