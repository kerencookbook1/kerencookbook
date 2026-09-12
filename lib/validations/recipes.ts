import { z } from 'zod'

export const ingredientItemSchema = z.object({
  name: z.string().min(1, 'שם מרכיב הוא שדה חובה'),
  amount: z.string().optional().default(''),
  unit: z.string().optional().default(''),
})

export const stepItemSchema = z.object({
  title: z.string().optional().default(''),
  body: z.string().min(1, 'תיאור השלב הוא שדה חובה'),
  durationSeconds: z.number().int().min(0).nullable().optional(),
})

export const recipeFormSchema = z.object({
  title: z.string().min(1, 'שם המתכון הוא שדה חובה'),
  description: z.string().optional().default(''),
  category: z.string().nullable().optional(),
  difficulty: z.enum(['קל', 'בינוני', 'קשה']).nullable().optional(),
  rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().optional().default(''),
  prepTime: z.coerce.number().int().min(0).nullable().optional(),
  cookTime: z.coerce.number().int().min(0).nullable().optional(),
  servings: z.coerce.number().int().min(1).nullable().optional(),
  author: z.string().optional().default(''),
  sourceName: z.string().optional().default(''),
  sourceUrl: z.string().optional().default(''),
  ingredientsJson: z.string(),
  stepsJson: z.string(),
  isDietOverride: z.enum(['auto', 'on', 'off']).default('auto'),
})

export type RecipeFormInput = z.infer<typeof recipeFormSchema>
export type IngredientItem = z.infer<typeof ingredientItemSchema>
export type StepItem = z.infer<typeof stepItemSchema>
