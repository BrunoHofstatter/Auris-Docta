# Step 2 — piano sound and Free play

The playable Free play screen and acoustic-piano engine are implemented. Practice exercises remain a later step. Actual iPhone Safari acceptance is still pending; browser emulation cannot establish physical-device audio latency or interruption behavior.

See [the documentation index](README.md) for the full product plan, [sound-and-practice.md](sound-and-practice.md) for future practice requirements, and [implementation-status.md](implementation-status.md) for current delivery status.

## Layout and controls

- Desktop uses all 88 piano keys, A0–C8, with no horizontal scrolling.
- Mobile mode uses a coarse primary pointer and a viewport no wider than 1,200 CSS pixels. A narrow mouse-operated desktop window remains a full piano.
- The initial mobile register is C4–B5, with one neighboring note at each end: **B3–C6**, 26 keys including black keys.
- Mobile keys use 48% of the dynamic viewport height, capped at 250px with a 110px minimum. The surrounding area holds the heading, controls, and space reusable by future practice UI.
- Gray circular chevrons move the visible register by one octave. The core start octave is 0–7; clipping at A0/C8 keeps the ends playable. Arrows disable at those limits. No drag-to-scroll behavior is used.
- Portrait mobile displays the rotation prompt. Range, volume, and labels survive rotation. Active notes and sustain are cleared when layout/orientation changes.
- Sustain toggles on/off and always begins off. Volume starts at 65%. Note labels show only C pitches by default, with a toggle for all names.
- Volume, labels, and mobile octave are saved as basic local preferences. Storage failure does not prevent playing. These preferences are unrelated to future session/attempt storage.
- Stop sound and Escape clear notes and sustain without changing volume. Leaving the screen, losing window focus, hiding the page, or an audio-context interruption also clears active notes.

Touch/mouse press holds a note; release ends the key press. Independent fingers can play chords. Dragging a finger across keys releases its old key and starts the next one. Releasing one finger does not release another finger's note, including when both address the same pitch. Cancelled touch and lost pointer capture release that input's voice.

Pressed notes have a strong green highlight. Released notes ringing under sustain have a subtler highlight. Pressed state takes precedence when a pitch is both held and sustaining. A naturally decayed sample does not erase a physically held-key highlight.

## Computer keyboard

Physical key positions use this map (US legends):

| Key | A | W | S | E | D | F | T | G | Y | H | U | J | K | O | L | P | ; |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Note | C4 | C♯4 | D4 | D♯4 | E4 | F4 | F♯4 | G4 | G♯4 | A4 | A♯4 | B4 | C5 | C♯5 | D5 | D♯5 | E5 |

Desktop mapping stays in this register. A hardware keyboard attached in mobile mode follows the chosen core octave. Notes outside A0–C8 are ignored. Auto-repeat does not retrigger a held note. Text fields and sliders keep normal keyboard interaction. A piano key focused by keyboard also supports Enter/Space, while assistive click activation plays a short note.

## Audio engine

`src/audio/PianoEngine.ts` uses native Web Audio with one `AudioBufferSourceNode` and gain envelope per note instance. This provides independent releases for repeated same-pitch attacks and avoids a shared pitch-wide release operation. It creates the context only from Enable piano, calls resume immediately within that gesture, and starts a silent unlock buffer for mobile audio policies.

Thirty local MP3 samples load/decode with four concurrent workers and visible progress. Samples are fetched from the app's own relative asset path. A failed or timed-out load has an explicit retry. Resuming an already loaded context reuses its decoded samples. Leaving Free play closes the context and clears its buffers; returning enables a new context and may use the browser's ordinary HTTP cache. PWA offline guarantees are not implemented.

Source samples are minor-third spaced, so each of the 88 playable notes is at most one semitone from a recorded sample. Source `playbackRate` handles that small transposition. This is a single sampled velocity selection; strength scales gain rather than selecting among all of the source library's velocity layers. Live notes use the agreed 0.7 strength default.

A master gain controls volume and a dynamics compressor limits loud chord peaks. Key release uses a short gain decay; sustain defers release until pedal up. Naturally decaying samples are not looped. A key still held at pedal up remains held. Live playing caps concurrently retained voices at 128. Actual output latency and maximum practical polyphony remain device-dependent.

The bundled downloads total about **1.92 MiB**. Decoding to stereo floating-point buffers costs substantially more memory (about 155 MiB measured with a 48 kHz desktop context); real iPhone testing should include memory pressure and repeated screen entry. The loader holds only the current screen's sample set, not a growing cross-screen cache.

## Scheduled sequence playback

`src/audio/playback.ts` resolves the validated shared timeline into independent note releases, including instrument-specific sustain. Sustain events at a note-release timestamp take effect first. Pedal-up never shortens a still-held note, and remaining down pedal clears at the scheduled end.

`PianoEngine.play(document)` starts notes directly against `AudioContext.currentTime`, using the music module's complete tempo-map conversion for starts and releases. It returns a cancellation function that stops already active and future scheduled voices. Live sustain does not override a document's pedal events. This is an engine entry point, not an exercise or import screen. Only the installed `acoustic-grand-piano` sound and A0–C8 are accepted; unsupported instruments/ranges fail explicitly.

## Samples and attribution

Salamander Grand Piano recordings by Alexander Holm, from a pinned Tone.js audio distribution. Original attribution and license are retained in [CREDITS.md](../public/audio/piano/CREDITS.md) and `UPSTREAM-README.txt`. The in-app credits link exposes the same information. The format does not claim sympathetic resonance or physical pedal simulation.

`scripts/fetch-piano-samples.mjs` reproduces all downloads from the pinned commit. `public/audio/piano/manifest.json` records byte lengths and SHA-256 checksums.

## Validation and remaining device acceptance

Unit tests cover the shared music model, layout coverage, sample selection, live voices, pedal/retrigger behavior, interruption/resume, retries, cancellation, tempo-based scheduling, and disposal during loading.

Edge browser checks verified actual MP3 decoding and nonzero audio PCM output, live notes, labels, volume, sustain/retrigger, focus loss, independent multitouch chord release, octave limits, rotation, and mobile keyboard visibility at 844×390, 667×375, 568×320, and 932×430. Additional browser checks verified a failed sample request followed by successful retry, the full 88 keys in a narrow desktop window, audible scheduled playback of the C-major example, and cancellation back to silence.

The installed Windows WebKit automation build exposes neither AudioContext nor webkitAudioContext. Its layout, rotation, and unsupported-audio error path were verified; it did **not** validate audio. This is recorded separately from Edge's real Web Audio tests.

Before device acceptance on the actual iPhone: check initial tap-to-enable, sample loading, audible response and tuning, repeated notes with sustain, three-finger chords, sliding, volume, rotation, browser chrome/safe areas, backgrounding, screen lock, phone/audio interruptions, and returning to the screen. No real iPhone is connected to this workspace, so these hardware checks are not claimed as passed.
