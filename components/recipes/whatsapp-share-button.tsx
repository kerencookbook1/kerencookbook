'use client'

import { useState } from 'react'

export type WhatsAppIngredient = {
  name: string
  amount: string | null
  unit: string | null
}

export type WhatsAppStep = {
  title: string | null
  body: string
}

type Props = {
  recipeId: string
  title: string
  ingredients: WhatsAppIngredient[]
  steps: WhatsAppStep[]
  prepTime?: number | null
  cookTime?: number | null
  servings?: number | null
}

const MAX_URL_CHARS = 6000 // WhatsApp truncates around 8k; leave headroom for base URL + encoding

/** Compose the recipe as WhatsApp-friendly Hebrew text. */
function buildMessage(props: Props, siteOrigin: string): string {
  const lines: string[] = []
  lines.push(`*${props.title}*`)

  const meta: string[] = []
  const total = (props.prepTime ?? 0) + (props.cookTime ?? 0)
  if (total > 0) meta.push(`🕐 ${total} דק׳`)
  if (props.servings != null) meta.push(`🍽️ ${props.servings} מנות`)
  if (meta.length) lines.push(meta.join(' · '))

  if (props.ingredients.length > 0) {
    lines.push('', '📋 *מרכיבים:*')
    for (const ing of props.ingredients) {
      const parts = [ing.amount, ing.unit, ing.name].filter((p) => p && p.trim())
      if (parts.length > 0) lines.push(`• ${parts.join(' ')}`)
    }
  }

  if (props.steps.length > 0) {
    lines.push('', '👩‍🍳 *אופן הכנה:*')
    props.steps.forEach((step, i) => {
      const body = step.body.trim()
      if (!body) return
      const heading = step.title?.trim()
      lines.push(heading ? `${i + 1}. ${heading} — ${body}` : `${i + 1}. ${body}`)
    })
  }

  const url = `${siteOrigin}/recipes/${props.recipeId}`
  lines.push('', `🔗 המתכון המלא: ${url}`)
  lines.push('', '_נשלח מ־המטבח של קרן_ 🌿')

  const full = lines.join('\n')
  if (full.length <= MAX_URL_CHARS) return full

  // Too long — trim the steps section to keep the message under WhatsApp's limit.
  // Users still get the link at the bottom to view the full recipe.
  const trimmed = full.slice(0, MAX_URL_CHARS - 200)
  return `${trimmed}\n\n…(המשך במתכון המלא)\n🔗 ${url}`
}

export function WhatsAppShareButton(props: Props) {
  const [busy, setBusy] = useState(false)

  function handleClick() {
    setBusy(true)
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://kerencookbook-web-gray.vercel.app'
    const text = buildMessage(props, origin)
    // wa.me works on both mobile (opens the WhatsApp app) and desktop (opens
    // WhatsApp Web / desktop client). No phone number → user picks recipient.
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    // Open in a new tab so the recipe page stays open in the background.
    window.open(url, '_blank', 'noopener,noreferrer')
    // Short cooldown so a double-tap doesn't fire twice on slow phones.
    setTimeout(() => setBusy(false), 800)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="שיתוף המתכון בווטסאפ"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-[#25D366] hover:text-[#128C7E]"
      style={{ opacity: busy ? 0.7 : 1 }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 32 32"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path
          fill="#25D366"
          d="M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.72 6.42L3.2 28.8l6.55-1.72c1.88 1.03 4 1.57 6.22 1.57h.03c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.65-12.8-12.65zm0 23.36h-.02c-1.98 0-3.93-.53-5.63-1.54l-.4-.24-4.02 1.06 1.08-3.92-.26-.42a10.57 10.57 0 0 1-1.62-5.65c0-5.85 4.77-10.61 10.62-10.61 2.83 0 5.5 1.1 7.5 3.1a10.55 10.55 0 0 1 3.11 7.5c0 5.85-4.76 10.62-10.36 10.72z"
        />
        <path
          fill="#25D366"
          d="M22.03 19.13c-.32-.16-1.9-.94-2.19-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1.01 1.27-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.53-.54-.72-.55l-.62-.01c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.15 3.09 1.31 3.3.16.21 2.26 3.45 5.48 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z"
        />
      </svg>
      <span>שתפי בווטסאפ</span>
    </button>
  )
}
