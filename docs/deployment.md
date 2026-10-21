# Development and deployment

## Current setup

The project is a static Vite application. `.github/workflows/deploy.yml` is configured for GitHub Pages; it runs on pushes to `main` and on manual dispatch. It installs with `npm ci`, runs `npm test`, builds with `npm run build`, uploads only `dist/`, and deploys through GitHub Pages.

The workflow uses Node 22 and pinned GitHub Action revisions. `package.json` requires Node 22.12 or newer. Asset paths, including piano samples, are relative so the app can run beneath a repository subpath. Hash navigation does not require route rewrites.

This documents the checked-in workflow configuration. No successful live deployment or hosted URL was verified during the documentation migration.

## Local commands

Run from the intended project root containing `package.json`:

```sh
npm ci
npm run dev
```

Verification and production preview:

```sh
npm test
npm run build
npm run preview
```

`npm run dev` serves development source; `npm run preview` serves the latest built `dist/`. Rebuild before using preview to inspect changed source. `npm run deploy` is not a defined script; deployment is handled by GitHub Actions.

## GitHub Pages setup

1. Ensure the app and `.github/workflows/deploy.yml` are inside the actual Git checkout.
2. Set repository **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
3. Commit and push changes to `main`, or manually dispatch the workflow.
4. Wait for **Deploy Auris Docta to GitHub Pages** to succeed and use the deployment URL reported by Actions/Pages.

Selecting a branch under **Deploy from a branch** does not run this Vite build. Do not commit `node_modules/` or `dist/`; the workflow creates production output from source. It publishes the app build, not the project documentation tree.

## Project folder

Open **`C:\Users\bruno\Auris Docta\Auris Docta`** in Codex, Antigravity, or a terminal. This is the single active project folder and contains `.git`, `package.json`, source, documentation, and the design brief. Run all development, test, build, and Git commands here. The parent `C:\Users\bruno\Auris Docta` is only a container for this folder.

Originally the parent also contained a development copy, alongside the nested Git checkout. During cleanup on October 21, 2026, all 81 parent source/configuration/documentation files were verified byte-for-byte identical to their retained counterparts. The redundant parent files, dependencies, and generated build were moved outside the project to `C:\Users\bruno\.codex\backups\auris-docta-parent-20261021-185818`. They are a recovery copy, not a working project. The 14 unique screenshots and audit artifacts were moved into this checkout's ignored `artifacts/` folder and their hashes verified.

There is no longer a second active app copy to synchronize. Git history, existing uncommitted work, and the GitHub remote remain in the original checkout. No commit, push, or deployment was performed by the cleanup.
