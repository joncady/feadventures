# Fire Emblem Adventures

A browser-based, real-time enemy swarm game built with **Phaser 3, TypeScript and Vite**. This migration retains the original Fire Emblem assets and arena survival design.

Play: https://joncady.github.io/feadventures/

## Develop

Use Node.js 22 (CI) or Node.js 20.12+ locally.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. Choose Chrom, Lucina or Frederick. Move with WASD or arrow keys, attack with Space, and pause with P. Movement direction determines attack direction; standing attacks retain the last direction. Vulneraries restore 25 HP. Defeat every enemy to advance to the next wave. Try again resets the entire battle.

```sh
npm run check       # rules tests, strict TypeScript checking, production build
npx playwright install chromium
npm run test:e2e    # browser gameplay regression tests
npm run preview    # serve the build
```

## Structure

- `src/game/scenes/BootScene.ts`: asset loading and animation registration.
- `src/game/scenes/ArenaScene.ts`: the first playable survival scene and its lifecycle.
- `src/game/data/config.ts`: original map geometry and typed character/enemy definitions.
- `src/game/systems/rules.ts`: rendering-independent movement, combat and spawn rules.
- `src/game/systems/navigation.ts`: shared terrain navigation with clearance for enemy bodies.
- `src/main.ts`: browser menus, HUD, audio controls and scene transitions.
- `public/assets/`: assets reused from the original game.
- `v1/`: preserved legacy game, original assets, build configuration and GameCube server. Local dependency/build folders are preserved but ignored by Git. `archive-manifest.json` records checksums of legacy game files at migration time.
- `docs/migration-issues.json`: migration backlog and created issue URLs.

## GitHub Pages

`.github/workflows/pages.yml` builds, tests and deploys `dist` when `master` or `main` changes. Pull requests run the same checks without deploying. Pages must use **GitHub Actions** as its source in repository Settings → Pages. Build output uses relative URLs, so it works under `/feadventures/` or a `github.io` repository root. Only the new build is published; the v1 source remains in the repository.

## Migration scope

The local build supports one keyboard player, all three hero choices, the original first map, five enemy types, directional melee, increasing waves, pickups, pause, muted-by-default audio and restart. Enemies use a shared navigation field to route around terrain. Melee strikes have visible wind-ups, locked aim, recovery and cooldowns; moving out of range or behind cover can evade them. Archers keep distance, move around cover and fire arrows that collide with terrain. Spawns are restricted to areas connected to the player.

This remains a migration in progress. Sprites animate using the original standing row. Full directional and attack frames, co-op, legacy balance/progression and touch controls remain outstanding. Navigation handles static terrain; crowd congestion can still occur in narrow passages.

Board: https://github.com/users/joncady/projects/2

`npm run project:sync` creates missing issues and attaches them to the board. It requires `gh auth login --hostname github.com --scopes project` and safely reuses issues with matching titles.

The current incremental improvements were approved for release on 2026-10-10. Full parity remains unfinished. Keep subsequent implementation local; obtain approval before another deployment. See `docs/parity.md` and `docs/combat-roadmap.md` for gaps, researched combat rules and the ranked backlog.
