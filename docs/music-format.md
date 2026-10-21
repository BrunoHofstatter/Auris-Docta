# Auris Docta music format — version 1

This is the agreed music format implemented in Step 1. It describes music independently of playback, visualization, and exercise checking. The same document supplies all three. It is an application format for pitched music, not a sheet-music interchange standard.

For a complete example, open [C major scale and final chord](../examples/c-major-scale.json). It plays C4 through C5 in quarter notes, followed by C4/E4/G4 held for four quarter notes. At 120 quarter notes per minute, its scheduled length is six seconds. Piano release tails can continue afterward. The declared left-hand part is silent.

## 1. Document structure

```json
{
  "format": "auris-docta",
  "version": 1,
  "title": "My piece",
  "music": {
    "timeUnit": "quarterNote",
    "length": "4",
    "defaultStrength": 0.7,
    "tempoChanges": [{ "at": "0", "quarterNotesPerMinute": 120 }],
    "keyChanges": [{ "at": "0", "tonic": "C", "mode": "major" }],
    "meterChanges": [{ "at": "0", "numerator": 4, "denominator": 4 }],
    "instruments": [{ "id": "piano-1", "sound": "acoustic-grand-piano" }],
    "parts": [{
      "id": "right",
      "name": "Piano — right hand",
      "instrumentId": "piano-1",
      "hand": "right",
      "notes": [{ "id": "n1", "pitch": "C4", "at": "0", "duration": "1" }]
    }]
  },
  "exercise": {
    "answerGroups": [{ "id": "g1", "noteIds": ["n1"] }]
  }
}
```

`format`, `version`, `title`, and `music` are required. `exercise` is optional: a piece can be played without defining a graded exercise. Within `music`, the required fields are `timeUnit`, `length`, `tempoChanges`, `instruments`, and `parts`. All other fields described here are optional unless stated otherwise.

## 2. Time and rhythm

Every part uses the same absolute timeline, beginning at zero. The time unit is **one quarter note**, regardless of the meter. `at` is a position on that timeline; `duration` is a length. Positions do not restart at each measure or part.

Time values are JSON strings containing an integer or an exact fraction:

| Value | Meaning |
| --- | --- |
| `"0"` | Beginning of the piece |
| `"1"` | One quarter note after the beginning |
| `"7/2"` | Three and a half quarter notes after the beginning |
| `"1/3"` | One third of a quarter note |

Decimal strings (`"3.5"`), numeric JSON values (`3.5`), whitespace, leading zeroes, negative values, and zero denominators are invalid. `"7/2"` and `"14/4"` represent the same time. The implementation uses reduced integer fractions internally; seconds are calculated at the playback/visualization boundary.

`length` is the scheduled end of the piece and must be positive. Notes must release at or before it. Gaps imply silence; leading and trailing silence are allowed. No explicit rest events are required. The interface may display beat counting from one without changing stored positions.

## 3. Pitches and note events

```json
{ "id": "n1", "pitch": "F#4", "at": "7/2", "duration": "1/2", "strength": 0.9 }
```

Each note requires `id`, `pitch`, `at`, and a positive `duration`. Notes have independent lifetimes: overlapping bass, melody, chords, and repeated pitches are supported. A chord consists of notes at the same position. An arpeggio consists of notes at different positions; exercise grouping is independent of either arrangement. Array order does not determine playback time. Duplicate attacks of the same sounding pitch at the same position within one part are rejected; doubling across separate parts/instruments is allowed.

Pitch notation uses a letter, optional single/double sharp or flat, and an octave: `C4`, `Bb3`, `F##4`, `Ebb4`. Middle C is C4 and A4 is 440 Hz. Letters are case-insensitive; surrounding whitespace and Unicode sharp/flat signs are normalized. Source spelling is retained. Equality uses the sounding pitch, so C#4 and Db4 match, and B#3 matches C4. Octaves remain significant.

The music domain supports sounding pitches C−1 through G9 (internal numbers 0–127). A piano keyboard's A0–C8 range is a separate UI/instrument constraint. The internal numbering does not require MIDI hardware or MIDI integration.

`duration` ends at **key/note release**, rather than guaranteeing instantaneous silence. Audio release tails and pedal resonance are separate. Repeated attacks of the same pitch have different IDs, including when an earlier note is still sustaining. The eventual audio engine must preserve these separate note instances.

An optional note-level `hand` (`"left"` or `"right"`) overrides its part's hand assignment. Hand assignment does not change pitch, timing, or grading.

## 4. Note strength

`music.defaultStrength` sets the piece-wide attack strength. Omitting it uses **0.7**. A note's optional `strength` overrides that default. Strength must be greater than zero and at most one. To omit a note, remove its event rather than using zero strength.

Strength means attack intensity, approximately how strongly a piano key is struck. It does not guarantee a particular measured loudness across instruments. Sample response belongs to the sound engine. Strength does not change during a held note in version 1.

## 5. Instruments, parts, and hands

An instrument is a **sounding instance** with a unique `id` and a `sound` identifier. A part is a named collection of notes referencing an instrument by `instrumentId`.

- Both piano-hand parts reference the same piano instance, so they share pedal behavior.
- A flute or a second piano has its own instrument instance and one or more parts.
- All parts play concurrently on the shared timeline. Parts may be silent.
- Parts may share one instrument, and notes may overlap within or across parts.
- A part's optional `hand` is a default assignment for its notes. It is independent of any future notation staff or voice.

Sound identifiers are lower-case names such as `acoustic-grand-piano`, `flute`, or `strings`. Version 1 validates the identifier's shape, not sample availability. A future audio engine must report an unavailable sound explicitly and must not silently substitute a different instrument. Additional sounds need not change the document structure.

For an instrument switch, put the subsequent notes in a part referencing the new instrument instance. There is no sound-change event in version 1.

## 6. Sustain

An instrument may contain an optional sustain timeline:

```json
{
  "id": "piano-1",
  "sound": "acoustic-grand-piano",
  "sustain": [
    { "at": "0", "down": true },
    { "at": "4", "down": false }
  ]
}
```

Sustain is initially off. Each event sets the state until the next event. Events affect that instrument's parts together. They must have strictly increasing positions; a sustain event at exactly `length` is allowed. Redundant state assignments are allowed.

With sustain down, releasing a note leaves it eligible to ring until pedal release. A note whose key is still held remains held when the pedal is released. Pedal events at a timestamp are applied before note releases and attacks at that timestamp. The renderer processes note releases before new attacks at the same timestamp, preserving repeated notes as separate instances.

Playback stops clear active notes and pedal state. At the scheduled end, release remaining pedal state automatically; an explicit final pedal-up event is optional. Seeking/restarting must reconstruct the active notes and pedal state at the destination. These are requirements for Step 2, not an audio implementation in Step 1.

Only on/off sustain is included. Physical sympathetic resonance depends on the eventual instrument engine; no acoustic simulation is promised by this data model.

## 7. Tempo, key, and meter changes

Change arrays must be in strictly increasing chronological order, with no equivalent duplicate positions. Changes take effect **at** their position and remain active until replaced. Tempo, key, and meter changes must lie before `length`.

### Tempo

At least one tempo event is required, beginning at `"0"`. Values are quarter notes per minute, from 1 to 1,000. These format bounds are separate from the basic generator's agreed 20–300 BPM control.

```json
"tempoChanges": [
  { "at": "0", "quarterNotesPerMinute": 120 },
  { "at": "4", "quarterNotesPerMinute": 60 }
]
```

Here position four occurs at two seconds; position six occurs at four seconds. Note releases that cross a tempo change also use the whole tempo map. Changes are instantaneous. Gradual tempo curves are not included.

### Key

`keyChanges` is optional; omission or an empty list means no declared key. Before its first entry there is no declared key. Each entry has `at`, `tonic` (uppercase A–G with an optional single/double sharp or flat), and `mode` (`"major"` or `"minor"`). A minor key is tonal context, not a restriction to the natural-minor scale.

Key metadata does not retune notes or prohibit chromatic notes. Contextual import warnings and intentional-chromatic annotations can be designed in the import step; the core validator does not declare a note wrong because it falls outside a key.

### Meter

`meterChanges` is optional; omission means unspecified meter. Before the first entry, meter is unspecified. `numerator` is an integer from 1 to 64; `denominator` is 1, 2, 4, 8, 16, 32, or 64. Meter labels/grouping never redefine the quarter-note time unit or alter existing note times.

## 8. Exercise answer groups

```json
"exercise": {
  "answerGroups": [
    { "id": "g1", "noteIds": ["n1"] },
    { "id": "g2", "noteIds": ["n2", "n3", "n4"] }
  ]
}
```

The array explicitly defines answer order. Each group selects source notes by ID; the correct pitches are derived from those notes. There is no second editable answer key. A source note may belong to at most one group. Notes omitted from all groups can remain audible accompaniment.

Several successive notes can form one broken-chord answer. Two instruments doubling the same sounding pitch within one group require entering that pitch once. Repeated pitches in different groups remain separate answers. Tap order within a group does not matter; group order does. Group membership is not inferred from note onsets.

Version 1 grades pitch including octave, with enharmonic equivalence. It does not grade duration, rhythm, strength, pedal, hand, or instrument identification. Answer input stores ordered sets of sounding pitches separately from source music. The source solution and pitch-bearing visualization remain hidden until submission or an explicit reveal. Grading UI and sequence alignment belong to later steps.

If `exercise` is present, it must contain at least one nonempty answer group. Its references must exist and its IDs must be unique. Optional accompaniment and music-only documents need no fake answer groups.

## 9. IDs, validation, and limits

IDs begin with an ASCII letter, followed by letters, numbers, underscores, or hyphens; maximum length is 64 characters. Instrument IDs, part IDs, and answer-group IDs are unique within their respective collections. Note IDs are unique across all parts. Titles and part names contain 1–200 characters after trimming.

The core validator accepts unknown data and reports paths such as `music.parts.0.notes.2.duration`. JSON is parsed as data; no content is executed. Unknown properties and unsupported versions are rejected so musical instructions cannot be silently ignored.

Resource limits for this version:

| Resource | Limit |
| --- | --- |
| JSON text | 4 MiB UTF-8 |
| Instruments / parts | 64 / 128 |
| Notes | 10,000 total |
| Answer groups / references per group | 10,000 / 128 |
| Tempo, key, or meter entries | 1,000 per map |
| Sustain entries | 10,000 per instrument |
| Time string | 24 characters |
| Time numerator / denominator | 1,000,000,000,000 / 1,000,000 |
| Individual time values and timeline length | 1,000,000 quarter notes |

These are technical bounds, not suggested practice lengths. A piece must contain at least one note. Each instrument reference must resolve. All durations are positive and all notes release within the scheduled length. Valid data is necessary but does not imply that every sound has been installed.

## 10. Scope and evolution

Version 1 includes concurrent pitched instruments, parts and hand assignments, independent overlapping notes, exact timing, strength, on/off sustain, step tempo changes, key/meter context, and explicit exercise grouping.

It excludes unpitched percussion, continuous pitch bends, microtonal tuning, continuous expression within a held note, other pedals, half-pedaling, tempo ramps, notation layout, written rests/ties, lyrics, and repeat/jump instructions. Repeated music can be expanded directly on the timeline. Optional section labels can be introduced later through a documented format revision.

The music document is not a session, attempt-history, statistics, batch-import, or cross-device backup format. Those are separate planned steps and may wrap/reuse this musical content. No early statistics storage is required.

Version 1 readers reject unsupported fields/versions. Future revisions must specify changed behavior and how existing documents are handled. They must not silently discard sound-affecting instructions.

## 11. Implementation

- `src/music/model.ts`: runtime schema, TypeScript types, references, bounds, and JSON validation.
- `src/music/time.ts`: exact rational arithmetic and conversion through a step tempo map.
- `src/music/pitch.ts`: spelling normalization, sounding pitch, frequency, and piano UI range.
- `src/music/timeline.ts`: derived timeline for future sound/visualization, resolved strength/hand, and solution groups.
- `src/music/music.test.ts`: executable examples and validation/time-model checks.

No audio engine, importer screen, or piano-roll renderer is claimed by these foundation modules.
