# Synthesia and feedback

> **Status:** A Synthesia-style falling-note correction view, full 88-key piano on desktop and mobile landscape, synchronized seeking, fullscreen, and green/red/yellow feedback are implemented for built-in practice. Physical iPhone acceptance is pending. Durable saved attempts and session-history actions remain later work.

Migrated from the “Synthesia & Feedback” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Synthesia-style piano-roll visualization

Build a piano-roll renderer from the shared event model. This is a first-class feature, not a separate video-generation system.

### Practice playback

- Display vertical falling notes over the entire 88-key A0–C8 keyboard, including mobile landscape. Use minimal margins and no horizontal pitch scrolling. The correction keyboard is a visual playback reference; the answer/sound keyboards retain their existing mobile range navigation.

- Notes animate toward the keyboard as music plays, showing pitch positions, length, and simultaneity. During an unanswered practice attempt, hide the pitch-bearing source visualization until submission or an explicit solution-view action. A harmless playback progress bar can be visible. Session-history Synthesia is an intentional solution-view action; preserve this distinction for future statistics.

- Controls can replay the full phrase, slow it, and loop parts of it. A selected loop is useful after making a mistake.

- The playback bar is also the visualization timeline. Seeking forward or backward immediately repositions the notes while playing or paused. The leading edge reaches the key at the source attack; the bar length represents the source key-down duration. The keyboard highlights the source pitches at the selected position.

- Fullscreen contains just the falling-note view, keyboard, and compact playback strip with play/pause, replay, Stop, seeking, time, and exit fullscreen. Use native element fullscreen when available and an in-page viewport-filling fallback otherwise. Exiting preserves the exercise, result, and playback position; Escape exits the fallback.

### Feedback / correction

- Reveal the full correct notes after submission, or when the user intentionally chooses View Synthesia from session history. Session access is unrestricted; record prior solution viewing when attempt history is implemented.

- Overlay submitted pitches at their aligned source groups. Audio always plays the source solution; wrong answer notes are silent visual comparisons.

- Colors agreed: green = correctly identified note, red = incorrect extra/substituted note, yellow = correct note missed by the user.

- Green and yellow bars have identical styling apart from color. Red bars have a striped fill, contrasting outline, and × beside their pitch name to distinguish the user's wrong answer from source notes. Include a compact color legend outside fullscreen.

- Write pitch symbols and octave numbers on note bars, preserving source spelling and using ♯/♭. Labels may run vertically on narrow bars. Tapping/clicking a visible bar, or activating it with Enter/Space, opens a readable note detail overlay. An explicitly revealed, ungraded solution uses neutral amber bars instead of awarding green matches.

- Chords show parallel bars in the corresponding pitch lanes; simultaneous attacks reach the keyboard together. Successive chord notes preserve their independent source attack/release times. Subtle numbered horizontal boundaries identify source groups.

- Manual answers contain no performance timing. Red notes associated with a source group use its overall attack-to-release span for illustration, not a claim about the user's timing. Entire extra answer groups use short markers just before the next aligned source group, or at the end of the phrase; leading extras start at zero. Note details identify red timing as illustrative.

- Offer replay, existing speed/item-range loops, and note inspection. Automatic replay of just the incorrect section remains optional future work.

- The roll displays durations as supplied for the original sound, but does NOT score rhythm or timing of the user's manual answer.

- Keep the existing order-preserving alignment for inserted/deleted answer groups. Refining ambiguous swaps/repeated-note tie rules is deferred until actual practice warrants it; basic generated exercises expose the configured item count, so extra/missing groups are not the current priority. Never treat sequence answers as an unordered bag of pitches.

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

- The current disposable flow supports Try again on the same exercise and New exercise with the same configuration. A retry after review is marked Solution viewed. There is no durable attempt history yet. For future saved exercises, keep distinct attempts and earlier submitted results rather than overwriting the original; that persistence belongs to Step 12.


