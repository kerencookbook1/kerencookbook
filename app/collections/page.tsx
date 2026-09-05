import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/repositories/recipes'

export const metadata = { title: 'האוסף המשפחתי — המטבח של קרן' }

const CARD_THEMES = ['', 'cauliflower', 'lemon', 'pumpkin', 'garden'] as const

const FAMILY_MEMBERS = [
  { initials: 'כ', name: 'קרן', color: '#d84b32' },
  { initials: 'י', name: 'יוסי', color: '#6d7d4e' },
  { initials: 'ר', name: 'רחל', color: '#c8a85c' },
  { initials: 'מ', name: 'מיכל', color: '#7a6b8a' },
] as const

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const recipes = user ? await getRecipes(user.id) : []
  const displayed = recipes.slice(0, 6)

  return (
    <main className="library-shell">
      <header className="library-header">
        <div className="library-title-row">
          <div>
            <p className="eyebrow">ספרייה משפחתית</p>
            <h1>האוסף המשפחתי</h1>
          </div>
          <button type="button" className="outline-button">ניהול משפחה</button>
        </div>
      </header>

      {/* Family members row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '18px 24px',
        border: '1px solid var(--line)',
        borderRadius: 20,
        background: 'var(--surface)',
        boxShadow: 'var(--shadow)',
        marginBottom: 32,
        flexWrap: 'wrap',
      }}>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 4px' }}>חברי משפחה</p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>כל המתכונים שנאספו ושותפו</p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginRight: 'auto', flexWrap: 'wrap' }}>
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: member.color,
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}>
                {member.initials}
              </div>
              <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{member.name}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button type="button" style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: '2px dashed #bba997',
              background: 'transparent',
              color: 'var(--terracotta-dark)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}>+</button>
            <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>הוספה</span>
          </div>
        </div>
      </div>

      {/* Collections tabs */}
      <div className="filter-row" style={{ marginBottom: 24 }}>
        {['כל האוסף', 'מועדפים', 'שיתפתי', 'שותף איתי'].map((tab, i) => (
          <button key={tab} type="button" className={`filter-pill${i === 0 ? ' is-current' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <p>עדיין אין מתכונים באוסף. הוסיפי את הראשון!</p>
          <Link href="/import" className="primary-button">+ הוסיפי מתכון</Link>
        </div>
      ) : (
        <>
          <div className="library-count">
            <h2>{recipes.length} מתכונים משותפים</h2>
          </div>
          <div className="library-grid">
            {displayed.map((recipe, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length]
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              const contributor = FAMILY_MEMBERS[index % FAMILY_MEMBERS.length]
              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="library-card">
                  <div className={`library-visual${theme ? ` ${theme}` : ''}`}>
                    <div className="plate" />
                    <span className="ingredient ingredient-one" />
                    <span className="ingredient ingredient-two" />
                    <span className="ingredient ingredient-three" />
                    {/* Contributor badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: contributor.color,
                      color: 'white',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      border: '2px solid white',
                    }}>
                      {contributor.initials}
                    </div>
                  </div>
                  <div className="library-card-body">
                    <h3>{recipe.title}</h3>
                    <p>
                      {totalMinutes > 0 ? `${totalMinutes} דק׳` : 'ללא זמן'}
                      {recipe.servings ? ` · ${recipe.servings} מנות` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
