# Health pickup allowance — #68

Local1.0.9,2026-10-11. `ArenaScene.damageEnemy` previously used the total active pickup count as its health drop cap. It now counts active pickups without gold metadata, retaining a maximum of three health items independently of gold. The1-in-5 hostile-kill health chance,25HP healing and12second expiry remain unchanged; gold still drops12–22 and expires after20active battle seconds.

Executed validation:48unit tests, TypeScript/build, and `health-pickups.spec.ts` plus `gold-feedback.spec.ts` (2browser tests). The new regression starts with12gold drops, forces the actual health RNG branch, proves threehealth drops and rejects a fourth, then restarts the scene and confirms all old pickups destroyed/new group empty. Gold clustering/lifetime/pause checks remain passing.

Fixture iterations used a second Phaser module and global random stub; final proof uses the exact loaded Phaser resource URL and overrides only health drop draws. No production RNG behavior changed. No commit or push.
