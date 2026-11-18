<template>
  <!--
    The point of PhishForge, small enough to play with: an inbox where the
    phishing mail is written for this department, so it does not look like a
    training template. Mark each one, then see what gave it away. The company,
    people and addresses are made up (.example is a reserved domain).
  -->
  <div class="ph-card">
    <p class="ph-ctx">{{ t.ctx }}</p>

    <ol class="ph-list">
      <li v-for="(m, i) in mails" :key="m.id" class="ph-mail" :class="shown ? (m.phish ? 'is-phish' : 'is-safe') : ''">
        <div class="ph-head">
          <span class="ph-from">
            <strong>{{ m.name }}</strong>
            <span class="ph-addr" :class="{ 'ph-mark': shown && m.clues.includes('addr') }">&lt;{{ m.addr }}&gt;</span>
          </span>
          <span class="ph-time figures">{{ m.time }}</span>
        </div>
        <p class="ph-subject" :class="{ 'ph-mark': shown && m.clues.includes('subject') }">{{ m.subject }}</p>
        <p class="ph-text">
          <template v-for="(part, k) in m.body" :key="k">
            <span v-if="part.clue" :class="{ 'ph-mark': shown }">{{ part.text }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
        <p v-if="m.link" class="ph-link">
          <span class="ph-btn">{{ m.link.label }}</span>
          <span class="ph-url" :class="{ 'ph-mark': shown && m.clues.includes('link') }">{{ m.link.url }}</span>
        </p>

        <div v-if="!shown" class="ph-pick" role="radiogroup" :aria-label="`${t.mail} ${i + 1}`">
          <button type="button" role="radio" :aria-checked="pick[m.id] === 'ok'" class="ph-choice" :class="{ 'is-on': pick[m.id] === 'ok' }" @click="pick[m.id] = 'ok'">{{ t.ok }}</button>
          <button type="button" role="radio" :aria-checked="pick[m.id] === 'phish'" class="ph-choice ph-choice--bad" :class="{ 'is-on': pick[m.id] === 'phish' }" @click="pick[m.id] = 'phish'">{{ t.phish }}</button>
        </div>
        <p v-else class="ph-verdict" :class="{ 'is-right': right(m) }">
          <strong>{{ m.phish ? t.wasPhish : t.wasOk }}</strong>
          <span>{{ right(m) ? t.right : t.wrong }}</span>
          <span class="ph-why">{{ m.why }}</span>
        </p>
      </li>
    </ol>

    <div class="ph-foot" aria-live="polite">
      <button v-if="!shown" type="button" class="ph-go" :disabled="!allPicked" @click="shown = true">{{ allPicked ? t.check : t.pickAll }}</button>
      <template v-else>
        <p class="ph-score">{{ t.score(score, mails.length) }}</p>
        <button type="button" class="ph-again" @click="reset">{{ t.again }}</button>
      </template>
    </div>

    <p class="ph-note">{{ t.note }}</p>
  </div>
</template>

<script setup>
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

const pick = reactive({})
const shown = ref(false)
const right = (m) => (pick[m.id] === 'phish') === m.phish
const allPicked = computed(() => mails.value.every((m) => pick[m.id]))
const score = computed(() => mails.value.filter(right).length)
function reset() {
  for (const k of Object.keys(pick)) delete pick[k]
  shown.value = false
}

const mails = computed(() =>
  E.value
    ? [
        {
          id: 'vendor',
          phish: true,
          name: 'Lin, Accounts (Hengda Supply)',
          addr: 'billing@hengda-supply.example',
          time: '09:12',
          subject: 'Re: Q3 order 7731 — new bank details for this payment',
          body: [
            { text: 'Hi, following up on the Q3 order your team confirmed last week. ' },
            { text: 'Our bank account changed this month, ', clue: true },
            { text: 'so please use the details in the updated invoice for this payment. ' },
            { text: 'Finance closes on Friday, so we would appreciate it today.', clue: true },
          ],
          link: { label: 'View updated invoice', url: 'hengda-supply.example.invoice-share.example/7731' },
          clues: ['link'],
          why: 'Changed bank details, a deadline, and a link that only starts with the supplier’s name. Written for purchasing, about a real-sounding order.',
        },
        {
          id: 'hr',
          phish: false,
          name: 'HR',
          addr: 'hr@anhe.example',
          time: '10:40',
          subject: 'Annual health check sign-up is open',
          body: [{ text: 'Sign-up for this year’s health check is on the HR page of the intranet, as every year. No reply needed.' }],
          clues: [],
          why: 'The company’s own address, nothing urgent, and it points you to a place you already know instead of a link.',
        },
        {
          id: 'it',
          phish: true,
          name: 'IT Service Desk',
          addr: 'it-helpdesk@anhe-support.example',
          time: '11:05',
          subject: 'Your mailbox password expires in 24 hours',
          body: [
            { text: 'To keep access during the system upgrade, ' },
            { text: 'confirm your password within 24 hours', clue: true },
            { text: ' or your mailbox will be locked.' },
          ],
          link: { label: 'Keep my password', url: 'anhe-support.example/m365/login' },
          clues: ['addr', 'link'],
          why: 'Looks like IT, but the address is anhe-support, not anhe. Real IT never asks for your password by mail.',
        },
      ]
    : [
        {
          id: 'vendor',
          phish: true,
          name: '恆達供應 帳務 林小姐',
          addr: 'billing@hengda-supply.example',
          time: '09:12',
          subject: 'Re: 第三季訂單 7731：本次付款請改匯新帳戶',
          body: [
            { text: '您好，接續上週貴單位確認的第三季訂單。' },
            { text: '本公司本月更換了收款帳戶，', clue: true },
            { text: '這筆款項請依更新後的發票資料匯款。' },
            { text: '財務週五關帳，麻煩今天協助處理，謝謝。', clue: true },
          ],
          link: { label: '查看更新後的發票', url: 'hengda-supply.example.invoice-share.example/7731' },
          clues: ['link'],
          why: '突然換匯款帳戶、限時要你處理，連結只是開頭長得像廠商。內容寫的是採購部真的會碰到的訂單。',
        },
        {
          id: 'hr',
          phish: false,
          name: '人資部',
          addr: 'hr@anhe.example',
          time: '10:40',
          subject: '年度健康檢查開放報名',
          body: [{ text: '今年的健康檢查一樣在內網的人資頁面報名，不需要回信。' }],
          clues: [],
          why: '公司自己的網域、沒有催你，也沒有連結，而是叫你去本來就知道的地方。',
        },
        {
          id: 'it',
          phish: true,
          name: '資訊部 服務台',
          addr: 'it-helpdesk@anhe-support.example',
          time: '11:05',
          subject: '您的信箱密碼將於 24 小時後到期',
          body: [
            { text: '因應系統升級，' },
            { text: '請於 24 小時內確認密碼', clue: true },
            { text: '，逾期將暫停信箱使用。' },
          ],
          link: { label: '保留目前密碼', url: 'anhe-support.example/m365/login' },
          clues: ['addr', 'link'],
          why: '看起來是資訊部，網域卻是 anhe-support，不是 anhe。真的資訊部不會寫信要你的密碼。',
        },
      ]
)

const t = computed(() =>
  E.value
    ? {
        ctx: 'You work in purchasing at Anhe Tech (anhe.example). Three mails this morning: which ones are phishing?',
        mail: 'Mail',
        ok: 'Looks fine',
        phish: 'Phishing',
        pickAll: 'Mark all three first',
        check: 'Show me',
        wasPhish: 'Phishing.',
        wasOk: 'Real.',
        right: 'You got it.',
        wrong: 'Missed this one.',
        score: (n, of) => `${n} of ${of} right. PhishForge writes mails like the first one for each department, so a drill tests judgement, not memory of a template.`,
        again: 'Try again',
        note: 'Made-up company and addresses, written for this page; not output from PhishForge.',
      }
    : {
        ctx: '你是安和科技（anhe.example）採購部的員工。早上收到三封信，哪幾封是釣魚信？',
        mail: '信件',
        ok: '看起來正常',
        phish: '是釣魚信',
        pickAll: '三封都判斷完再看答案',
        check: '看答案',
        wasPhish: '釣魚信。',
        wasOk: '正常的信。',
        right: '你答對了。',
        wrong: '這封沒抓到。',
        score: (n, of) => `答對 ${n} / ${of} 封。PhishForge 會依部門寫出第一封那樣的信，演練考的是判斷力，不是記不記得範本。`,
        again: '再試一次',
        note: '公司、人名和網址都是為這一頁編的，不是 PhishForge 產生的內容。',
      }
)
</script>

<style scoped>
.ph-card {
  display: grid;
  gap: var(--sp-5);
  margin-top: var(--sp-6);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
}

.ph-ctx {
  font-weight: 700;
}

.ph-list {
  display: grid;
  gap: var(--sp-3);
}

.ph-mail {
  display: grid;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-2);
  background: var(--bg);
  box-shadow: inset 0 0 0 1px var(--rule);
  transition: box-shadow var(--dur-2);
}

.ph-mail.is-phish {
  box-shadow: inset 0 0 0 2px var(--pop);
}

.ph-mail.is-safe {
  box-shadow: inset 0 0 0 2px #2f8f5b;
}

.ph-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--step--1);
}

.ph-from {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--sp-2);
  min-width: 0;
}

.ph-addr,
.ph-url {
  color: var(--ink-3);
  overflow-wrap: anywhere;
}

.ph-time {
  color: var(--ink-3);
}

.ph-subject {
  font-weight: 800;
}

.ph-text {
  color: var(--ink-2);
  font-size: var(--step--1);
  line-height: 1.75;
}

.ph-link {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--step--1);
}

.ph-btn {
  padding: 4px 12px;
  border-radius: var(--r-1);
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}

/* What gave it away: a highlighter stroke, added when the answers show. */
.ph-mark {
  background: linear-gradient(transparent 55%, color-mix(in srgb, var(--select) 85%, transparent) 55%);
  color: var(--ink);
  font-weight: 700;
}

.ph-pick {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-1);
}

.ph-choice {
  min-height: 40px;
  padding: 0 var(--sp-4);
  border: 0;
  border-radius: var(--r-full);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--rule-strong);
  color: var(--ink-2);
  font: inherit;
  font-size: var(--step--1);
  font-weight: 700;
  cursor: pointer;
}

.ph-choice.is-on {
  background: var(--ink);
  color: var(--surface);
  box-shadow: none;
}

.ph-choice--bad.is-on {
  background: var(--pop);
  color: var(--on-pop);
}

.ph-verdict {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--sp-2);
  margin-top: var(--sp-1);
  font-size: var(--step--1);
  color: var(--ink-2);
}

.ph-verdict > span:nth-child(2) {
  color: var(--pop-ink);
  font-weight: 700;
}

.ph-verdict.is-right > span:nth-child(2) {
  color: inherit;
}

.ph-why {
  flex-basis: 100%;
  line-height: 1.7;
}

.ph-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3) var(--sp-5);
}

.ph-go,
.ph-again {
  min-height: 44px;
  padding: 0 var(--sp-5);
  border: 0;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.ph-go:disabled {
  background: var(--surface-2);
  color: var(--ink-3);
  box-shadow: inset 0 0 0 1px var(--rule);
  cursor: default;
}

.ph-again {
  background: var(--surface-2);
  color: var(--ink);
  box-shadow: inset 0 0 0 1px var(--rule-strong);
}

.ph-score {
  flex: 1 1 20rem;
  font-weight: 700;
  line-height: 1.7;
}

.ph-note {
  font-size: var(--step--1);
  color: var(--ink-3);
}
</style>
