import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/repositories/recipes'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  return { title: data ? `${data.recipe.title} — המטבח של קרן` : 'מתכון לא נמצא' }
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps } = data
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <div className="screen-shell">
      <header className="screen-header">
        <Link href="/recipes" className="back-link">
          ← המתכונים שלי
        </Link>
        <div className="detail-recipe-actions">
          <Link href={`/recipes/${id}/edit`} className="outline-button">
            עריכה
          </Link>
        </div>
      </header>

      <div className="recipe-photo-placeholder" aria-hidden />

      <div className="detail-content">
        <h1 className="detail-title">{recipe.title}</h1>

        {recipe.description && (
          <p className="detail-description">{recipe.description}</p>
        )}

        {(totalTime > 0 || recipe.servings) && (
          <div className="detail-meta">
            {recipe.prep_time ? <span>הכנה: {recipe.prep_time} דק׳</span> : null}
            {recipe.cook_time ? <span>בישול: {recipe.cook_time} דק׳</span> : null}
            {totalTime > 0 ? <span>סה״כ: {totalTime} דק׳</span> : null}
            {recipe.servings ? <span>{recipe.servings} מנות</span> : null}
          </div>
        )}

        {ingredients.length > 0 && (
          <section>
            <h2 className="section-heading">מרכיבים</h2>
            <ul className="ingredients-list">
              {ingredients.map((ing) => (
                <li key={ing.id}>
                  {ing.amount && <span className="ing-amount">{ing.amount}</span>}
                  {ing.unit && <span className="ing-unit"> {ing.unit}</span>}
                  <span> {ing.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {steps.length > 0 && (
          <section>
            <h2 className="section-heading">הוראות הכנה</h2>
            <ol className="steps-list">
              {steps.map((step) => (
                <li key={step.id}>
                  <div>
                    {step.title && <strong>{step.title}</strong>}
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <div className="detail-footer-actions">
        <Link href={`/recipes/${id}/cook`} className="primary-button">
          התחל בישול
        </Link>
      </div>
    </div>
  )
}
