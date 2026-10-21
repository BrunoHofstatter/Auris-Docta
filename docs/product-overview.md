# Product overview

> **Status:** Foundations are complete and Free play is implemented; actual iPhone acceptance is pending. The remaining app behavior below is agreed product scope, not a claim that it is already built.

Migrated from the “Overview” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

**Piano Ear-Training App - Auris Docta**

Design and implementation specification — decisions from the planning conversation

## 1. Purpose and learning context

Build a personal, browser-based ear-training application for Bruno that plays notes, chords, melodies, and short musical passages. The user explores pitches on a physical piano or the app’s sound piano, enters notes manually, and receives visual feedback. The phone is the primary device; laptop support is also required.

The aim is practical transcription by ear: listen, experiment on the physical piano or on-screen sound piano, identify pitches or harmony, enter an answer, and compare it with the source. This supports finding melodies from songs, identifying chords and progressions, constructing solo piano arrangements, and composing. The physical piano is mainly available on weekends; the app’s sound piano makes practice possible away from it. The app will mostly be used on the phone.

Product principle: deterministic playback and grading should be free, exact, and reliable. AI is optional for composing interesting longer exercises, but should not be required to synthesize the audio or validate simple answers.

Status: Step 1 foundations and the version 1 music model are implemented. Step 2 Free play is implemented; actual iPhone Safari acceptance remains pending. Practice and later features remain planned. Items labeled “Later/optional” or “Recommendation” are not automatically requirements for the next build step.

## 2. Agreed product boundaries

- This app is only for Bruno. Prioritize his control and preferences rather than assumptions about a public app: freely reopening sessions, adding exercises later, viewing solutions, editing organization, and selecting what counts toward statistics. Avoid unnecessary roles, access restrictions, forced workflows, and permission or confirmation steps. This does not override actual browser permissions or data-integrity requirements.

- Phone use is a core requirement and the primary design target. Mobile layout, touch controls, and different mobile functionality where useful must be planned and polished alongside each feature. Also support the Windows laptop. Progressive Web App (PWA) is the preferred delivery model.

- Practice is based on listening to generated sound, exploring notes with a physical piano or the app’s sound piano, and entering the answer manually.

- Manual entry options: primary on-screen piano; secondary typed note names. No MIDI keyboard integration and no microphone/transcription.

- No rhythm or timing grading. Rhythm exists in playback and in the visualization but correctness means notes/chords and order, not whether the user matched the timing of a performance.

- No backend, server, database account, paid AI API, or custom connector is needed for the initial app.

- Detailed local session history, favorites, customizable statistics, and manual export/import between phone and computer are planned later build steps. Automatic cloud sync is not required. Early test practices may be disposable or lack statistics.

- User does not want to implement a Codex/MCP connector now. Importing generated text by copy/paste is enough.

- Focus on an attractive, functional piano-roll/Synthesia-like visualization as a central playback and correction feature, not an afterthought.

## 3. Personal use, phone priority, and remaining planning decisions

This is Bruno’s personal app and will mostly be used on his phone. Treat these facts as decision rules throughout implementation, not as minor preferences.

- Plan mobile layout, touch interaction, usable control sizes, seeking, octave navigation, and mobile-specific functionality within each relevant feature. Mobile piano navigation now uses octave arrows rather than scrolling. Desktop remains supported, and mobile functionality must not be postponed to a final cleanup pass.

- Keep portrait-friendly menus and library screens and landscape practice with the agreed rotate message. Preserve exercise and answer state through rotation.

- Favor user control: freely access and continue sessions, inspect solutions, redo exercises, edit organization/tags, and choose the data included in statistics. Avoid imposing public-product roles, artificial access restrictions, or forced practice schedules.

- The planning method remains: list big steps first, then plan one step’s specifics, implement it, and polish it. This document records ideas for later detailed planning; it does not claim all screens, metrics, data formats, and interactions are finalized.

- Open detailed decisions include AI tag taxonomy, exact accuracy formulas, attempt grouping from Favorites, extending imported batches, passive playback statistics, idle-time handling, export merge rules, and exploratory-piano timbre defaults.

- Core decisions already settled include unrestricted session continuation, mixed selected types in built-in exercises/sessions, one session per imported batch, the sound-piano switch, favorites folders, the three session exercise actions, seekable Synthesia, customizable session selection for statistics, and manual cross-device export/import. Basic generator settings are detailed in [Music and exercises](music-and-exercises.md), section 4.


