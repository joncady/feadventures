# Directional melee — local 1.0.7

Mouse aiming previously applied only to bows and tomes, and mouse clicks ignored melee weapons. Offensive melee weapons now share mouse aim with ranged weapons. Move in any direction with WASD/arrows, aim with the cursor, and strike with Space or left click. With the pointer outside the canvas (or cleared by pause/menu), attack follows the last keyboard movement direction. Healing staffs retain their friendly-target selection.

The strike animation keeps its original direction for its 200 ms action window. Existing recovery slowdown and cooldown stay in effect. Pointer coordinates are recalculated against the following camera so retreating does not leave aim attached to an old world location.

Validation: 47 unit tests, typecheck/build, and two native-input browser tests passed: Chrom retreats left and damages a target to his right with Space; moving the cursor outside restores keyboard facing. Existing Morgan ranged windup remains locked toward its original target after cursor movement. Initial synthetic Space presses were shorter than the render frame; the test uses a 100 ms native key hold.

Review: retreat while aiming toward an enemy, then test sword attacks diagonally and when standing still. Also check your preference for mouse aiming versus keyboard-only movement facing. No push or commit.
