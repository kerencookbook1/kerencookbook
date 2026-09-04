import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// Build a fluent Supabase mock chain
function makeChain(resolveWith: { data: unknown; error: null | object }) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.single = vi.fn().mockResolvedValue(resolveWith)
  chain.insert = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.delete = vi.fn(() => chain)
  // Make the chain itself awaitable (for .delete().eq() which is awaited directly)
  Object.defineProperty(chain, 'then', {
    get() {
      return (resolve: (v: unknown) => void) =>
        Promise.resolve(resolveWith).then(resolve)
    },
  })
  return chain
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => makeChain({ data: { id: 'recipe-123' }, error: null })),
  })),
}))

import { redirect } from 'next/navigation'
import { createRecipe, updateRecipe, deleteRecipe } from '@/lib/actions/recipes'

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

const validFields = {
  title: 'שקשוקה',
  description: 'ארוחת בוקר',
  prepTime: '10',
  cookTime: '20',
  servings: '2',
  ingredientsJson: JSON.stringify([{ name: 'ביצים', amount: '4', unit: '' }]),
  stepsJson: JSON.stringify([{ title: '', body: 'מחממים את הרוטב', durationSeconds: null }]),
}

describe('createRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await createRecipe(null, makeFormData(validFields))
    expect(result?.error).toBe('לא מחובר')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns error for empty title', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const result = await createRecipe(
      null,
      makeFormData({ ...validFields, title: '' })
    )
    expect(result?.error).toBe('שם המתכון הוא שדה חובה')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects to recipe page on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    await createRecipe(null, makeFormData(validFields))
    expect(redirect).toHaveBeenCalledWith('/recipes/recipe-123')
  })
})

describe('updateRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await updateRecipe(
      null,
      makeFormData({ ...validFields, recipeId: 'r1' })
    )
    expect(result?.error).toBe('לא מחובר')
  })

  it('returns error for empty title', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const result = await updateRecipe(
      null,
      makeFormData({ ...validFields, recipeId: 'r1', title: '' })
    )
    expect(result?.error).toBe('שם המתכון הוא שדה חובה')
  })

  it('redirects to recipe page on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    await updateRecipe(null, makeFormData({ ...validFields, recipeId: 'r1' }))
    expect(redirect).toHaveBeenCalledWith('/recipes/r1')
  })
})

describe('deleteRecipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /recipes after delete', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    await deleteRecipe('r1')
    expect(redirect).toHaveBeenCalledWith('/recipes')
  })
})
