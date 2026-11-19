<template>
  <!--
    What a thing on the desk opens when you pick it up: the phone runs the
    oSave check-up, the tablet the MedaLink scheduler, the shelf lists every
    award with its announcement, the reports list the NSTC grants. A native
    modal <dialog>: Esc closes it, focus stays inside and returns to whatever
    opened it, and the page behind does not scroll.
  -->
  <dialog ref="dlg" class="dd" aria-labelledby="dd-h" @close="emit('close')" @click="onBackdrop">
    <div v-if="shown" class="dd-sheet">
      <header class="dd-head" @pointerdown="dragStart">
        <p class="dd-eyebrow">{{ c.thing }}</p>
        <!-- Focus lands on the title, not the close button, so a mouse click shows no focus ring. -->
        <h2 id="dd-h" class="dd-h" tabindex="-1" autofocus>{{ c.title }}</h2>
        <NuxtLink :to="c.href" class="dd-more" @click="close">{{ c.cta }} →</NuxtLink>
        <button type="button" class="dd-x" :aria-label="t.close" @click="close">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </header>

      <div class="dd-body">
        <p v-if="c.lede" class="dd-lede">{{ c.lede }}</p>
        <ProductOsaveDemo v-if="shown === 'phone'" />
        <ProductSlotDemo v-else-if="shown === 'tablet'" />
        <ol v-else-if="shown === 'shelf'" class="dd-list">
          <li v-for="a in awards" :key="a.key" class="dd-row" :class="{ 'is-top': a.top }">
            <span class="dd-year figures">{{ a.date.slice(0, 4) }}</span>
            <span class="dd-main">
              <strong>{{ a.prize || a.comp }}</strong>
              <span v-if="a.prize">{{ a.comp }}</span>
              <span v-if="a.org" class="dd-org">{{ a.org }}</span>
            </span>
            <a v-if="a.evidence" :href="a.evidence" class="dd-src" target="_blank" rel="noopener" :aria-label="E ? `${a.comp}: announcement (opens in a new tab)` : `${a.comp}公告（另開新分頁）`">{{ t.source }} <span aria-hidden="true">↗</span></a>
          </li>
        </ol>
        <ol v-else-if="shown === 'reports'" class="dd-list">
          <li v-for="g in grants" :key="g.key" class="dd-row">
            <span class="dd-year figures">{{ g.date.slice(0, 4) }}</span>
            <span class="dd-main">
              <strong>{{ g.title }}</strong>
              <span>{{ g.publication }}</span>
              <span v-if="g.detail" class="dd-org">{{ g.detail }}</span>
            </span>
          </li>
        </ol>
      </div>
    </div>
  </dialog>
</template>

<script setup>
const props = defineProps({ id: { type: String, default: null } })
const emit = defineEmits(['close'])

const { timeline, en } = useContent()
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')
const pre = computed(() => (E.value ? '/en' : ''))
const tr = (e) => (E.value ? en.timeline?.[`${e.date} ${e.title}`] ?? {} : {})

const dlg = ref(null)
// The last thing opened stays rendered while the sheet fades out.
const shown = ref(null)

watch(
  () => props.id,
  async (id) => {
    if (id) shown.value = id
    // Let the sheet's content render first, so the dialog focuses its first control.
    await nextTick()
    const d = dlg.value
    if (!d) return
    if (id && !d.open) d.showModal()
    else if (!id && d.open) d.close()
  },
  { flush: 'post' }
)

function close() {
  dlg.value?.close()
}
// A click on the dimmed page around the sheet closes it.
function onBackdrop(ev) {
  if (ev.target === dlg.value) close()
}
// On a phone the sheet is pulled down by its top to close it, like any bottom sheet.
function dragStart(ev) {
  if (ev.pointerType !== 'touch' || ev.target.closest('a, button')) return
  const d = dlg.value
  const y0 = ev.clientY
  let dy = 0
  const move = (e) => {
    dy = Math.max(0, e.clientY - y0)
    d.style.translate = `0 ${dy}px`
    d.style.transition = 'none'
  }
  const up = () => {
    removeEventListener('pointermove', move)
    removeEventListener('pointerup', up)
    removeEventListener('pointercancel', up)
    d.style.transition = ''
    d.style.translate = ''
    if (dy > 90) close()
  }
  addEventListener('pointermove', move)
  addEventListener('pointerup', up)
  addEventListener('pointercancel', up)
}

const SHORTLISTED = /入圍/
const TOP_PRIZE = /第一名|冠軍|金獎|最佳創新創業大獎/
const awards = computed(() =>
  timeline
    .filter((e) => e.kind === 'award' && !SHORTLISTED.test(e.title))
    .map((e) => {
      const x = tr(e)
      const title = x.title ?? e.title
      const cut = title.lastIndexOf(' - ')
      return {
        key: `${e.date} ${e.title}`,
        date: String(e.date),
        comp: cut > 0 ? title.slice(0, cut) : title,
        prize: cut > 0 ? title.slice(cut + 3) : '',
        org: x.org ?? e.org,
        evidence: e.evidence || null,
        top: TOP_PRIZE.test(e.title),
      }
    })
)

const grants = computed(() =>
  timeline
    .filter((e) => e.kind === 'research' && /國科會|NSTC/.test(e.publication ?? ''))
    .map((e) => {
      const x = tr(e)
      return { key: `${e.date} ${e.title}`, date: String(e.date), title: x.title ?? e.title, publication: x.publication ?? e.publication, detail: x.org ?? e.org }
    })
)

const t = computed(() => (E.value ? { close: 'Close', source: 'Announcement' } : { close: '關閉', source: '公告' }))

const c = computed(() => {
  const n = { a: awards.value.length, g: grants.value.length, top: awards.value.filter((a) => a.top).length }
  const zh = {
    phone: { thing: '手機 · 財伴 oSave', title: '幫自己做一次財務健檢', lede: '拉拉看收入和支出，雷達圖會跟著變。這是財伴首頁那張健康度的簡化版，門檻是示意。', href: '/work/osave/', cta: '看財伴怎麼做的' },
    tablet: { thing: '平板 · 醫數行銷 MedaLink', title: '幫診所排一個療程', lede: '一個療程有好幾個步驟，每一步要的人、診間、儀器都要同時有空，才排得進去。', href: '/work/medalink/', cta: '看診所系統' },
    shelf: { thing: '獎盃架', title: `${n.a} 個競賽獎項`, lede: `由新到舊，${n.top} 個全國首獎標了色。有公告的都附上連結。`, href: '/resume/', cta: '看完整年表' },
    reports: { thing: '一疊報告', title: `${n.g} 個國科會計畫`, lede: '大學部的國科會大專學生研究計畫，每一個都是我主持。', href: '/resume/', cta: '看完整年表' },
  }
  const en_ = {
    phone: { thing: 'Phone · oSave', title: 'Give yourself a financial check-up', lede: 'Move income and spending and watch the radar change. A simpler version of the health score on oSave’s home screen; the thresholds are illustrative.', href: '/work/osave/', cta: 'How oSave was built' },
    tablet: { thing: 'Tablet · MedaLink', title: 'Book a treatment for a clinic', lede: 'A treatment is a chain of steps, and each step needs its people, room and machine free at the same time.', href: '/work/medalink/', cta: 'See the clinic system' },
    shelf: { thing: 'The shelf', title: `${n.a} competition awards`, lede: `Newest first; the ${n.top} national first prizes are marked. Each announcement is linked where one exists.`, href: '/resume/', cta: 'See the full record' },
    reports: { thing: 'A stack of reports', title: `${n.g} NSTC research grants`, lede: 'Undergraduate research grants from Taiwan’s National Science and Technology Council, each one led by me.', href: '/resume/', cta: 'See the full record' },
  }
  const x = (E.value ? en_ : zh)[shown.value] ?? zh.phone
  return { ...x, href: `${pre.value}${x.href}` }
})
</script>

<style scoped>
.dd {
  width: min(960px, calc(100vw - 2rem));
  max-width: none;
  max-height: calc(100dvh - 2 * clamp(16px, 4vh, 40px));
  /* Every drawer opens at the same height, short or long. */
  margin: clamp(16px, 4vh, 40px) auto auto;
  padding: 0;
  border: 0;
  border-radius: var(--r-3);
  background: var(--bg);
  color: var(--ink);
  box-shadow: 0 0 0 1px var(--rule), 0 30px 80px rgb(0 0 0 / 0.35);
  overflow: hidden;
  opacity: 0;
  translate: 0 24px;
  scale: 0.98;
  transition: opacity 280ms var(--ease-entrance), translate 420ms var(--ease-entrance), scale 420ms var(--ease-entrance), overlay 420ms allow-discrete, display 420ms allow-discrete;
}

.dd[open] {
  opacity: 1;
  translate: 0 0;
  scale: 1;
}

@starting-style {
  .dd[open] {
    opacity: 0;
    translate: 0 24px;
    scale: 0.98;
  }
}

.dd::backdrop {
  background: rgb(10 12 10 / 0);
  backdrop-filter: blur(0);
  transition: background 320ms, backdrop-filter 320ms, overlay 320ms allow-discrete, display 320ms allow-discrete;
}

.dd[open]::backdrop {
  background: rgb(10 12 10 / 0.55);
  backdrop-filter: blur(6px);
}

@starting-style {
  .dd[open]::backdrop {
    background: rgb(10 12 10 / 0);
    backdrop-filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dd,
  .dd::backdrop {
    transition: none;
    translate: none;
    scale: none;
  }
}

.dd-sheet {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  max-height: inherit;
}

.dd-head {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: var(--sp-5);
  align-items: end;
  padding: var(--sp-5) calc(var(--sp-5) + 52px) var(--sp-4) var(--sp-5);
  border-bottom: 1px solid var(--rule);
}

.dd-eyebrow {
  grid-column: 1 / -1;
}

.dd-h:focus {
  outline: none;
}

.dd-eyebrow {
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-3);
}

.dd-h {
  margin-top: var(--sp-1);
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 900;
  line-height: 1.2;
  text-wrap: balance;
}

.dd-x {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-4);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--ink);
  cursor: pointer;
}

.dd-x:hover {
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--rule-strong);
}

.dd-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--sp-4) var(--sp-5) var(--sp-7);
  /* More below fades out instead of cutting a line in half. */
  mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent);
}

.dd-lede {
  text-wrap: pretty;
  max-width: 72ch;
  color: var(--ink-2);
}

.dd-list {
  display: grid;
  margin-top: var(--sp-4);
}

.dd-row {
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr) auto;
  gap: var(--sp-3);
  align-items: baseline;
  padding-block: var(--sp-3);
  border-top: 1px solid var(--rule);
}

.dd-row.is-top .dd-main strong {
  box-shadow: inset 0 -0.42em 0 color-mix(in srgb, var(--pop) 38%, transparent);
}

.dd-year {
  color: var(--ink-3);
  font-weight: 700;
}

.dd-main {
  display: grid;
  gap: 2px;
}

.dd-main strong {
  justify-self: start;
  font-weight: 800;
}

.dd-org {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.dd-src {
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-2);
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
  padding-block: 10px;
  margin-block: -10px;
}

.dd-more {
  display: inline-block;
  padding-block: 10px;
  margin-bottom: -10px;
  white-space: nowrap;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* The demos bring their own top margin for the case page; in here the lede is enough. */
.dd-body :deep(> div:not(.dd-list)) {
  margin-top: var(--sp-4);
}

.dd-body :deep(.os-card) {
  /* The sheet scrolls under its own top padding; stick at the very edge. */
  --os-peek-top: calc(-1 * var(--sp-4));
}

/* The check-up in a window-high sheet: the result sits at the top and stays
   in view while the sliders scroll, and the slider hints give way. */
@media (min-width: 860px) {
  .dd-body :deep(.os-body) {
    align-items: start;
  }

  .dd-body :deep(.os-result) {
    position: sticky;
    top: 0;
  }

  .dd-body :deep(.os-field-hint) {
    display: none;
  }
}

@media (max-width: 640px) {
  .dd {
    width: 100vw;
    max-height: 92dvh;
    margin: auto 0 0;
    border-radius: var(--r-3) var(--r-3) 0 0;
    translate: 0 40px;
  }

  .dd-head {
    grid-template-columns: minmax(0, 1fr);
    padding-top: var(--sp-6);
    touch-action: none;
  }

  .dd-more {
    justify-self: start;
    margin-top: var(--sp-1);
  }

  /* The grip: this sheet is pulled down to close. */
  .dd-head::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 40px;
    height: 4px;
    margin-left: -20px;
    border-radius: 2px;
    background: var(--rule-strong);
  }

  .dd-row {
    grid-template-columns: 2.8rem minmax(0, 1fr);
  }

  .dd-src {
    grid-column: 2;
    justify-self: start;
  }
}
</style>

<style>
/* While a drawer is open, the page (and the desk walk) behind it holds still. */
html:has(dialog.dd[open]) {
  overflow: hidden;
}
</style>
