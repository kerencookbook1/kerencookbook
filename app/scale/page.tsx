import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ScalePicker } from './_picker'

export const metadata = { title: 'התאמת מנות — המטבח של קרן' }

export default async function ScaleIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recipes = user
    ? (
        await supabase
          .from('recipes')
          .select('id, title, servings')
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false })
      ).data ?? []
    : []

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <header>
        <Link href="/" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
          ← בית
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          התאמת מנות
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          בחר מתכון וכמה מנות רצוי — נחשב לך את הכמויות מחדש בלי לגעת במתכון המקורי.
        </p>
      </header>

      <div className="mt-8">
        <ScalePicker
          recipes={recipes.map((r) => ({
            id: r.id,
            title: r.title,
            servings: r.servings ?? null,
          }))}
        />
      </div>
    </main>
  )
}
