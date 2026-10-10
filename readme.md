# Fire Emblem Adventures

A browser-based, real-time enemy swarm game built with **Phaser 3, TypeScript and Vite**. This migration retains the original Fire Emblem assets and arena survival design.

Play: https://joncady.github.io/feadventures/

## Develop

Use Node.js 22 (CI) or Node.js 20.12+ locally.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. Choose from 16 heroes, including Morgan, Robin, Virion and Sumia. Move with WASD or arrow keys, attack with Space, and pause with P. Melee uses the last movement direction. Bow and tome heroes can aim independently with the mouse and attack with click or Space; leaving the canvas restores keyboard facing. Vulneraries restore 25 HP. Defeat every enemy to advance to the next wave. Try again resets the entire battle.

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
- `src/game/systems/combat.ts`: weapon matchups, damage modifiers and range checks.
- `src/game/systems/navigation.ts`: shared terrain navigation with clearance for enemy bodies.
- `src/main.ts`: browser menus, HUD, audio controls and scene transitions.
- `public/assets/`: assets reused from the original game.
- `v1/`: preserved legacy game, original assets, build configuration and GameCube server. Local dependency/build folders are preserved but ignored by Git. `archive-manifest.json` records checksums of legacy game files at migration time.
- `docs/asset-sources.json`: source sheets and reproducible Virion extraction metadata.
- `docs/migration-issues.json`: migration backlog and created issue URLs.

## GitHub Pages

`.github/workflows/pages.yml` builds, tests and deploys `dist` when `master` or `main` changes. Pull requests run the same checks without deploying. Pages must use **GitHub Actions** as its source in repository Settings → Pages. Build output uses relative URLs, so it works under `/feadventures/` or a `github.io` repository root. Only the new build is published; the v1 source remains in the repository.

## Migration scope

The local build supports one keyboard player, 16 hero choices, the original first map, seven enemy types, directional melee, increasing waves, pickups, pause, muted-by-default audio and restart. Enemies use a shared navigation field to route around terrain. Melee strikes have visible wind-ups, locked aim, recovery and cooldowns; moving out of range or behind cover can evade them. Archers keep distance, move around cover and fire arrows that collide with terrain. Spawns are restricted to areas connected to the player.

Virion fires along his last movement direction after a 180 ms wind-up. His arrows damage enemies between 90 and 420 pixels from the shot origin, stop at terrain, and pass through the inner dead zone without dealing damage. Chrom and Lucina have 85-pixel sword reach; Frederick has 110-pixel lance reach. Sword beats axe, axe beats lance, and lance beats sword: advantage adds 20% damage, disadvantage removes 20%, and bows are neutral. Enemy weapon labels show your matchup with +/− markers. This deterministic rule is a real-time adaptation, not Awakening’s hit/rank formula.

This remains a migration in progress. Imported heroes have eight directional movement animations; stationary heroes have idle loops. Original hero and enemy movement/action rows are now restored. Dedicated battle animation fidelity, co-op, legacy balance/progression and touch controls remain outstanding. Navigation handles static terrain; crowd congestion can still occur in narrow passages.

Board: https://github.com/users/joncady/projects/2

`npm run project:sync` creates missing issues and attaches them to the board. It requires `gh auth login --hostname github.com --scopes project` and safely reuses issues with matching titles.

The current incremental improvements were approved for release on 2026-10-10. Full parity remains unfinished. Keep subsequent implementation local; obtain approval before another deployment. See `docs/parity.md` and `docs/combat-roadmap.md` for gaps, researched combat rules and the ranked backlog.

Local Sumia addition: Pegasus flight crosses terrain while retaining world bounds. Her lance reaches 110 pixels; bows deal double damage to her. Ground enemies approach nearby legal ground when she flies over obstacles. Weapon icons accompany selection and battlefield health bars. Original item icons are retained for future equipment changes; mouse aiming is queued at P1.

Use **Main menu** during play or pause to end the current run and return to selection. Morgan, Robin, Miriel, Ricken and Tharja use the initial Fire tome: Space casts along facing after a 250ms wind-up; range is 300px with no bow dead zone. Magic uses enemy Resistance, while physical attacks use Defense. Bulk asset imports are reproducible using `scripts/import-characters.py` and the source library/manifest. Further classes, equipment changes and the complete Awakening cast remain expansion work.

Local audio audition: downloaded source ZIPs are `399888.zip` (character voices), `406669.zip` (Robin voices) and `401959.zip` (battle/menu effects) in Downloads. Run `python3 scripts/prepare-audio-review.py /path/to/downloads` and open `http://127.0.0.1:5173/audio-review/index.html` with the dev server running. Search a character name or filename and report the original filename of a preferred clip. The full audition library is ignored by Git and excluded from the production build. Selected game clips live in `public/assets/audio/`; provenance is in `docs/audio-sources.json`.

Device speech has been removed. Recorded character voices remain independently adjustable. Sword and bow retain their existing effects; axe, lance and Fire use distinct temporary procedural effects generated by `scripts/prepare-weapon-audio.py`, pending selection of authentic source clips. These temporary effects are not Awakening recordings.

Local review batch: original hero/enemy directional and action rows now use exact frames. Two cyan-marked allied soldiers fight hostiles and attract attacks. Enemy mage and axeman profiles expand the seven-class hostile roster; Fire uses Resistance and faction-aware projectiles. Ally deaths do not end a run or block wave clears. Try the local build before approving publication. Campaign progression is planned in `docs/stage-progression.md` and board issues #19–#21; the current runtime remains an endless single-map battle.
