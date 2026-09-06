import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listStatuses, setActive } from '@/lib/ai-providers'
import { isValidProviderId } from '@/lib/preview-providers'

export const runtime = 'nodejs'

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
  if (provider !== null && !isValidProviderId(provider)) {
    return NextResponse.json({ error: 'ספק לא תקין' }, { status: 400 })
  }

  try {
    await setActive(provider)
    const result = await listStatuses()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('אין לו מפתח') ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
