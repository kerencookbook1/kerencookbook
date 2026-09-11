import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { COMMON_INGREDIENTS } from '@/lib/common-ingredients'

export const runtime = 'nodejs'

/**
 * Returns the merged autocomplete list for ingredient names:
 *   1. Distinct names from the user's own recipes (higher priority — first)
 *   2. Curated static list (COMMON_INGREDIENTS), appended without duplicates
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userNames: string[] = []
  if (user) {
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id')
      .eq('owner_id', user.id)
    const ids = (recipes ?? []).map((r) => r.id)
    if (ids.length > 0) {
      const { data: rows } = await supabase
        .from('ingredients')
        .select('name')
        .in('recipe_id', ids)
      const seen = new Set<string>()
      for (const row of rows ?? []) {
        const n = (row.name ?? '').trim()
        if (!n) continue
        const key = n.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        userNames.push(n)
      }
      userNames.sort((a, b) => a.localeCompare(b, 'he'))
    }
  }

  const merged: string[] = [...userNames]
  const takenLower = new Set(userNames.map((n) => n.toLowerCase()))
  for (const n of COMMON_INGREDIENTS) {
    if (!takenLower.has(n.toLowerCase())) {
      merged.push(n)
      takenLower.add(n.toLowerCase())
    }
  }

  return NextResponse.json({ suggestions: merged })
}
