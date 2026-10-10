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

The first larger arena is now implemented locally, along with party/deployment/battle phases, fixed enemy camps, finite soldiers, per-character XP/stat growth, Q/E control rotation and a fixed minimap. See tactical-battle-plan.md for the updated architecture, verified community terrain sources and implementation scope. This batch is not published yet; multi-stage campaign/boss delivery remains next.
