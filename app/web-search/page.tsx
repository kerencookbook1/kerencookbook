import { Suspense } from 'react'
import Link from 'next/link'
import LocalRecipeSearch from './local-recipe-search'
import WebSearchPanel from './web-search-panel'

export default function WebSearchPage() {
  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link href="/" className="back-link">← חזרה לבית</Link>
        <p className="eyebrow">חיפוש חכם באינטרנט</p>
        <h1>מצאו מתכון שמתאים לכם</h1>
        <p>חפשו לפי מנה, מרכיב, שף או סגנון. תוכלו לקרוא את המתכון המלא לפני שתשמרו אותו אצלכם.</p>
      </header>
      <LocalRecipeSearch />
      <div className="web-search-divider" aria-hidden="true" />
      <section aria-labelledby="internet-search-title" className="internet-search-section">
        <div className="search-section-heading">
          <div>
            <p className="eyebrow">לא מצאת? ממשיכים לאינטרנט</p>
            <h2 id="internet-search-title">חיפוש בגוגל</h2>
          </div>
        </div>
      <Suspense fallback={<div className="upload-panel">טוען את החיפוש…</div>}>
        <WebSearchPanel />
      </Suspense>
      </section>
    </main>
  )
}
