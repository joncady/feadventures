# Campaign and stage-one boss plan

## Verified four-mission implementation — 2026-10-10

The current default campaign is bandit road → village defense → castle defense → Black Keep assault. Native briefings and preparations preserve per-character XP/equipment and treasury; all heroes recover between missions, and loss retries restore the pre-mission checkpoint without duplicating gold. Authored timed waves can retain survivors; at commander arrival old wave survivors withdraw. Castle/final commanders have900/1400HP and summon three reinforcements at75%/40% health. Commander death ends these missions. Standalone legacy siege retains its original all-hostiles-clear rule.

Measured default-setting normal campaign completion:12:40.76, all four Morgan/Miriel/Sumia/Virion alive. Mission clocks2:47/2:33/about3:05/2:59. Evidence in docs/playtests. The original plan below is historical and no longer describes current campaign victory rules.

## Earlier standalone stage plan

Current local play uses an expanded single-map camp-clear battle, manual army deployment and a switchable party. The old endless small-map swarm remains a regression fixture. Stage-one staggered waves and the commander below are now implemented locally. Later-stage carryover/resupply remains future work.

## Revised stage one: deployment → three fronts → commander

Stage one is Outskirts on the expanded battlefield. No army units start deployed. The player places the leader, chosen companions and 4 NPC soldiers on valid open ground. Require all selected units to be placed before confirming; allow selecting a deployed unit again to reposition it. Four camps show the scheduled composition for planning. The controllable party remains leader plus three companions; regular hostiles retain the expanded 48-enemy budget.

The proposed regular budget is 48 enemies, split into three 16-unit waves. Each wave lasts at least 45 seconds; initial muster is 5 seconds. Each camp releases four units per wave from its existing deterministic positions. Wave 1 introduces soldiers/axes and a few archers, wave 2 introduces armor and mages, wave 3 mixes the current camp compositions. Wait for all enemies and hostile projectiles to clear, then show a 10-second regroup warning before the next wave; pause freezes that countdown. Keep at most 24 simultaneous hostiles including reinforcements. No random edge spawns. Telegraph a camp release before its units become active.

After wave 3, summon the Outskirts Commander at the northeast camp with a visible announcement and dedicated HP bar. Use the verified generic heavy/armored sprite until a named villain is imported. Starting tuning: 3,600 HP (far higher than a regular enemy), 8 Defense, 5 Resistance, modest movement, long melee windup and a clear recovery window. At 75% and 40% HP, summon a fixed six-unit elite squad once: two knights, two mages, two axemen. Elites are explicitly level 3, with 1.5× class HP and 1.25× base damage, and award additional XP. Reinforcements obey the cap and must use reachable camp positions; never spawn on an allied unit. Shared damage scaling applies to the commander and elites too.

Victory requires the boss, all minions and hostile projectiles to be gone. Then show a native stage summary and explicit Continue/resupply choice. Carry every party member's XP, level, stats, health and loadout into stage two. Restore fallen companions at the stage boundary with a limited recovery rule; soldiers are finite during combat and replenished only during resupply. Menu/restart cancels all scheduled releases and resets the campaign. This wave/boss schedule is active locally. Stage-two transition and resupply are still planned. The phase clock uses active scene delta, so pausing freezes releases, minimum windows and countdowns. Regular units release in four groups at 8-second intervals, staggered 0.5 seconds between camps; minions release at 1.5-second intervals.

Validate skipped/double wave transitions, both boss thresholds crossed in one hit, boss killed before reinforcements, lethal simultaneous attacks, menu during countdown, pause/resume and replay. Playtest complete clears with sword, bow, magic and flying leaders before fixing final health values.

## Later stages and run state

Continue to a fortified approach and then a final commander arena. Existing archived map2/map3 images need visual collision and connected spawn/navigation verification before use. Keep the same geometry shared by physics, pathfinding and line of sight. A typed run state carries stage, wave, party membership, each character’s health/XP/stats/loadout, total kills and phase. Arena owns transient sprites, timers and effects. Explicit Continue/resupply creates the next Arena with carried state; menu/restart cancels timers and resets the run. The later final boss can use additional telegraphed phases after the stage-one commander establishes the boss lifecycle.

## Pacing target and deployment controls

Target a 3–5 minute stage at default 50% damage, without counting deployment or pause. The fastest regular-phase schedule reaches the commander after 168 seconds (5 + 3×45 + 2×10 + 8); remaining combat and commander damage determine the full clear time. Boss HP is tunable and full-run playtesting is still needed before promising a fixed duration. Higher damage settings and concentrated allied placement can shorten combat; cautious play can take longer. WASD/arrows move the deployment cursor, Space places once and advances through remaining units in order, and R begins when the whole army is placed. Mouse placement follows the same confirmation flow.

## Camp defense tuning

The central hero camp has 600 HP and its destruction ends the battle. Companions follow the controlled hero and seek nearby enemies; four soldiers hold their deployment area. Releases choose reachable positions outside the current camera with a 70-pixel margin. The minimap hides enemies outside the camera; persistent explored-terrain fog is not implemented. Deployment snaps to a 64-pixel grid: WASD/arrows move one cell, Space places and advances. Party portraits appear beside the roster.

Tactical attack cooldowns are 2.4 times the previous values, shared with companion AI. During the first 65% of recovery, player movement falls to 30%; a bottom HUD bar shows recovery and readiness. The camp art is a procedural placeholder. A verified Awakening hand cursor remains an asset follow-up; planning currently uses a blue cell outline.

## Level-one golden path: castle siege

Choose a leader and up to three companions, then deploy all heroes and four soldiers inside the castle courtyard. WASD/arrows and Space use the planning grid; mouse placement obeys the same courtyard limits, including for Pegasus heroes. Begin battle starts three staggered waves from four exterior fronts. Archers fire over intact walls; Pegasus units fly across them. Ground melee allies hold inside until a breach gives them a reachable enemy.

The world is now 1280×896 (59% of the former area), with a central 512×384 courtyard. North, east, south and west defenses each have 320 HP, shown above their wall section. Hostiles unable to reach the army target a reachable wall approach. On destruction, its artwork and collider disappear, navigation rebuilds, and attackers can enter that side. Friendly attacks do not damage walls, and wall destruction awards no XP or pickups. Enemy arrows aimed at a wall damage it; arrows aimed beyond it pass over. Magic is blocked by intact defenses. No repair system is implemented.

Protect the 600-HP hero camp through the waves, then defeat the 3,600-HP commander and its elite reinforcements. Camp loss or loss of the whole controllable party ends the run. Damaged walls remain damaged throughout this battle; retry resets the fortifications. This is local tuning, not yet published. Castle floor/wall artwork uses FE8 community tiles by N426 from the FE Universe-linked FE-Repo; Awakening character assets remain unchanged. Source credits and reproducible crops are recorded in asset-sources.json.

## Open-castle revision

Level one now has a 128-pixel entrance at the midpoint of each side. Eight breakable barricades (two per side, 320 HP each) flank the entrances. Ground units can engage through the openings immediately; nearby hostiles can still break a barricade to create a shortcut. Archers shoot over intact barricades and Pegasus units cross them. Walls are cover and route constraints rather than a mandatory combat gate.

Four soldiers automatically deploy at four distinct randomly selected posts from BATTLEFIELD.soldiers. The post list belongs to this map and can change for later stages. Their positions persist for the battle; retry chooses posts again. Player setup now places only the chosen heroes. The planning cursor clamps to the courtyard grid, and clicks outside it leave both cursor and deployment unchanged. NPC placement controls are hidden.

## Level-one companion guard areas

Companions guard a 240-pixel radius centered on their original deployment position. They engage nearby hostiles, drop pursuit once targets leave that area, and return to their post within a 16-pixel tolerance. Moving or switching the controlled hero does not move those anchors. NPC soldiers retain their existing guard-post behavior. The battlefield data exposes companionBehavior (`hold` or `follow`) and companionRadius; level one uses `hold`, while the planned second map can select `follow`. Map two is not implemented yet.
