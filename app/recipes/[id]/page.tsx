import { notFound } from 'next/navigation'
import { getRecipe, type IngredientRow } from '@/lib/repositories/recipes'
import Link from 'next/link'
import { FavoriteButton } from '../../_components/favorite-button'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  return { title: data ? `${data.recipe.title} — המטבח של קרן` : 'מתכון לא נמצא' }
}

const CARD_THEMES = ['', 'cauliflower', 'lemon', 'pumpkin', 'garden'] as const

const THEME_KEYWORDS: Record<Exclude<(typeof CARD_THEMES)[number], ''>, string[]> = {
  lemon:       ['לימון', 'הדר', 'תפוז', 'אשכולית', 'lemon', 'citrus'],
  pumpkin:     ['בטטה', 'דלעת', 'גזר', 'כתום', 'pumpkin', 'sweet potato', 'squash'],
  cauliflower: ['כרובית', 'כרוב', 'ברוקולי', 'לבן', 'cauliflower', 'broccoli'],
  garden:      ['ירק', 'ירוק', 'חסה', 'סלט', 'עשב', 'בזיליקום', 'תרד', 'garden', 'salad', 'herb', 'basil', 'spinach'],
}

function pickTheme(title: string, ingredients: IngredientRow[], fallbackKey: string): string {
  const haystack = [title, ...ingredients.map((i) => i.name)].join(' ').toLowerCase()
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some((k) => haystack.includes(k.toLowerCase()))) return theme
  }
  // Deterministic fallback by ID hash so a given recipe always looks the same
  const idx = Math.abs(fallbackKey.charCodeAt(0) + fallbackKey.charCodeAt(fallbackKey.length - 1)) % CARD_THEMES.length
  return CARD_THEMES[idx]
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps, images } = data
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  const primaryImage = images.find((img) => img.is_primary) ?? images[0]
  const externalImageUrl =
    primaryImage && /^https?:\/\//i.test(primaryImage.storage_path)
      ? primaryImage.storage_path
      : null

  const theme = pickTheme(recipe.title, ingredients, id)

  return (
    <div className="library-shell">
      <header className="library-header">
        <Link href="/recipes" className="back-link">← המתכונים שלי</Link>
        <div className="library-title-row" style={{ marginTop: 12 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem,4vw,3.8rem)', letterSpacing: '-.03em', margin: 0 }}>
            {recipe.title}
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 46, height: 46 }}>
              <FavoriteButton recipeId={id} initial={recipe.is_favorite} title={recipe.title} />
            </div>
            <Link href={`/recipes/${id}/edit`} className="outline-button">עריכה</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          {recipe.category && <span className="recipe-tag">{recipe.category}</span>}
          {recipe.difficulty && (
            <span className="recipe-tag" style={{ background: '#efe4d0', color: '#7a5a1a' }}>
              {recipe.difficulty === 'קל' ? '🟢' : recipe.difficulty === 'בינוני' ? '🟡' : '🔴'} {recipe.difficulty}
            </span>
          )}
          {recipe.rating != null && (
            <span style={{ display: 'inline-flex', gap: 2, color: '#d4a01a', fontSize: '1rem' }} aria-label={`דירוג: ${recipe.rating} מתוך 5`}>
              {'★'.repeat(recipe.rating)}<span style={{ color: '#ddd' }}>{'★'.repeat(5 - recipe.rating)}</span>
            </span>
          )}
        </div>
        {recipe.description && (
          <p style={{ margin: '14px 0 0', color: 'var(--muted)', fontSize: '1.08rem', lineHeight: 1.65 }}>
            {recipe.description}
          </p>
        )}
      </header>

      <div className="library-workspace">
        <article>
          {/* Visual — real image if available, else themed illustration */}
          {externalImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={externalImageUrl}
              alt={recipe.title}
              style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 20, marginBottom: 28, display: 'block' }}
            />
          ) : (
            <div className={`recipe-visual${theme ? ` ${theme}` : ''}`}
              style={{ height: 280, borderRadius: 20, marginBottom: 28, overflow: 'hidden', isolation: 'isolate' }}>
              <div className="plate" />
              <span className="ingredient ingredient-one" />
              <span className="ingredient ingredient-two" />
              <span className="ingredient ingredient-three" />
            </div>
          )}

          {(totalTime > 0 || recipe.servings) && (
            <div style={{ marginBottom: 28 }}>
              <div className="detail-meta">
                {recipe.prep_time ? <span>הכנה: {recipe.prep_time} דק׳</span> : null}
                {recipe.cook_time ? <span>בישול: {recipe.cook_time} דק׳</span> : null}
                {totalTime > 0 ? <span>סה״כ: {totalTime} דק׳</span> : null}
                {recipe.servings ? <span>{recipe.servings} מנות</span> : null}
              </div>
            </div>
          )}

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

          {recipe.notes && (
            <section style={{ marginBottom: 32, padding: 18, borderRadius: 16, background: '#fef8ea', border: '1px dashed #d5c9b8' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', marginBottom: 8 }}>📝 הערות אישיות</h2>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#51473e', lineHeight: 1.65 }}>{recipe.notes}</p>
            </section>
          )}

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

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/recipes/${id}/cook`} className="primary-button" style={{ flex: 1, minWidth: 160 }}>
              התחל בישול
            </Link>
            <Link href={`/recipes/${id}/edit`} className="outline-button" style={{ flex: 1, minWidth: 160 }}>
              עריכת מתכון
            </Link>
          </div>
        </article>

        <aside className="recipe-detail-preview">
          {externalImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={externalImageUrl}
              alt={recipe.title}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 14, marginBottom: 16, display: 'block' }}
            />
          ) : (
            <div className={`detail-visual${theme ? ` ${theme}` : ''}`}>
              <div className="plate" />
              <span className="ingredient ingredient-one" />
              <span className="ingredient ingredient-two" />
              <span className="ingredient ingredient-three" />
            </div>
          )}
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
