'use client'

import { useMemo, useState } from 'react'
import {
  estimateRecipeCalories,
  type IngredientForCalories,
} from '@/lib/calorie-calc'

type Props = {
  ingredients: IngredientForCalories[]
  servings: number | null
}

export function CalorieButton({ ingredients, servings }: Props) {
  const [open, setOpen] = useState(false)
  const estimate = useMemo(
    () => estimateRecipeCalories(ingredients, servings),
    [ingredients, servings]
  )

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-lime-600 bg-white px-4 py-2.5 text-sm font-semibold text-lime-700 shadow-sm transition hover:bg-lime-50 sm:w-auto"
        aria-expanded={open}
      >
        <span aria-hidden="true">🔥</span>
        <span>
          {open ? 'הסתר קלוריות' : `בדוק קלוריות ${estimate.perServing != null ? `(~${estimate.perServing} kcal/מנה)` : ''}`}
        </span>
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:min-w-md">
          <div className="grid grid-cols-3 gap-3 border-b border-neutral-100 pb-3">
            <Metric label="סה״כ" value={`${estimate.totalKcal.toLocaleString('he-IL')} kcal`} />
            <Metric
              label="למנה"
              value={
                estimate.perServing != null
                  ? `${estimate.perServing.toLocaleString('he-IL')} kcal`
                  : '—'
              }
              hint={estimate.servings ? `${estimate.servings} מנות` : 'לא הוגדר מספר מנות'}
            />
            <Metric
              label="דיוק"
              value={`${estimate.matchedCount}/${estimate.breakdown.length}`}
              hint={
                estimate.unmatchedCount > 0
                  ? `${estimate.unmatchedCount} לא זוהו`
                  : 'הכל זוהה'
              }
            />
          </div>

          <ul className="mt-3 space-y-1.5 text-sm">
            {estimate.breakdown.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 border-b border-neutral-100 py-1 last:border-none"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-neutral-900">{b.name}</p>
                  <p className="text-xs text-neutral-500">
                    {b.amount && <span>{b.amount} </span>}
                    {b.unit && <span>{b.unit} </span>}
                    {b.matchedName && (
                      <span className="text-neutral-400">· {b.matchedName}</span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-left">
                  {b.kcal != null ? (
                    <span className="font-semibold text-lime-700">
                      {b.kcal.toLocaleString('he-IL')} kcal
                    </span>
                  ) : (
                    <span className="text-xs italic text-neutral-400">
                      {b.reason === 'no-match' && 'לא במאגר'}
                      {b.reason === 'no-amount' && 'ללא כמות'}
                      {b.reason === 'unknown-unit' && 'יחידה לא נתמכת'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-3 rounded-md bg-neutral-50 p-2 text-xs text-neutral-500">
            הערכה בלבד מבוסס על מאגר מרכיבים נפוצים. ערכים לא מייצגים ייעוץ תזונתי.
          </p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}
