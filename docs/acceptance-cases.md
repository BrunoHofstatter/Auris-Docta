# Product acceptance cases

> **Status:** The practice cases below describe target behavior, not passing end-to-end tests. Existing unit coverage and completed browser checks are recorded in [implementation-status.md](implementation-status.md) and [free-play.md](free-play.md).

Migrated from the “Test Cases” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Test cases that should work

- Single pitch C4: enter C4; green and correct. Enter C5; marked incorrect by default because octave differs.

- Triad [C4,E4,G4]: entering G4,C4,E4 in any tap order counts as correct.

- Triad [C4,E4,G4]: entering C4,E4,A4 highlights correct notes, wrong A4, and missing G4.

- Sequence C4,D4,E4: answer C4,E4 with the middle group omitted; feedback should not call the correct last note wrong merely because an earlier group is missing.

- Repeated notes C4,C4: must remain two separate onset groups rather than collapsing into one.

- Mixed exercise [C4,E4,G4] then D4 then [G3,B3,D4]: group editing and grading work normally.

- Future import workflow: an ordinary unaccepted C# in a G-major exercise should trigger a useful chromatic warning or acceptance flow, while an intentionally accepted chromatic note remains playable. The historical C#! shorthand is illustrative and is not valid version 1 pitch syntax. A minor with G# is not automatically musically invalid. Built-in special-chord exceptions follow generator rules without explanatory settings warnings. The current core JSON validator checks structure/pitches, not these contextual warnings.

- A long imported passage can include chords and notes at different onsets, including a chromatic pitch, without destroying playback order.

- Phone portrait shows rotation request during practice; landscape shows keyboard; rotating back/forth preserves the answer.

- Exercise audio playback alone must not reveal solution pitches. Submission or an explicit session-history View Synthesia action may reveal them; keep prior solution viewing distinguishable for attempt statistics.

- Correction shows all 88 piano keys on desktop and mobile landscape. Source bars fall to their keys in sync with audio; forward/backward seeking repositions them immediately, including while paused. Green/yellow bars differ only by color. Wrong answer bars are red with stripes/outline and ×, have pitch labels, and never add sounds to source playback. Tapping a bar shows a readable detail.

- Fullscreen contains the falling notes, keyboard, and compact transport only. Native fullscreen exit and in-page fallback/Escape preserve the result and playback position. Keep controls usable and the complete keyboard visible at 844×390 and 568×320; actual iPhone browser chrome/safe areas require physical-device acceptance.

## 2. November 4 basic-generator and answer-interaction planning cases

These are target cases for the relevant steps, not implemented/passed tests.

- Enable Single note and Chords with several selected qualities: each category has probability 1/2, and chord qualities share the Chords probability equally. Do not require exact equal counts from a short random exercise.
- In C major, permit C7's Bb and Dm7M's C# as seventh exceptions; reject D7 because F# is in its underlying triad. Apply the same structural rule to inversions. Ordinary single notes do not inherit chromatic exceptions.
- A selected quality/category with no valid candidates produces a useful warning and requires settings adjustment. Do not silently drop it or expand the allowed octaves. An empty enabled Chords selection is invalid.
- At 120 BPM, Successive Slow/Medium/Fast first-to-last spans are initially 375/125/15.625 ms; direction reverses pitch attack order without changing answer membership. All constituent notes release at the item boundary; the final item releases at the scheduled end.
- Request 7 seconds at 100 BPM: show 12 items and actual duration 7.2 seconds. Changing BPM preserves requested seconds in Seconds mode and item count in Items mode.
- Replaying preserves the same pitches. New generation is explicit. Audio interruption/rotation preserves the exercise and entered answers.
- Silent answer taps select/deselect once; dragging does not paint answer selections. Switching to sound mode preserves the answer and permits auditioning. Offscreen answer selections appear under the correct octave arrow without exposing source pitches.
- Select an earlier numbered group, edit its notes, and move forward: preserve group ordering and later answers. Insert before/delete from right-click or long-press, renumber correctly, and support Undo after deletion. No extra group-menu button is required.
- Ignore an unused trailing empty draft on submit; flag an empty group between entered groups. Build the group window from entered answers, not hidden source totals.
- Step-by-step omits the group window. A wrong check reveals no correction; explicit reveal shows only the current item and does not auto-advance.


