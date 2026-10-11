# Facing and companion range regressions — local1.0.1

The read-only source audit found correct authored movement rows across17heroes/seven enemies; no global row flips were applied. The bug was retained sprite flip state after action transitions.

The real Arena regression executes a rightward Miriel tome attack, verifies its mirrored action, triggers urgent staff support toward an injured ally to the left, then checks left-walk flip=false and negative horizontal velocity. Restoring healthy patients returns to idle with flip=false. Q/E transfer clears flip state on both controlled and returned companion sprites. Blocked movement/idle and healing action facing now explicitly set their intended state. Single-row attack poses still follow attack aim while the player moves; no new directional action artwork was invented.

Nosferatu range220 now drives AI stopping distance rather than the shared260px constant. Real targets at221/240/260body-center distance cause approach; a target inside range causes windup and an actual Nosferatu projectile. Minimum-range retreat derives equipped minRange with a small bounded release hysteresis. Guard radius, terrain route/cover checks and player weapon stats remain intact.

Both regressions passed in focused checks and the full integration run. These are controlled fixtures, not an additional normal-speed campaign completion.
