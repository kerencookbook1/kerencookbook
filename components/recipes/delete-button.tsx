'use client'

import { useTransition } from 'react'

type Props = {
  recipeId: string
  action: (id: string) => Promise<void>
}

export function DeleteButton({ recipeId, action }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('למחוק את המתכון? פעולה זו אינה ניתנת לביטול.')) return
    startTransition(() => {
      action(recipeId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="outline-button delete-button"
    >
      {isPending ? 'מוחק...' : 'מחק מתכון'}
    </button>
  )
}
