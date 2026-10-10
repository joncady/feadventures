# Combat roadmap and revised priorities

Updated 2026-10-10. The user approved publication of the current incremental fixes; subsequent deployments require fresh approval. New features below are backlog work, not included in this release.

## Order against the current backlog

P0 means current-playability/parity work; P1 means the next gameplay additions; P2 means later expansion. Within a tier, follow this order.

| Priority | Order | Work | Current position / dependency |
| --- | --- | --- | --- |
| P0 | 1 | Existing #2: directional and attack animations | Standing-row animations remain; verify frame maps before adding characters |
| P0 | 2 | Legacy balance, pickups and countdown parity | New explicit issue; reconcile damage, stats, wave cadence and pickup rules |
| P0 | 3 | Existing #3/#4: navigation and enemy combat | Implemented and tested locally; keep open for crowd profiling, full animation/balance verification |
| P0 | 4 | Existing #7: regression/performance | Expand current 8 unit / 5 browser tests with stress, repeated restart and browser coverage |
| P1 | 1 | Shared unit/faction/weapon profiles | Enables all additions; remove hard-coded player sword and single-player target assumptions |
| P1 | 2 | Allied NPC soldiers | Explicit user P1; reuse default enemy sheets, visibly distinguish allies, attract and attack enemies |
| P1 | 3 | Weapon triangle and effectiveness | Central resolver shared by player, enemies and NPCs |
| P1 | 4 | Playable archer | Reuse arrow pipeline; suggested Virion, subject to verified map sheet |
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

The linked [Awakening catalog](https://www.spriters-resource.com/3ds/fireemblemawakening/) lists 58 map sprite sheets as well as separate portraits. Character names alone do not establish which animation frames are available. Search results verified a [male Morgan portrait](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63381/) and a [Sumia portrait](https://www.spriters-resource.com/fullview/63390/); these are not playable map sheets. Direct catalog reads returned access errors, so exact Morgan/archer/Pegasus frame layouts and a dedicated guard pose remain unverified.

No dedicated block sprite has been confirmed. Safe first implementation: existing idle pose plus a code-rendered shield arc and impact flash, replaced by an authentic guard frame if sheet inspection finds one. Do not claim map sheets contain battle/guard animations without inspecting them.

The current runtime assets contain Chrom, Lucina, Frederick and five default enemies, with arrow/slash visuals. They do not yet contain Morgan or a Pegasus player. Reuse default enemy sheets for NPC soldiers, with allied markers/health colors that remain distinguishable without relying solely on tint.

## NPC acceptance focus

Shared faction targeting must select living hostile units and avoid rapid target oscillation. NPCs seek enemies and draw nearby enemy attention; they do not force every enemy away from the player. Their attacks, arrows and deaths use the same range, timing and damage rules. Allies are excluded from enemy wave counts; NPC survival does not keep a defeated player game alive. Multiple targets also require cached/bounded navigation work rather than one full field rebuild per enemy each frame.
