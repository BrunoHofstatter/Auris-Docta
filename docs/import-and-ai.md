# Exercise import and AI

> **Status:** The strict JSON music validator exists. A paste/import screen, key-aware warnings, batch/session import, compact notation, and AI generation instructions are not implemented. The current JSON shape is [music-format.md](music-format.md).

Migrated from the “Import & AI” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Pasted text notation and import validation

Use the documented version 1 JSON music format for robust, human-readable, machine-generated exercise data. A compact shorthand remains an optional later convenience, not an implemented input format.

Historical compact-input illustration (not accepted by the current version 1 JSON parser):

```text
Key: G major
Tempo: 90 BPM
Instrument: piano
G4 1
A4 0.5
[B4,D5] 1
C#5! 0.5
D5 1
```

In this historical illustration, one line is one onset group, brackets indicate simultaneous notes, and “!” marks intentional chromaticism. Its decimal durations were only an early notation sketch. Current JSON timing is already settled as exact quarter-note fraction strings; a future shorthand parser must convert into that contract rather than introduce an ambiguous time unit.

The canonical JSON document is specified in [music-format.md](music-format.md), with a complete [C-major example](../examples/c-major-scale.json). It uses music.parts[].notes, instrument references, explicit answer-group note references, and absolute exact quarter-note fraction strings. Earlier sketches using top-level key, tempoBpm, instrument, and events are superseded. An import workflow must target the actual schema and convert musical time through the shared tempo map.

Parser requirements:

- Reject malformed note names, impossible octaves, negative/zero durations, invalid event types, and unsafe/oversized input.

- Normalize whitespace and allowable accidentals (#, b) and support enharmonic equivalents.

- Display a preview and helpful line/event-specific errors before starting the exercise.

- Sort/check event order and prevent accidental duplicate entries within one simultaneous group.

- Imported data is data only: never evaluate executable JavaScript contained in imported content.

- Allow mixed single-note and multi-note groups in the same exercise.

- Make longer sequences and polyphonic music possible without changing the answer-entry concept.

## 2. Key-aware note validation

Each imported exercise may declare a tonal center and key/mode. The planned import validator will determine scale membership and warn about chromatic/out-of-key notes; the current core validator only checks structural and pitch validity.

- Default: warn about notes that do not belong to the declared key; do not silently alter or delete them.

- An intentional-chromatic marker or equivalent acceptance control is planned for the import workflow. The historical shorthand example C#5! expresses that intention; the exclamation mark is not part of a valid version 1 pitch string. Keep the pitch playable without unnecessary warnings, and define the actual annotation/control during the import step.

- The user can choose strict validation for simple in-key exercises or warning-only validation for real music.

- If a chromatic pitch is unmarked, show the specific offending note, event, and an explanation; allow correction or explicit acceptance.

- Key rules must account for harmonic and melodic minor and common chromatic techniques; declaring “A minor” does not make G# automatically erroneous. Distinguish simple scale membership from actual harmonic correctness.

- A key is a guide, not proof that every musical pitch must fall in its seven-note scale. Imported passages can have accidentals, borrowed chords, tonicization, and modulation.

- Key changes inside one passage are already representable through music.keyChanges. The future import workflow should reuse that map. Automatic key estimation remains an optional future extension.

## 3. Batch import and AI instructions

The import format must distinguish separate exercises explicitly, so a reader can load either one exercise or a batch without confusing an exercise boundary with a note/chord group.

- A batch becomes one session; practice presents its exercises sequentially, one at a time. Support pausing and resuming rather than requiring completion in one uninterrupted sitting.

- AI generation instructions should cover single passages and batches such as 20 progressively harder exercises.

- Each exercise carries the musical data and relevant metadata required for playback, validation, and later classification. Exact batch/session schemas are deferred to their implementation steps.

- Validation and import previews should provide useful errors and metadata while avoiding an accidental reveal of solution pitches before practice.


