# 個人網站改版計畫

> 對象：黃鉅燊 / Ju-Shen Huang（ogmatcha.com）
> 版本日期：2026-08-08　·　基準 commit：`df9fa26`（master）
> 本文所有 `file:line` 皆對應本次稽核當下的程式碼。

---

## 1. 現況診斷

### 1.1 現在做對的事（不要打掉）

| 項目 | 位置 | 為什麼保留 |
|---|---|---|
| Nuxt 3 static generate + GitHub Pages + CNAME | `nuxt.config.ts` | 部署模型正確、零成本、SEO 友善。整份計畫都建立在這個前提上 |
| `ssr: true` + `nitro.prerender.crawlLinks` | `nuxt.config.ts` | 內容進得了 HTML，這是網站能靠名字排名的根本原因 |
| JSON-LD Person schema | `nuxt.config.ts:86-111` | 結構正確（雖然裡面有兩個壞 URL，見 1.2） |
| `ProjectModal.vue:3` 用 `<Teleport to="body">` | — | 全站唯一正確處理 stacking context 的地方。之後任何 fixed/pinned overlay 都照這個做 |
| 內容本身的密度 | 全站 | 13 個獎項、3 個研究（含 LAK 2025 與 2 個國科會）、8 個專案、CTO 職位。**素材是真的夠的**，問題從來不是沒東西寫 |
| `HexagonSkillNetwork.vue` 的連線是真 SVG `<path>` | `components/services/` | 這是現成的 DrawSVG 目標，改版時是重寫不是從零長 |

### 1.2 拖住這個網站的五件事

**① 桌機上 window 根本不會捲動 —— 這是所有捲動工程的第一號地雷**

`layouts/default.vue:4` 設 `lg:h-screen lg:overflow-hidden`，`layouts/default.vue:34` 讓 `#mainContent` 帶 `overflow-y-auto`。所以 ≥1024px 時真正的 scroller 是 `#mainContent`，`window.scrollY` 永遠是 `0`。

這已經**現在就壞著**，不是未來的風險：

| 壞掉的東西 | 位置 | 症狀 |
|---|---|---|
| 履歷回到頂端按鈕 | `resume.vue:715` `window.scrollY > 300` | 桌機永遠不出現 |
| 履歷錨點導覽 | `resume.vue:653-672` | 桌機點了不動 |
| StickyNav 觸發 | `StickyNav.vue:71` | 永遠不觸發 |
| NavBar active link | `NavBar.vue:57` | 永遠算錯 |

而 breakpoint 一過（<1024px）scroller 又變回 window，所以任何 `scroller` 設定都是斷點相依的。**在解決這件事之前不要寫任何一行 ScrollTrigger。**

**② 動畫系統有 ~900 行，其中大部分是不會執行的死碼**

- `AnimateOnView.vue:32-35` 的 `animateOnPageLoad` 預設 `true`，`:56` 在建立 IntersectionObserver **之前**就 `return`。全部 6 個呼叫點都沒傳 `false`。也就是說：**這個網站從來沒有真正的 scroll reveal**，全部只是 `setTimeout(100)`。
- `PageTransition.vue:11-13` 用 `<transition mode="out-in">` 包一個靜態、無 `key` 的 `<div>`。Vue 只在子節點身分改變時跑 transition，所以 `:25-49` 的 hooks **一次都沒執行過**。
- `plugins/animations.client.js:44-56` 每次 `page:finish` 都 `new IntersectionObserver` 且從不 `disconnect()` —— 每次換頁洩漏一個全文件 observer。
- `TypeWriter.vue:68-80` 清掉 reference 但沒呼叫 TypeIt `.destroy()`，unmount 後 loop timer 繼續跑。

好消息：**沒有任何有價值的行為需要保留**，GSAP 可以整層取代而不是共存。

**③ 網站現在其實是用 Arial / system-ui 在跑**

`nuxt.config.ts:74-78` render-blocking 載入 Montserrat，但全 repo 唯一一處 `font-family` 宣告在 `PageLoader.vue:165` —— 一個 `app.vue:49-53` 對回訪者關閉的載入畫面。因為 `tailwind.config.js:11` 是 `extend: {}`，全站 body 落到 Tailwind Preflight 的 `ui-sans-serif, system-ui, …, Arial`。

**付了一整趟 round trip，用的是 impeccable 明文禁止的系統預設字。** 而且 Montserrat 沒有任何 CJK 字符，所以主語系的繁體中文全部交給作業系統決定（Mac 是 PingFang TC、Windows 是 微軟正黑、Android 是 Noto Sans CJK），三個平台長相不同。

**④ 沒有設計系統 —— 量化後的熵**

`tailwind.config.js:10-12` 是 `theme: { extend: {} }`。零 token。實測：

| 維度 | 數量 | 具體證據 |
|---|---|---|
| 十六進位色 | **37** 種 | 深灰帶就有 14 種：`#1a1a1a`(21次)、`#242424`(11)、`#2a2a2a`(10)、`#333`(7) 與 `#333333`(6) 被當成兩個不同的值、`#252525`(4)、`#2d2d2d`(3)、`#292929`(3)、`#303030`(2)、`#3a3a3a`、`#3d3d3d`、`#4d4d4d`、`#2c2c2c`、`#262626`、`#1e1e1e`、`#121212` |
| 品牌黃 | **4** 種寫法 | Tailwind `yellow-400`、`#facc15`(`SectionTitle.vue:31`)、`#fbbf24`/`#f59e0b`(`ProfileCard.vue:291`)、`#ffd700`/`#ff9d00`(`PageLoader.vue:199`) |
| border-radius | **29** 種 | `rounded-[10/12/15/16/18/20/22/24/25/28/30px]` + `rounded-full`(49次)/`lg`/`xl`/`2xl`/`md` + raw CSS 的 2/3/4/6/8/9/10/12/15/16px + 0.5/0.75rem + 50%。`layouts/default.vue:24` 一個元素就 12→15→18→22→28px 跨五個斷點，`ProfileCard.vue:4` 旁邊獨立跑 20→25→30px |
| 陰影 | **~40** 種 | 19 個 arbitrary `shadow-[...]` + 6 個 Tailwind named + 15 個 raw `box-shadow`，含 4 種色光暈 |
| 字級 | 9 Tailwind + 3 arbitrary + 16 raw CSS | 含 5 處 `text-[10px]`（低於 12px 可讀性下限），11 處 raw `font-size` 帶 `!important` |
| `!important` | **104** 個 | `ProjectCard.vue` 29、`resume.vue` 28、`viewport-reset.client.js` 15、`NavLink.vue` 15 |
| 手寫 media query | **23** 條 | 含 `(min-width:768px) and (max-width:830px)`(`NavBar.vue:157`) 這種只為了修一個視覺 bug 而存在的區間 |

impeccable 明確禁止的模式，這裡都有：紫色漸層（`HexagonSkillNetwork.vue:135` 的 `linear-gradient(135deg, #7c3aed, #6366f1)`、`:189` 的 `#8b5cf6→#a78bfa`、`AboutSection.vue:31` 的 `from-yellow-400 via-blue-400 to-purple-400`）、純黑無色調（`bg-black/75`、`bg-black bg-opacity-60`）、卡中卡（`rounded-[28px]` 殼 → `rounded-[30px]` ProfileCard → `rounded-[24px]` section → `rounded-[12px]` chip）、無語意色彩（`AboutSection.vue:110-119` 用陣列 index 輪替 8 種顏色）。

**⑤ 內容凍結在 2025 年 2 月 —— 網站現在告訴讀者你還是大學生**

最後一筆內容 commit 是 `2025-03-03`，CV PDF 是 `2025-04-25`，最後一筆任何 commit 是 `2025-06-12`。以 2026-08-08 計算是 **約 18 個月的空白**。

| 具體症狀 | 位置 |
|---|---|
| 學歷寫「2022年9月 - 2026年6月（**預計**）」，而該日期已經過了 | `EducationSection.vue:105-108` |
| 114 學年度完全不存在 | 同上 |
| 最新獎項是 2025年2月，最新研究結束於 2025年2月，最新 news 是 2025-02-15 | `resume.vue:430`、`ResearchSection.vue`、`public/content/news.md` |
| Finctory「2024年4月 - 現在」沒有 as-of 日期 | `ResumeSection.vue:105-108` |
| 側欄 badge 在每一頁都寫「Web Developer」，而 title 與 JSON-LD 寫 CTO | `ProfileCard.vue:53` |
| 全站只有兩個量化工程成果，都來自 2023 年的網管工讀（故障時間 -40%、載入速度 +50%）。18 個月 CTO 產出 0 個數字 | `ResumeSection.vue:121-122` |

**外加一組會直接扣分的技術債（全部便宜、全部該修）：**

| Bug | 位置 | 影響 |
|---|---|---|
| `/news` 在 `onMounted` 用 client fetch 抓 markdown | `news.vue:88,104` | 預渲染 HTML 只有「載入新聞中…」，Google 與 LLM crawler 看到空頁 |
| JSON-LD `sameAs` 的 GitHub 是 `github.com/ogmatcha`（真的是 `OG-Matcha`） | `nuxt.config.ts:90-93` | 404 |
| `og:image` 指向不存在的 `/assets/profile-cover.jpg` | `nuxt.config.ts:57` | 所有社群分享預覽是破圖 |
| JSON-LD image URL 有雙斜線 | `nuxt.config.ts:89` | — |
| 手寫 `public/sitemap.xml`（lastmod 2025-03-03）覆蓋 `@nuxtjs/sitemap` 產生的路由，且帶 trailing slash 與 canonical 不一致 | — | canonical/sitemap 衝突 |
| 圖片 **19 MB** 未最佳化，`@nuxt/image` 裝了、設定了、**一次都沒用**（0 個 `<NuxtImg>`）。`invoicedoctor-1.jpg` 是 6.9 MB 卻當 ~400×250 縮圖 | `portfolio.vue:159` | 中階手機最大的效能問題 |
| `ipx` provider 在 static GitHub Pages 上無法執行 | `nuxt.config.ts:17-22` | 要改 `ipxStatic` |
| 專案圖片是相對路徑 `'./images/…'` | `portfolio.vue:130` 等 12 處 | `nuxt generate` 產出 `portfolio/index.html`，在 `/portfolio/` 下會解析成 `/portfolio/images/…` 而 404 |
| `viewport-reset.client.js:21,26` 設 `user-scalable=no` | — | WCAG 1.4.4 失敗；且每次進 `/portfolio` 就往 `<head>` 塞一個新 `<style>` 從不移除（無上限洩漏） |
| 全站 `prefers-reduced-motion` 出現 **0 次** | — | WCAG 2.3.3 缺口 |
| `public/models/`、`public/sounds/` 是空目錄 | — | 刪掉 |

---

## 2. 設計方向：圖鑑 / THE ATLAS

> 留白（LIUBAI）的編輯骨架 × HEXAGONAL 的分層 3D，兩位評審獨立收斂出的同一個交集。

### 2.1 一句話

**把網站做成一本「系統圖鑑」：繁體中文編輯排版的紙本質感承載內容，捲動則是在改變「抽象層級」—— 每一次視覺變形都是資訊粒度的變化，不是裝飾。**

三條不可違反的法則：

1. **所有動作都必須攜帶資訊。** 一個元素會動，是因為它在告訴你一件新的事。飄進來的淡入不算。
2. **每一段動畫的 reduced-motion 版本本身就是完整可出貨的靜態段落。** 這條同時是無障礙政策，也是排程保險：做到一半的網站看起來也是完成品。
3. **所有內容（人名、職稱、專案名、決策文字、trace 步驟）都活在 prerender 好的語意 DOM 裡。** SVG 與 3D 永遠是覆蓋在真 DOM 上的表現層，永遠不是它的替代品。

### 2.2 為什麼是它贏（照兩份評審意見）

| 評審 | 勝出者 | 總分 |
|---|---|---|
| 招募/投資人視角 | LIUBAI 骨架 + HEXAGONAL 的 L2/L3 移植 | LIUBAI 29 / HEX 28 |
| 工程視角 | HEXAGONAL + LIUBAI 的內容與排版移植 | HEX 30 / LIUBAI 27 |

兩份評審的**移植清單幾乎一模一樣**，所以這不是妥協，是收斂。決策依據：

- **90 秒與手機**。招募方一半的 session 在手機上。HEXAGONAL 原案把「目前狀態 + 三個 CTA」放在 97% 捲動深度、三個 pin 之後 —— 手機讀者永遠到不了。ATLAS 把 dateline 與聯絡方式提到第一屏與前三分之一。
- **判斷力是散文形狀的**。這位主人被雇用/被投資的理由是判斷力，不是技術清單。而現況最大的可信度破口正是「51 個自評百分比」：`FrameworkExperienceChart.vue:357` 把 Qt 評到 86%/3年，但 Qt 在 8 個專案、13 個獎項、3 個研究裡出現 **0 次**；`HexagonSkillNetwork.vue:167` 宣稱 MongoDB，全站無任何佐證；LangChain 是 4 個專案 + 2 個國科會研究的骨幹，卻被評為 AI 組**最低**的 70%。技術讀者八秒內偵測得到。
- **「沒有的東西」是整份提案最強的單一構想**（兩位評審獨立點名）。公開、有日期的能力缺口，會讓其他所有宣稱瞬間變得可信。
- **可行性本身就是招募訊號**。一個已經停更 18 個月的 solo maintainer，不能交付一個七幕、三個 pin、手繪 MotionPath、Flip 水平軌道加 WebGL 的方案。那個方案的真實結局是「70% 完成度爛在那裡，然後再次過期」。

### 2.3 移植進來的（GRAFT）

| 來源 | 內容 |
|---|---|
| HEXAGONAL L2 | **五層堆疊平面的 CSS-3D 下潛**，成為全站真正的 3D 幕：Client → Edge/API → Agents → Data → Infra。Z 軸就是抽象層級，這是誠實回應「3D immersive scroll」需求的方式，而且 0 額外 bytes |
| HEXAGONAL L3 | **發票醫生的請求 trace**，逐 hop 加上取捨說明。移到 `/work/invoice-doctor` |
| HEXAGONAL | **「每一項技術都連到一個實際交付物」寫在頁面上**，不只是資料層默默執行 |
| HEXAGONAL | 案例卡骨架 **問題 / 架構決策 / 取捨 / 結果**，以及 **3 篇升格 + 5 條降格** 的比例（不是 LIUBAI 的 2+6）—— 三篇才讀得出是一個 body of work，而且 Finctory 是 VC 一定會問的那一篇 |
| HEXAGONAL | changelog / deploy-log 敘事套用到年表，強制每筆有日期 —— 這是唯一一個會讓「又過期了」在視覺上無所遁形的機制 |
| HEXAGONAL | cursor-as-inspector 讀數（devtools 風格），**只**掛在 L2 平面與技能圖上 |
| LIUBAI | 編輯骨架、暖紙色、繁中排版力學、報頭 dateline、「沒有的東西」、圖鑑式 figure 框、決策日誌 |

### 2.4 砍掉的（KILL）—— 以及為什麼

| 砍掉 | 理由 |
|---|---|
| **OGL / 任何 WebGL** | 兩位評審都砍。~10 kB、只放一次、依它自己的規格對 reduced-motion / touch / 低核心裝置全部隱形（也就是大半的 90 秒樣本），而且是最可能在中階 Android 掉幀的元件。**最終相依只有 `gsap` 一個**。 |
| **Three.js / TresJS** | 182 kB gz = 整個動畫 stack 的 3.4 倍，`public/models/` 是空的，沒有任何資產能正當化它 |
| **水平 containerAnimation + Flip 重排 + refresh** | 提案中最容易壞的組合：containerAnimation 下 pin 與 snap 都不可用、巢狀 trigger 要用水平 start 值、Flip 重排會讓 containerAnimation 依賴的量測失效。改成垂直兩層清單。同時省下 9.7 kB Flip chunk |
| **MotionPath 手繪 trace 路徑（含分岔再合流）** | 幾何是手繪的，未來每次改一個 hop 都要重畫 SVG —— 這是整個網站內容變動最頻繁的段落上的永久維護稅。改成靜態 `<ol>` + 一條直線 SVG，用 ScrollTrigger `onUpdate` 切換高亮 class |
| **`snap: 'labels'`** | 跟觸控板慣性打架，是「頁面壞掉、我捲不過去」回報的第一名，iOS Safari 尤其。**保留 labels 驅動導覽狀態，不做 snap** |
| **420px 封閉的 prism 圖** | 付了 3D 的全部概念與程式碼成本，卻小到感知不到深度。用 L2 平面取代。但**保留它的四行內容模型**（領域 / 一個決策 / 代價 / 日期），那是好東西 |
| **本文逐行 ink-density scrub（opacity 0.28 → 1.0）** | 讀者捲動期間，全站最重要的散文長時間低於 AA 對比。台灣日光下的手機根本讀不到。閱讀文字不該是進度條 |
| **磁性 CTA 按鈕** | 在「每一像素的動作都是抽象層級的變化」這條法則下，磁性攜帶零資訊。是整套動作系統裡唯一的純裝飾 |
| **手工 fonttools / glyphhanger 靜態子集** | 對 solo maintainer 是地雷：改了一個標題忘記重跑 script，網站就在自己的名字上出現豆腐字，**沒有錯誤、沒有測試、沒有 CI 訊號**，而且本機裝了字型所以看不出來。改用可預測的 unicode-range 切片 |
| **奧付裡的效能炫技數字**（JS gz / LCP / CLS） | 招募方讀成雜訊，投資人讀成在優化錯的變數，而且兩次部署就過期。保留奧付真正有用的部分：一行技術說明、零分析零 cookie、最後更新日、聯絡方式 |
| **「沒有的東西」裡的自傷條目** | 保留這一段（它是最強的），但**上限 3 條**，且每條寫成有日期的 roadmap 而非告解。「還沒有 on-call 輪值」回答了沒人問的問題，還主動揭露自己經營的公司的弱點。誠實是資產，無差別揭露不是 |
| **淺色作為唯一身分** | 暖紙色留著，但**第一次部署就同時出貨深色**並尊重 `prefers-color-scheme`。台灣開發者社群相當比例預設深色，他們的第一印象不能是較弱的那一版 |
| `PageLoader.vue`（325 行）、`PageTransition.vue`、`AnimateOnView.vue`、`plugins/animations.client.js`、`plugins/viewport-reset.client.js` | ~900 行，可證明的死碼或主動有害 |

### 2.5 誠實交代：這個方向犧牲了什麼

1. **它不是 Awwwards 型的視覺奇觀。** 沒有粒子、沒有 shader、沒有全螢幕 WebGL 場景。如果期待的是「打開網頁掉下巴」，這個方向會讓人失望；它換來的是「這個人能推理系統邊界」。
2. **只有一幕真正的 3D**（五層平面下潛），而且 <1024px 完全不執行 —— 手機拿到的是同資訊的平面層次圖。這是刻意的：pin 在手機上跟收合的網址列打架，而效能約束比沉浸感優先。
3. **關鍵路徑是寫作，不是程式。** 三篇案例、六個取捨句、trace 的每一 hop、「沒有的東西」—— 這些只有本人寫得出來。如果文字不寫，這個方向會退化成一個很漂亮的空白頁（這正是 LIUBAI 被扣分的地方，也是 §7 Phase 1 必須排在動畫之前的原因）。
4. **繁中 Ming 體 + 暖紙色的風險**：它是作家 / 編輯 / 設計工作室的視覺語言。用 mono 承載所有數據、技術名與 log 行來對沖（那是 §3 裡 IBM Plex Mono 是承重結構而非裝飾的原因）。

---

## 3. Design System / Tokens

### 3.1 色彩：帶色調的紙與墨

以 hex 為權威值；oklch 欄為換算參考（≈，實作時以 devtools 驗證）。

**Light（`:root` 裸選擇器，完整定義）**

| Token | Hex | oklch ≈ | 用途 | 對比 |
|---|---|---|---|---|
| `--paper` | `#F4F1EA` | `oklch(0.955 0.008 85)` | 頁面底 | — |
| `--paper-sunk` | `#EBE6DB` | `oklch(0.928 0.014 85)` | figure 內凹底 | — |
| `--ink` | `#141A16` | `oklch(0.194 0.008 155)` | 本文、標題 | **15.7:1** on paper ✓AAA |
| `--ink-2` | `#4A544C` | `oklch(0.418 0.012 155)` | 次要文字、mono 標籤 | **6.9:1** ✓AA (含 small text) |
| `--zhu` | `#A8321C` | `oklch(0.463 0.152 35)` | **唯一強調色**，可承載文字 | **5.9:1** ✓AA |
| `--zhu-mark` | `#C8452B` | `oklch(0.548 0.157 36)` | 只用於非文字標記（進度線、時間軸刻度、旁點） | 4.1:1 — **不可用於文字** |
| `--rule` | `#C9C2B3` | `oklch(0.798 0.020 90)` | 純裝飾髮絲線 | 1.6:1（裝飾用，符合規範） |
| `--rule-strong` | `#8A8071` | `oklch(0.575 0.024 85)` | 互動元件邊界、focus ring | **3.4:1** ✓非文字 UI 3:1 |

**Dark（`@media (prefers-color-scheme: dark)` 包在 `:root:not([data-theme="light"])`，並在 `:root[data-theme="dark"]` 再定義一次）**

| Token | Hex | oklch ≈ | 對比 |
|---|---|---|---|
| `--paper` | `#151713` | `oklch(0.185 0.006 130)` | — |
| `--paper-sunk` | `#1C1F1A` | `oklch(0.226 0.008 130)` | — |
| `--ink` | `#E8E4D8` | `oklch(0.917 0.014 90)` | **14.2:1** ✓AAA |
| `--ink-2` | `#9EA79A` | `oklch(0.685 0.014 145)` | TODO：實測，預估 ~7:1 |
| `--zhu` | `#E2705A` | `oklch(0.673 0.128 32)` | **5.8:1** ✓AA |
| `--zhu-mark` | `#F08C74` | `oklch(0.745 0.121 33)` | 非文字 |
| `--rule` | `#2E332C` | `oklch(0.286 0.010 140)` | 裝飾 |
| `--rule-strong` | `#6E766C` | `oklch(0.545 0.012 145)` | **3.8:1** ✓ |

**強調色策略：** `--zhu`（朱批的硃砂 / 印章紅）平均每個視窗高度出現 **≤4 次**，且**永遠不作為填色**。它只會是：1px 規線、3px 時間軸刻度、CJK 字下方的旁點（中文沒有斜體，旁點是它的對應機制）、連結底線、以及 L2 平面上「目前焦點層」的標記。

**明令刪除：** 兩個紫色漸層（`HexagonSkillNetwork.vue:135`、`:189`）、`AboutSection.vue:31` 的漸層文字、四種黃色寫法、`AboutSection.vue:110-119` 的 8 色 index 輪替、所有 `bg-black/*` overlay（改成 `color-mix(in oklab, var(--paper) 88%, transparent)`）。**全系統零漸層。**

### 3.2 字體

四個家族，全部自架在 `public/fonts/`（目前不存在），並移除 `nuxt.config.ts:70-78` 的兩個 render-blocking 第三方 `<link>`。Font Awesome 6（~70 kB CSS + ~30 kB woff2，為了約 15 個 icon）改成 inline SVG。

| 角色 | 字體 | 授權 | 理由 |
|---|---|---|---|
| Latin display + text | **Source Serif 4**（Variable） | OFL | 與思源宋體同屬 Adobe 思源家族計畫，是**真正對得起來的**中西配對，不是隨便湊。決定性地不是 Inter / system-ui |
| 數據 / 標籤 / 指標 / log 行 / 節點 ID | **IBM Plex Mono** 400/500 | OFL | mono 在這裡是承重結構不是裝飾：每一個數字、技術名、trace 行都是 mono，這就是頁面讀起來像儀表而不像部落格的原因 |
| CJK display（標題） | **思源宋體 Noto Serif TC** 700 / 900 | OFL | 全台灣開發者作品集都是黑體配近黑底；Ming 體是台灣書籍、教科書、報紙的臉。這是整個方向最不可被 AI 預設值產生的一個決定 |
| CJK body | **思源黑體 Noto Sans TC** 400 / 500 | OFL | 內文小字在螢幕上用黑體，Ming 只留給 display |

**自架方式（避開手工子集地雷）：**

```bash
# 1. 取得 Google Fonts CSS2 的 unicode-range 切片清單（Noto Sans TC 已被切成 105 片 / 每字重，每片 ~9 kB）
curl -H "User-Agent: Mozilla/5.0" \
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap" \
  -o /tmp/noto-sans-tc.css
# 2. 把 CSS 裡所有 woff2 下載到 public/fonts/，把 src url 改成 /fonts/...
# 3. 對 Noto Serif TC (700;900)、Source Serif 4、IBM Plex Mono 重複同樣流程
```

實際頁面只會下載它用到的 4–8 個切片 ≈ **35–70 kB / 字重**，不是大家以為的 5 MB。**不要**自己跑 fonttools 靜態子集 —— 那會靜默失敗。

**Latin-first family 排序**（瀏覽器逐字元 fallback：Latin 拿 Source Serif，漢字拿思源）：

```
--font-display: "Source Serif 4", "Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif;
--font-body:    "Source Serif 4", "Noto Sans TC",  "PingFang TC", "Microsoft JhengHei", sans-serif;
--font-mono:    "IBM Plex Mono", ui-monospace, "Noto Sans TC", monospace;
```

**CJK 排版力學（目前網站一項都沒做）：**

| 規則 | 值 |
|---|---|
| display 漢字 line-height | **0.95 – 1.05**（漢字填滿 em box，96px 中文標題用 1.5 會看起來壞掉） |
| body 漢字 line-height | **1.8** |
| Latin body line-height | 1.55 |
| `letter-spacing` on `:lang(zh-Hant)` | **`0`，永遠**。加正字距會毀掉漢字 |
| 斷行 | `word-break: normal; overflow-wrap: anywhere; line-break: strict;` |
| 中西混排間距 | `text-autospace: normal;`（2025-11 起 Baseline）—— 這份文案每一行都在混「中央大學資管系」與「DevOps」「LLM」 |
| 強調 | `text-emphasis: dot;`（旁點），不是粗體不是斜體 |
| 行長 | Latin 62–72ch / 漢字 **30–36 字** |
| 最小字級 | **14px**。現有 5 處 `text-[10px]` 全部移除 |

### 3.3 尺度

**流體字級**（base 17px，因為 CJK 需要更大的最小可讀尺寸）

| Token | clamp() | 320px → 1440px |
|---|---|---|
| `--step--1` | `clamp(0.875rem, 0.845rem + 0.15vw, 0.9375rem)` | 14 → 15px |
| `--step-0` | `clamp(1.0625rem, 1.025rem + 0.19vw, 1.1875rem)` | 17 → 19px |
| `--step-1` | `clamp(1.25rem, 1.18rem + 0.36vw, 1.5rem)` | 20 → 24px |
| `--step-2` | `clamp(1.5rem, 1.36rem + 0.71vw, 2rem)` | 24 → 32px |
| `--step-3` | `clamp(1.875rem, 1.61rem + 1.34vw, 2.75rem)` | 30 → 44px |
| `--step-4` | `clamp(2.25rem, 1.71rem + 2.68vw, 4rem)` | 36 → 64px |
| `--step-5` | `clamp(2.75rem, 1.53rem + 6.07vw, 6.5rem)` | 44 → 104px |

**間距**（4px base，唯一一組，取代所有 per-component 的 `p-4 md:p-5 lg:p-3 xl:p-4` 非單調階梯）

`--sp-1: 4px` · `--sp-2: 8px` · `--sp-3: 12px` · `--sp-4: 16px` · `--sp-5: 24px` · `--sp-6: 32px` · `--sp-7: 48px` · `--sp-8: 64px` · `--sp-9: 96px` · `--sp-10: 128px`
`--sp-section: clamp(4rem, 2rem + 10vw, 9rem)`

**圓角**：從 29 種收斂到 **3 種**。`--r-0: 0` · `--r-1: 2px`（chip、tag） · `--r-2: 6px`（panel、modal）。**figure 由規線界定，不是圓角框** —— 這在結構上讓「卡中卡」變成無法表達的東西。

**陰影**：從 ~40 種收斂到 **2 種**。
`--elev-0: 0 1px 0 0 var(--rule)`（髮絲分隔）
`--elev-1: 0 2px 14px -6px color-mix(in oklab, var(--ink) 22%, transparent)`（只給 modal / teleport overlay）

**緩動與時長**

| Token | cubic-bezier | GSAP 對應 | 用途 |
|---|---|---|---|
| `--ease-entrance` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | `power3.out` | 所有入場 |
| `--ease-emphasis` | `cubic-bezier(0.19, 1, 0.22, 1)` | `expo.out` | 標題行遮罩揭露 |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | `power2.inOut` | 狀態切換、路由 morph |
| `--ease-scrub` | `linear` | `none` | **所有 scrub 動畫強制用它** |
| `--dur-1` | `160ms` | 0.16 | hover / focus 狀態 |
| `--dur-2` | `320ms` | 0.32 | 元素狀態變更 |
| `--dur-3` | `600ms` | 0.6 | **GSAP 全域預設** |
| `--dur-4` | `900ms` | 0.9 | 報頭行揭露 |

**禁用**：`back` / `elastic` / `bounce` 全部禁止（impeccable 明文禁止，且對這個網站的語氣是錯的）。唯一允許的非標準緩動是 L2 攝影機下潛的一條 `CustomEase`。

### 3.4 可貼上的程式碼

**`assets/css/tokens.css`**

```css
:root {
  /* ---- surface / ink (light is the base definition) ---- */
  --paper:        #F4F1EA;
  --paper-sunk:   #EBE6DB;
  --ink:          #141A16;
  --ink-2:        #4A544C;
  --zhu:          #A8321C;   /* text-safe accent, 5.9:1 */
  --zhu-mark:     #C8452B;   /* NON-TEXT only, 4.1:1 */
  --rule:         #C9C2B3;
  --rule-strong:  #8A8071;   /* UI boundary / focus ring, 3.4:1 */

  /* ---- type ---- */
  --font-display: "Source Serif 4", "Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif;
  --font-body:    "Source Serif 4", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  --font-mono:    "IBM Plex Mono", ui-monospace, "Noto Sans TC", monospace;

  --step--1: clamp(0.875rem, 0.845rem + 0.15vw, 0.9375rem);
  --step-0:  clamp(1.0625rem, 1.025rem + 0.19vw, 1.1875rem);
  --step-1:  clamp(1.25rem, 1.18rem + 0.36vw, 1.5rem);
  --step-2:  clamp(1.5rem, 1.36rem + 0.71vw, 2rem);
  --step-3:  clamp(1.875rem, 1.61rem + 1.34vw, 2.75rem);
  --step-4:  clamp(2.25rem, 1.71rem + 2.68vw, 4rem);
  --step-5:  clamp(2.75rem, 1.53rem + 6.07vw, 6.5rem);

  --lh-display-han: 1.0;
  --lh-body-han:    1.8;
  --lh-body-latin:  1.55;
  --measure-latin:  68ch;
  --measure-han:    33em;

  /* ---- space / shape ---- */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px; --sp-5: 24px;
  --sp-6: 32px; --sp-7: 48px; --sp-8: 64px; --sp-9: 96px; --sp-10: 128px;
  --sp-section: clamp(4rem, 2rem + 10vw, 9rem);
  --r-0: 0px; --r-1: 2px; --r-2: 6px;
  --elev-0: 0 1px 0 0 var(--rule);
  --elev-1: 0 2px 14px -6px color-mix(in oklab, var(--ink) 22%, transparent);

  /* ---- motion ---- */
  --ease-entrance: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-emphasis: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);
  --ease-scrub:    linear;
  --dur-1: 160ms; --dur-2: 320ms; --dur-3: 600ms; --dur-4: 900ms;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #151713; --paper-sunk: #1C1F1A;
    --ink: #E8E4D8;   --ink-2: #9EA79A;
    --zhu: #E2705A;   --zhu-mark: #F08C74;
    --rule: #2E332C;  --rule-strong: #6E766C;
  }
}
:root[data-theme="dark"] {
  --paper: #151713; --paper-sunk: #1C1F1A;
  --ink: #E8E4D8;   --ink-2: #9EA79A;
  --zhu: #E2705A;   --zhu-mark: #F08C74;
  --rule: #2E332C;  --rule-strong: #6E766C;
}

/* body MUST paint an explicit token background */
html { background: var(--paper); }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: var(--lh-body-latin);
  text-autospace: normal;
}
:lang(zh-Hant), :lang(zh-TW) {
  letter-spacing: 0;
  line-height: var(--lh-body-han);
  word-break: normal;
  overflow-wrap: anywhere;
  line-break: strict;
}
h1, h2, h3, .display {
  font-family: var(--font-display);
  line-height: var(--lh-display-han);
  letter-spacing: -0.01em;
}
h1:lang(zh-Hant), h2:lang(zh-Hant), .display:lang(zh-Hant) { letter-spacing: 0; }
.mono, code, .metric, .tag { font-family: var(--font-mono); }
em, .emph { font-style: normal; text-emphasis: dot; text-emphasis-color: var(--zhu-mark); }
:focus-visible { outline: 2px solid var(--rule-strong); outline-offset: 3px; }

/* graceful fallback only when GSAP is skipped */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: smooth; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**`tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./content/**/*.{md,json,yml}",
    "./app.vue",
  ],
  theme: {
    // NOTE: 不用 extend —— 直接覆寫，讓 bg-gray-800 / rounded-3xl 這類舊 class 直接消失，
    // 舊的 arbitrary value 才不會偷偷存活下來。
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper:      "var(--paper)",
      "paper-sunk": "var(--paper-sunk)",
      ink:        "var(--ink)",
      "ink-2":    "var(--ink-2)",
      zhu:        "var(--zhu)",
      "zhu-mark": "var(--zhu-mark)",
      rule:       "var(--rule)",
      "rule-strong": "var(--rule-strong)",
    },
    fontFamily: {
      display: "var(--font-display)",
      body:    "var(--font-body)",
      mono:    "var(--font-mono)",
    },
    fontSize: {
      "2xs": ["var(--step--1)", { lineHeight: "1.5" }],
      base:  ["var(--step-0)",  { lineHeight: "var(--lh-body-latin)" }],
      lg:    ["var(--step-1)",  { lineHeight: "1.4" }],
      xl:    ["var(--step-2)",  { lineHeight: "1.25" }],
      "2xl": ["var(--step-3)",  { lineHeight: "1.1" }],
      "3xl": ["var(--step-4)",  { lineHeight: "1.02" }],
      "4xl": ["var(--step-5)",  { lineHeight: "0.98" }],
    },
    spacing: {
      0: "0", 1: "var(--sp-1)", 2: "var(--sp-2)", 3: "var(--sp-3)",
      4: "var(--sp-4)", 5: "var(--sp-5)", 6: "var(--sp-6)", 7: "var(--sp-7)",
      8: "var(--sp-8)", 9: "var(--sp-9)", 10: "var(--sp-10)",
      section: "var(--sp-section)",
    },
    borderRadius: { none: "var(--r-0)", sm: "var(--r-1)", md: "var(--r-2)" },
    boxShadow: { rule: "var(--elev-0)", raised: "var(--elev-1)", none: "none" },
    transitionTimingFunction: {
      entrance: "var(--ease-entrance)",
      emphasis: "var(--ease-emphasis)",
      inout:    "var(--ease-inout)",
    },
    transitionDuration: { 1: "var(--dur-1)", 2: "var(--dur-2)", 3: "var(--dur-3)", 4: "var(--dur-4)" },
    extend: {
      maxWidth: { measure: "var(--measure-latin)", "measure-han": "var(--measure-han)" },
    },
  },
  plugins: [],
};
```

> 覆寫（而非 `extend`）是刻意的：舊的 `bg-[#1a1a1a]`、`rounded-[24px]`、`text-yellow-400` 會在 build 時直接失效或報錯，逼出所有殘留。**先做這一步，104 個 `!important` 才有辦法一次掃乾淨** —— 否則新的排版尺度會全部輸給它們。

---

## 4. 捲動骨架（Scroll Spine）

首頁 `/` 是單一文件捲動（Phase 0 已把 `#mainContent` 內層 scroller 攤平成 document scroll）。

### 全域規則

```js
// composables/useScrollScene.ts 的四個 matchMedia 分支
const mm = gsap.matchMedia();
mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => { /* 完整 pin + scrub */ });
mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => { /* 只有 batch reveal，零 pin */ });
mm.add("(prefers-reduced-motion: reduce)", () => { /* 提早 return，plugin chunk 永不 fetch */ });
mm.add("(hover: hover) and (pointer: fine)", () => { /* cursor 層 */ });
```

- **手機（<1024px）一個 pin 都沒有。** pin 跟收合的網址列打架，而且會被迫開 `normalizeScroll`（接管觸控捲動）。手機拿到原生捲動 + CSS `view()` reveal，這也是最便宜的 bundle。
- `scrub` 與 `toggleActions` 永不同時出現在同一個 trigger 上。
- ScrollTrigger 只掛在 timeline 或頂層 tween，**永不掛在 timeline 的子 tween 上**。
- 被 pin 的元素本身永不動畫，只動它的子元素。

### 段落表

| # | 段落 | 捲動範圍 | 讀者得到的資訊 | GSAP 技術（明確 API） | reduced-motion / 手機 |
|---|---|---|---|---|---|
| **01** | 報頭 Masthead | 0–7%，無 pin | **黃鉅燊** 在前、`Ju-Shen Huang` 在後（現況 `ProfileCard.vue:22` 只顯示英文名，對主要受眾是反的）。一行 mono dateline：`斐闊 Finctory 技術長 · 2024.04 – 現在（本頁資料截至 2026.08）`、`國立中央大學資訊管理學系 · 2026.06 畢業`。一句 thesis。**無 emoji、無輪播職稱、無 badge** | `SplitText.create('.masthead-zh', { type:'lines,words', mask:'lines', autoSplit:true, prepareText: t => t.split('').join(String.fromCharCode(8205)), wordDelimiter: String.fromCharCode(8205), aria:'auto', onSplit(self){ return gsap.from(self.lines, {yPercent:100, duration:0.9, stagger:0.06, ease:'expo.out'}) } })`。**onLoad 觸發，非 scroll**。`prepareText` + ZWJ 是繁中不可省略的設定，否則整段被當成一個「word」 | reduce 分支在 `import('gsap/SplitText')` **之前**就 return，chunk 從不下載。文字直接在最終狀態 |
| **02** | 目前狀態 Now | 7–14%，無 pin | **從 HEXAGONAL L6（97%）提前到這裡。** 現在在做什麼、Finctory 正在出貨什麼、開放什麼（合作 / 顧問 / 職缺），三個明確 CTA：CV PDF（**顯示最後更新日**）、GitHub、Email。捲動頁面底部的聯絡資訊等於不存在的聯絡資訊 | 無。`ScrollTrigger.batch` 一次 reveal | 靜態 |
| **03** | 導言 Thesis | 14–24%，無 pin | 四段繁中散文：作為小型新創 CTO 實際在做什麼、**會拒絕做什麼**、一個同齡工程師多半不同意的信念。取代 `AboutSection.vue:22` 的「程式碼是我的畫筆…」與 emoji bio。行長上限 33 漢字 | `ScrollTrigger.batch('[data-reveal]', { onEnter: els => gsap.to(els, {opacity:1, y:0, stagger:0.08, duration:0.6, ease:'power3.out', overwrite:true, onComplete(){ gsap.set(els,{clearProps:'willChange'}) }}), start:'top 85%', interval:0.1, batchMax:4 })`。**一次揭露，之後不再動** —— 不做逐行 opacity scrub | 靜態 |
| **04** | 年表 Ledger | 24–40%，**pin 160vh（≥1024px）** | 一條 2022→2026 的墨線，朱色播放頭走過去，一次換一則。**修復內容過期的主場**：Finctory 缺席的 18 個月、114 學年度、畢業寫成已完成事實、13 個獎項各自錨在真實日期上（不再是無日期卡片牆）。每則帶 mono 上標連到證據（news 來源、repo、國科會紀錄） | `gsap.timeline({ scrollTrigger:{ trigger, start:'top top', end:'+=160%', pin:true, scrub:1 } })`，**每年一個 label**（`'y2022'…'y2026'`）。線用 `DrawSVGPlugin` 的 `drawSVG: '0% 100%'`，條目 `.to(next,{opacity:1},'<')`。`onUpdate: self => currentLabel.value = tl.currentLabel()` 驅動導覽的段落標記，取代 `StickyNav.vue:71` 桌機永遠讀 0 的 `window.scrollY` 數學。**不做 snap** | **無 pin、無 scrub**。同一份 markup 渲染成垂直 `<ol>`，墨線變成靜態 left border。全部在 matchMedia 分支內，查詢不成立時自動 revert |
| **05** | 能力斷面 Depth Cut | 40–52%，無 pin（高 figure ~90vh） | **一張圖取代三套互相矛盾的技能系統。** X 軸＝領域，Y 軸＝**證據層級**而非自評：`生產環境出貨 / 競賽出貨 / 研究原型 / 讀過`。每個點**必須**帶一個證明它的 URL —— 這條規則機械式地消滅 Qt-86%-零專案與 MongoDB-無佐證的問題。規則本身以可見文案印在旁邊：**「每一項技術都連到一個實際交付物」**。下方同墨同字級一塊 **「沒有的東西」**（上限 3 條，寫成有日期的 roadmap） | 軸線 `DrawSVGPlugin` + `scrub: 0.8`。點用 `ScrollTrigger.batch('[data-dot]', { onEnter: els => gsap.to(els,{opacity:1, scale:1, stagger:0.04, overwrite:true}), start:'top 85%', batchMax:6 })`。計數器 `gsap.to(obj,{val:13, snap:{val:1}, onUpdate})`。`will-change` 由 tween 設、`onComplete` 清掉，**永不留在 CSS 裡** | 最終狀態直接渲染，batch 不建立。圖是 inline SVG 帶 `<title>`/`<desc>`，旁邊放一份真的 `<table>` —— 可爬可讀屏 |
| **06** | 分層架構 Stack Planes｜**唯一的 3D 幕** | 52–68%，**pin 300vh（≥1024px）** | 五個等距平面，攝影機往下穿：`Client (Vue 3 / Nuxt / Tailwind)` → `Edge & API (FastAPI / Node / Nginx)` → `Agents (LangChain / LangGraph)` → `Data (PostgreSQL / Redis / FAISS)` → `Infra (Docker / K8s / GitHub Actions / GCP·AWS)`。每一層穿過焦平面時轉為不透明，並印出**哪些專案住在這一層**，以及該層的**一個決策 + 它的代價 + 日期**（沿用被砍掉的 prism 的四行內容模型）。讀者離開時知道他真的擁有整條垂直 —— 這才是「六邊形戰士」背後的實際主張 | **純 CSS 3D + GSAP，0 額外 bytes**。容器 `perspective: 70vw; transform-style: preserve-3d; backface-visibility: hidden`。一條 scrub tween 推整疊的 `translateZ`（`scrub: 2, ease: 'none'`），每層 `opacity` / `filter: blur()` 依焦距 keyed。攝影機用一條 `CustomEase`（先加速後安定），**絕不用 back/elastic**。cursor inspector 讀數只掛在這裡：一組 `gsap.quickTo(el,'x',{duration:0.4,ease:'power3'})` 重複使用（不是每次 mousemove 配一個 tween），顯示 `layer/agents · langgraph · 2 專案` | 五層攤成由上而下的平面層次圖，同資訊、無透視、無 Z 位移。**`preserve-3d` 在該分支完全移除**，中階手機不建立合成層。這也就是 <1024px 的版面 —— 手機根本不付 3D 的錢。方向鍵可逐層切換（鍵盤平權） |
| **07** | 交付紀錄 Work | 68–84%，垂直，無 pin | **3 篇升格 + 5 條降格**（不是 8 張等權重卡片牆）。升格：`發票醫生`、`PhishForge`、`Finctory`。每張結構 `問題 / 架構決策 / 取捨 / 結果`，chip 沿用 06 的層級 token，讀者能看出每個專案實例化了哪一層。降格 5 條是密集 mono 清單：名稱、一行、stack、年份、repo。**無縮圖牆、無 filter chip、無點開只是空的私有 modal** | `ScrollTrigger.batch`，`stagger: 0.05`、`batchMax: 4`、`start: 'top 88%'`。點進案例是一般路由導覽（**不做 Flip shared-element morph** —— 見 §2.4） | 靜態。清單就該表現得像清單 |
| **08** | 部署紀錄 Changelog | 84–95%，無 pin，**零 JS** | 獎項、研究、領導、學歷以**逆時序 deploy log** 呈現，左側 diff 風格溝槽，每筆**強制有日期**。這既是設計也是維護功能：git-log 版面會讓 18 個月的空白在視覺上無所遁形 | 原生 CSS scroll-driven animation：`animation-timeline: view(); animation-range: entry 0% cover 30%; animation-timing-function: linear;`，包在 `@supports (animation-timeline: view())` 內。閱讀進度髮絲線用 `animation-timeline: scroll()`。跑在合成器上，中階手機零成本 | `@supports` 區塊外再包 `@media (prefers-reduced-motion: no-preference)`。~16% 不支援的瀏覽器拿到靜態版面，不是壞掉的版面 |
| **09** | 奧付 Colophon | 95–100% | 一行技術說明（Nuxt 3 static generate → GitHub Pages、GSAP + ScrollTrigger + SplitText、自架思源）、**零分析、零 cookie**、最後更新日、聯絡方式、決策日誌連結。**不放 JS gz / LCP / CLS 數字** | 無 | 靜態 |

---

## 5. 技術架構

### 5.1 套件

```bash
# 新增
npm i gsap@3.15.0
npm i -D @nuxt/content   # TODO: 安裝前確認最新 2.x 版本號；用於 prose 路由與 /news 的 build-time 渲染

# 移除
npm rm typeit            # SplitText line-mask 取代它（AboutSection.vue:29 唯一使用處）
```

**GSAP 授權（2026 年狀態，已核實）**：GSAP 3.15.0 對商業用途 **100% 免費**，包含所有前 Club 外掛（ScrollTrigger、ScrollSmoother、SplitText、DrawSVG、MorphSVG、MotionPath、Flip、Observer、CustomEase…）。**不需要 `.npmrc`、不需要 GreenSock token、不需要私有 registry**。Standard License 唯一限制是不得用 GSAP 打造與 Webflow 競爭的 no-code 動畫產生器；AI 產生的 GSAP 程式碼明確不在禁止之列。

**不裝的東西與理由**：

| 套件 | 大小 | 為什麼不裝 |
|---|---|---|
| `three` | 182.4 kB gz | 是整個動畫 stack 的 3.4 倍；官方自承 tree-shake 效果差；`public/models/` 是空的 |
| `@tresjs/nuxt` | + three（peer dep） | 省不掉 three 的成本，它買的是 DX 不是體積 |
| `ogl` | ~8–12 kB gz | 見 §2.4：只放一次、對大半受眾隱形、最可能掉幀 |
| `lenis` | 5.4 kB gz | Phase 0 攤平成 document scroll 之後不需要它；真要平滑捲動用 GSAP 內附的 ScrollSmoother（0 額外相依） |
| `@hypernym/nuxt-gsap` | — | 為一個 5 頁的 solo 網站買 auto-import，卻新增一個必須追著 GSAP 版本跑的相依；它自己的 issue tracker 有一樣的 route-change ScrollTrigger 問題，只是多隔一層抽象要 debug |

### 5.2 Nuxt 3 的 client-plugin / ClientOnly 模式

**`plugins/gsap.client.ts`**（`.client` 後綴是它不進 prerender/SSR pass 的原因）

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ duration: 0.6, ease: "power3.out" });
  gsap.ticker.lagSmoothing(0);

  // 字型是 CJK 切片，會在 first paint 之後才到位 → 觸發位置必須重算
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  // route change：讓 Nuxt 的 scroll restore 與 ScrollTrigger 不要打架
  nuxtApp.hook("page:finish", async () => {
    ScrollTrigger.clearScrollMemory();
    await nextTick();
    ScrollTrigger.refresh();
  });

  return { provide: { gsap } };
});
```

重量級 plugin **依路由動態載入**，永不進首頁 chunk：

```ts
// composables/useGsapPlugins.ts
export async function useSplitText() {
  const { SplitText } = await import("gsap/SplitText");
  gsap.registerPlugin(SplitText);
  return SplitText;
}
export async function useDrawSVG() {
  const { DrawSVGPlugin } = await import("gsap/DrawSVGPlugin");
  gsap.registerPlugin(DrawSVGPlugin);
  return DrawSVGPlugin;
}
```

**元件層生命週期 —— 唯一允許的寫法：**

```vue
<script setup>
const root = ref(null);
let ctx;
onMounted(() => {
  ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width:1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ scrollTrigger: { trigger: root.value, start: "top top", end: "+=300%", pin: true, scrub: 2, refreshPriority: 3 } })
         .to(".plane-stack", { z: 2400, ease: "none" });
    });
  }, root.value);          // scope element
});
onUnmounted(() => ctx?.revert());   // 連 ScrollTrigger 一起殺，並還原 inline style
</script>
```

**絕對不要** 在 `onUnmounted` 呼叫 `ScrollTrigger.getAll().forEach(t => t.kill())` —— 那會殺掉仍掛載中的元件（導覽、頁尾）的 trigger，這正是網路上「換頁後 ScrollTrigger 就死了」那批回報的成因。

**`ClientOnly` 使用時機（三者不可互換）：**

| 機制 | 語意 | 本專案用在哪 |
|---|---|---|
| `plugins/*.client.ts` | 每個 app 跑一次 | `registerPlugin`、全域 refresh hook |
| `Component.client.vue` | **完全不 SSR、不進 prerender HTML** | 本案沒有 —— 因為沒有 WebGL 了。若未來加 canvas，走這條 |
| `<ClientOnly>` | SSR 渲染 fallback slot 再置換 | 只用在需要 SEO 可見 fallback 的地方，且**必須**給 fallback |

**SEO 硬規則**：所有散文、專案名、職稱、決策文字、trace 步驟、JSON-LD 都**必須**在 prerender HTML 裡。動畫層可以是 client-only，內容層不行。

### 5.3 解決稽核發現的 PageTransition / router-plugin 衝突

現況三個問題疊在一起：

1. `PageTransition.vue:11-13` 的 `<transition mode="out-in">` 包靜態無 key 的 div，**hooks 從未執行**（所以現在是無害的死碼，但如果有人「修好」它加上 `:key="route.path"`，`:52-68` 那段休眠的 `applyEnterAnimationToChildren` 會突然活過來，直接對 `.animate-on-page-enter` 元素寫 `style.opacity/transform/transition`，跟任何 GSAP timeline 正面對撞）。
2. `router.client.js:27` 在 router 建構後重指派 `scrollBehavior`，對五個路由回傳 `false`（關閉捲動還原），並在 <1024px 用 10ms `setTimeout` 觸發 `window.scrollTo`。
3. `viewport-reset.client.js` 在每次 `page:start` 重寫 `documentElement`/`body` 的 overflow 與 height 並強制捲到 0 —— 在 ScrollTrigger 量測**之後**。

**處置：**

| 檔案 | 動作 |
|---|---|
| `plugins/viewport-reset.client.js` | **刪除。** 無條件、Phase 0 第一件事 |
| `components/animation/PageTransition.vue` | **刪除，不要修。** 需要換頁動畫就用 Nuxt 內建 `app.pageTransition`（只 fade，**不帶 transform** —— transform 會建立 containing block，pin 在那 0.3s 內會脫離） |
| `plugins/router.client.js` | **改寫成單一 `app.config.ts` 的 `router.options.scrollBehavior`**：hash → `{ el: to.hash, top: 80 }`；其他 → `{ left: 0, top: 0 }`。刪掉空的 resize listener 與所有 `setTimeout` |
| `plugins/animations.client.js` | **刪除**（被 `ScrollTrigger.batch` 取代）。它同時是 `process.client` 這個 Nuxt 3.x 已棄用寫法的最後殘留（正確是 `import.meta.client`），而且它整段本來就在 `.client.js` 裡，那個 guard 完全多餘 |
| `layouts/default.vue:4,34` | 移除 `lg:h-screen lg:overflow-hidden` 與 `overflow-y-auto`，回歸 document scroll。同時移除 `smooth-scroll` class |
| `layouts/default.vue:160-162` + `assets/css/tailwind.css:42-45` | 兩處 `scroll-behavior: smooth` 都刪。只在 `@media (prefers-reduced-motion: reduce)` 下保留 |
| `layouts/default.vue:24` | 移除 `backdrop-blur-sm`（它蓋在不透明的 `bg-[#242424]` 上，什麼都沒糊到，純 GPU 成本）與 `overflow-hidden`。同樣處理 `TechDashboard.vue:31`、`HexagonSkillNetwork.vue:386`、`AboutSection.vue:17`、`ProfileCard.vue:4`、`news.vue:7`、`resume.vue:205`、`StickyNav.vue:5` |
| `app.vue:124-186` + `AnimateOnView.vue` | **同一個 commit 一起刪。** 只刪元件會留下 `app.vue` 裡那組全域、非 scoped、會把任何拿到 `.animate-on-view` 卻沒拿到 `.animated` 的元素永久隱形的規則 |

### 5.4 3D 層選擇與 bundle 預算

**選擇：CSS 3D transforms + GSAP scrub。** 理由：

1. **0 額外 bytes** —— `perspective` / `preserve-3d` / `translateZ` 是瀏覽器原生。
2. **它是圖解不是裝飾** —— Z 軸就是抽象層級軸，攝影機下潛跟展開一張分層架構圖是同一個手勢。
3. **fallback 是一個 CSS class** —— 內容本來就是 DOM 文字，3D 只是套在它上面的 transform，退化不損失任何資訊。
4. Codrops 2025-11 的 3D 捲動文字教學已經把這套技術寫成可直接抄的食譜。

**實測 gzip 大小（`curl … | gzip -9 | wc -c`，gsap@3.15.0）：**

| 模組 | gz | 載入時機 |
|---|---|---|
| gsap core | 28.3 kB | 首頁 |
| ScrollTrigger | 18.0 kB | 首頁 |
| SplitText | 3.6 kB | 首頁（動態 import，報頭用完即可） |
| DrawSVGPlugin | TODO：未量測（預算上限 3 kB） | 動態 import，只在 04 / 05 段 |
| CustomEase | TODO：未量測（預算上限 2 kB） | 動態 import，只在 06 段 |
| Observer | 4.3 kB | **不使用** |
| Flip | 9.7 kB | **不使用** |
| ScrollSmoother | 5.5 kB | 選配，Phase 5 再評估 |
| **首頁動畫層合計** | **≤ 55 kB gz** | |

**淨值是負的**：移除 Font Awesome CDN（~70 kB CSS + ~30 kB woff2）與 typeit，再自架字型省下兩次 DNS + TLS handshake。**加了整層動畫，Lighthouse 應該往上走。**（但這是 Phase 0 用 before/after 數字證明的事，不是假設 —— 見 §7。）

### 5.5 Code splitting 策略

| Chunk | 內容 | 路由 |
|---|---|---|
| entry | gsap core + ScrollTrigger + tokens CSS | 全站 |
| `masthead` | SplitText | `/`（動態 import，僅一次） |
| `ledger` | DrawSVGPlugin | `/`（04、05 段共用） |
| `planes` | CustomEase + `useCursorInspector` | `/`（06 段，`(hover:hover)` 分支內才 import） |
| `work-*` | 各案例研究的 markdown（@nuxt/content 自動切） | `/work/*` |
| 字型 | 每個 unicode-range 一個 woff2 檔，`font-display: swap` | 瀏覽器按需 |

### 5.6 效能預算（硬數字）

跑 Lighthouse mobile，模擬 Moto G Power class、4G，**首頁 `/` 與 `/work/invoice-doctor` 兩條路由都要過**：

| 指標 | 上限 | 現況 |
|---|---|---|
| LCP | **≤ 2.0s** | TODO：Phase 0 前量測基準 |
| CLS | **≤ 0.05** | 目前有 7 張無 intrinsic size 的 `<img>` |
| INP | **≤ 200ms** | — |
| 首頁 JS 總量（gz） | **≤ 120 kB** | — |
| 單張圖片最大 | **≤ 200 kB** | 現在最大 6.9 MB |
| 首頁總傳輸量 | **≤ 600 kB** | 現在 TODO 量測（`public/images` 19 MB） |
| Lighthouse Performance (mobile) | **≥ 90** | — |
| Lighthouse Accessibility | **≥ 95** | 目前有 `user-scalable=no`（自動扣分） |

CI 檢查（GitHub Actions，跟現有 Pages 部署同一個 workflow）：

```yaml
- name: Lighthouse budget
  run: npx lighthouse-ci autorun --collect.staticDistDir=.output/public
  # TODO: 加 lighthouserc.json，assert LCP/CLS/資源大小如上表
```

---

## 6. 內容計畫

> 這是交付物的一半。網站現在缺的不是動畫，是**近況**與**判斷力的證據**。

### 6.1 段落清單（依價值排序）

| # | 段落 | 狀態 | 說明 |
|---|---|---|---|
| 1 | **報頭 dateline** | 🆕 NEW | 中文名在前、`本頁資料截至 YYYY.MM`、畢業寫成已完成事實。修掉「還是大學生」這個致命誤導 |
| 2 | **目前狀態 Now**（含三個 CTA） | 🆕 NEW | 有日期的現況區塊，提到前三分之一 |
| 3 | **三篇案例研究**（發票醫生 / PhishForge / Finctory） | 🆕 NEW（素材已存在） | `/work/*` 獨立路由，`問題 → 架構決策 → 取捨 → 結果` |
| 4 | **能力斷面 + 「沒有的東西」** | 🆕 NEW，取代三套矛盾系統 | 證據層級軸 + 每點必須連到交付物 + 上限 3 條有日期的缺口 |
| 5 | **年表 / 部署紀錄** | ♻️ 重構自 `resume.vue:430-590` | 13 獎 + 3 研究 + 4 領導 + 學歷，逆時序、強制日期、每筆帶證據連結 |
| 6 | **分層架構 06 段的六個決策 + 代價 + 日期** | 🆕 NEW | 這是「六邊形戰士」第一次有內容而不只是口號 |
| 7 | **導言 Thesis**（~500 字繁中散文） | 🆕 NEW，取代 `AboutSection` bio | 見 §6.4 |
| 8 | **決策日誌 `/log`** | 🆕 NEW | 5–8 則「我們選 X 不選 Y，因為 Z，代價是 W」。**唯一一個他每個月都能加、且不用打開任何 GSAP 檔案的段落 —— 這是整份計畫最強的防腐機制** |
| 9 | 也做過（5 條 mono 清單） | ♻️ 降格自 `portfolio.vue` 8 張卡 | Catalyst、Ched.AI、BrainLib、Cow of Answer、新生知訊網 ChatBot |
| 10 | 部署紀錄 / news | ♻️ 從 client fetch 改 build-time | 順手修掉 `news.vue:88` 的 SEO 洞 |
| 11 | 奧付 Colophon | 🆕 NEW | 一行技術、零分析零 cookie、最後更新日、聯絡 |
| ✂️ | `FrameworkExperienceChart.vue` 的 51 個自評百分比與「N年」整數 | **CUT** | 凍結於 2025-03，現在全部低估約 1.5 年且會永遠漂移；Qt 是最高分卻零專案；MongoDB 零佐證；AWS/Azure/Firebase/K8s 在專案裡用了卻不在雲服務分類裡 |
| ✂️ | emoji bio、輪播職稱、`六邊形戰士💪` badge、`Web Developer` badge | **CUT** | |
| ✂️ | 8 色 index 輪替 tag、filter chip、8 張等權重卡片、私有專案的空 modal | **CUT** | |
| ✂️ | `PageLoader`（首訪者專屬的等待畫面 —— 也就是你只有 60 秒的那個招募方） | **CUT** | |

### 6.2 案例研究模板

```
# <專案名稱>
mono 副標：<角色> · <期間 YYYY.MM – YYYY.MM> · <團隊規模> · <狀態：生產中 / 已結案 / 原型>

## 問題
2–4 句。誰有這個問題、多痛、既有做法為什麼不夠。**不寫技術。**

## 架構決策（3–5 個）
每個決策一個小節，格式固定：
  決策：<一句>
  為什麼不是 <被否決的選項>：<真實理由>
  代價：<你實際付出的東西>
  日期：<YYYY.MM>

## 系統圖
一張 inline SVG（帶 <title>/<desc>）+ 旁邊一份同資料的 <ol>。
發票醫生額外附「一次請求的旅程」逐 hop trace。

## 結果
可驗證的數字。沒有數字就寫「TODO」，**不要寫形容詞代替**。
外部驗證（獎項、國科會、pilot、發表）連結放這裡。

## 如果重來
2–3 句。做錯了什麼、下次怎麼做。這一段是判斷力最直接的證據。

## Stack
mono 清單，每一項連到它在能力斷面上的節點。
```

### 6.3 已寫好的範例：發票醫生

> 以下可直接放進 `content/work/invoice-doctor.md`。`TODO:` 標記的地方只有本人知道答案。

```markdown
---
slug: invoice-doctor
title: 發票醫生
titleEn: Invoice Doctor
role: 技術長 / 系統架構與後端
org: 斐闊 Finctory
period: { start: "TODO: YYYY-MM", end: "TODO: YYYY-MM 或 present" }
team: "TODO: N 人（前端 N / 後端 N / 設計 N）"
status: "TODO: 生產中 / 已結案 / 原型"
tier: promoted
stack: [Nuxt.js, Tailwind CSS, FastAPI, LangChain, LangGraph, PostgreSQL, OpenAI API, Docker, Heroku]
evidence:
  - { label: "第七屆社會企業創業提案競賽 優選", org: "台灣永續典範永續發展協會", date: "2025-02" }
  - { label: "臺北市智慧城市青年舉政徵件提案競賽 佳作", org: "臺北市政府青年局", date: "2024-12" }
  - { label: "臺灣數創大賞 數位+組 金獎", org: "經濟部產業園區管理局 等", date: "2024-11" }
  - { label: "桃園新創之星 X 創天下競賽 入圍決賽（前 10）", org: "中原大學 / 桃園市青年局", date: "2024-09" }
  - { label: "第六屆 Startup 創業競技場競賽 第一名", org: "國立臺灣師範大學 / 教育部", date: "2024-06" }
  - { label: "桃園青創力學生創業競賽 佳作", org: "龍華科技大學 / 桃園市青年局", date: "2024-06" }
demo: "TODO: 公開 URL，或明寫「未公開」"
---

## 問題

台灣的社會新鮮人每個月都在收電子發票，但那份消費紀錄躺在載具裡，
沒有人會主動去讀它。市面上的記帳 App 要求使用者手動輸入 ——
而「需要紀律才能運作的工具」對最需要它的族群剛好無效。

我們的假設是：**理財建議應該從已經存在的資料主動走出來找人，
而不是等人走進來找它。** 電子發票是台灣獨有的、已經數位化的、
完整的個人消費資料流，卻幾乎沒有被當成理財輸入來源使用。

TODO: 這裡需要一句你們驗證過的使用者事實。
      例如「訪談 N 位 22–28 歲上班族，其中 M 位曾下載記帳 App 但使用不到兩週」。
      如果沒做過訪談，就直說「這是我們的假設，尚未做過正式使用者研究」——
      誠實比虛構的數字有價值得多。

## 架構決策

### 決策一：用 LangGraph 的狀態機，不是單一 prompt chain

**為什麼不是單一 prompt chain：** 一張發票要經過分類、比價、建議三種
性質完全不同的推理。用一條 chain 串起來時，任何一個 node 失敗都會
讓整條請求重跑，而且我們無法知道它在哪一步答錯 —— 除錯只能靠讀
完整的 prompt log。我們需要的是**可回溯的狀態**與 **per-node retry**。

**代價：** 冷啟動延遲明顯變高（TODO: 從 ~Xs 變成 ~Ys），
而且 graph 的定義本身變成一個需要維護的東西 ——
新增一個 agent 不再是加一段 prompt，是改一張圖。

**日期：** TODO: YYYY-MM

### 決策二：PostgreSQL 存原始發票欄位，不存 LLM 的結構化輸出

**為什麼不是直接存 LLM 輸出：** 因為模型會換。我們在專案期間換過
TODO: N 次模型/prompt，每次換完，已經寫進資料庫的分類結果就對不上
新版的分類標準了。把 LLM 產出當成 derived data、隨時可重算，
原始欄位才是 source of truth。

**代價：** 每次改分類邏輯都要重跑一次全表，而且需要一個
TODO: （有嗎？）的 backfill 機制。查詢時也多一層 join。

**日期：** TODO: YYYY-MM

### 決策三：部署在 Heroku，不是 AWS / GCP

**為什麼不是雲廠商：** TODO: 這裡寫真實理由。
      如果理由是「團隊只有我一個人碰 infra，而 Heroku 讓我把
      DevOps 時間壓到接近零，好把時間放在產品上」—— 就這樣寫。
      這是一個**好的 CTO 決策**，因為它是資源約束下的正確取捨，
      不需要包裝成技術優越性。

**代價：** TODO: 成本？擴展上限？冷啟動？供應商鎖定？
**日期：** TODO: YYYY-MM

### 決策四：TODO
TODO: 至少再寫一個。最好是一個「後來證明是錯的」決策 ——
      那是全篇最有說服力的一段。

## 系統圖：一次請求的旅程

| # | Hop | 做什麼 | 這一步的取捨 |
|---|---|---|---|
| 1 | 使用者上傳 / 載具同步 | 取得電子發票原始資料 | TODO: 是使用者手動上傳，還是串接財政部載具 API？兩者的取捨完全不同 |
| 2 | OCR 與欄位解析 | 抽出品項、金額、店家、時間 | TODO: 用哪個 OCR？錯誤率大概多少？錯了怎麼辦 |
| 3 | LangGraph 路由 | 依發票類型決定送往哪些 agent | 換到可回溯狀態與 per-node retry，代價是冷啟動延遲 |
| 4a | 分類 agent | 把品項歸到消費類別 | TODO: 分類體系是自訂的還是沿用既有標準？為什麼 |
| 4b | 比價 agent | 找同品項的其他通路價格 | TODO: 價格資料哪裡來？更新頻率？沒資料時怎麼降級 |
| 4c | 建議 agent | 產生個人化理財建議 | TODO: 怎麼避免產生「少喝一杯手搖」這種無用建議 |
| 5 | PostgreSQL 寫入 | 原始欄位 + derived 分類分開存 | 見決策二 |
| 6 | 建議回傳前端 | Nuxt 頁面呈現 | TODO: 同步還是非同步？使用者等多久 |

## 結果

- 外部驗證：**六個獎項**（見上方 evidence），涵蓋創業提案、智慧城市、
  數創大賞金獎與 Startup 競賽第一名 —— 目前這是全站唯一被外部單位
  重複驗證過的產品。
- TODO: 使用者數 / 處理過的發票張數 / 留存率 / 任何一個真實數字。
        如果數字很小就寫小的：「N 位 pilot 使用者，累積處理 M 張發票」
        比沒有數字強一百倍，也比模糊的形容詞誠實。
- TODO: 團隊規模與出貨節奏。「N 人團隊，M 個月內 K 次發版」
        是 VC 會問的第一個問題。

## 如果重來

TODO: 兩到三句。候選方向：
  - 是不是太早就上 multi-agent？單一 prompt + 好的 eval 會不會更快驗證假設？
  - 有沒有在沒有 eval 的情況下調了三個月 prompt？
  - 比價 agent 是不是其實不需要 LLM？

## Stack

`Nuxt.js` · `Tailwind CSS` · `FastAPI` · `LangChain` · `LangGraph` ·
`PostgreSQL` · `OpenAI API` · `Docker` · `Heroku`
```

**注意這篇修掉的兩個結構性缺陷**：現況的網站**從來沒有說過**發票醫生是 13 個獎項中 6 個的產品（`resume.vue` 的獎項與 `portfolio.vue` 的專案是兩個互不引用的陣列）；也從來沒有說過 PhishForge 與研究二是同一個產物。這兩條交叉引用是零成本、高回報。

### 6.4 About 文案、輪播職稱、技術 tag 的改寫方向

**現況的三個問題（具體，非批評）：**

| 現況 | 位置 | 問題 |
|---|---|---|
| 「黃鉅燊，中央大學資管系 🎓 的全端開發者 💻，以「六邊形戰士」💪 自詡…」 | `AboutSection.vue:42-44` | 把自己定位成學生而非 CTO；emoji 在 zh-TW 專業語境是降級訊號；「自詡」是自我宣稱，讀者要的是證據 |
| 輪播職稱：`Web 全端開發者 / AI 應用專家 / SaaS 創業家 / 技術創新者 / 六邊形戰士` | `AboutSection.vue:30` | 五個標籤全是自封的，且互相稀釋。輪播本身在 2026 年是明確過時的 pattern；打字機效果在中文標題上是全站最舊的元素 |
| 「程式碼是我的畫筆，技術是我的顏料，網路世界是我的畫布」 | `AboutSection.vue:22` | 漂亮，但它對「這個人能不能做決策」零資訊量 |
| 7 個技術 tag：全端開發 / 資料科學 / 系統設計 / UI/UX / 人工智慧 / 生成式AI / 創新思維 | `AboutSection.vue:107` | 與 hexagon、與 chart 三套分類互相不一致；「創新思維」不是技術；`UI/UX` 在 hexagon 裡展開成五項（Figma / 使用者研究 / 互動設計 / 原型設計 / 視覺設計）而全站沒有任何一件設計產出可以佐證 |

**改寫規則：**

1. **職稱固定一個，帶日期。** `斐闊 Finctory 技術長 · 2024.04 – 現在`。不輪播、不打字機。打字機只在一個地方合法：它真的是 stdout（例如案例研究裡的 trace log）。
2. **每一個形容詞換成一件事。** 「AI 應用專家」→「兩個國科會大專生研究計畫都是 LLM 系統，其中一個做到 資安應用組第一名」。
3. **emoji 全清。** 語氣靠句子結構承擔，不靠符號。
4. **tag 從 7 個形容詞變成 6 個層級**（與 06 段的分層一致），每個層級只列**有交付物佐證**的技術，並在旁邊印出這條規則。

**範例改寫段落（可直接用，人名與事實都是現有的）：**

```
我是黃鉅燊，斐闊 Finctory 的技術長。工作內容大致是：決定我們不做什麼，
然後把剩下的做到能出貨。

技術上，我從 Nuxt 前端一路寫到 FastAPI、LangGraph 與 PostgreSQL，
再自己把它們裝進 Docker 送上去 —— 不是因為全端很酷，是因為
一個五人以下的團隊沒有第二個人可以接手。這個約束逼出了我大部分的
技術判斷：能不引入的相依就不引入，能用一台機器跑完的就不要拆成三個服務。

過去兩年我做的東西大多長成同一個形狀：把一份原本沒人讀的資料
（電子發票、學習軌跡、企業員工的點擊行為）變成一個會主動說話的系統。
發票醫生拿了六個獎，PhishForge 是國科會計畫也是資安應用組第一名，
知識圖譜那篇上了 LAK 2025。這些不是側寫，是同一個問題的三個版本。

我對 AI 的立場相對保守：先想清楚哪一步真的需要模型，其他步驟用
一般程式寫掉。多數我看過的 agent 系統，把 LLM 放在了不該放的地方。
```

（`如果重來` 與「沒有的東西」的語氣以此為準：**具體、有代價、不誇張。**）

### 6.5 內容來源遷移

**現況**：專案資料寫死在 `portfolio.vue:111-288`（8 個物件的陣列），履歷寫死在 `resume.vue:429` / `:541` / `:581`（三個陣列），研究寫死在 `ResearchSection.vue`，新聞在 `news.vue:104` 用 client fetch 抓。

**目標結構：**

```
content/
  site.yml                    # dateline、目前狀態、CTA、colophon
  timeline.yml                # 年表：獎項 + 研究 + 領導 + 學歷，統一 schema
  skills.yml                  # 能力斷面：節點 + 證據層級 + 證據 URL
  gaps.yml                    # 「沒有的東西」（最多 3 條）
  layers.yml                  # 06 段的五層 + 每層的決策/代價/日期
  work/
    invoice-doctor.md         # 升格案例（front-matter + prose）
    phishforge.md
    finctory.md
  also-built.yml              # 降格的 5 條
  log/
    2026-08-agent-eval.md     # 決策日誌，每則一個檔
  news/
    2025-02-15-tsmc-hackathon.md
```

**讀取方式（兩條路，各有適用場景）：**

| 資料 | 機制 | 理由 |
|---|---|---|
| 結構化 YAML（timeline / skills / layers / gaps / also-built / site） | Vite 的 `import.meta.glob('~/content/*.yml', { eager: true })` + `@rollup/plugin-yaml`，**build time** | 零 runtime 相依，SSR 安全，型別可自己補 |
| 散文（work / log / news） | `@nuxt/content` v2 | 需要 markdown 渲染 + `queryContent()`；順便一次修掉 `/news` 的 client fetch SEO 洞 |

**範例檔 `content/timeline.yml`：**

```yaml
# 唯一規則：每一筆都必須有 date。沒有日期的條目不會被渲染。
- date: 2026-06
  kind: education
  title: 國立中央大學 資訊管理學系 學士畢業
  detail: GPA 4.19 / 4.3
  evidence: null                     # TODO: 有無畢業證書/成績單可連

- date: 2025-02
  kind: award
  title: 第六屆台積電校園黑客松 — AI維運懶人包組 第一名
  org: 台積電
  project: null                      # TODO: 這個作品有名字嗎？有 repo 嗎？
  evidence: null                     # TODO: 得獎公告 URL

- date: 2025-02
  kind: award
  title: 第七屆社會企業創業提案競賽 — 後起之秀組 優選
  org: 社團法人台灣永續典範永續發展協會
  project: invoice-doctor            # ← 交叉引用，案例頁自動撈到它
  note: 訴求 SDGs 1.4 普惠金融、SDGs 3.4 心理健康
  evidence: null                     # TODO

- date: 2025-02
  kind: research
  title: 探討生成式 AI 於社交工程之發展應用
  org: 國立中央大學資訊管理學系
  advisor: 胡雅涵
  period: { start: 2024-07, end: 2025-02 }
  project: phishforge                # ← 研究二 = PhishForge，同一件事
  publication:
    venue: 113 國科會大專學生研究計畫
    status: null                     # TODO: 結案？獲研究創作獎？
    url: null                        # TODO

- date: 2024-10
  kind: research
  title: 運用知識圖譜與大型語言模型分析學習軌跡
  org: 國立中央大學通識教育中心
  advisor: 張家凱
  period: { start: 2024-08, end: 2024-10 }
  publication:
    venue: LAK 2025 國際學習分析與知識會議
    status: null                     # TODO: 接受？paper 還是 poster？共同作者？
    doi: null                        # TODO
    url: null                        # TODO
  note: 系統已於中央大學 Python 程式設計課程測試   # 現況匿名成「台灣某國立大學」，那是自己的學校，直接寫

# TODO: 2025-03 之後的 18 個月完全空白。至少要補：
#   - Finctory 這段期間出貨了什麼（哪怕只是「2025-XX 上線 vX 版」）
#   - 114 學年度的任何一件事
#   - 2025-06 之後的任何獎項、講座、開源貢獻、side project
```

**範例檔 `content/skills.yml`（能力斷面的資料合約）：**

```yaml
# 規則：evidence 為 null 的節點不會被渲染。這條規則寫在頁面上給讀者看。
tiers: [shipped-prod, shipped-competition, research-prototype, studied]

nodes:
  - name: LangGraph
    layer: agents
    tier: shipped-prod
    evidence: /work/invoice-doctor
  - name: FastAPI
    layer: edge-api
    tier: shipped-prod
    evidence: /work/phishforge
  - name: Nuxt.js
    layer: client
    tier: shipped-prod
    evidence: https://www.finctory.com/
  - name: PostgreSQL
    layer: data
    tier: shipped-prod
    evidence: /work/invoice-doctor
  - name: Docker
    layer: infra
    tier: shipped-prod
    evidence: /work/phishforge
  - name: Flutter
    layer: client
    tier: research-prototype
    evidence: null            # TODO: 研究三用了 Flutter，有 repo 或 demo 嗎？沒有就砍掉
  # 以下在現況的 chart / hexagon 裡有，但找不到任何交付物 —— 依規則直接不渲染：
  # Qt (86%/3年)、MongoDB、GraphQL、Sequelize、Seaborn、Canva
```

**同時處理的三件事**：把所有 `'./images/…'` 改成根絕對路徑 `/images/…`（否則 trailing-slash 路由下 404）；每張圖補 `width`/`height`；`nuxt.config.ts` 的 `@nuxt/image` provider 從 `ipx` 改 `ipxStatic`（`ipx` 在 static GitHub Pages 上根本跑不起來）。

### 6.6 雙語與 hreflang

**不做全站對譯。** solo maintainer 維護兩份完整內容的結局是其中一份過期。

| 範圍 | zh-TW | English |
|---|---|---|
| 報頭 + dateline | ✅ | ✅ |
| 目前狀態 + CTA | ✅ | ✅ |
| 三篇案例研究 | ✅ | ✅ |
| 能力斷面 + 沒有的東西 | ✅ | ✅ |
| 年表 / 部署紀錄 | ✅ | ✅（條目標題翻譯，note 保留中文） |
| 導言 Thesis | ✅ | ✅ |
| 決策日誌 | ✅ | ❌（明示 zh-TW only，英文頁放一句說明） |
| 也做過清單 | ✅ | ✅（一行敘述） |

**路由**：`/`（zh-Hant，預設）與 `/en/`。用 `@nuxtjs/i18n` 或手動雙 content 目錄皆可；考量 static generate 的簡潔度，建議 **手動 `content/en/` 鏡像 + `pages/en/[...].vue`**，不新增 i18n 相依。

**`useHead` 設定（每一頁都要，且必須互為 reciprocal）：**

```ts
useHead({
  htmlAttrs: { lang: isEn ? "en" : "zh-Hant-TW" },
  link: [
    { rel: "alternate", hreflang: "zh-Hant", href: `https://www.ogmatcha.com${zhPath}` },
    { rel: "alternate", hreflang: "en",      href: `https://www.ogmatcha.com/en${zhPath}` },
    { rel: "alternate", hreflang: "x-default", href: `https://www.ogmatcha.com${zhPath}` },
    { rel: "canonical", href: `https://www.ogmatcha.com${isEn ? "/en" : ""}${zhPath}` },
  ],
});
```

**注意**：canonical 目前在 `resume.vue` / `portfolio.vue` / `news.vue` 都**沒有** trailing slash，而手寫的 `public/sitemap.xml` 有（`/resume/`）。刪掉手寫 sitemap，讓 `@nuxtjs/sitemap` 產生唯一版本，並統一 no-trailing-slash。

---

## 7. 施工順序

> 誠實話：這總共大約 **17–21 個專注工作天**，也就是 **五到七個週末**。不要試圖一次做完。每個 Phase 都是可獨立部署的完成品。

### Phase 0 — 地基（非視覺）｜3–4 天

**這個 Phase 完全不改變網站外觀，但它讓後面每一件事變成可能。**

| # | 工作 | 檔案 |
|---|---|---|
| 0.1 | **刪除** `plugins/viewport-reset.client.js` | — |
| 0.2 | **刪除** `plugins/animations.client.js`、`components/animation/AnimateOnView.vue`、**同時**刪 `app.vue:124-186` 的全域 `.animate-on-view` 區塊（分開刪會留下讓元素永久隱形的規則） | — |
| 0.3 | **刪除** `components/animation/PageTransition.vue`、`PageLoader.vue`、`app.vue:49-53` 的 localStorage gate | — |
| 0.4 | **攤平 scroller**：移除 `layouts/default.vue:4` 的 `lg:h-screen lg:overflow-hidden`、`:34` 的 `overflow-y-auto` 與 `smooth-scroll` class。刪 `layouts/default.vue:160-162` 與 `assets/css/tailwind.css:42-45` 的兩處 `scroll-behavior: smooth` | — |
| 0.5 | 移除所有 `backdrop-blur` / `backdrop-filter`（8 處，全都蓋在不透明底上） | 見 §5.3 表 |
| 0.6 | 改寫 `plugins/router.client.js` → `app.config.ts` 的 `scrollBehavior` | — |
| 0.7 | 修 `StickyNav.vue:71`、`NavBar.vue:57`、`resume.vue:715` 的 `window.scrollY`（現在它們終於會運作） | — |
| 0.8 | 貼上 `assets/css/tokens.css` 與新的 `tailwind.config.js`（**覆寫而非 extend**），修掉所有 build error，**清掉 104 個 `!important` 與 23 條手寫 media query** | — |
| 0.9 | 自架 4 個字型到 `public/fonts/`，刪 `nuxt.config.ts:70-78` 兩個 CDN `<link>`，Font Awesome → inline SVG | — |
| 0.10 | 圖片：19 MB → 全部重壓（單張 ≤ 200 kB），`ipx` → `ipxStatic`，所有 `<img>` → `<NuxtImg>` 帶 `width`/`height`，相對路徑 → `/images/…` | `portfolio.vue` 等 |
| 0.11 | SEO 修補包：`/news` 改 build-time、修 JSON-LD `sameAs` GitHub URL、修 `og:image`、修 JSON-LD 雙斜線、刪 `public/sitemap.xml`、統一 canonical trailing slash | `nuxt.config.ts`、`news.vue` |
| 0.12 | `npm i gsap@3.15.0` · `npm rm typeit`（先讓 `TypeWriter.vue` 降級成靜態文字） | — |
| 0.13 | 刪空目錄 `public/models/`、`public/sounds/` | — |

**怎麼知道成功了**
- 桌機上 `document.scrollingElement.scrollTop` 會隨捲動變化（現在永遠 0）
- 履歷的回到頂端按鈕與錨點連結在桌機上會動
- `grep -r "!important" --include=*.vue .` 回傳 0
- `grep -rn "process.client\|window.scrollY" .` 回傳 0
- Lighthouse mobile **before / after 兩張截圖**（這是 Phase 0 的交付物之一，不是假設）
- `npx nuxt generate` 通過，`/news` 的產出 HTML 裡有真的新聞文字，不是「載入新聞中…」
- `curl -sI https://www.ogmatcha.com/assets/profile-cover.jpg` 不再 404（或 og:image 已指向存在的檔）

### Phase 1 — 內容真相層｜4–5 天 · **⭐ 只做一件事就做這個**

零 GSAP。純內容 + 靜態版面。

| # | 工作 |
|---|---|
| 1.1 | 內容遷移到 `content/`（§6.5 的結構），裝 `@nuxt/content` |
| 1.2 | 寫 **報頭 dateline** 與 **目前狀態 + 三個 CTA** |
| 1.3 | 寫 **導言 Thesis**（~500 字，§6.4 範例為基準） |
| 1.4 | 建 **年表**（靜態 `<ol>`），補上 18 個月空白，畢業改成已完成事實 |
| 1.5 | 建 **能力斷面**（靜態 SVG + `<table>`）+ **「沒有的東西」**（上限 3 條） |
| 1.6 | **刪除** `FrameworkExperienceChart.vue`（596 行）、重寫 `HexagonSkillNetwork.vue` 為靜態層級圖 |
| 1.7 | 交付紀錄改 3 升格 + 5 降格；升格三篇先只寫 front-matter + 問題 + 結果（決策段落 Phase 4 補完） |
| 1.8 | About 文案、職稱、tag 改寫；`TypeWriter.vue` 刪除 |
| 1.9 | 奧付 Colophon |

**怎麼知道成功了**
- 網站上任何一個技術名稱，都能點到一個交付物。做不到的就已經不在頁面上
- 全站找不到 emoji、找不到「預計」、找不到沒有日期的成就
- 手機第一屏能看到：中文名、CTO 職稱、as-of 日期、Email
- 給三個沒看過的人各看 60 秒，問「他現在在做什麼？怎麼聯絡？」—— 三個都答得出來

### Phase 2 — 動作基礎層｜2 天

| # | 工作 |
|---|---|
| 2.1 | `plugins/gsap.client.ts`（§5.2） |
| 2.2 | `composables/useScrollScene.ts` 的四個 `gsap.matchMedia` 分支 |
| 2.3 | `ScrollTrigger.batch('[data-reveal]')` 取代全站所有 reveal |
| 2.4 | 報頭的 SplitText line-mask（**含 zh-TW 的 `prepareText` + ZWJ + `autoSplit`**） |
| 2.5 | 部署紀錄與閱讀進度線用原生 CSS `animation-timeline: view()` / `scroll()`，包 `@supports` + `@media (prefers-reduced-motion: no-preference)` |

**怎麼知道成功了**
- DevTools 開 `prefers-reduced-motion: reduce`，Network 面板裡 **SplitText / DrawSVG 的 chunk 完全沒有被請求**
- 用 CJK fallback 字型（停用自架字型）重整，報頭的斷行在字型載入後正確重算（`autoSplit` 生效）
- 首頁 JS gz ≤ 120 kB

### Phase 3 — 3D 分層幕｜2–3 天

| # | 工作 |
|---|---|
| 3.1 | `layers.yml` 的內容先寫完（五層 × 決策 / 代價 / 日期） |
| 3.2 | 平面層次圖的**靜態版**先做完（這也是手機版與 reduce 版） |
| 3.3 | 才加 `perspective` + scrub `translateZ` + 焦距 opacity/blur + CustomEase |
| 3.4 | `useCursorInspector`（單一 `gsap.quickTo` pair，`:focus-visible` 有等價狀態） |

**怎麼知道成功了**
- 把 devtools 縮到 1023px，3D 整個消失且沒有殘留 transform（`matchMedia` 自動 revert 正確）
- 只用鍵盤能瀏覽五層並讀到每層的決策文字
- 中階 Android 實機（不是 devtools throttle）捲過這一段維持 ≥ 50fps

### Phase 4 — 案例研究路由｜3–4 天（大部分是寫作）

| # | 工作 |
|---|---|
| 4.1 | `/work/invoice-doctor` 完整寫完（§6.3 的 TODO 全部填掉），含 trace 表格 |
| 4.2 | `/work/phishforge`（強制交叉引用研究二 + 國科會 113 + 資安應用組第一名） |
| 4.3 | `/work/finctory` |
| 4.4 | trace 的 SVG（**直線，不分岔，不用 MotionPath**）+ `ScrollTrigger` `onUpdate` 高亮切換 |

**怎麼知道成功了**
- 三篇的「如果重來」都寫了，而且都不是場面話
- 每篇至少一個真實數字（或明寫「TODO / 尚無」，不用形容詞頂替）
- **文字先在 markdown 裡定稿再碰 SVG**。如果 4.1 的 TODO 兩個小時內填不出來，就先出貨純表格版 —— reduced-motion 版本本來就是它，資訊零損失

### Phase 5 — 雙語 · 決策日誌 · 打磨｜2–3 天

| # | 工作 |
|---|---|
| 5.1 | `/en/` 鏡像（§6.6 的範圍表）+ hreflang |
| 5.2 | `/log` 決策日誌，先放 5 則 |
| 5.3 | 深色模式全面 QA（對比、圖表、SVG stroke） |
| 5.4 | Lighthouse / a11y / 實機通盤 |
| 5.5 | 選配：ScrollSmoother（`smoothTouch: false`）—— 只有在前面全部穩定之後才碰 |

### 只做一個 Phase 的話

**Phase 0 + Phase 1。** 兩者加起來約 7–9 天，交付一個**看起來還算樸素但完全誠實、快速、可被搜尋與 LLM 正確索引、且不再宣稱你是大學生**的網站。動畫是加分項；「這個網站告訴讀者的事情是錯的」是扣分項。先把扣分項清掉。

（若真的只能做半個：Phase 0 的 0.1–0.4 + 0.11 + 0.10，一個週末，修掉 SEO 破圖、client-only 新聞頁、19 MB 圖片與 `user-scalable=no`。這是投報率最高的四小時。）

---

## 8. 風險與護欄

### 8.1 SEO / GEO（這個站靠名字排名，不能賭）

| 風險 | 護欄 |
|---|---|
| 動畫把內容藏起來 | **硬規則**：所有散文、專案名、職稱、trace 步驟、JSON-LD 都在 prerender HTML 裡。`.client.vue` 貢獻 **0 bytes** 到產出 HTML；`<ClientOnly>` 沒有 fallback 就等於沒有內容 |
| LCP 被 opacity gate 卡住 | `opacity: 0` 讓元素**失去 LCP 候選資格**。報頭必須在 first paint 就可見；from-state 由 GSAP 在 runtime 寫入，不由 CSS class 預先隱藏 SSR 好的 HTML |
| 改版掉排名 | 路由 **不變**（`/`、`/resume`、`/portfolio`、`/news`），新增 `/work/*` 與 `/log`。若必須改，加 301（GitHub Pages 用 meta refresh + canonical 是次佳解，TODO: 確認是否有路由要改） |
| sitemap / canonical 打架 | 刪 `public/sitemap.xml`，只留 `@nuxtjs/sitemap`，trailing slash 全站統一 |
| LLM crawler 看不到內容 | `/news` 改 build-time；所有圖表附 `<table>`；`<title>`/`<desc>` 在每個 inline SVG 上 |

### 8.2 無障礙

| 項目 | 標準 |
|---|---|
| `prefers-reduced-motion` | **第一等公民**，是 `gsap.matchMedia` 的一個分支，在 plugin chunk 被 fetch 之前就 return。目前全 repo 出現 **0 次** |
| 縮放 | 移除 `user-scalable=no`（WCAG 1.4.4） |
| 對比 | 見 §3.1 的實測表。`--zhu-mark` (4.1:1) **永不承載文字** |
| 觸控目標 | `(pointer: coarse)` 下所有互動元素 ≥ 44×44px |
| 鍵盤 | 每個 hover 狀態都有 `:focus-visible` 等價物；L2 五層可用方向鍵切換；`--rule-strong` (3.4:1) 作 focus ring |
| 字級 | 最小 14px（現有 5 處 `text-[10px]` 移除） |
| SplitText | 保持 `aria: 'auto'`（預設），拆開的元素保有 `aria-label`、每個 char span 帶 `aria-hidden` |
| 捲動劫持 | **不做。** 平滑捲動保持 1:1 距離與原生捲軸；pin 只在三個幕、且 <1024px 完全關閉；`Observer` + `preventDefault` 在觸控裝置上**永不使用** |

### 8.3 手機效能

- 手機 **零 pin、零 3D、零 `preserve-3d`**（不建立合成層）
- 不用 `normalizeScroll`（它接管觸控捲動）
- 不用平滑捲動函式庫在觸控裝置上（`smoothTouch: false`）
- 圖片單張 ≤ 200 kB，全部帶 intrinsic size
- 現存的「永遠在跑」的動畫全刪：20 個 hexagon 的 infinite `float`（`AboutSection.vue:96-104`）、20 個 particle（`PageLoader.vue`）、`shiftGradient` + 兩個 `sparkle`（`ProfileCard.vue:293,332,344`）、`glow`、`dashOffset`、漸層文字 —— 這些在中階手機上是持續的 frame budget 消耗

### 8.4 範圍蔓延

**三條硬線：**

1. **相依清單只能有 `gsap` 一個新增的 runtime 相依。** 任何「再加一個小函式庫就好」的念頭，先回來看 §2.4 的 kill list。
2. **不新增第四個幕。** 骨架就是 §4 的九段。
3. **文字先定稿，再寫動畫。** 每個 Phase 的內容 markdown 必須先完成，才准打開 SVG 或 ScrollTrigger 檔案。這是唯一能防止「花兩個週末做了一個很貴的框，裡面的字永遠沒寫」的機制。

### 8.5 部署前 Go / No-Go 檢查清單

每次 `nuxt generate` 之後、push 之前跑一遍：

**建置與 SEO**
- [ ] `npx nuxt generate` 零錯誤零警告
- [ ] `.output/public/index.html` 裡搜得到「黃鉅燊」「Finctory」「技術長」的純文字
- [ ] `.output/public/news/index.html` 裡有真的新聞內容，不是「載入新聞中…」
- [ ] 每個 `/work/*` 的 HTML 裡有完整案例文字
- [ ] `sitemap.xml` 只有一份，URL 與 canonical 的 trailing slash 一致
- [ ] JSON-LD 貼進 [Rich Results Test](https://search.google.com/test/rich-results) 無錯誤
- [ ] `og:image` 回 200，尺寸 ≥ 1200×630

**動畫與 a11y**
- [ ] DevTools 設 `prefers-reduced-motion: reduce` 後重整：頁面完整可讀，**且 Network 面板沒有 SplitText / DrawSVG / CustomEase chunk 的請求**
- [ ] 1023px 與 1024px 兩側各重整一次，無殘留 transform、無破版
- [ ] 只用 Tab + 方向鍵走完整頁，focus ring 全程可見
- [ ] 手機直向 + 橫向各捲一遍，無水平捲動
- [ ] 停用自架字型重整，報頭斷行在字型載入後正確重算

**效能**
- [ ] Lighthouse mobile：Performance ≥ 90、Accessibility ≥ 95、SEO = 100
- [ ] LCP ≤ 2.0s / CLS ≤ 0.05 / INP ≤ 200ms
- [ ] 首頁 JS gz ≤ 120 kB、總傳輸 ≤ 600 kB、最大單張圖 ≤ 200 kB
- [ ] 實機（非 throttle）中階 Android 捲過 L2 分層幕 ≥ 50fps

**內容誠實度**
- [ ] 頁面上每一個技術名稱都連得到一個交付物
- [ ] 每一筆成就都有日期
- [ ] dateline 的 as-of 月份是這次部署的月份
- [ ] 沒有任何「預計」在一個已經過去的日期上
- [ ] `git log -1 --format=%cd content/` 距今 < 3 個月（超過就代表該更新了）

---

## 9. 參考資料

### GSAP 官方

| 資源 | URL | 拿什麼 |
|---|---|---|
| GSAP Pricing（2026 全免費確認） | https://gsap.com/pricing/ | 確認不需要 token / 不需要私有 registry |
| Standard License | https://gsap.com/standard-license/ | 唯一限制：不得打造與 Webflow 競爭的 no-code 動畫產生器 |
| ScrollTrigger 文件 | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | `pinType`、`pinReparent`、`snap`、`normalizeScroll`、`ScrollTrigger.isTouch`、`refreshPriority` |
| `ScrollTrigger.batch()` | https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch/ | 取代手刻 IntersectionObserver。callback 收**兩個**參數（元素陣列 + trigger 陣列） |
| SplitText | https://gsap.com/docs/v3/Plugins/SplitText/ | **`prepareText` 的非拉丁語系用法**、`wordDelimiter`、`mask`、`autoSplit`、`aria` |
| SplitText 中文問題（論壇） | https://gsap.com/community/forums/topic/43139-splittext-problem-with-chinese-characters/ | ZWJ 解法的討論串 |
| SplitText 中文支援（論壇） | https://gsap.com/community/forums/topic/17516-splittext-support-chinese-words/ | 同上，另一角度 |
| `gsap.matchMedia()` | https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ | 四分支寫法，查詢失效時自動 revert |
| matchMedia 範例 | https://codepen.io/GreenSock/pen/RwMQwpR | — |
| Observer | https://gsap.com/docs/v3/Plugins/Observer/ | **本案不用**，但要知道為什麼（`preventDefault` 在觸控上會毀掉頁面） |
| Flip | https://gsap.com/docs/v3/Plugins/Flip | **本案不用**，留作未來參考 |
| Nuxt PageTransition 毀掉 ScrollTrigger（論壇） | https://gsap.com/community/forums/topic/35726-nuxt-3-pagetransition-destroys-scrolltrigger/ | 正是本 repo 的問題 |
| 被 transform 的元素上 pin（論壇） | https://gsap.com/community/forums/topic/32421-scrolltrigger-pinning-a-transformed-element/ | `will-change` 為何等同 `transform` 地破壞 `position: fixed` |
| 手機停用 pin（論壇） | https://gsap.com/community/forums/topic/24700-disable-scroll-trigger-pinning-on-mobile/ | — |
| GSAP 官方 agent skills | https://github.com/greensock/gsap-skills | **本機已有**：Claude Code 的 gsap-skills plugin（`skills/` 目錄）。`gsap-scrolltrigger/SKILL.md` 的「Do Not」清單、`gsap-frameworks/SKILL.md` 的 Nuxt 段、`gsap-performance/SKILL.md` 的 `quickTo`。**先讀這些再讀線上文件** |
| GSAP 授權變更說明 | https://webflow.com/blog/gsap-becomes-free · https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ | — |

### Demo（可直接抄的）

| 資源 | URL |
|---|---|
| GSAP Demo Hub | https://demos.gsap.com/ |
| velocity-skew（~10 行，感知品質提升極大） | https://demos.gsap.com/demo/velocity-skew |
| proximity-scale-grid（節點鄰近反應） | https://demos.gsap.com/demo/proximity-scale-grid |
| cursor-tracking-image-preview | https://demos.gsap.com/demo/cursor-tracking-image-preview |
| Osmo：`quickTo` + ticker 的 production 級 cursor 架構 | https://codepen.io/osmosupply/pen/Jjgqjvp |
| Osmo 元件集（每個都附純 HTML/CSS/JS 文件，好移植到 Vue） | https://www.osmo.supply/collection |

### 3D / 捲動技術範例

| 資源 | URL | 拿什麼 |
|---|---|---|
| Codrops：CSS + GSAP 的 3D 捲動文字動畫 | https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/ | **L2 分層幕的直接來源**：`perspective: 70vw` + `preserve-3d` + `backface-visibility: hidden` + `scrub: 2`，零 WebGL |
| Codrops：Sticky Grid Scroll | https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/ | 單一 pinned section 上的三階段 master timeline 架構（0-45 / 45-90 / 90-100%），以及 425vh runway + sticky wrapper 的結構技巧 |
| Codrops：GSAP 電影感 3D 捲動 | https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/ | scrub 驅動的攝影機：在 timeline 上 tween 一個純 JS 物件再讀進 render loop（把 GSAP 與 renderer 解耦）。也驗證了「shader 用 OGL、model 才用 Three」的分界 |
| Codrops：3D Cube Gallery | https://tympanus.net/codrops/2026/05/26/building-a-scroll-driven-3d-cube-gallery-in-webflow-with-gsap/ | — |
| Codrops：GSAP × WebGL shader | https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/ | **本案不用**，但這是未來若加 shader 時的正規 bridge |
| Codrops：DOM ↔ WebGL plane 同步 | https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/ | 同上，漸進增強架構參考 |

### 原生 CSS 捲動動畫

| 資源 | URL | 拿什麼 |
|---|---|---|
| WebKit：純 CSS 捲動驅動動畫指南 | https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ | `animation-timeline: scroll() / view()`、`animation-range` 的權威語法；Safari 26 支援確認 |
| Bramus（Chrome DevRel）14 個 demo | https://scroll-driven-animations.style/ | Reading Progress、Stacking Cards、Shrinking Header + Shadow、Scroll Shadows —— 用來判斷**哪些效果根本不需要 GSAP** |
| 2026 瀏覽器現況 | https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026 | — |

### 設計準則

| 資源 | URL | 拿什麼 |
|---|---|---|
| **impeccable**（用戶指定） | https://github.com/pbakaus/impeccable | **禁止清單**：Inter / Arial / system-ui 預設字、紫色漸層、灰字壓彩底、純無色調黑灰、卡中卡、bounce/elastic 緩動。**確定性檢查**：對比、觸控目標、行長、padding、標題階層。本案的 §3 與 §8.5 就是照它寫的 |
| Josh Comeau：有效的開發者作品集 | https://www.joshwcomeau.com/effective-portfolio/ | 「很多做得很精美的網站，在幫人拿到工作這件事上完全沒打中」。處方：2–5 個專案的 highlight reel，作者當導遊帶讀者做深度巡禮 |
| 2026 開發者作品集指南 | https://codeboards.io/blog/developer-portfolio-guide-2026 | 招募方平均停留 ~6 秒；「可量測的效能改善比多加動畫留下更深印象」 |
| NN/g：Scrolljacking 101 | https://www.nngroup.com/articles/scrolljacking-101/ | 多數受測者至少會輕微迷失方向；任務導向訪客流失 |
| Scrolljacking 與無障礙 | https://www.sitepoint.com/scrolljacking-accessibility/ | WebAIM：40% 前庭功能障礙使用者「總是或經常」有捲動問題，>50% 特別點名視差 |
| — | https://dontfuckwithscroll.com/ | 同上，更直接 |
| Smashing：尊重使用者的動態偏好 | https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/ | `prefers-reduced-motion` 的完整處理 |
| 2026 得獎網站拆解 | https://www.hontran.dev/blog/best-award-winning-websites-2026 | 核心結論：**WebGL 用來營造氛圍，不是用來當內容**。By-Kin 拿了 Awwwards SOTD + Developer Award + FWA + CSSDA，**完全沒有 WebGL** |

### CJK 排版

| 資源 | URL | 拿什麼 |
|---|---|---|
| Typotheque：CJK 排版 | https://www.typotheque.com/articles/typesetting-cjk-text | CJK 內文 ~1.7 行距；任兩字之間都可斷行、無連字；**台港標點置中於字面框**（與中國大陸/日本的靠角不同）—— 所以中國大陸的字型用在 zh-TW 上會微妙地錯 |
| PARTY（東京，Nuxt 站） | https://prty.jp/ | 大型 CJK display 標題用 `line-height: 0.88–0.89`；專案 metadata 用 `writing-mode: vertical-rl` |
| Ultracombos（台灣，Awwwards SOTD 2025-08） | 見 https://www.awwwards.com/ 搜尋 Ultracombos | 拉丁 display + CJK workhorse 的雙字型配對做法（en-us / zh-tw 雙路由） |
| TCCF（台灣，self-host Noto Sans TC 105 切片） | https://tccf.tw/ | 驗證「CJK webfont 不是 5 MB 災難」：`_next/static/media/*.woff2` 共 105 個切片檔 |
| Google Fonts CSS2 API（切片來源） | https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700 | 實測回傳 210 個 `@font-face`（105 片 × 2 字重），首片 8,908 bytes |

### 工具與函式庫（含被否決者，附理由）

| 資源 | URL | 決定 |
|---|---|---|
| Lenis | https://github.com/darkroomengineering/lenis | **不採用**（Phase 0 攤平 scroller 後不需要）。v1.3.26、5.4 kB gz、附 `lenis/vue`。GSAP wiring：`lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);` |
| OGL | https://oframe.github.io/ogl/ | **不採用**（見 §2.4）。若未來需要：`Renderer` + `Triangle` + `Program` 的 fullscreen shader 配方，可省略 scene graph 與 camera |
| OGL flowmap 範例 | https://tympanus.net/codrops/2019/09/25/mouse-flowmap-deformation-with-ogl/ | 同上 |
| TresJS / @tresjs/nuxt | https://docs.tresjs.org/getting-started/installation | **不採用**（`three` 是 peer dep，省不掉 182 kB）。但它的 client-only `<TresCanvas>` 是「如何把 canvas 排除在 prerender 之外」的正確範式 |
| `@hypernym/nuxt-gsap` | https://github.com/hypernym-studio/nuxt-gsap · https://github.com/hypernym-studio/nuxt-gsap/discussions/58 | **不採用**（見 §5.1） |
| Nuxt plugins 文件 | https://nuxt.com/docs/guide/directory-structure/plugins | `.client` 後綴語意 |
| Nuxt `<ClientOnly>` | https://nuxt.com/docs/api/components/client-only | fallback slot 的必要性 |

---

**未確認事項（TODO，不要當成已知）**
- `DrawSVGPlugin` 與 `CustomEase` 的實測 gzip 大小（用 `curl https://cdn.jsdelivr.net/npm/gsap@3/dist/DrawSVGPlugin.min.js | gzip -9 | wc -c`）
- `@nuxt/content` 最新 2.x 版本號
- 改版前的 Lighthouse / LCP / CLS 基準數字
- `public/images` 的實際總傳輸量與首頁總量
- 是否有任何路由需要改變（若有，需要 301 方案）
- §6.3 案例研究中所有標記 `TODO:` 的事實與數字 —— **只有本人知道**，而它們決定了整個 Phase 4 的價值