# Progression and ally orders

Each run starts at level 1. Every 100 XP grants a level; hostile kills by the player or allies award shared XP. Each stat rolls independently using character plus selected class growth rates from https://serenesforest.net/awakening/characters/growth-rates/base/ and https://serenesforest.net/awakening/classes/growth-rates/. Rates over 100 guarantee a point plus a chance at another.

This real-time adaptation starts everyone at 100 HP and preserves the existing weapon damage. Strength or Magic gains increase physical or magical attack damage; Speed gains improve movement and attack cooldown. Skill/Luck gains add critical chance, Speed/Luck gains add dodge chance, and Defense/Resistance reduce incoming physical/magical damage. HP growth increases maximum and current HP by the growth amount. Child growths use listed character values without parent inheritance; Robin has no selectable asset/flaw yet. Stats reset with a new run.

The Phaser battle HUD uses Awakening portraits and weapon icons. XP fills progressively with a generated tick and the level-up clip supplied by the user. See equipment-and-native-ui.md for audio provenance. All battle HUD controls are native Phaser; the character picker remains HTML.

Two allied soldiers start each run in Defend mode. They follow the player and engage nearby threats. Q or the HUD order button switches to Attack, pursuing nearby enemies without the defensive leash. Soldiers do not respawn during the current run. Planned finite campaign stages should restore the two-soldier complement between stages, rather than allowing infinite replacements during a battle.

Morgan's separate portrait hair layer is composited during import; his map hair customization palette is darkened. Robin has separate male/female sprites, portraits and recorded voice sets. Ground units use source diagonal rows 6 (down-right) and 7 (down-left); Virion, Sumia and Cordelia use the opposite source ordering. Both directions are exercised for every playable character by the roster browser test.
