'use client'

import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/lib/actions/recipes'

export function FavoriteButton({ recipeId, initial, title }: { recipeId: string; initial: boolean; title: string }) {
  const [isFav, setIsFav] = useState(initial)
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      className={`favorite-button${isFav ? ' is-favorite' : ''}`}
      aria-label={isFav ? `הסירי ממועדפים: ${title}` : `הוסיפי למועדפים: ${title}`}
      aria-pressed={isFav}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const next = !isFav
        setIsFav(next)  // optimistic
        startTransition(async () => {
          const res = await toggleFavorite(recipeId, next)
          if (!res.ok) setIsFav(!next)  // revert
        })
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
