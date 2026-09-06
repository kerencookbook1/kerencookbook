import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyFor, listStatuses, recordTestResult } from '@/lib/ai-providers'
import { isValidProviderId } from '@/lib/preview-providers'
import { testProvider } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

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

  const stored = await getKeyFor(provider)
  const keyToUse = typeof overrideKey === 'string' && overrideKey.trim().length >= 10
    ? overrideKey.trim()
    : stored ?? undefined

  if (!keyToUse) {
    return NextResponse.json({ error: 'לא הוגדר מפתח לספק זה. שמור את המפתח ואז בדוק שוב.' }, { status: 400 })
  }

  const result = await testProvider(provider, keyToUse)

  // Persist last test outcome only if key was already saved
  if (stored) {
    try {
      await recordTestResult(provider, result.ok, result.ok ? undefined : result.error)
    } catch {
      // Non-fatal — the test result is still returned to the client
    }
  }

  const statuses = await listStatuses()
  return NextResponse.json({ result, ...statuses })
}
