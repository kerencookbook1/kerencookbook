import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingList } from './_list'

export const metadata = { title: 'רשימת קניות — המטבח של קרן' }

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = user
    ? await supabase
        .from('shopping_items')
        .select('id, name, amount, unit, aisle, is_checked, source_recipe_id, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
    : { data: [] }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/" className="back-link">← בית</Link>
        <p className="eyebrow">כלים</p>
        <h1>רשימת קניות</h1>
        <p>הרשימה מקובצת לפי מעברים בסופר. הפריטים מתווספים ממתכונים או ידנית.</p>
      </header>

      <ShoppingList initialItems={items ?? []} />
    </main>
  )
}
