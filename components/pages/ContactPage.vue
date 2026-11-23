<template>
  <div>
    <Station id="contact" wide :title="t.title" :lede="t.lede" heading-tag="h1">
      <div class="ct">
        <!-- The form. Sent, it is replaced by a thank-you that takes the focus. -->
        <div class="ct-main">
          <p v-if="sent" ref="doneEl" class="ct-done" tabindex="-1" role="status">
            <CheckCircle2 :size="22" aria-hidden="true" />
            <span>{{ t.done }}</span>
          </p>
          <form v-else class="ct-form" novalidate @submit.prevent="send">
            <fieldset class="ct-field">
              <legend class="ct-label">{{ t.topic }}</legend>
              <div class="ct-chips">
                <label v-for="o in t.topics" :key="o.v" class="ct-chip">
                  <input v-model="topic" type="radio" name="topic" :value="o.v" />
                  <span>{{ o.label }}</span>
                </label>
              </div>
            </fieldset>

            <div class="ct-field">
              <label class="ct-label" for="ct-message">{{ t.message }}</label>
              <textarea
                id="ct-message"
                v-model="message"
                rows="7"
                maxlength="3000"
                :aria-invalid="err === 'empty' ? 'true' : undefined"
                aria-describedby="ct-message-hint ct-message-err"
                @input="err === 'empty' && (err = '')"
              />
              <p id="ct-message-hint" class="ct-hint">{{ t.messageHint }}</p>
              <p v-if="err === 'empty'" id="ct-message-err" class="ct-err">{{ t.empty }}</p>
            </div>

            <div class="ct-pair">
              <div class="ct-field">
                <label class="ct-label" for="ct-name">{{ t.name }} <small>{{ t.optional }}</small></label>
                <input id="ct-name" v-model="name" type="text" maxlength="80" autocomplete="name" />
              </div>
              <div class="ct-field">
                <label class="ct-label" for="ct-contact">{{ t.contact }} <small>{{ topic === 'work' ? t.forWork : t.optional }}</small></label>
                <input id="ct-contact" v-model="contact" type="text" maxlength="160" autocomplete="email" inputmode="email" aria-describedby="ct-contact-hint ct-contact-nudge" />
                <p id="ct-contact-hint" class="ct-hint">{{ t.contactHint }}</p>
                <p id="ct-contact-nudge" class="ct-nudge" aria-live="polite"><template v-if="nudge"><Info :size="15" :stroke-width="2.2" aria-hidden="true" /><span>{{ t.nudge }}</span></template></p>
              </div>
            </div>

            <!-- Left empty by people; bots fill it in. -->
            <div class="ct-hp" aria-hidden="true">
              <label for="ct-website">Website</label>
              <input id="ct-website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
            </div>

            <div class="ct-foot">
              <button type="submit" class="ct-send" :disabled="busy">
                <Send :size="18" aria-hidden="true" />
                <span>{{ busy ? t.sending : t.send }}</span>
              </button>
              <p ref="statusEl" class="ct-status" :class="{ 'is-empty': !status, 'is-warn': !!status }" role="status" aria-live="polite" tabindex="-1">
                <template v-if="failedSend">{{ t.failedLead }}<a :href="mailHref">{{ site.contact.email }}</a></template>
                <template v-else>{{ status }}</template>
              </p>
            </div>
          </form>
        </div>

        <!-- The other ways in, for people who would rather not use a form. -->
        <section class="ct-side" :aria-label="t.sideLabel">
          <h2 class="ct-side-h">{{ t.direct }}</h2>
          <p class="ct-mail">
            <a :href="`mailto:${site.contact.email}`">{{ site.contact.email.split('@')[0] }}<wbr />@{{ site.contact.email.split('@')[1] }}</a>
          </p>
          <ul class="ct-links">
            <li v-for="l in links" :key="l.label">
              <a :href="l.href" rel="me noopener" target="_blank">
                <component :is="l.icon" :size="18" :stroke-width="1.9" aria-hidden="true" />
                <span>{{ l.label }}</span>
              </a>
            </li>
          </ul>
          <p class="ct-note">{{ t.what }}</p>
        </section>
      </div>
    </Station>
  </div>
</template>

<script setup>
import { CheckCircle2, Github, Info, Instagram, Linkedin, Send } from 'lucide-vue-next'
import Station from '~/components/studio/Station.vue'

const { site } = useContent()
const { locale } = useLocale()

const links = [
  { label: 'GitHub', href: site.contact.github, icon: Github },
  { label: 'LinkedIn', href: site.contact.linkedin, icon: Linkedin },
  { label: 'Instagram', href: site.contact.instagram, icon: Instagram },
].filter((l) => l.href)

const t = computed(() =>
  locale.value === 'en'
    ? {
        title: 'Get in touch',
        lede: 'Generative-AI and agent architecture, early-stage technical partnerships, talks and workshops. Messages here come straight to me.',
        topic: 'What is it about?',
        topics: [
          { v: 'work', label: 'Work or a project' },
          { v: 'hello', label: 'Just saying hello' },
          { v: 'other', label: 'Something else' },
        ],
        message: 'Your message',
        messageHint: 'What you are working on, and how I could help.',
        empty: 'Write a few words first.',
        name: 'Your name',
        contact: 'How do I reply?',
        contactHint: 'An email address, or any way you would like me to reach you.',
        nudge: 'For work, leave an email or another way to reach you, or I cannot write back.',
        mailSubject: 'From ogmatcha.com',
        optional: '(optional)',
        forWork: '(needed for work)',
        holdNoContact: 'No way to reply yet. Add an email above, or press Send again to send it as it is.',
        send: 'Send',
        sending: 'Sending…',
        done: 'Sent. Thank you, I read every message myself.',
        slow: 'That was quick. Please wait a minute and try again.',
        failed: (m) => `It did not go through. Please email me instead: ${m}`,
        failedLead: 'It did not go through. Please email me instead: ',
        sideLabel: 'Other ways to reach me',
        direct: 'Or write directly',
        what: 'I never share what you send.',
      }
    : {
        title: '聯絡我',
        lede: '生成式 AI 與 agent 架構、早期技術合作、演講與工作坊都歡迎。這裡的留言會直接送到我手上。',
        topic: '想聊什麼？',
        topics: [
          { v: 'work', label: '合作或工作' },
          { v: 'hello', label: '打個招呼' },
          { v: 'other', label: '其他' },
        ],
        message: '想說的話',
        messageHint: '你在做什麼、希望我怎麼幫忙。',
        empty: '先寫幾個字再送出。',
        name: '你的名字',
        contact: '怎麼回覆你？',
        contactHint: 'Email，或任何你希望我聯絡你的方式。',
        nudge: '談合作或工作的話，留個 email 或其他聯絡方式，我才回得了你。',
        mailSubject: '來自 ogmatcha.com 的訊息',
        optional: '（可不填）',
        forWork: '（談工作請留）',
        holdNoContact: '還沒留聯絡方式，我回不了你。在上面補個 email，或再按一次送出照樣寄出。',
        send: '送出',
        sending: '送出中…',
        done: '送出了，謝謝你。每一則我都會自己看。',
        slow: '送得有點快，等一分鐘再試一次。',
        failed: (m) => `沒有送出去，請改寄 email：${m}`,
        failedLead: '沒有送出去，請改寄 email：',
        sideLabel: '其他聯絡方式',
        direct: '也可以直接寫信',
        what: '你寄來的內容不會給任何人。',
      }
)

const topic = ref('work')
const message = ref('')
const name = ref('')
const contact = ref('')
const website = ref('')
const busy = ref(false)
const sent = ref(false)
const err = ref('')
const status = ref('')
// The failure line names the address as a mailto link, not text to copy by hand.
const failedSend = computed(() => !!status.value && status.value === t.value.failed(site.contact.email))
const doneEl = ref(null)
const statusEl = ref(null)
// The fallback address opens a mail already holding what they wrote.
const mailHref = computed(() => {
  const body = [message.value.trim(), name.value.trim() && `— ${name.value.trim()}`, contact.value.trim()].filter(Boolean).join('\n\n')
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(t.value.mailSubject)}&body=${encodeURIComponent(body)}`
})
// A work enquiry with no way to reply is a dead end: say so once they have
// written something, without stopping them from sending.
const nudge = computed(() => topic.value === 'work' && message.value.trim().length >= 2 && !contact.value.trim())
// A work message with no way back is stopped once, with the reason next to
// the button; a second press sends it anyway (someone may only want to say
// something). It used to go straight out while the nudge was still showing.
const heldOnce = ref(false)
watch([contact, topic], () => { if (status.value === t.value.holdNoContact && !nudge.value) status.value = '' })
let loadedAt = 0
onMounted(() => (loadedAt = Date.now()))

async function send() {
  status.value = ''
  if (message.value.trim().length < 2) {
    err.value = 'empty'
    document.getElementById('ct-message')?.focus()
    return
  }
  if (nudge.value && !heldOnce.value) {
    heldOnce.value = true
    status.value = t.value.holdNoContact
    await nextTick()
    document.getElementById('ct-contact')?.focus()
    return
  }
  busy.value = true
  // Same origin on the live site; the dev server posts to the live endpoint.
  const endpoint = location.hostname.endsWith('ogmatcha.com') ? '/api/contact' : 'https://www.ogmatcha.com/api/contact'
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        site: 'ogmatcha',
        topic: topic.value,
        message: message.value,
        name: name.value,
        contact: contact.value,
        page: location.pathname,
        elapsed: Date.now() - loadedAt,
        website: website.value,
      }),
    })
    if (r.status === 429) status.value = t.value.slow
    else if (!r.ok) throw new Error(String(r.status))
    else {
      sent.value = true
      await nextTick()
      doneEl.value?.focus()
    }
  } catch {
    status.value = t.value.failed(site.contact.email)
  } finally {
    busy.value = false
  }
  // The send button is still under the finger; the reason it failed is next to it.
  if (status.value) {
    await nextTick()
    statusEl.value?.focus()
  }
}
</script>

<style scoped>
.ct {
  display: grid;
  gap: var(--sp-7);
}

@media (min-width: 960px) {
  .ct {
    grid-template-columns: minmax(0, 1fr) 18rem;
    align-items: start;
  }
}

.ct-form {
  display: grid;
  gap: var(--sp-6);
}

.ct-field {
  display: grid;
  align-content: start;
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.ct-label {
  padding: 0;
  font-weight: 700;
  color: var(--ink);
}

.ct-label small {
  font-weight: 400;
  color: var(--ink-3);
}

.ct-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.ct-chip {
  position: relative;
  cursor: pointer;
}

.ct-chip input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: pointer;
}

.ct-chip span {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: var(--sp-4);
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--ink-2);
  transition: background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.ct-chip input:checked + span {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--bg);
  font-weight: 700;
}

.ct-chip input:focus-visible + span {
  outline: 2px solid var(--pop);
  outline-offset: 2px;
}

.ct textarea,
.ct input[type='text'] {
  width: 100%;
  min-height: 48px;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-2);
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  /* 16px or iOS zooms in on focus. */
  font-size: max(1rem, 16px);
  line-height: 1.7;
}

.ct textarea {
  resize: vertical;
  min-height: 10rem;
}

.ct textarea[aria-invalid='true'] {
  border-color: var(--pop);
}

.ct-pair {
  display: grid;
  gap: var(--sp-6);
}

@media (min-width: 640px) {
  .ct-pair {
    grid-template-columns: 1fr 1fr;
  }
}

.ct-hint {
  margin: 0;
  font-size: var(--step--1);
  color: var(--ink-3);
}

.ct-err {
  margin: 0;
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--pop);
}

.ct-hp {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.ct-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-4);
}

.ct-send {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 48px;
  padding-inline: var(--sp-6);
  border: 0;
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--bg);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--dur-1),
    color var(--dur-1),
    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.ct-send:hover:not(:disabled) {
  background: var(--pop);
  color: var(--on-pop);
  transform: translateY(-1px);
}

.ct-send:active {
  transform: scale(0.97);
}

.ct-send:disabled {
  opacity: 0.6;
  cursor: progress;
}

.ct-status {
  margin: 0;
  color: var(--ink-2);
}

.ct-status.is-warn {
  flex: 1 1 18rem;
  padding: var(--sp-3) var(--sp-4);
  border-left: 3px solid var(--pop);
  border-radius: var(--r-2);
  background: var(--surface-2);
  color: var(--ink);
  font-weight: 600;
}

.ct-status.is-warn:focus {
  outline: none;
}

.ct-status.is-warn:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: 2px;
}

.ct-status a {
  display: inline-block;
  min-height: 44px;
  line-height: 44px;
  color: var(--pop);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}

.ct-nudge {
  display: flex;
  gap: var(--sp-2);
  align-items: flex-start;
  margin: 0;
  text-wrap: pretty;
  font-size: var(--step--1);
  color: var(--ink-2);
}

/* A hint, not an error: neutral ink, an (i) mark instead of the error colour. */
.ct-nudge svg {
  flex: none;
  margin-top: 0.2em;
  color: var(--ink-3);
}

.ct-nudge:empty {
  display: none;
}

.ct-status:empty,
.ct-status.is-empty {
  display: none;
}

.ct-done {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
  margin: 0;
  padding: var(--sp-5);
  border-radius: var(--r-2);
  background: var(--surface-2);
  font-weight: 700;
}

.ct-done:focus {
  outline: none;
}

/* The note from the homepage desk, here holding the address. */
.ct-side {
  position: relative;
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  background: #f6dc93;
  color: #1e1b18;
  box-shadow:
    0 1px 1px rgb(64 44 24 / 0.1),
    0 22px 30px -18px rgb(64 44 24 / 0.45);
  rotate: 0.8deg;
}

.ct-side::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  width: 6rem;
  height: 24px;
  background: rgb(255 255 255 / 0.55);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
  transform: translateX(-50%) rotate(-2deg);
}

.ct-side-h {
  margin: 0;
  font-size: var(--step-0);
  font-weight: 700;
  color: #4b453f;
}

/* The address stays on one line ("jushenhuang.jason / @gmail.com" read as
   two things) and shrinks to the note's width instead. */
.ct-mail {
  margin: var(--sp-2) 0 0;
  font-weight: 700;
  container-type: inline-size;
}

.ct-mail a {
  white-space: nowrap;
  font-size: min(var(--step-0), 5.6cqi);
}

.ct-mail a {
  color: #1e1b18;
  text-decoration-color: #c44a24;
  text-underline-offset: 4px;
}

.ct-links {
  display: grid;
  gap: var(--sp-1);
  margin: var(--sp-4) 0 0;
  padding: 0;
  list-style: none;
}

.ct-links a {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 44px;
  color: #4b453f;
  text-decoration: none;
}

.ct-links a:hover {
  color: #a83c1c;
}

.ct-note {
  margin: var(--sp-3) 0 0;
  font-size: var(--step--1);
  color: #4b453f;
}

@media (prefers-reduced-motion: reduce) {
  .ct-chip span,
  .ct-send {
    transition: none;
  }
}
</style>
