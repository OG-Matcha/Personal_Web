# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served by different routes (confirmed 2026-11-17: "兩者並重"):

- **Collaborators** — founders, enterprise contacts, people looking for a generative-AI / agent architecture consultant or an early-stage technical partner. Arrive on `/` from a link, LinkedIn, or a name search. Job: within ~90 seconds, decide whether this person can take an AI system from demo to production, then find a way to reach him.
- **Evaluators** — graduate programs, scholarship and competition committees, recruiters. Arrive on `/resume/` or `/portfolio/`. Job: verify dated facts quickly — awards, research grants, roles, education.

## Product Purpose

Personal site of 黃鉅燊 (Ju-Shen Huang, handle OG_Matcha), www.ogmatcha.com. Thesis (content/about.yml): 把 AI 從展示品，做到能上線維運 — "Demo 很好做。難的是三個月後還有人在用。" Success = a collaborator emails or connects; an evaluator finds the dated proof without hunting.

## Positioning

Three concurrent roles of different shape (content/about.yml `posts`): co-founder & CTO of 斐闊 Finctory (leads a ≤4-person engineering team, four product lines), co-founder & FDE of 醫數行銷 MedaLink (builds the clinic AI system alone, conversation engine to cloud), AI Intern at ITRI ISTI (ships internal systems inside a large org). Shipped products with real usage, not demos: 財伴 oSave on App Store / Google Play, backed by an NSTC research project with an 82-person quasi-experiment.

## Operating Context

Static Nuxt 3 site (`ssr: true`, prerender, GitHub Pages + CNAME). Content lives in `content/*.yml` and `content/work/*.yml`; pages derive counts from `content/timeline.yml` (`useContent.ts` — awards counted, 入圍 excluded). `site.yml asOf` is printed on the page as a freshness signal and must be bumped each deploy.

Routes and their distinct jobs (memory: personal-web-site-architecture): `/` = who he is now + proof + contact; `/portfolio/` = all work; `/resume/` = full dated timeline; `/work/[slug]/` = case studies (osave, phishforge, finctory, medalink). They must not duplicate each other.

## Capabilities and Constraints

- Must remain statically generated and SEO/AEO-sound (`npm run check:seo`); JSON-LD Person schema stays.
- Must feel immersive, with distinctive motion (owner, 2026-11-17: the 3D / WebGL ask was a means to immersion, not a goal in itself; the same day the owner chose "你的工作桌" over a scroll-scrubbed video, which was too heavy). The homepage opens on my desk (`components/desk/DeskScene.vue`): a room modelled and lit in Blender (`studio/desk/build_desk.py`), its light baked into day and night lightmaps, shown in three.js. Scrolling walks the camera across the desk, one thing per stop (notebook, laptop, phone, tablet, reports, trophy shelf, 乖乖), each with a caption and a link; hovering names a thing, clicking flies to it; the theme switch crossfades day and night. Loading budget: a still render paints first; the 3D loads after idle and fades in over it; phones, save-data and reduced motion keep the still, and the person column follows it. Below the desk, the person-first page keeps the road walk down 我走的路.
- Must support both light and dark modes, each designed (not inverted).
- Must be bilingual: 繁體中文 primary, English version. English pages exist under `/en/`; any change to them must preserve facts and be reviewed by the owner.
- Every timeline entry needs a `date`; undated claims are not rendered.

## Brand Commitments

- Voice: first person, no adjectives of self-praise, no 「熱愛」「致力於」. Every number must be checkable in `timeline.yml`, `work/*.yml`, or code.
- Name: 黃鉅燊 / Ju-Shen Huang / OG_Matcha.

## Evidence on Hand

- `content/timeline.yml`: dated awards (incl. TSMC IT CareerHack 1st, 大專校院資訊應用服務創新競賽 1st, 臺東最佳創新創業大獎, 2026 雙北 3rd, 2026 臺北秋季程式設計節 佳作 as team 「得獎的是!?」), two NSTC student research grants, LAK 2025 publication, roles.
- Education: NCU 資訊管理學系 BS 2026-06, GPA 4.19/4.3, 學分學程「商業智慧與分析」「人工智慧跨域應用」; MS program from 2026-09.
- Case studies with real screenshots: `public/images/osave-*.webp`, `phishforge-1.png`, `medalink-1.jpg`.
- CV PDFs (`public/content/ju-shen-huang-cv-{zh,en}.pdf`, 2026-11) are generated from `content/cv.yml` by `node scripts/build-cv.mjs`; the old address `Ju-Shen Huang CV.pdf` serves the English copy.
- No testimonials or client quotes exist; do not invent any.

## Product Principles

1. Dated fact over claim: if it has no date or source, it does not ship.
2. Each URL earns its existence; no section is repeated across routes.
3. Show the shipped thing (store links, screenshots, repo, numbers) before describing it.
4. A reader who leaves after one screen should still know who he is and how to reach him.

## Accessibility & Inclusion

Content readable without WebGL or JavaScript; `prefers-reduced-motion` honored; text contrast meets WCAG AA in both themes.
