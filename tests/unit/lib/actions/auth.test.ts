import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks must be declared before imports
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()
const mockInsert = vi.fn()

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
    from: () => ({ insert: mockInsert }),
  })),
}))

import { redirect } from 'next/navigation'
import { login, register, logout, forgotPassword, resetPassword } from '@/lib/actions/auth'

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

describe('login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for invalid email format', async () => {
    const result = await login(null, makeFormData({ email: 'bad', password: '123456' }))
    expect(result?.error).toBeDefined()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns Hebrew error for wrong credentials', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const result = await login(null, makeFormData({ email: 'a@b.com', password: 'wrongpass' }))
    expect(result?.error).toBe('אימייל או סיסמה שגויים')
  })

  it('redirects to / on success', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    await login(null, makeFormData({ email: 'a@b.com', password: '123456' }))
    expect(redirect).toHaveBeenCalledWith('/')
  })
})

describe('register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for password mismatch', async () => {
    const result = await register(null, makeFormData({
      displayName: 'קרן', email: 'a@b.com',
      password: '123456', confirmPassword: '999999',
    }))
    expect(result?.error).toBe('הסיסמאות אינן תואמות')
  })

  it('returns Hebrew error for duplicate email', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' }, data: {} })
    const result = await register(null, makeFormData({
      displayName: 'קרן', email: 'a@b.com',
      password: '123456', confirmPassword: '123456',
    }))
    expect(result?.error).toBe('כתובת האימייל כבר רשומה במערכת')
  })

  it('creates profile and redirects on success (email confirmation off)', async () => {
    mockSignUp.mockResolvedValue({ error: null, data: { user: { id: 'uid-123' }, session: { access_token: 'tok' } } })
    mockInsert.mockResolvedValue({ error: null })
    await register(null, makeFormData({
      displayName: 'קרן', email: 'a@b.com',
      password: '123456', confirmPassword: '123456',
    }))
    expect(mockInsert).toHaveBeenCalledWith({ id: 'uid-123', display_name: 'קרן' })
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('returns success when email confirmation required (no session)', async () => {
    mockSignUp.mockResolvedValue({ error: null, data: { user: { id: 'uid-123' }, session: null } })
    mockInsert.mockResolvedValue({ error: null })
    const result = await register(null, makeFormData({
      displayName: 'קרן', email: 'a@b.com',
      password: '123456', confirmPassword: '123456',
    }))
    expect(result?.success).toBe(true)
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('logout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs out and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({})
    await logout()
    expect(mockSignOut).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})

describe('forgotPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for invalid email', async () => {
    const result = await forgotPassword(null, makeFormData({ email: 'bad' }))
    expect(result?.error).toBeDefined()
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('always returns success for valid email (prevents enumeration)', async () => {
    mockResetPasswordForEmail.mockResolvedValue({})
    const result = await forgotPassword(null, makeFormData({ email: 'a@b.com' }))
    expect(result?.success).toBe(true)
    expect(result?.error).toBeUndefined()
  })
})

describe('resetPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for password mismatch', async () => {
    const result = await resetPassword(null, makeFormData({ password: '123456', confirmPassword: '999999' }))
    expect(result?.error).toBe('הסיסמאות אינן תואמות')
  })

  it('returns Hebrew error for expired token', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'Token expired' } })
    const result = await resetPassword(null, makeFormData({ password: '123456', confirmPassword: '123456' }))
    expect(result?.error).toBe('הקישור פג תוקף, בקש קישור חדש')
  })

  it('redirects to /login on success', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })
    await resetPassword(null, makeFormData({ password: '123456', confirmPassword: '123456' }))
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
