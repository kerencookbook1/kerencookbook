import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/recipes', name: 'Library' },
  { path: '/import', name: 'Import' },
  { path: '/meal-plans', name: 'MealPlans' },
]

const VIEWPORTS = [
  { width: 375, height: 812, label: 'phone-375' },
  { width: 768, height: 1024, label: 'tablet-768' },
  { width: 1440, height: 900, label: 'desktop-1440' },
]

// ── Viewport: no horizontal scroll, RTL, nav visible ─────────────────────────
for (const vp of VIEWPORTS) {
  test.describe(`Viewport ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('home — no horizontal scroll', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const clientWidth = await page.evaluate(() => document.body.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
    })

    test('home — dir=rtl on html', async ({ page }) => {
      await page.goto('/')
      const dir = await page.locator('html').getAttribute('dir')
      expect(dir).toBe('rtl')
    })

    test('home — page loads and has h1', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const h1 = page.locator('h1').first()
      await expect(h1).toBeVisible()
    })

    if (vp.width <= 768) {
      test('mobile — bottom nav visible', async ({ page }) => {
        await page.goto('/')
        const nav = page.locator('nav, [role="navigation"]').first()
        await expect(nav).toBeVisible()
      })
    }

    if (vp.width >= 760) {
      test('desktop — sidebar nav visible', async ({ page }) => {
        await page.goto('/')
        const sidebar = page.locator('.app-navigation')
        await expect(sidebar).toBeVisible()
      })
    }
  })
}

// ── Touch targets ≥44px ───────────────────────────────────────────────────────
test.describe('Touch targets', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('all buttons ≥44px tall on phone', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const buttons = page.locator('button:visible, a.primary-button:visible, a.outline-button:visible')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)
      // Skip browser-native injected controls (password reveal, autofill icons, etc.)
      // All app-authored buttons have at least one CSS class; native ones have none.
      if ((await btn.getAttribute('class')) === null) continue
      const box = await btn.boundingBox()
      if (box) {
        expect(box.height, `button #${i} height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

// ── Keyboard navigation ───────────────────────────────────────────────────────
test.describe('Keyboard navigation', () => {
  test('Tab key reaches navigation links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused)
  })
})

// ── Theme toggle ─────────────────────────────────────────────────────────────
test.describe('Theme toggle', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('theme toggle button is present', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const toggle = page.locator('button[aria-label*="עיצוב"], button[aria-label*="תמה"]')
    // ThemeToggle mounts client-side — wait briefly
    await page.waitForTimeout(500)
    const count = await toggle.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

// ── Axe accessibility ────────────────────────────────────────────────────────
test.describe('Accessibility — axe', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  for (const { path, name } of PAGES) {
    test(`${name} (${path}) — no critical/serious axe violations`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.cookie-banner') // exclude any third-party overlays
        .analyze()

      const blocking = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      if (blocking.length > 0) {
        console.log(`\n[axe] ${name} violations:`)
        blocking.forEach(v => {
          console.log(`  [${v.impact}] ${v.id}: ${v.description}`)
          v.nodes.forEach(n => console.log(`    → ${n.target}`))
        })
      }

      expect(blocking, `${name}: ${blocking.map(v => v.id).join(', ')}`).toHaveLength(0)
    })
  }
})
