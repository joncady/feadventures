# Awakening commanders: asset and campaign review

Reviewed October 11, 2026. Research/source acquisition only; no runtime changes or release/version changes.

## Finding

All three commanders have exact Awakening map sprites and portraits in the Spriters Resource catalog. They were **not in the repository before this review**: the existing 27 original Awakening PNGs cover the playable roster, generic enemies, and UI. Generic sheet 64153 must not be relabeled as these named commanders. Six original source PNGs have now been acquired into `asset-library/awakening/commanders/` for implementation; source URLs, uploader, and SHA-256 hashes are in `sources.json`. Browser verification worked after the site's ordinary automatic verification; direct web-reader requests returned 403.

| Commander | Map sheet (local/source) | Portrait sheet (local/source) | Source geometry / readiness |
|---|---|---|---|
| Gangrel | `commanders/63479.png` — [63479](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63479/) | `commanders/63343.png` — [63343](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63343/) | Map 384×2048; portrait 1292×756; exact named red/blue/green frames, four class blocks |
| Walhart | `commanders/64151.png` — [64151](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/64151/) | `commanders/63395.png` — [63395](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63395/) | Map 384×2560; portrait 1292×724; five class blocks, mounted armored and flying variants |
| Validar | `commanders/63603.png` — [63603](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63603/) | `commanders/63393.png` — [63393](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63393/) | Map 384×512; portrait 2582×692; one named sorcerer block, two portrait appearance sets |

All six uploaded by Ploaj. [Visual proof](playtests/commander-assets/source-proof.png) combines original sheet regions, portraits, and first idle frames from every 512px map class block. This is a reference collage, not new art or a runtime sprite.

Map frames are 32×32, four animation columns per palette (red x=0, blue x=128, green x=256). Direction/action rows visually match the existing roster format: idle y=0, action y=32, left y=64, right y=96, down y=128, up y=160, down-left y=192, down-right y=224, up-right y=256, up-left y=288, plus separate shadows below. Class blocks repeat at y=512. Integration must audit every direction and action in-game; do not infer facing from filename or apply global flipX. Suggested named base blocks are red x=0,y=0 for Gangrel, Walhart, and Validar, with the Walhart mounted/class identity confirmed in the implementation review before final crop registration. No normalized crops were generated in this research task. Portrait first-neutral-bust bounds should be extracted visually with alpha bounds, using each source sheet's actual row height; they are not identical (Gangrel differs from Walhart).

Local audition catalog has 55 Gangrel voice records including attack/cut-in/damage/death. Walhart and Validar do not appear under English names or tested Valhart/Faudar aliases. No claim that the latter voice assets exist locally. Generic boss sound remains acceptable until exact recordings are found; avoid other characters' voices.

## Lore evidence and combat identity

Nintendo/Intelligent Systems' official [Gangrel introduction](https://guide.fire-emblem-heroes.com/en-US/10004001000530-2/) describes Plegia's king, his deception, his war against Ylisse, and his attempt to seize the Fire Emblem. This supports a mobile, disruptive first named boss, not a slow armored tank.

The official [Walhart introduction](https://guide.fire-emblem-heroes.com/en-GB/10006001000273-2/) identifies the emperor of Valm, a ruthless warrior conquering countries by force. He should feel like a powerful armored attacker with a committed charge and axe punish window.

The official [Validar introduction](https://guide.fire-emblem-heroes.com/en-US/10005002001034-2/) identifies the Grimleal leader and dark-magic architect of Grima's return, working through Aversa and Gangrel. He is a strong final caster encounter: dark ranged pressure and summoned guards, clearly telegraphed and interruptible.

Awakening-specific class/equipment/order data is cross-checked against [Serenes Forest's normal-mode boss table](https://serenesforest.net/awakening/characters/boss-data/normal/chapters/), a community reference rather than an official primary source: Gangrel chapter 11 Trickster with Levin Sword; Walhart chapters 19–20 Conqueror, with Sol then Wolf Berg; Validar chapter 23 Sorcerer with Grima's Truth and a second encounter. Validar also appears earlier in premonition/chapter 6. Therefore do not claim he only first appears after Walhart. Listed Dragonstone/bullion/etc. are carried/dropped equipment, not reasons to give those attack types to Gangrel/Walhart.

## Recommended fit: keep four missions first

This is a condensed Awakening-inspired adventure, not a literal chronological remake. Use existing maps and three distinct boss identities before adding another stage:

1. East Road: bandit tutorial / ambushes. Leave it without a major lore boss.
2. Village Defense: Gangrel arrives as the final attacker; Levin Sword gives readable melee pressure plus an occasional lightning strike. Existing timed-defense objective must wait for his defeat when he appears, and defend-town success remains explicit.
3. Castle Defense: Walhart leads the assault. Mounted heavy axe attacks, a charge windup, and a recovery window make him a different decision problem. Keep him grounded and route through entrances; flying reclass sprites are not his canonical encounter.
4. Black Keep: Validar as the final commander. Dark magic, brief summoned guards, and two bounded health phases. The second phase changes pattern rather than restoring a huge health bar and extending grind. Preserve commander-defeat victory semantics and pending-save results.

Gangrel's and Validar's connection is supported by official lore; Walhart belongs to a distinct Valm arc. Intermission text needs a short explicit transition to explain this condensed campaign instead of implying all three share one castle/army.

Do **not** add a stage merely to house another boss. Four ~3-minute missions plus planning/dialogue/shop already fit the intended under-20-minute run. Add a fifth only if playtests show the new village finale makes its defense drag or if the player wants a separate Valm campaign chapter. A stronger lore-faithful alternative would insert a short Valm assault before Black Keep, with Walhart there, but that requires new map/balance/save migration and is not needed for the first named-boss pass.

## Implementation acceptance

- Exact named red sprite and neutral portrait, documented crops and source provenance; all eight facings plus idle/action checked.
- Native boss portrait/name/health and obvious attack windup/recovery; resist simply reskinning generic high-HP enemies.
- Each boss has one identity mechanic, capped reinforcements, and a fair recovery opening; balance HP for encounter duration rather than lore-stat copying.
- Road stays teachable; Village still defends town; Castle still protects camp; Keep still ends the campaign. No stealth objective changes.
- Mobile/desktop checks, saves made before/after boss entry and results, no reward duplication, no silent cleanup counted as kills.
- Natural full-party campaign trial remains required before shipping difficulty numbers or adding a fifth map.
