/**
 * Where a Chinese heading may break, worked out once at build time.
 *
 * Browsers break Chinese between any two characters, so a narrow heading
 * split words in half (「找好／康」「創天下競／賽」). Patching words one at a
 * time never ended. BudouX's Traditional Chinese model splits a string into
 * phrases; inside each phrase the characters are glued with a word joiner
 * (U+2060), so lines break only between phrases.
 *
 * The model is 72 kB and its package pulls in every language, so it runs
 * here, in Node, and the page gets only the result: a map from each short
 * Chinese string in content/ to its glued form (utils/keep-map.json), which
 * utils/keepWords.ts looks up. Run by `npm run generate`; commit the output.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { loadDefaultTraditionalChineseParser } from 'budoux'

const WJ = String.fromCharCode(0x2060)
const HAN = /[一-鿿]/
// Headings and labels, not paragraphs: a paragraph breaks fine anywhere, and
// the map would grow by the size of the copy.
const MAX = 40
// A phrase longer than this may not fit a phone line; it is left breakable.
const LONGEST = 8

const parser = loadDefaultTraditionalChineseParser()
const files = [
  ...readdirSync('content').filter((f) => f.endsWith('.yml')).map((f) => join('content', f)),
  ...readdirSync('content/work').filter((f) => f.endsWith('.yml')).map((f) => join('content/work', f)),
]

const strings = new Set()
const walk = (v) => {
  if (typeof v === 'string') { if (HAN.test(v) && [...v].length <= MAX) strings.add(v.trim()) }
  else if (Array.isArray(v)) v.forEach(walk)
  else if (v && typeof v === 'object') Object.values(v).forEach(walk)
}
for (const f of files) walk(parse(readFileSync(f, 'utf8')))

// Kept small for the page: each entry is keyed by a hash of the string (the
// string itself is already in the bundle) and holds the length of each glued
// phrase and each free run, in base 36 joined by dots: free.glued.free.glued...
// The same hash is in utils/keepWords.ts.
function hash(s) {
  let h = 0x811c9dc5
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 0x01000193) >>> 0
  return h.toString(36)
}

function runs(s) {
  const out = [] // [free, glued, free, glued, ...] lengths in code points
  let free = 0
  for (const ph of parser.parse(s)) {
    // Split the phrase at spaces: only non-space runs are glued.
    for (const part of ph.split(/(\s+)/).filter(Boolean)) {
      const n = [...part].length
      if (/\s/.test(part) || !HAN.test(part) || n < 2 || n > LONGEST) { free += n; continue }
      out.push(free, n)
      free = 0
    }
  }
  return out.length ? out.map((n) => n.toString(36)).join('.') : ''
}

const map = {}
let longRun = 0
for (const s of [...strings].sort()) {
  const r = runs(s)
  if (!r) continue
  map[hash(s)] = r
  longRun++
}
writeFileSync('utils/keep-map.json', JSON.stringify(map) + '\n')
console.log(`keep-map: ${longRun} of ${strings.size} strings`)
