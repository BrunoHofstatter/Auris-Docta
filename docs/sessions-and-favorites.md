# Sessions and favorites

> **Status:** These are agreed future requirements for Step 12. No session library, attempt persistence, favorites, or folders are implemented yet.

Migrated from the “Sessions & Favorites” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Session definition, classification, and unrestricted continuation

A session is a practice collection containing one or more exercises, not a time-limited uninterrupted sitting. The user controls when to continue it or create another session.

- A built-in session may contain exercises generated from one selected type or a mixture of selected types, including mixtures within an exercise. This replaces the one-type-per-session restriction. Detailed rules for changing settings while continuing a session remain for later session planning.

- One imported AI batch creates one session containing all the batch’s exercises, presented one at a time. A single imported AI passage creates a session containing one exercise. This supersedes the earlier one-exercise-only rule for AI sessions.

- Classify sessions by source and selected types. Built-in exercises may include several generator categories, so classification must accommodate mixed types. AI-generated sessions are classified as AI-generated and can have editable tags for instruments and musical content.

- The exact AI musical-content categories are deliberately open: the user does not yet know what kinds of passages he will request. Support useful custom tags instead of fixing an exhaustive taxonomy now.

- Keep the instrument actually used for an exercise/attempt distinguishable from descriptive AI tags, so instrument-based statistics reflect playback rather than only labels.

- Allow resuming after 15 minutes, returning the next day, and adding further exercises to an existing session where applicable. No automatic expiry, forced closure, or requirement to start a fresh session after a break.

- For imported sessions, work through the available imported exercises sequentially. How to append further imported exercises or batches later can be specified in the detailed session/import plan; continuation does not require a live AI connection.

- Separate Continue session, which advances through or adds exercises, from Redo exercise, which practices an existing saved exercise again.

- Each exercise is saved within its session once persistence is implemented. Preserve its source notes/events, playback context, submitted answers, and results as needed by review and statistics.

- Redoing creates a distinct attempt rather than overwriting an earlier answer/result. Keep first attempts, retries, and attempts made after viewing a solution distinguishable.

## 2. Sessions tab and exercise review

Provide a sessions tab with folders or collections, unrestricted access, and a numbered list of exercises within each session.

- Rename, organize, and delete sessions; browse and find sessions using useful summaries and filters.

- Show summaries such as type/source, dates, exercise count, accuracy, listening time, and practice time. A session reused across days retains the dates of its individual exercises/attempts.

- For every numbered exercise, provide Listen, Practice again, and View Synthesia actions.

- Listen plays the exercise audio and shows a duration/progress bar that can be dragged to seek forward or backward.

- Practice again opens a mode restricted to that one exercise. It does not generate additional exercises or continue through the rest of the session. Returning goes directly to the previous sessions location, preserving the relevant session, scroll position, and filters.

- View Synthesia reveals the exercise through the piano-roll visualization with synchronized audio and a seek bar for forward/backward inspection. A separate screen listing the notes as letters is not required; note labels may remain part of Synthesia.

- Allow inspecting previous submitted answers, results, and attempts alongside the saved exercise.

- Favorite an exercise from session history or while practicing; support selecting multiple exercises to favorite together.

- Allow deliberate viewing of solutions. Record whether a solution was viewed before a later attempt when tracking is implemented, so fresh and assisted attempts can be analyzed separately.

- Decide during detailed statistics planning how passive history playback affects listening counts/time; browsing should remain distinguishable from a new submitted practice attempt.

## 3. Favorite exercises and folders

Favorites is a dedicated tab for saved practice material the user wants to reuse. Exercises already belong to sessions; favoriting organizes reusable material rather than creating another completion result.

- Create folders or collections to organize favorite exercises.

- Favorite an exercise directly during practice or by selecting it in the sessions tab.

- Listen to, inspect through Synthesia, and practice favorite exercises again. Preserve distinct attempt results and offer instrument changes where supported.

- Keep a favorite exercise usable if its original session is deleted. The exact reference/copy strategy and organization model can be chosen during implementation.

- Decide where attempts launched from Favorites are grouped during the detailed session plan; do not silently overwrite the original session’s attempts.


