---
name: Person First / 人在前面
description: A personal site that opens on the person, held in place on the left, with what he thinks, the road he took and the things he built scrolling beside him as evidence.
colors:
  putty-wall: "#efe9e0"
  card-white: "#fbf8f3"
  card-shade: "#f5f0e8"
  ink: "#1e1b18"
  ink-2: "#4b453f"
  ink-3: "#6a6259"
  rule: "#dcd3c7"
  rule-strong: "#857c71"
  terracotta: "#c44a24"
  terracotta-ink: "#b2411d"
  on-terracotta: "#ffffff"
  sage: "#9cc0a4"
  butter: "#f0cd7c"
  highlight: "#f3d27a"
  night-room: "#12141c"
  night-card: "#1c1f2a"
  night-card-shade: "#232736"
  night-ink: "#efebe4"
  night-ink-2: "#bdb7ae"
  night-ink-3: "#979187"
  night-rule: "#2c3040"
  night-rule-strong: "#6a7086"
  lamp-terracotta: "#ff8a5b"
  lamp-terracotta-ink: "#ff9a70"
  on-lamp-terracotta: "#1a0f0a"
  night-highlight: "#6c5bd4"
typography:
  display:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(2.5rem, 1.2rem + 5.6vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  figure:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.6vw, 4rem)"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "'tnum' 1"
  title:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1.75rem, 1.53rem + 1.07vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.15
  thesis:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1.5rem, 0.9rem + 1.2vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.3
  question:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1.375rem, 1.28rem + 0.48vw, 1.75rem)"
    fontWeight: 800
    lineHeight: 1.3
  prose:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1.125rem, 1.08rem + 0.23vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.85
  lede:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.11vw, 0.875rem)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.02em"
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  pill: "999px"
spacing:
  sp-1: "4px"
  sp-2: "8px"
  sp-3: "12px"
  sp-4: "16px"
  sp-5: "24px"
  sp-6: "32px"
  sp-7: "48px"
  sp-8: "64px"
  sp-9: "96px"
  sp-10: "128px"
  gutter: "clamp(16px, 5vw, 64px)"
components:
  button:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "46px"
  button-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.putty-wall}"
  button-pop:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.on-terracotta}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "46px"
  button-pop-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.putty-wall}"
  chip:
    backgroundColor: "{colors.card-shade}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  header-bar:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "52px"
  header-mail:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.on-terracotta}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  road-events:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  work-row:
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  work-row-hover:
    backgroundColor: "{colors.card-white}"
  station-card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(24px, 3.5vw, 64px)"
---

# Design System: Person First / 人在前面

## Overview

**Creative North Star: "The Person Beside the Road"**

The homepage opens on a person, not a product. On a wide screen it is two columns. The left column is who he is and what he is doing now: a round portrait, the name in heavy Archivo, one sentence of thesis as the page's h1, the roles, a short 現在 list marked with a sage dot, a scrollspy index of the page, the social icons and the CV download. It is held in place while the right column scrolls past it. The right column is the evidence, in four movements: 我怎麼想 (first-person prose), 我走的路 (a vertical road of five dated stops, each a question with what actually happened under it, then the counted awards), 做出來的東西 (one whole-row link per thing built, a screenshot beside the words), and 聯絡 (the email address set large). On a phone the person column becomes the opening and the rest follows in the same order.

Everything sits in a warm, quiet room: putty by day, blue-black by night, paper-white cards on soft downward shadows, one terracotta that means "act here" or "this is the point". Motion is earned and tied to the story: the person settles in on load, and one authored moment, the road walk, draws a terracotta line down the road as it is read while a dot walks at its tip, lights each stop it reaches and rolls the year beside the left column's nav. The homepage opens on the one 3D moment, the desk: a real-time room, modelled and lit in Blender with its light baked, that the camera walks across as you scroll before the person column begins. Secondary pages (portfolio, résumé, case studies) reuse the same room, cards, pills and type inside titled station cards.

The previous direction, a product-launch homepage with a pinned three.js device lineup (`components/product/*`, `studio/stage.js`), is retired. Those files remain on disk but no page uses them, and none of their rules (device poses, screen shader, story reel, award belts, text-only scene toggle) apply.

**Key Characteristics:**
- Person first: portrait, name, one-line thesis and what he is doing now come before any work.
- Two columns at 1024px and up (0.9fr / 1.1fr, 96px apart); the person column is sticky and never scrolls out of reach.
- A vertical road of dated stops is the spine of the record; the latest stop is the only lit one.
- Work is a list of whole-row links with real screenshots, not a gallery of cards.
- Heavy Archivo headings, Han headlines broken only between phrases, tabular figures for every date and count.
- One action colour: terracotta by day, lamp-lit terracotta by night; two designed themes, not an inversion.

## Colors

A warm neutral room with one terracotta accent and one small sage signal; the night theme is a separately tuned blue-black room, not an inversion.

### Primary
- **Terracotta** (terracotta): the one fill that means "act here" or "now". Fills the pop button, the header email pill and the road's current stop (with a 4px ring of itself at 22%). Carries white type at 4.8:1.
- **Terracotta, as type** (terracotta-ink): the same hue tuned for text and lines at 5.4:1: counted figures, the road's stop dates, "more in the full record" links, link hover underlines, the active header underline, the social icon hover, focus ring and caret.
- **Lamp-lit Terracotta** (lamp-terracotta, lamp-terracotta-ink, on-lamp-terracotta): the night counterparts; fills take near-black type, type reaches 7.9:1.

### Secondary
- **Sage** (sage): a live-state marker only. The dot before 現在 (with a 3px ring of itself at 30%) and the dot before a work row's status. Never text, never a fill larger than a dot.
- **Butter** (butter): the one block behind Finctory's name on the portfolio, where the company has no screen to show. Not a general accent.

### Neutral
- **Putty Wall** (putty-wall): the page by day. Warm, never pure white.
- **Card White** (card-white): cards, pills, the header bar, the road's event cards, a work row on hover, the avatar's 3px ring.
- **Card Shade** (card-shade): chip and status-tag fill, the toggle hover disc.
- **Ink / Ink 2 / Ink 3** (ink 16.2:1, ink-2 8.9:1, ink-3 5.7:1 on card-white): headings and the first prose paragraph; prose, ledes, roles, secondary nav; dates, metadata, idle scrollspy items.
- **Rule / Rule Strong** (rule, rule-strong 3.6:1 non-text): hairlines, the road's line (a 2px gradient from rule to rule-strong), idle road dots, button borders, the screenshot's 1px outline ring, default link underline, scrollbar thumb.
- **Night Room** family (night-room, night-card, night-card-shade, night-ink, night-ink-2, night-ink-3, night-rule, night-rule-strong): the same roles in the night room.
- **Highlight** (highlight, night-highlight): `::selection` only.

Night applies under `prefers-color-scheme: dark` unless the reader chose day, and under an explicit `data-theme="dark"`. The choice is stored and applied before first paint.

### Named Rules
**The One Terracotta Rule.** Terracotta marks only actions, the figures that are the point, the road's dates and its current stop, and link affordances. Never a section background, never a heading colour, never decoration.

**The Two Rooms Rule.** Every new colour ships as a day/night pair with its contrast checked on its own card.

**The Live Dot Rule.** Sage means "running now" and appears only as a dot of about half an em beside the thing that is live.

## Typography

**Display Font:** Archivo variable (wght 400–900, wdth 100–125), self-hosted, with Noto Sans TC for Han
**Body Font:** the same stack: Archivo, Noto Sans TC, PingFang TC, Microsoft JhengHei
**Label/Mono Font:** none distinct; figures use tabular numerals in the text face (`code` alone falls back to `ui-monospace`)

**Character:** One heavy grotesk carrying the person's voice. Weight carries hierarchy (900 for the name, section heads and figures, 800 for the thesis, road questions and work titles, 600–700 for labels and buttons, 400 for prose); Latin headings are slightly widened (`font-stretch: 108%`) and tightened (-0.015em), Han headings take 0 tracking.

### Hierarchy
- **Display** (900, `--step-5` up to 5.5rem, 1.05): the case-study page title.
- **Headline** (800, `--step-4` up to 4rem): station card titles on portfolio and résumé.
- **Figure** (900, `--step-4`, 1, terracotta-ink): the counted awards, grants and top prizes under the road, each over an ink-3 label.
- **Title** (900, `--step-3`, 1.15): the homepage section heads and the name in the person column; case-study row titles at 800.
- **Thesis** (800, `clamp(1.5rem, 0.9rem + 1.2vw, 2.25rem)`, 1.3 at 1024px and up; `--step-2` and 1.35 below; English `clamp(1.375rem, 0.85rem + 1vw, 2rem)`): the one-line h1 in the person column, held to 18em.
- **Question** (800, `--step-2`, 1.3): each stop on the road.
- **Prose** (400, `--step-1`, 1.85, ink-2): the 我怎麼想 paragraphs, held to 36em; the first paragraph is ink at 600.
- **Lede / Body** (400, `--step-0`, 1.55 Latin / 1.8 Han): section ledes in ink-2 held to 32em; running text held to 62ch Latin or 32em Han.
- **Label** (600, `--step--1`, 0.02em, tabular): nav, buttons, chips, dates, roles, the 現在 list, work metadata. Sentence case; nothing in all caps.
- **Contact address** (800, `clamp(1.3rem, 0.6rem + 2.4vw, 2.5rem)`, 1.1): the email, underlined 2px in terracotta, wrapping only before the @.

### Named Rules
**The Phrase Break Rule.** Every Chinese headline sets `word-break: keep-all` (with `overflow-wrap: anywhere` as the safety net and `text-wrap: balance`), and the copy places a zero-width space (`​`) between phrases, and ` ` between a number and its unit, so a line breaks only between phrases, never inside a word. Role lines keep each role unbroken (`white-space: nowrap` per part).

**The Figures Rule.** Every date, count and period renders with tabular numerals in the text face. No monospace font for data.

**The Han Leading Rule.** Han leading (1.8 body, 1.12 headings) is set once on the document and inherited, never via a `:lang()` rule on descendants.

## Layout

**Homepage.** A single container, max 80rem, with a `clamp(16px, 5vw, 64px)` gutter.
- **Wide (1024px and up):** two columns, `minmax(0, 0.9fr) minmax(0, 1.1fr)` with a 96px gap. The person column is `position: sticky` at the header height and at least one screen tall, its social row pushed to the bottom; when it is taller than the window it scrolls with the page and then holds at its bottom edge (`top: min(var(--header-h), 100svh - var(--me-h))`), so nothing in it is ever out of reach. The scrollspy nav appears only here.
- **Narrow (below 1024px):** one column; the person column is the opening (64px top padding) and the four sections follow. Below 560px a work row stacks its screenshot above its words.
- **Sections** on the right: 64px vertical padding each, 96px under contact; heading, then a 12px gap to the lede, then 32–48px to content.
- **The road:** an ordered list with 32px left padding and 48px between stops; a 2px line runs down at 5px from the left, with a 12px dot at each stop.
- **Work rows:** a grid of an 11rem screenshot (16:10, cropped from the top) and the words, 24px apart, 16px padding, 12px between rows.

**Secondary pages.** Station cards cap at 64rem inside the 90rem `.shell` (16px gutters below 768px, 32px above), 32px apart. Case studies alternate screenshot and words at 900px and up, 96px between items.

Spacing is a 4/8 scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128px). Breakpoints: 560px (header compacts, work rows stack), 640 / 768 / 1280px (Tailwind), 900px (case-study rows), 1024px (homepage two columns).

## Elevation & Depth

The system is lifted, softly. Light falls from the upper left of a warm room: shadows are tinted with the room colour (`--shadow-rgb` 64 44 24 by day, pure black by night), low-contrast and wide. Cards and pills sit on the wall with a two-layer shadow; there are no borders around cards. On the homepage most content sits directly on the wall and lifts only where it is a container (the road's event cards) or on hover (a work row).

### Shadow Vocabulary
- **Resting** (`--shadow-1`: `0 1px 2px rgb(var(--shadow-rgb) / 0.08), 0 6px 16px -6px rgb(var(--shadow-rgb) / 0.16)`): the header bar, the road's event cards, the avatar (inside a 3px card-white ring).
- **Lifted** (`--shadow-2`: `0 2px 4px rgb(var(--shadow-rgb) / 0.06), 0 24px 48px -16px rgb(var(--shadow-rgb) / 0.28)`): station cards, case-study screenshots and proofs, a work row on hover or focus.
- **Action glow** (`0 8px 18px -8px rgb(var(--shadow-rgb) / 0.45)`): the terracotta button only.
- **Marker ring** (`0 0 0 3–4px` of the marker's own colour at 22–30%): the road's current stop and the 現在 dot only. A flat ring, not a blur.

### Named Rules
**The Warm Light Rule.** Drop shadows are always tinted with `--shadow-rgb` and fall downward; no hard offsets, no blurred coloured glows, no `text-shadow`.

## Shapes

Buttons, chips, status tags, the header bar and the email pill are full pills (999px; the `--r-full` token is 9999px and renders identically). Cards and work rows use 24px; the road's event cards and screenshots inside rows use 14px. Every marker is a circle: the portrait, the road dots, the live dot, the header's terracotta dot, the 40px icon toggles. The road itself is a 2px line with rounded ends. The focus outline has a 4px radius.

## Components

### Buttons
Soft pills that press in.
- **Shape:** full pill (999px), 46px minimum height, 24px horizontal padding, 1.5px rule-strong border, label size at 700.
- **Default:** card-white fill, ink text. On the homepage it closes the road (完整年表與能力) and the work list (看全部作品).
- **Pop:** terracotta fill and border, white text, action glow. One per surface (the case-study primary action).
- **Hover / Active:** both fill with ink and take wall-coloured text (140ms), rising 1px; press sinks 1px and scales to 0.98. Focus is a 2px terracotta-ink outline offset 3px.

### Chips
- **Stack chip:** card-shade fill, ink-2 label, 2px × 10px padding, pill, no border, no wrap.
- **Status tag:** card-shade fill, ink-2 600, 1px × 10px, pill (case studies). On a homepage work row, status is text with a sage live dot instead.

### Cards / Containers
- **Station card:** 24px corners, card-white, lifted shadow, no border, `clamp(24px, 3.5vw, 64px)` padding, max 64rem; the body of portfolio and résumé.
- **Road event card:** 14px corners, card-white, resting shadow, 16px × 24px padding, label size; each event a two-column row of a 4.5em tabular date in ink-3 and its title.

### Navigation
- **Header:** a floating pill bar, sticky with 12px of room above it, max 72rem, 52px tall, card-white with resting shadow, over a wall-coloured fade so text scrolling up disappears before reaching it. Left: a terracotta dot and the name in 800. Right: three links (作品, 年表, 履歷; label, ink-2), the language link, the day/night toggle, then the terracotta email pill with a 16px stroke icon.
- **States:** hover and current page turn ink with a 2px terracotta-ink underline. The toggle takes a card-shade disc on hover.
- **Mobile (560px and below):** the name and email label hide, the email pill becomes a 40px circle, gaps tighten; the nav scrolls horizontally.

### Person Column (signature)
The page's identity block, left and sticky at 1024px and up.
- **Identity:** a 64px (72px wide) circular portrait with a 3px card-white ring and resting shadow, beside the name (Title) and the alternate name and handle (label, ink-3).
- **Thesis:** the h1, Thesis type, 32px below.
- **Roles:** label size, ink-2, 1.7 leading, 26em; each role unbroken, separated by a middle dot.
- **現在:** a 700 label heading with the sage live dot, then a list of what (ink 600) over where (ink-3).
- **Scrollspy nav (wide only):** four 700 labels in ink-3, each led by a 1px line 2rem long; the active or hovered item turns ink and its line grows to 4rem (250ms).
- **Links:** 20px stroke icons (GitHub, LinkedIn, Instagram, Email) in ink-2 turning terracotta-ink on hover, then a CV download with a file icon in 600 label.

### The Road (signature)
Five dated stops from the beats, oldest first. Each stop: its date range in terracotta-ink 600 label, the question (Question type), an optional ink-2 line, then the road event card with up to the five latest events and a terracotta-ink "還有 N 筆" link to the résumé. Idle dots are wall-filled with a 2px rule-strong border; the last stop's dot is filled terracotta with its ring. Under the road, the counted figures, then a default button to the résumé.

### The Desk (signature 3D)
`components/desk/DeskScene.vue`, built from `studio/desk/build_desk.py`. A full-height sticky stage over a section of 75svh per stop plus one window; the layout comes from CSS (900px and up, no reduced motion), so it is in the server HTML and does not jump when the script arrives. The opening frame is the whole desk at a 3/4 angle with the name (900, display size) and thesis top-left on the photo, no card. Each later stop moves the camera to one thing (notebook → laptop → phone → tablet → reports → trophy shelf → 乖乖), holding still through the middle 40% of its slice, moving only in the outer 30% each side and rising 6cm on the way; the caption changes only on arrival. It sits bottom-left on a solid card-white panel (`--surface`, `--shadow-2`, 24px corners): a heavy title, two lines of fact and one link. No kicker: the object is on screen, and hovering names it. A column of 6px dots on the right shows the stop; the current one is terracotta at 1.6x. The pointer sways the camera a few centimetres; hovering an object shows an ink pill with its name; clicking flies there.
Light is baked, not computed: day is morning sun through the left window, night is only the lamp and the screens. The theme switch crossfades the two lightmaps over about a second. Screens show real screenshots of the owner's products (laptop: the Finctory site, phone: oSave, tablet: MedaLink); trophies and the glass award are the only live-lit materials, and the canvas redraws only while something moves.
Budget: a 16:9 still render (`/desk/poster-{day,night}.webp`) is the first paint; the GLB and the current mood's lightmaps load at idle and the canvas fades in over 900ms; the other mood loads after. Under 900px, save-data or reduced motion, only the still shows (day or night, following the theme toggle as well as the system) and the person column follows it directly; the page below already tells what the stops do.

### Work Row (signature)
The whole row is one link. At rest it sits on the wall with no fill; on hover or focus it takes card-white, the lifted shadow and rises 2px (200ms), and its arrow-up-right icon turns terracotta-ink and moves 2px up and right. Inside: the screenshot (14px corners, 1px rule ring), a metadata line (period in ink-3, status with sage dot), the title (800, `--step-1`), the role (600 label, ink-2), one line of what it is (label, 1.75 leading, ink-2) and tags.

### Opening
The left column's pieces rise 18px and fade in one after another (800ms on the entrance ease, 0-420ms stagger); the photo also turns in from -6deg at 0.8 scale. Pure CSS, so it runs from the first frame with no script and no flash.

### Road Walk (signature motion)
While the road crosses the reading line (55% of the window), a 2px terracotta trail fills down the grey rule and a 12px terracotta walker with a soft glow rides its tip (GSAP ScrollTrigger, eased 0.4s). Stops ahead of the walker wait at 45% opacity, 10px low, their events at 35%; each stop the walker reaches lights its dot with a single 14px ring and brings its events in on a 60ms stagger. The left nav's 「我走的路」 shows the walker's year, rolling vertically when it changes. With reduced motion, or before the script runs, every stop is simply lit and nothing is hidden.

### Entrances
Figures, work rows and the contact address that start below the fold settle up once when reached: from 16px down and transparent, 600ms on the entrance ease. A work row's picture also uncovers upward (clip-path, 900ms); the contact address draws its terracotta underline left to right. Anything already on screen at load is never hidden. Skipped entirely under reduced motion.

### Theme Toggle
A 40px circular icon button with a 2px-stroke line icon, ink-2, card-shade disc on hover. The choice is stored and applied before first paint (`data-theme`).

## Do's and Don'ts

### Do:
- **Do** open every homepage variant on the person: portrait, name, thesis, roles and what he is doing now come before any work.
- **Do** keep the person column within reach at 1024px and up: sticky at the header, and when it is taller than the window, let it scroll and then hold at its bottom edge.
- **Do** make a work item a whole-row link with a real screenshot, its period, status, role and one line of what it is.
- **Do** give every Chinese headline `word-break: keep-all` and write `​` between its phrases.
- **Do** make every entrance and hover motion stop under `prefers-reduced-motion`, and never hide content that is already on screen at load.
- **Do** use full pills (999px) for buttons, chips and tags, 24px for cards and rows, 14px for screenshots and event cards, circles for every marker.
- **Do** ship every colour as a day/night pair and check its contrast on its own card.
- **Do** set dates and counts in tabular figures, and keep the one terracotta for actions, key figures, the road's dates and its current stop.

### Don't:
- **Don't** bring back a device stage or product lineup; the desk is the one 3D scene and it is about the person's things, not a launch. After it, the road walk is the one authored motion moment; do not add a third.
- **Don't** compute lighting on the desk at runtime or tone-map its baked textures; change the light in Blender and re-bake.
- **Don't** put work before the person, or turn the homepage work list into a grid of floating cards.
- **Don't** break a Chinese headline inside a word, or rely on the browser to find phrase breaks.
- **Don't** use hard offset shadows, blurred coloured glows or `text-shadow`; drop shadows are warm, soft and downward.
- **Don't** set labels in all caps or add a monospace face for data.
- **Don't** use terracotta as a section fill, heading colour or decoration, or sage as anything but a live dot.
