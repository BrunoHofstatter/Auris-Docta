# Google Docs migration notes

Migration date: October 21, 2026 (America/Sao_Paulo).

Source: [Auris Docta - Piano Ear-Training App](https://docs.google.com/document/d/1wyQmN2cOXtfLRFFy2uItYIpH8JgFTqWFJunVlW2kdfE/edit?usp=drivesdk).

Source document ID: `1wyQmN2cOXtfLRFFy2uItYIpH8JgFTqWFJunVlW2kdfE`.

Source revision: `AHj4eMQAKr7e8z635_TGKBIxafsWiriPzTwAUemFjLOJqiCJOUfdyUhGwealNCqbrNGpXtAAPnATb2NRJ54HEgpYeXmWLV_7t18-QJzm8gA`.

## Coverage

| Source tab | Nonempty paragraphs | Working Markdown |
| --- | --- | --- |
| Overview | 25 | [Product overview](../product-overview.md) |
| Build Plan & Decisions | 38 | [Build plan](../build-plan.md) |
| Music & Exercises | 65 | [Music and exercises](../music-and-exercises.md) |
| Sound & Practice | 49 | [Sound and practice](../sound-and-practice.md) |
| Synthesia & Feedback | 27 | [Synthesia and feedback](../synthesia-and-feedback.md) |
| Import & AI | 36 | [Import and AI](../import-and-ai.md) |
| Sessions & Favorites | 31 | [Sessions and favorites](../sessions-and-favorites.md) |
| Statistics | 12 | [Statistics](../statistics.md) |
| Storage & Architecture | 29 | [Storage and delivery](../storage-and-delivery.md) |
| Test Cases | 11 | [Acceptance cases](../acceptance-cases.md) |
| **Total** | **323** | **10 topic files** |

All 323 paragraph texts are preserved in [google-docs-2026-10-21.md](google-docs-2026-10-21.md). The structured document body was checked against the all-tabs text read: every nonempty paragraph matched. There were no tables, headers, footers, footnotes, embedded/positioned images, or hyperlinks requiring additional conversion. Headings and flat lists were converted to Markdown; blank spacing is not treated as substantive content.

## Reconciliation

Working topic files preserve the product requirements and open questions while replacing superseded implementation assumptions. Later format and Free play agreements take precedence over the old scrolling keyboard, grouped-duration restriction, undecided sample/library choice, and illustrative JSON/shorthand sketches. See [decisions.md](../decisions.md) for the explicit crosswalk.

Existing `music-format.md`, `free-play.md`, and `architecture.md` were reviewed against current source. The format now distinguishes implemented audio from later seeking/grading; architecture includes the newly configured GitHub Pages workflow. `implementation-status.md` separates actual code/tests from planned features and pending physical iPhone acceptance.

The original Google Doc was read without edits, deletion, reorganization, sharing changes, or comments. Local Markdown is now the maintained project documentation. The archive remains a dated source record.

## Workspace copies

The development copy and nested Git checkout initially matched for source, documentation, examples, scripts, README, and relevant configuration. The completed documentation and AGENTS.md were mirrored into the checkout so they can be committed with the app. No Git staging, commit, push, or deployment is part of this migration.
