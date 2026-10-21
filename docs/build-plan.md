# Build plan and decisions

> **Status:** Step 1 is complete. Step 2 is implemented with real-device acceptance pending. Steps 3–14 remain planned. Plan each step, implement it, and polish it; mobile work belongs within each step.

Migrated from the “Build Plan & Decisions” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Incremental build order and planning approach

The implementation order below remains incremental: plan a step’s specifics, implement it, and polish it. Design can look ahead across connected steps before coding. Foundations and Free play are implemented; the next unimplemented work starts with basic exercises and their listening, answering, and feedback flow (steps 3–6). Phone layouts and interactions are planned and implemented within each relevant step, rather than after that flow. This does not require implementing steps 3–6 together.

### Step 1 — Foundations, shared music format, and basic app layout

**Implementation status: complete.** The shared model, validation, homepage, and navigation are built. See [implementation-status.md](implementation-status.md).

Establish the note/event representation shared by sound, answer input, checking, visualization, generators, and exercise import. Include a basic homepage and navigation. Detailed session storage and export formats can wait.

### Step 2 — Piano sound engine and Free play

**Implementation status: implemented; actual iPhone acceptance pending.** See [free-play.md](free-play.md).

Build a permanent Free play screen where tapping keys plays the selected instrument without exercises or grading. Use it to test piano sound, the keyboard, chords, and audio behavior; also test scheduled sequence playback.

### Step 3 — Basic practice exercises

**Implementation status: planned.**

Introduce the configurable basic generator described in [Music and exercises](music-and-exercises.md), section 4: selected mixtures of notes, octaves, random pairs, triads, and seventh chords; octave ranges; key or none; one BPM value; linked item count/duration; instrument; simultaneous/successive playback; and root-position/random inversions. Single notes and major/minor triads remain useful first implementation slices. Complete the agreed basic scope incrementally; richer musical generation comes later.

### Step 4 — Answer input, editing, and basic checking

**Implementation status: planned.**

Implement the keyboard, typed input, simultaneous note groups, group navigation/editing, and simple note/chord comparison. Add the core input-piano/sound-piano switch so experimenting with sound does not modify answers.

### Step 5 — Synthesia and correction feedback

**Implementation status: planned.**

Build the animated piano roll and green/red/yellow feedback, including sequence alignment for missing/extra groups. Include synchronized seeking forward and backward and explicit solution visibility rules.

### Step 6 — Complete practice workflow and playback controls

**Implementation status: planned.**

Connect listening, answering, submission, review, and retry; finish replay, speed, looping, and navigation. Include full-sequence practice and step-by-step practice that advances only after the current item is correct. Practice becomes usable progressively through steps 3–5. Detailed history/statistics recording is not required here.

### Step 7 — Expanded practice generators and configuration

**Implementation status: planned.**

Expand beyond the basic generator with more musical melody/progression rules and further categories or customization as needed. Basic mixed-item sequences and their agreed controls belong to the basic-practice scope. Independent melody/accompaniment generation remains a later design question.

### Step 8 — Exercise import and validation

**Implementation status: planned.**

Support pasted structured exercises and batches with explicit exercise boundaries, validation, previews that do not accidentally disclose answers, and sequential practice.

### Step 9 — AI instructions and generation templates

**Implementation status: planned.**

Write instructions that reliably target the working import format, including individual passages and batches of exercises. Derive checkable answers from notes rather than trusting AI labels.

### Step 10 — Homepage, navigation, and settings

**Implementation status: planned.**

Finish the homepage and menus once their destinations and configuration needs are clear. Provide access to Free play, built-in practice, import, and later sessions, favorites, and statistics.

### Step 11 — Additional instruments

**Implementation status: planned.**

Add selectable timbres such as strings, guitar, flute, and synthesizer for exercises and Free play. Allow the exploratory sound piano to use an independently selected sound.

### Step 12 — Session library, favorites, organization, and customizable statistics

**Implementation status: planned.**

Design and implement session persistence, unrestricted continuation, exercise history/actions, separate attempts, folders, favorites, tags, filters, manual selection, and statistics. Requirements are recorded in [Sessions and favorites](sessions-and-favorites.md) and [Statistics](statistics.md) for detailed planning later.

### Step 13 — Session export/import between devices

**Implementation status: planned.**

Implement simple manual transfer and merging between phone and computer. Specify the session export format, identifiers, duplicate handling, and revisions at this stage; early formats/data can be changed or discarded.

### Step 14 — Installation and optional offline use

**Implementation status: planned.**

Finish PWA installation and optional offline assets/samples. Verify on the actual phone as well as the laptop. Mobile layout and functionality must already have been developed throughout the earlier steps.

## 2. Decisions deliberately deferred / trade-offs

- The initial JSON music format is settled and implemented in [music-format.md](music-format.md). Compact notation remains optional and must not compete with parser correctness. Batch/session and cross-device export formats remain separate later decisions.

- The initial piano samples are selected: 30 bundled Salamander MP3 files with attribution and a pinned source manifest. Additional instrument libraries remain a later choice; real iPhone sound, latency, and memory acceptance is still pending. See [Free play](free-play.md).

- Chord inversion generation is settled: enable an inversion selector when a chord type is selected, with only Root position only and Random. Answers still use the chord’s actual pitches and octaves; no separate inversion-name answer is required.

- Independent overlapping-note lifetimes are already supported by the version 1 model and audio engine. Each note has its own onset and duration; simple exercise generators may still produce grouped onsets.

- Detailed local statistics and manual export/import are agreed features. Their exact data model, filters, metrics, merge rules, and file format are deferred to their own steps. Early data does not require preservation or backward-compatible migration; automatic cloud sync and accounts are not required.

- More sophisticated harmonic analysis, modulation detection, audio recording, MIDI input, live AI generation, and MCP connector are explicitly outside the first version.

The design should remain personally useful: phone-first ear-to-piano transcription, an independent sound piano, fast answer entry, trustworthy comparison, good audio, multiple timbres, visual feedback, freely accessible sessions, favorites, and highly customizable statistics.


