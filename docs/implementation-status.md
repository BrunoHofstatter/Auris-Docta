# Implementation status

Last reconciled against the code and local tests: October 21, 2026.

## Delivered

| Area | Current state | Details |
| --- | --- | --- |
| Step 1 foundations | Complete | React/TypeScript/Vite app, responsive homepage, hash navigation/history/fallback, strict shared music model, exact timing, validation, and derived source groups |
| Step 2 Free play | Implemented; real iPhone acceptance pending | Full desktop piano; mobile B3–C6 starting range and octave arrows; multitouch/mouse/keyboard playing; sustain, volume, labels, local preferences, loading/retry, and interruption cleanup |
| Audio | Implemented for acoustic piano | Native Web Audio, independent note instances, 30 bundled Salamander samples, native-clock sequence playback/cancellation, tempo maps and instrument-specific sustain |
| Documentation | Migrated and reconciled | All ten Google Docs tabs represented locally, original text archived, format/Free play/architecture current |
| Deployment setup | Workflow configured | `.github/workflows/deploy.yml` tests, builds, and deploys `dist/`; successful live deployment is not established by this audit |

See [architecture.md](architecture.md), [music-format.md](music-format.md), [free-play.md](free-play.md), and [deployment.md](deployment.md) for implementation details.

The model can represent concurrent pitched instruments and separate piano hands. The installed sound engine only plays `acoustic-grand-piano` in A0–C8. Representing another sound is not the same as installing its samples or adding a selector.

The model/parser and derived solution groups are implemented. A paste/import screen, key-aware warning workflow, answer editor, correctness checker, and grading UI are not implemented. Engine-level scheduling/cancellation is present; practice-level replay controls, speed controls, pause/resume, seeking, and looping remain planned.

## Not implemented

- Step 3 basic configurable generators and exercise setup.
- Step 4 manual answer groups, typed input, answer editing/checking, and the practice input-piano/sound-piano switch.
- Step 5 piano roll, colored correction, sequence alignment, and synchronized seeking.
- Step 6 complete listening/answering/retry workflow, step-by-step progression, and playback controls.
- Steps 7–9 richer generators, import UI/batches, and AI generation instructions.
- Step 10 final menus/settings beyond the current homepage/navigation and Free play preferences.
- Step 11 additional timbres and independently selectable exploratory-piano sound.
- Step 12 sessions, distinct attempts, favorites/folders, tags/filters, and customizable statistics.
- Step 13 session export/import and merge rules.
- Step 14 installable PWA/service-worker/offline guarantees.

The Practice route remains an explicitly labeled preview. There is no durable exercise history, database, authentication, cloud sync, live AI connection, microphone transcription, or MIDI input.

## Verification

On October 21, 2026, the actual Git checkout's **67 tests in two test files** and TypeScript/production build passed. They cover music validation/time/pitches, source grouping, piano layout/sample selection, independent voices, sustain/retrigger, loading/retry, interruption/resume, scheduling/cancellation, and disposal.

Earlier Step 1/2 browser checks verified actual audio PCM in Edge, independent multitouch chords, controls, octave bounds, rotation, narrow-desktop behavior, mobile landscape layouts down to 568×320, sample-load retry, and audible scheduled sequence cancellation. They are recorded in [free-play.md](free-play.md); this documentation-only migration did not repeat those audio/browser tests.

Windows WebKit layout/error handling was tested, but that automation build exposes no Web Audio API. No successful Safari/iPhone audio test is claimed.

## Remaining device acceptance

The actual iPhone still needs checks for gesture unlock, sample loading/memory, latency and tuning, multitouch/gliding, sustain/retrigger, volume, rotation, browser chrome/safe areas, backgrounding, screen lock, and audio interruption/recovery. A working desktop preview and mobile emulation do not close this acceptance item.

## Immediate next work

Address findings from real iPhone Free play acceptance when available, and plan the specifics of Step 3 from [music-and-exercises.md](music-and-exercises.md). Open generator choices are listed in [decisions.md](decisions.md); they have not been silently filled in by the documentation migration.
