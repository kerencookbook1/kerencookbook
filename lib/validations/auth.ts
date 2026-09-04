import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
  rememberMe: z.boolean().default(false),
})

export const registerSchema = z
  .object({
    displayName: z.string().min(2, 'השם חייב להכיל לפחות 2 תווים'),
    email: z.string().email('כתובת אימייל לא תקינה'),
    password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'הסיסמאות אינן תואמות',
        path: ['confirmPassword'],
      })
    }
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'הסיסמאות אינן תואמות',
        path: ['confirmPassword'],
      })
    }
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
