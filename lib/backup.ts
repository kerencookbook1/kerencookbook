/**
 * Shared shapes for backup export / restore. Version is stored so that
 * future changes to the format can be detected and migrated on restore.
 */

export const BACKUP_VERSION = 1

export type BackupIngredient = {
  name: string
  amount: string | null
  unit: string | null
  position: number
}

export type BackupStep = {
  title: string | null
  body: string
  duration_seconds: number | null
  position: number
}

export type BackupImage = {
  storage_path: string
  is_primary: boolean
  position: number
}

export type BackupRecipe = {
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  rating: number | null
  notes: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  status: string
  is_favorite: boolean
  is_diet_auto: boolean
  is_diet_override: boolean | null
  created_at: string
  updated_at: string
  ingredients: BackupIngredient[]
  steps: BackupStep[]
  images: BackupImage[]
}

export type BackupShoppingItem = {
  name: string
  amount: string | null
  unit: string | null
  aisle: string | null
  is_checked: boolean
  created_at: string
}

export type BackupMealPlan = {
  date: string
  meal_type: string
  recipe_title: string  // stored by title so restore can rewire on import
  created_at: string
}

export type BackupProfile = {
  display_name: string | null
  avatar_url: string | null
}

export type FullBackup = {
  version: number
  kind: 'full'
  exportedAt: string
  profile: BackupProfile | null
  recipes: BackupRecipe[]
  shopping_items: BackupShoppingItem[]
  meal_plans: BackupMealPlan[]
}

export type RecipesBackup = {
  version: number
  kind: 'recipes'
  exportedAt: string
  recipes: BackupRecipe[]
}

export type AnyBackup = FullBackup | RecipesBackup
