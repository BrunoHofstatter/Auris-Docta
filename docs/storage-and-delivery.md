# Storage and delivery

> **Status:** Free play preferences are stored locally and a GitHub Pages deployment workflow is configured. Session persistence, manual transfer, PWA installation, and guaranteed offline use remain planned. See [deployment.md](deployment.md) for the current workflow; deployment success has not been established by this documentation migration.

Migrated from the “Storage & Architecture” source tab and reconciled with the agreed format and implemented app. [Documentation index](README.md) · [Original source snapshot](archive/google-docs-2026-10-21.md)

## 1. Device delivery, offline use, and local persistence

- Build one responsive web application usable from the Windows laptop and phone browser.

- Make it installable as a Progressive Web App: open the URL, Add to Home Screen / Install, then launch from the home-screen icon.

- GitHub Pages is the selected initial static-hosting workflow; .github/workflows/deploy.yml runs tests/build and publishes dist/ when main is pushed, or when manually dispatched. Deployment success and the actual live URL must be verified separately; a configured workflow alone does not prove a live deployment. Other static hosts such as Cloudflare Pages would also be sufficient. No app-store publication is needed.

- Hosting does not automatically provide cross-device sync. Keep local device state and provide a later manual export/import workflow to move or combine sessions and related saved data between phone and computer.

- Cache application assets and instrument samples for offline use where practical, understanding first installation/use usually needs a network connection.

- Save basic preferences locally when useful. Detailed session persistence, folders, favorites, and statistics will be designed and implemented in their later step. Do not delay early practice to implement statistics tracking or a durable session format.

- Browser storage can be cleared or evicted; no account/cloud backup is promised.

- Ensure touch targets are large enough for a mobile landscape keyboard and control bar.

## 2. Implementation and Codex architecture

Current implementation and planned module responsibilities (see [architecture.md](architecture.md) for the implemented boundaries):

- Implemented stack: strict TypeScript, React, Vite, plain CSS, Zod for runtime music validation, and Vitest. Local session state and answer editing are planned rather than already built.

- Implemented pure music-model modules: pitch spelling/octaves and enharmonic conversion, exact quarter-note time, independent note lifetimes, tempo/key/meter maps, instrument/part references, strength/sustain data, validators, and derived solution groups. Scale-membership and chord-generation logic remain part of the exercise/import steps.

- Planned exercise-generator module: random generation with constraints, templates for simple harmonic motion, and optional seeded randomness.

- Planned importer UI: version 1 JSON first, structured validation errors, and a preview before practice. Core JSON validation is implemented. Documented shorthand remains optional and unimplemented.

- Implemented audio module: native Web Audio with independent sampled voices, bundled Salamander acoustic piano, gesture unlock, sample loading/progress/retry, live sustain, interruption cleanup, and native-clock sequence scheduling. PWA asset caching is not yet implemented.

- Implemented reusable piano keyboard: full desktop range, mobile octave arrows, polyphonic live input, highlights, labels, and keyboard mapping. Answer-selection behavior will be added in the answer-input step; horizontal scrolling is superseded.

- Planned piano-roll component: shared visual model supporting hidden-answer playback and post-submit colored feedback.

- Planned grading/diff module: exact note comparison with sequence alignment and understandable summaries.

- PWA installation and service-worker/offline asset caching are planned. Responsive layout and simple Free play preferences are already implemented.

- Keep the data model independent of audio and visualization so future sound libraries and instruments can change without rewriting musical data. Full sheet-music notation and interchange are outside the agreed initial scope; independence does not imply that notation is already supported.

- No backend routes, user-auth flow, cloud database, LLM API keys, MCP server, microphone DSP, or MIDI handling in initial implementation.

## 3. Manual export/import and changing data formats

Provide a simple way to export saved data on one device and import it on the other. Automatic synchronization, accounts, and a backend are not required.

- Support transferring or combining sessions between phone and computer. Plan to include relevant exercise data, attempts/results, tags, favorites, and folder organization as appropriate.

- At the export/import step, define identifiers, format versioning, duplicate detection, merge behavior, and treatment of a session edited on both devices.

- Repeated imports should not accidentally duplicate the same saved sessions or attempts; decide the concrete rules during that step.

- Export/import format stability is not an early priority. It is acceptable to change the format and discard or reset older development data rather than build complex migrations.

- Do not hold up Free play, practice, or other early features to pre-build export formats, extensive statistics logging, or backward compatibility.


