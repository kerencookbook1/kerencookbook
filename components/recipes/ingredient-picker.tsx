'use client'

import { useEffect, useState } from 'react'

let cachedSuggestions: string[] | null = null

type Props = {
  /** Called with the picked name; parent decides how to append it (e.g., to a textarea). */
  onPick: (name: string) => void
}

/**
 * Small autocomplete input backed by a <datalist>. Used in import review
 * screens to let the user append a well-known ingredient to a free-text
 * ingredients textarea (the primary content still comes from the AI extractor).
 */
export function IngredientPicker({ onPick }: Props) {
  const [value, setValue] = useState('')
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

  function submit() {
    const name = value.trim()
    if (!name) return
    onPick(name)
    setValue('')
  }

  return (
    <div className="ingredient-picker">
      <datalist id="ingredient-picker-suggestions">
        {suggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="הוספת מרכיב מהרשימה (התחל להקליד…)"
        list="ingredient-picker-suggestions"
        autoComplete="off"
        aria-label="הוספת מרכיב מרשימת הצעות"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!value.trim()}
        className="outline-button"
      >
        +
      </button>
    </div>
  )
}
