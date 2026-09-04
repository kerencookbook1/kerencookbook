import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'
import Link from 'next/link'

export const metadata = { title: 'המטבח של קרן' }

// קטגוריות מהירות — מוצגות כצ'יפס מתחת להירו
const QUICK_FILTERS = [
  { label: 'מהיר', href: '/recipes?filter=quick' },
  { label: 'צמחוני', href: '/recipes?filter=vegetarian' },
  { label: 'מתוקים', href: '/recipes?filter=sweet' },
] as const

// ערכות צבע לכרטיסי מתכון — מחזוריות לפי אינדקס
const CARD_THEMES = ['', 'cauliflower', 'lemon', 'pumpkin', 'garden'] as const

// אייקון לב למועדפים
function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const allRecipes = user ? await getRecipes(user.id) : []
  const displayed = allRecipes.slice(0, 6)

  return (
    <main className="app-shell">
      <a href="#main-content" className="skip-link">דלג לתוכן</a>

      {/* ===== סרגל עליון ===== */}
      <header className="topbar">
        {/* שם האתר — ימין */}
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">✿</span>
          המטבח של קרן
        </Link>

        {/* שורת חיפוש — מרכז */}
        <Link href="/recipes" className="search-box" aria-label="חפשי מתכון">
          חיפוש מתכון, מרכיב, קטגוריה...
        </Link>

        {/* כפתור הוספה — שמאל */}
        <Link href="/recipes/new" className="add-button" aria-label="הוספת מתכון חדש">
          <span aria-hidden="true">+</span>
          <span>הוספת מתכון</span>
        </Link>
      </header>

      {/* ===== הירו ===== */}
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

        {/* ויזואל — גרדיאנט CSS בלי תמונה חיצונית */}
        <div className="hero-image-wrap" aria-hidden="true">
          <div className="hero-food-illustration" />
        </div>
      </section>

      {/* ===== צ'יפסים מהירים ===== */}
      <nav className="quick-actions" aria-label="סינון מהיר">
        {QUICK_FILTERS.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className="category-chip"
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {/* ===== רשת מתכונים ===== */}
      <section id="main-content" className="recipe-section" aria-label="מתכונים נבחרים">
        <div className="section-heading">
          <h2>נבחרו בשבילך</h2>
          <Link href="/recipes" className="text-button">
            הכל
          </Link>
        </div>

        {displayed.length > 0 ? (
          <div className="recipe-grid">
            {displayed.map((recipe, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length]
              const totalMinutes =
                (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

              return (
                <article key={recipe.id} className="recipe-card">
                  {/* ויזואל הכרטיס עם אילוסטרציית צלחת */}
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className={`recipe-visual${theme ? ` ${theme}` : ''}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <div className="plate" />
                    <span className="ingredient ingredient-one" />
                    <span className="ingredient ingredient-two" />
                    <span className="ingredient ingredient-three" />
                  </Link>

                  {/* כפתור מועדפים */}
                  <button
                    type="button"
                    className="favorite-button"
                    aria-label={`הוסיפי לרשימת המועדפים: ${recipe.title}`}
                  >
                    <HeartIcon />
                  </button>

                  {/* מידע על המתכון */}
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                    {totalMinutes > 0 && (
                      <span aria-label={`זמן הכנה: ${totalMinutes} דקות`}>
                        {totalMinutes} דק׳
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          /* מצב ריק */
          <div className="empty-state" role="status">
            <p>עדיין אין מתכונים. הוסיפי את הראשון!</p>
            <Link href="/recipes/new" className="primary-button">
              + מתכון חדש
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
