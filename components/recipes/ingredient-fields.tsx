'use client'

import { useEffect, useState } from 'react'
import type { IngredientItem } from '@/lib/validations/recipes'
import { IngredientCombobox } from './ingredient-combobox'

type Group = {
  title: string   // '' = ungrouped / no header
  items: IngredientItem[]
}

type Props = {
  initial?: IngredientItem[]
  onChange: (items: IngredientItem[]) => void
}

let cachedSuggestions: string[] | null = null

function toGroups(items: IngredientItem[]): Group[] {
  if (!items.length) return [{ title: '', items: [{ name: '', amount: '', unit: '', groupTitle: '' }] }]
  const groups: Group[] = []
  const seen = new Map<string, number>()
  for (const item of items) {
    const key = item.groupTitle?.trim() ?? ''
    if (!seen.has(key)) {
      seen.set(key, groups.length)
      groups.push({ title: key, items: [] })
    }
    groups[seen.get(key)!].items.push({ ...item, groupTitle: key })
  }
  return groups
}

function fromGroups(groups: Group[]): IngredientItem[] {
  return groups.flatMap((g) => g.items.map((item) => ({ ...item, groupTitle: g.title })))
}

const emptyItem = (title: string): IngredientItem => ({ name: '', amount: '', unit: '', groupTitle: title })

export function IngredientFields({ initial = [], onChange }: Props) {
  const [groups, setGroups] = useState<Group[]>(() => toGroups(initial))
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
    return () => { alive = false }
  }, [])

  function notify(next: Group[]) {
    setGroups(next)
    onChange(fromGroups(next))
  }

  function updateGroupTitle(gi: number, title: string) {
    const next = groups.map((g, i) => i === gi ? { ...g, title, items: g.items.map((it) => ({ ...it, groupTitle: title })) } : g)
    notify(next)
  }

  function updateItem(gi: number, ii: number, field: keyof IngredientItem, value: string) {
    const next = groups.map((g, i) =>
      i === gi ? { ...g, items: g.items.map((it, j) => j === ii ? { ...it, [field]: value } : it) } : g
    )
    notify(next)
  }

  function addItem(gi: number) {
    const next = groups.map((g, i) =>
      i === gi ? { ...g, items: [...g.items, emptyItem(g.title)] } : g
    )
    notify(next)
  }

  function removeItem(gi: number, ii: number) {
    const g = groups[gi]
    if (!g) return
    if (g.items.length === 1) {
      // Remove the whole group if it only had one item and there are other groups
      if (groups.length > 1) {
        notify(groups.filter((_, i) => i !== gi))
      }
      return
    }
    const next = groups.map((grp, i) =>
      i === gi ? { ...grp, items: grp.items.filter((_, j) => j !== ii) } : grp
    )
    notify(next)
  }

  function addGroup() {
    const next = [...groups, { title: 'קבוצה חדשה', items: [emptyItem('קבוצה חדשה')] }]
    notify(next)
  }

  function removeGroup(gi: number) {
    if (groups.length <= 1) return
    notify(groups.filter((_, i) => i !== gi))
  }

  const hasMultipleGroups = groups.length > 1 || (groups[0]?.title ?? '') !== ''

  return (
    <div className="ingredient-fields">
      {groups.map((group, gi) => (
        <div key={gi} className="ingredient-group">
          {/* Group header — always shown when there are multiple groups or a named group */}
          {hasMultipleGroups && (
            <div className="ingredient-group-header">
              <input
                type="text"
                className="ingredient-group-title"
                value={group.title}
                onChange={(e) => updateGroupTitle(gi, e.target.value)}
                placeholder="שם הקבוצה (למשל: לרוטב, לבסיס, לציפוי)"
                aria-label={`שם קבוצת מרכיבים ${gi + 1}`}
              />
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(gi)}
                  aria-label={`הסר קבוצה ${gi + 1}`}
                  className="remove-btn"
                  title="הסר קבוצה"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {group.items.map((item, ii) => (
            <div key={ii} className="ingredient-row">
              <input
                type="text"
                placeholder="כמות"
                value={item.amount}
                onChange={(e) => updateItem(gi, ii, 'amount', e.target.value)}
                aria-label={`כמות מרכיב ${ii + 1}`}
              />
              <input
                type="text"
                placeholder="יחידה"
                value={item.unit}
                onChange={(e) => updateItem(gi, ii, 'unit', e.target.value)}
                aria-label={`יחידת מרכיב ${ii + 1}`}
              />
              <IngredientCombobox
                value={item.name}
                onChange={(v) => updateItem(gi, ii, 'name', v)}
                suggestions={suggestions}
                placeholder="שם מרכיב *"
                ariaLabel={`שם מרכיב ${ii + 1}`}
              />
              <button
                type="button"
                onClick={() => removeItem(gi, ii)}
                aria-label={`הסר מרכיב ${ii + 1}`}
                disabled={groups.length === 1 && group.items.length === 1}
                className="remove-btn"
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addItem(gi)} className="text-button">
            + הוסף מרכיב
          </button>
        </div>
      ))}

      <div className="ingredient-fields-actions">
        <button type="button" onClick={addGroup} className="text-button add-group-btn">
          + הוסף קבוצה (למשל: לרוטב, לציפוי)
        </button>
      </div>
    </div>
  )
}
