/**
 * Turn a raw URL hostname into a clean, human-readable site name.
 *
 * The Israeli cooking web has a bunch of well-known brands with domains
 * like `www.yochananof.co.il` or `mtv.mako.co.il`. Rather than showing the
 * raw hostname (which looks technical and often has scheme + subdomain
 * noise), we look up the site in a small map and fall back to the base
 * hostname (minus `www.` and TLDs) when there's no explicit entry.
 */

const SITE_NAME_MAP: Array<{ pattern: RegExp; name: string }> = [
  // Major Israeli grocery / meal-kit brands with recipes on their sites
  { pattern: /(^|\.)yochananof\.co\.il$/i,       name: 'יוחננוף' },
  { pattern: /(^|\.)shufersal\.co\.il$/i,        name: 'שופרסל' },
  { pattern: /(^|\.)ramilevy\.co\.il$/i,         name: 'רמי לוי' },
  { pattern: /(^|\.)victory\.co\.il$/i,          name: 'ויקטורי' },
  { pattern: /(^|\.)mega\.co\.il$/i,             name: 'מגה' },
  { pattern: /(^|\.)hetzi-hinam\.co\.il$/i,      name: 'חצי חינם' },

  // Israeli food media
  { pattern: /(^|\.)ynet\.co\.il$/i,             name: 'Ynet' },
  { pattern: /(^|\.)mako\.co\.il$/i,             name: 'mako' },
  { pattern: /(^|\.)walla\.co\.il$/i,            name: 'וואלה' },
  { pattern: /(^|\.)nrg\.co\.il$/i,              name: 'NRG' },
  { pattern: /(^|\.)israelhayom\.co\.il$/i,      name: 'ישראל היום' },
  { pattern: /(^|\.)themarker\.com$/i,           name: 'TheMarker' },

  // Cooking-focused Israeli sites
  { pattern: /(^|\.)mit-bishul\.co\.il$/i,       name: 'מתבשל' },
  { pattern: /(^|\.)bishulim\.co\.il$/i,         name: 'בישולים' },
  { pattern: /(^|\.)alhashulchan\.co\.il$/i,     name: 'על השולחן' },
  { pattern: /(^|\.)tapuz\.co\.il$/i,            name: 'תפוז' },
  { pattern: /(^|\.)cookingclub\.co\.il$/i,      name: 'מועדון הבישול' },
  { pattern: /(^|\.)ochelbari\.co\.il$/i,        name: 'אוכל בריא' },
  { pattern: /(^|\.)ochel-tov\.co\.il$/i,        name: 'אוכל טוב' },
  { pattern: /(^|\.)myrecipebook\.co\.il$/i,     name: 'MyRecipeBook' },

  // TV cooking shows
  { pattern: /(^|\.)masterchef\.co\.il$/i,       name: 'MasterChef ישראל' },

  // International recipe hubs (English)
  { pattern: /(^|\.)allrecipes\.com$/i,          name: 'AllRecipes' },
  { pattern: /(^|\.)foodnetwork\.com$/i,         name: 'Food Network' },
  { pattern: /(^|\.)nytimes\.com$/i,             name: 'NYT Cooking' },
  { pattern: /(^|\.)cooking\.nytimes\.com$/i,    name: 'NYT Cooking' },
  { pattern: /(^|\.)bonappetit\.com$/i,          name: 'Bon Appétit' },
  { pattern: /(^|\.)seriouseats\.com$/i,         name: 'Serious Eats' },
  { pattern: /(^|\.)delish\.com$/i,              name: 'Delish' },
  { pattern: /(^|\.)tasty\.co$/i,                name: 'Tasty' },
  { pattern: /(^|\.)simplyrecipes\.com$/i,       name: 'Simply Recipes' },
  { pattern: /(^|\.)epicurious\.com$/i,          name: 'Epicurious' },
  { pattern: /(^|\.)ottolenghi\.co\.uk$/i,       name: 'Ottolenghi' },
  { pattern: /(^|\.)bbc\.co\.uk$/i,              name: 'BBC Food' },
  { pattern: /(^|\.)jamieoliver\.com$/i,         name: 'Jamie Oliver' },

  // Video platforms (when a recipe was imported from there)
  { pattern: /(^|\.)youtube\.com$/i,             name: 'YouTube' },
  { pattern: /(^|\.)youtu\.be$/i,                name: 'YouTube' },
  { pattern: /(^|\.)tiktok\.com$/i,              name: 'TikTok' },
  { pattern: /(^|\.)instagram\.com$/i,           name: 'Instagram' },
]

/**
 * Given a URL hostname or a full URL, return a cleaner site name.
 * Examples:
 *   "www.yochananof.co.il"       → "יוחננוף"
 *   "https://ynet.co.il/…"       → "Ynet"
 *   "https://www.nrg.co.il/…"    → "NRG"
 *   "recipes.newsite.co.il"      → "newsite"
 */
export function prettySiteName(hostOrUrl: string): string {
  if (!hostOrUrl) return ''
  let host = hostOrUrl.trim()
  try {
    // If it's a full URL, extract the hostname
    if (/^https?:\/\//i.test(host)) host = new URL(host).hostname
  } catch {
    // fall through with raw string
  }
  host = host.toLowerCase().replace(/^www\./, '')

  for (const { pattern, name } of SITE_NAME_MAP) {
    if (pattern.test(host)) return name
  }

  // Fallback: strip TLDs so "example.co.il" → "example"
  return host
    .replace(/\.(co\.il|com|net|org|io|app|il)$/i, '')
    .split('.')
    .pop() ?? host
}
