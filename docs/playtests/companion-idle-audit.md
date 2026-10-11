# Read-only companion idle audit

No repository edits. Isolated developer fixture, not natural playtest evidence.

## Confirmed bug: short-range tome dead band

`ArenaScene.ts:618` holds every ranged unit still at up to 260 px. `canAttack` at line610 uses the equipped attack range. Nosferatu has range220, so a target221–260 px away is selected but the caster neither attacks nor approaches.

Fixture: standalone siege, Chrom leader + Tharja companion, Tharja temporarily equipped with Nosferatu, unit(600,500), soldier(840,500), post at unit origin; clear hostiles, pause normal scene frames, force attack timer ready, invoke normal updateEnemy. Result: distance240, selected true, chase phase, velocity x0/y0. No campaign save edits. Fix after release: derive hold distance from equipped attack.range, add regression covering221/240/260px.

## Intended policy that looks like a broken idle unit

All maps use companionRadius300. Village/castle hold anchors are original deployed posts; Road/final use smoothed formation anchors. Melee targets outside300 from anchor are ignored. Ranged targets can exceed that circle only if currently in weapon reach. Every normal target also requires companion origin within332 of anchor; otherwise the unit returns to anchor. Ground melee targets must be reachable; no waypoint means stationary. There is no UI showing post radius, target loss reason or return-to-post state.

Rally deliberately postpones targeting when companion is >150 from the temporary regroup anchor. It lasts10seconds with20second total cooldown and returns hold companions to original posts. Fixed soldiers do not rally. Current small status under party and bottom R hint work, but neither explains the posts rule or lets a player select an indefinite follow order. A user fighting away from posts can interpret this as allies doing nothing.

## Range consistency tuning

AI retreats tomes below65 until110 and bows below140 until180, independent of equipment minRange (tomes0/bows90). This defensive spacing is more conservative than direct player controls and is not conveyed by the displayed weapon range. Equipment exposes minRange correctly; attack behavior hardcodes the AI spacing instead.

## UX follow-up

Keep R discoverable as “R: Call companions” or a clear follow/hold command if that becomes the design. Use a compact contextual state such as Holding post / Returning / Regrouping, optionally show guard AOE on hover/Info rather than a persistent overlay. Explain10second support and original-post return. Preserve compact HUD and avoid covering deployment terrain.
