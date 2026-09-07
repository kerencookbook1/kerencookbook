'use client'

import { useActionState, useState } from 'react'
import { IngredientFields } from './ingredient-fields'
import { StepFields } from './step-fields'
import type { RecipeActionState } from '@/lib/actions/recipes'
import type { IngredientItem, StepItem } from '@/lib/validations/recipes'
import { CATEGORIES } from '@/lib/categories'

type RecipeFormInitial = {
  recipeId?: string
  title?: string
  description?: string
  category?: string | null
  difficulty?: string | null
  rating?: number | null
  notes?: string | null
  prepTime?: number | null
  cookTime?: number | null
  servings?: number | null
  ingredients?: IngredientItem[]
  steps?: StepItem[]
}

type Props = {
  action: (prev: RecipeActionState, formData: FormData) => Promise<RecipeActionState>
  initial?: RecipeFormInitial
}

export function RecipeForm({ action, initial = {} }: Props) {
  const [state, formAction, isPending] = useActionState<RecipeActionState, FormData>(
    action,
    null
  )
  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initial.ingredients ?? [{ name: '', amount: '', unit: '' }]
  )
  const [steps, setSteps] = useState<StepItem[]>(
    initial.steps ?? [{ title: '', body: '', durationSeconds: null }]
  )

  return (
    <form action={formAction} className="recipe-editor-form">
      {state?.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}

      {initial.recipeId && (
        <input type="hidden" name="recipeId" value={initial.recipeId} />
      )}
      <input type="hidden" name="ingredientsJson" value={JSON.stringify(ingredients)} />
      <input type="hidden" name="stepsJson" value={JSON.stringify(steps)} />

      <section className="form-section">
        <label>
          שם המתכון *
          <input
            type="text"
            name="title"
            defaultValue={initial.title ?? ''}
            required
            autoFocus
          />
        </label>

        <label>
          תיאור קצר
          <textarea
            name="description"
            defaultValue={initial.description ?? ''}
            rows={3}
            placeholder="מה מיוחד במתכון הזה?"
          />
        </label>

        <label>
          קטגוריה
          <select name="category" defaultValue={initial.category ?? ''}>
            <option value="">בלי קטגוריה</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.id}</option>
            ))}
          </select>
        </label>

        <div className="time-servings-row">
          <label>
            רמת קושי
            <select name="difficulty" defaultValue={initial.difficulty ?? ''}>
              <option value="">לא מוגדר</option>
              <option value="קל">🟢 קל</option>
              <option value="בינוני">🟡 בינוני</option>
              <option value="קשה">🔴 קשה</option>
            </select>
          </label>
          <label>
            דירוג (1-5 ⭐)
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              step="1"
              defaultValue={initial.rating ?? ''}
              placeholder="—"
            />
          </label>
        </div>

        <div className="time-servings-row">
          <label>
            זמן הכנה (דק׳)
            <input
              type="number"
              name="prepTime"
              min="0"
              defaultValue={initial.prepTime ?? ''}
              placeholder="10"
            />
          </label>
          <label>
            זמן בישול (דק׳)
            <input
              type="number"
              name="cookTime"
              min="0"
              defaultValue={initial.cookTime ?? ''}
              placeholder="30"
            />
          </label>
          <label>
            מנות
            <input
              type="number"
              name="servings"
              min="1"
              defaultValue={initial.servings ?? ''}
              placeholder="4"
            />
          </label>
        </div>
      </section>

      <section className="form-section">
        <label>
          הערות אישיות
          <textarea
            name="notes"
            defaultValue={initial.notes ?? ''}
            rows={3}
            placeholder="שינויים, טיפים, מה עבד ומה לא בפעם האחרונה…"
          />
        </label>
      </section>

      <section className="form-section">
        <h2 className="section-heading">מרכיבים</h2>
        <IngredientFields
          initial={initial.ingredients ?? []}
          onChange={setIngredients}
        />
      </section>

      <section className="form-section">
        <h2 className="section-heading">הוראות הכנה</h2>
        <StepFields
          initial={initial.steps ?? []}
          onChange={setSteps}
        />
      </section>

      <div className="form-actions">
        <button type="submit" disabled={isPending} className="primary-button">
          {isPending ? 'שומר...' : 'שמור מתכון'}
        </button>
      </div>
    </form>
  )
}
