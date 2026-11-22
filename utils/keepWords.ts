/**
 * Display-only: glue the characters of a few names and phrases together with
 * a word joiner (U+2060), so a narrow heading breaks around them, never inside
 * (「醫數行／銷」, 「排時／段」). Never use it on text that goes into meta tags or
 * JSON-LD: the joiner is invisible on screen but not to a parser.
 */
const WJ = String.fromCharCode(0x2060)
const PHRASES = ['醫數行銷', '排時段', '回訊息', '追回診', '有意義', '收藏成', '優惠手冊']
const RE = new RegExp(PHRASES.join('|'), 'g')

export function keep(s: unknown): string {
  return String(s ?? '').replace(RE, (m) => [...m].join(WJ))
}
