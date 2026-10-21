# Auris Docta documentation

This folder is the maintained source of truth for the project. All ten tabs of the original Google Doc have been migrated into topic files, with later agreed decisions and the implemented code reconciled into the working documents. Future decisions and behavior changes should be recorded here.

## Start here

1. [Product overview](product-overview.md): purpose, learning context, personal use, and boundaries.
2. [Build plan and decisions](build-plan.md): the complete 14-step implementation order and deferred work.
3. [Implementation status](implementation-status.md): what is built, what is tested, and what remains.
4. [Architecture](architecture.md): current stack and module responsibilities.
5. [Decisions](decisions.md): settled choices, superseded assumptions, and genuinely open decisions.

## Implemented foundations and Free play

| Document | Contents |
| --- | --- |
| [Music format v1](music-format.md) | The exact shared JSON contract, timing, pitches, parts, instruments, strength, sustain, grouping, defaults, and limits |
| [Free play and audio](free-play.md) | Desktop/mobile layout, live input, keyboard mapping, audio lifecycle, sequence scheduling, samples, and pending real-device checks |
| [C-major example](../examples/c-major-scale.json) | A complete format example used by the tests |
| [Deployment](deployment.md) | The configured GitHub Pages workflow, build commands, and checkout layout |

Step 1 is complete. Step 2 is implemented with actual iPhone Safari acceptance pending. Graded practice and the later library/import/statistics/PWA features are not implemented.

## Complete product requirements by topic

| Topic | Source tab |
| --- | --- |
| [Product overview](product-overview.md) | Overview |
| [Build plan and decisions](build-plan.md) | Build Plan & Decisions |
| [Music and exercises](music-and-exercises.md) | Music & Exercises |
| [Sound and practice](sound-and-practice.md) | Sound & Practice |
| [Synthesia and feedback](synthesia-and-feedback.md) | Synthesia & Feedback |
| [Exercise import and AI](import-and-ai.md) | Import & AI |
| [Sessions and favorites](sessions-and-favorites.md) | Sessions & Favorites |
| [Statistics](statistics.md) | Statistics |
| [Storage and delivery](storage-and-delivery.md) | Storage & Architecture |
| [Product acceptance cases](acceptance-cases.md) | Test Cases |

Each topic starts with its implementation status. Requirements describe intended behavior; they do not prove the corresponding feature is already built. The precise music contract is in `music-format.md`, while `implementation-status.md` records actual delivery.

## Source preservation and maintenance

- [Google Docs source archive](archive/google-docs-2026-10-21.md): all 323 nonempty paragraphs from all ten tabs, including old ideas and illustrative notation.
- [Migration notes](archive/migration-notes.md): source identity, coverage, destination map, and reconciliation decisions.
- [Original Google Doc](https://docs.google.com/document/d/1wyQmN2cOXtfLRFFy2uItYIpH8JgFTqWFJunVlW2kdfE/edit?usp=drivesdk): provenance reference; the working documentation now lives locally.
- [Superseded format proposal](music-format-proposal.md): pointer to the accepted format, retained for existing links.

Update a feature's topic/specification and implementation notes together when it changes. Update the build plan/status when a step advances. Leave unresolved choices explicitly open. Keep the archive unchanged as a dated record; newer user decisions belong in the working files, not in edits to historical source text.
