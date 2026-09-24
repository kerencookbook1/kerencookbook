import { NextResponse } from 'next/server'

/**
 * Compatibility endpoint for cached clients from the old search UI.
 * The active search is the Google CSE widget in /web-search; this endpoint
 * deliberately does not call AI or any external provider.
 */
export async function POST() {
  return NextResponse.json(
    { recipes: [], error: 'החיפוש עבר ל־Google והוא זמין בעמוד החיפוש החדש.' },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
