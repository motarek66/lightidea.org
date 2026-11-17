# LightIdea Design System

The rules, tokens and components behind lightidea.org. Every value here comes from the code. When the code and this file disagree, the code wins, so update this file in the same commit.

---

## 1. Files

| File | What it holds | Used by |
|---|---|---|
| `assets/site.css` | Reset, tokens, shared components: navbar, sticky navbar, side menu, buttons, section head, panels, FAQ, form, office card, footer, announcement modal, plus every home-page section | Every page |
| `assets/site.js` | Smooth scroll (Lenis and GSAP), in-page anchors, mobile side menu, sticky navbar, copper ribbon reveal | Every page |
| `assets/pages.css` | Inner page header, service cards, static FAQ rows, office detail list, CTA band, active nav state | Inner pages |
| `assets/pages.js` | FAQ accordion, page-header intro, section reveals, footer reveal | Inner pages |
| `assets/hero-builder.js` | Home hero Builder board, drawn on a canvas | Home |
| `index.html` | Home page and its own motion script | — |
| `services.html`, `solutions.html`, `insights.html`, `about.html`, `contact.html` | Inner pages | — |

External libraries (pinned versions):

- Fonts: Google Fonts (Inter, Manrope, Geist, Onest, JetBrains Mono)
- Icons: `@phosphor-icons/web@2.1.1` (regular, bold, light)
- Smooth scroll: `lenis@1.3.11`
- Motion: `gsap@3.13.0` with ScrollTrigger and SplitText

---

## 2. Principles

1. **Copy is used word for word.** Text comes from the content documents exactly as written. Don't add, remove or reword anything, and that includes headings, button labels, form labels and meta descriptions. If a section has no source text (for example an FAQ question with no answer), show what exists and leave the gap visible. Never invent filler.
2. **One shell for every page.** Every page opens with a dark, rounded, inset panel that shares the same photo, navbar and frame gap, and every page ends with the same footer.
3. **Dark panels, light content.** Heroes, solutions, the CTA band and the footer are dark navy. Content sections sit on white or `--c-surface`.
4. **Fluid by default.** Sizes use `clamp()` so they scale between phone and wide desktop without extra breakpoints.
5. **Motion explains, never blocks.** Everything animates in once, and the page is fully usable with motion off (`prefers-reduced-motion`).

---

## 3. Color

### Brand tokens (`:root` in `site.css`)

| Token | Value | Use |
|---|---|---|
| `--c-ink` | `#102f46` | Headings (`.h2`), eyebrow text |
| `--c-navy` | `#0f2d4d` | Medium headings, card titles, form labels |
| `--c-deep` | `#03122e` | Darkest text, dark buttons, hovered icon tiles |
| `--c-text` | `#4a6382` | Body copy |
| `--c-muted` | `#5c708a` | Meta text |
| `--c-orange` | `#ef7b00` | Eyebrow dot |
| `--c-brand` | `#f2762e` | Accent dots (active nav, side menu), map pin, "NEW" badge |
| `--c-blue` | `#016ab4` | Focus ring, links on white, service-card icons, sticky-nav active link |
| `--c-blue-2` | `#0068ab` | Secondary blue |
| `--c-line` | `rgba(15,45,77,0.12)` | Hairlines on light surfaces |
| `--c-surface` | `#f5f7fa` | Light panels, service cards, form fields |
| `--c-surface-2` | `#f3f5f8` | Alternate light surface |

### Fixed colors in components

| Value | Where |
|---|---|
| `#02071a` | Dark panel background (`.panel--dark`), photo-layer base |
| `#020a1c` | Footer background |
| `#094e87` | Form `Submit` button |
| `#d5dde8` | Borders on white controls (icon buttons, secondary modal button) |
| `#7fd0ff` | Footer column headings |
| `#fafafa` / `#fff` | Text on dark panels |
| `rgba(255,255,255,0.82)` | Supporting text on dark panels |
| `rgba(255,255,255,0.62)` | Breadcrumb links on dark panels |

### Contrast rules

- White text only goes on the dark shell. On inner page headers it sits on the dark upper part of the photo.
- Body text on white uses `--c-text`; headings use `--c-ink` or `--c-navy`.
- Never set text in `--c-brand` or `--c-orange`. They are for dots and accents only.

---

## 4. Typography

### Families

| Token | Family | Use |
|---|---|---|
| `--font-inter` | Inter 300–600 | Everything by default |
| `--font-manrope` | Manrope 500–600 | Navbar links and the `Contact US` button |
| `--font-onest` | Onest 500 | Small badges (`NEW`) |
| `--font-geist` | Geist 400–500 | Reserved |
| `--font-mono` | JetBrains Mono 400 | Reserved |

### Scale

| Token / element | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Home hero `h1` (`--fs-h1`) | `clamp(38px, min(4.4vw, 7vh), 64px)` | 400 | 1.1 | -0.04em |
| Inner page `h1` | `clamp(40px, min(5vw, 8vh), 76px)` | 400 | 1.05 | -0.04em |
| `.h2` (`--fs-h2`) | `clamp(32px, min(4vw, 6.4vh), 58px)` | 400 (`.h2--medium`: 500) | 1.08 | -0.04em (medium: -0.035em) |
| `--fs-h3` | `clamp(22px, min(2.2vw, 3.8vh), 34px)` | 500 | — | — |
| Service card `h3` | `clamp(18px, 1.35vw, 20px)` | 500 | 1.3 | -0.02em |
| Lead (`--fs-lead`) | `clamp(16px, 1.25vw, 19px)` | 400 | 1.55–1.6 | — |
| Body (`--fs-body`) | `clamp(15px, 1.1vw, 16.5px)` | 400 | 1.6 | — |
| Small (`--fs-small`) | `14px` | 400–500 | — | — |
| Eyebrow | `14px` | 500 | 1.2 | 0.04em |

Rules:

- Large headings are light (400) with tight negative tracking. Use 500 only for `.h2--medium`, card titles and form titles.
- Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`.
- Keep long copy at or under `--copy-max` (62ch).

---

## 5. Layout and spacing

| Token | Value | Meaning |
|---|---|---|
| `--content-max` | `1360px` | Max content width (`.container`) |
| Navbar / header width | `1256px` | Width of the navbar and the page-header text column |
| `--page-gutter` | `clamp(16px, 2.2vw, 32px)` | Side padding inside the container |
| `--frame` | `clamp(8px, 1.25vw, 24px)` | Gap between rounded panels and the window edge |
| `--section-space` | `clamp(56px, 8vh, 96px)` | Vertical rhythm between sections |
| `--panel-pad` | `clamp(40px, 7vh, 80px)` | Vertical padding inside panels |
| `--stack-gap` | `clamp(28px, 4.5vh, 48px)` | Section head to content |
| `--card-gap` | `clamp(10px, 1vw, 16px)` | Gap between cards |

Layout primitives:

- `.container`: centred, `min(100% - 2 * gutter, 1360px)`.
- `.section`: vertical padding of `section-space / 2 + 8px`.
- `.panel`: a full-width rounded block inset by `--frame`, with `.panel--light` (`--c-surface`) and `.panel--dark` (`#02071a`) variants.

### Radius

| Token / value | Use |
|---|---|
| `--panel-radius` `clamp(16px, 1.6vw, 24px)` | Hero, page header, panels, CTA band, footer |
| `--card-radius` `clamp(14px, 1.3vw, 20px)` | Service cards |
| `24px` | Form, office card |
| `18px` | FAQ items, blog media |
| `12px` | `.btn`, icon tiles, form fields |
| `8px` | `Contact US`, modal buttons, topic chips |
| `99px` | Pills: eyebrow, `.btn--pill`, form `Submit` |

### Breakpoints

| Width | Change |
|---|---|
| `≥ 1200px` | Full navbar links. Service grid uses 4 columns. |
| `≤ 1199px` | Navbar collapses to the menu button. Service grid uses 3 columns. |
| `≤ 1099px` | Footer and contact grid use 2 columns or a single column. Values and approach cards stack. |
| `≤ 899px` | Hero stacks. Service grid uses 2 columns. Page header shades the whole photo. |
| `≤ 767px` | `Contact US` is hidden in the navbar (it's in the menu). Footer and form become 1 column. |
| `≤ 559px` | Service grid uses 1 column. |

---

## 6. Components

### 6.1 Navbar

- **Hero navbar** (`.nav`): 76px tall, inside the dark shell, with the white logo, Manrope 15/500 links and an outlined `Contact US` (1px white, 8px radius).
- **Sticky navbar** (`.sticky-nav`): white bar, 64px tall (60px on phones), with the color logo. It slides in only when the visitor scrolls up past the hero.
- **Side menu** (`.side-menu`, below 1200px): the page shrinks to the left and large links sit on dark. The current page shows an orange dot.
- **Active page:** `aria-current="page"` puts a 5px `--c-brand` dot under the hero-nav link and turns the sticky-nav link `--c-blue`.
- Link targets: `index.html`, `services.html`, `solutions.html`, `insights.html`, `about.html`, `index.html#faq` (More), `contact.html` (Contact US).

### 6.2 Home hero (`.hero`)

Full-height dark panel (`clamp(600px, 100svh - 2 × frame, 980px)`) with three photo layers (`hero-bg3.jpg`, then `hero-bg4.jpg` with `mix-blend-mode: lighten`, then a warm bottom band), the copper ribbon and the glow. Content order: NEW badge, `h1`, lead, two buttons (`.btn--light`, `.btn--ghost`), trust row.

**Builder board** (`.hero__board`, Figma 1495:30760, shown from 1100px up, where it takes the copper ribbon's place):

- A glass frame (12% white, 1px white border at 26%, 18px backdrop blur, 30px corners) around a white board with dashed light-blue ruler guides at x 38 / y 48.
- Placed in Figma units of the 1888px hero using container units (`1cqw` = 18.88px): `left 59.587cqw`, `top 13.4cqw`, `width 51.25cqw`. It bleeds off the right edge and 41px off the bottom at any hero height.
- The animation is drawn on a `<canvas>` by `assets/hero-builder.js`. It's a port of the SwarmPanel "Builder" from `Home Hero.html`: three cursors build a dashboard, a list page and an AI workflow in 680ms steps, with selection boxes and size badges, then loop.
- The animation pauses when the board is off screen or the tab is hidden. With reduced motion it shows the finished dashboard as a still.
- Below 1100px the hero stacks: copy first, then the board centred under it (up to 760px wide, `aspect-ratio: 780 / 700`), running 16–40px off the bottom edge. The canvas fits 780 design units (`--board-units`) across, so the whole artboard is visible on phones.
- The copper ribbon isn't shown in the home hero at any width; the board replaces it.

### 6.3 Inner page header (`.hero.page-hero`)

The same pattern on every inner page:

```html
<header class="hero page-hero on-dark">
  <div class="bg-layers" aria-hidden="true">…photo layers…</div>
  <nav class="nav">…</nav>
  <div class="page-hero__body">
    <ol class="crumbs">Home • Page</ol>
    <h1>Page title</h1>
    <p class="page-hero__lead">Description</p>   <!-- only when the source text has one -->
  </div>
</header>
```

- Height: `clamp(440px, 54.4svh, 580px)`, which is 544px on a 2000×1000 screen.
- Photo: the home-hero photo at full hero height, cut from the top (`.bg-layers { height: <hero height>; bottom: auto }`). This shows the dark sky with the light fan converging behind the description. There's no warm band and no overlay on desktop. On screens of 899px and below the photo fills the header and gets a light shade for legibility.
- Text column is 1256px wide, vertically centred, with more room below than above.
- Breadcrumb: 14px, separated by 4px dots, current page in white.

### 6.4 Buttons

| Class | Look | Use |
|---|---|---|
| `.btn` | 44px min height, 12px radius, 15/500 | Base |
| `.btn--light` | White fill, near-black text | Primary on dark |
| `.btn--ghost` | 1px white 50% outline | Secondary on dark |
| `.btn--pill` | White pill, `--c-ink` text | Inline section links |
| `.nav__cta` / `.sticky-nav__cta` | Outlined, 8px radius, Manrope 15/600 | `Contact US` |
| `.submit` | 50px pill, `#094e87`, white circle with arrow | Form submit |
| `.icon-btn` / `--dark` | 44–52px circle | Carousel arrows |
| `.announce .submit` / `.announce__later` | 42px, 8px radius, dark navy / white outline | Announcement modal |

Rules: one primary button per group. Button labels are copied from the content source as written.

### 6.5 Eyebrow and section head

- `.eyebrow`: a 30px pill with a 1px border and a 6px orange dot (`--blue` gives a blue dot). Only use it when the source has a label for it.
- `.section-head`: titles on the left (`.section-head__titles`) and supporting copy on the right (`.section-head__copy`, 34em max). `--center` centres it.

### 6.6 Service card (`.svc-card`, Services page)

- Grid `.svc-grid`: the heading block `.svc-grid__head` spans 2 cells, so heading plus 14 cards fills 4 columns exactly. It spans 1 cell at 3 columns and a full row at 2 columns, and the grid is 1 column on phones.
- Card: `--c-surface` background, `--card-radius`, minimum height 260px, with a 48px white icon tile (Phosphor regular, `--c-blue`) above the `h3` and description.
- Hover: white background, `#dbe3ee` border, lifted 4px with a soft shadow, and the icon tile turns `--c-deep` with white.

### 6.7 FAQ (`.faq`)

- Two columns: an intro (sticky at 900px and up) and a list.
- `.faq-item`: 18px radius with a 1px border. The open item uses a radial navy gradient and white answer text.
- `.faq-item--static`: a question with no answer in the source. It has no button and no icon, and it can't be opened.

### 6.8 Contact (`.contact__grid`)

- **Office card** (`.office`): dark photo with the region map and an orange pin. `.office__card--list` lists label/value pairs (`HEADQUARTERS`, `GLOBAL OFFICES`, `EMAIL`) as frosted glass.
- **Form** (`.form`): white, 24px radius, 2-column field grid, 50px fields on `--c-surface` that turn white with a blue border on focus. Labels use the source text exactly.

### 6.9 CTA band (`.cta-band`)

A dark rounded panel with the hero photo under a 35% navy shade and centred content: `.h2` heading, lead and a `.btn--light` button.

### 6.10 Footer (`.footer`)

A dark rounded panel with 4 columns (about, SOLUTIONS, COMPANY, GLOBAL PRESENCE). Column headings are 13px, `#7fd0ff`, with 0.1em tracking. The bottom bar holds the copyright and legal links.

### 6.11 Announcement modal (`.announce`, home only)

- Desktop: 880×560, image on the left (420×540) and content on the right. Below 760px it's a single column.
- Shows once per visitor (localStorage key `li-announce-sanade-v1`). `?announce=1` forces it to open.
- Buttons are 42px with an 8px radius, a dark navy primary, and no icons.

---

## 7. Icons

- Set: Phosphor 2.1.1 via `<i class="ph ph-NAME">` (regular), `ph-bold`, `ph-light`.
- Size by `font-size`: 16–18px inline, 20–24px in tiles.
- Icons are decoration. They never replace or add to source text.

---

## 8. Motion

| Token | Value |
|---|---|
| `--motion-fast` | `0.35s` |
| `--motion-medium` | `0.7s` |
| `--motion-slow` | `1s` |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` (≈ GSAP `power3.out`) |
| `--ease-soft` | `cubic-bezier(0.16, 1, 0.3, 1)` |

Patterns:

- **Page intro:** the shell scales in from 0.96–0.97, then the logo, nav links, breadcrumb, title words (SplitText, with blur and a slide up) and lead, staggered.
- **Scroll reveal:** opacity 0, 24–40px down and 6–12px blur, animated in once per element (`ScrollTrigger once: true`) with a 0.05–0.1s stagger.
- **Footer:** a clip-path wipe up, then the columns stagger in.
- **Hover:** 0.3–0.35s with `--ease-out`.
- **Copper ribbon:** 2.2s blur-in, then a slow 24s drift and a 9s glint.
- **Smooth scroll:** Lenis (duration 1.1), driven by the GSAP ticker.
- **Reduced motion:** the `motion` class is never added, all reveals are skipped and content renders static.
- **First paint:** `html.motion-pending` hides elements that will animate. A 3-second safety timer always removes it.

---

## 9. Adding a new inner page

1. Copy an existing inner page (for example `contact.html`).
2. Change `<title>`, the meta description, the breadcrumb label and `h1`. Use the source text for each, and leave the description out when the source has none.
3. Move `aria-current="page"` to the right link in the hero navbar and sticky navbar, and `aria-current="true"` in the side menu.
4. Put sections inside `<main id="content">` using the components above.
5. Keep the script order: Lenis, GSAP, ScrollTrigger, SplitText, `assets/site.js`, `assets/pages.js`.
6. Check the copy against the source document word by word before you publish.
