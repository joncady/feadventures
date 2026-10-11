# Arena and run expansion

The next slice should create room to maneuver before adding more enemies. Keep combat real-time and retain the current party and weapon triangle.

## First delivery: larger open arena

Separate the fixed 896×544 UI viewport from world bounds. Build a roughly 1.5–2× larger arena with wider open lanes, fewer enclosed pockets, and distinct cover around the edges. Compose verified existing terrain tiles; do not stretch the current map image. Use a camera that follows the player, with clamped bounds and a small dead zone. The Interface scene and character panel stay fixed to the viewport. Pointer aim must convert screen coordinates through the world camera. Unit labels, shadows, projectile limits and safe spawning remain in world coordinates.

Define stage data containing background/terrain layout, collision shapes, world dimensions, player/party spawns and enemy spawn zones. Pass that same geometry to physics, navigation and line-of-sight. Retain the small map as a test fixture. Verify every spawn region connects to the ground player and that bow/tome users have enough space to engage at range. Flying units bypass terrain, but ground enemies still select reachable targets.

Keep flow-field work bounded: one player field plus at most five ally target fields, staggered recalculation, and a starting cap of 30 live enemies. Measure congestion and frame time with a full party before increasing enemy counts. Test camera-edge aiming and fullscreen/resizing, terrain recovery, flyer/ground separation and restart cleanup.

## Second delivery: finite three-stage run

Use the sequence Outskirts → Fortified Approach → Commander Arena from stage-progression.md. Stage 1 has three short waves; stage 2 has four mixed waves introducing mages and armor; stage 3 has a short approach and a boss with telegraphed attacks and bounded reinforcements. Victory requires clearing scheduled hostiles and hostile projectiles. The loop is choose player/party → fight → summary/resupply → next stage → final victory/replay.

A run controller carries player level/XP/stats, equipment and chosen party through fresh Arena instances. Between stages, offer limited healing and restore the two default soldiers. Recover selected companions at the stage boundary for the first playable version, with no replacements during combat; revisit finite reserves after playtesting. Keep party composition fixed during the run. Character switching remains a separate feature requiring per-character health/progression and explicit input ownership.

Advance exactly once and cancel pending spawns, attacks and effects before transitions. Menu/restart resets the run; defeat cannot accidentally advance a stage. Track stage/wave objectives in the native HUD. Use an existing verified commander sprite initially, with a named boss HP bar and distinct attack phases, rather than waiting on an unverified asset.

## Board order after this local review

1. #29: open arena, world/camera separation and crowd performance.
2. #19: typed stage/run state and bounded wave-clear lifecycle.
3. #20: verified maps, native transition/resupply screens and carryover.
4. #21: commander phases, reinforcements and final victory.

#24 equipment switching can follow these foundations. Local co-op/controller support and optional guard remain separate backlog items. This document is a delivery proposal; larger maps and campaign progression are not implemented yet.

## Latest local checkpoint

The first larger arena is now implemented locally, along with party/deployment/battle phases, fixed enemy camps, finite soldiers, per-character XP/stat growth, Q/E control rotation and a fixed minimap. See tactical-battle-plan.md for the updated architecture, verified community terrain sources and implementation scope. This batch was published in commit 7d40c84; multi-stage campaign/boss delivery remains next.

## Combat pacing and planning review

The current local adjustment uses 50% final damage for all factions; native minus/plus controls range from 25% to 200%. Weapon advantage, defenses and criticals still resolve before that shared multiplier. This changes fight duration without rewriting progression stats. Planning supports clicking party names then open terrain, or Q/E selection and WASD/arrow movement in 32-world-pixel increments. R begins battle. Party selection supports WASD/arrows, Enter/Space, Tab between leader/companions and R to review the battlefield.

The next campaign slice remains #19 → #20 → #21: preserve the entire party state across stage transitions, offer a small resupply screen, then finish with a telegraphed commander fight. Current camps contain generic enemies; named Awakening villains require their own verified map sprites and behavior profiles before being advertised as available. Candidate sheet entries include Gangrel, Validar, Aversa and Walhart.

## Multiplayer stretch goal

Keep backend multiplayer after the single-player campaign. Use room/lobby ownership, explicit per-player character assignment, server-authoritative damage/XP and snapshots, shared deployment confirmation, reconnect handling and synchronized camp schedules. Do not attempt to synchronize Phaser scene objects directly: serialize party, enemies, projectiles, inputs and run transitions through stable unit IDs. Multiplayer is not implemented in this checkpoint.

## Pixel rendering

Phaser uses pixel-art sampling. Small original map sprites and the half-scale deployment overview limit available detail; fractional browser sizing can soften them further. Canvas CSS now explicitly requests pixelated rendering. Higher-detail source art and integer-size sprite normalization remain a separate art audit, rather than an engine migration.

## Stage-one implementation checkpoint

Local play now includes three staggered camp waves, active-time phase clocks, regroup countdowns, a 3,600-HP armored commander and two one-time level-3 reinforcement squads. Complete victory waits for all scheduled releases, enemies and hostile projectiles. Space confirms deployment and advances selection; WASD moves a cursor before confirmation. Later-stage carryover/resupply and the campaign-final boss remain separate work. See stage-progression.md for timings and the 3–5 minute pacing target.
