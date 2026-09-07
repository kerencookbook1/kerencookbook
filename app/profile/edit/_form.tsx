'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { updateProfile, type ProfileActionState } from '@/lib/actions/profile'

export function EditProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [state, formAction, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    null
  )

  return (
    <form
      action={formAction}
      style={{
        display: 'grid', gap: 18,
        maxWidth: 560, margin: '0 auto',
        padding: 'clamp(20px, 4vw, 32px)',
        border: '1px solid var(--line)', borderRadius: 20,
        background: 'var(--surface)',
        boxShadow: '0 8px 20px rgba(73,49,31,.07)',
      }}
    >
      {state?.error && (
        <div role="alert" style={{
          padding: 12, borderRadius: 10, background: '#fdecea',
          color: '#8a1c14', fontSize: '.9rem',
        }}>
          {state.error}
        </div>
      )}

      <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
        שם מלא
        <input
          type="text"
          name="displayName"
          defaultValue={initialName}
          required
          minLength={2}
          maxLength={60}
          autoFocus
          placeholder="השם שיוצג באתר"
          style={{
            minHeight: 48,
            border: '1px solid #cfbfae', borderRadius: 12,
            padding: '0 14px', background: '#fffdfa',
            fontSize: '1rem',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: 6, fontWeight: 800, color: 'var(--muted)' }}>
        אימייל (לא ניתן לשינוי)
        <input
          type="email"
          value={email}
          disabled
          readOnly
          style={{
            minHeight: 48,
            border: '1px solid #e8dfcc', borderRadius: 12,
            padding: '0 14px', background: '#f4efe2',
            fontSize: '1rem', color: 'var(--muted)',
            direction: 'ltr', textAlign: 'left',
          }}
        />
      </label>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link href="/profile" className="outline-button">ביטול</Link>
        <button type="submit" className="primary-button" disabled={isPending}>
          {isPending ? 'שומר…' : 'שמור שינויים'}
        </button>
      </div>
    </form>
  )
}
