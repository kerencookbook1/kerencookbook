/**
 * Estimate the calories in a recipe from its parsed ingredients.
 *
 * The math is deliberately transparent: for each ingredient we pick the
 * unit column that matches (kcalPerCup / kcalPerTbsp / kcalPerTsp /
 * kcalPerUnit / kcalPer100g) and multiply by the parsed amount. Unknowns
 * are reported so the user knows what wasn't counted.
 */

import { findCalorieRow, type CalorieRow } from './calories'
import { parseAmount } from './shopping-normalize'
import { stripDescriptors } from './shopping-normalize'

export type IngredientForCalories = {
  name: string
  amount: string | null
  unit: string | null
}

export type IngredientCalorieEstimate = {
  name: string
  amount: string | null
  unit: string | null
  kcal: number | null   // null when we could not estimate
  matchedName?: string  // the DB row used, when matched
  reason?: 'no-match' | 'no-amount' | 'unknown-unit'
}

export type RecipeCalorieEstimate = {
  totalKcal: number
  perServing: number | null
  servings: number | null
  matchedCount: number
  unmatchedCount: number
  breakdown: IngredientCalorieEstimate[]
}

// Unit alias groups — Hebrew + English shorthand → canonical bucket
const UNIT_GROUPS: Record<'cup' | 'tbsp' | 'tsp' | 'gram' | 'kilo' | 'ml' | 'liter' | 'unit', string[]> = {
  cup:   ['כוס', 'כוסות', 'cup', 'cups'],
  tbsp:  ['כף', 'כפות', 'tbsp', 'tbs', 'tablespoon', 'tablespoons'],
  tsp:   ['כפית', 'כפיות', 'tsp', 'teaspoon', 'teaspoons'],
  gram:  ['גרם', "ג'", 'ג׳', 'g', 'gram', 'grams'],
  kilo:  ['ק"ג', 'קילו', 'קילוגרם', 'kg', 'kilo', 'kilogram', 'kilograms'],
  ml:    ['מ"ל', 'מיליליטר', 'ml', 'milliliter', 'milliliters'],
  liter: ['ליטר', 'ליטרים', 'l', 'liter', 'liters'],
  unit:  ['יחידה', 'יחידות', 'שן', 'שיני', 'פרוסה', 'פרוסות', 'unit', 'units', 'piece', 'pieces'],
}

function classifyUnit(unit: string | null): keyof typeof UNIT_GROUPS | null {
  if (!unit) return null
  const u = unit.trim().toLowerCase()
  for (const [group, tokens] of Object.entries(UNIT_GROUPS)) {
    if (tokens.some((t) => t.toLowerCase() === u)) return group as keyof typeof UNIT_GROUPS
  }
  return null
}

function kcalFromRow(row: CalorieRow, amount: number, group: keyof typeof UNIT_GROUPS | null): number | null {
  switch (group) {
    case 'cup':
      if (row.kcalPerCup != null) return row.kcalPerCup * amount
      if (row.kcalPer100g != null) return (row.kcalPer100g * 240 * amount) / 100  // approx 240g per cup for solids
      return null
    case 'tbsp':
      if (row.kcalPerTbsp != null) return row.kcalPerTbsp * amount
      if (row.kcalPer100g != null) return (row.kcalPer100g * 15 * amount) / 100
      return null
    case 'tsp':
      if (row.kcalPerTsp != null) return row.kcalPerTsp * amount
      if (row.kcalPerTbsp != null) return (row.kcalPerTbsp * amount) / 3
      if (row.kcalPer100g != null) return (row.kcalPer100g * 5 * amount) / 100
      return null
    case 'gram':
      if (row.kcalPer100g != null) return (row.kcalPer100g * amount) / 100
      return null
    case 'kilo':
      if (row.kcalPer100g != null) return row.kcalPer100g * 10 * amount
      return null
    case 'ml':
      if (row.kcalPer100g != null) return (row.kcalPer100g * amount) / 100
      return null
    case 'liter':
      if (row.kcalPer100g != null) return row.kcalPer100g * 10 * amount
      return null
    case 'unit':
      if (row.kcalPerUnit != null) return row.kcalPerUnit * amount
      return null
    case null:
      // No unit — treat as "units of the ingredient" if a per-unit value exists.
      if (row.kcalPerUnit != null) return row.kcalPerUnit * amount
      return null
  }
}

export function estimateIngredientCalories(input: IngredientForCalories): IngredientCalorieEstimate {
  const cleaned = stripDescriptors(input.name)
  const row = findCalorieRow(cleaned) ?? findCalorieRow(input.name)

  if (!row) {
    return { name: input.name, amount: input.amount, unit: input.unit, kcal: null, reason: 'no-match' }
  }

  const qty = parseAmount(input.amount) ?? (input.amount ? null : 1) // no amount → assume 1
  if (qty == null) {
    return { name: input.name, amount: input.amount, unit: input.unit, kcal: null, matchedName: row.name, reason: 'no-amount' }
  }

  const group = classifyUnit(input.unit)
  const kcal = kcalFromRow(row, qty, group)
  if (kcal == null) {
    return { name: input.name, amount: input.amount, unit: input.unit, kcal: null, matchedName: row.name, reason: 'unknown-unit' }
  }

  return {
    name: input.name,
    amount: input.amount,
    unit: input.unit,
    kcal: Math.round(kcal),
    matchedName: row.name,
  }
}

export function estimateRecipeCalories(
  ingredients: IngredientForCalories[],
  servings: number | null,
): RecipeCalorieEstimate {
  const breakdown = ingredients.map(estimateIngredientCalories)
  const totalKcal = breakdown.reduce((sum, item) => sum + (item.kcal ?? 0), 0)
  const matchedCount = breakdown.filter((b) => b.kcal != null).length
  const unmatchedCount = breakdown.length - matchedCount
  const perServing = servings && servings > 0 ? Math.round(totalKcal / servings) : null

  return {
    totalKcal: Math.round(totalKcal),
    perServing,
    servings,
    matchedCount,
    unmatchedCount,
    breakdown,
  }
}
