'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/lib/actions/auth'
import type { AuthActionState } from '@/lib/actions/auth'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(forgotPassword, null)

  if (state?.success) {
    return (
      <div>
        <p className="auth-success">
          אם כתובת האימייל רשומה במערכת, ישלח אליה קישור לאיפוס הסיסמה תוך מספר דקות.
        </p>
        <div className="auth-links" style={{ marginTop: '20px' }}>
          <span />
          <Link href="/login">חזרה לכניסה</Link>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="auth-form">
      {state?.error && <p className="auth-error" role="alert">{state.error}</p>}

      <label>
        אימייל
        <input type="email" name="email" autoComplete="email" required />
      </label>

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? 'שולח...' : 'שלח קישור לאיפוס'}
      </button>

      <div className="auth-links">
        <span />
        <Link href="/login">חזרה לכניסה</Link>
      </div>
    </form>
  )
}
