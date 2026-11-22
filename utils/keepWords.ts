/**
 * Display-only: glue the characters of each Chinese phrase together with a
 * word joiner (U+2060), so a narrow heading breaks between phrases, never
 * inside one (「找好／康」, 「創天下競／賽」). Never use it on text that goes
 * into meta tags or JSON-LD: the joiner is invisible on screen but not to a
 * parser.
 *
 * Where the phrases are comes from BudouX, run at build time over every short
 * Chinese string in content/ (scripts/make-keep.mjs → keep-map.json). Strings
 * written in components are not in the map; a short list covers those.
 */
import MAP from './keep-map.json'

const WJ = String.fromCharCode(0x2060)
const NBSP = String.fromCharCode(0xa0)

// Same hash as scripts/make-keep.mjs.
function hash(s: string): string {
  let h = 0x811c9dc5
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 0x01000193) >>> 0
  return h.toString(36)
}

// Which gaps between characters are glued: BudouX's phrases from the map,
// then a short list of words it splits (「有／意義」「排／時段」) or that are
// written in components rather than content/.
const PHRASES = ['城市儀表板', '語言模型', '醫數行銷', '資訊管理', '大型語', '知訊網', '收藏成', '找好康', '排時段', '有意義', '旁邊', '每一筆', '原始碼', '產品', '登記在案']

// A figure and the Chinese word it counts ("30 行", "寫 30") are one unit: the
// space between them never becomes a line break.
const COUNT = /(\d) (?=[一-鿿])|([一-鿿]) (?=\d)/g

export function keep(s: unknown): string {
  // Trimmed: a folded YAML block ends in a newline, and the map is keyed by
  // the trimmed text. Display only, so the edges do not matter.
  const str = String(s ?? '').trim()
  const chars = [...str]
  const glued = new Array(chars.length).fill(false) // glued[i]: no break before chars[i]
  const runs = (MAP as Record<string, string>)[hash(str)]
  if (runs) {
    let at = 0
    runs.split('.').forEach((r, i) => {
      const n = parseInt(r, 36)
      if (i % 2) for (let k = at + 1; k < at + n; k++) glued[k] = true
      at += n
    })
  }
  // Each word on its own, so overlapping ones (「大型語」「語言模型」) both hold.
  for (const w of PHRASES) {
    for (let i = str.indexOf(w); i >= 0; i = str.indexOf(w, i + 1)) {
      const at = [...str.slice(0, i)].length
      for (let k = at + 1; k < at + [...w].length; k++) glued[k] = true
    }
  }
  return chars.map((c, i) => (glued[i] ? WJ : '') + c).join('').replace(COUNT, (_, d, h) => (d ?? h) + NBSP)
}
