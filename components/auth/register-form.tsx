'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/auth'
import type { AuthActionState } from '@/lib/actions/auth'
import Link from 'next/link'

export function RegisterForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(register, null)

  if (state?.success) {
    return (
      <div>
        <p className="auth-success">
          נשלח אימייל אימות לכתובת שהזנת. אנא אשרי את הכתובת ואז כנסי לאפליקציה.
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
        שם תצוגה
        <input type="text" name="displayName" autoComplete="name" required minLength={2} />
      </label>

      <label>
        אימייל
        <input type="email" name="email" autoComplete="email" required />
      </label>

      <label>
        סיסמה
        <input type="password" name="password" autoComplete="new-password" required minLength={6} />
      </label>

      <label>
        אימות סיסמה
        <input type="password" name="confirmPassword" autoComplete="new-password" required minLength={6} />
      </label>

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? 'נרשם...' : 'הרשמה'}
      </button>

      <div className="auth-links">
        <span />
        <Link href="/login">יש לך כבר חשבון? כניסה</Link>
      </div>
    </form>
  )
}
