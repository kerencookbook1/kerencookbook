import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteKey, listStatuses, saveKey } from '@/lib/ai-providers'
import { isValidProviderId } from '@/lib/preview-providers'

export const runtime = 'nodejs'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
  const result = await listStatuses()
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

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

  try {
    await saveKey(provider, apiKey.trim())
    const result = await listStatuses()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const provider = new URL(request.url).searchParams.get('provider')
  if (!isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }

  try {
    await deleteKey(provider)
    const result = await listStatuses()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
