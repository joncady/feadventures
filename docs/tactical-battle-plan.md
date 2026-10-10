# Party deployment and tactical swarm plan

Approved reviewed release: 3e0f4bd. The following work remains local for a new review.

## Playable slice

1. Party selection chooses the initial controlled hero and up to three companions.
2. Deployment shows the entire expanded battlefield at overview zoom, four fixed hostile camps with exact initial enemy compositions, and four soldiers distributed across the fronts. Select a party member and click a legal position. Reject blocked terrain, world edges and overlapping deployments. Start only after valid placement.
3. Battle follows the controlled hero. Q selects the previous living member; E selects the next, in original party order. Characters retain individual health, growth, level/XP, equipment and cooldowns. The old Defend/Attack toggle is retired in this mode. Inactive companions engage nearby enemies and otherwise return to their assigned deployment positions. Soldiers are finite, do not respawn and never become controllable.
4. A fixed native minimap shows living enemies red, allies blue, the controlled member highlighted and the camera bounds. Enemy locations/counts are known at planning time; there is no random enemy spawning or infinite wave escalation. Clear all hostiles and hostile projectiles for victory; lose when no party member remains alive.

## Architecture and invariants

Keep the UI viewport 896×544 while the first arena world is 1792×1088. Typed map data owns collision shapes, deployment defaults, fixed camp enemy lists and soldier positions. Physics/navigation/line-of-sight share those dimensions and shapes. Compose grass/roads/forest from the FE8 Plains with Big Bridges preview by WAve, preserving downloaded creator credits, with forts from the existing project map2.png at the existing pixel scale; source attribution remains the legacy project, not a claim these are Awakening 3D maps. Awakening map-sprite listings are character sprites, and the site currently blocks direct page inspection. Do not wait for unverified art to establish the loop.

Store progression for every chosen hero, independent of which sprite currently accepts input. Party kills grant shared XP to living party members, rolled using each character's growths; NPC soldiers have no character XP. Switching transfers control without replacing health/progression or resetting cooldowns. Pending player shots stay attached to their originating character/weapon. Guard queued AI attacks when their target changes during a switch. Death removes a character from the rotation; automatically choose the next living member. All dead ends the battle once. Pause and restart must leave no orphan timers/projectiles.

First implementation deliberately preserves the previous small arena as a regression fixture at ?battle=legacy. Default play uses the new loop. This allows tests to retain proven combat/animation assertions while adding deployment, switching, camera, minimap and lifecycle coverage.

## Next content

After the tactical slice is reviewed: improve arena art and crowd performance, then carry the entire party state through the finite three-stage campaign and final boss plan. XP currently persists across switches within a battle; between-stage persistence belongs to the run controller. Individual character switching and party state must be complete before implementing stage transitions.

## Verified map art candidates

- FE8 Plains with Big Bridges by WAve: https://github.com/Klokinator/FE-Repo/tree/main/Tilesets/Plains/FE8%20Plains%20with%20Big%20Bridges%20-%20Tileset . Source palette, preview map and credits saved under asset-library/map-candidates. This first slice composes selected terrain tiles from the preview; mapchip_config would be needed to reconstruct every metatile from the raw palette.
- Aura Wolf’s Crap a Snap Pack includes FE7/FE8 Tiled .tmx maps and PNG previews: https://github.com/Klokinator/FE-Repo/tree/main/Maps . Larger overworld candidates include FE8 Overworld 23 (32×29 tiles). Inspect collision/connectivity and preserve author credits before using a full layout.
- Repository usage/credit guidance: https://feuniverse.us/t/fire-emblem-resource-repository-battle-animations-portraits-music-etc/3326 .
