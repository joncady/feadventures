# Progression and ally orders

Each run starts at level 1. Every 100 XP grants a level; hostile kills by the player or allies award shared XP. Each stat rolls independently using character plus selected class growth rates from https://serenesforest.net/awakening/characters/growth-rates/base/ and https://serenesforest.net/awakening/classes/growth-rates/. Rates over 100 guarantee a point plus a chance at another.

This real-time adaptation starts everyone at 100 HP and preserves the existing weapon damage. Strength or Magic gains increase physical or magical attack damage; Speed gains improve movement and attack cooldown. Skill/Luck gains add critical chance, Speed/Luck gains add dodge chance, and Defense/Resistance reduce incoming physical/magical damage. HP growth increases maximum and current HP by the growth amount. Child growths use listed character values without parent inheritance; Robin has no selectable asset/flaw yet. Stats reset with a new run.

The Phaser battle HUD uses Awakening portraits and weapon icons. XP fills progressively with a generated tick and the level-up clip supplied by the user. See equipment-and-native-ui.md for audio provenance. All battle HUD controls are native Phaser; the character picker remains HTML.

Two allied soldiers start each run in Defend mode. They follow the player and engage nearby threats. Q or the HUD order button switches to Attack, pursuing nearby enemies without the defensive leash. Soldiers do not respawn during the current run. Planned finite campaign stages should restore the two-soldier complement between stages, rather than allowing infinite replacements during a battle.

Morgan's separate portrait hair layer is composited during import; his map hair customization palette is darkened. Robin has separate male/female sprites, portraits and recorded voice sets. All movement sheets use source diagonal rows 6 (down-left) and 7 (down-right). Bow action rows face right before mirroring; melee and magic action rows face left. Both directions are exercised for every playable character by the roster browser test.

## Selected companions

Choose up to three distinct companions besides the player. Two default soldiers always deploy, making a maximum five allied NPCs. All start in Defend, and Q switches the entire group to Attack. Companions use their own weapon, range, cooldown and attack sound; bow and tome companions fire projectiles. Pegasus companions ignore terrain and ground-unit collision and remain vulnerable to bows. Companions have fixed baseline stats in this slice; kill XP levels the player. No mid-battle respawns; restart restores the selected party. Individual progression and character switching are future work.

Base player and companion movement is reduced 28%, to approximately 122 px/s on foot and 137 px/s for flyers. Speed growth still adds movement; normalized diagonal movement is unchanged.

## Tactical battle mode

Default play now moves from party selection to an overview deployment phase, then a finite 1792×1088 battlefield. Four fixed camps show exact initial enemy composition, and four noncontrollable soldiers cover the fronts. Q/E cycles through living selected characters in roster order; Attack/Defend is retired. Uncontrolled characters engage nearby threats and return to their assigned deployment position when idle. Each character retains HP, level, XP, growth stats and cooldowns through switches. Shared kill XP is applied to each living character using their own growth table. Death skips that character; all chosen characters dead is defeat. Soldiers do not respawn. Clear all camps and hostile projectiles for victory. Restart resets the whole party and returns to deployment. Old behavior remains available only in the regression fixture (?battle=legacy).
