type AttributionInput = {
  author?: string | null
  sourceName?: string | null
  sourceUrl?: string | null
  notes?: string | null
}

function clean(value: string | null | undefined): string | null {
  const text = value?.trim()
  return text || null
}

function sourceHost(sourceUrl: string | null | undefined): string | null {
  const value = clean(sourceUrl)
  if (!value) return null
  try {
    return new URL(value).hostname.replace(/^www\./i, '')
  } catch {
    return null
  }
}

function sharedBy(notes: string | null | undefined): string | null {
  const value = clean(notes)
  if (!value) return null
  const match = value.match(/שיתוף מ־([^\n]+)/) ?? value.match(/שיתוף מ-([^\n]+)/)
  return match?.[1]?.trim() || null
}

export function recipeByline({ author, sourceName, sourceUrl, notes }: AttributionInput): string {
  const authorName = clean(author)
  const siteName = clean(sourceName)
  const siteHost = sourceHost(sourceUrl)
  const senderName = sharedBy(notes)
  const main = authorName ?? siteName ?? siteHost ?? senderName ?? 'אנונימי'

  if (authorName && siteName && authorName !== siteName) return `${authorName} · ${siteName}`
  if (authorName && siteHost && !siteName) return `${authorName} · ${siteHost}`
  return main
}
