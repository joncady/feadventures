# Finite campaign and final boss plan

Default local play now uses a finite larger single-map battle with four planned enemy camps, deployment and a switchable party. The previous endless small-map swarm is retained only as a regression fixture. This is the next-stage design, not a claim that campaign progression is implemented. Existing `map2.png` and `map3.png` are available, but archived v1 defines collision rectangles only for map 1; v1 always selects map 1. Each new map needs visual collision review, safe spawns and connected navigation tests.

Use three stages for the first campaign:

| Stage | Encounter | Proposed completion |
| --- | --- | --- |
| 1: Outskirts | Existing map, 3 short waves teaching melee, archers and axemen | All scheduled enemies defeated |
| 2: Fortified approach | Verified map 2, 4 mixed waves adding mages, armor and cover | All waves cleared |
| 3: Boss arena | Verified map 3, short approach wave then a commander | Boss defeated and remaining hostiles/projectiles cleared |

Wave budgets and compositions belong in typed stage data, not random selection across every class. Keep survival pressure, cap simultaneous hostiles initially at 30, and introduce mages deliberately. Record tuned budgets after playtesting rather than equating stage difficulty to unlimited wave growth.

Track a run separately from ArenaScene: stage index, wave index, health, selected hero/loadout, total kills, and phase (`battle`, `transition`, `defeat`, `victory`). ArenaScene owns transient sprites, physics, timers and navigation. Stage transitions destroy that scene and start a fresh one using the next stage definition and carried run state. Stage-specific terrain is passed to every navigation/line-of-sight/spawn check, replacing global OBSTACLES.

Clear a wave exactly once only after scheduled/retried spawns are finished, hostile units are gone and hostile projectiles are gone. Allied soldiers are excluded. After a final wave, stop all spawns/attacks, clear transient combat effects and show a transition panel with stage summary and an explicit Continue button. Offer +25 health capped at 100 and deploy two fresh soldiers at the next safe spawn; carry the hero and weapon. No automatic equipment progression is assumed. Pause/menu/death must cancel transition timers and prevent double advancement. Restart begins a fresh campaign at stage 1; menu exits the run.

First boss: a commander loadout using a verified existing armored sprite as a clearly labeled placeholder until a boss asset is selected. Give it a named health bar and distinct telegraphs, not only inflated health. Proposed phase 1 above 50% health: slow directional melee/lunge with a clear recovery opening. Phase 2: add a telegraphed Fire spread and at most two reinforcement waves (75%/40% thresholds, each triggered once), maintaining the hostile cap. Guard all phase changes on active/living boss state. Boss damage, faction, Defense/Resistance and triangle rules use the shared combat pipeline. No unavoidable arena-wide damage or unverified Grima animation assumed. Final victory replaces the defeat panel and shows completed stages/kills, replay and hero selection.

Deliver in three reviewable slices:

1. Stage definitions and run state, bounded wave scheduling, carry/reset rules and clear-once tests on the existing map.
2. Map 2/map 3 collision/spawn verification, stage HUD and transition UI; regression for pause, menu, death and projectiles at transitions.
3. Boss health/phase/telegraph logic, bounded reinforcements and victory; regression for simultaneous death, threshold crossings, friendly fire and replay cleanup.

Before release, playtest a complete run with sword, bow, tome and flyer; check ranged dead zones, ally survival, terrain refuge and large-swarm frame times. Campaign work remains local until approved.
