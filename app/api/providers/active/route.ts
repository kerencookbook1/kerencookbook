import { NextResponse } from 'next/server'
import { isValidProviderId, readStore, toStatus, writeStore, type ProviderId } from '@/lib/preview-providers'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין (JSON)' }, { status: 400 })
  }

  const provider = (body as { provider?: unknown }).provider
  if (provider !== null && !isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }

  const store = await readStore()

  if (provider !== null && !store.providers[provider as ProviderId]) {
    return NextResponse.json(
      { error: 'לא ניתן להפוך לפעיל ספק שאין לו מפתח שמור' },
      { status: 400 }
    )
  }

  store.active = (provider ?? undefined) as ProviderId | undefined
  await writeStore(store)

  return NextResponse.json({ ok: true, active: store.active ?? null, providers: toStatus(store) })
}
