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
- Dark studio (formerly Design C) is the selected visual direction for Home and Free play. Home keeps the existing decorative piano-roll idea on the left and only Free play / Practice buttons on the right, with no extra visible labels or descriptions. Portrait phones stack the illustration and menu; Practice still opens its labeled preview. See [the design guide](../design/design-guide.md) for its appearance and component styles.
- Sustain toggle, volume, optional note labels, independent multitouch, computer-keyboard input, and interruption cleanup are implemented in Free play. See [free-play.md](free-play.md) for exact defaults.
- Piano samples are bundled Salamander recordings with retained attribution, source pinning, and checksums. Other timbres remain a later feature.
- Basic generators mix selected item types, use numbered octave selections, a key or none, one 20–300 BPM value in steps of five, linked item count/duration, simultaneous/successive styles, and root-position/random inversions. All generated tones must fit the chosen octaves.
- Full-sequence practice and step-by-step practice are both required. Incorrect step-by-step answers stay on the current item. Future items' pitches stay hidden.
- Sessions can be continued freely across breaks/days. One imported batch forms one session. Redos create separate attempts. Favorites can survive deletion of the original session.
- Customizable statistics and arbitrary manual session selection are agreed future features. Early test practices may have no statistics and can be discarded.
- Manual cross-device export/import is planned; automatic sync is not required. Its session/merge schema is separate from the settled musical format.

## Still open for the relevant step

### Basic generators and practice

- Exact seventh-chord qualities.
- Which special chord qualities may introduce outside-key tones and precise root constraints.
- Exact successive slow/medium/fast spread values, ordering details, and whether multiple styles may be selected together.
- Linked duration/item rounding, minimum length, note sustain, and the gap between repeated items.
- Whether/how to select or mix multiple exercise instruments once additional sounds exist.
- Detailed phone practice screens and answer-editing interactions beyond the agreed behavior.

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
