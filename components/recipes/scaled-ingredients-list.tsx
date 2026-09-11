'use client'

import { useState } from 'react'
import type { ScaledIngredient } from '@/lib/recipe-scale'

type Props = { ingredients: ScaledIngredient[] }

/**
 * Renders scaled ingredients with the original value shown as a subtle
 * hint below each row. For rows whose scaled value is a fraction of a
 * "whole" unit (e.g. 1.5 ביצים), a "עגל למעלה" button flips that specific
 * row to the ceil value so the operator can decide per-row.
 */
export function ScaledIngredientsList({ ingredients }: Props) {
  const [roundedUp, setRoundedUp] = useState<Record<number, boolean>>({})

  return (
    <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
      {ingredients.map((ing, idx) => {
        const showsRoundedUp = roundedUp[idx] === true
        const displayValue =
          showsRoundedUp && ing.numeric != null
            ? String(Math.ceil(ing.numeric))
            : ing.scaledAmount

        return (
          <li key={idx} className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">
                {displayValue && (
                  <span className="font-bold text-lime-700">{displayValue} </span>
                )}
                {ing.unit && <span className="text-neutral-600">{ing.unit} </span>}
                {ing.name}
              </p>
              {ing.originalAmount && ing.originalAmount !== ing.scaledAmount && (
                <p className="mt-0.5 text-xs text-neutral-400">
                  במקור: {ing.originalAmount}
                  {ing.unit ? ` ${ing.unit}` : ''}
                </p>
              )}
            </div>
            {ing.isFractionalWhole && ing.numeric != null && (
              <button
                type="button"
                onClick={() =>
                  setRoundedUp((prev) => ({ ...prev, [idx]: !prev[idx] }))
                }
                className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-lime-500 hover:text-lime-700"
                title="ערך מדויק לא הגיוני ליחידה שלמה — לחץ לעיגול למעלה"
              >
                {showsRoundedUp
                  ? `↺ ${ing.scaledAmount}`
                  : `↑ עגל ל־${Math.ceil(ing.numeric)}`}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
