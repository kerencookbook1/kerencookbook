import { RecipeForm } from '@/components/recipes/recipe-form'
import { createRecipe } from '@/lib/actions/recipes'
import Link from 'next/link'

export const metadata = { title: 'מתכון חדש — המטבח של קרן' }

export default function NewRecipePage() {
  return (
    <div className="screen-shell">
      <header className="screen-header">
        <Link href="/recipes" className="back-link">
          ← המתכונים שלי
        </Link>
        <h1>מתכון חדש</h1>
      </header>
      <RecipeForm action={createRecipe} />
    </div>
  )
}
