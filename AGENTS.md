# Auris Docta

Auris Docta is Bruno's personal piano ear-training app, primarily for iPhone Safari and also usable on a Windows laptop. It is a client-side React/TypeScript/Vite application with native Web Audio, sampled piano, and a shared versioned music model. The initial product needs no backend, accounts, paid AI API, microphone transcription, or MIDI input.

## Documentation

Start with [docs/README.md](docs/README.md). Local Markdown is the maintained project documentation; the original Google Doc is preserved as a historical archive.

- [Product overview](docs/product-overview.md): goals and product boundaries.
- [Build plan](docs/build-plan.md) and [implementation status](docs/implementation-status.md): agreed order, implemented work, and pending acceptance.
- [Music format](docs/music-format.md): canonical JSON, timing, parts/instruments, strength, sustain, and answer groups.
- [Free play](docs/free-play.md) and [architecture](docs/architecture.md): implemented behavior and code boundaries.
- [Music and exercises](docs/music-and-exercises.md), [sound and practice](docs/sound-and-practice.md), and [feedback](docs/synthesia-and-feedback.md): future practice work.
- [Import and AI](docs/import-and-ai.md), [sessions/favorites](docs/sessions-and-favorites.md), [statistics](docs/statistics.md), and [storage/delivery](docs/storage-and-delivery.md): later requirements.
- [Decisions](docs/decisions.md), [acceptance cases](docs/acceptance-cases.md), and [deployment](docs/deployment.md): context and verification.

## Working on the project

Plan, implement, and polish one agreed step at a time. Include phone layout and touch behavior throughout. Preserve the user's control over sessions and practice; distinguish recommendations from settled requirements and planned features from implemented behavior. Keep source music, playback timing, and answer grouping separate, and protect solution visibility during future practice.

Keep the relevant Markdown current when behavior or decisions change. The Google Docs archive is historical evidence, not an alternative implementation contract. Run commands from the intended project/Git root containing `package.json`; see deployment notes if there are nested copies.

Use Node.js 22.12+ and npm. For code changes, run `npm test` and `npm run build`, plus relevant browser/device checks. Real iPhone audio/touch acceptance is still pending; do not describe emulation as a passed physical-device test.
