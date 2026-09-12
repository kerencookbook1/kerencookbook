import { notFound, redirect } from 'next/navigation'
import { getRecipe } from '@/lib/repositories/recipes'
import { RecipeForm } from '@/components/recipes/recipe-form'
import { updateRecipe, deleteRecipe } from '@/lib/actions/recipes'
import { DeleteButton } from '@/components/recipes/delete-button'
import { RecipeImagesEditor } from '@/components/recipes/recipe-images-editor'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'עריכת מתכון — המטבח של קרן' }

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getRecipe(id)
  if (!data) notFound()

  const { recipe, ingredients, steps, images } = data

  return (
    <div className="screen-shell">
      <header className="screen-header">
        <Link href={`/recipes/${id}`} className="back-link">
          ← {recipe.title}
        </Link>
        <h1>עריכת מתכון</h1>
      </header>

      <RecipeForm
        action={updateRecipe}
        imagesSection={
          <RecipeImagesEditor
            recipeId={id}
            ownerId={user.id}
            initial={images.map((img) => ({
              id: img.id,
              storage_path: img.storage_path,
              is_primary: img.is_primary,
              position: img.position,
            }))}
          />
        }
        initial={{
          recipeId: id,
          title: recipe.title,
          description: recipe.description ?? '',
          category: recipe.category ?? null,
          difficulty: recipe.difficulty ?? null,
          rating: recipe.rating,
          notes: recipe.notes ?? '',
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          servings: recipe.servings,
          author: recipe.author,
          sourceName: recipe.source_name,
          sourceUrl: recipe.source_url,
          isDietOverride: recipe.is_diet_override,
          ingredients: ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount ?? '',
            unit: ing.unit ?? '',
          })),
          steps: steps.map((s) => ({
            title: s.title ?? '',
            body: s.body,
            durationSeconds: s.duration_seconds,
          })),
        }}
      />

      <div style={{ padding: '0 16px 80px', maxWidth: 640, margin: '0 auto' }}>
        <DeleteButton recipeId={id} action={deleteRecipe} />
      </div>
    </div>
  )
}
