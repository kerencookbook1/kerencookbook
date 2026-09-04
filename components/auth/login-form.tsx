'use client'

import { useActionState } from 'react'
import { login } from '@/lib/actions/auth'
import type { AuthActionState } from '@/lib/actions/auth'
import Link from 'next/link'

export function LoginForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(login, null)

  return (
    <form action={action} className="auth-form">
      {state?.error && <p className="auth-error" role="alert">{state.error}</p>}

      <label>
        אימייל
        <input type="email" name="email" autoComplete="email" required />
      </label>

      <label>
        סיסמה
        <input type="password" name="password" autoComplete="current-password" required />
      </label>

      <label className="auth-checkbox">
        <input type="checkbox" name="rememberMe" />
        זכור אותי (30 יום)
      </label>

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? 'מתחבר...' : 'כניסה'}
      </button>

      <div className="auth-links">
        <Link href="/forgot-password">שכחתי סיסמה</Link>
        <Link href="/register">הרשמה</Link>
      </div>
    </form>
  )
}
