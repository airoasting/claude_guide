---
name: html-slide-generator
description: Generate fullscreen HTML slide decks with a McKinsey-style warm-paper design. Produces a single self-contained HTML file with a fixed 1440×900 canvas (scaled to fit), per-slide gradient backgrounds, magazine-style cover/conclusion (paper bg + box rules + imprint pill), paper-card components, keyboard/click/wheel navigation, progress bar, entrance animations, and DPR-scaled canvas charts. Use when the user wants a browser-based presentation.
---

# HTML Slide Generator

Use this skill to generate a single self-contained HTML slide deck that runs fullscreen in the browser.

## Design Philosophy

This deck system is **NOT a generic neumorphic SaaS dashboard**. It is a McKinsey-style executive deck on warm paper. The visual language is:

- **Fixed canvas, never reflows** — 1440×900 design size, scaled uniformly via `transform: scale()`. Extra viewport space becomes letterbox, never stretches content.
- **Warm paper backgrounds with per-slide gradient variation** — each content slide gets a slightly different undertone (warmer/cooler, different angle, different radial accent placement). The variation is intentional and hand-crafted, not a single repeating template.
- **Cover & conclusion are magazine-style, not dashboard-style** — same warm paper background as content slides, with a bordered display box (top + bottom horizontal rules), large editorial display typography (~108px split orange/dark), and an `AI ROASTING` imprint pill + author byline pinned at slide bottom. NO masthead, NO page footer, NO vertical text rails — just the box, the headline, the imprint.
- **Paper cards, not neumorphic blobs** — thin 1px borders + subtle layered shadows. Sharp 4-6px radii. Heavy neumorphic shadows are forbidden (they read as AI-generated/2020-era).
- **Open-circle outline badges** — never filled circles for numbered badges.
- **Left-aligned headers with underlined kickers** — never centered headers on content slides.
- **Restrained palette** — single orange accent, otherwise warm neutrals. No rainbow tier colors except where data demands them (scorecard tiers).
- **Pretendard everywhere** — no serif fallbacks (no Georgia, no Times), no font-family overrides except `inherit`.

## Design System

All decks use the following design tokens unless the user requests a different theme.

### CSS Custom Properties

```css
:root {
  /* Paper background */
  --bg: #EDEAE4;

  /* Accent Colors */
  --orange: #D97757;
  --orange-lt: rgba(217,119,87,0.12);
  --green: #3a9a3a;
  --red: #C93030;
  --blue: #3a6a9a;

  /* Text Colors */
  --t1: #2E2A26;   /* Primary text */
  --t2: #7A7570;   /* Secondary text */
  --t3: #A8A39D;   /* Tertiary / labels */

  /* Fixed canvas — content layout never reflows. JS sets --scale on resize. */
  --frame-w: 1440px;
  --frame-h: 900px;
}
```

Legacy neumorphic tokens (`--sh-dark`, `--sh-light`, `--nm`, `--nm-sm`) are **removed** — do not reintroduce them. If a card needs depth, use the layered shadow recipe in the Paper Cards section.

### Paper Cards with Subtle Gradient

Cards use a **subtle vertical paper gradient** (lighter at top, slight warm tint at bottom) + thin 1px border + soft layered shadow. This gives a "sheet of paper resting on paper" feel. Heavy neumorphic shadows are forbidden.

```css
/* Generic paper card (e.g., TOC rows) */
.nm-card {
  background: linear-gradient(170deg, rgba(255,255,255,0.7) 0%, rgba(245,238,225,0.4) 100%);
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 6px 16px rgba(60,40,20,0.04);
}

/* Accented card (insight, anthro col, scorecard, arch agent) — slightly more opaque
   gradient + 2px orange top border */
.card-accented {
  background: linear-gradient(165deg, rgba(255,255,255,0.78) 0%, rgba(245,236,220,0.5) 100%);
  border: 1px solid rgba(0,0,0,0.06);
  border-top: 2px solid var(--orange);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(60,40,20,0.05);
}

/* Inner / nested card (e.g., arch-agent inside arch-frame) — lighter still */
.card-inner {
  background: linear-gradient(170deg, rgba(255,255,255,0.82) 0%, rgba(245,236,220,0.55) 100%);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 4px;
}
```

**Border radius scale** — keep small. McKinsey decks use sharp corners.
- `4px` — accented cards (insight, sc, anthro, arch agent)
- `6px` — generic paper cards (TOC rows)
- `3px` — pills, callouts, CTAs
- Never `12px+` (reads as Web 2.0 SaaS)

**Open-circle badges** — outlined, never filled. Use for all numbered badges (insight, TOC, step):

```css
.insight-badge, .toc-badge, .cc-step-n {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--orange);
  background: transparent;
  color: var(--orange);
  font-size: 13px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  font-feature-settings: "tnum";
}
```

### Typography (3-Tier System, Fixed Pixels)

| Tier | Size | Usage |
|------|------|-------|
| Display | 108px, weight 800 | Cover headline (split into orange line + dark line) |
| Headline | 36px (slide-title), 36px bold (conclusion quote), weight 700-800 | Content slide titles, conclusion pull quote |
| Heading | 19px, weight 700 | Card titles, section headings, lead text |
| Body | 14.5-15px, weight 400-600 | Body text, descriptions, list items |
| Table Header | 13.5px, weight 700 | Benchmark / comparison table column headers |
| Label | 11-12px, weight 500-600 | Kickers (uppercase 0.16em), sources, dates under headers |

**No `clamp()`, no `vw`** — the fixed canvas eliminates the need for responsive font math. All sizes are fixed px.

Letter-spacing convention:
- Display text (32px+): `-0.025em` to `-0.035em`
- Body (14-19px): `-0.005em` to `-0.015em`
- Labels (11-12px, uppercase): `+0.16em` to `+0.22em`

### Slide Title

```css
.slide-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--t1);
  word-break: keep-all;
  line-height: 1.25;
  letter-spacing: -0.025em;
}
```

### Cover Display (Magazine Headline)

```css
.mag-display-line {
  display: block;
  font-size: 108px; font-weight: 800;
  line-height: 1.04; letter-spacing: -0.04em;
  word-break: keep-all;
}
.mag-display-line.accent { color: var(--orange); margin-bottom: -4px; }
.mag-display-line.dark   { color: var(--t1); }
```

The cover headline is two `.mag-display-line` spans inside a `.mag-display`. Line 1 is `.accent` (orange, ends with comma), line 2 is `.dark` (dark, ends with period). Example: `"Claude 완전 정복," / "5분 오리엔테이션."`

### Font

Default: Pretendard Variable, used **everywhere** — no serif fallback fonts (e.g., Georgia for IPA), no font-family overrides except `inherit`. Load from local file:

```css
@font-face {
  font-family: 'Pretendard';
  src: url('<relative-path>/PretendardVariable.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
}
```

Asset: `assets/fonts/PretendardVariable.ttf`

## Layout System

### Fixed Canvas (Critical)

The deck uses a **fixed 1440×900 canvas** that scales uniformly to fit the viewport via `transform: scale()`. This ensures content layout NEVER reflows when the user resizes or fullscreens — extra viewport space becomes letterbox background, not stretched content.

```css
:root {
  --frame-w: 1440px;
  --frame-h: 900px;
}

html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse at top, #1f1916 0%, #100c0a 70%) #0f0b09;
}

#app-frame {
  position: fixed;
  top: 50%; left: 50%;
  width: var(--frame-w);
  height: var(--frame-h);
  transform: translate(-50%, -50%) scale(var(--scale, 1));
  transform-origin: center center;
  background: var(--bg);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
```

JS rescales on resize:
```js
const FRAME_W = 1440, FRAME_H = 900;
function rescale() {
  const s = Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H);
  document.documentElement.style.setProperty('--scale', s);
}
window.addEventListener('resize', rescale);
rescale();
```

**HTML structure:** all UI (progress-bar, question-bar, slides-container, nav-bar) goes INSIDE `#app-frame`. The modal is the only sibling outside, so it covers the full viewport.

```html
<body>
  <div id="app-frame">
    <div id="progress-bar"></div>
    <div id="question-bar">...</div>
    <div id="slides-container"><!-- slides --></div>
    <div id="nav-bar">...</div>
  </div>
  <div id="modal-x">...</div>  <!-- viewport-fixed, outside frame -->
</body>
```

**Implication:** since the canvas is fixed, **never use `vw`/`vh` units** inside slides. Use fixed `px` everywhere — scale handles responsiveness. Convert any `clamp(min, vw, max)` to a single fixed px (typically the upper bound).

### Slide Container

```css
.slide {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 100px 88px calc(64px + 100px);
  overflow: hidden;
}
```

Key measurements (in 1440×900 canvas):
- **Top padding**: 100px
- **Side padding**: 88px
- **Bottom padding**: `calc(64px + 100px)` — 100px content margin + 64px navigation bar height
- **Content area max-width**: 1180px (centered)

### Content Slides

```css
.slide-content {
  justify-content: flex-start !important;
  padding-top: 100px !important;
  padding-bottom: calc(64px + 100px) !important;
}
```

Content slides have `justify-content: flex-start` so the header is pinned to the top of the content area. The content below the header fills the remaining space with `flex: 1; min-height: 0`.

### Cover & Conclusion (Magazine Style)

Cover (`#slide-1`) and conclusion (`#slide-conclusion`) share a single class `.slide-magazine` and use **the same paper-tone gradient as content slides** but more pronounced. They are NOT dark slides. Both have:

1. A `.mag-box` wrapper around the main content (top + bottom 1px dark rules — the magazine "boxed display")
2. The `.imprint` block (AI ROASTING pill + author byline) absolutely positioned near the bottom

```css
.slide-magazine {
  background:
    radial-gradient(ellipse 80% 60% at 85% 0%, rgba(217,119,87,0.14), transparent 60%),
    radial-gradient(ellipse 70% 60% at 0% 100%, rgba(140,110,80,0.12), transparent 60%),
    linear-gradient(165deg, #F4EEE3 0%, #D8CCB2 100%);
  color: var(--t1);
}

.mag-box {
  width: 100%; max-width: 1180px;
  border-top: 1px solid rgba(0,0,0,0.5);
  border-bottom: 1px solid rgba(0,0,0,0.5);
  padding: 56px 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
```

Cover content inside `.mag-box`: `.mag-display` with two `.mag-display-line` spans (orange / dark).

Conclusion content inside `.mag-box`: `.cc-quote-block` with bold quote text, then `.cc-quote-attr` (author + source). The attribution gets a 56px centered orange separator rule above it via `::before`.

```css
.cc-quote-text {
  font-size: 36px; font-weight: 700;
  line-height: 1.5;
  color: var(--t1);
  letter-spacing: -0.025em;
  word-break: keep-all;
  margin: 0 0 36px;
  max-width: 1040px;
}
.cc-quote-text .hl {
  color: var(--orange);
  font-weight: 700;
  background: none;
  -webkit-text-fill-color: currentColor;
}
.cc-quote-attr {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  position: relative; padding-top: 28px;
}
.cc-quote-attr::before {
  content: '';
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 56px; height: 1.5px;
  background: var(--orange);
}
```

The conclusion quote is **bare text** — no surrounding `"` quotation marks (the bold weight + box framing carries the citation feel).

### Imprint (AI ROASTING pill + author byline)

Pinned to the bottom of cover and conclusion. Same pixel position on both slides for consistency.

```css
.imprint {
  position: absolute;
  left: 50%;
  bottom: 140px;
  transform: translateX(-50%);
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
}
.imprint-pill {
  display: inline-flex; align-items: center;
  padding: 11px 28px;
  background: var(--orange);
  color: #fff;
  font-size: 13px; font-weight: 800;
  letter-spacing: 0.22em;
  border-radius: 100px;
}
.imprint-author {
  font-size: 14px;
  color: var(--t2);
  letter-spacing: 0.06em;
  font-weight: 500;
}
```

No box-shadow on the pill — that reads as Web 2.0 button. Just the flat orange pill.

### Slide Themes — Paper Backgrounds with Per-Slide Gradient Variation

**Every content slide must have a unique gradient.** Same warm-paper family, but each slide gets a distinct undertone, angle, and radial-accent placement. Two layers of radial gradient (orange-tinted + warm-neutral-tinted) on top of a linear gradient base. The variation is visible — not subliminal — and signals hand-crafted intent.

Base gradient (default for any unspecified slide):

```css
.slide-light {
  background:
    radial-gradient(ellipse 80% 60% at 85% 0%, rgba(217,119,87,0.14), transparent 60%),
    radial-gradient(ellipse 70% 60% at 0% 100%, rgba(140,110,80,0.12), transparent 60%),
    linear-gradient(165deg, #F4EEE3 0%, #D8CCB2 100%);
  color: var(--t1);
}
```

Per-slide variations — author one for **every** content slide. Vary:
- Linear gradient angle: 135deg, 140, 150, 155, 160, 165, 170
- Linear gradient endpoint color (within the warm-paper family: `#D2CAB6` to `#DACCAF`)
- Radial accent placement: corners, edges, top/bottom
- Radial color: `rgba(217,119,87,...)` (orange) or `rgba(140-180, 110-150, 80-110,...)` (warm neutral)
- Radial intensity: `0.08` to `0.16`

Example per-slide gradients:

```css
#slide-2.slide-light {
  background:
    radial-gradient(ellipse 75% 60% at 100% 0%, rgba(160,130,90,0.15), transparent 60%),
    radial-gradient(ellipse 60% 50% at 0% 100%, rgba(217,119,87,0.08), transparent 60%),
    linear-gradient(170deg, #F4EEE3 0%, #D6CAB1 100%);
}
#slide-3.slide-light {
  background:
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(217,119,87,0.16), transparent 60%),
    radial-gradient(ellipse 60% 60% at 100% 100%, rgba(150,110,80,0.1), transparent 60%),
    linear-gradient(150deg, #F5EEE2 0%, #DACCAF 100%);
}
#slide-4.slide-light {
  background:
    radial-gradient(ellipse 70% 60% at 100% 100%, rgba(217,119,87,0.14), transparent 60%),
    radial-gradient(ellipse 60% 50% at 0% 0%, rgba(180,150,110,0.1), transparent 60%),
    linear-gradient(135deg, #F3ECDE 0%, #D6C8AC 100%);
}
/* ...continue for each slide-N */
```

**Note on dark slides:** the legacy `.slide-dark` class (heavy warm-brown gradient) is **deprecated**. Cover and conclusion now use `.slide-magazine` (light paper) instead. Only retain `.slide-dark` if a specific deck genuinely needs a dark divider slide between sections.

### Slide Header (Left-Aligned, McKinsey-Style Underlined Kicker)

```css
.slide-header {
  text-align: left;
  margin-bottom: 32px;
  width: 100%;
  max-width: 1180px;
  flex-shrink: 0;
}
.slide-kicker {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 14px;
  display: inline-block;
  padding-bottom: 4px;
  border-bottom: 1.5px solid var(--orange);
}
.slide-title {
  font-size: 32px;
  font-weight: 700; color: var(--t1);
  word-break: keep-all; line-height: 1.25;
  letter-spacing: -0.025em;
}
.slide-desc {
  font-size: 15px; color: var(--t2);
  word-break: keep-all; line-height: 1.6;
  margin-top: 10px; max-width: 880px;
}
```

### Navigation Bar (Inside #app-frame)

```css
#nav-bar {
  position: absolute;        /* relative to #app-frame, NOT viewport */
  bottom: 0; left: 0; right: 0;
  height: 64px;
  background: rgba(18,16,14,0.92);
  backdrop-filter: blur(14px);
  z-index: 999;
}
```

### Progress Bar (Inside #app-frame)

```css
#progress-bar {
  position: absolute;        /* relative to #app-frame */
  top: 0; left: 0;
  height: 3px;
  background: var(--orange);
  z-index: 1000;
}
```

### Question Bar (Optional, for multi-section decks)

```css
#question-bar {
  position: absolute;        /* relative to #app-frame */
  top: 3px; left: 0; right: 0;
  z-index: 900;
  padding: 7px 32px;
  background: rgba(237,234,228,0.95);
  backdrop-filter: blur(10px);
}
```

## Animation System

**Rule:** between-slide transitions use **opacity (brightness) only** — no translate, no slide-in. Slide entrance animations for children also use opacity only. Movement-based animations (translateX/Y in transitions) are forbidden — they read as Web 2.0 marketing site, not executive deck.

### Slide Transitions

```css
.slide {
  opacity: 0;
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.slide.active { opacity: 1; pointer-events: all; }
```

Use the `cubic-bezier(0.22, 1, 0.36, 1)` easing curve. Duration ~650ms — soft enough to feel editorial, fast enough to avoid dead air. JS `goTo()` should NOT manipulate `transform` on slides — only `opacity` and `pointer-events`.

**Critical:** trigger child entrance animations IN PARALLEL with the slide fade-in, not after. If you wait for the slide fade to finish before animating children, the user perceives 1+ seconds of empty silence per transition.

```js
// Inside goTo():
newSlide.style.transition = 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
newSlide.style.opacity = '1';
current = n;
updateUI();
onSlideActivated(current);  // ← run NOW, alongside the fade
setTimeout(() => { /* cleanup */ }, 670);
```

### Entrance Animations for Slide Children

```css
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.anim { opacity: 0; }
.anim.visible {
  animation: fadeIn 0.5s ease both;
}
```

Children are auto-tagged with `.anim` class on init and animated sequentially with **0.06s stagger** between each element when a slide is activated. Set `el.style.animationDelay = (i * 0.06) + 's'`.

### Hover Pop-Out on All Content Cards

Every content card gets a subtle pop-out on hover — `translateY(-3px or -4px)` + stronger shadow. This is the ONLY transform-based animation in the deck. Apply uniformly to: TOC rows, insight cards, anthro columns, scorecard cards, architecture agents, founder cards, conclusion steps.

Standard recipe (use `-4px` for primary content cards, `-3px` for nested or smaller cards):

```css
.card {
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 16px 36px rgba(60,40,20,0.1);
}
```

Dark-themed cards (e.g., conclusion steps) use a background brightness shift instead of/along with the lift:

```css
.cc-step:hover {
  background: rgba(255,255,255,0.04);
  transform: translateY(-3px);
}
```

### Number Counter Animation (Cover Stats)

Use `countUp(element, targetNumber, suffix, duration)` for stat boxes on cover slides.

## Canvas Charts

### DPR Scaling (Required for all canvas charts)

```js
const dpr = window.devicePixelRatio || 1;
canvas.width = cssW * dpr;
canvas.height = cssH * dpr;
canvas.style.width = cssW + 'px';
canvas.style.height = cssH + 'px';
ctx.scale(dpr, dpr);
```

### Chart Types Supported

- **Scatter plot**: 4-quadrant with labeled points, background zones
- **Radar chart**: Multi-axis polygon comparison (theory vs actual)
- **Bar chart**: Horizontal animated bars with gradient fills
- All charts must fit within the content area (use `flex: 1; min-height: 0` on wrapper, `max-width: 100%; max-height: 100%` on canvas)

## Slide Types & Patterns

### Cover (Magazine, Light Paper)

- Class: `.slide slide-magazine`
- Inside: a single `.mag-box` (top + bottom 1px dark rules) containing the `.mag-display` headline
- Headline is two `.mag-display-line` spans: line 1 `.accent` (orange, ends with `,`), line 2 `.dark` (dark, ends with `.`)
- `.imprint` (AI ROASTING pill + "강정구 · Jayden Kang" author byline) absolutely positioned at `bottom: 140px`
- NO eyebrow pills, NO stats bars, NO subtitle. Just headline + imprint inside the box.

### TOC / Agenda

- Numbered rows with badge circles
- Neumorphic card per row
- Right arrow indicator (`›`)
- `justify-content: space-evenly` for vertical distribution
- Hover: translateX + arrow color change

### Insight Cards (3-up)

- `display: flex; gap: 20px`
- Each card: badge number, heading (18px), body (15px)
- Orange top border (4px)
- `flex: 1; min-height: 0` for equal height

### Stat Bar + Two Columns

- Stat summary bar (equal-width segments)
- Two columns below: colored headers + item rows
- Item notes as pill badges (12px, border-radius: 100px)

### Data Visualization (Canvas)

- Scatter, Radar, Bar charts
- Always DPR-scaled
- Always contained within flex content area

### Benchmark / Comparison Table

For dense numeric comparisons (e.g., model benchmark scores across multiple competitors), use a CSS grid table inside a paper card:

- Wrap the table in a `.bench-card` (paper-style card with hover pop-out)
- `overflow: visible` on the card so tooltips can escape the card edges
- Header row + data rows are CSS grid (`grid-template-columns: 2.7fr 1fr 1fr 1fr 1fr 1fr` for 1 label + 5 model columns)
- Header row font-size **13.5px**, sub-label `<em>` (release date) **12px**, weight 500, color `var(--t3)`
- Rows use `flex: 1 1 0` inside the flex-column card so they distribute the available height evenly — no bottom whitespace inside the card
- Top scores get a `bench-cell-top` class with bold weight + warm dark color (`#B04A20`) and a 👑 emoji
- Empty/missing data shows `–` in muted gray
- Each row's first cell has a `.bench-cat-tag` (orange-tinted pill, ~108px min-width) with category icon + label, followed by a `.bench-tip` wrapping the benchmark name
- `.bench-tip[data-tip]:hover::after` renders a dark tooltip with the benchmark explanation. For the bottom 3 rows, flip the tooltip above (via `:nth-last-child(-n+3)`) so it doesn't get clipped by the navbar
- Footnote (right-aligned, `--t3`, 11px) below the card explains 👑 and dates

Limit to ~8 rows to fit a single 1440×900 canvas comfortably. Drop categories or pick the most representative benchmark per category if it doesn't fit.

### Headline List (Evidence / News)

- Summary stat boxes at top (3-up, neumorphic)
- Rows: date (56px fixed) + tag (48px fixed, colored pill) + headline (flex: 1) + source
- Time-ordered (ascending)
- Bottom-line message (So What)

### Age / Comparison Cards

- 4-up horizontal cards
- Large number (clamp 32-50px, bold color)
- Color-coded bottom border (red=negative, green=positive)

### Strategy Cards (3-up with left border)

- Left orange border (4px via ::before)
- Number badge
- Title (18px) + body (15px)

### Role Guide (2-up)

- Two large cards with color-coded top border (blue=junior, orange=senior)
- Badge, heading, divider, intro text, bullet list
- Hover: translateY(-3px)

### Conclusion (Magazine Quote, Light Paper)

- Class: `.slide slide-magazine` (same background as cover, same imprint, same paper feel)
- Inside the `.mag-box`, a `.cc-quote-block` containing:
  - `.cc-quote-text` (36px, weight 700, line-height 1.5) — the pull quote, **no surrounding `"` quotation marks**
  - `<span class="hl">` for the emphasized clause inside the quote, rendered in solid orange (no gradient)
  - `.cc-quote-attr` with author + source, separated from the quote by a 56px centered orange `::before` rule
- `.imprint` at `bottom: 140px` (identical to cover)
- The quote is the message — no CTA pill, no 3-step cards, no extra horizontal rules around the slide. Just box + quote + attribution + imprint.

Quote source format: author (line 1, weight 600) + `"essay title" · 블로그/매체 · YYYY년 M월` (line 2, muted).

## Content Rules

### McKinsey-Style Headlines

- **Kicker**: Section label or question (e.g., `Q1 · AI는 실제로 일자리를 어떻게 바꾸는가?`)
- **Title**: Conclusion-led insight, not a repeated question (e.g., `직업이 아니라, '업무'가 대체된다`)
- Each slide within the same section must have a UNIQUE headline — never repeat the section question as the title
- Every headline must pass the "So What" test

### Storytelling Flow

1. Cover → TOC → Section slides → Conclusion
2. Within sections: general overview → specific evidence → structural explanation
3. Build narrative tension: data shock → structural cause → action plan
4. Bridge between sections: add emotional transition text (e.g., "위기는 분명합니다. 하지만...")

### Korean Text Rules (MUST FOLLOW)

- **Em dash (—) is strictly forbidden anywhere in the deck.** This includes titles, kickers, body text, captions, labels, and HTML comments shown in output. Use `:`, `·`, a period, or rephrase into two sentences. Never use em dash, en dash, or double hyphens as a substitute.
- **Write natural Korean with correct subject-predicate (주술) structure.** Every sentence must have a clear subject and matching predicate. Avoid word-salad translations from English, nominalized phrases without verbs (e.g., "판을 바꾸는 전략"만 단독 배치 금지), and dangling modifiers.
- **Prioritize plain, easy-to-read Korean.** Prefer short sentences over long ones. Avoid jargon where a common word works. Read every line aloud — if it sounds awkward, rewrite it.
- **Slide headlines (`.slide-title`) prefer McKinsey-style conclusion-led endings.** Use nominalized endings (`~함`, `~임`, `~됨`) when the headline is a finding or conclusion ("코딩·추론·문서에선 선두, 생태계·단가에선 열세"). Use natural noun-ending or descriptive phrases when forcing `~함/~임` would sound stilted ("오늘 다룰 네 가지 질문", "오늘 기억할 네 가지 핵심", "Anthropic은 'anthropos(사람)'에서 출발한 인간 중심 AI 회사"). Cover/conclusion display lines and CTA-style headlines use natural sentence endings, not `~함/~임`.
- Body text, descriptions, and bullet items use presentation endings (`~합니다`, `~입니다`).
- Keep `word-break: keep-all` on all Korean text.

## Navigation

The deck supports four navigation methods. All four are required:

- **Keyboard**: `ArrowRight`/`ArrowDown` → next, `ArrowLeft`/`ArrowUp` → previous
- **Mouse click**: clicking anywhere on slide background advances to next slide. Skip selectors: `button, a, .nav-btn, .dot, .toc-row, #nav-bar, #anthro-modal, .anthro-cta` (and any other interactive overlay).
- **Mouse wheel**: scroll down → next, scroll up → previous. Throttle with a 750ms cooldown and a 30px minimum `deltaY` threshold to ignore trackpad jitter. Disable while a modal is open.
- **Nav-bar**: prev/next buttons + dot indicators (clickable to jump).

For TOC slides, add `data-target="<n>"` to each TOC row and a click handler that calls `goTo(parseInt(row.dataset.target))`. The TOC row click handler must call `e.stopPropagation()` so the global click-to-advance doesn't double-fire.

```js
// Wheel
let wheelLocked = false;
window.addEventListener('wheel', (e) => {
  if (wheelLocked || animating) return;
  if (Math.abs(e.deltaY) < 30) return;
  if (modalOpen()) return;
  wheelLocked = true;
  if (e.deltaY > 0) navigate(1); else navigate(-1);
  setTimeout(() => { wheelLocked = false; }, 750);
}, { passive: true });

// Click-to-advance
document.addEventListener('click', (e) => {
  if (animating) return;
  if (e.target.closest('button, a, .nav-btn, .dot, .toc-row, #nav-bar, #anthro-modal, .anthro-cta')) return;
  navigate(1);
});

// TOC jump
document.querySelectorAll('.toc-row[data-target]').forEach(row => {
  row.addEventListener('click', (e) => {
    e.stopPropagation();
    const t = parseInt(row.dataset.target, 10);
    if (!isNaN(t)) goTo(t);
  });
});
```

## File Structure

Output is a single self-contained `.html` file. No external dependencies except the font file.

```
output/
  <topic-slug>/
    deck.html          # Self-contained slide deck
```

## Reference Template

Use `assets/slides/claude-orientation-slides.html` as the canonical reference implementation for:
- Fixed 1440×900 canvas + JS rescale
- Magazine-style cover and conclusion (`.slide-magazine` + `.mag-box` + `.imprint`)
- Per-slide gradient variations on content slides
- McKinsey-style left-aligned headers with underlined kickers
- Paper card components with subtle gradients + hover pop-out
- Benchmark / comparison table with category tags + tooltips
- Animation system (parallel slide fade + child stagger)
- Four-method navigation (keyboard, click, wheel, nav-bar)

When generating a new deck, copy the CSS framework, navigation JS, and animation system from this reference, then adapt the slide content.
