# Auris Docta

A personal, phone-first piano ear-training app. Primary target: iPhone Safari; also support the Windows laptop.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For static production output:

```sh
npm run build
npm run preview
```

The generated `dist/` directory can be served by a static host. Hash navigation works without server-side route rewrites and the build uses relative asset paths, including piano samples.

## Publish with GitHub Pages

The repository includes `.github/workflows/deploy.yml`. It installs dependencies, runs the tests, builds the app, and publishes only `dist/` whenever changes are pushed to `main`. It can also be started manually from the Actions tab.

1. Ensure these app files, including `package.json`, `src/`, `public/`, and `.github/`, are inside the Git checkout. Creating or cloning a repository in a separate folder does not automatically include files from its parent folder.
2. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Commit the app and workflow, then push to `main` (in GitHub Desktop: **Commit to main**, then **Push origin**).
4. Wait for **Deploy Auris Docta to GitHub Pages** in the Actions tab to finish successfully, then use the site link shown under Settings → Pages.

For this repository, the expected address is https://brunohofstatter.github.io/Auris-Docta/ after deployment succeeds.

There is no `npm run deploy` script in this project. npm only runs commands defined under `scripts` in `package.json`; GitHub Actions handles deployment instead. Selecting `main` under **Deploy from a branch** does not run Vite's build. Do not upload `node_modules/` or commit `dist/`; the workflow creates the production files on GitHub. After setup, commit and push future changes to update the website.

## Step 1 — complete

- React + TypeScript + Vite app with plain CSS and a responsive home screen.
- Home, Free play, and Practice routes, including browser history, active navigation, an unknown-route fallback, and keyboard focus handling.
- The agreed version 1 music format, runtime validation, exact musical-time arithmetic, pitch normalization, timeline projection, and derived solution groups.
- Tests for timing, tempo changes, chords/arpeggios, concurrent instruments, sustain data, strength defaults, references, invalid data, and pitch identity.

## Step 2 — implemented; real iPhone acceptance pending

- Playable acoustic piano in the selected Dark studio design at `#/free-play`: the full 88 keys on desktop; a mobile B3–C6 starting window with octave chevrons.
- Mobile keys use roughly half the landscape height. Portrait shows the rotation prompt and preserves preferences.
- Independent multitouch/mouse notes, gliding, computer-keyboard chords, optional note names, volume, sustain, and Stop sound.
- Native Web Audio engine with individually controlled voices, gesture-based startup, progress, errors/retry, interruption handling, and audio-clock sequence scheduling.
- Thirty bundled Salamander piano samples (about 1.92 MiB) with attribution and a reproducible download manifest.

Free play and built-in practice are playable. Real iPhone Safari latency, audio interruptions, and hardware touch behavior still require device acceptance.

## Basic practice — implemented

Open `#/practice` to configure mixed single notes, octaves, random pairs, and ten individually selectable chord qualities. Setup includes numbered octaves, major/natural-minor keys or None, BPM, Items/Seconds, successive speeds/direction, inversions, and full-sequence/step-by-step modes. The last setup is remembered locally.

The Dark studio workspace provides playback, replay, pause, seeking, speed and item-range loops; a silent answer piano and an independent sound-piano mode; typed notes; numbered answer-group editing with right-click/long-press Insert before/Delete and Undo; and explicit solution reveal. Submission shows a Synthesia-style falling-note correction over the full 88-key piano, including mobile landscape, with green/yellow source notes and striped red wrong answers, pitch labels, note inspection, synchronized seeking, and fullscreen. Wrong step-by-step checks stay on the item without revealing pitches; correct checks wait for Next.

Exercise/answer state survives rotation, audio interruptions, and visits to setup within the current page. Refreshing/leaving Practice discards the active exercise and attempts. Durable history, favorites, statistics, import, additional instruments, and PWA installation/offline caching remain later work.

## Documentation and examples

- [Documentation index](docs/README.md): start here; the local Markdown files now contain the complete project documentation.
- [Product overview](docs/product-overview.md), [build plan](docs/build-plan.md), and [implementation status](docs/implementation-status.md): goals, all planned steps, and what is actually built.
- [Music format v1](docs/music-format.md): the agreed contract, readable JSON examples, timing, instruments/parts, strength, sustain, answer groups, defaults, and limits.
- [Architecture and build status](docs/architecture.md): module boundaries, decisions, and next-step checks.
- [Free play and audio](docs/free-play.md): implemented behavior, keyboard mapping, sample provenance, validation, and remaining iPhone checks.
- [Dark studio design guide](design/design-guide.md): the selected Home and Free play appearance, design tokens, and component styles.
- [C-major example](examples/c-major-scale.json): ascending scale and final chord.
- [Deployment documentation](docs/deployment.md): the configured Pages workflow and choosing the actual Git checkout.
- [Google Docs source archive](docs/archive/google-docs-2026-10-21.md): the complete original planning text, retained as historical provenance.

All ten Google Docs tabs are now represented in separate topic files under `docs/`. Maintain the local Markdown going forward; the archive preserves the older wording while current specifications include the later format and Free play decisions. [AGENTS.md](AGENTS.md) gives a brief project overview and documentation map for coding agents.

## Checks

```sh
npm test
npm run build
```

For optional Edge browser checks, start the dev server and run `node scripts/check-free-play.cjs`, `node scripts/check-practice.cjs`, and `node scripts/check-correction.cjs` with an existing Playwright installation available. `PLAYWRIGHT_MODULE` can point to that installation's module path, and `APP_URL` can override the default `http://127.0.0.1:5173`. The scripts write screenshots into ignored `artifacts/`.

Unit tests cover both the musical model and the piano engine. Browser checks have verified actual Web Audio output in Edge, three-finger chords with independent release, sustain/retrigger, controls, octave limits, orientation, and landscape layouts down to 568×320. Windows WebKit layout and unsupported-audio handling were checked separately; that test build has no Web Audio implementation. No real iPhone test is claimed.

## Technical choices

React manages the interface; TypeScript supplies shared types; Vite handles development and static builds. Zod supplies one strict runtime schema from which the source-document TypeScript types are inferred. Pure music modules have no React or browser-audio dependency. The lockfile records the installed versions.

No backend, account system, cloud database, or paid API is needed for the initial product. Free play preferences are stored locally. Session persistence, manual transfer, and installation/offline support remain later steps. The UI currently loads optional Google Fonts with local serif/sans-serif fallbacks; offline font packaging belongs with offline assets.
