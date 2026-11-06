# Decisions and open questions

This records the current decisions after the Google Docs planning and the Step 1/2 discussions. Detailed requirements remain in the linked topic documents; this file distinguishes settled choices from deferred design.

## Settled

- Personal ear-to-piano transcription for Bruno; iPhone Safari is primary, Windows laptop is supported. Include mobile layout/touch behavior in each relevant step.
- Responsive browser app, static delivery, no initial application backend/accounts/paid AI runtime. PWA installation and offline guarantees remain later work.
- TypeScript, React, Vite, plain CSS, Zod, Vitest, and native Web Audio. GitHub Pages workflow selected/configured; live deployment is not confirmed by this audit.
- One canonical version 1 JSON music document: exact quarter-note fraction strings on an absolute timeline from zero; independent note lifetimes; instrument instances and parts; optional hand assignments; key/meter maps and step tempo changes.
- Global strength default 0.7 with per-note overrides. Only on/off sustain is required, at instrument level. Key release/duration is distinct from sound decay/pedal release.
- Written-score notation/layout, unpitched percussion, microtones, continuous pitch/expression, other pedals, half-pedaling, and tempo ramps are outside the initial format scope.
- Explicit answer-group note references, derived pitches, exact octave-sensitive enharmonic comparison, one pitch per group even when doubled across instruments, and separate groups for repeated notes. Rhythm/strength/pedal/instrument identity are not grading criteria.
- Desktop Free play starts with all 88 keys. Mobile starts at B3–C6, uses roughly half the landscape height, and navigates by octave chevrons rather than scrolling. Portrait shows a rotate prompt.
- Dark studio (formerly Design C) is the selected visual direction for Home, Free play, and Practice. Home keeps the decorative piano-roll idea on the left and only Free play / Practice links on the right. Portrait phones stack the illustration and menu; Practice opens its implemented setup. See [the design guide](../design/design-guide.md).
- Sustain toggle, volume, optional note labels, independent multitouch, computer-keyboard input, and interruption cleanup are implemented in Free play. See [free-play.md](free-play.md) for exact defaults.
- Piano samples are bundled Salamander recordings with retained attribution, source pinning, and checksums. Other timbres remain a later feature.
- Basic generators mix selected item types, use numbered octave selections, a key or none, one 20–300 BPM value in steps of five, linked item count/duration, simultaneous/successive styles, and root-position/random inversions. All generated tones must fit the chosen octaves.
- Chord qualities, including seventh qualities, are independently selectable. The implemented initial catalog has four triads and six seventh qualities using Brazilian-familiar symbols (C7, C7M, Cm7, Cm7M, Cm7(b5), C°7). Cdim explicitly means the three-note diminished triad in this selector. Major/minor triads are the initial Chords selections; other qualities remain off until chosen.
- Full-sequence practice and step-by-step practice are both required. Incorrect step-by-step answers stay on the current item. Future items' pitches stay hidden.
- November 4, 2026 planning: equal probability across enabled top-level categories (Single note, Octave, Random pair, Chords), then equally across selected chord qualities within Chords. Chords uses Configure with individual Triad/Seventh choices; diminished and half-diminished options are not automatically enabled.
- Basic generator keys are Major, Natural minor, or None. With a key selected, notes/pairs/octaves/triads stay in scale; a selected seventh quality may alter only its seventh while its underlying triad stays in scale. Impossible selected combinations warn and require settings adjustment rather than silent substitutions or omissions. See the examples and inversion-independent rule in [Music and exercises](music-and-exercises.md#43-key).
- Choose Simultaneous or Successive; Successive offers Slow/Medium/Fast and Ascending/Descending. Initial first-to-last attack spans are 3/4, 1/4, and 1/32 of the item interval, subject to listening/polish. Hold constituent notes until the item boundary, release the final item at its end, and start without a deliberate silence gap or exercise pedal across items.
- Items/Seconds is one editable quantity with the other displayed. Preserve the chosen input basis across BPM changes; round to whole items, minimum one, and show actual scheduled duration.
- Answer-piano taps silently toggle pitches, with no drag selection; sound mode supports auditioning/gliding. Offscreen selected pitches appear under the appropriate octave arrow. Source playback must not expose solution pitches through the keyboard or readouts.
- Full-sequence answers use a scrollable numbered group window. Selecting an earlier group makes it current; Next visits an existing next group or appends from the last. Right-click/long-press opens Insert before / Delete, with renumbering and Undo for deletion. No extra selected-group menu button. Ignore an unused trailing empty draft on submit; flag empty groups in the middle.
- Step-by-step has no group window. Wrong checks report incorrect without note corrections. Reveal shows only the current solution and does not advance; checking the correct answer remains required. Replay preserves generated notes; new generation is a distinct action; setup changes do not silently replace an active exercise.
- Final implementation choices: initial Single note, octaves 4/5, None, 60 BPM, 10 items, Simultaneous, Full sequence; remember the last setup locally. Start/Next do not auto-play. Correct step checks wait for Next/Finish. The generator permits at most 200 items; answer editing permits 400 groups. Use the existing Dark studio tokens, a portrait-friendly setup, and landscape phone workspace. The current exercise is disposable on leaving/reloading Practice.
- November 4 correction rework: Synthesia-style falling notes with a full 88-key piano even on mobile landscape, minimal margins, pitch/octave symbols on bars, and audio-clock synchronized playback-bar seeking. Green = correct; yellow = missed source note with otherwise identical styling; red = user's wrong answer, with stripes/outline and ×. Replay sounds the source only; red timing is illustrative because answers have no performance timestamps. Fullscreen shows the visualization and compact playback strip, using native fullscreen or an in-page fallback. Keep existing alignment; further alignment refinements are low priority for known-count generated exercises.
- Sessions can be continued freely across breaks/days. One imported batch forms one session. Redos create separate attempts. Favorites can survive deletion of the original session.
- Customizable statistics and arbitrary manual session selection are agreed future features. Early test practices may have no statistics and can be discarded.
- Manual cross-device export/import is planned; automatic sync is not required. Its session/merge schema is separate from the settled musical format.

## Still open for the relevant step

### Basic generators and practice

- Physical iPhone acceptance and any resulting audio/touch/layout polish, including the successive spreads and repeated-item separation.
- Further chord qualities and presets if actual practice creates a need.
- Whether/how to select or mix multiple exercise instruments once additional sounds exist.
- Real-device correction/fullscreen acceptance and any resulting label/touch polish. More sophisticated alignment for ambiguous reordered or repeated groups can wait for a practical need. Loop boundaries are not guaranteed gapless.

### Later musical generation/import

- More musical melody/progression rules, independent melody/accompaniment generator patterns, and future presets.
- Compact shorthand, intentional-chromatic annotation/acceptance controls, import warning presentation, and batch/session envelope schema.
- Concrete AI generation instructions targeting the actual implemented importer. No live connector is planned.

### Sessions, statistics, and transfer

- AI tag taxonomy; custom tags remain supported in principle rather than an exhaustive fixed classification.
- Changing settings during a continued session and appending imported exercises/batches.
- Grouping attempts launched from Favorites and the reference/copy strategy that keeps favorites independent of deleted sessions.
- Exact accuracy formulas/denominators, extra/missing note/group treatment, and final filtering/selection controls.
- Passive history-playback statistics, idle/pause/away time, and sessions resumed across days.
- Export identifiers, revisions, duplicates, merge behavior, and conflicts when both devices edit the same session.
- Exploratory-piano timbre defaults and the option of using a different sound from the exercise.

## Superseded assumptions

| Older planning sketch | Current decision |
| --- | --- |
| No implementation exists | Foundations complete; Free play implemented; iPhone acceptance pending |
| Horizontal mobile keyboard scrolling | Octave arrows with B3–C6 initially and access to A0–C8 |
| A common note duration per group is enough for the model | Every note has its own duration; group membership is separate |
| Instruments/strength/independent hands can wait in the data model | They are already represented in the version 1 contract |
| Tone.js/SoundFont library still to choose | Native Web Audio with independent sampled voices |
| Piano samples unspecified | Bundled Salamander distribution selected and attributed |
| Top-level tempoBpm/instrument/events JSON sketch | The exact document is [music-format.md](music-format.md) |
| C#5! is accepted pitch syntax | Historical shorthand only; current JSON pitch syntax excludes ! |
| Key changes require a future model extension | music.keyChanges already represents them; import/UI behavior remains later |
| Parts need full notation machinery | Pitched parts/hand assignments are included; written-score notation is outside initial scope |
| One built-in type per session / one AI exercise per session | Mixed selected types and one full imported batch per session |

The last row was already resolved in the Google Doc and is preserved here to prevent older assumptions from returning. Read [the archive](archive/google-docs-2026-10-21.md) only for historical wording, not to undo later decisions.
