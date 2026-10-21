# Synthesia and feedback

> **Status:** Piano-roll visualization, correction UI, and sequence-aligned grading remain planned. The shared model already derives source pitch groups, but that is not a complete grader or practice workflow.

Migrated from the “Synthesia & Feedback” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Synthesia-style piano-roll visualization

Build a piano-roll renderer from the shared event model. This is a first-class feature, not a separate video-generation system.

### Practice playback

- Display a horizontal or vertical time/pitch piano roll (a classic falling-note Synthesia presentation is desirable), linked to a virtual piano keyboard.

- Notes animate toward the keyboard as music plays, showing pitch positions, length, and simultaneity. During an unanswered practice attempt, hide the pitch-bearing source visualization until submission or an explicit solution-view action. A harmless playback progress bar can be visible. Session-history Synthesia is an intentional solution-view action; preserve this distinction for future statistics.

- Controls can replay the full phrase, slow it, and loop parts of it. A selected loop is useful after making a mistake.

### Feedback / correction

- Reveal the full correct notes after submission, or when the user intentionally chooses View Synthesia from session history. Session access is unrestricted; record prior solution viewing when attempt history is implemented.

- Overlay the submitted notes for side-by-side comparison, keeping relative group order aligned.

- Colors agreed: green = correctly identified note, red = incorrect extra/substituted note, yellow = correct note missed by the user.

- Display note labels, chords, and group boundaries in a way that works at mobile landscape sizes; include a color legend.

- Chords show multiple vertically stacked note bars at the same time.

- Offer replay of the whole solution and optionally only the incorrectly identified section; allow inspecting a group.

- The roll displays durations as supplied for the original sound, but does NOT score rhythm or timing of the user's manual answer.

- For inserted/deleted answer groups, ideally align the sequences rather than naïvely comparing row N to row N and making every later group appear wrong (recommended implementation enhancement).

- Do not reveal the solution merely because exercise audio is played. Reveal it after Submit or an explicit View Synthesia/solution action.

## 2. Correctness and grading

- Source of truth is the canonical event-note data, not a second AI text label.

- Grade which pitches were entered in each group, and whether the sequence of groups is correct.

- Compare simultaneous note groups as sets of sounding pitch+octave values, independent of key-tap order. Enharmonic spellings normalize to the same pitch. A pitch doubled across instruments within one group is entered once, while repeated pitches in separate groups remain distinct.

- Default to exact pitch including octave; optionally add “ignore octave” as a practice setting later if the musical task warrants it.

- Use enharmonic normalization for correctness while retaining user-friendly spelling for display.

- Distinguish matching notes, additional wrong notes, missing correct notes, and entire extra/missing groups.

- No timing score, rhythm score, dynamic/velocity score, or requirement to perform into a microphone.

- For chord naming modes, derive chord quality, root, and inversion from pitches where unambiguous; if chord spelling/analysis is uncertain, do not assert a false definitive label.

- Provide separate measures of note-level accuracy and whole-group/whole-exercise correctness. A partially correct chord may contain correct notes while the chord as a whole is incorrect. Exact formulas, denominators, and additional statistics will be specified in the statistics step; colored correction remains the immediate feedback.

- Support redoing saved exercises. Keep earlier submitted answers and results; each redo creates a separate attempt rather than overwriting the original. Distinguish first attempts, retries, and attempts made after viewing the solution.


