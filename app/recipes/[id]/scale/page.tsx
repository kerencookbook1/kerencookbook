import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/repositories/recipes'
import { computeFactor, scaleIngredients } from '@/lib/recipe-scale'
import { ScaledIngredientsList } from '@/components/recipes/scaled-ingredients-list'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  return { title: data ? `התאמת מנות — ${data.recipe.title}` : 'מתכון לא נמצא' }
}

export default async function ScaleRecipePage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps } = data

  // Recipes without a stored `servings` value can still be scaled — the user
  // just needs to tell us how many the current amounts feed. We accept an
  // override via ?source=N and fall back to a sensible default of 4.
  const storedServings = recipe.servings ?? null
  const sourceRaw = Number(sp.source)
  const sourceOverride =
    Number.isFinite(sourceRaw) && sourceRaw > 0 ? Math.round(sourceRaw) : null
  const originalServings = sourceOverride ?? storedServings ?? 4
  const isSourceInferred = storedServings == null && sourceOverride == null

  const targetRaw = Number(sp.servings)
  const targetServings =
    Number.isFinite(targetRaw) && targetRaw > 0
      ? targetRaw
      : Math.max(1, originalServings)
  const factor = computeFactor(originalServings, targetServings)

  const scaled = factor != null
    ? scaleIngredients(
        ingredients.map((i) => ({ name: i.name, amount: i.amount, unit: i.unit })),
        factor,
      )
    : null

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <Link href={`/recipes/${id}`} className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
        ← חזרה למתכון המקורי
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-lime-700">
          התאמת מנות · המתכון המקורי נשמר
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="mt-2 text-neutral-600">{recipe.description}</p>
        )}
      </header>

      <form className="mt-6 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-3" method="get">
        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            מספר מנות מקורי
          </span>
          {storedServings != null && sourceOverride == null ? (
            <span className="text-2xl font-bold tracking-tight">{storedServings}</span>
          ) : (
            <input
              type="number"
              name="source"
              min={1}
              step={1}
              defaultValue={originalServings}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-2xl font-bold outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              aria-describedby="source-hint"
            />
          )}
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            מספר מנות רצוי
          </span>
          <input
            type="number"
            name="servings"
            min={1}
            step={1}
            defaultValue={targetServings}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-2xl font-bold outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
          >
            חשב מחדש
          </button>
        </div>
        {isSourceInferred && (
          <p id="source-hint" className="sm:col-span-3 mt-1 text-xs text-neutral-500">
            למתכון הזה אין מספר מנות שמור — הזיני כמה מנות המרכיבים במתכון המקורי מכינים,
            ואז את מספר המנות שאת רוצה. כדאי להוסיף את הערך למתכון דרך <Link href={`/recipes/${id}/edit`} className="text-lime-700 underline">עריכת מתכון</Link>.
          </p>
        )}
      </form>

      {factor == null ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          לא הצלחתי לחשב יחס התאמה. ודאי שמספר המנות המקורי ומספר המנות הרצוי הם מספרים חיוביים.
        </div>
      ) : (
        <>
          <section className="mt-8">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">מרכיבים ל־{targetServings} מנות</h2>
              <span className="text-xs text-neutral-500">
                יחס: ×{factor.toFixed(2).replace(/\.?0+$/, '')}
              </span>
            </div>
            {scaled && <ScaledIngredientsList ingredients={scaled} />}
          </section>

          {steps.length > 0 && (
            <section className="mt-8">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">שלבי הכנה</h2>
                <span className="text-xs text-neutral-500">
                  זמנים ושלבים לא הותאמו — בדוק אותם ידנית
                </span>
              </div>
              <ol className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                {steps.map((s, idx) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {s.title && <p className="font-semibold">{s.title}</p>}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-neutral-400">
        זו תצוגה מחושבת בלבד. המתכון המקורי נשאר ללא שינוי.
      </p>
    </main>
  )
}
