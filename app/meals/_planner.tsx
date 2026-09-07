'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { clearMealPlan, setMealPlan, type MealType } from '@/lib/actions/meals'

type Plan = { date: string; meal_type: MealType; recipe_id: string }
type Recipe = { id: string; title: string; image_url: string | null; category: string | null }

const MEAL_LABELS: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'בוקר', icon: '🌅' },
  lunch:     { label: 'צהריים', icon: '☀️' },
  dinner:    { label: 'ערב',   icon: '🌙' },
}

const DAY_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

function formatDayNumber(iso: string): string {
  const d = new Date(iso)
  return String(d.getDate())
}
function formatMonth(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL', { month: 'long' })
}

export function WeeklyMealPlanner({
  weekDates, plans, recipes, prevWeek, nextWeek, todayIso,
}: {
  weekDates: string[]
  plans: Plan[]
  recipes: Recipe[]
  prevWeek: string
  nextWeek: string
  todayIso: string
}) {
  const [local, setLocal] = useState<Plan[]>(plans)
  const [pickerSlot, setPickerSlot] = useState<{ date: string; mealType: MealType } | null>(null)
  const [busy, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  const recipeById = new Map(recipes.map((r) => [r.id, r]))

  function planFor(date: string, mealType: MealType): Recipe | null {
    const found = local.find((p) => p.date === date && p.meal_type === mealType)
    return found ? recipeById.get(found.recipe_id) ?? null : null
  }

  function assign(recipeId: string) {
    if (!pickerSlot) return
    const { date, mealType } = pickerSlot
    setLocal((arr) => {
      const others = arr.filter((p) => !(p.date === date && p.meal_type === mealType))
      return [...others, { date, meal_type: mealType, recipe_id: recipeId }]
    })
    setPickerSlot(null)
    setSearch('')
    startTransition(async () => {
      await setMealPlan({ date, mealType, recipeId })
    })
  }

  function clear(date: string, mealType: MealType) {
    setLocal((arr) => arr.filter((p) => !(p.date === date && p.meal_type === mealType)))
    startTransition(async () => {
      await clearMealPlan({ date, mealType })
    })
  }

  const filteredRecipes = search.trim()
    ? recipes.filter((r) => r.title.toLowerCase().includes(search.trim().toLowerCase()))
    : recipes

  const monthLabel = `${formatMonth(weekDates[0])} ${new Date(weekDates[0]).getFullYear()}`

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {/* Week navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Link href={`/meals?week=${prevWeek}`} className="outline-button">← שבוע הקודם</Link>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 900 }}>{monthLabel}</p>
          <Link href="/meals" style={{ fontSize: '.85rem', color: 'var(--terracotta-dark)', textDecoration: 'underline' }}>קפצי לשבוע הנוכחי</Link>
        </div>
        <Link href={`/meals?week=${nextWeek}`} className="outline-button">שבוע הבא →</Link>
      </div>

      {/* Week grid — days as columns on desktop, list on mobile */}
      <div className="week-grid-wrap">
        <div className="week-grid">
          {weekDates.map((date, i) => {
            const isToday = date === todayIso
            return (
              <div key={date} className={`day-card${isToday ? ' is-today' : ''}`}>
                <span>{DAY_LABELS[i]}</span>
                <strong>{formatDayNumber(date)}</strong>
                {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => {
                  const recipe = planFor(date, mealType)
                  const meta = MEAL_LABELS[mealType]
                  if (recipe) {
                    return (
                      <div key={mealType} className="meal-slot">
                        <small>{meta.icon} {meta.label}</small>
                        <p>
                          <Link href={`/recipes/${recipe.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {recipe.title}
                          </Link>
                        </p>
                        <button
                          type="button"
                          onClick={() => clear(date, mealType)}
                          disabled={busy}
                          style={{ border: 0, background: 'transparent', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '2px 0', textAlign: 'right' }}
                        >
                          הסירי
                        </button>
                      </div>
                    )
                  }
                  return (
                    <button
                      key={mealType}
                      type="button"
                      className="meal-slot-empty"
                      onClick={() => setPickerSlot({ date, mealType })}
                    >
                      <small>{meta.icon} {meta.label}</small>
                      <span>+ הוסיפי</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {recipes.length === 0 && (
        <div className="empty-state">
          <p>אין עדיין מתכונים להוסיף. <Link href="/import" className="text-button">הוסיפי מתכון ראשון</Link></p>
        </div>
      )}

      {/* Recipe picker modal */}
      {pickerSlot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="בחירת מתכון"
          onClick={() => setPickerSlot(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
            display: 'grid', placeItems: 'center', padding: 16, zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)', maxHeight: '85vh', overflow: 'hidden',
              display: 'grid', gridTemplateRows: 'auto auto 1fr auto',
              background: 'var(--surface)', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,.28)',
            }}
          >
            <header style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.85rem' }}>
                {MEAL_LABELS[pickerSlot.mealType].icon} {MEAL_LABELS[pickerSlot.mealType].label} · {(() => {
                  const d = new Date(pickerSlot.date)
                  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                })()}
              </p>
              <h2 style={{ margin: '4px 0 0', fontFamily: 'Georgia, serif' }}>בחרי מתכון</h2>
            </header>
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש שם מתכון…"
              style={{
                margin: 12, minHeight: 44, border: '1px solid #cfbfae',
                borderRadius: 10, padding: '0 14px', background: '#fffdfa', fontSize: '1rem',
              }}
            />
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', overflowY: 'auto', maxHeight: '55vh' }}>
              {filteredRecipes.length === 0 ? (
                <li style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>לא נמצאו מתכונים</li>
              ) : filteredRecipes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => assign(r.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '10px 16px', border: 0, borderBottom: '1px solid var(--line)',
                      background: 'transparent', cursor: 'pointer', textAlign: 'right',
                    }}
                  >
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e8d5c0' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{r.title}</p>
                      {r.category && <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>{r.category}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <footer style={{ padding: 12, borderTop: '1px solid var(--line)', textAlign: 'left' }}>
              <button type="button" className="outline-button" onClick={() => setPickerSlot(null)}>ביטול</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
