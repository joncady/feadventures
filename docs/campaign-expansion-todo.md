# Ten-chapter campaign implementation tracker

GitHub issue #85 is the source of truth; this file records concrete local integration work.

## Foundation completed locally

- [x] Audit original four maps, campaign boundaries, progression, economy and source assets.
- [x] Define stable chapter IDs and ten-chapter order in `campaign-catalog.ts`.
- [x] Preserve the classic four-stage runtime until expanded Arena integration is reviewed.
- [x] Add ten-map definitions in `campaign-expansion.ts` and six distinct source-composed authored layouts.
- [x] Parameterize campaign completion by campaign ID rather than a hard-coded fourth result.
- [x] Save schema v2 persists campaign ID and stable mission ID using the existing storage key.
- [x] Decode original version-one checkpoints as `classic-four`, including pending results; finished originals remain finished.
- [x] Cover all original checkpoint positions, ten-stage idempotent rewards/advance/reload and invalid identity rejection.
- [x] Repair only formerly allowed/newly restricted Nosferatu/Falchion items on version-one load after raw inventory validation; retain XP and remaining gear. Refund removed Nosferatu’s actual original150G purchase plus100G for each paid forge tier; personal Falchions were not shop offers, so refund only their100G-per-forge investment. Persist a `migrationNotice` with hero/item/forge/refund and an acknowledgement flag. Version-two invalid loadouts still reject.
- [x] Preserve exact original valid version-one bytes under `feadventures.campaign.v1.backup` before first version-two write; never overwrite that backup. Invalid checkpoints cause no writes on load. Migration/refunds commit once, including repeated reload.

## Contracts for implementation agents

`CampaignId` is `classic-four | awakening-ten`. `missionIds`, `missionIdAt`, and `missionIndexFor` resolve a campaign. `newCampaign(party, 'awakening-ten')` opts into the expanded route; omitting the option preserves current behavior. `CampaignState.missionIndex` remains a compatibility index, while saved v2 envelope `campaignId`/`missionId` identifies the actual chapter. Decode resolves the index from the stable ID, so reordering chapters does not reinterpret a valid checkpoint. A completed envelope has `missionId: null`. Old saves stay on the original campaign; there is no silent reopening of completed campaigns or reassignment of a Walhart checkpoint to a different fight.

`EXPANDED_CHAPTERS` supplies title, arc, target seconds, authored enemy level, reward and route-specific advance gates. `EXPANDED_CAMPAIGN_MAPS` supplies map configurations and explicit readiness flags. `mapsForCampaign` and `mapForCampaign` resolve either catalog; unknown identity returns undefined. Six new layouts are authored in `expansion-layouts.ts`, exported by `scripts/compose-expanded-maps.py`, using the same chunk-local rectangles for sourced terrain placement and collision. All ten configurations pass objective/spawn/guard/deploy reachability and chunk bounds checks. Aversa and Yen'fay now have genuine registered assets. Additions remain `integration-required` until normal-input campaign play and camera review; runtime scene/deployment fixtures alone do not imply full acceptance. No generic art is substituted under a named boss.

## Next integration tasks

- [x] Arena receives campaign ID/stable map ID, resolves either map catalog, publishes identity in HUD/events.
- [x] Replace hard-coded mission-index wave gates, four-camp assumptions, spawn margins and map-specific HUD layout with map data.
- [x] Compose six new compact layouts from credited Plains/Fort/Stronghold building blocks; match 32px terrain scale.
- [x] Validate chunk bounds/socket alignment plus actual ground reachability for every spawn, deploy cell and objective.
- [ ] Play actual body movement and flight on every route; inspect concealed arrivals and camera/UI coverage.
- [x] Expand dialogue/shop/results/dev jump to ten mission IDs; finale wording follows catalog completion.
- [x] Present `campaign.migrationNotice` in preparations and require explicit acknowledgement; name affected heroes and exact refunded gold.
- [x] Add ten-chapter stock/reward schedules, stock pagination and explicit full-inventory replacement confirmation. Expanded forging costs100/180/280; classic costs100 remain unchanged.
- [ ] Measure actual pickup budgets and weapon usefulness in uninterrupted campaign trials.
- [x] Asset agent acquired and audited Aversa/Yen'fay genuine map sprites/portraits, registered profiles and animations. See commander sources and asset audit; Arena consumes their IDs and Aversa flight.
- [x] Integrate critical hits with sourced per-character voices and voice rate limiting; independent native weapon/critical and phone layout fixtures passed. Physical-phone acceptance remains open.
- [ ] Fresh and carried-progress trials: melee-heavy, magic-heavy, one healer, no healer, solo; measure failure/time/HP/spend and no forced exact-party wins.
- [ ] Independent desktop/mobile layout and campaign save/retry/result audits; publish only reviewed milestones.

## Planned mission order

1. Reports from the East — road ambush onboarding and eastern exit.
2. Village Watch — first defense with mixed raiders and urgent healing.
3. Plegian Gate — armor plus ranged cover; two ground approaches.
4. The Mad King — Gangrel while the village remains alive.
5. Valmese Foothold — landing route and alternating mixed-damage pressure.
6. Castle Siege — three assaults, open gates and breakable defensive barricades.
7. Chon'sin Pass — Yen'fay, precision melee boss and recovery punishment.
8. The Conqueror — assault Walhart's Stronghold.
9. Grimleal Approach — flying tome commander Aversa, bow/Wind counterplay.
10. Black Keep — Validar and bounded late minions, final mixed-party test.

Target about 28–35 active battle minutes plus preparation, replacing the earlier twenty-minute ambition. Timings are authored targets requiring uninterrupted normal-input trials, not verified clear guarantees.

## Source boundaries

Nintendo identifies [Gangrel's Plegian war](https://guide.fire-emblem-heroes.com/en-US/10004001000530-2/), [Walhart's Valmese conquest and Yen'fay](https://guide.fire-emblem-heroes.com/en-US/10006001000273-2/), and [Aversa's allegiance to Validar](https://guide.fire-emblem-heroes.com/en-US/10005003000306-2/). This is a compressed inspired campaign, not the original chapter script. Walhart is not Validar's subordinate.

Existing local terrain sources are `asset-library/map-candidates/compact/fort-tileset.png` and `stronghold-tileset.png`, with contributor credits/terms in adjacent `sources.json`. Existing commander sources are `asset-library/awakening/commanders/` (Gangrel63479/63343, Walhart64151/63395, Validar63603/63393).

The [Awakening asset index](https://www.spriters-resource.com/3ds/fireemblemawakening/) links Aversa63501/63358 and Yen'fay63524/63397. Aversa's [map page](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63501/) confirms a384×3584 PNG submitted by Ploaj. Yen'fay is index-verified only; detail fetching was unavailable. Both extra commanders are acquired, normalized, credited, and registered locally; source sheets and derived runtime assets are tracked in the commander inventory. No Grima map sprite has been verified, so no Grima fight is promised.

## Source-composition verification

Six authored layouts each contain three connected sections. `docs/playtests/campaign-expansion/authored-map-contact-sheet.png` shows the exact compositions: two defense/ritual courtyards, two fortified halls, one coastal lane, and one bending forest pass. Images use source grass/road/water from WAve Plains, trees/houses from credited Fort, and floor/wall/carpet/throne pixels from credited Stronghold. Native16px tiles enlarge2×; no generated world art, treasure chests or painted replacement assets. Source crops are explicit in the composition script. Python must have Pillow; the bundled workspace runtime supplies it.

## Runtime integration checkpoint

Fresh stories explicitly opt into `awakening-ten`; saved unnamed/version-one campaigns remain `classic-four`. Dev-menu buttons specify the current campaign, while the existing programmatic numeric jump accepts an optional campaign ID for explicit compatibility. Advance routes use authored2D gate coordinates and a sticky per-wave reached flag; gates reset at each wave. Timed defense waves keep the reviewed release/minimum-time behavior and do not require tracking down every archer. All ten objective identities, backgrounds and four-character deployments are tested in actual Arena scenes. Structural result fixtures verify ten boundaries, real chapter rewards and the tenth finale; they are not natural combat clears.

Village Watch has sourced open north/south arrival collars so concealed reinforcement scheduling cannot deadlock a compact fully visible courtyard. Landing/Pass also expose reachable edge-entry candidates. Expanded enemy health/cadence are authored chapter budgets, not dynamic party scaling; full-route tests must tune them.

## Local release validation checkpoint

The frozen candidate passed 157 of159 browser cases in one complete serial run. The two remaining findings were isolated: a manual browser fixture saved the returning-player acknowledgement at the default4173 origin instead of the isolated5211 origin, and classic boss guards had regressed from level3 to2. Corrected origin fixtures passed eight checks; the final fullscreen native tap passed twice after waiting for Phaser input scaling to match CSS fit. Restoring classic level3 preserved the original tactical assertion, which passed unchanged. The final unit/typecheck/build check passed98 tests. This is automated structural/input acceptance, not a natural ten-chapter clear or broad party balance acceptance.

Final preparation summaries now use each member’s actual speed-adjusted battle recovery, disclose Fortify’s four-ally cap and healing bonus, and show staff forging as healing gain. Four affected native shop/replacement/migration checks passed after that correction; the final98-test unit/typecheck/build check passed.

## Natural balanced-party route checkpoint

One carried-progression balanced-party route now cleared all ten chapters, with retries recorded. The patched finale won in240 seconds,26 defeats, against Validar2200HP; Frederick99HP and Ricken97HP remained. Actual Results → Continue reached campaign completion. This closes the single-route end-to-end playability check, while the broader melee-heavy/magic-heavy/no-healer/solo matrix and human phone acceptance remain unchecked. The candidate remains local for review.


## Distinct-map redesign — issue #92

Source of truth: GitHub project issue #92. No release until visual and runtime review.

| Chapter | Art identity | Source composition | Runtime/navigation | Independent review |
| --- | --- | --- | --- | --- |
| 1 East Road | Woodland ambush lane | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 2 Village Watch | Tight inhabited defense | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 3 Plegian Gate | Exterior moat and gate | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 4 Mad King | Damaged capital court | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 5 Valm Landing | Quay, bridge district, guard yard | Approved Rev6 source-only renderer | Integrated; source/route/deploy checks and actual launch/hidden spawns pass | Approved art benchmark; focused runtime checks passed; full regression pending |
| 6 Castle Siege | Compact bastion defense | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 7 Chonsin Pass | Ridge and switchback | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 8 Conqueror Hall | Imperial avenue and dais | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |
| 9 Grimleal Approach | Dry shrine and ruined bastions | Approved Rev7 source-only renderer | Integrated; source/route/deploy checks and actual launch/hidden spawns pass | Approved art direction; focused runtime checks passed; full regression pending |
| 10 Black Keep | Broken ritual sanctum | Authored source-crop composition | Integrated; source/anchor/4-hero-capacity checks pass | Art direction GO; actual launch/hidden spawns pass; focused runtime checks passed; full regression pending |

Production map PNGs contain terrain only: no sample party, hostile sprites, HUD or scenic guards. Classic-four backgrounds and contracts are preserved. Chapter JSON owns exact source crops, physical solids and anchor overrides; canonical composer emits expanded-only PNGs and generated typed data. Closed coastal portcullis is physically solid, and the campaign route stays on the exterior landing road.

All ten expanded profiles are now runtime-integrated under unique `mission-expanded-*` keys. Source/anchor/route/capacity tests pass. Independent actual Arena review confirmed 5/9 auto-placement, launch and twenty hidden spawn camera poses per map; all ten subsequently passed that same actual scene check. The shrine NPC initialization finding was fixed by moving its two reserved guard cells inside the deployment bounds. Castle Siege retains its original eight 320HP dynamic barricades, placed beside four open entrances; visible permanent facades have separate matching terrain footprints.

Independent actual Arena acceptance now passed all ten chapters: four ground heroes plus each map’s reserved NPCs auto-place and battle launch succeeds; 200 sampled hidden legal arrival checks pass. The final source/typecheck validation passes fifteen targeted tests, including all eight castle barricade HP/count preservation, no permanent collision below destructible footprints and four open entrances. Focused independent actual castle movement/flying/projectile/destruction checks now pass; native route and desktop/phone camera evidence is recorded in `docs/playtests/map-art-direction/native-route-review/REPORT.txt`. Full 175-case browser regression remains pending.

Current map-art release gate: all ten visual directions reviewed; actual all-ten deployment/launch and 200 hidden-arrival checks pass; three obstacle-placement rejection cases and castle physics/flight/bow/magic/breach checks pass. Native-input representative routes and phone camera captures are documented separately, with their fixture limits. The full frozen 175-case browser run is in progress. No deployment/version completion is claimed until that run and release CI succeed.
