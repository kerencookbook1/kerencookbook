import { NextResponse } from 'next/server'
import { isValidProviderId, readStore, toStatus, writeStore, type ProviderId } from '@/lib/preview-providers'

export const runtime = 'nodejs'

export async function GET() {
  const store = await readStore()
  return NextResponse.json({ active: store.active ?? null, providers: toStatus(store) })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין (JSON)' }, { status: 400 })
  }

  const provider = (body as { provider?: unknown }).provider
  const apiKey = (body as { apiKey?: unknown }).apiKey

  if (!isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }
  if (typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return NextResponse.json({ error: 'מפתח לא תקין (מינימום 10 תווים)' }, { status: 400 })
  }

  const store = await readStore()
  store.providers[provider as ProviderId] = {
    key: apiKey.trim(),
    savedAt: new Date().toISOString(),
    // Reset test status on save
    lastTestedAt: undefined,
    lastTestOk: undefined,
    lastTestError: undefined,
  }
  await writeStore(store)

  return NextResponse.json({ ok: true, active: store.active ?? null, providers: toStatus(store) })
}

export async function DELETE(request: Request) {
  const provider = new URL(request.url).searchParams.get('provider')
  if (!isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }

  const store = await readStore()
  delete store.providers[provider as ProviderId]
  if (store.active === provider) store.active = undefined
  await writeStore(store)

  return NextResponse.json({ ok: true, active: store.active ?? null, providers: toStatus(store) })
}
