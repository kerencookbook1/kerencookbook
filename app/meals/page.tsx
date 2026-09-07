import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getRecipeCards } from '@/lib/repositories/recipes'
import { WeeklyMealPlanner } from './_planner'

export const metadata = { title: 'תכנון ארוחות — המטבח של קרן' }

// Sunday-based week: given any date, return the Sunday that starts its week.
function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const day = copy.getDay()  // 0=Sun ... 6=Sat
  copy.setDate(copy.getDate() - day)
  return copy
}
function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Props = { searchParams: Promise<{ week?: string }> }

export default async function MealsPage({ searchParams }: Props) {
  const params = await searchParams
  const anchor = params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
    ? new Date(params.week)
    : new Date()
  const weekStart = startOfWeek(anchor)
  const weekDates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    weekDates.push(toIso(d))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recipes = user ? await getRecipeCards(user.id) : []
  const { data: plans } = user
    ? await supabase
        .from('meal_plans')
        .select('date, meal_type, recipe_id')
        .eq('owner_id', user.id)
        .in('date', weekDates)
    : { data: [] }

  const prevWeekIso = toIso(new Date(weekStart.getTime() - 7 * 86400_000))
  const nextWeekIso = toIso(new Date(weekStart.getTime() + 7 * 86400_000))

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/" className="back-link">← בית</Link>
        <p className="eyebrow">תכנון</p>
        <h1>תכנון ארוחות</h1>
        <p>לחצי על משבצת ריקה כדי לשבץ מתכון. שבועי, קל לניווט בין שבועות.</p>
      </header>

      <WeeklyMealPlanner
        weekDates={weekDates}
        plans={(plans ?? []).map((p) => ({ date: p.date, meal_type: p.meal_type as 'breakfast'|'lunch'|'dinner', recipe_id: p.recipe_id }))}
        recipes={recipes.map((r) => ({ id: r.id, title: r.title, image_url: r.image_url, category: r.category }))}
        prevWeek={prevWeekIso}
        nextWeek={nextWeekIso}
        todayIso={toIso(new Date())}
      />
    </main>
  )
}
