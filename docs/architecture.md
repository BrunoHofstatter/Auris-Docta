# Architecture and implementation status

## Product constraints

The app trains practical transcription by ear. The primary device is an iPhone using Safari; Windows laptop use is supported. The agreed delivery is a responsive client-side web app, with PWA installation/offline support later. The initial product has no backend, authentication, AI runtime dependency, microphone transcription, or MIDI input.

The original [Drive specification](https://docs.google.com/document/d/1wyQmN2cOXtfLRFFy2uItYIpH8JgFTqWFJunVlW2kdfE/edit?usp=drivesdk) supplies the incremental build order. The subsequent format decisions are recorded in [music-format.md](music-format.md).

## Stack decisions

| Concern | Decision and purpose |
| --- | --- |
| Language | Strict TypeScript for shared contracts and errors caught during the build |
| UI | React for the interactive keyboard, answer editor, and future practice workflow |
| Build | Vite for a static browser app with relative asset paths |
| Styling | Plain CSS, responsive layouts, native links, no component-library dependency |
| Navigation | Hash routes for static hosting, browser history, and refreshable URLs |
| Runtime schema | Zod; one strict schema validates input and supplies the source types |
| Musical time | Exact BigInt fractions; tempo-map conversion to seconds at the boundary |
| Tests | Vitest for the musical invariants and invalid-data cases |
| Audio | Native Web Audio with independent sampled voices and native-clock scheduling |

Step 2 uses a pinned Salamander piano sample distribution with retained attribution. Native Web Audio was selected for direct per-voice control, particularly repeated notes under sustain. No additional audio-library dependency was needed. Final hosting is not selected.

## Module boundaries

`src/App.tsx` and `src/styles.css` own the app shell and homepage. `src/piano/` owns the playable keyboard and Free play screen. Practice remains a preview. No sample solution or source note data is rendered in the homepage; its piano illustration is decorative.

`src/music/model.ts` owns the versioned source document and validation. `time.ts` owns exact musical time and the shared tempo clock. `pitch.ts` owns sounding pitch and spelling. `timeline.ts` derives scheduled notes, strength/hand defaults, sustain events, and solution pitches. These modules are pure; they do not start audio or depend on React.

Future generators and imports must return a validated `MusicDocument`. Audio and the piano roll consume the shared timeline rather than developing separate interpretations of musical time. Manual answers remain separate ordered pitch groups; source duration and instrument are not grading requirements. Solution data must only enter the visible practice view after an explicit reveal/submission.

Persistence, sessions, attempts, favorites, statistics, batch envelopes, export merges, and PWA caches are separate future modules. The musical document does not predefine those storage formats.

## Step 1 acceptance

- The app builds and offers responsive homepage/navigation.
- The documented example passes the actual shared validator.
- Concurrent instruments and both piano hands can be represented.
- Independent overlapping notes, fractional timing, step tempo changes, optional strength, and instrument sustain are represented.
- Answers reference notes rather than duplicate their pitches. Arpeggios can remain one answer, repeated notes remain separate groups, and doubled pitches collapse within a group.
- Invalid references, duplicate identities, malformed timing, unknown fields, and unsupported versions produce validation errors.
- Unit tests and TypeScript/production build pass. Browser navigation, history, unknown-route behavior, and layout have been checked at desktop and mobile widths.

## Step 2 — implemented; device acceptance pending

The permanent Free play screen and piano sound engine are implemented. See [free-play.md](free-play.md) for the exact behavior, keyboard map, sample attribution, resource considerations, and checks performed. The mobile keyboard uses approximately half the landscape viewport height and starts at B3–C6, with arrows rather than scrolling. Desktop uses all 88 keys.

`src/audio/PianoEngine.ts` loads local samples and controls independent note voices. `playback.ts` resolves document-level sustain against the shared music timeline before scheduling source nodes against the native audio clock. This is independent of the live-input keyboard component. `scripts/fetch-piano-samples.mjs` and the public manifest make the asset distribution reproducible.

Remaining acceptance on the actual iPhone includes initial gesture unlock, latency, multitouch, sample memory, Safari browser chrome/safe areas, backgrounding, screen lock, and audio interruption/recovery. Edge audio and mobile-emulation checks are passed; Windows WebKit was used for layout/error handling only because it exposes no Web Audio API.

The format supports multiple pitched instruments structurally; only sounds actually installed by the audio engine may be played. Additional instruments remain the later product step. Real-device audio checks are necessary before calling Free play complete.
