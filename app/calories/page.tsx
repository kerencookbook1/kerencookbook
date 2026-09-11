import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { estimateRecipeCalories } from '@/lib/calorie-calc'
import { CalorieQuickCalc } from './_quick-calc'

export const metadata = { title: 'מחשבון קלוריות — המטבח של קרן' }

type RecipeRanked = {
  id: string
  title: string
  servings: number | null
  totalKcal: number
  perServing: number | null
  matchedCount: number
  ingredientCount: number
}

export default async function CaloriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let ranked: RecipeRanked[] = []
  if (user) {
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, servings')
      .eq('owner_id', user.id)

    const recipeIds = (recipes ?? []).map((r) => r.id)
    const { data: ingredients } = recipeIds.length
      ? await supabase
          .from('ingredients')
          .select('recipe_id, name, amount, unit')
          .in('recipe_id', recipeIds)
      : { data: [] }

    const byRecipe = new Map<string, Array<{ name: string; amount: string | null; unit: string | null }>>()
    for (const ing of ingredients ?? []) {
      const arr = byRecipe.get(ing.recipe_id) ?? []
      arr.push({ name: ing.name, amount: ing.amount, unit: ing.unit })
      byRecipe.set(ing.recipe_id, arr)
    }

    ranked = (recipes ?? []).map((r) => {
      const ings = byRecipe.get(r.id) ?? []
      const estimate = estimateRecipeCalories(ings, r.servings ?? null)
      return {
        id: r.id,
        title: r.title,
        servings: r.servings ?? null,
        totalKcal: estimate.totalKcal,
        perServing: estimate.perServing,
        matchedCount: estimate.matchedCount,
        ingredientCount: ings.length,
      }
    }).sort((a, b) => (a.perServing ?? Infinity) - (b.perServing ?? Infinity))
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <header>
        <Link href="/" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
          ← בית
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          מחשבון קלוריות
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          הערכה מבוססת על מאגר מרכיבים נפוצים. ערכים לא מהווים ייעוץ תזונתי.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">מחשבון מהיר</h2>
        <CalorieQuickCalc />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">
          המתכונים שלך {ranked.length > 0 && <span className="text-sm font-normal text-neutral-500">· ממוין לפי קלוריות למנה</span>}
        </h2>
        {ranked.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600">
            אין מתכונים לחשב. הוסיפי מתכון כדי לראות הערכה קלורית.
          </div>
        ) : (
          <ul className="space-y-2">
            {ranked.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/recipes/${r.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-neutral-900">
                      {r.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      {r.servings ? `${r.servings} מנות · ` : ''}
                      {r.matchedCount}/{r.ingredientCount} מרכיבים זוהו
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    {r.perServing != null ? (
                      <>
                        <p className="text-xl font-bold text-lime-700">
                          {r.perServing.toLocaleString('he-IL')}
                          <span className="text-xs font-normal text-neutral-500"> kcal/מנה</span>
                        </p>
                        <p className="text-xs text-neutral-400">
                          סה״כ ~{r.totalKcal.toLocaleString('he-IL')}
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-neutral-400">
                        ~{r.totalKcal.toLocaleString('he-IL')}
                        <span className="text-xs font-normal"> kcal</span>
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
