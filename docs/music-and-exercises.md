# Music and exercises

> **Status:** The shared version 1 music model and basic configurable generator/setup are implemented. Physical iPhone acceptance is pending. AI/import and richer musical generators remain later work. [music-format.md](music-format.md) defines the exact JSON contract.

Migrated from the “Music & Exercises” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Two ways to obtain exercises

### 1.1 Built-in deterministic generator

This is a random generator governed by musical constraints, not a list of prewritten exercises and not necessarily completely unstructured randomness.

- Generate single notes, multiple successive notes, simultaneous notes/chords, and several short chord groups.

- Basic configuration includes multiple exercise types and numbered octaves, one key or none, one tempo, linked item count/duration, instrument selection, playback style, and conditional chord inversions. See section 4 for the agreed behavior.

- Allow no key restriction or one selected major/natural-minor key. Notes, pairs, octaves, and triads stay in its scale. Selected seventh qualities may use an outside-scale seventh only when their underlying triad fits the scale. General key-centered chromatic generation is deferred; see section 4.

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

This section records the agreed basic-generator behavior, implemented after the November 4 discussion. It replaces earlier assumptions about one type per built-in session and strictly simultaneous groups. The built-in generator is configurable practice, not necessarily a composed musical passage.

### 4.1 Items, exercise types, and mixing

An item is one single note or one logical group of pitches: an octave, random pair, or chord. An exercise contains the chosen number of ordered items. Several types can be selected together and interchanged within the same exercise.

The top-level selectable categories are Single note, Octave (the same pitch class one octave apart), Random pair (two different pitches no more than an octave apart), and Chords. Chord qualities are selected individually within Chords.

Choose equally among enabled top-level categories for each item, then equally among the selected qualities when Chords is chosen. For example, Single note plus Chords gives each category a 50% probability regardless of how many chord qualities are selected. These are independent random choices, not a guarantee of equal counts in a short exercise. Custom weights are deferred.

Do not confuse item count with the number of constituent pitches: ten triads are ten items, not thirty. Selecting several types allows mixed sequences of single notes and multi-note groups.

#### Chord terminology and individual selection

Planning clarification from October 28, 2026, extended November 4; now implemented.

Bruno understands chords through Brazilian music terminology and chord-symbol conventions. Explain chord types through the underlying triad quality and the seventh interval, with familiar symbols such as C7, C7M, Cm7, and Cm7M. This is a naming and presentation preference; the underlying pitch structures and the canonical music format do not change. It does not by itself decide the app's interface language.

Each chord quality is independently selectable. Seventh chords are not an indivisible package: supporting a quality does not automatically include it in a practice exercise. The initial catalog is four triads (major, minor, diminished, augmented) and the six seventh qualities below. Major/minor triads are initially selected within Chords; diminished and half-diminished options start off. Further qualities can be added later.

The six implemented seventh qualities use the following familiar example symbols:

| Chord quality | Familiar example symbol |
| --- | --- |
| Major triad with a minor seventh (dominant seventh quality) | C7 |
| Major triad with a major seventh | C7M |
| Minor triad with a minor seventh | Cm7 |
| Minor triad with a major seventh | Cm7M |
| Half-diminished seventh | Cm7(b5) |
| Diminished seventh | C°7 |

Distinguish a diminished triad from a diminished seventh chord explicitly. Example roots illustrate a quality, not a restriction to that root: selecting the C7 quality allows that structure on eligible roots under the generator's key and range rules. Answers remain actual pitches with octaves; these configuration choices do not introduce chord-name grading.

For the triad examples use C (major), Cm (minor), Cdim (diminished triad, explicitly labeled three notes), and Caug (augmented). C(b5), suggested in conversation, was an incorrect label for a diminished triad and must not be used for it. Keep the four-note diminished seventh explicitly labeled C°7 and the half-diminished seventh Cm7(b5).

**Implemented UI:** a top-level Chords category has a selected-quality summary and Configure button opening a dedicated view with Triads and Seventh chords. Selections survive temporarily disabling Chords. Diminished and half-diminished qualities are not automatically enabled. Setup is portrait-friendly; phone practice uses landscape and the selected Dark studio design.

These are generator settings within the existing mixed-exercise flow. They do not require a separate session for each chord family; selected chord qualities can mix with one another and with other selected exercise types.

### 4.2 Octave range

Choose one or several numbered octaves using simple octave buttons. All generated pitches must lie within the union of the selected octaves, including every chord tone and inversion. Do not add a range-preview keyboard or exact pitch endpoints now; revisit endpoints only if actual practice creates a need.

### 4.3 Key

Select one major or natural-minor key, or None (unrestricted). Harmonic/melodic minor options are outside the current generator scope; this does not change the canonical format's broader meaning of minor-key metadata.

- Every pitch in single notes, random pairs, octaves, and triads must belong to the selected scale.
- A seventh chord's underlying triad must belong to that scale; its seventh may be outside the scale when required by the explicitly selected quality. This test uses the underlying chord structure regardless of inversion.
- In C major, C7M fits completely; C7 may use Bb as its seventh; Dm7M may use C# as its seventh. D7 is excluded because its underlying triad contains F#. Caug is excluded because G# is part of its triad. Select None for unrestricted qualities/roots.
- All pitches must still fit the selected octaves and the installed piano's range, including an outside-scale seventh.

This is an agreed basic-generator training rule, not a general rule of harmony. No additional chromatic-mode toggle or permanent explanatory text is required. Warn about an impossible selected category/quality and require a settings adjustment before generation. Do not silently omit selected qualities, change the key, expand the range, or renormalize probabilities around impossible selections. Chords enabled without a selected quality and empty category/octave selections also need a clear validation message.

### 4.4 Playback within an item

Choose Simultaneous or Successive. Successive exposes one speed (Slow, Medium, or Fast) and one direction (Ascending or Descending). These settings apply throughout the exercise; mixing styles is not required. Successive playback spreads the constituent pitches of one multi-note item; it does not change their membership in one answer group. Single-note items are unaffected.

The main BPM controls spacing between items. Initial successive spreads, measured from the first attack to the last, are 3/4 of an item interval for Slow, 1/4 for Medium, and 1/32 for Fast. Space attacks evenly across that span. At 120 BPM these spans are 375 ms, 125 ms, and 15.625 ms respectively, regardless of the number of pitches in an item. These are agreed starting values for listening/polish, not a claim of completed audio acceptance.

Each note remains held from its own attack until the next item boundary; successive chords build up rather than releasing each note before the following attack. Release the final item at the end of its allotted interval. Start without an intentional inter-item silence gap; preserve distinct release/retrigger events for repeated pitches and tune separation only if listening shows a need. Generated exercise playback initially has no pedal extending across items, independent of exploratory-piano sustain.

### 4.5 Chord inversions

Enable the inversion selector when at least one chord type is selected. Offer only Root position only and Random. Random varies among the chord’s valid inversions, including root position, while keeping every pitch within the selected octave range. The setting applies to chord items, not unrelated single notes or random pairs. Grade the resulting actual pitches and octaves as usual.

### 4.6 Speed and instrument

Use one BPM value per exercise. Provide a numeric speed control from 20 to 300 BPM, adjusted in steps of 5, rather than seven preset boxes. Varying tempo within an exercise and selecting several tempos are outside the current scope.

Start a new item on each beat: 60 BPM = one item per second; 120 BPM = one item every 0.5 seconds; 240 BPM = one item every 0.25 seconds. Faster basic sequences use higher BPM rather than separate half-beat/quarter-beat rhythm controls.

Include instrument selection, starting with piano and using other instruments when they are added. Detailed behavior for selecting/mixing several instruments has not been settled.

### 4.7 Linked item count and duration

Provide an Items/Seconds selector with one editable quantity and the calculated other quantity displayed. Use seconds = Items × 60 ÷ BPM and Items = seconds × BPM ÷ 60. Preserve the selected input basis when BPM changes: Items preserves item count; Seconds preserves requested duration and recalculates whole items. For example, 20 chords at 120 BPM occupy 10 seconds, including the last item's allotted interval. This is scheduled exercise length, not guaranteed sound-decay or total practice time.

An item can contain several notes, so this count is not a note count in mixed/chord practice. The configured item count is intentionally known; the earlier hidden-group-count preference does not override this setup choice.

Round non-integer item results to the nearest whole item, with a minimum of one, and display the corresponding actual scheduled duration. For example, requesting 7 seconds at 100 BPM yields 12 items and an actual duration of 7.2 seconds. Items are whole numbers; requested seconds remain distinguishable from actual duration. The initial practical limit is 200 generated items; excessive seconds/BPM combinations warn rather than silently cap. Calculated seconds display up to three decimal places. Manual full-sequence answers allow up to 400 groups to accommodate extra answers.

### 4.8 Full sequence and step-by-step practice

Full sequence: listen to the generated sequence, enter its ordered answer groups, and submit for feedback. Step by step: play one item, wait for the user’s answer/check, and advance only after it is correct. An incorrect answer stays on the same item and requires retrying. Replay the current item as needed; successive chord pitches still require one complete group answer.

Step-by-step has no answer-group selector window. A wrong check reports that the answer is wrong without exposing correct or missing pitches. Reveal solution deliberately shows only the current item and does not automatically advance; the user can inspect it, enter the answer, and check again. Future-item pitches remain hidden. A correct check locks that answer and waits for Next item (Finish on the final item), without automatically playing the next item.

In step-by-step mode, the seconds field gives the equivalent uninterrupted playback length. Waiting, exploration, and retries add to actual practice time. Feedback on one checked item must not reveal the pitches of future items. No rhythm/timing performance is graded.

Replay retains the generated notes. Generating a new exercise is a separate action. Changing setup must not silently replace the active exercise; apply it when starting a new exercise. Audio interruption and rotation preserve the current exercise and answer.

### Initial defaults and local preferences

Start with Single note only, octaves 4/5, no key restriction, 60 BPM, 10 items, Simultaneous, and Full sequence. Chords initially remembers Major/Minor triads, Root position, and Medium/Ascending when Successive is enabled. Setup preferences are saved locally; saved named presets and exercise/session persistence remain separate future features. Entering practice positions the phone keyboard from the configured octave range, never from the generated solution. Playback begins only after an explicit Play press and gesture-based audio enabling.

### 4.9 Recorded for later

Saved presets: agreed as a useful future feature, explicitly deferred. Eventually save reusable combinations of generator settings; do not require presets for the current basic exercise work.

Built-in generation of two hands / independent melody and accompaniment is still an open later design question, not a committed basic-generator feature and not restricted permanently to AI import. The music format already supports separate parts, both hands, independent motion, multiple instruments, and overlapping note lifetimes. Possible built-in patterns include melody over bass notes, block chords, or broken-chord accompaniment. Generator rules for these patterns need further design.

Other suggestions, such as custom probabilities for mixed types or more complex rhythmic patterns, are not agreed requirements for the current basic generator.


