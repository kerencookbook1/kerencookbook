'use client'

import { useMemo, useState } from 'react'
import { parseIngredientLine } from '@/lib/ingredients'
import { estimateRecipeCalories } from '@/lib/calorie-calc'

export function CalorieQuickCalc() {
  const [text, setText] = useState('')
  const [servingsRaw, setServingsRaw] = useState('1')

  const { estimate, parsedCount } = useMemo(() => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const parsed = lines.map(parseIngredientLine)
    const servings = Number(servingsRaw) || 1
    return {
      estimate: estimateRecipeCalories(parsed, servings),
      parsedCount: parsed.length,
    }
  }, [text, servingsRaw])

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium">רשימת מרכיבים (שורה לכל מרכיב)</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"למשל:\n2 חזה עוף\n1 כוס אורז\n2 כפות שמן זית\n3 עגבניות"}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          dir="rtl"
        />
      </label>

      <div className="mt-3 flex items-end gap-3">
        <label className="block">
          <span className="text-sm font-medium">מספר מנות</span>
          <input
            type="number"
            min={1}
            value={servingsRaw}
            onChange={(e) => setServingsRaw(e.target.value)}
            className="mt-1.5 w-24 rounded-lg border border-neutral-200 bg-white p-2 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          />
        </label>
      </div>

      {parsedCount > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-3">
          <Metric label="סה״כ" value={`${estimate.totalKcal.toLocaleString('he-IL')} kcal`} />
          <Metric
            label="למנה"
            value={
              estimate.perServing != null
                ? `${estimate.perServing.toLocaleString('he-IL')} kcal`
                : '—'
            }
          />
          <Metric
            label="דיוק"
            value={`${estimate.matchedCount}/${estimate.breakdown.length}`}
            hint={estimate.unmatchedCount > 0 ? `${estimate.unmatchedCount} לא זוהו` : 'הכל זוהה'}
          />
        </div>
      )}

      {estimate.unmatchedCount > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-900">
            הצג {estimate.unmatchedCount} שלא זוהו
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-neutral-500">
            {estimate.breakdown
              .filter((b) => b.kcal == null)
              .map((b, i) => (
                <li key={i} className="rounded bg-neutral-50 px-2 py-1">
                  {b.amount} {b.unit} {b.name} —{' '}
                  <span className="text-neutral-400">
                    {b.reason === 'no-match' && 'לא במאגר'}
                    {b.reason === 'no-amount' && 'ללא כמות'}
                    {b.reason === 'unknown-unit' && 'יחידה לא נתמכת'}
                  </span>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}
