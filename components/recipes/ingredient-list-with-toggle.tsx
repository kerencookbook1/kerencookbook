'use client'

import { useMemo, useState } from 'react'
import { convertToMetric, isImperialAmount } from '@/lib/unit-conversion'
import { IngredientSubstituteButton } from './ingredient-substitute-button'

export type IngredientDisplay = {
  amount: string | null
  unit: string | null
  name: string
}

type Props = {
  ingredients: IngredientDisplay[]
  recipeTitle?: string
}

/**
 * Ingredient list with a live "convert to metric" toggle. If no line in the
 * list uses an imperial unit (cup / oz / lb / °F / inch), the toggle is
 * hidden — no reason to clutter the UI on already-metric recipes.
 */
export function IngredientListWithToggle({ ingredients, recipeTitle }: Props) {
  const [metric, setMetric] = useState(true)
  const otherIngredients = useMemo(() => ingredients.map((i) => i.name), [ingredients])

  const hasImperial = useMemo(
    () => ingredients.some((ing) => isImperialAmount(ing.amount ?? '', ing.unit ?? '')),
    [ingredients],
  )

  return (
    <>
      {hasImperial && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={metric}
              onChange={(e) => setMetric(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--terracotta-dark, #4d7c0f)' }}
            />
            הצג במידות מטריות (גרם / מ״ל / °C)
          </label>
          {metric && (
            <span style={{ fontSize: '.75rem', color: 'var(--muted, #525252)' }}>
              המרה אוטומטית לפי סוג המרכיב
            </span>
          )}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {ingredients.map((ing, i) => {
          const original = { amount: ing.amount ?? '', unit: ing.unit ?? '' }
          const shown = metric
            ? convertToMetric(original.amount, original.unit, ing.name)
            : { ...original, converted: false }
          return (
            <li
              key={`${ing.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'var(--surface, #ffffff)',
                border: '1px solid var(--line, #e5e5e5)',
                borderRadius: 10,
              }}
            >
              {shown.amount && (
                <span
                  style={{
                    minWidth: 46,
                    fontWeight: 800,
                    color: 'var(--terracotta-dark, #4d7c0f)',
                    fontSize: '.95rem',
                  }}
                >
                  {shown.amount}
                </span>
              )}
              {shown.unit && (
                <span style={{ color: 'var(--muted, #525252)', fontSize: '.9rem' }}>
                  {shown.unit}
                </span>
              )}
              <span style={{ color: 'var(--ink, #171717)', fontSize: '.95rem', flex: 1, minWidth: 0 }}>
                {ing.name}
              </span>
              {shown.converted && (
                <span
                  title={`מקור: ${original.amount} ${original.unit}`}
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--muted, #525252)',
                    background: 'var(--terracotta-bg, #ecfccb)',
                    padding: '2px 6px',
                    borderRadius: 999,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ← {original.amount} {original.unit}
                </span>
              )}
              <IngredientSubstituteButton
                ingredientName={ing.name}
                recipeTitle={recipeTitle}
                otherIngredients={otherIngredients}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}
