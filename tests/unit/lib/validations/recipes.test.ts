import { describe, it, expect } from 'vitest'
import {
  recipeFormSchema,
  ingredientItemSchema,
  stepItemSchema,
} from '@/lib/validations/recipes'

describe('recipeFormSchema', () => {
  it('rejects empty title', () => {
    const result = recipeFormSchema.safeParse({
      title: '',
      ingredientsJson: '[]',
      stepsJson: '[]',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('שם המתכון הוא שדה חובה')
  })

  it('accepts minimal valid recipe', () => {
    const result = recipeFormSchema.safeParse({
      title: 'שקשוקה',
      ingredientsJson: '[]',
      stepsJson: '[]',
    })
    expect(result.success).toBe(true)
  })

  it('coerces prepTime string to number', () => {
    const result = recipeFormSchema.safeParse({
      title: 'שקשוקה',
      prepTime: '30',
      ingredientsJson: '[]',
      stepsJson: '[]',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.prepTime).toBe(30)
  })

  it('accepts null for prepTime', () => {
    const result = recipeFormSchema.safeParse({
      title: 'שקשוקה',
      prepTime: null,
      ingredientsJson: '[]',
      stepsJson: '[]',
    })
    expect(result.success).toBe(true)
  })
})

describe('ingredientItemSchema', () => {
  it('rejects empty name', () => {
    const result = ingredientItemSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('שם מרכיב הוא שדה חובה')
  })

  it('accepts name only', () => {
    const result = ingredientItemSchema.safeParse({ name: 'ביצים' })
    expect(result.success).toBe(true)
  })

  it('accepts full ingredient', () => {
    const result = ingredientItemSchema.safeParse({
      name: 'קמח',
      amount: '2',
      unit: 'כוסות',
    })
    expect(result.success).toBe(true)
  })
})

describe('stepItemSchema', () => {
  it('rejects empty body', () => {
    const result = stepItemSchema.safeParse({ body: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('תיאור השלב הוא שדה חובה')
  })

  it('accepts step with body only', () => {
    const result = stepItemSchema.safeParse({ body: 'מחממים תנור ל-180' })
    expect(result.success).toBe(true)
  })
})
