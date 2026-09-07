import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CategoryTabs } from './_components/category-tabs'

export const metadata = { title: 'המטבח של קרן' }

type HomeRecipe = {
  id: string
  title: string
  prep_time: number | null
  cook_time: number | null
  image_url: string | null
  ingredientNames: string[]
}

async function getHomeRecipes(userId: string): Promise<HomeRecipe[]> {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, prep_time, cook_time')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (!recipes || recipes.length === 0) return []

  const ids = recipes.map((r) => r.id)
  const [imagesRes, ingredientsRes] = await Promise.all([
    supabase.from('recipe_images').select('recipe_id, storage_path, is_primary, position').in('recipe_id', ids),
    supabase.from('ingredients').select('recipe_id, name').in('recipe_id', ids),
  ])

  const imagesByRecipe = new Map<string, string>()
  for (const img of imagesRes.data ?? []) {
    const url = /^https?:\/\//i.test(img.storage_path) ? img.storage_path : null
    if (!url) continue
    // Prefer primary; keep first hit otherwise
    if (img.is_primary || !imagesByRecipe.has(img.recipe_id)) {
      imagesByRecipe.set(img.recipe_id, url)
    }
  }

  const ingredientsByRecipe = new Map<string, string[]>()
  for (const ing of ingredientsRes.data ?? []) {
    const arr = ingredientsByRecipe.get(ing.recipe_id) ?? []
    arr.push(ing.name)
    ingredientsByRecipe.set(ing.recipe_id, arr)
  }

  return recipes.map((r) => ({
    id: r.id,
    title: r.title,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    image_url: imagesByRecipe.get(r.id) ?? null,
    ingredientNames: ingredientsByRecipe.get(r.id) ?? [],
  }))
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recipes = user ? await getHomeRecipes(user.id) : []

  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">דלג לתוכן</a>

      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">✿</span>
          המטבח של קרן
        </Link>
        <Link href="/recipes" className="search-box" aria-label="חפשי מתכון">
          חיפוש מתכון, מרכיב, קטגוריה...
        </Link>
        <Link href="/import" className="add-button" aria-label="הוספת מתכון חדש">
          <span aria-hidden="true">+</span>
          <span>הוספת מתכון</span>
        </Link>
      </header>

      <section className="hero" aria-label="ברוכה הבאה">
        <div className="hero-copy">
          <p className="eyebrow">מועדפי הבית</p>
          <h1>ארוחת ערב<br />שמרגישה כמו בית</h1>
          <p className="hero-text">
            המתכונים האהובים מהמטבח שלי, לאנשים שאני אוהבת.
          </p>
          <Link href="/recipes" className="primary-button">
            למתכונים שלי
          </Link>
        </div>

        <div className="hero-image-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/recipes/shakshuka-default.png" alt="" className="hero-image" />
        </div>
      </section>

      <div id="main-content">
        <CategoryTabs recipes={recipes} />
      </div>
    </main>
  )
}
