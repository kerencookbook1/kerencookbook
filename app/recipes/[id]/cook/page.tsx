import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/repositories/recipes'
import { CookMode } from '@/components/cook-mode'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  return { title: data ? `בישול: ${data.recipe.title}` : 'מתכון לא נמצא' }
}

export default async function CookPage({ params }: Props) {
  const { id } = await params
  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps } = data

  return (
    <CookMode
      recipeId={id}
      recipeTitle={recipe.title}
      ingredients={ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount ?? null,
        unit: ing.unit ?? null,
      }))}
      steps={steps.map((step) => ({
        id: step.id,
        title: step.title ?? null,
        body: step.body,
        duration_seconds: step.duration_seconds ?? null,
      }))}
      defaultServings={recipe.servings ?? 4}
    />
  )
}
