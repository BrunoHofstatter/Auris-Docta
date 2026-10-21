# Sound and practice

> **Status:** Free play and its acoustic-piano engine are implemented; graded practice, manual answer editing, the practice input/sound switch, seeking, and looping remain planned. See [free-play.md](free-play.md) for the implemented controls.

Migrated from the “Sound & Practice” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Sound engine and instruments

Do not use AI audio generation. The implemented engine uses native Web Audio with sampled acoustic piano and one source/gain voice per note instance. Tone.js and soundfont players were considered as alternatives; no audio-library dependency is currently required. See [Free play](free-play.md) and [Architecture](architecture.md).

- Start with realistic acoustic piano as the default.

- Other desirable sounds: violin or sustained strings, acoustic guitar, flute, and a synthesizer sound. Add other General MIDI-style instruments later if useful.

- Let the user switch the instrument without changing the underlying notes or answer, so the same melody/chord can be trained across timbres.

- Support simultaneous chord playback, multiple note events, velocity where supported, tempo adjustment, play/replay, pause/restart where appropriate, and looping a selected phrase.

- Slow down playback without changing pitch; note that slowing a scripted MIDI-like sequence is easier and cleaner than time-stretching a recorded song.

- Use reasonably good instrument samples and verify the redistribution license of any soundfonts/sample libraries chosen.

- Prefer client-side synthesis/sampling: no usage charges for each played note and no always-on server.

- Mobile browsers typically require a user interaction to start/unlock audio. Provide an obvious Play button and handle suspended audio context.

- Allow optional offline playback if samples and app assets have been cached.

## 2. Navigation and responsive interface

Design primarily for phone use. Menu, setup, sessions, favorites, and statistics screens should be comfortable on a phone; actual practice is mainly landscape, with a wide layout on a laptop. Mobile is a core product surface, not a secondary adaptation.

- If mobile practice opens in portrait, show a simple “Rotate your phone to landscape to practice” screen rather than trying to force orientation.

- Automatically show the usable landscape practice UI after rotation. Preserve the current exercise and entered answer through orientation changes.

- A PWA may support orientation options on some platforms, but do not depend on browser orientation locking.

- Menus: choose built-in exercise or import. Basic generator setup uses the selected types, numbered octaves, key or none, BPM, linked Items/seconds fields, instrument, playback style, and conditional inversion selector described in [Music and exercises](music-and-exercises.md), section 4.

- Practice: clear Play/Replay and speed/loop controls, current answer group, piano keyboard, Previous / Next group, Submit, and solution/retry controls.

- Desktop can use more vertical/horizontal screen space; phone landscape should prioritize playback, piano keyboard, and navigation over dense settings panels.

- Keep solution pitches hidden by default. Allow deliberate solution viewing before submission and track it for statistics when attempt tracking is implemented.

## 3. On-screen piano and manual note entry

- Show a real piano-style arrangement with white and black keys and the full 88-key A0–C8 range accessible. Desktop Free play shows all 88 keys. Mobile initially shows C4–B5 plus neighboring B3 and C6, with keys using roughly half the landscape height and circular octave arrows instead of horizontal scrolling. The future practice keyboard should reuse the agreed layout and input components.

- Center initially near the user-selected range/register, not on secret correct answer pitches, to avoid leaking hints.

- Use circular gray left/right chevrons to shift the mobile range one octave, clipping at the piano limits and disabling navigation at either end. Range and preferences survive rotation. These controls are implemented in Free play; see [free-play.md](free-play.md).

- Tapping a key toggles whether that pitch belongs to the current answer group; tapping again deselects it.

- Multiple simultaneously selected keys form a chord; a single selected key is a single note. No separate chord-entry screen is needed.

- Selected notes have a clearly visible highlight and a summary such as “C4 + E4 + G4”.

- Provide an explicit switch between input-piano mode and sound-piano mode. Input mode toggles notes in the current answer group; sound mode plays notes without changing the answer. Preserve selected notes and the current group when switching. Reuse the Free play keyboard and audio engine.

- Keep an optional typed-note field for laptop convenience and as a fallback on phone, even though typing is awkward on mobile.

- Inputs should support sharps/flats, octave numbers, and editing of previously entered groups.

- Do not require the user to enter a duration or beat position for any answer.

## 4. Answer groups and navigation

The fundamental answer unit is a logical group of one or more pitches. A basic generator item remains one group whether its pitches sound simultaneously or successively.

- In full-sequence mode, select all notes for the current group; click Next group to save it and start an empty next group. In step-by-step mode, check the current item and advance only when it is correct; an incorrect answer requires retrying that same item.

- Click Previous to revisit and change earlier groups; support going forward again.

- Allow inserting and deleting groups to correct miscounted note/chord events.

- Permit successive one-note groups, multi-note chord groups, and mixtures of both in the same answer.

- Inside a chord, the order in which the user tapped keys must not matter; across groups, temporal order does matter.

- Basic generated exercises deliberately expose the configured item count through the linked Items/seconds setup fields. For imported or other exercises without a user-chosen count, avoid additionally revealing the source-group total before submission. In full-sequence mode, the user decides when to submit.

- Before submitting, allow review of an abstract summary of entered groups without revealing correct source notes.

- Prevent submission of accidental empty groups or handle them clearly.

## 5. Free play and the practice sound piano

Free play is a permanent, useful app feature as well as the development/testing surface for step 2. It is separate from graded practice.

- Click or tap piano keys to hear the selected instrument. Support simultaneous notes and reuse the same sound engine and keyboard across Free play and practice.

- In practice, provide an obvious input-piano/sound-piano switch. Sound mode behaves as an exploratory piano: it plays notes without selecting, deselecting, or otherwise editing the answer.

- Switching modes preserves the current answer group, selected pitches, and previous answer groups. Returning to input mode resumes editing where the user left off.

- This sound piano is a core feature, making practice possible without the physical piano and providing a general way to compare pitches.

- Allow the exploratory piano sound to be selected independently of the exercise sound. The user raised the possibility of a different piano timbre to avoid relying on an identical sound. Recommendation for later detailed planning: offer the same or a different timbre as a choice, with consistent tuning; a slightly different piano is useful to try, but it is not proven to improve learning and should not be forced.

- Additional instruments added later should also work in Free play. The sound piano can remain piano by preference even when the exercise uses another instrument.


