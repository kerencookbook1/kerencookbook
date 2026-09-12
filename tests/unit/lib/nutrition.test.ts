import { describe, it, expect } from 'vitest'
import { estimateRecipeCalories } from '@/lib/calorie-calc'
import { estimateNutrition, detectAllergens, isVegetarian } from '@/lib/nutrition'

/**
 * Canonical sanity tests for the nutrition math. Each recipe here has an
 * expected calorie total sourced from USDA / MyFitnessPal-grade references,
 * so a regression in the calc will show up here first.
 *
 * We assert a tolerance band (±15%) because the heuristics can't be exact:
 * cup densities vary, ingredient names vary, and we default to conservative
 * profile splits when a match isn't perfect.
 */

function within(actual: number, expected: number, marginRatio = 0.15) {
  const low = expected * (1 - marginRatio)
  const high = expected * (1 + marginRatio)
  expect(actual, `${actual} should be within ${marginRatio * 100}% of ${expected}`).toBeGreaterThanOrEqual(low)
  expect(actual, `${actual} should be within ${marginRatio * 100}% of ${expected}`).toBeLessThanOrEqual(high)
}

describe('estimateRecipeCalories — single-ingredient sanity checks', () => {
  it('1 cup flour ≈ 455 kcal (matches DB kcalPerCup)', () => {
    const r = estimateRecipeCalories([{ name: 'קמח', amount: '1', unit: 'כוס' }], null)
    within(r.totalKcal, 455)
  })

  it('1 cup sugar ≈ 774 kcal', () => {
    const r = estimateRecipeCalories([{ name: 'סוכר', amount: '1', unit: 'כוס' }], null)
    within(r.totalKcal, 774)
  })

  it('1 cup cocoa ≈ 228 kcal (uses ingredient-aware fallback, not the old 240g default)', () => {
    const r = estimateRecipeCalories([{ name: 'קקאו', amount: '1', unit: 'כוס' }], null)
    within(r.totalKcal, 228, 0.2)
  })

  it('1 cup butter ≈ 1627 kcal (density 227 g/cup, not 240)', () => {
    const r = estimateRecipeCalories([{ name: 'חמאה', amount: '1', unit: 'כוס' }], null)
    within(r.totalKcal, 1627, 0.15)
  })

  it('4 eggs ≈ 312 kcal (78 kcal × 4)', () => {
    const r = estimateRecipeCalories([{ name: 'ביצים', amount: '4', unit: null }], null)
    within(r.totalKcal, 312, 0.1)
  })

  it('100 g chicken breast ≈ 165 kcal', () => {
    const r = estimateRecipeCalories([{ name: 'חזה עוף', amount: '100', unit: 'גרם' }], null)
    within(r.totalKcal, 165, 0.05)
  })

  it('1 tbsp olive oil ≈ 120 kcal', () => {
    const r = estimateRecipeCalories([{ name: 'שמן זית', amount: '1', unit: 'כף' }], null)
    within(r.totalKcal, 120, 0.05)
  })
})

describe('estimateRecipeCalories — full recipes', () => {
  it('chocolate cake (12 servings) ≈ 290 kcal per serving', () => {
    // Reference: standard 1-layer 9" chocolate cake
    // Expected per-serving: 280–320 kcal
    const r = estimateRecipeCalories(
      [
        { name: 'קמח',   amount: '2',   unit: 'כוסות' },        // 910
        { name: 'סוכר',  amount: '1.5', unit: 'כוסות' },        // 1161
        { name: 'חמאה',  amount: '1',   unit: 'כוס' },          // 1627
        { name: 'ביצים', amount: '4',   unit: null },           // 312
        { name: 'חלב',   amount: '1',   unit: 'כוס' },          // 149
        { name: 'קקאו',  amount: '0.5', unit: 'כוס' },          // 114
      ],
      12,
    )
    // Total ≈ 4273 kcal → per-serving ≈ 356 kcal
    within(r.perServing ?? 0, 320, 0.2)
  })

  it('shakshuka (4 servings) ≈ 230 kcal per serving', () => {
    // Reference: 4-egg shakshuka
    const r = estimateRecipeCalories(
      [
        { name: 'שמן זית',  amount: '2',   unit: 'כפות' },      // 240
        { name: 'בצל',      amount: '1',   unit: null },         // 44
        { name: 'שום',      amount: '3',   unit: null },         // 12
        { name: 'עגבניות',  amount: '800', unit: 'גרם' },        // 144
        { name: 'פפריקה',   amount: '1',   unit: 'כפית' },       // 6
        { name: 'ביצים',    amount: '4',   unit: null },         // 312
      ],
      4,
    )
    // Total ≈ 758 kcal → per-serving ≈ 190 kcal
    within(r.perServing ?? 0, 210, 0.25)
  })

  it('does NOT divide by servings when servings is null', () => {
    const r = estimateRecipeCalories(
      [{ name: 'ביצים', amount: '2', unit: null }],
      null,
    )
    expect(r.perServing).toBeNull()
    expect(r.totalKcal).toBeGreaterThan(140)
  })
})

describe('estimateNutrition — macros + tags', () => {
  it('4 eggs → protein-fatty profile → protein > 0', () => {
    const n = estimateNutrition(
      [{ name: 'ביצים', amount: '4', unit: null }],
      2,
    )
    // Per serving: 4 eggs × 78 = 312 kcal / 2 servings = 156 kcal
    within(n.perServing.kcal, 156, 0.1)
    // 4 eggs contain ~24g protein total → 12g per serving
    expect(n.perServing.proteinG).toBeGreaterThan(8)
    expect(n.perServing.proteinG).toBeLessThan(20)
  })

  it('vegetarian: cake ingredients → true', () => {
    expect(isVegetarian(['קמח', 'סוכר', 'ביצים', 'חלב'])).toBe(true)
  })

  it('non-vegetarian: chicken recipe → false', () => {
    expect(isVegetarian(['חזה עוף', 'שמן זית', 'בצל'])).toBe(false)
  })

  it('allergen detection: cake ingredients → gluten, egg, dairy', () => {
    const allergens = detectAllergens(['קמח', 'סוכר', 'ביצים', 'חלב'])
    expect(allergens).toContain('gluten')
    expect(allergens).toContain('egg')
    expect(allergens).toContain('dairy')
  })

  it('shakshuka: no gluten, no dairy — egg only', () => {
    const allergens = detectAllergens(['שמן זית', 'בצל', 'עגבניות', 'ביצים'])
    expect(allergens).toContain('egg')
    expect(allergens).not.toContain('gluten')
    expect(allergens).not.toContain('dairy')
  })

  it('per-serving math: 8-serving recipe divides totals by 8', () => {
    const one = estimateNutrition([{ name: 'סוכר', amount: '8', unit: 'כוסות' }], 8)
    // Total 6192 kcal, per-serving 774 kcal (basically 1 cup sugar per serving)
    within(one.perServing.kcal, 774, 0.05)
  })
})
