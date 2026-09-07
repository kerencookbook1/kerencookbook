import { createClient } from '@/lib/supabase/server'
import { getRecipeCards } from '@/lib/repositories/recipes'
import Link from 'next/link'
import { PantryMatcher } from './_matcher'

export const metadata = { title: 'מה יש לי בבית? — המטבח של קרן' }

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipeCards(user.id) : []

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/" className="back-link">← בית</Link>
        <p className="eyebrow">כלי חכם</p>
        <h1>מה יש לי בבית?</h1>
        <p>רשמי מה יש לך במקרר או במזווה — נראה איזה מתכונים אפשר להכין עכשיו.</p>
      </header>

      <PantryMatcher
        recipes={recipes.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          image_url: r.image_url,
          ingredientNames: r.ingredientNames,
          prep_time: r.prep_time,
          cook_time: r.cook_time,
        }))}
      />
    </main>
  )
}
