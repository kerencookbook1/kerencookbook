import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'pass123', rememberMe: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('כתובת אימייל לא תקינה')
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345', rememberMe: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('הסיסמה חייבת להכיל לפחות 6 תווים')
  })

  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456', rememberMe: true })
    expect(result.success).toBe(true)
  })
})

describe('registerSchema', () => {
  it('rejects short display name', () => {
    const result = registerSchema.safeParse({ displayName: 'א', email: 'a@b.com', password: '123456', confirmPassword: '123456' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('השם חייב להכיל לפחות 2 תווים')
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ displayName: 'קרן', email: 'a@b.com', password: '123456', confirmPassword: '999999' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('הסיסמאות אינן תואמות')
  })

  it('accepts valid input', () => {
    const result = registerSchema.safeParse({ displayName: 'קרן', email: 'a@b.com', password: '123456', confirmPassword: '123456' })
    expect(result.success).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'a@b.com' })
    expect(result.success).toBe(true)
  })
})

describe('resetPasswordSchema', () => {
  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({ password: '123456', confirmPassword: '999999' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('הסיסמאות אינן תואמות')
  })

  it('accepts matching passwords', () => {
    const result = resetPasswordSchema.safeParse({ password: '123456', confirmPassword: '123456' })
    expect(result.success).toBe(true)
  })
})
