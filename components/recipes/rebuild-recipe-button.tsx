'use client'

import { useState, useTransition } from 'react'
import { rebuildRecipeFromSource } from '@/lib/actions/rebuild-recipe'

type Props = {
  recipeId: string
  sourceName: string | null
}

/**
 * Confirms with the user before nuking the existing steps + ingredients and
 * pulling a fresh version from source_url through the current extractor
 * pipeline. Intended for legacy recipes that were imported when the pipeline
 * still let through nav/footer noise (photo credits, English site chrome).
 */
export function RebuildRecipeButton({ recipeId, sourceName }: Props) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function handleClick() {
    const label = sourceName ? `מ${sourceName}` : 'מהמקור המקורי'
    const proceed = window.confirm(
      `לבנות מחדש את השלבים והמרכיבים ${label}?\n\n` +
        'המרכיבים והשלבים הנוכחיים יימחקו ויוחלפו בגרסה שנמשכה מחדש עם החולץ המשופר. ' +
        'שם המתכון, התיאור, התמונות וההערות שלך יישארו כמו שהם.',
    )
    if (!proceed) return

    setMessage(null)
    startTransition(async () => {
      const res = await rebuildRecipeFromSource(recipeId)
      if (res.ok) {
        setMessage({ ok: true, text: 'הבנייה מחדש הצליחה — הדף יטען מחדש עוד רגע.' })
        // Refresh the page to pick up the new content
        setTimeout(() => window.location.reload(), 700)
      } else {
        setMessage({ ok: false, text: res.error })
      }
    })
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-lime-500 hover:text-lime-700 disabled:opacity-60"
      >
        <span aria-hidden>{pending ? '⏳' : '🪄'}</span>
        <span>{pending ? 'בונה מחדש...' : 'בנה מחדש עם AI משופר'}</span>
      </button>
      {message && (
        <span
          role={message.ok ? 'status' : 'alert'}
          style={{
            fontSize: '.78rem',
            color: message.ok ? '#3f6212' : '#8a1c14',
            maxWidth: 320,
          }}
        >
          {message.text}
        </span>
      )}
    </div>
  )
}
