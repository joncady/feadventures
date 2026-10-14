# Ten-mission weapon progression and critical feedback proposal

Design only, 2026-10-13. No runtime changes. Audited current equipment, progression, combat, campaign save, voice gate and local audio catalog. No AGENTS.md found in workspace ancestry checked by repository search.

## What exists and what needs to change

There are 17 selectable heroes, three inventory slots, unlimited uses, forge +0..3 at 100 gold each, +2 attack/healing per forge step. Buying into a full bag currently silently replaces its equipped slot. That must become an explicit replacement confirmation before expanding the shop. `WeaponDefinition` already has range, minimum range, damage kind, effectiveness, drain, criticalBonus and healingBonus. Skill, Luck, Defense and Resistance persist per member. Combat **already rolls critical hits** and triples damage; the missing feature is meaningful visibility and recorded critical voices, not a new multiplier. Current chance uses stat growth above base, adds Luck growth, caps at25%, and does not subtract defender Luck. Killing Edge +20 is already active.

Keep three slots: a safe primary, a situational counter and support/burst. Let forging improve a familiar tool, while purchasing changes its tactical purpose. Show range/AOE/cooldown icons and a before/after preview; “Buy” should state whether it equips. Never require gold pickup grinding or make an old item useless.

## Authentic class access and each current hero

This is a deliberately restricted class-path adaptation; Awakening reclassing gives many additional possibilities. Weapon access follows class rather than arbitrary personal lists. Shared family progression avoids seventeen bespoke combat implementations.

| Hero | Awakening starting role / access | Current adaptation and recommended progression |
|---|---|---|
| Chrom | Lord, swords; Great Lord adds lances | Preserve Falchion; add Rapier armor/cavalry counter, then Silver Sword. Great Lord/lance is optional later, requires class state. Story-awakened Falchion rather than shop purchase. |
| Lucina | Lord, swords; Great Lord adds lances | Parallel Falchion, Rapier, Silver Sword; same optional lance gate. Keep Falchion identities hero-locked. |
| Frederick | Great Knight; sword/lance/axe | Iron tools → Hammer or Javelin → Silver Lance/Brave Axe; hold a frontline counter slot. |
| Virion | Archer, bows; Sniper bows, Bow Knight adds swords | Iron Bow → Longbow reach or Killer Bow crit → Brave Bow burst. Sword requires explicit Bow Knight promotion, not ordinary purchase. |
| Sumia | Pegasus Knight, lances; Falcon Knight adds staves, Dark Flier adds tomes | Iron → Javelin → Silver Lance. Optional later support or magic promotion; do not grant both branches silently. |
| Cordelia | Pegasus Knight; same two branches | Same valid lance family, favor safe reach/anti-rider. Promotion branch chosen separately if implemented. |
| Morgan | Starting class varies with parent; not universally Tactician | Current Tactician is an explicit fixed adaptation: sword/tome, Fire/Thunder → Elfire/Wind → Thoron. Grandmaster keeps sword/tome. |
| Robin (M) | Tactician sword/tome; Grandmaster same | Iron Sword+Fire → Levin Sword or Elfire → Thoron/Bolganone. No default staff without reclass. |
| Robin (F) | Tactician sword/tome; Grandmaster same | Same permissions/progression, gender affects assets/voice, not equipment legality. |
| Lissa | Cleric, staff; War Cleric adds axe; Sage adds tome | Already War Cleric: Heal/axe → Mend/Hammer → Physic or Fortify. Axe+staff is current promoted adaptation, not starting-class canon. |
| Lon’qu | Myrmidon swords; Swordmaster same, Assassin adds bow | Iron/Killing Edge → Levin Sword situational → Silver/Brave Sword. Bow only after explicit Assassin gate. |
| Miriel | Mage tome; Sage adds staff; Dark Knight adds sword | Already Sage: Fire/Heal → Elfire/Mend → Bolganone/Physic. Tome+staff is promoted adaptation. |
| Ricken | Mage tome; same promotion choices as Miriel | Fire/Thunder → Elfire/Wind → Thoron. Staff requires Sage state; do not invent Heal in starting bag. |
| Stahl | Cavalier sword/lance; Paladin same, Great Knight adds axe | Iron → Armourslayer/Javelin → Silver Lance; axe only under promotion. |
| Sully | Cavalier sword/lance; same promotion branches | Iron → Beast Killer/Javelin → Silver Sword/Lance. |
| Tharja | Dark Mage; ordinary and dark tomes; Sorcerer keeps dark access | Fire/Nosferatu → Ruin critical or Elfire → stronger standard tome plus Nosferatu. Dark Knight promotion loses normal dark-tome permission. |
| Vaike | Fighter axes; Warrior adds bow, Hero adds sword | Iron → Hammer/Killer Axe → Brave Axe. Sword/bow require correct chosen promotion. |

Sources for starting classes and promotion permissions: [recruitment](https://serenesforest.net/awakening/characters/recruitment/main-story/), [class introductions](https://serenesforest.net/awakening/classes/introduction/). Full class-tree/reclass simulation is deferred; current visually supported classes can carry ten missions without it.

## Four meaningful tiers across ten missions

| Tier | Missions/shop availability | Decision offered |
|---|---|---|
| Field kit | 1–2 | Starting tools, normal primary and one alternative; optional forge1. Teach minimum bow range and swapping before adding complexity. |
| Specialist | 3–5 | Armor/cavalry counters, Javelin/Hand Axe, Wind, Elfire, Mend; choose crowd coverage versus safe recovery. |
| Veteran | 6–8 | Silver families, Longbow/Killer Bow, Arcfire/Arcthunder/Arcwind, Physic; longer recovery/high investment versus targeted reliability. |
| Finale | 9–10 | One party-earned signature upgrade per hero family: Brave burst, Thoron line, Bolganone area, Fortify group recovery. Choice reward, not mandatory shopping chore. |

Suggested **real-time adaptations**, not Awakening weapon behavior: sword cone cleave; lance narrow thrust; axe wider cone with slower recovery; bow piercing line or two timed shots; fire impact radius32/48/64 at Field/Specialist/Veteran; lightning narrow line; wind anti-flying fast projectile. Bolganone radius80, ~1100ms recovery, lower single-target efficiency than Thunder. Forge modifies power modestly (+2 per step), with a single clear optional radius upgrade for a named fire family; do not multiply both radius and damage every step. Thunder's Awakening crit bonus and Wind's flying effectiveness can remain sourced properties. Fire-family tomes are single-target 1–2-range weapons in Awakening: our AOE is explicitly an adaptation. Radius64 covers4× radius32 area, so damage/cap/cooldown must pay for that coverage.

Brave attacks are two scheduled strikes sharing an attack ID and cooldown; do not grant free switching resets. AoE targets each take one hit per attack ID. Keep Nosferatu healing based on **actual HP removed**, cap drain per attack, exclude structures and avoid multiplication from multi-target overkill. Fortify earns healing XP only for real missing HP, has long recovery and limited radius; no XP farm from overheal.

Suggested budget: normalize kills to gold8–12, mission rewards100/125/150/175/200/225/250/275/300/350 (2150 guaranteed across ten). Specialist120–180, Veteran240–320, Finale400–500; forge80/140/220. Four members can each acquire one specialist plus two veteran items across a route without collecting every coin. Start rewards/costs are provisional: record treasury, purchases, missed pickups and time-to-kill with one-healer, double-support, melee-heavy and solo parties before fixing them. Guaranteed victory reward must cover an appropriate counter before the following mission. No durable weapon breakage in this first expansion.

## Critical rules and voices

Authentic Awakening reference: critical stat = weapon crit + floor(Skill/2); target critical chance subtracts enemy Luck/support avoidance; successful crit triples damage. [Combat calculations](https://serenesforest.net/awakening/miscellaneous/calculations/). Existing survival rules intentionally differ. Keep triple damage initially, expose chance in shop/Info, use pure `criticalChance(attacker, defender, weapon)` and injected RNG. Choose and document either authentic stat formula or growth-relative survival formula; recommended survival rule: `clamp(weaponCrit + floor((skill-baseSkill)/2) - floor((defenderLuck-baseLuck)/2), 0, 25)%`. It removes unexplained Luck-as-offense without making starting Luck10 extinguish every ordinary crit. Canon-faithful formula is a separate balance choice. Do not call this exact Awakening math.

Roll once on first valid damaging hit for an attack, retain result for its burst/AOE children, no roll on empty air/heal/structures. One critical feedback event per attack ID. Local colored damage number + sourced short flash/critical sound; avoid screen-freezing cutins in thumb combat. Prioritize controlled hero voice, audible nearby companion crit second; voice gate ~4sec global/~8sec per hero, one active spoken voice, death/help priority above crit above normal attack. Damage still occurs when voice is suppressed. Preserve independent voice/SFX/music mute preferences.

Local `audio-review/catalog.json` contains physically present CUTIN candidates for **all17** heroes; none yet registered as critical in `AUDIO_ASSETS`. CUTIN filenames identify candidates, not verified English transcripts—audition before selecting. Files are from [399888 character archive](https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/399888/) and [406669 Robin archive](https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/406669/). Existing attack/death recordings are not replacements for critical lines.

| Hero | Local voice token | Present CUTIN candidates |
|---|---|---|
| Chrom | CHROM | 4 |
| Lucina | MARTH | 4 |
| Frederick | FREDERIK | 4 |
| Virion | VIAUR | 5 |
| Sumia | SMIA | 4 |
| Morgan | MARC_M | 4 |
| Robin M / F | PLAYER_M1 / PLAYER_F1 | 4 each |
| Cordelia | TIAMO | 4 |
| Lissa | LIZ | 4 |
| Lon’qu | RONKUU | 4 |
| Miriel | MYRIEL | 4 |
| Ricken | LICHT | 4 |
| Stahl | SORT | 4 |
| Sully | SOIREE | 4 |
| Tharja | SALLYA | 4 |
| Vaike | WYCK | 5 |

Candidate example `SE_VOICE_CHROM_CUTIN1_1.wav`; exact catalog paths must be retained in provenance with archive member/hash after audition. No missing hero candidates found; runtime critical mappings all missing today.

## Compatible schema and save plan

Extend weapon definitions with declarative capabilities, not hero switch statements:

```ts
type AttackShape = {kind:'cone';angle:number}|{kind:'projectile';pierce:number}|
 {kind:'impact';radius:number;maxTargets:number}|{kind:'line';width:number};
interface WeaponCapabilities {
 shape: AttackShape; windupMs:number; recoveryMs:number;
 burst?: {count:number;intervalMs:number}; criticalPercent:number;
 healing?: {kind:'single'|'area';radius:number;maxTargets:number};
 restrictions?: {heroes?:Hero[];classTags?:string[];rank?:WeaponRank};
}
// weapon definition: tier, unlockMissionId, capabilities; item: same weaponId/forge.
```

`canEquip` needs special-weapon hero restrictions and dark-tome class tags: generic `tome` permission currently lets all mages buy Nosferatu. Existing proficiency types are declared but not enforced; avoid displaying ranks until real progression exists. New class state is only needed if promotions are actually implemented.

Savev2 should have campaignId and stable missionId rather than hard-coded0..4; validate against a campaign definition. Preserve v1 key for migration, write new v2 key after successful decode, retain backup. Map four old stage IDs to explicit legacy campaign nodes; never shift a completed saved mission into a different story location silently. Offer legacy completion or start expanded campaign with earned roster carried deliberately. New schema fields default from weapon definitions; reject unknown weapon IDs gracefully with clear recovery, do not discard whole valid campaign without explanation. Active/reserve equipment and pending reward idempotence must migrate together.

## Implementable slices / tests

1. Pure attack capability resolver + shape preview and projectile attack snapshots; unit tests cone/line/area hitcaps, immunity/factions, per-attack duplicate protection, actual-drain, switch cooldown retention.
2. Specialist shop unlocks + explicit bag replacement and before/after equip feedback; tests no lost items/gold on cancel, wrong class/hero/dark permission, reload/pending results/reserves.
3. Audition and import17 critical clips; pure chance seeded tests0%/cap/guaranteed critical/triple post-defense scaling; browser real controlled and companion attack verifiesone voice per attack, mute/no double cue, unrelated chatter cannot starve death voice.
4. Four-tier economy + ten campaign IDs/savev2 migration; old in-progress/results/complete save fixtures, corrupt/unknown item recovery, exact once rewards, retry without gold duplication.
5. Tune in natural run matrices, not stat-injected victories: gold choices, damage taken, objective pressure, boss time and weapon usage. Acceptance: every hero has at least one useful situational upgrade; starter weapon remains viable; same/solo/double healer parties all have documented bounds.

Primary general reference: [Nintendo Awakening electronic manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/fire_emblem__awakening_1/ElectronicManual_Nintendo3DS_FireEmblemAwakening_EN.pdf). Precise class/formula/item data are independently compiled by Serenes Forest, not official Nintendo documentation. Item tables: [swords](https://serenesforest.net/awakening/inventory/swords/), [lances](https://serenesforest.net/awakening/inventory/lances/), [axes](https://serenesforest.net/awakening/inventory/axes/), [bows](https://serenesforest.net/awakening/inventory/bows/), [tomes](https://serenesforest.net/awakening/inventory/tomes/), [staves](https://serenesforest.net/awakening/inventory/staves/). No quotes copied.
