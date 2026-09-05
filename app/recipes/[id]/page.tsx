import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/repositories/recipes'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  return { title: data ? `${data.recipe.title} — המטבח של קרן` : 'מתכון לא נמצא' }
}

const CARD_THEMES = ['', 'cauliflower', 'lemon', 'pumpkin', 'garden'] as const

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps } = data
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
  const themeIndex = Math.abs(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % CARD_THEMES.length
  const theme = CARD_THEMES[themeIndex]

  return (
    <div className="library-shell">
      <header className="library-header">
        <Link href="/recipes" className="back-link">← המתכונים שלי</Link>
        <div className="library-title-row" style={{ marginTop: 12 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem,4vw,3.8rem)', letterSpacing: '-.03em', margin: 0 }}>
            {recipe.title}
          </h1>
          <Link href={`/recipes/${id}/edit`} className="outline-button">עריכה</Link>
        </div>
      </header>

      <div className="library-workspace">
        {/* Main content */}
        <article>
          {/* Visual */}
          <div className={`recipe-visual${theme ? ` ${theme}` : ''}`}
            style={{ height: 280, borderRadius: 20, marginBottom: 28, overflow: 'hidden', isolation: 'isolate' }}>
            <div className="plate" />
            <span className="ingredient ingredient-one" />
            <span className="ingredient ingredient-two" />
            <span className="ingredient ingredient-three" />
          </div>

          {/* Meta */}
          {(recipe.description || totalTime > 0 || recipe.servings) && (
            <div style={{ marginBottom: 28 }}>
              {recipe.description && (
                <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: '1.08rem', lineHeight: 1.65 }}>
                  {recipe.description}
                </p>
              )}
              <div className="detail-meta">
                {recipe.prep_time ? <span>הכנה: {recipe.prep_time} דק׳</span> : null}
                {recipe.cook_time ? <span>בישול: {recipe.cook_time} דק׳</span> : null}
                {totalTime > 0 ? <span>סה״כ: {totalTime} דק׳</span> : null}
                {recipe.servings ? <span>{recipe.servings} מנות</span> : null}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: 14 }}>מרכיבים</h2>
              <ul style={{ display: 'grid', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                {ingredients.map((ing) => (
                  <li key={ing.id}
                    style={{ display: 'flex', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--line)', color: '#51473e' }}>
                    {ing.amount && (
                      <span style={{ minWidth: 40, fontWeight: 800, color: 'var(--terracotta-dark)' }}>{ing.amount}</span>
                    )}
                    {ing.unit && <span style={{ color: 'var(--muted)' }}>{ing.unit}</span>}
                    <span>{ing.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: 14 }}>הוראות הכנה</h2>
              <ol style={{ display: 'grid', gap: 20, margin: 0, paddingRight: 22 }}>
                {steps.map((step, i) => (
                  <li key={step.id} style={{ lineHeight: 1.65 }}>
                    {step.title && (
                      <strong style={{ display: 'block', marginBottom: 4, color: 'var(--ink)' }}>
                        שלב {i + 1}: {step.title}
                      </strong>
                    )}
                    <p style={{ margin: 0, color: '#51473e' }}>{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/recipes/${id}/cook`} className="primary-button" style={{ flex: 1, minWidth: 160 }}>
              התחל בישול
            </Link>
            <Link href={`/recipes/${id}/edit`} className="outline-button" style={{ flex: 1, minWidth: 160 }}>
              עריכת מתכון
            </Link>
          </div>
        </article>

        {/* Sticky preview panel — desktop only */}
        <aside className="recipe-detail-preview">
          <div className={`detail-visual${theme ? ` ${theme}` : ''}`}>
            <div className="plate" />
            <span className="ingredient ingredient-one" />
            <span className="ingredient ingredient-two" />
            <span className="ingredient ingredient-three" />
          </div>
          <h2>{recipe.title}</h2>
          <div className="detail-meta" style={{ marginBottom: 16 }}>
            {totalTime > 0 && <span>{totalTime} דק׳</span>}
            {recipe.servings && <span>{recipe.servings} מנות</span>}
          </div>
          {steps.length > 0 && (
            <>
              <h3>שלבי הכנה</h3>
              <ol>
                {steps.slice(0, 4).map((step) => (
                  <li key={step.id}>{step.title || step.body.slice(0, 60)}{step.body.length > 60 ? '…' : ''}</li>
                ))}
                {steps.length > 4 && <li style={{ color: 'var(--muted)' }}>ועוד {steps.length - 4} שלבים…</li>}
              </ol>
            </>
          )}
          <Link href={`/recipes/${id}/cook`} className="primary-button" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            התחל בישול
          </Link>
        </aside>
      </div>
    </div>
  )
}
