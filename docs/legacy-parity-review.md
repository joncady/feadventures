# Issue #9: legacy balance, pickups and battle start review

2026-10-11, baseline release 1.0.8 (`a4a1b8b`). Read-only implementation comparison; no gameplay changes or new test executions in this review.

## Scope and source caveat

Issue #9 requested original/current values, restoration or accepted replacement, and gameplay evidence. The archived `v1/src/gameLogic/control.ts` contains an unfinished canvas conversion: the old DOM stage/countdown/timer block is commented out, `stages[0]` is hard-coded, and the timeout expression itself is malformed. Those declarations describe the older design, not proof that the archived checkout can run them. The current campaign is the replacement explicitly requested and repeatedly reviewed by the user: fixed staged spawns, mission objectives, 3–5 minute pacing, attack recovery, and a four-mission ending.

## Balance comparison

| Quantity | Archived v1 | Current release | Decision |
| --- | --- | --- | --- |
| Initial hero HP | 100 | 100; per-member growth thereafter | Retained with requested XP extension. |
| Player attack | Flat 10 | Profile/equipment base: standard physical 35, Fire 30; weapon/stat bonuses, defenses, triangle ±20%, bow effectiveness ×2, shared default damage scale .5 | Accepted replacement: slower/riskier attacks and tunable damage were explicitly requested. 35 is not final HP removed. |
| Player motion | 10 units/input tick; keyboard interval intended 75 ms | Hero speed 170 or flying 190 × .72, plus level growth, velocity in units/second | User-requested slowdown; values are not directly comparable across engines. |
| Enemy attack timing | Random integer threshold per 200 ms enemy tick; attack counter reset after >3 updates | Defined windup/recovery/cooldown, table below | Accepted dodgeable combat replacement, not contact-only damage. |

Enemy base values (HP / attack / speed):

| Type | v1 | Current | Windup / cooldown / recovery (ms) |
| --- | --- | --- | --- |
| Soldier | 100 / 10 / 10 | 60 / 10 / 60 | 350 / 1100 / 200 |
| Assassin | 60 / 15 / 13 | 40 / 12 / 100 | 180 / 800 / 120 |
| Heavy | 140 / 20 / 5 | 100 / 18 / 38 | 650 / 1800 / 350 |
| Knight | 120 / 12 / 13 | 75 / 12 / 75 | 400 / 1200 / 250 |
| Archer | 90 / 10 / 8 | 50 / 8 / 55 | 450 / 1500 / 200 |
| Mage (new) | — | 45 / 14 / 50 | 650 / 1700 / 250 |
| Axeman (new) | — | 80 / 16 / 48 | 550 / 1450 / 300 |

Legacy speeds are units per update; current speeds are velocity. Mission damage multipliers are 1.10 / 1.25 / 1.0 / 1.10 before combat defenses and shared pacing scale; boss attack is 32, with level-3 reinforcements at 75%/40% boss HP. User explicitly requested stronger road enemies and progressively harder missions. This review records acceptance of the model, not a guarantee that every party composition is balanced.

Sources: `v1/src/characters/player.ts`, `v1/src/gameLogic/constants.ts`, `v1/src/gameLogic/control.ts`, `src/game/data/config.ts`, `src/game/data/equipment.ts`, `src/game/data/maps.ts`, `src/game/systems/combat.ts`, `src/game/systems/progression.ts`.

## Pickups

Original health spawning: check every 2,000 ms, `getRandomInt(100) > 95`, only when no health item exists; heals 25 capped at 100. No item expiration is specified in the legacy item source. Current health spawning: 1-in-5 on hostile death, only when total pickup count is below three, heals 25 capped at the controlled hero's current maximum; expires after 12 seconds. Gold drops on every tactical hostile death, 12–22 gold, expires after 20 seconds and fades for the final four; pause freezes expiration. Nearby gold gain text combines collections inside 500 ms.

Decision: keep kill drops and expiry. The user requested mission gold, shopping/upgrades, and expiring gold to reduce clutter. Restoring a random timed health faucet would change the reviewed loop. Actual follow-up worth tracking: gold and health share the pickup count cap, so plentiful uncollected gold can prevent health drops. This is a current balance interaction rather than a migration-restoration requirement; audit it separately before promising reliable health drop availability.

Evidence: `ArenaScene.ts` pickup overlap/damage/drop/updateGoldPickups paths; `gold-feedback.spec.ts`, `combat.spec.ts`, `campaign.spec.ts` treasury rollback coverage. Current tests do not prove statistical health availability during a crowded gold field.

## Start gating and wave cadence

Legacy intended start indicator: count initialized to 3, updated each second until below zero; enemy spawn interval `2000 * exp(-.1*(stage-1))`; wave budget `stage * 1` from the actual `GameStages(1, 1, ...)` constructor. The constant named MULTIPLIER (.1) controls decay, not that wave budget. Advancement follows the last enemy kill. The intended countdown/timer block is commented out in the archived canvas migration.

Current start: party selection → optional dialogue/shop → deployment. No combat before Begin battle/R and valid full party placement; auto-place fills only unplaced members. After acceptance, `StageOne.start` establishes a five-second opening before wave one. Pauses freeze its scene clock. Decision: retain explicit planning and opening, not restore a redundant center-screen countdown.

| Mission | Waves | Minimum per wave | Batch interval | Intermission | Hostile cap | Boss HP |
| --- | --- | --- | --- | --- | --- | --- |
| East road | 3 | 38 s | 9 s | 8 s | 14 | none |
| Village | 3 | 44 s | 8 s | 8 s | 14 | none |
| Castle siege | 3 | 40 s | 7.5 s | 8 s | 22 | 900 |
| Black Keep | 3 | 38 s | 7 s | 7 s | 24 | 1400 |

Each batch schedules one unit at each of four fixed camps, offset by 500 ms; road/village use four batches (16 scheduled units/wave), castle/keep three (12/wave). Visible/occupied camp rejection or hostile cap can delay release; these are scheduled budgets, not simultaneous spawning or exact wall-clock duration. Road advances require eastward thresholds (448/832/1120, 24-unit tolerance), then final exit radius. Campaign waves can move on after scheduled releases/minimum time without requiring every distant archer's death. Boss phases withdraw old survivors and end on commander defeat. This deliberately replaces infinite last-kill progression and was explicitly requested to avoid cleanup grind.

Evidence: `maps.ts`, `StageOne.start/advance`, `ArenaScene.updateStage/campSpawnPoint`, `tests/stage-one.test.ts`, `tests/maps.test.ts`, `tests/e2e/tactical-battle.spec.ts`, `tests/e2e/campaign.spec.ts`, `tests/e2e/deployment-spacing.spec.ts`, `tests/e2e/black-keep.spec.ts`.

## Recommendation

Close #9 as a reconciled design migration, with the above accepted replacements recorded. Do not mark blanket legacy parity complete: multiplayer/adapter input (#5/#34), animation fidelity (#4), exact sound matching (#41), and UI sharpness (#64) remain separate. The shared health/gold cap interaction was fixed subsequently in local1.0.9 under #68; focused browser checks cover the busy field and three-health limit. No old balance/countdown/wave restoration is required by the current approved campaign direction. Existing gameplay tests cover the replacement rules; root release checks remain the source for executed pass counts.
