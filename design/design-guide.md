# Auris Docta design guide: "Dark studio"

This guide describes the **Dark studio** visual direction used by Home (`#/home`) and Free play (`#/free-play`), originally selected as Design C. It records their appearance, design tokens, and component styles for reuse.

- **Source of truth:** [`src/piano/free-play.css`](../src/piano/free-play.css) (the `.studio` scope and its components), [`src/piano/FreePlay.tsx`](../src/piano/FreePlay.tsx), and [`src/piano/piano.css`](../src/piano/piano.css) (shared keyboard geometry).
- **Home composition:** [`src/Home.tsx`](../src/Home.tsx) and [`src/home.css`](../src/home.css); shared brand and decorative illustration in `src/components/`.
- **Status:** Bruno picked this direction, and Home and Free play now use it as their normal interface. Practice remains the earlier preview design. Real iPhone acceptance is still pending.
- The code records the implemented design details.

---

## 1. The idea in one paragraph

A quiet, dark room with a piano in it. Charcoal surroundings fade away, with ivory keys in a dark case. Amber highlights the held notes, sustain lamp, live readout, focus, and loading progress. The text is ivory on charcoal, set in one sans-serif with wide letter-spacing for small uppercase labels. The controls feel like pieces of studio hardware: a round icon button, a pill-shaped pedal, a square stop button.

## 2. Visual principles

1. **Neutral surfaces.** Charcoal surfaces, ivory ink, muted warm grey for secondary text.
2. **Character from proportion and type.** Generous spacing, small uppercase labels with wide letter-spacing, and restrained depth (soft shadow, inner top highlight). Don't make text tiny or low-contrast to look minimal.
3. **Touch accessibility.** Every non-key touch control is at least 44×44 CSS px. Respect safe areas and `prefers-reduced-motion`.

## 3. Design tokens

All tokens are CSS custom properties defined on the scope class (currently `.studio`). Reuse these exact values.

### Colour

| Token | Value | Use |
|---|---|---|
| `--studio-bg` | `#141414` | Page background (also set on `html` while the screen is mounted) |
| `--studio-surface` | `#1d1d1d` | Buttons, cheek blocks, pedal at rest |
| `--studio-raised` | `#262626` | Hover/pressed surface, selected segment |
| `--studio-ink` | `#ece7dc` | Primary text and icons (warm ivory) |
| `--studio-muted` | `#a09a8f` | Secondary text, row labels, help copy |
| `--studio-line` | `#323232` | 1px borders and separators |
| `--studio-accent` | `#f2a541` | Amber highlights in Free play |
| `--studio-accent-soft` | `rgba(242,165,65,.16)` | Faint amber wash (rarely needed) |
| `--studio-focus` | `#f2a541` | Focus outline |
| `--studio-pop-bg` | `#1f1f1f` | Popover background |
| case background | `#0e0e0e` | The dark case around the main object |
| hover border | `#4a4a4a` | Border on hover / expanded |

Set `color-scheme: dark` on the scope so native controls and scrollbars match.

### Typography

- **One family:** `'DM Sans', system-ui, sans-serif` (`--studio-font-ui`). It is already loaded by `src/styles.css`. Don't add font downloads. Don't use Playfair Display in this direction.
- Base body: 14px / 1.4.
- **Brand:** 15px, weight 500, letter-spacing .02em (`--studio-brand-*`); logo 22px. On touch: 14px text, 20px logo.
- **Labels and control text:** 11–12px, weight 500, `text-transform: uppercase`, letter-spacing .14–.16em. This is the signature detail.
- **Live readout:** amber, 22px, weight 500, letter-spacing .16em, `text-shadow: 0 0 16px rgba(242,165,65,.38)`; on touch 16px, .12em. Don't uppercase musical names (would break `Db`).
- Numbers that change: `font-variant-numeric: tabular-nums` (`.studio-num`).

### Spacing, radii, depth

| Token | Value |
|---|---|
| `--studio-space-1..4` | `6px`, `12px`, `24px`, `40px` |
| `--studio-gutter` / `--studio-gutter-y` | `40px` / `24px` desktop; `12px` / `6px` touch (always combined with `env(safe-area-inset-*)` via `max()`) |
| `--studio-radius-s` | `10px` (square-ish buttons, cheek blocks, segments) |
| `--studio-radius-m` | `14px` (case, popover) |
| `--studio-radius-pill` | `999px` (pedal, primary action) |
| Case shadow | `inset 0 1px 0 #272727, 0 40px 60px -40px #000` |
| Popover shadow | `0 24px 50px -18px rgba(0,0,0,.85)` |
| Disabled | `opacity: .4` |

Motion: only short colour/glow transitions (~120ms) on lamps and progress. Everything is disabled under `prefers-reduced-motion: reduce`.

## 4. Free play layout reference

### Desktop (fine pointer)

Free play uses a 3-column CSS grid that fills the viewport (`min-height: 100dvh`):

```
grid-template-columns: auto 1fr auto;
grid-template-rows:    auto 1fr auto auto auto 1fr;
grid-template-areas:
  'brand .     end'     ← logo link left, round icon buttons right
  '.     .     .'       ← flexible space (1fr)
  'read  read  read'    ← illuminated readout, centred
  'board board board'   ← the piano in its case
  'pedal pedal pedal'   ← Sustain and Stop, centred
  '.     .     .';      ← flexible space (1fr)
```

The equal `1fr` rows above and below centre the piano vertically. Readout: `min-height: 64px` with 18px below. Pedal row: 22px above.

### Touch landscape (`(pointer: coarse) and (max-width: 1200px)`)

The Free play layout collapses to three rows to fit at 568×320 and 844×390:

```
grid-template-rows:  auto 1fr auto;
grid-template-areas: 'brand read end' 'board board board' 'pedal pedal pedal';
```

The readout moves between the brand and icons (truncated with ellipsis). Octave arrows sit on the sides of the piano as tall 44px-wide "cheek blocks".

## 5. Components

Class names below are the current component names. Keep the same structure and values when you reuse them.

| Component | Recipe |
|---|---|
| **Brand link** (`.studio-brand`) | `<a href="#/home" aria-label="Auris Docta home">` + arch logo SVG (`currentColor`, ivory) + "Auris Docta". Shared by Home and Free play through `src/components/StudioBrand.tsx`. Min height 44px. |
| **Round icon button** (`.studio-icon-button`) | 44×44, `border-radius: 50%`, 1px `--studio-line` border, transparent background, ivory icon. Hover/expanded: border `#4a4a4a`, background `--studio-raised`. Needs an `aria-label`. Used for Settings (sliders icon) and Help ("?"). |
| **Popover** (`Disclosure` + `.studio-pop-panel`) | Opens below its trigger, aligned right; width `min(330px, 100vw − 24px)`; scrolls inside if taller than the viewport. `--studio-pop-bg`, 1px line, radius 14, padding 16. Closes on outside press or Escape (focus returns to the trigger). `aria-expanded` / `aria-controls` on the trigger. |
| **Settings row** (`.studio-settings-row`) | Label left (11px, uppercase, .14em, muted) / control right, 12px gap. Rows stack with 12px gap. |
| **Pedal button** (`.studio-sustain`), the primary toggle | Pill, min 210×48 (touch 170×44), surface background, 1px line, 12px uppercase .16em text, 8px **lamp** dot on the left (`#3a3a3a` with 1px `#4d4d4d` ring). On (`aria-pressed="true"`): border `rgba(242,165,65,.55)`, background `#221f19`, lamp amber with glow `0 0 10px 1px rgba(242,165,65,.7)`. |
| **Stop / secondary action** (`.studio-stop`) | Same height and text style as the pedal; radius 10; 14px square icon + short word. If the visible word is shorter, it goes in `aria-label` ("Stop sound"). |
| **Primary "enable" action** (`.studio-enable` in C) | Ivory pill (`background: --studio-ink`, text `#141414`, 600 14px), 48px high (44 touch), small glowing amber lamp dot before the label, hover `#fff`. |
| **Gate overlay** (`.studio-gate-overlay`) | Before the piano is ready, an overlay of `rgba(12,12,12,.64)` (no blur) contains the centred enable action. While loading, it shows "Loading piano NN%" (13px, .08em) + a 200×2px progress line (track `#3a3a3a`, fill amber). Errors appear in muted text with a Retry button. The overlay disappears once ready, with no "ready" message. |
| **Segmented control** (`.studio-seg`) | Track `#151515`, 1px line, radius 10, 2px padding; segments min 66×44, muted text; selected = `--studio-raised` background + ivory text. Each segment is a button with `aria-pressed`. |
| **Slider** (`.studio-volume`) | 44px-high hit area, 2px track `#3a3a3a`, amber fill up to the value (`--studio-fill`), 16px ivory round thumb, tabular value in muted 12px. |
| **Cheek block** (`.studio-octave-side`) | 44px wide, stretches to the full height of the case, radius 10, surface background, 1px line, ivory chevron. Disabled at the limits (opacity .3). |
| **Live readout** (`.studio-readout` in C) | Amber, glowing, centred, single line, ellipsis. Empty when no notes are held. |

### The case and the keys (when a piano appears)

- Case: `#0e0e0e`, padding `14px 12px 12px` (touch `7px 6px 6px`), radius 14 (touch 10), case shadow above. Inside, a 10px top shadow `linear-gradient(rgba(0,0,0,.45), transparent)` with `pointer-events: none` suggests the key bed.
- Desktop key height: `clamp(150px, min(14vw, 42vh), 300px)`. Touch keeps the app rule: `48dvh`, min 110px, max 250px.
- White keys: `linear-gradient(#d9d3c6, #f4f0e6 9%, #f4f0e6 91%, #e6e0d3)`, 1px `#a8a194` sides, radius 4 at the bottom.
- Black keys: `linear-gradient(#2e2e2e, #0d0d0d 76%)`, 1px black edge, 7px black front lip, radius 3.
- **Held:** white `linear-gradient(#e2c9a0, #f9e1b6 30%, #ffd08a)` + `inset 0 -5px 0 #f2a541`; black `linear-gradient(#6b4612, #c9862c 82%)` with a shorter 4px lip `#8f5c18` (it looks pressed).
- **Sustaining (released, still sounding):** white `linear-gradient(#ddd4c2, #f6eedf 12%)` + only a thin bar `inset 0 -3px 0 rgba(242,165,65,.85)`; black `linear-gradient(#2e2617, #15110b 76%)` with an amber-brown lip `#8a5a1c`.
- Labels: white-key `#8b8579`, black-key `#8f8a80`; on held keys `#6a3f05` / `#1c1406`.
- Always reuse `PianoKeyboard` and the shared instrument hook ([`useFreePlayInstrument.ts`](../src/piano/useFreePlayInstrument.ts)). Change only the styling, never the geometry or input handling.

## 6. Implementation notes for agents

- **Scoping.** All Dark studio CSS must stay inside a scope class so it can't leak into other pages, and the page background is set on `html` only while the screen is mounted (`document.documentElement.dataset.theme = 'studio'` with cleanup on unmount, and `html[data-theme='studio'] { background: #141414; color-scheme: dark; }`).
- **Style boundaries.** `src/styles.css` supplies global defaults and the legacy Practice preview shell. The `.studio` scope resets heading and paragraph defaults. `src/piano/piano.css` supplies keyboard geometry and pointer styles; `src/piano/free-play.css` supplies the shared Dark studio tokens and Free play appearance. `src/home.css` keeps Home's composition and decorative illustration changes inside `.home-studio`.
- **Accessibility.** Keep a real `h1` (it can be visually hidden), `aria-pressed` on toggles, `aria-expanded` on popover triggers, `role="status"`/`progressbar` while loading, `role="alert"` on errors, and a visible amber focus outline (`outline: 2px solid var(--studio-focus)`).
- **Docs.** When a screen adopts this design, update the relevant docs (`docs/architecture.md`, `docs/implementation-status.md`). Emulator checks are not iPhone acceptance tests; say which you did.

## 7. Home layout

Home uses the same brand and tokens as Free play, with the existing decorative piano-roll illustration recolored in charcoal, ivory, and amber. On desktop the illustration sits on the left and a short, vertically centered menu sits on the right. The only visible menu text is **Free play** and **Practice**; there are no captions, introductory paragraphs, status badges, duplicated navigation, or footer. A visually hidden `h1` and labeled navigation preserve the page structure for assistive technology. Practice links to its existing preview, where its unavailable status remains explicit.

The menu uses 54px-high pill links: ivory with an amber lamp for Free play, and a charcoal surface with an ivory label for Practice. Home starts no audio and its illustration is non-interactive. Portrait phones stack the illustration above the menu; short landscape screens keep two compact columns. Both layouts respect safe areas and keep the actions at least 44px high.
