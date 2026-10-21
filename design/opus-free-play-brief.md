# Auris Docta — three Free Play design options

Create three polished, working visual alternatives for the **Free play page only**. I will choose one as the future visual direction for the whole app. This is a design exploration; do not apply a winner elsewhere.

## Context and reading budget

Auris Docta is my personal piano ear-training web app. Free play already works. Primary device: iPhone Safari in landscape; secondary: Windows laptop. React, TypeScript, Vite, plain CSS, native Web Audio. No backend.

This brief supplies the task context. Follow applicable AGENTS.md instructions, but **for this task skip its documentation-reading requirement: do not open `/docs`, archives, or the Google Doc**. Do not scan the repository. Start with only:

- `src/App.tsx` — hash navigation and shared header/footer.
- `src/styles.css` — current global styles.
- `src/piano/FreePlay.tsx` — working screen, controls, and audio lifecycle.
- `src/piano/piano.css` — current piano and responsive styles.
- `src/piano/PianoKeyboard.tsx` — shared interactive keyboard; preserve its behavior.

Read `package.json` for commands if needed. Open another source file only to resolve a concrete blocker. Work from this folder containing both `.git` and `package.json`; the parent is only a container, not another app.

## Visual brief

**Minimal, quiet, precise, and personal. The piano is the main object.** Keep as little on screen as practical while making it easy to play.

- Remove the normal top navigation from the prototypes. The sole app-navigation control is a compact **logo + Auris Docta** link home. No subtitle, navigation tabs, early-preview badge, header band, or footer.
- Remove promotional copy, inspirational phrases, decorative illustrations, and oversized headings. A small Free play label is optional. Blank space should serve the composition, not reserve a large hero area.
- Use mostly neutral surfaces and at most one restrained accent per option. Reserve accent for interaction and meaningful state. No rainbow palette, decorative gradients, glass effects, or dashboard cards.
- Give the page character through typography, proportions, spacing, alignment, and control design. Avoid making everything tiny or low-contrast to achieve minimalism.
- Piano keys must remain immediately recognizable, with accurate geometry. Restrained depth is welcome where it helps the keys feel playable. Held keys and released-but-sustaining keys need distinct, legible states.
- Keep sustain and Stop sound directly accessible. Volume and note-label settings may be compactly grouped or disclosed; avoid a maze of menus. Use accessible names for icon controls. Keep help and piano credits reachable without permanent explanatory text.
- Show one clear Enable piano action before audio is ready, loading progress while loading, and actionable retry/resume when needed. Once ready, avoid redundant status text. A compact live note/chord readout is optional; do not replace empty space with a slogan.

Make **three genuinely distinct compositions**, not one layout with three colors. Suggested starting directions, with freedom to improve them:

1. **Warm editorial:** warm white, ink, subtle muted accent; expressive but restrained typography.
2. **Cool precision:** cool neutrals, crisp typography, exact alignment, compact instrument controls.
3. **Dark studio:** charcoal surroundings, clear ivory/black keys, restrained illuminated states.

Each should feel like a convincing finished product. Explore different hierarchy, spacing, and control placement within the shared requirements. Choose one coherent type system per option; avoid new font downloads and dependencies. Expose a few scoped CSS variables for palette, typography, spacing, and radii so the chosen direction can later extend to other screens.

## Preserve the working instrument

- Reuse the existing audio engine, state, and keyboard component across all three options. Do not duplicate the instrument logic or change audio/music modules, sample assets, input handling, storage behavior, or pitch layout calculations.
- Desktop: all 88 keys, A0–C8, without horizontal scrolling. A narrow mouse-operated window remains desktop.
- Mobile detection stays `(pointer: coarse) and (max-width: 1200px)`. Starting range is B3–C6, with octave arrows and the existing bounds. No drag-to-scroll keyboard.
- Preserve multitouch chords, finger gliding, hardware keyboard mapping, sustain, volume, note labels, Escape/Stop sound, loading/retry/resume, and interruption/unmount cleanup.
- Preserve the mobile key-height rule: 48dvh, minimum 110px, maximum 250px. In landscape, the piano and essential controls must fit without page scrolling, including at 568×320 and 844×390. Account for Safari chrome and safe areas. Keep non-key touch controls at least 44×44 CSS px.
- Portrait mobile keeps a simple rotate-to-landscape message and the home link. Preferences survive rotation. Preserve visible keyboard focus and accessible control states; respect reduced motion.
- Retain the existing piano credits/license link. Do not add practice, recording, metronome, instrument selection, or other new features.

## Delivery and validation

Implement three separately addressable prototype URLs, preferably `#/design/a`, `#/design/b`, and `#/design/c`, using a shared screen with scoped visual variants. Keep existing routes and their appearance intact. Scope prototype styles, including page background, so they cannot leak into the homepage or original Free play. The home link must lead to `#/home` and leaving a prototype must still clean up audio.

Do not commit, push, deploy, rewrite documentation, add dependencies, or produce a long planning document. Spend the effort on the three designs.

Run `npm test` and `npm run build` once after implementation; fix failures. If browser tools are available, inspect all three at desktop and phone landscape sizes, check portrait, and briefly exercise sound enable and controls. If tools are unavailable, report that limitation. Never claim emulation is a real iPhone test.

Finish with the three preview URLs, one sentence describing each direction, and a concise validation result. I will choose the design; do not merge the options or select a winner for me.
