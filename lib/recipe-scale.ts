/**
 * Servings scaler — recomputes ingredient amounts for a different serving
 * count without touching the stored recipe. Original values are always
 * returned alongside the scaled ones so the UI can show both.
 *
 * The math reuses parseAmount/formatAmount from shopping-normalize.
 */

import { parseAmount, formatAmount } from './shopping-normalize'

export type ScaledAmount = {
  originalAmount: string | null
  scaledAmount: string | null
  numeric: number | null   // scaled numeric value when it was parseable
  /**
   * True when the ingredient is measured in "whole units" (no unit or a
   * unit like ביצה/שן/פרוסה) and the scaled value has a fractional part.
   * The UI shows a round-up affordance for these.
   */
  isFractionalWhole: boolean
}

export type ScaledIngredient = ScaledAmount & {
  name: string
  unit: string | null
}

// Units that imply "one whole item"; a fractional scaled value here is
// awkward IRL ("1.5 ביצים") so the UI offers a round-up.
const WHOLE_UNIT_TOKENS = new Set(
  [
    'יחידה', 'יחידות',
    'שן', 'שיני',
    'פרוסה', 'פרוסות',
    'ביצה', 'ביצים',
    'unit', 'units', 'piece', 'pieces',
  ].map((t) => t.toLowerCase())
)

function isWholeUnit(unit: string | null | undefined): boolean {
  if (!unit || !unit.trim()) return true  // no unit = counting items
  return WHOLE_UNIT_TOKENS.has(unit.trim().toLowerCase())
}

export function scaleAmount(
  original: string | null | undefined,
  factor: number,
  unit: string | null | undefined,
): ScaledAmount {
  const rawOriginal = original?.trim() || null
  const numericOriginal = parseAmount(rawOriginal)

  // Non-numeric ("קורט", "לפי הטעם") — pass through unchanged.
  if (numericOriginal == null) {
    return {
      originalAmount: rawOriginal,
      scaledAmount: rawOriginal,
      numeric: null,
      isFractionalWhole: false,
    }
  }

  const scaled = numericOriginal * factor
  const rounded = Math.round(scaled * 100) / 100
  const hasFraction = !Number.isInteger(rounded)
  const isFractionalWhole = hasFraction && isWholeUnit(unit)

  return {
    originalAmount: rawOriginal,
    scaledAmount: formatAmount(rounded),
    numeric: rounded,
    isFractionalWhole,
  }
}

export function scaleIngredients(
  ingredients: Array<{ name: string; amount: string | null; unit: string | null }>,
  factor: number,
): ScaledIngredient[] {
  return ingredients.map((ing) => ({
    ...scaleAmount(ing.amount, factor, ing.unit),
    name: ing.name,
    unit: ing.unit,
  }))
}

export function computeFactor(originalServings: number | null | undefined, target: number): number | null {
  if (!originalServings || originalServings <= 0) return null
  if (!Number.isFinite(target) || target <= 0) return null
  return target / originalServings
}
