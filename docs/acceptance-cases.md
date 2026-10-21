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


