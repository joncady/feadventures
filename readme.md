# Fire Emblem Adventures

A browser-based, real-time Fire Emblem-inspired game built with **Phaser 3, TypeScript and Vite**. Version **1.0.0** contains a four-mission campaign: an eastbound bandit ambush, village defense, castle defense, and an enemy castle assault ending in a commander battle.

[Play on GitHub Pages](https://joncady.github.io/feadventures/). The published site may trail local development until a release is approved and pushed.

## Develop and verify

Use Node.js 22 (CI) or Node.js 20.12+ locally, from this directory:

```sh
npm ci
npm run dev
```

Open the address printed by Vite.

```sh
npm run check       # rules tests, strict TypeScript checking, production build
npx playwright install chromium
npm run test:e2e    # browser gameplay regression tests
npm run preview    # serve the production build
npm run release:bump # increment the patch version without creating a Git tag
```

The application displays the version from `package.json`; commit its matching lockfile when changing versions. A version bump does not publish or deploy the game.

## Play

Choose a leader from **17 hero options**, then up to three companions. WASD or arrow keys navigate character selection; Enter or Space selects the focused character. Review the mission briefing and prepare equipment in the shop before deployment. Companions retain their levels, XP, stats and equipment between missions. Gold collected during battle funds purchases and weapon forges; a forge costs 100 gold and increases power or healing, up to three upgrades per item.

During battlefield planning, move the grid cursor with WASD or arrows, press **Space** to place the selected hero and advance to the next, and use **Q/E** to change the selected hero. Press **R** to launch once the party is placed. The opening road mission has no NPC soldiers; later missions add four soldiers at authored map positions.

During battle:

- **WASD / arrows:** move the controlled hero.
- **Space / mouse click:** attack. Tap again when the cooldown is ready; holding Space does not repeatedly attack.
- **Mouse:** aim bows and tomes independently of movement; keyboard facing resumes when the pointer leaves the canvas.
- **Q / E:** rotate control through living party members.
- **F:** switch the controlled hero's equipped weapon or ability.
- **R:** rally companions to the controlled hero for ten seconds, with a twenty-second cooldown; fixed NPC soldiers remain at their posts.
- **I:** show or hide the detailed player card.
- **P:** pause. The native menu controls also provide pause, audio settings, fullscreen and return to character selection.

An attack has a wind-up, recovery and visible cooldown. Sword beats axe, axe beats lance, and lance beats sword; this real-time adaptation changes damage by ±20%, while bows are neutral. Magic checks Resistance instead of Defense. Pegasus units can cross terrain and barricades, and bows are especially effective against them. Staff users can heal allies and automatically select a healing staff when a nearby ally is seriously injured, then return to their previous weapon after recovery.

Traveling companions follow the leader with spaced formations. Defensive missions keep companions near their deployment posts until rallied. Enemy releases arrive over time from authored approaches; the road mission requires advancing east through its ambushes rather than clearing every survivor. Defense missions lead into a commander fight. The minimap, party health bars, attack cooldown and mission status show the current battle state.

Music starts enabled after browser audio unlock. Music, effects and recorded character voices have separate audio controls. Some selected effects are provisional: XP and healing currently reuse a recorded interface cue, weapon-effect assignments still need semantic review, and menu and stage music currently use the same track. Device speech is not used. Active art and audio use existing online-source assets; dormant generated audio files remain in the asset folder but are not registered for gameplay.

## Campaign saves and developer shortcuts

Campaign preparations are autosaved in this browser under `feadventures.campaign.v1`: party, mission, treasury, levels/XP, stats and equipment/forges. Purchases, upgrades, mission deployment and victories update the checkpoint. **Resume campaign** on the title screen restores preparations; a battle interrupted by reload restarts from deployment. Enemy positions, battle timers, unbanked pickups and mid-battle damage are not saved. A new campaign replaces the normal checkpoint.

Saves are local to the browser and site origin; clearing site data removes them, and localhost and GitHub Pages have separate saves. Invalid or incompatible saves are ignored; blocked storage leaves the game playable in the current tab.

Press **F9** or the **backquote** key to open the temporary developer menu. Choose a map by clicking its name or pressing **1–4**. These jumps create fresh test campaigns using the selected party and preserve the normal save. **Escape / F9** closes the menu. Opening it pauses an active battle; closing it preserves an existing pause. **Resume saved campaign** exits a developer test and returns to the normal checkpoint.

## Structure and assets

- `src/game/scenes/`: asset loading, combat, native interface, campaign preparation and developer scenes.
- `src/game/data/`: characters, equipment, campaign state, authored maps and reusable map chunks.
- `src/game/systems/`: rendering-independent combat, progression, terrain navigation and other gameplay rules.
- `src/main.ts`: scene transitions, audio, campaign checkpointing and interface events.
- `public/assets/`: assets shipped with the current game.
- `v1/`: preserved legacy game and original assets; dependency/build folders are ignored by Git.
- `docs/asset-index.json` and `docs/asset-index.md`: local asset inventory, source mappings and documented provenance gaps.
- `docs/asset-sources.json` and `docs/audio-sources.json`: source-sheet extraction and selected audio provenance.
- `docs/map-builder.md`: the chunk-based map authoring interface and sourced background composition.
- `docs/playtests/`: measured natural-play evidence and release verification notes.

Map composition reuses credited online tiles and layouts. Character imports and map backgrounds can be reproduced with the scripts in `scripts/`; source files and prerequisites are recorded in their accompanying documentation. Some legacy assets still lack verified source attribution; the inventory explicitly records those gaps.

For local audio audition, downloaded source ZIPs `399888.zip` (character voices), `406669.zip` (Robin voices) and `401959.zip` (battle/menu effects) can be indexed with:

```sh
python3 scripts/prepare-audio-review.py /path/to/downloads
```

With the development server running, open `/audio-review/index.html`, search by character or filename, and report the original filename of a preferred clip. The full audition library is ignored by Git and excluded from deployment; selected clips live in `public/assets/audio/`.

## GitHub Pages and project tracking

`.github/workflows/pages.yml` installs dependencies, checks TypeScript/rules, builds and runs Chromium regression tests. Pull requests run checks without deploying. A push to **master or main automatically deploys** `dist`; Pages must use **GitHub Actions** as its source in repository Settings → Pages. Relative build URLs support `/feadventures/` and a `github.io` repository root. The legacy source is not published.

[GitHub issues](https://github.com/joncady/feadventures/issues) and the [project board](https://github.com/users/joncady/projects/2) are the source of truth for bugs and planned work. Local roadmap/migration documents are historical design notes and mirrors, not a separate authoritative backlog. `npm run project:sync` can attach migration issues to the board and requires GitHub CLI authentication with the `project` scope.

Remaining review areas include sound matching and provenance, battle-animation fidelity, keyboard navigation at partial roster rows, difficulty tuning across party compositions, touch controls and multiplayer/backend support. The campaign is playable end to end, but balance should continue to be evaluated with ordinary playtests. Release preparation does not itself authorize a push or deployment.
