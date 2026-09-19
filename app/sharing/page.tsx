import Link from 'next/link'
import { getIncomingShares } from '@/lib/actions/sharing'
import { SharingPanel } from './_panel'

export const metadata = { title: 'שיתופים — המטבח של קרן' }

export default async function SharingPage() {
  const shares = await getIncomingShares()
  return <main className="screen-shell">
    <header className="screen-header">
      <Link href="/" className="back-link">← בית</Link>
      <p className="eyebrow">ספר מתכונים</p>
      <h1>שיתופים</h1>
      <p>מתכונים שמשתמשים אחרים שלחו לך. שום דבר לא נכנס לספרייה בלי אישור שלך.</p>
    </header>
    <SharingPanel shares={shares} />
  </main>
}
