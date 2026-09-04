import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('createClient (browser)', () => {
  it('returns a supabase client object', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
  })
})
