# Read-only portrait and direction audit

Scope: all 17 playable hero atlases and seven hostile atlases, eight movement directions plus idle/action, four frames per row (960 registered frames). No repository changes. Evidence: /tmp/facing-audit-0.png through -3.png (24-unit directional matrix), /tmp/facing-allframes-<key>.png (24 four-frame sheets), /tmp/portrait-centering-audit.png (17 roster crops and full previews), /tmp/source-frame-comparison.json.

## Confirmed code findings

1. **Healer directional walks inherit action mirroring.** ArenaScene around559 starts walk-direction without setFlipX(false). All other ordinary/follow movement branches reset it. A rightward tome action sets flipX=true for Miriel/Morgan/Robin/Ricken/Tharja; automatic staff selection does not clear that flag. Subsequent left/down-left/up-left staff travel can display their mirrored right counterpart. Repro: let a tome/staff companion attack right, injure an ally to trigger auto-heal, observe its next leftward walk; inspect flipX, currentAnim and body.velocity. This is a deterministic code-path finding, not yet a fresh browser reproduction during release freeze.

2. **Action frames deliberately override moving direction.** Controlled hero update225 keeps actionFlipX(attack aim) while moving at90px/s during actionUntil/playerShot. Only one action row exists, so attacking right and backing left looks right while moving left; vertical/diagonal attacks also show a horizontal action pose. This can explain part of the user's 'flipped when moving' report but does not prove that exact report. Separate animation facing from movement is expected for mouse-aimed ranged attacks; melee/vertical action feedback needs review.

3. **Idle poses are not eight-directional.** Player227 always plays idle row0 with facing.x>0 mirror; pure up/down idle therefore displays the same source front/side pose, and a direction change followed by stopping changes orientation. AI557/583/619 idle paths also retain prior flipX. Not a swapped movement-row bug. Define desired idle-facing policy before fixing; preserve authored sprite asymmetry.

4. **Unit control swaps do not explicitly reset flipX.** Arena379 sets player texture then idle, while384 puts old hero back into idle; next normal movement resets player mirroring, but companion idle/healer routes can retain stale state. Include Q/E switch transitions in regression matrix.

## Movement/source findings

MOVEMENT_ROWS left2/right3/down4/up5/down-left6/down-right7/up-right8/up-left9 agrees with inspected sprite orientation across all24 atlases. Lon'qu four-frame diagonal sheet specifically confirms current down-left row6 and down-right row7. Pegasus Sumia/Cordelia show correct left/right and diagonal body/horse direction; flying uses the same atlas; world flight collision is independent of frame mapping. Archer/Virion action row faces right, other action rows face left, consistent with actionFlipX exception.

Pixel-for-pixel source extraction comparisons passed all40 frames for each of12 manifest-imported heroes (480 frames): Morgan, Robin male/female, Cordelia, Lissa, Lon'qu, Miriel, Ricken, Stahl, Sully, Tharja, Vaike. Morgan comparison includes documented hair palette treatment. This verifies import reproducibility, not correctness of class/animation semantics. Chrom/Lucina/Frederick and five legacy enemies come from archived normalized200x492 atlases; original online provenance remains unknown, so archived consistency cannot establish original-sheet identity. Virion and Sumia have explicit source extraction metadata; mage/axeman use64153 red generic blocks. Their registered orientations were visually reviewed; no blanket diagonal remap justified.

## Portrait finding

InterfaceScene142 uses a fixed160x160 square perhero with hand-authored x/y; portraits contain different head/hat/hair bounds. All cards are centered geometrically, but faces are not centered consistently. The contact sheet shows Lucina/Sumia/Tharja's faces lower than Chrom/Frederick; Ricken's large hat places his face near the crop bottom; Morgan/Robin have smaller head fill. Interface176 fullpreview uses the entire transparent portrait at174x174 instead of the roster face frame, so inconsistent source margins and shoulders dominate positioning. This is source framing/layout, not Phaser filtering.

Recommended followup: source portrait metadata with perhero face focal point and scale, explicit eye baseline and safe hair/hat padding; separate roster/preview/HUD portrait framing; preview preserve authored aspect and align face anchor rather than full image rectangle. Review all17 simultaneously, not single-character offsets in isolation.

## Regression matrix for followup

For each17heroes+7enemies: walk L/R/U/D/DL/DR/UL/UR at four frame phases; idle after each direction; attack left/right/up/down/diagonal; attack then opposite movement; mouse aim opposite velocity for bow/tome; swap Q/E during recovery; companion retaliation then return; staff auto-switch after mirrored attack and restore tome; Pegasus fly across barricade in all eight directions. Assert walk paths flipX=false and correct row; action mirroring follows documented source facing; inspect video contact sheet for all four phases (not just firstframe). Healer/castHeal should use explicit facing/reset policy rather than inherited sprite flags.

Confidence: deterministic stale-flag paths confirmed by source; current source movement-row mapping visually correct; full browser reproduction deferred to preserve publication freeze. No runtime mutations, repository edits, or remote downloads made.
