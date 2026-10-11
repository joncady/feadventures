# Awakening roster and combat loadouts

Research checkpoint: 2026-10-10. Current picker contains 17 entries representing 16 identities; Robin has separate male/female entries.

## Starting roles

[Fire Emblem Wiki character table](https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem_Awakening) records these starting classes. Weapon families follow its [Awakening class table](https://fireemblemwiki.org/wiki/List_of_classes_in_Fire_Emblem_Awakening).

| Character | Starting class | Weapon families |
| --- | --- | --- |
| Chrom | Lord | Sword |
| Lucina | Lord | Sword |
| Frederick | Great Knight | Sword, lance, axe |
| Virion | Archer | Bow |
| Sumia | Pegasus Knight | Lance |
| Cordelia | Pegasus Knight | Lance |
| Robin, both variants | Tactician | Sword, tome |
| Morgan | Depends on parent | Tactician fallback: sword, tome |
| Lissa | Cleric | Staff |
| Lon’qu | Myrmidon | Sword |
| Miriel | Mage | Tome |
| Ricken | Mage | Tome |
| Stahl | Cavalier | Sword, lance |
| Sully | Cavalier | Sword, lance |
| Tharja | Dark Mage | Ordinary and dark tomes |
| Vaike | Fighter | Axe |

[Morgan’s wiki page](https://fireemblem.fandom.com/wiki/Morgan_(Awakening)) explains parent-dependent starting classes. This game explicitly chooses Tactician rather than simulating inheritance. Existing Lissa uses promoted War Cleric, whose class allows axe and staff; retain that distinction visibly instead of calling axe her original starting weapon.

## Real-time adaptation

These are design decisions, not canonical recruitment inventories. Give each hero two or three usable equipment choices within class permissions: stronger/heavier alternatives for single-family classes, cross-family choices for Cavaliers/Great Knight/Tacticians, and Heal plus axe for the existing War Cleric Lissa. Restrict dark tomes to dark-magic classes. Separate weapon family, item identity, effect, targeting and cooldown from character identity.

Use **F** to cycle equipped attacks; Q/E remain party switching. Number keys 1–3 can offer direct selection later. Switching changes subsequent attacks without canceling an attack already underway or clearing recovery. AI companions use their equipped profile; each character retains equipment when control changes. Damage projectiles capture their original weapon and owner.

Healing should target a living wounded ally and cap at maximum HP. It should not revive, repair structures, damage enemies, or award free XP by healing full-health units. Consider short Heal and longer Mend/Physic range as separately tuned items. The native HUD should distinguish support targeting from hostile targeting.

Mage is not inherently a healing class: Sage promotion permits tomes plus staves. If a dedicated tome-and-healing caster is required, offer an explicit Sage configuration/promotion for Miriel or Ricken rather than silently granting base Mage staff proficiency. This slice explicitly configures Miriel as promoted Sage with Fire, Thunder and Heal; Ricken remains base Mage. This is a chosen survival-game starting configuration, not Miriel’s original recruitment class.

## Skills are separate from attacks

The class table also lists learned skills. Awakening skills such as Aether, Galeforce and Rally are not generic alternate attacks every recruit starts with. A future skill system should record class/level prerequisites and passive/proc/active behavior separately. This equipment slice must not claim those skills are implemented.

Durability, proficiency ranks, promotion/reclassing, parent inheritance, weapon-specific effectiveness, distinct spell art/audio, and skill unlocks remain separately reviewable features. Pixel ranges and seconds are survival-game tuning, not literal Awakening tile ranges.

## Healing implementation checkpoint

[Serenes Forest staff data](https://serenesforest.net/awakening/inventory/staves/) gives Heal restoration of 8 + Magic/2. Local adaptation floors the half-Magic component and uses the equipment-defined 180-pixel support range. Support AI prioritizes lowest health percentage among nearby wounded allies, with self-healing as a survival-game fallback. Successful healing grants diminishing XP; full-health casts cannot farm XP. This is shared staff behavior for Lissa and promoted Sage Miriel. Healing sound remains unverified, so no unrelated sword effect is reused.
