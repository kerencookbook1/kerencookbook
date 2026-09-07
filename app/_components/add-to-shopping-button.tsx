'use client'

import { useState, useTransition } from 'react'
import { addRecipeIngredientsToShoppingList } from '@/lib/actions/shopping'

export function AddToShoppingButton({ recipeId }: { recipeId: string }) {
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
      <button
        type="button"
        className="outline-button"
        style={{ width: '100%' }}
        disabled={isPending}
        onClick={() => {
          setStatus(null)
          startTransition(async () => {
            const res = await addRecipeIngredientsToShoppingList(recipeId)
            if (res.ok) setStatus({ ok: true, msg: `נוספו ${res.added} פריטים לרשימת הקניות ✓` })
            else setStatus({ ok: false, msg: res.error ?? 'שגיאה' })
          })
        }}
      >
        🛒 {isPending ? 'מוסיף…' : 'הוסיפי לרשימת קניות'}
      </button>
      {status && (
        <p style={{ margin: 0, fontSize: '.82rem', color: status.ok ? '#3b6035' : '#8a1c14', textAlign: 'center' }}>
          {status.msg}
        </p>
      )}
    </div>
  )
}
