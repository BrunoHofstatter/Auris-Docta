# Statistics

> **Status:** These are agreed future requirements for Step 12. There is no statistics recording or UI yet; formulas and detailed selection controls remain open as specified below.

Migrated from the “Statistics” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Customizable statistics and session selection

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


