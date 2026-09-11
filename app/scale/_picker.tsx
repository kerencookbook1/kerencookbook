'use client'

import { useState } from 'react'
import Link from 'next/link'

type RecipeChoice = {
  id: string
  title: string
  servings: number | null
}

export function ScalePicker({ recipes }: { recipes: RecipeChoice[] }) {
  const [recipeId, setRecipeId] = useState<string>(recipes[0]?.id ?? '')
  const [target, setTarget] = useState<string>(
    recipes[0]?.servings ? String(Math.max(1, Math.round(recipes[0].servings / 2))) : '2'
  )

  const chosen = recipes.find((r) => r.id === recipeId)
  const canGo = chosen != null && Number(target) > 0

  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600">
        אין לך עדיין מתכונים במערכת. הוסיפי מתכון קודם, ואז נחזור לפה להתאים מנות.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium">בחר מתכון</span>
        <select
          value={recipeId}
          onChange={(e) => {
            setRecipeId(e.target.value)
            const r = recipes.find((x) => x.id === e.target.value)
            if (r?.servings) setTarget(String(Math.max(1, Math.round(r.servings / 2))))
          }}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
        >
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}{r.servings ? ` (${r.servings} מנות)` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">מספר מנות מקורי</span>
          <div className="mt-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-sm">
            {chosen?.servings ?? 'לא הוגדר במתכון'}
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">מספר מנות רצוי</span>
          <input
            type="number"
            min={1}
            step={1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          />
        </label>
      </div>

      {chosen && chosen.servings == null && (
        <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
          המתכון הזה לא מוגדר עם מספר מנות מקורי. עדכן את המתכון קודם כדי שנוכל לחשב יחס.
        </p>
      )}

      {canGo && chosen?.servings != null && (
        <Link
          href={`/recipes/${recipeId}/scale?servings=${target}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
        >
          <span aria-hidden="true">⚖️</span>
          <span>חשב את המתכון ל־{target} מנות</span>
        </Link>
      )}
    </div>
  )
}
