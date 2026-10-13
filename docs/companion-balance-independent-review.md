# Companion balance independent review — local campaign candidate

Status: source audit complete; natural-input campaign and contrast trials pending. This document does not claim measured encounter balance from source arithmetic.

## Recommended initial party and roles

Chrom / Frederick / Lissa / Miriel is a useful balanced reference, rather than a guaranteed strongest party. Chrom supplies close sword pressure against axes; Frederick's lance reaches farther and beats swords, with sword/axe alternatives; Lissa begins with Heal and serves as an AI healer; Miriel begins with Fire, covering armored physical enemies and carrying a staff for urgent healing. Two staff-capable companions give recovery redundancy, but Miriel pauses offensive casting while responding to injury. Lissa is initially a dedicated staff user: the urgent-heal switching mechanism does not switch a character already carrying a staff to an offensive weapon when allies are healthy. Players can equip her axe deliberately.

All heroes begin with identical base stats (100 HP, zero Def/Res). Character differentiation initially comes mostly from equipped weapons, flying, class inventory permissions, and subsequent probabilistic growth. Frederick is not initially a high-defense tank despite the Great Knight title. UI recommendations should describe concrete current behavior rather than imply lore-derived base stats that the game does not implement.

Healing restores 15 HP at starting Mag 15, once per approximately 4.32 seconds in tactical play (1800 ms weapon cooldown ×2.4). Normal staff casts prioritize damaged nearby allies; explicit self-heal remains separate for the controlled character. Healing does not revive fallen heroes. Noncontrolled Fire/staff hybrids switch when a nearby friendly unit falls below 50% HP, continue until the local emergency rises above 75%, then restore the original weapon with a 4-second reentry gate. Staff range is 180 px, while emergency detection reaches 320 px subject to the deployment/rally anchor. This means an emergency can require travel before the first successful heal.

## Planned contrast matrix

| Party | Main contrast | Risks to observe |
| --- | --- | --- |
| Chrom / Frederick / Lissa / Miriel | Balanced reference | Staff uptime versus lost magic pressure; stable post coverage |
| Chrom / Frederick / Lon’qu / Vaike | Melee heavy, no staff | Attrition, mage pressure, approaching telegraphed bosses |
| Robin / Miriel / Ricken / Virion | Ranged/magic emphasis | Bow minimum range, physical frontline absence, emergency staff movement |
| Chrom / Sumia / Cordelia / Lissa | Flying emphasis | Terrain bypass utility versus bow effectiveness and split heal range |

Use the campaign owner's legitimately earned saved checkpoints and record any prebattle party changes explicitly. Newly added reserve heroes start at level 1 unless the campaign previously developed them; comparing those heroes against veteran members is a party-replacement comparison, not a controlled same-level class test. Do not grant XP, health, kills, gold, timers, or objective advancement to normalize them. Purchases and forges must use the ordinary shop budget. Full-campaign carried-roster runs are the strongest comparison; checkpoint replays are narrower encounter evidence.

## Confirmed source issue requiring native verification

`ArenaScene.createAllies` initializes companions' maximum HP from carried progression but sets defense/resistance to zero, damage to the equipped weapon's raw damage, and movement speed to the base hero profile. Later `gainExperience`, healing, and control-switch paths apply the corresponding carried stats. Therefore an experienced companion can begin a new mission weaker than its own controlled version until one of those update paths runs. Verify native spawned values against checkpoint progression; any fix should apply the same ordinary stat formulas at spawn and preserve NPC soldier defaults. This is a persistence defect, separate from enemy difficulty tuning.

## Evidence limits

An automated normal-input pilot can reliably measure clear time, fallen companions, objectives, pickups and legal shop spending. It can use enemy telemetry for accurate aiming and routes that a human would not know instantly; it does not prove novice phone difficulty, thumb ergonomics, enjoyment or legibility. No production edits were made by this independent reviewer. Village/Keep contrast results and any post-fix evidence will be appended when the campaign pilot releases the shared browser/GPU slot.

## Earned reference checkpoint

The baseline pilot's first Road result is preserved in `docs/playtests/companion-balance/balanced-road-earned-checkpoint.json`, copied directly from its earned save. At that point Chrom/Frederick/Miriel were level 2, Lissa level 3, with 610 total gold including mission earnings/reward. Chrom carried Falchion +1 bought through the normal shop. Frederick had Def 1 / Res 1 / Spd 11; Lissa Res 2 / Mag 16; Miriel Mag 16 / Spd 11. These small but genuine gains are sufficient to demonstrate the spawn parity defect without fabricated high-level test stats. The save is pending Road results, so accepting Continue heals and advances normally; it is not an invented stage-two save. Recorded `savedAt` is the pilot's deterministic clock fixture, not a claim about the real user test date.

## Spawn fix independent verification

The builder applied the ordinary saved-stat formulas when creating companions; NPC defaults remain unchanged. Independent verification passed using the genuine Road checkpoint, after accepting its pending result through the production campaign function. Before any kill, XP event or control switch, Frederick spawned at HP 101 / Def 1 / Res 1 / power 35 / speed 124.4; Lissa at HP 102 / Def 0 / Res 2 / staff power metadata 1 / speed 122.4; Miriel at HP 101 / power 31 / speed 124.4. These match the saved progression and equipment formulas exactly. Switching control to Frederick preserved Def 1 / Res 1 / power 35, with zero kills and zero elapsed battle clock. Raw evidence: `docs/playtests/companion-balance/earned-spawn-parity.json`. The new native preparation contract test also passed in CI mode (1/1, 2.9 seconds); its separately fabricated level-4 preparation fixture is not encounter balance evidence.

No enemy multiplier change is warranted by the initial Castle pilot termination: Walhart still had 3 HP and a full-health Lissa remained, but the driver incorrectly assumed a staff user could not fight. Lissa can equip her legal axe. That is an automation limitation, not a game-over or proof that this roster cannot win. Corrected legal weapon switching and self-healing must precede any difficulty conclusion.

## Natural-input encounter reviews

These runs replayed earned checkpoints, accepted the pending result through the production campaign function, changed the roster with the production preparation API, then used the real Resume/dialogue/shop/deployment controls. One 100-gold forge was purchased normally before each mission; no gold, XP, HP, kills, objective or battle-clock injection was used. Movement, aim, attack, rally and control switching used native keyboard/mouse inputs. Encounter routing and enemy telemetry give the pilot advantages and strategic blind spots compared with a person.

### Village: one healer plus physical and magic coverage

Chrom / Frederick / Lissa / Ricken cleared Gangrel in **2:05 active battle time**, 33 defeated enemies, no fallen heroes. Final HP: Chrom 74/102, Frederick 65/102, Lissa 103/103, Ricken 100/100; village camp 737/900. Chrom/Frederick/Lissa retained their genuine Road progression; newly recruited Ricken started at level 1. Chrom's existing Falchion +1 received the ordinary additional +1 forge. This demonstrates a legal one-healer roster can win, without requiring a second automatic staff user. It does not establish novice phone difficulty or equal-level class superiority. Evidence: `docs/playtests/companion-balance/village-one-healer.json` and matching PNG.

### Keep: balanced veteran roster, authored corridor

Chrom / Frederick / Lissa / Miriel replayed the earned Castle result. The pilot followed the authored center corridor at x512 through y450 → y320 → y128 rather than pursuing unreachable decorative-wall waypoints. It reached Validar and dealt substantial damage, but the party was defeated at **3:34**, 32 defeated regular enemies, with Validar retaining 900 HP. No runtime errors occurred. During the last portion, the pilot held Miriel near (512,164), focused the commander near (296,72) despite intervening north-room decoration, and ignored surviving rear attackers. The commander’s HP plateaued. This is a genuine loss with a weak static targeting strategy, not evidence that the mission is impossible or that enemy multipliers should be reduced. The controlled hero's in-memory party HP is only synchronized at transitions, so intermediate party snapshots can show stale HP; the final defeat record correctly shows all four fallen and controlled HP zero. Evidence: `docs/playtests/companion-balance/keep-balanced-authored-route.json` and matching PNG.

The Keep should receive a human review focused on clearing rear minions, changing firing position for line of sight, timely self-healing and responding to the dark-magic telegraph. Broad scaling changes would be premature from this automated loss.

### Village: melee only, no healer

Chrom / Frederick / Lon’qu / Vaike lost the village at **2:49 active battle time**, 29 defeated enemies, Gangrel retaining 63 HP. The village camp reached zero HP while three party members remained alive: Chrom 91/102, Frederick 36/102, Vaike 89/101; Lon’qu had fallen earlier. This is objective failure, not total-party defeat. The pilot prioritized Gangrel and did not clear every backline camp attacker. Compared with the one-healer run, this roster also removes the ranged magic character and adds two fresh recruits; randomness, target choices, recruitment levels and weapon coverage prevent attributing the result to healing alone. No game errors occurred. Evidence: `docs/playtests/companion-balance/village-melee-no-healer.json` and matching PNG.

## Recommendation and scope

Offer **Chrom / Frederick / Lissa / Ricken as an optional balanced starting suggestion**, while keeping free party choice. It has exactly one healer: verified actual preparation inventory was Lissa Heal/Iron Axe and Ricken Fire/Thunder; Ricken's Mage class cannot equip staves. Chrom and Frederick offer sword/lance/axe coverage, Ricken adds ranged magic, and Lissa provides recovery. Do not silently force that preset or punish alternatives with adaptive enemy inflation.

The completed comparisons support fixing carried-stat persistence and teaching role coverage, defending the village objective, line of sight, and self-healing. They do not justify blanket late-stage enemy buffs or nerfs. Bow-heavy parties have a real close-range dead zone and need room/frontline cover; flying parties bypass walls but suffer double bow effectiveness; multiple magic heroes lose physical triangle coverage but pressure armor. Those remaining roster contrasts were reviewed from implemented rules, not claimed as additional played wins.

Review GO for the minimal companion-spawn stat fix. No further production changes were made by this independent reviewer; all multiplayer, new balancing constants and roster enforcement remain out of scope. A skilled human phone playthrough of the Keep remains necessary to assess boss fairness and enjoyment; the automated final mission loss must not be presented as a completed full-campaign win.
