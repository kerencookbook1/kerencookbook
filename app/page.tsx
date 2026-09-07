import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getRecipeCards } from '@/lib/repositories/recipes'
import { CategoryTabs } from './_components/category-tabs'

export const metadata = { title: 'המטבח של קרן' }

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recipes = user ? await getRecipeCards(user.id) : []

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
