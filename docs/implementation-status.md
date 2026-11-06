# Implementation status

Last updated: November 4, 2026.

## Delivered

| Area | Current state | Details |
| --- | --- | --- |
| Step 1 foundations | Complete | React/TypeScript/Vite app, responsive homepage, hash navigation/history/fallback, strict shared music model, exact timing, validation, and derived source groups |
| Step 2 Free play | Implemented; real iPhone acceptance pending | Full desktop piano; mobile B3–C6 starting range and octave arrows; multitouch/mouse/keyboard playing; sustain, volume, labels, local preferences, loading/retry, and interruption cleanup |
| Visual design | Dark studio applied to Home, Free play, and Practice | Portrait-friendly setup/chord configuration; focused landscape phone workspace; edge-to-edge falling-note review. Home and Free play retain their selected design. |
| Step 3 generator/setup | Implemented; physical iPhone acceptance pending | Mixed categories, ten selectable qualities, major/natural-minor/None, strict key/range validation, category-first probabilities, Items/Seconds, BPM, inversions, exact successive spreads/direction, local setup preferences |
| Step 4 answer editing | Implemented; physical iPhone acceptance pending | Silent key taps, typed notes, sound-piano switch, numbered group selection, right-click/long-press Insert before/Delete with Undo, offscreen selections, empty-group handling |
| Step 5 feedback | Implemented as falling notes/aligned correction | Full 88-key piano on desktop/mobile landscape, green/yellow source bars, striped red answer bars with ×, pitch labels/inspection, source durations, group boundaries, audio-clock seeking, native/in-page fullscreen |
| Step 6 basic workflow | Implemented for disposable exercises | Full sequence and step-by-step, wrong-answer retry, current-item reveal, correct-check Next/Finish, Try again/New exercise, playback pause/replay/seek/speed/item-range loops |
| Audio | Implemented for acoustic piano | Native Web Audio, independent note instances, 30 bundled Salamander samples, native-clock sequence playback/cancellation, tempo maps and instrument-specific sustain |
| Documentation | Migrated and reconciled | All ten Google Docs tabs represented locally, original text archived, format/Free play/architecture current |
| Deployment setup | Workflow configured | `.github/workflows/deploy.yml` tests, builds, and deploys `dist/`; successful live deployment is not established by this audit |

See [architecture.md](architecture.md), [music-format.md](music-format.md), [free-play.md](free-play.md), and [deployment.md](deployment.md) for implementation details.

The model can represent concurrent pitched instruments and separate piano hands. The installed sound engine only plays `acoustic-grand-piano` in A0–C8. Representing another sound is not the same as installing its samples or adding a selector.

The model/parser, generator, answer editor, checker, alignment, grading UI, and practice playback are implemented. A paste/import screen and contextual import warnings remain later work. Source pitches stay hidden until submission/reveal, including keyboard highlights and readouts. Attempts are disposable, and Try again after review is marked Solution viewed. Loops reschedule at boundaries and are not guaranteed gapless. Falling notes automatically follow the source playback clock and seeking, including while paused. Red answer notes are silent and use illustrative timing; no performance rhythm is graded. Existing alignment is retained; refinements for ambiguous cases remain deferred.

## Not implemented

- Steps 7–9 richer generators, import UI/batches, and AI generation instructions.
- Step 10 final menus/settings beyond the current homepage/navigation and Free play preferences.
- Step 11 additional timbres and independently selectable exploratory-piano sound.
- Step 12 sessions, distinct attempts, favorites/folders, tags/filters, and customizable statistics.
- Step 13 session export/import and merge rules.
- Step 14 installable PWA/service-worker/offline guarantees.

Practice is available at `#/practice`. Leaving/reloading it discards the active exercise and attempts; only setup/audio preferences persist. There is no durable exercise history, database, authentication, cloud sync, live AI connection, microphone transcription, or MIDI input.

## Verification

The November 4 correction rework passed **92 unit tests in four files** and the TypeScript/production build. The existing practice browser script passes. `scripts/check-correction.cjs` additionally verifies full 88-key rendering, green/yellow and striped red bars with pitch labels, forward/backward seeking, note inspection, source-only audio, native fullscreen/browser exit, simulated fullscreen rejection with in-page fallback/Escape, preserved position, and viewport fit at 1366×900, 844×390, and 568×320. Edge screenshots of normal and fullscreen correction were visually reviewed. These are Windows Edge and mobile-emulation checks; physical iPhone acceptance remains pending.

On November 4, 2026, basic practice passed **89 unit tests in three files** and the TypeScript/production build. New tests cover generator eligibility and octave boundaries, natural-minor/key exceptions, category probabilities, exact successive timing, duration rounding, repeated notes, typed/enharmonic answers, partial chords, inserted/missing sequence groups, seek offsets/speed, and independence of live/source audio. Edge checks exercise setup/chord configuration, invalid settings, audible generated playback, hidden source pitches, silent/no-drag answers, auditioning, typed entry, group insert/delete/Undo, submission/review, seeking, half-speed item-range loops, step reveal/correct-check transitions, rotation/state preservation, offscreen labels, touch long-press, and layouts at 844×390 and 568×320. The Free play regression script also passes, including audible PCM and independent multitouch. Screenshots were visually reviewed. Physical iPhone acceptance is still pending.

On October 27, 2026, the Dark studio homepage redesign passed all 67 unit tests and the production build. Edge browser checks verified the two-link menu, illustration/menu placement, viewport fit, route history, theme cleanup, navigation focus, keyboard activation, and amber focus styling. Layout screenshots were checked at 1366×900 desktop, 768×1024 tablet, 390×844 and 320×568 portrait phones, and 844×390 and 568×320 touch landscape. The existing Free play browser checks also passed, including actual audio PCM, sustain/retrigger, multitouch, controls, octave bounds, rotation, audio disposal, and unknown routes. These are desktop browser and emulation checks, not physical iPhone acceptance.

On October 25, 2026, the Dark studio cleanup passed the 67 unit tests and production build. Edge checks verified the promoted Free play screen's audio PCM output, sustain/retrigger, settings, multitouch, octave limits, rotation, viewport fit, navigation/audio disposal, and removal of the comparison routes. Before/after screenshots were identical at 1366×900 desktop, 844×390 and 568×320 touch landscape, and 390×844 touch portrait. These browser checks do not establish physical iPhone acceptance.

On October 21, 2026, the actual Git checkout's **67 tests in two test files** and TypeScript/production build passed. They cover music validation/time/pitches, source grouping, piano layout/sample selection, independent voices, sustain/retrigger, loading/retry, interruption/resume, scheduling/cancellation, and disposal.

Earlier Step 1/2 browser checks verified actual audio PCM in Edge, independent multitouch chords, controls, octave bounds, rotation, narrow-desktop behavior, mobile landscape layouts down to 568×320, sample-load retry, and audible scheduled sequence cancellation. They are recorded in [free-play.md](free-play.md); this documentation-only migration did not repeat those audio/browser tests.

Windows WebKit layout/error handling was tested, but that automation build exposes no Web Audio API. No successful Safari/iPhone audio test is claimed.

## Remaining device acceptance

The actual iPhone still needs checks for gesture unlock, sample loading/memory, latency and tuning, multitouch/gliding, sustain/retrigger, volume, rotation, browser chrome/safe areas, backgrounding, screen lock, and audio interruption/recovery. A working desktop preview and mobile emulation do not close this acceptance item.

## Immediate next work

Perform physical iPhone acceptance of Free play and Practice, gather Bruno's feedback on the chosen layout/defaults, and polish any findings. Steps 7–14 remain separate later work.
