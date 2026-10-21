# Google Docs source archive — 2026-10-21

This is the complete imported source snapshot, preserved for provenance. It contains older planning assumptions and is not the current implementation contract. Use [the documentation index](../README.md) and the reconciled topic files for current decisions.

- Source: [Auris Docta - Piano Ear-Training App](https://docs.google.com/document/d/1wyQmN2cOXtfLRFFy2uItYIpH8JgFTqWFJunVlW2kdfE)
- Revision: `AHj4eMQAKr7e8z635_TGKBIxafsWiriPzTwAUemFjLOJqiCJOUfdyUhGwealNCqbrNGpXtAAPnATb2NRJ54HEgpYeXmWLV_7t18-QJzm8gA`
- Imported: October 21, 2026 (America/Sao_Paulo)
- Coverage: 10 tabs, 323 nonempty paragraphs; all source paragraph text is preserved. The source contains no tables, embedded images, footnotes, or hyperlinks requiring separate conversion.

## Overview

**Piano Ear-Training App - Auris Docta**

Design and implementation specification — decisions from the planning conversation

### 1. Purpose and learning context

Build a private, browser-based ear-training application for Bruno that plays notes, chords, melodies, and short musical passages. The user explores pitches on a physical piano or the app’s sound piano, enters notes manually, and receives visual feedback. The phone is the primary device; laptop support is also required.

The aim is practical transcription by ear: listen, experiment on the physical piano or on-screen sound piano, identify pitches or harmony, enter an answer, and compare it with the source. This supports finding melodies from songs, identifying chords and progressions, constructing solo piano arrangements, and composing. The physical piano is mainly available on weekends; the app’s sound piano makes practice possible away from it. The app will mostly be used on the phone.

Product principle: deterministic playback and grading should be free, exact, and reliable. AI is optional for composing interesting longer exercises, but should not be required to synthesize the audio or validate simple answers.

Status: design agreement, not an implemented app. Items labeled “Later/optional” or “Recommendation” are not required for version 1.

### 2. Agreed product boundaries

- This app is only for Bruno. Prioritize his control and preferences rather than assumptions about a public app: freely reopening sessions, adding exercises later, viewing solutions, editing organization, and selecting what counts toward statistics. Avoid unnecessary roles, access restrictions, forced workflows, and permission or confirmation steps. This does not override actual browser permissions or data-integrity requirements.

- Phone use is a core requirement and the primary design target. Mobile layout, touch controls, and different mobile functionality where useful must be planned and polished alongside each feature. Also support the Windows laptop. Progressive Web App (PWA) is the preferred delivery model.

- Practice is based on listening to generated sound, exploring notes with a physical piano or the app’s sound piano, and entering the answer manually.

- Manual entry options: primary on-screen piano; secondary typed note names. No MIDI keyboard integration and no microphone/transcription.

- No rhythm or timing grading. Rhythm exists in playback and in the visualization but correctness means notes/chords and order, not whether the user matched the timing of a performance.

- No backend, server, database account, paid AI API, or custom connector is needed for the initial app.

- Detailed local session history, favorites, customizable statistics, and manual export/import between phone and computer are planned later build steps. Automatic cloud sync is not required. Early test practices may be disposable or lack statistics.

- User does not want to implement a Codex/MCP connector now. Importing generated text by copy/paste is enough.

- Focus on an attractive, functional piano-roll/Synthesia-like visualization as a central playback and correction feature, not an afterthought.

### 3. Personal use, phone priority, and remaining planning decisions

This is Bruno’s personal app and will mostly be used on his phone. Treat these facts as decision rules throughout implementation, not as minor preferences.

- Plan mobile layout, touch interaction, usable control sizes, seeking, keyboard scrolling, and mobile-specific functionality within each relevant feature. Desktop remains supported, but mobile functionality must not be postponed to a final cleanup pass.

- Keep portrait-friendly menus and library screens and landscape practice with the agreed rotate message. Preserve exercise and answer state through rotation.

- Favor user control: freely access and continue sessions, inspect solutions, redo exercises, edit organization/tags, and choose the data included in statistics. Avoid imposing public-product roles, artificial access restrictions, or forced practice schedules.

- The planning method remains: list big steps first, then plan one step’s specifics, implement it, and polish it. This document records ideas for later detailed planning; it does not claim all screens, metrics, data formats, and interactions are finalized.

- Open detailed decisions include AI tag taxonomy, exact accuracy formulas, attempt grouping from Favorites, extending imported batches, passive playback statistics, idle-time handling, export merge rules, and exploratory-piano timbre defaults.

- Core decisions already settled include unrestricted session continuation, mixed selected types in built-in exercises/sessions, one session per imported batch, the sound-piano switch, favorites folders, the three session exercise actions, seekable Synthesia, customizable session selection for statistics, and manual cross-device export/import. Basic generator settings are detailed in Music & Exercises, section 4.

## Build Plan & Decisions

### 1. Incremental build order and planning approach

The implementation order below remains incremental: plan a step’s specifics, implement it, and polish it. Design can look ahead across connected steps before coding. Current design work starts with basic exercises and their complete listening, answering, and feedback flow (steps 3–6), then phone layouts. This does not require implementing those steps together.

#### Step 1 — Foundations, shared music format, and basic app layout

Establish the note/event representation shared by sound, answer input, checking, visualization, generators, and exercise import. Include a basic homepage and navigation. Detailed session storage and export formats can wait.

#### Step 2 — Piano sound engine and Free play

Build a permanent Free play screen where tapping keys plays the selected instrument without exercises or grading. Use it to test piano sound, the keyboard, chords, and audio behavior; also test scheduled sequence playback.

#### Step 3 — Basic practice exercises

Introduce the configurable basic generator described in Music & Exercises, section 4: selected mixtures of notes, octaves, random pairs, triads, and seventh chords; octave ranges; key or none; one BPM value; linked item count/duration; instrument; simultaneous/successive playback; and root-position/random inversions. Single notes and major/minor triads remain useful first implementation slices. Complete the agreed basic scope incrementally; richer musical generation comes later.

#### Step 4 — Answer input, editing, and basic checking

Implement the keyboard, typed input, simultaneous note groups, group navigation/editing, and simple note/chord comparison. Add the core input-piano/sound-piano switch so experimenting with sound does not modify answers.

#### Step 5 — Synthesia and correction feedback

Build the animated piano roll and green/red/yellow feedback, including sequence alignment for missing/extra groups. Include synchronized seeking forward and backward and explicit solution visibility rules.

#### Step 6 — Complete practice workflow and playback controls

Connect listening, answering, submission, review, and retry; finish replay, speed, looping, and navigation. Include full-sequence practice and step-by-step practice that advances only after the current item is correct. Practice becomes usable progressively through steps 3–5. Detailed history/statistics recording is not required here.

#### Step 7 — Expanded practice generators and configuration

Expand beyond the basic generator with more musical melody/progression rules and further categories or customization as needed. Basic mixed-item sequences and their agreed controls belong to the basic-practice scope. Independent melody/accompaniment generation remains a later design question.

#### Step 8 — Exercise import and validation

Support pasted structured exercises and batches with explicit exercise boundaries, validation, previews that do not accidentally disclose answers, and sequential practice.

#### Step 9 — AI instructions and generation templates

Write instructions that reliably target the working import format, including individual passages and batches of exercises. Derive checkable answers from notes rather than trusting AI labels.

#### Step 10 — Homepage, navigation, and settings

Finish the homepage and menus once their destinations and configuration needs are clear. Provide access to Free play, built-in practice, import, and later sessions, favorites, and statistics.

#### Step 11 — Additional instruments

Add selectable timbres such as strings, guitar, flute, and synthesizer for exercises and Free play. Allow the exploratory sound piano to use an independently selected sound.

#### Step 12 — Session library, favorites, organization, and customizable statistics

Design and implement session persistence, unrestricted continuation, exercise history/actions, separate attempts, folders, favorites, tags, filters, manual selection, and statistics. Capture all discussion requirements in the Sessions & Favorites and Statistics tabs for detailed planning later.

#### Step 13 — Session export/import between devices

Implement simple manual transfer and merging between phone and computer. Specify the session export format, identifiers, duplicate handling, and revisions at this stage; early formats/data can be changed or discarded.

#### Step 14 — Installation and optional offline use

Finish PWA installation and optional offline assets/samples. Verify on the actual phone as well as the laptop. Mobile layout and functionality must already have been developed throughout the earlier steps.

### 2. Decisions deliberately deferred / trade-offs

- Exact final text notation: specify JSON first; compact notation is useful but should not compete with parser correctness.

- Exactly which instrument sample libraries to distribute: choose after license and mobile file-size testing.

- Chord inversion generation is settled: enable an inversion selector when a chord type is selected, with only Root position only and Random. Answers still use the chord’s actual pitches and octaves; no separate inversion-name answer is required.

- Whether to support independent overlapping-note lifetimes in the first version: internal model should permit extension; simple grouped onsets are enough to start.

- Detailed local statistics and manual export/import are agreed features. Their exact data model, filters, metrics, merge rules, and file format are deferred to their own steps. Early data does not require preservation or backward-compatible migration; automatic cloud sync and accounts are not required.

- More sophisticated harmonic analysis, modulation detection, audio recording, MIDI input, live AI generation, and MCP connector are explicitly outside the first version.

The design should remain personally useful: phone-first ear-to-piano transcription, an independent sound piano, fast answer entry, trustworthy comparison, good audio, multiple timbres, visual feedback, freely accessible sessions, favorites, and highly customizable statistics.

## Music & Exercises

### 1. Two ways to obtain exercises

#### 1.1 Built-in deterministic generator

This is a random generator governed by musical constraints, not a list of prewritten exercises and not necessarily completely unstructured randomness.

- Generate single notes, multiple successive notes, simultaneous notes/chords, and several short chord groups.

- Basic configuration includes multiple exercise types and numbered octaves, one key or none, one tempo, linked item count/duration, instrument selection, playback style, and conditional chord inversions. See section 4 for the agreed behavior.

- Allow no key restriction or one selected key. Ordinary items stay in key; selected special chord types may use outside notes needed for their structure. General key-centered chromatic generation is deferred; see section 4.

- Later musical melody generators may favor stepwise motion with occasional leaps or offer a leap-heavy style. These are not requirements for the basic random-item generator.

- Construct chords according to their selected qualities. Later progression generators can favor plausible harmonic movement; the basic mixed-item generator need not form a composed progression.

- Short exercises should be instant, repeatable on demand, and playable without AI.

- Deterministic means algorithmically generated and reliably checked; it does NOT mean every generated exercise is identical. A seeded random generator can make an exercise reproducible if that later proves useful.

#### 1.2 Pasted AI-generated exercises

This is preferred for longer phrases, more interesting melodies, richer multi-chord passages, or musical ideas with expression, tension, and resolution.

- The user asks ChatGPT or Codex to create structured music text, copies it, and pastes it into the app's import screen.

- The app parses, validates, and performs the structured events; it must not need an AI call to play them.

- AI prompts might ask for a 15-second melancholy melody, rising phrase, resolution, and easy accompaniment, or 20 progressively harder chord-recognition exercises.

- The solution is embedded in / derived from the note data but remains hidden in practice mode.

- Prefer computing objectively checkable answers from the pitches rather than trusting AI-generated answer labels, since an AI can mislabel a chord or interval.

- AI import is a preference, not a hard technical limit: the built-in generator could make longer passages later if its composition rules improve.

### 2. Exercise categories

- Single-note identification: hear one note, find it on the real piano, enter its pitch and octave.

- Multi-note sequences: identify successive notes in the correct order.

- Intervals: hear two notes melodically or harmonically; reproduce/identify the pitches, with optional interval-name drills later.

- Chord identification: hear a chord simultaneously or successively according to playback style; enter its pitches and octaves as one answer group. Chord inversion generation offers Root position only or Random.

- Sequences of chords: identify several successive chord groups.

- Short melodies: reproduce the pitches and order, not the precise timing.

- Chord progressions: use harmonically meaningful sequences; optional chord-name/roman-numeral training can be added later.

- More complete music passages: mixed melody and accompaniment, possibly overlapping notes, mainly through AI import.

Musical guidance: the learning loop is ear-to-piano reproduction. A switchable sound piano is a core practice feature, giving the user a virtual instrument to explore pitches without editing the answer. Dedicated reference-note or tonic controls can remain optional future ideas.

### 3. Canonical note-and-event model

Represent music internally as ordered, timed note events rather than storing the exercise only as raw text or audio. This same model powers audio playback, piano-roll drawing, answer matching, and import/export.

Timed note events carry pitches, onset time, and duration, with dynamics/velocity and instrument information possible later. Keep logical answer-group membership distinct from audible onset timing: a basic item can sound simultaneously or as successively spread notes while remaining one answer group. A sequence contains ordered items/groups; the same pitch repeated in a later item is distinct.

Store pitches with octave explicitly: C4, F#4, Bb3, C5, etc. Normalize enharmonic spellings internally (e.g., C# and Db sound the same under equal temperament) while retaining the display spelling where useful.

Start with one common duration per onset group; if richer polyphony and independent note lengths are needed, extend the representation without redesigning playback.

Group membership, not key-tap order, defines an answer item. Successive playback within a chord/pair does not turn its constituent pitches into separate answer groups. Preserve their actual playback timing for audio and visualization.

### 4. Basic exercise generator — agreed design

This section records the current product design before coding. It replaces earlier assumptions about one type per built-in session and strictly simultaneous groups. The built-in generator is configurable practice, not necessarily a composed musical passage.

#### 4.1 Items, exercise types, and mixing

An item is one single note or one logical group of pitches: an octave, random pair, or chord. An exercise contains the chosen number of ordered items. Several types can be selected together and interchanged within the same exercise.

Planned basic types: single note; octave (the same pitch class one octave apart); two different random pitches no more than an octave apart; major triad; minor triad; diminished triad; augmented triad; and seventh chords. Major/minor and other qualities can be selected individually. The exact list of seventh-chord qualities remains to be specified.

Do not confuse item count with the number of constituent pitches: ten triads are ten items, not thirty. Selecting several types allows mixed sequences of single notes and multi-note groups.

#### 4.2 Octave range

Choose one or several numbered octaves using simple octave buttons. All generated pitches must lie within the union of the selected octaves, including every chord tone and inversion. Do not add a range-preview keyboard or exact pitch endpoints now; revisit endpoints only if actual practice creates a need.

#### 4.3 Key

Select one key or None (unrestricted). Ordinary generated items stay in the chosen key. Selected special chord types may introduce the outside pitches needed for their structure; ordinary single notes must not become chromatic because those chord types are enabled. No explanatory key-conflict text is needed in the settings for this personal app.

A general key-centered mode with freely introduced chromatic notes is a later option. Recommendation still to refine: keep special-chord roots in the selected key and define precisely which selected chord qualities receive the exception.

#### 4.4 Playback within an item

Offer four playback styles: Simultaneous; Successive — slow; Successive — medium; Successive — fast. Successive playback spreads the constituent pitches of one multi-note item; it does not change their membership in one answer group. Single-note items are unaffected.

The main BPM controls spacing between items; successive slow/medium/fast controls spacing within an item. Proposed initial behavior: play successive pitches from low to high and scale their spacing to fit the item interval. Exact spread amounts and whether several playback styles can be selected together remain to be finalized.

#### 4.5 Chord inversions

Enable the inversion selector when at least one chord type is selected. Offer only Root position only and Random. Random varies among the chord’s valid inversions, including root position, while keeping every pitch within the selected octave range. The setting applies to chord items, not unrelated single notes or random pairs. Grade the resulting actual pitches and octaves as usual.

#### 4.6 Speed and instrument

Use one BPM value per exercise. Provide a numeric speed control from 20 to 300 BPM, adjusted in steps of 5, rather than seven preset boxes. Varying tempo within an exercise and selecting several tempos are outside the current scope.

Start a new item on each beat: 60 BPM = one item per second; 120 BPM = one item every 0.5 seconds; 240 BPM = one item every 0.25 seconds. Faster basic sequences use higher BPM rather than separate half-beat/quarter-beat rhythm controls.

Include instrument selection, starting with piano and using other instruments when they are added. Detailed behavior for selecting/mixing several instruments has not been settled.

#### 4.7 Linked item count and duration

Provide linked fields for Items and Duration in seconds. Editing either updates the other using the selected BPM: seconds = Items × 60 ÷ BPM; Items = seconds × BPM ÷ 60. For example, 20 chords at 120 BPM occupy 10 seconds, including the last item’s allotted interval. This is scheduled exercise length, not guaranteed sound-decay or total practice time.

An item can contain several notes, so this count is not a note count in mixed/chord practice. The configured item count is intentionally known; the earlier hidden-group-count preference does not override this setup choice.

Recommendation for non-integer results: round to the nearest whole item and show its corresponding duration. Exact rounding/minimum-length behavior remains to be finalized. Note sustain and the gap before the next item also remain to be tuned; a small automatic gap was suggested so repeated items are distinguishable.

#### 4.8 Full sequence and step-by-step practice

Full sequence: listen to the generated sequence, enter its ordered answer groups, and submit for feedback. Step by step: play one item, wait for the user’s answer/check, and advance only after it is correct. An incorrect answer stays on the same item and requires retrying. Replay the current item as needed; successive chord pitches still require one complete group answer.

In step-by-step mode, the seconds field gives the equivalent uninterrupted playback length. Waiting, exploration, and retries add to actual practice time. Feedback on one checked item must not reveal the pitches of future items. No rhythm/timing performance is graded.

#### 4.9 Recorded for later

Saved presets: agreed as a useful future feature, explicitly deferred. Eventually save reusable combinations of generator settings; do not require presets for the current basic exercise work.

Two hands / independent melody and accompaniment: still an open later design question, not a committed basic-generator feature and not restricted permanently to AI import. Possible built-in patterns include melody over bass notes, block chords, or broken-chord accompaniment. Merely sounding bass and chord pitches together already fits a multi-note item; independently moving or overlapping parts need further design.

Other suggestions, such as custom probabilities for mixed types or more complex rhythmic patterns, are not agreed requirements for the current basic generator.

## Sound & Practice

### 1. Sound engine and instruments

Do not use AI audio generation. Use browser audio technologies: Web Audio API with a library such as Tone.js and sampled instruments (or a soundfont-based player such as WebAudioFont).

- Start with realistic acoustic piano as the default.

- Other desirable sounds: violin or sustained strings, acoustic guitar, flute, and a synthesizer sound. Add other General MIDI-style instruments later if useful.

- Let the user switch the instrument without changing the underlying notes or answer, so the same melody/chord can be trained across timbres.

- Support simultaneous chord playback, multiple note events, velocity where supported, tempo adjustment, play/replay, pause/restart where appropriate, and looping a selected phrase.

- Slow down playback without changing pitch; note that slowing a scripted MIDI-like sequence is easier and cleaner than time-stretching a recorded song.

- Use reasonably good instrument samples and verify the redistribution license of any soundfonts/sample libraries chosen.

- Prefer client-side synthesis/sampling: no usage charges for each played note and no always-on server.

- Mobile browsers typically require a user interaction to start/unlock audio. Provide an obvious Play button and handle suspended audio context.

- Allow optional offline playback if samples and app assets have been cached.

### 2. Navigation and responsive interface

Design primarily for phone use. Menu, setup, sessions, favorites, and statistics screens should be comfortable on a phone; actual practice is mainly landscape, with a wide layout on a laptop. Mobile is a core product surface, not a secondary adaptation.

- If mobile practice opens in portrait, show a simple “Rotate your phone to landscape to practice” screen rather than trying to force orientation.

- Automatically show the usable landscape practice UI after rotation. Preserve the current exercise and entered answer through orientation changes.

- A PWA may support orientation options on some platforms, but do not depend on browser orientation locking.

- Menus: choose built-in exercise or import. Basic generator setup uses the selected types, numbered octaves, key or none, BPM, linked Items/seconds fields, instrument, playback style, and conditional inversion selector described in Music & Exercises, section 4.

- Practice: clear Play/Replay and speed/loop controls, current answer group, piano keyboard, Previous / Next group, Submit, and solution/retry controls.

- Desktop can use more vertical/horizontal screen space; phone landscape should prioritize playback, piano keyboard, and navigation over dense settings panels.

- Keep solution pitches hidden by default. Allow deliberate solution viewing before submission and track it for statistics when attempt tracking is implemented.

### 3. On-screen piano and manual note entry

- Show a real piano-style arrangement with white and black keys and a full 88-key pitch range, horizontally scrollable on mobile. The range need not fit simultaneously onscreen.

- Center initially near the user-selected range/register, not on secret correct answer pitches, to avoid leaking hints.

- Add octave-jump buttons or quick navigation to avoid long scrolls.

- Tapping a key toggles whether that pitch belongs to the current answer group; tapping again deselects it.

- Multiple simultaneously selected keys form a chord; a single selected key is a single note. No separate chord-entry screen is needed.

- Selected notes have a clearly visible highlight and a summary such as “C4 + E4 + G4”.

- Provide an explicit switch between input-piano mode and sound-piano mode. Input mode toggles notes in the current answer group; sound mode plays notes without changing the answer. Preserve selected notes and the current group when switching. Reuse the Free play keyboard and audio engine.

- Keep an optional typed-note field for laptop convenience and as a fallback on phone, even though typing is awkward on mobile.

- Inputs should support sharps/flats, octave numbers, and editing of previously entered groups.

- Do not require the user to enter a duration or beat position for any answer.

### 4. Answer groups and navigation

The fundamental answer unit is a logical group of one or more pitches. A basic generator item remains one group whether its pitches sound simultaneously or successively.

- In full-sequence mode, select all notes for the current group; click Next group to save it and start an empty next group. In step-by-step mode, check the current item and advance only when it is correct; an incorrect answer requires retrying that same item.

- Click Previous to revisit and change earlier groups; support going forward again.

- Allow inserting and deleting groups to correct miscounted note/chord events.

- Permit successive one-note groups, multi-note chord groups, and mixtures of both in the same answer.

- Inside a chord, the order in which the user tapped keys must not matter; across groups, temporal order does matter.

- Basic generated exercises deliberately expose the configured item count through the linked Items/seconds setup fields. For imported or other exercises without a user-chosen count, avoid additionally revealing the source-group total before submission. In full-sequence mode, the user decides when to submit.

- Before submitting, allow review of an abstract summary of entered groups without revealing correct source notes.

- Prevent submission of accidental empty groups or handle them clearly.

### 5. Free play and the practice sound piano

Free play is a permanent, useful app feature as well as the development/testing surface for step 2. It is separate from graded practice.

- Click or tap piano keys to hear the selected instrument. Support simultaneous notes and reuse the same sound engine and keyboard across Free play and practice.

- In practice, provide an obvious input-piano/sound-piano switch. Sound mode behaves as an exploratory piano: it plays notes without selecting, deselecting, or otherwise editing the answer.

- Switching modes preserves the current answer group, selected pitches, and previous answer groups. Returning to input mode resumes editing where the user left off.

- This sound piano is a core feature, making practice possible without the physical piano and providing a general way to compare pitches.

- Allow the exploratory piano sound to be selected independently of the exercise sound. The user raised the possibility of a different piano timbre to avoid relying on an identical sound. Recommendation for later detailed planning: offer the same or a different timbre as a choice, with consistent tuning; a slightly different piano is useful to try, but it is not proven to improve learning and should not be forced.

- Additional instruments added later should also work in Free play. The sound piano can remain piano by preference even when the exercise uses another instrument.

## Synthesia & Feedback

### 1. Synthesia-style piano-roll visualization

Build a piano-roll renderer from the shared event model. This is a first-class feature, not a separate video-generation system.

#### Practice playback

- Display a horizontal or vertical time/pitch piano roll (a classic falling-note Synthesia presentation is desirable), linked to a virtual piano keyboard.

- Notes animate toward the keyboard as music plays, showing pitch positions, length, and simultaneity. During an unanswered practice attempt, hide the pitch-bearing source visualization until submission or an explicit solution-view action. A harmless playback progress bar can be visible. Session-history Synthesia is an intentional solution-view action; preserve this distinction for future statistics.

- Controls can replay the full phrase, slow it, and loop parts of it. A selected loop is useful after making a mistake.

#### Feedback / correction

- Reveal the full correct notes after submission, or when the user intentionally chooses View Synthesia from session history. Session access is unrestricted; record prior solution viewing when attempt history is implemented.

- Overlay the submitted notes for side-by-side comparison, keeping relative group order aligned.

- Colors agreed: green = correctly identified note, red = incorrect extra/substituted note, yellow = correct note missed by the user.

- Display note labels, chords, and group boundaries in a way that works at mobile landscape sizes; include a color legend.

- Chords show multiple vertically stacked note bars at the same time.

- Offer replay of the whole solution and optionally only the incorrectly identified section; allow inspecting a group.

- The roll displays durations as supplied for the original sound, but does NOT score rhythm or timing of the user's manual answer.

- For inserted/deleted answer groups, ideally align the sequences rather than naïvely comparing row N to row N and making every later group appear wrong (recommended implementation enhancement).

- Do not reveal the solution merely because exercise audio is played. Reveal it after Submit or an explicit View Synthesia/solution action.

### 2. Correctness and grading

- Source of truth is the canonical event-note data, not a second AI text label.

- Grade which pitches were entered in each group, and whether the sequence of groups is correct.

- Compare simultaneous note groups as sets or multisets of pitch+octave values, independent of key-tap order.

- Default to exact pitch including octave; optionally add “ignore octave” as a practice setting later if the musical task warrants it.

- Use enharmonic normalization for correctness while retaining user-friendly spelling for display.

- Distinguish matching notes, additional wrong notes, missing correct notes, and entire extra/missing groups.

- No timing score, rhythm score, dynamic/velocity score, or requirement to perform into a microphone.

- For chord naming modes, derive chord quality, root, and inversion from pitches where unambiguous; if chord spelling/analysis is uncertain, do not assert a false definitive label.

- Provide separate measures of note-level accuracy and whole-group/whole-exercise correctness. A partially correct chord may contain correct notes while the chord as a whole is incorrect. Exact formulas, denominators, and additional statistics will be specified in the statistics step; colored correction remains the immediate feedback.

- Support redoing saved exercises. Keep earlier submitted answers and results; each redo creates a separate attempt rather than overwriting the original. Distinguish first attempts, retries, and attempts made after viewing the solution.

## Import & AI

### 1. Pasted text notation and import validation

Use a simple, documented human-readable format, preferably JSON for robustness and easy machine generation. A compact shorthand could be supported as an optional convenience later.

Illustrative compact input:

Key: G major

Tempo: 90 BPM

Instrument: piano

G4 1

A4 0.5

[B4,D5] 1

C#5! 0.5

D5 1

In this illustrative syntax, one line is one onset group; square brackets indicate simultaneous notes; the number specifies duration (the format must standardize whether numbers mean beats or seconds); and “!” indicates a deliberately out-of-key pitch.

A structured JSON equivalent should carry fields such as version, title, key, tempoBpm, instrument, and events [{notes:[...], startBeat:..., durationBeats:...}]. Use a single canonical time unit (beats is recommended) and convert via tempo for sound playback.

Parser requirements:

- Reject malformed note names, impossible octaves, negative/zero durations, invalid event types, and unsafe/oversized input.

- Normalize whitespace and allowable accidentals (#, b) and support enharmonic equivalents.

- Display a preview and helpful line/event-specific errors before starting the exercise.

- Sort/check event order and prevent accidental duplicate entries within one simultaneous group.

- Imported data is data only: never evaluate executable JavaScript contained in imported content.

- Allow mixed single-note and multi-note groups in the same exercise.

- Make longer sequences and polyphonic music possible without changing the answer-entry concept.

### 2. Key-aware note validation

Each imported exercise may declare a tonal center and key/mode. The validator determines which pitch classes belong to the selected scale and warns about chromatic/out-of-key notes.

- Default: warn about notes that do not belong to the declared key; do not silently alter or delete them.

- A notation marker such as C#5! designates an intentional chromatic note. Keep that note playable and do not warn unnecessarily.

- The user can choose strict validation for simple in-key exercises or warning-only validation for real music.

- If a chromatic pitch is unmarked, show the specific offending note, event, and an explanation; allow correction or explicit acceptance.

- Key rules must account for harmonic and melodic minor and common chromatic techniques; declaring “A minor” does not make G# automatically erroneous. Distinguish simple scale membership from actual harmonic correctness.

- A key is a guide, not proof that every musical pitch must fall in its seven-note scale. Imported passages can have accidentals, borrowed chords, tonicization, and modulation.

- As an optional future extension, support key changes inside one passage or automatic estimation of likely key; neither is needed now.

### 3. Batch import and AI instructions

The import format must distinguish separate exercises explicitly, so a reader can load either one exercise or a batch without confusing an exercise boundary with a note/chord group.

- A batch becomes one session; practice presents its exercises sequentially, one at a time. Support pausing and resuming rather than requiring completion in one uninterrupted sitting.

- AI generation instructions should cover single passages and batches such as 20 progressively harder exercises.

- Each exercise carries the musical data and relevant metadata required for playback, validation, and later classification. Exact batch/session schemas are deferred to their implementation steps.

- Validation and import previews should provide useful errors and metadata while avoiding an accidental reveal of solution pitches before practice.

## Sessions & Favorites

### 1. Session definition, classification, and unrestricted continuation

A session is a practice collection containing one or more exercises, not a time-limited uninterrupted sitting. The user controls when to continue it or create another session.

- A built-in session may contain exercises generated from one selected type or a mixture of selected types, including mixtures within an exercise. This replaces the one-type-per-session restriction. Detailed rules for changing settings while continuing a session remain for later session planning.

- One imported AI batch creates one session containing all the batch’s exercises, presented one at a time. A single imported AI passage creates a session containing one exercise. This supersedes the earlier one-exercise-only rule for AI sessions.

- Classify sessions by source and selected types. Built-in exercises may include several generator categories, so classification must accommodate mixed types. AI-generated sessions are classified as AI-generated and can have editable tags for instruments and musical content.

- The exact AI musical-content categories are deliberately open: the user does not yet know what kinds of passages he will request. Support useful custom tags instead of fixing an exhaustive taxonomy now.

- Keep the instrument actually used for an exercise/attempt distinguishable from descriptive AI tags, so instrument-based statistics reflect playback rather than only labels.

- Allow resuming after 15 minutes, returning the next day, and adding further exercises to an existing session where applicable. No automatic expiry, forced closure, or requirement to start a fresh session after a break.

- For imported sessions, work through the available imported exercises sequentially. How to append further imported exercises or batches later can be specified in the detailed session/import plan; continuation does not require a live AI connection.

- Separate Continue session, which advances through or adds exercises, from Redo exercise, which practices an existing saved exercise again.

- Each exercise is saved within its session once persistence is implemented. Preserve its source notes/events, playback context, submitted answers, and results as needed by review and statistics.

- Redoing creates a distinct attempt rather than overwriting an earlier answer/result. Keep first attempts, retries, and attempts made after viewing a solution distinguishable.

### 2. Sessions tab and exercise review

Provide a sessions tab with folders or collections, unrestricted access, and a numbered list of exercises within each session.

- Rename, organize, and delete sessions; browse and find sessions using useful summaries and filters.

- Show summaries such as type/source, dates, exercise count, accuracy, listening time, and practice time. A session reused across days retains the dates of its individual exercises/attempts.

- For every numbered exercise, provide Listen, Practice again, and View Synthesia actions.

- Listen plays the exercise audio and shows a duration/progress bar that can be dragged to seek forward or backward.

- Practice again opens a mode restricted to that one exercise. It does not generate additional exercises or continue through the rest of the session. Returning goes directly to the previous sessions location, preserving the relevant session, scroll position, and filters.

- View Synthesia reveals the exercise through the piano-roll visualization with synchronized audio and a seek bar for forward/backward inspection. A separate screen listing the notes as letters is not required; note labels may remain part of Synthesia.

- Allow inspecting previous submitted answers, results, and attempts alongside the saved exercise.

- Favorite an exercise from session history or while practicing; support selecting multiple exercises to favorite together.

- Allow deliberate viewing of solutions. Record whether a solution was viewed before a later attempt when tracking is implemented, so fresh and assisted attempts can be analyzed separately.

- Decide during detailed statistics planning how passive history playback affects listening counts/time; browsing should remain distinguishable from a new submitted practice attempt.

### 3. Favorite exercises and folders

Favorites is a dedicated tab for saved practice material the user wants to reuse. Exercises already belong to sessions; favoriting organizes reusable material rather than creating another completion result.

- Create folders or collections to organize favorite exercises.

- Favorite an exercise directly during practice or by selecting it in the sessions tab.

- Listen to, inspect through Synthesia, and practice favorite exercises again. Preserve distinct attempt results and offer instrument changes where supported.

- Keep a favorite exercise usable if its original session is deleted. The exact reference/copy strategy and organization model can be chosen during implementation.

- Decide where attempts launched from Favorites are grouped during the detailed session plan; do not silently overwrite the original session’s attempts.

## Statistics

### 1. Customizable statistics and session selection

Rich, personally customizable statistics are an agreed feature, not merely an optional extension. The central requirement is control over exactly which sessions contribute to the displayed statistics.

- Every statistic must operate on the current selected set of sessions. Apply filters and manual selection consistently across rates, summaries, comparisons, charts, and other displays.

- Support filtering by built-in exercise type, AI-generated source/type, AI tags, actual playback instrument, dates/date range, recent sessions, and duration/time-related properties.

- Most importantly, allow manually selecting specific sessions, including arbitrary selections and excluding individual sessions from an otherwise filtered set.

- Start with right/wrong rates, then support note-level partial accuracy and whole-group/whole-exercise correctness. A chord with two correct notes out of three can be partly correct at note level and incorrect as a complete chord.

- Distinguish first-attempt accuracy, retries, and attempts after seeing the solution. Final denominators, scoring formulas, handling of extra/missing notes/groups, and filter controls will be specified later.

- Record exercise duration separately from practice time and total listening time. A 30-second exercise may be listened to for 90 seconds or more through repetitions.

- Track playback count and total actual listening time, accounting for partial replays and loops rather than assuming every playback was complete.

- Practice time covers listening, exploring notes, and entering answers. Handling idle time, pauses, leaving the app, and sessions resumed across days is a later detailed decision.

- Consider custom comparisons, charts, and further useful metrics during the statistics-specific planning step. Do not promise every future statistic before its required data and interpretation are defined.

- Implement detailed recording/persistence in the session/statistics step. Early development practices may have incomplete or no statistics; the user does not mind losing these test results.

## Storage & Architecture

### 1. Device delivery, offline use, and local persistence

- Build one responsive web application usable from the Windows laptop and phone browser.

- Make it installable as a Progressive Web App: open the URL, Add to Home Screen / Install, then launch from the home-screen icon.

- Free static hosting such as GitHub Pages or Cloudflare Pages is sufficient if all app features are client-side. No app-store publication needed.

- Hosting does not automatically provide cross-device sync. Keep local device state and provide a later manual export/import workflow to move or combine sessions and related saved data between phone and computer.

- Cache application assets and instrument samples for offline use where practical, understanding first installation/use usually needs a network connection.

- Save basic preferences locally when useful. Detailed session persistence, folders, favorites, and statistics will be designed and implemented in their later step. Do not delay early practice to implement statistics tracking or a durable session format.

- Browser storage can be cleared or evicted; no account/cloud backup is promised.

- Ensure touch targets are large enough for a mobile landscape keyboard and control bar.

### 2. Implementation and Codex architecture

Recommended implementation, not a strict library commitment:

- TypeScript + a small web UI framework such as React, with a local state model for sessions and answer groups.

- Pure music-model module: pitches, octaves, enharmonic conversion, keys/scales, chord sets, onsets, durations, validators.

- Exercise generator module: random generation with constraints, templates for simple harmonic motion, and optional seeded randomness.

- Import/parser module: strict JSON and/or documented shorthand, structured validation errors, preview before practice.

- Audio module: browser Web Audio playback via Tone.js Sampler or soundfont implementation; instrument sample loading/cache.

- Piano keyboard component: full range, horizontal scroll, polyphonic selection, key preview, octave controls.

- Piano-roll component: shared visual model supporting hidden-answer playback and post-submit colored feedback.

- Grading/diff module: exact note comparison with sequence alignment and understandable summaries.

- PWA layer: mobile responsive rules, service worker/offline asset caching, simple local preferences.

- Keep the data model independent of the sound library and visualization to make future instrument changes or rich music notation easy.

- No backend routes, user-auth flow, cloud database, LLM API keys, MCP server, microphone DSP, or MIDI handling in initial implementation.

### 3. Manual export/import and changing data formats

Provide a simple way to export saved data on one device and import it on the other. Automatic synchronization, accounts, and a backend are not required.

- Support transferring or combining sessions between phone and computer. Plan to include relevant exercise data, attempts/results, tags, favorites, and folder organization as appropriate.

- At the export/import step, define identifiers, format versioning, duplicate detection, merge behavior, and treatment of a session edited on both devices.

- Repeated imports should not accidentally duplicate the same saved sessions or attempts; decide the concrete rules during that step.

- Export/import format stability is not an early priority. It is acceptable to change the format and discard or reset older development data rather than build complex migrations.

- Do not hold up Free play, practice, or other early features to pre-build export formats, extensive statistics logging, or backward compatibility.

## Test Cases

### 1. Test cases that should work

- Single pitch C4: enter C4; green and correct. Enter C5; marked incorrect by default because octave differs.

- Triad [C4,E4,G4]: entering G4,C4,E4 in any tap order counts as correct.

- Triad [C4,E4,G4]: entering C4,E4,A4 highlights correct notes, wrong A4, and missing G4.

- Sequence C4,D4,E4: answer C4,E4 with the middle group omitted; feedback should not call the correct last note wrong merely because an earlier group is missing.

- Repeated notes C4,C4: must remain two separate onset groups rather than collapsing into one.

- Mixed exercise [C4,E4,G4] then D4 then [G3,B3,D4]: group editing and grading work normally.

- Imported exercise in G major: ordinary unmarked C# triggers the import validator’s chromatic warning; C#! is intentionally allowed. Key A minor with G# is not automatically treated as musically invalid. Built-in special-chord exceptions follow generator rules and do not require explanatory settings warnings.

- A long imported passage can include chords and notes at different onsets, including a chromatic pitch, without destroying playback order.

- Phone portrait shows rotation request during practice; landscape shows keyboard; rotating back/forth preserves the answer.

- Exercise audio playback alone must not reveal solution pitches. Submission or an explicit session-history View Synthesia action may reveal them; keep prior solution viewing distinguishable for attempt statistics.

