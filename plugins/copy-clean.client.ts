/**
 * keep() glues Chinese phrases together with invisible word joiners so a
 * heading never breaks mid-word. They travelled with every copy: a recruiter
 * pasting the résumé into an applicant system got 「共同創辦」 with a joiner between every character and no
 * keyword match. Copied text leaves without them; the page keeps them.
 */
const JOINER = String.fromCharCode(0x2060)
const WJ = new RegExp(JOINER, 'g')

export default defineNuxtPlugin(() => {
  document.addEventListener('copy', (ev) => {
    const sel = document.getSelection()
    const text = sel?.toString() ?? ''
    if (!ev.clipboardData || !text.includes(JOINER)) return
    ev.clipboardData.setData('text/plain', text.replace(WJ, ''))
    // The rich copy (into Word) is the same selection as HTML, cleaned the same way.
    const box = document.createElement('div')
    for (let i = 0; i < (sel?.rangeCount ?? 0); i++) box.appendChild(sel!.getRangeAt(i).cloneContents())
    ev.clipboardData.setData('text/html', box.innerHTML.replace(WJ, ''))
    ev.preventDefault()
  })
})
