# Combat roadmap and revised priorities

Updated 2026-10-10. The user approved publication of the current incremental fixes; subsequent deployments require fresh approval. Virion and the weapon triangle below are now implemented locally and remain unpublished.

## Order against the current backlog

P0 means current-playability/parity work; P1 means the next gameplay additions; P2 means later expansion. Within a tier, follow this order.

| Priority | Order | Work | Current position / dependency |
| --- | --- | --- | --- |
| P0 | 1 | Existing #2: directional and attack animations | Virion frame map verified and implemented; original heroes/enemies remain |
| P0 | 2 | Legacy balance, pickups and countdown parity | New explicit issue; reconcile damage, stats, wave cadence and pickup rules |
| P0 | 3 | Existing #3/#4: navigation and enemy combat | Implemented and tested locally; keep open for crowd profiling, full animation/balance verification |
| P0 | 4 | Existing #7: regression/performance | Expand current 13 unit / 10 browser tests with stress, repeated restart and browser coverage |
| P1 | 1 | Shared unit/faction/weapon profiles | Weapon profiles and projectile factions implemented locally; multi-target allied AI remains |
| P1 | 2 | Allied NPC soldiers | Explicit user P1; reuse default enemy sheets, visibly distinguish allies, attract and attack enemies |
| P1 | 3 | Weapon triangle and effectiveness | Player/enemy triangle implemented locally; effectiveness and NPC integration remain |
| P1 | 4 | Playable archer | Virion implemented locally with verified Archer sheet, ranged shots and dead zone |
| P1 | 5 | Morgan magic player | First mage is Morgan; start with Fire tome |
| P1 | 6 | Existing #5: local co-op/controller | Shares multi-target/faction foundations; still a legacy parity gap |
| P2 | 1 | Manual block | Deliberate real-time adaptation, with an asset investigation |
| P2 | 2 | Pegasus Knight | Suggested Sumia/Cordelia; requires movement layers and flying effectiveness |
| P2 | 3 | Existing #6: additional maps/progression | First-map progression was already disabled in v1 |
| P2 | 4 | Existing #8: touch/accessibility/settings | Keep menu usability and asset errors addressed as bugs; broader controls/settings later |

## Awakening rules and real-time adaptation

The **weapon triangle** is sword → axe → lance → sword. Bows and tomes do not join that triangle. Awakening changes hit chance and, at higher ranks, attack; effectiveness is separate and triples weapon Might rather than final damage. Physical attacks use Defense, magical attacks Resistance. These facts come from [Awakening calculations](https://serenesforest.net/awakening/miscellaneous/calculations/). Our deterministic real-time damage bonus will need explicit balancing rather than copying percentage hit rolls invisibly.

Range belongs to the equipped weapon, constrained by class, rather than the character's identity alone. Standard [bows](https://serenesforest.net/awakening/inventory/bows/) have range 2; Longbow has 2–3. Most [tomes](https://serenesforest.net/awakening/inventory/tomes/) have 1–2. Use per-weapon pixel min/max ranges and timing, documenting that these are adaptations from tiles. Bows and wind tomes are effective against fliers. Other weaknesses must be weapon/tag specific; magic is not automatically effective against every armored unit.

**Player archer proposal:** moving sets facing; Space fires along last facing with an aim cue. Start with configurable maximum range and a close-range targeting dead zone to preserve the bow's weakness. Whether arrows already in flight hit inside that zone is an explicit design choice. No automatic sword fallback. Virion is the suggested first archer; Noire is an alternative.

**Morgan proposal:** explicit tome-capable class/loadout, Fire bolt, cast windup and cooldown. Use magical damage and close/medium range. Wind can follow as a weapon variant with flying effectiveness. Fire/Thunder/Wind are not an Awakening elemental triangle. Gender and available class frames still need verification; Morgan remains the first requested mage.

**Pegasus proposal:** lance attack, flying movement, shadow and render depth above designated terrain. [Pegasus Knights](https://fireemblem.fandom.com/wiki/Pegasus_Knight) bypass much terrain but hard wall exceptions exist. Separate low obstacles from hard boundaries instead of disabling all physics. Decide ground melee reach and projectile occlusion while over terrain; ground enemies must retarget reachable allies or respond when the flyer returns, rather than freeze against an invalid navigation target.

**Block proposal:** Awakening's closest mechanic is allied, chance-based **Dual Guard**, which negates an incoming attack; a held manual block is a new real-time mechanic. Proposed guard slows movement, excludes attacking, covers the facing arc and reduces physical damage with a bounded guard resource. Magic initially bypasses ordinary guard; a magical ward would be a separate addition. Optional NPC Dual Guard can be evaluated later. [Dual Guard calculations](https://serenesforest.net/awakening/miscellaneous/calculations/).

## Sprite investigation

The linked [Awakening catalog](https://www.spriters-resource.com/3ds/fireemblemawakening/) lists 58 map sprite sheets as well as separate portraits. Character names alone do not establish which animation frames are available. Search results verified a [male Morgan portrait](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63381/) and a [Sumia portrait](https://www.spriters-resource.com/fullview/63390/); these are not playable map sheets. Direct catalog reads returned access errors, but browser navigation succeeded. Verified actual Map Sprites entries and visible PNG sheets: [Morgan (Male), 384×1536](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/64160/), [Virion, 384×4608](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63522/), and [Sumia, 384×4096](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63519/). The index also lists female Morgan and Cordelia map sheets. Exact class/frame boundaries, casting/attack state mapping and a dedicated guard pose still require detailed inspection. These originals use a magenta sheet background; extraction must remove that color and preserve frame geometry.

No dedicated block sprite has been confirmed. Safe first implementation: existing idle pose plus a code-rendered shield arc and impact flash, replaced by an authentic guard frame if sheet inspection finds one. Do not claim map sheets contain battle/guard animations without inspecting them.

The current runtime assets contain Chrom, Lucina, Frederick, Virion and five default enemies, with arrow/slash visuals. They do not yet contain Morgan or a Pegasus player. Reuse default enemy sheets for NPC soldiers, with allied markers/health colors that remain distinguishable without relying solely on tint.

## NPC acceptance focus

Shared faction targeting must select living hostile units and avoid rapid target oscillation. NPCs seek enemies and draw nearby enemy attention; they do not force every enemy away from the player. Their attacks, arrows and deaths use the same range, timing and damage rules. Allies are excluded from enemy wave counts; NPC survival does not keep a defeated player game alive. Multiple targets also require cached/bounded navigation work rather than one full field rebuild per enemy each frame.

## Local implementation status

Virion is playable using the verified blue Archer palette: eight movement directions, a bow action, locked shot aim, 180 ms wind-up, 520 ms cooldown, and a 90–420 pixel damage range. Arrows pass through the inner dead zone without damage, collide with terrain and expire at maximum range. Asset provenance and frame extraction are recorded in `asset-sources.json` and `scripts/prepare-virion-assets.py`.

The shared resolver applies sword → axe → lance → sword in both directions, using deterministic ±20% final damage. Bows and tomes are neutral. Chrom/Lucina use swords with 85-pixel reach; Frederick uses a lance with 110-pixel reach. Enemies expose their weapon and the player’s matchup beside their health bars. This advances weapon-profile issue #10, triangle issue #12 and playable-archer issue #13. Allied targeting, effectiveness tags, Defense/Resistance and Morgan magic remain open.

Validation: 11 unit tests, 7 browser gameplay tests, strict TypeScript checking and production build pass. No new deployment is authorized.

## Sumia and equipment UI — local

Sumia is playable as a Pegasus Knight with 190px/s flight, 110px lance reach and eight directional animations. All current terrain rectangles are treated as low obstacles for flight; world boundaries still constrain her. Ground enemies route to the nearest walkable destination when she is over terrain. Melee requires range and terrain line of sight; arrows still collide with terrain. Flying overlap does not physically push ground units. Bows deal 2× final damage to Sumia as a documented real-time adaptation, rather than Awakening’s weapon-Might formula. Deep terrain can provide refuge until she returns to reachable combat space; further flight balance remains open.

Standard weapon icons now accompany hero selection and each unit’s health bar, with +/− matchup markers retained. Original system and item icon sheets are stored with source metadata for future equipment selection. Reproduce extraction with `scripts/prepare-combat-assets.py DOWNLOAD_DIRECTORY` using Pillow.

**P1: mouse aiming for archery** — aim independently of movement, retain keyboard facing fallback, show cursor direction/range, and verify scaled-canvas coordinates, focus and pause behavior. Current archery keeps keyboard facing; this task is queued before further ranged-character expansion.

## Roster, magic and menu batch — local review checkpoint

The roster now has 16 selectable heroes: Chrom, Lucina, Frederick, Virion, Sumia, Morgan, Robin, Cordelia, Lissa, Lon’qu, Miriel, Ricken, Stahl, Sully, Tharja and Vaike. New map/portrait originals live in `asset-library/awakening`; `character-imports.json` records selected class blocks, 32×32 ground / 32×35 Pegasus geometry and portrait crops. `scripts/import-characters.py` reproduces the batch without network requests. Robin’s portrait combines the original body and hair layers. Lissa uses a War Cleric axe loadout; healing/staff actions remain pending. These are selected real-time loadouts, not a full Awakening class/equipment system or every recruitable character.

Idle animations loop again for stationary heroes and waiting enemies. The Main menu button ends a run from play or pause and returns to selection; the next battle starts with fresh health, wave, input, timers and projectiles.

Morgan is the first magic player. Tome profiles also enable Robin, Miriel, Ricken and Tharja with the same initial Fire spell: 250 ms cast wind-up, 600 ms cooldown, 300px range, no bow dead zone, 30 base damage, locked facing and terrain collision. The Fire visual is rendered in code; it is not an extracted Awakening spell effect. Tome damage subtracts enemy Resistance before the shared neutral matchup calculation. Physical attacks subtract Defense; heavy enemies have Defense 8/Resistance 2 and knights Defense 6/Resistance 0. These values and the spell timing are explicit real-time balance choices. Player defensive stats, elemental variants and full stat progression remain pending.

Review next: character sheet/portrait fidelity, idle feel, menu recovery, Fire spell timing and armored-enemy balance. Mouse aiming remains P1. No push or deployment is authorized for this batch.
