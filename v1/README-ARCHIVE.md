# Legacy v1 archive

This folder preserves the previous DOM/jQuery/TypeScript game as it existed at the start of the migration, including uncommitted local changes. The original game lives directly in this folder; the original controller experiment is in `GameCube Controller/`. The outer repository's Git history is retained in place.

The migration did not repair this version. Its partially implemented canvas conversion and disabled gameplay block remain as found. `archive-manifest.json` records SHA-256 checksums for the archived game source and assets. Existing `node_modules` and `dist` were moved here locally and remain ignored.

The active game, build and deployment configuration live in the repository root above this folder.
