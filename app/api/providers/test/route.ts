import { NextResponse } from 'next/server'
import { isValidProviderId, readStore, toStatus, writeStore, type ProviderId } from '@/lib/preview-providers'
import { testProvider } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין (JSON)' }, { status: 400 })
  }

  const provider = (body as { provider?: unknown }).provider
  const overrideKey = (body as { apiKey?: unknown }).apiKey  // optional: test a key before saving

  if (!isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }

  const store = await readStore()
  const stored = store.providers[provider as ProviderId]
  const keyToUse = typeof overrideKey === 'string' && overrideKey.trim().length >= 10
    ? overrideKey.trim()
    : stored?.key

  if (!keyToUse) {
    return NextResponse.json({ error: 'לא הוגדר מפתח לספק זה. שמור את המפתח ואז בדוק שוב.' }, { status: 400 })
  }

  const result = await testProvider(provider as ProviderId, keyToUse)

  // Persist last test outcome only if key was already saved
  if (stored) {
    store.providers[provider as ProviderId] = {
      ...stored,
      lastTestedAt: new Date().toISOString(),
      lastTestOk: result.ok,
      lastTestError: result.ok ? undefined : result.error,
    }
    await writeStore(store)
  }

  return NextResponse.json({
    result,
    active: store.active ?? null,
    providers: toStatus(store),
  })
}
