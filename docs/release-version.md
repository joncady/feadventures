# Frontend version

The visible header badge and Phaser's `app-version` registry use the version in `package.json`. The first labeled release is **1.0.0**. Vite injects the same version into development and production builds; there is no separate saved-browser version.

For each subsequent completed change, run `npm run release:bump` once before the final checks. It increments the patch version (1.0.0 → 1.0.1), updates both package files, and does not create a Git tag or commit. A Vite restart/rebuild picks up the new value. Group the related implementation, version bump, verification and GitHub bug/issue updates into the same reviewable change.

Check `npm run check` and the browser tests before pushing. Bumping a version does not publish or deploy the game.
