'use client'

import { useState } from 'react'
import type { IngredientItem } from '@/lib/validations/recipes'

type Props = {
  initial?: IngredientItem[]
  onChange: (items: IngredientItem[]) => void
}

export function IngredientFields({ initial = [], onChange }: Props) {
  const [items, setItems] = useState<IngredientItem[]>(
    initial.length > 0 ? initial : [{ name: '', amount: '', unit: '' }]
  )

  function update(index: number, field: keyof IngredientItem, value: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setItems(next)
    onChange(next)
  }

  function add() {
    const next = [...items, { name: '', amount: '', unit: '' }]
    setItems(next)
    onChange(next)
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    onChange(next)
  }

  return (
    <div className="ingredient-fields">
      {items.map((item, i) => (
        <div key={i} className="ingredient-row">
          <input
            type="text"
            placeholder="כמות"
            value={item.amount}
            onChange={e => update(i, 'amount', e.target.value)}
            aria-label={`כמות מרכיב ${i + 1}`}
          />
          <input
            type="text"
            placeholder="יחידה"
            value={item.unit}
            onChange={e => update(i, 'unit', e.target.value)}
            aria-label={`יחידת מרכיב ${i + 1}`}
          />
          <input
            type="text"
            placeholder="שם מרכיב *"
            value={item.name}
            onChange={e => update(i, 'name', e.target.value)}
            aria-label={`שם מרכיב ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`הסר מרכיב ${i + 1}`}
            disabled={items.length === 1}
            className="remove-btn"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-button">
        + הוסף מרכיב
      </button>
    </div>
  )
}
