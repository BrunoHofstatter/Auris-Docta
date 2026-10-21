# Music and exercises

> **Status:** The shared version 1 music model is implemented; exercise generators and practice settings are not. [music-format.md](music-format.md) defines the current exact JSON contract.

Migrated from the “Music & Exercises” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Two ways to obtain exercises

### 1.1 Built-in deterministic generator

This is a random generator governed by musical constraints, not a list of prewritten exercises and not necessarily completely unstructured randomness.

- Generate single notes, multiple successive notes, simultaneous notes/chords, and several short chord groups.

- Basic configuration includes multiple exercise types and numbered octaves, one key or none, one tempo, linked item count/duration, instrument selection, playback style, and conditional chord inversions. See section 4 for the agreed behavior.

- Allow no key restriction or one selected key. Ordinary items stay in key; selected special chord types may use outside notes needed for their structure. General key-centered chromatic generation is deferred; see section 4.

- Later musical melody generators may favor stepwise motion with occasional leaps or offer a leap-heavy style. These are not requirements for the basic random-item generator.

- Construct chords according to their selected qualities. Later progression generators can favor plausible harmonic movement; the basic mixed-item generator need not form a composed progression.

- Short exercises should be instant, repeatable on demand, and playable without AI.

- Deterministic means algorithmically generated and reliably checked; it does NOT mean every generated exercise is identical. A seeded random generator can make an exercise reproducible if that later proves useful.

### 1.2 Pasted AI-generated exercises

This is preferred for longer phrases, more interesting melodies, richer multi-chord passages, or musical ideas with expression, tension, and resolution.

- The user asks ChatGPT or Codex to create structured music text, copies it, and pastes it into the app's import screen.

- The app parses, validates, and performs the structured events; it must not need an AI call to play them.

- AI prompts might ask for a 15-second melancholy melody, rising phrase, resolution, and easy accompaniment, or 20 progressively harder chord-recognition exercises.

- The solution is embedded in / derived from the note data but remains hidden in practice mode.

- Prefer computing objectively checkable answers from the pitches rather than trusting AI-generated answer labels, since an AI can mislabel a chord or interval.

- AI import is a preference, not a hard technical limit: the built-in generator could make longer passages later if its composition rules improve.

## 2. Exercise categories

- Single-note identification: hear one note, find it on the real piano, enter its pitch and octave.

- Multi-note sequences: identify successive notes in the correct order.

- Intervals: hear two notes melodically or harmonically; reproduce/identify the pitches, with optional interval-name drills later.

- Chord identification: hear a chord simultaneously or successively according to playback style; enter its pitches and octaves as one answer group. Chord inversion generation offers Root position only or Random.

- Sequences of chords: identify several successive chord groups.

- Short melodies: reproduce the pitches and order, not the precise timing.

- Chord progressions: use harmonically meaningful sequences; optional chord-name/roman-numeral training can be added later.

- More complete music passages: mixed melody and accompaniment, possibly overlapping notes, mainly through AI import.

Musical guidance: the learning loop is ear-to-piano reproduction. A switchable sound piano is a core practice feature, giving the user a virtual instrument to explore pitches without editing the answer. Dedicated reference-note or tonic controls can remain optional future ideas.

## 3. Canonical note-and-event model

Represent music internally as ordered, timed note events rather than storing the exercise only as raw text or audio. This same model powers audio playback, piano-roll drawing, answer matching, and import/export.

Timed note events carry a pitch, absolute onset, and independent duration. Optional per-note strength inherits music.defaultStrength (0.7 if omitted). Instrument instances, parts, optional hand assignments, and instrument-level on/off sustain are represented now. Keep logical answer-group membership distinct from audible onset timing: a basic item can sound simultaneously or as successively spread notes while remaining one answer group. A sequence contains ordered groups, and the same pitch repeated in a later group is distinct.

Store pitches with octave explicitly: C4, F#4, Bb3, C5, etc. Normalize enharmonic spellings internally (e.g., C# and Db sound the same under equal temperament) while retaining the display spelling where useful.

Each note has its own duration and may overlap other notes or parts. Grouped onset/duration patterns are useful generator outputs, not restrictions of the canonical model. Absolute time is stored as exact quarter-note fraction strings; tempo, key, and meter changes are already represented. See [music-format.md](music-format.md) for the full contract.

Group membership, not key-tap order, defines an answer item. Successive playback within a chord/pair does not turn its constituent pitches into separate answer groups. Preserve their actual playback timing for audio and visualization.

## 4. Basic exercise generator — agreed design

This section records the current product design before coding. It replaces earlier assumptions about one type per built-in session and strictly simultaneous groups. The built-in generator is configurable practice, not necessarily a composed musical passage.

### 4.1 Items, exercise types, and mixing

An item is one single note or one logical group of pitches: an octave, random pair, or chord. An exercise contains the chosen number of ordered items. Several types can be selected together and interchanged within the same exercise.

Planned basic types: single note; octave (the same pitch class one octave apart); two different random pitches no more than an octave apart; major triad; minor triad; diminished triad; augmented triad; and seventh chords. Major/minor and other qualities can be selected individually. The exact list of seventh-chord qualities remains to be specified.

Do not confuse item count with the number of constituent pitches: ten triads are ten items, not thirty. Selecting several types allows mixed sequences of single notes and multi-note groups.

### 4.2 Octave range

Choose one or several numbered octaves using simple octave buttons. All generated pitches must lie within the union of the selected octaves, including every chord tone and inversion. Do not add a range-preview keyboard or exact pitch endpoints now; revisit endpoints only if actual practice creates a need.

### 4.3 Key

Select one key or None (unrestricted). Ordinary generated items stay in the chosen key. Selected special chord types may introduce the outside pitches needed for their structure; ordinary single notes must not become chromatic because those chord types are enabled. No explanatory key-conflict text is needed in the settings for this personal app.

A general key-centered mode with freely introduced chromatic notes is a later option. Recommendation still to refine: keep special-chord roots in the selected key and define precisely which selected chord qualities receive the exception.

### 4.4 Playback within an item

Offer four playback styles: Simultaneous; Successive — slow; Successive — medium; Successive — fast. Successive playback spreads the constituent pitches of one multi-note item; it does not change their membership in one answer group. Single-note items are unaffected.

The main BPM controls spacing between items; successive slow/medium/fast controls spacing within an item. Proposed initial behavior: play successive pitches from low to high and scale their spacing to fit the item interval. Exact spread amounts and whether several playback styles can be selected together remain to be finalized.

### 4.5 Chord inversions

Enable the inversion selector when at least one chord type is selected. Offer only Root position only and Random. Random varies among the chord’s valid inversions, including root position, while keeping every pitch within the selected octave range. The setting applies to chord items, not unrelated single notes or random pairs. Grade the resulting actual pitches and octaves as usual.

### 4.6 Speed and instrument

Use one BPM value per exercise. Provide a numeric speed control from 20 to 300 BPM, adjusted in steps of 5, rather than seven preset boxes. Varying tempo within an exercise and selecting several tempos are outside the current scope.

Start a new item on each beat: 60 BPM = one item per second; 120 BPM = one item every 0.5 seconds; 240 BPM = one item every 0.25 seconds. Faster basic sequences use higher BPM rather than separate half-beat/quarter-beat rhythm controls.

Include instrument selection, starting with piano and using other instruments when they are added. Detailed behavior for selecting/mixing several instruments has not been settled.

### 4.7 Linked item count and duration

Provide linked fields for Items and Duration in seconds. Editing either updates the other using the selected BPM: seconds = Items × 60 ÷ BPM; Items = seconds × BPM ÷ 60. For example, 20 chords at 120 BPM occupy 10 seconds, including the last item’s allotted interval. This is scheduled exercise length, not guaranteed sound-decay or total practice time.

An item can contain several notes, so this count is not a note count in mixed/chord practice. The configured item count is intentionally known; the earlier hidden-group-count preference does not override this setup choice.

Recommendation for non-integer results: round to the nearest whole item and show its corresponding duration. Exact rounding/minimum-length behavior remains to be finalized. Note sustain and the gap before the next item also remain to be tuned; a small automatic gap was suggested so repeated items are distinguishable.

### 4.8 Full sequence and step-by-step practice

Full sequence: listen to the generated sequence, enter its ordered answer groups, and submit for feedback. Step by step: play one item, wait for the user’s answer/check, and advance only after it is correct. An incorrect answer stays on the same item and requires retrying. Replay the current item as needed; successive chord pitches still require one complete group answer.

In step-by-step mode, the seconds field gives the equivalent uninterrupted playback length. Waiting, exploration, and retries add to actual practice time. Feedback on one checked item must not reveal the pitches of future items. No rhythm/timing performance is graded.

### 4.9 Recorded for later

Saved presets: agreed as a useful future feature, explicitly deferred. Eventually save reusable combinations of generator settings; do not require presets for the current basic exercise work.

Built-in generation of two hands / independent melody and accompaniment is still an open later design question, not a committed basic-generator feature and not restricted permanently to AI import. The music format already supports separate parts, both hands, independent motion, multiple instruments, and overlapping note lifetimes. Possible built-in patterns include melody over bass notes, block chords, or broken-chord accompaniment. Generator rules for these patterns need further design.

Other suggestions, such as custom probabilities for mixed types or more complex rhythmic patterns, are not agreed requirements for the current basic generator.


