'use client'

import { useActionState, useEffect, useState } from 'react'
import { resetPassword } from '@/lib/actions/auth'
import type { AuthActionState } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(resetPassword, null)
  const [ready, setReady] = useState(false)
  const [exchangeError, setExchangeError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Exchange the code from the URL hash if present
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      supabase.auth.getSession().then(({ error }) => {
        if (error) {
          setExchangeError('הקישור פג תוקף, בקש קישור חדש')
        } else {
          setReady(true)
        }
      })
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExchangeError('קישור לאיפוס סיסמה לא נמצא. בקש קישור חדש.')
    }
  }, [])

  if (exchangeError) {
    return (
      <div>
        <p className="auth-error">{exchangeError}</p>
        <div className="auth-links" style={{ marginTop: '20px' }}>
          <span />
          <Link href="/forgot-password">בקש קישור חדש</Link>
        </div>
      </div>
    )
  }

  if (!ready) {
    return <p style={{ color: 'var(--muted)' }}>טוען...</p>
  }

  return (
    <form action={action} className="auth-form">
      {state?.error && <p className="auth-error" role="alert">{state.error}</p>}

      <label>
        סיסמה חדשה
        <input type="password" name="password" autoComplete="new-password" required minLength={6} />
      </label>

      <label>
        אימות סיסמה חדשה
        <input type="password" name="confirmPassword" autoComplete="new-password" required minLength={6} />
      </label>

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? 'שומר...' : 'שמור סיסמה חדשה'}
      </button>
    </form>
  )
}
