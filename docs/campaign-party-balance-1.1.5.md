# Campaign party balance, 1.1.5

## Scope and method

The intentional balanced trial is **Chrom / Frederick / Lissa / Miriel**: sword leader, lance reach, dedicated staff, magic with emergency staff. This is a forgiving **double-support** composition, not a claim that Frederick begins with special tank stats. All heroes currently start with identical stats; class growths, weapons, ranges and flying differentiate them.

No automatic party assignment or difficulty scaling was added. Existing explicit party selection remains. The intended follow-up comparison is Chrom / Frederick / Virion / Lissa (single support), a melee party without healing, and a flyer/ranged composition.

The pilot used actual keyboard/mouse controls, default 50% damage, native Auto-place, real shop purchases, real mission continuation, real-time battle clocks, and carried XP/equipment/gold. Read-only telemetry supplies target positions, camera transforms, and navigation assistance. It is more informed than a novice, but does not dodge intelligently, choose optimal deployment, or reliably navigate every corner. It cannot substitute for a human phone trial.

One first-slot forge was bought for Chrom at each preparation, up to +3. Road was played from normal character selection. A telemetry transition race closed that browser at the real Road Results screen. Its exact earned pending-result checkpoint was serialized and replayed through native Resume; Road progression was not fabricated. Subsequent trial checkpoints are retained with their exact earned data.

## Observed results

| Mission | Time | Outcome | Party condition | Interpretation |
|---|---:|---|---|---|
| Road | 2:30 | Victory, 48 kills | All alive: Chrom 90, Frederick 101, Lissa 102, Miriel 96 | Forgiving opening, but companions take damage and heal. |
| Village | 2:01 | Gangrel defeated, 33 kills | All alive: Chrom 35, Frederick 78, Lissa 103, Miriel 102; village last sampled 808/900 | Boss burst puts leader in danger even with two supports. |
| Castle, first pilot | 4:47 | Inconclusive pilot stop | Only Lissa alive at 105 HP; Walhart 3 HP, keep 509/800 | Driver incorrectly assumed the healer could not fight despite an available axe. This is **not** a game defeat or proof the mission is impossible. |
| Castle, corrected pilot | 3:19 | Walhart defeated, 37 kills | All alive: Chrom 76, Frederick 103, Lissa 104, Miriel 103; keep last sampled 746/800 | Normal rally and manual healing materially improve survival. |
| Keep, generic-route pilot | 3:20 | Actual party defeat; balance inconclusive | Validar 1049 HP remaining; player had spent roughly two minutes stuck against a top wall | Automation steering failure confounds this result. Do not infer a boss nerf or enemy buff. Independent authored corridor trial follows. |

Castle correction changed the pilot's use of ordinary Rally/healing as well as the carried-stat bug below. It is not a controlled measurement attributing the win solely to the bug fix. Random stat growths and different combat paths further prevent a strict A/B claim.

## Confirmed bug fixed

At the start of a mission, companion spawning reset defense/resistance to zero and used base weapon damage/speed, ignoring carried growth. First kill/level processing or switching control subsequently repaired those values. A character could therefore feel weaker until a seemingly unrelated event.

`spawnAllies` now initializes saved defense/resistance, attack power for the equipped physical or magical weapon, and growth-adjusted movement speed consistently with the existing control-switch path. This does not change enemy difficulty or create hidden buffs.

The native regression covers carried physical Frederick and magical Miriel with forged equipment before any kill or switch. Independent review additionally replayed the actual earned Road checkpoint and verified companion values plus controlled Frederick parity with battle clock/kills still zero.

## Decisions

- Keep authored fixed difficulty; do not erase upgrades through automatic party scaling.
- Do not raise Castle/Keep waves based on a strong double-healer party alone. Castle's boss already punishes careless attacks.
- Keep the balanced composition as a recommended **choice**, not an automatically assigned or mandatory party.
- Validate a single-support party before calling it the default experience; no-healer should be a viable challenge rather than the onboarding target.
- Keep all mission progress/reward economy untouched in this batch pending comparable independent outcomes.

## Reproducible evidence

`docs/playtests/campaign-balance-1.1.5/` contains raw Road, pre-fix Castle, post-fix Castle/Keep traces and exact earned Village/Castle pending-results saves. The saved fixture files are genuine earned checkpoints, not normalized synthetic party levels.

`natural-input-driver.mjs` is an exploratory pilot, **not a CI test or a reliable Keep solver**. It retains the generic-route limitation described above. Run with a local Vite server and optionally `PLAYTEST_SAVE` / `PLAYTEST_REPORT`; reruns write `replay-report.json`, not the recorded evidence. Native-profile regression is `tests/e2e/companion-carried-stats.spec.ts`.

Browser telemetry must import the exact main-module URL loaded by the document. After local Vite edits, that can contain `?t=...`. Importing bare `/src/main.ts` creates a second Phaser instance and invalidates UI observations. `scripts/playtest-browser-utils.mjs` provides `runningGame()` for future browser pilots; failed startup runs caused by the duplicate-entry import were discarded.
