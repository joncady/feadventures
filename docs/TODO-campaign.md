# Four-mission campaign sprint

Started 2026-10-10 15:36 America/Los_Angeles. Target checkpoint 16:36.

## Golden path
Choose a leader and companions → bandit road east → dialogue and equipment shop → village defense → dialogue/shop → castle defense → dialogue/shop → dark castle assault and final boss → campaign victory. Four approximately three-minute battles plus brief planning/intermissions aim for 15–20 minutes. Actual timing must be playtested, not claimed from timers alone.

## Active assignments
- [x] **maps_index**: inventory all available local assets, map source URLs/credits and missing provenance; reusable chunk-map interface; four compact authored maps from sourced artwork.
- [x] **campaign_runtime**: persistent run state, four mission objectives/waves, difficulty progression, gold pickup, transitions, replay/defeat/victory; preserve flying, retaliation, weapon switching and healing.
- [x] **campaign_scene**: native dialogue, mission briefing, keyboard/mouse shop, companion equipment upgrades and preparation feedback.
- [x] **orchestrator**: coordinate contracts and UX, update GitHub items, review screenshots and pacing, maintain this checklist.
- [x] **playtest agent** (after first integrated build): play naturally without modifying state, report duration/progress/deaths, liked/disliked UX, record blockers; fix/retest through owner agents.

## Progress log

- 15:38: map/runtime/UI ownership assigned; campaign epic #29 updated; verified equipment/flying/retaliation/compact-card/healer tasks #24/#36–39 closed.
- 15:39: four-mission runtime wiring and original briefing/shop UI present; integration/type checks underway. Dialogue/shop task #44 created.

- 15:41: first integrated build and 32 unit checks pass. Asset inventory covers 353 files with explicit provenance confidence; #45 tracks inventory. Campaign UI agent reassigned to normal-speed end-to-end UX playtest. Source freeze coordinated for browser verification.

- 15:44: focused browser campaign passes all four transitions, progression, treasury and victory. Full regression suite running; normal-speed playthrough begun. Root flagged village house crop for map review. Additional generated weapon effects identified for sourced replacement after test freeze.

## Checkpoints
- [x] Shared map/campaign/scene contracts agreed.
- [x] First integrated four-mission path runs locally.
- [x] Asset index and credits complete; no newly drawn local placeholder art remains in campaign.
- [x] Dialogue, shop and party progression survive every transition.
- [x] Each objective is visible and completion/defeat is interpretable.
- [x] Unit/build/type checks pass.
- [x] Browser campaign regressions pass.
- [x] Natural playtest reaches victory or reports concrete remaining blockers.
- [x] UX iteration applied and verified.
- [x] GitHub issues reflect verified completion vs remaining review work.

## Design decisions
- Online sourced assets only; composing/cropping existing tiles is allowed, inventing replacement artwork is not.
- Original short dialogue inspired by Awakening tone; no wholesale script reproduction.
- Q/E characters, F equipment, Space/Click action, WASD movement/menus, Enter/Space dialogue.
- Keep selection and shop decisions brief, with a clear objective before launch.
- No push/deploy requested for this sprint. Preserve all prior local changes.
- Four missions are the required scope; procedural generation is a later stretch goal.

## Verified final checkpoint

A normal-speed default-setting campaign was beaten from fresh party selection in **12:40.76** at 2026-10-10 16:50:52 America/Los_Angeles. Morgan/Miriel/Sumia/Virion all survived. Mission clocks: road2:47, village2:33, castle approximately3:05, final2:59; commander fights approximately35–37seconds. These are measured gameplay observations, not accelerated test timers. The implementation/verification continued beyond the original one-hour checkpoint to resolve real playtest blockers.

Final verification:36 unit tests, strict TypeScript/production build, and all50 browser checks pass. The normal melee party cleared the first two missions but found castle substantially harder; aim, healing affordance and party balance remain #48 follow-ups. Repeated natural failures drove the friendly-collision, stationary ranged reach, post leash, support AI and commander-pressure changes.

Actual final caps are road14/village14/castle22/final24; later missions use three batches per site and900/1400HP commanders. Old wave survivors withdraw on commander arrival. An attempted14/18 cap edit did not apply and is not part of final gameplay.

Remaining: exact audio matching (#41), UX refinements (#40/#48), legacy27 unknown source records, procedural maps and multiplayer backend. Recorded cue semantics are provisional. Nothing pushed or deployed.

Standard party follow-up: an ordinary25% damage-setting retry cleared castle in4:32 with all four alive; commander encounter took2:04. This is accessibility evidence, not a default-setting complete campaign proof. The full default win remains the magic-party run documented above.

## Follow-up UI and save checkpoint

- [x] #49: Versioned browser autosave, native Resume and F9/backquote developer map menu. Saves party, mission, levels/XP/stats, gold and equipment/forges at preparations/deployment/victory and shop transactions. Reloaded battles restart deployment; live enemy state and unbanked battle rewards are intentionally excluded. Test map jumps preserve the normal checkpoint. Invalid/blocked storage degrades safely.
- [x] Native selection Resume warns that a new campaign replaces the existing checkpoint. Saves belong to the current browser/site origin; localhost and published Pages are separate.
- [x] Integrated verification:39unit tests,10focusedbrowser tests, strict TypeScript and productionbuild passed. Native Resume pointer click, developer save preservation, active combat pause, preexisting pause and disabled browser storage covered.

Source remains local with no push/deploy. README records save behavior and developer shortcuts.

## 2026-10-11 local UX iteration — #50 complete

- Level-one road now1280×544 with an eastbound corridor and forest banks; zero NPC soldiers, companions only. Later maps keep four soldiers.
- Following uses larger irregular stable member slots, eased/staggered leader observations,88/44px arrival hysteresis and slower arrival; repeated direction reversals no longer rearrange the party.
- Native persistent player card204×76; I opens detailed stats/equipment. Short mission notices occupy the top, and planning-only damage controls follow actual party height.
- Campaign preparation checkpoints survive refresh and developer level jumps preserve the saved normal run. Corrupt/unavailable browser storage degrades safely.
- Ordinary controls completed the narrowed road in2:39 with all four alive; independent reversal/spacing review produced no errors. Evidence in docs/playtests.
- Verification40 unit/build checks; integrated53/55 initially and16 relevant reruns all pass after two fixture corrections. Local only, no push/deploy.

## Native road placement repair — #51 complete

The planning roster moved below the road so it no longer blocks legal mouse cells. Cursor snapping and bounds now use true64px grid centers. Native clicks placed Chrom/Frederick/Lissa, Space auto-selected and placed Miriel, then R launched all four;0NPC and no errors. Camera inverse mapping was verified at0.7zoom.41unit/build checks and22 relevant browser tests pass. Durable screenshots/report are in docs/playtests. Nothing pushed.

## Road tension and portrait dialogue — #52 complete

First-road enemy damage scale increased0.65→1.10; default soldier hit4→6HP, with player stats and later levels unchanged. Ordinary controls reached village briefing in2:18, zeroNPC; Miriel fell and Sumia dropped to69HP, making the opening mission more consequential while remaining beatable. Native portrait dialogue has mission-aware original lines, pointer/keyboard advancement and a separate recorded WARC_14_0 candidate cue that respects effects volume/mute. Exact audible reference match remains unverified.42unit/build checks,8road/campaign,4audio and1dialogue browser checks pass. Durable evidence docs/playtests/road-danger-review.md. No push/deploy.

## Village support controls — #53 complete

Compact1024×704 village,4 fixedNPC posts, legal concealed entries; R gatherscompanions10s/20s cooldown thenreturnsplacedposts. Inactivecarried-staff companions urgentheal<50% until75% thenrestoreweapon; controlledweaponneverautochanges. Villageenemyoutgoingdamage0.85→1.25,cap14unchanged. Ordinary stronger-village win2:32: Virion53/Sumia81HP nearend,1NPCfallen,camp897/900; supportpartyremainscomfortable,notseverepressureproof.43unit/build+8focusedbrowser+2affectedrerunsPASS. Fullcampaignnotrerunafterchange; durableevidence docs/playtests/village-rally-healing-review.md. Localonly.

## Local1.0.0 release QA

Visible/injected/package version1.0.0 agree.43unit tests, strictTypeScript/productionbuild and61browserchecks (60fullsuite+1newversiontest) pass. No blocking regression observed. GitHub remains the bugsource; known balance/audio/provenance followups remain. Fullnormalcampaignnotrerunafterlatestvillage/rally change. See docs/release-qa-1.0.0.md. Nothing pushed/tagged/deployed.

## Local1.0.1 bug fixes — #55–#59 complete

Column-local selection wrap, shared17-character portrait framing, explicitaction→walk/idle/control-transfer facing, actualweaponrange-driven companionAI, and nativepausecontrols are readyforuserreview.43unit/typecheck/buildPASS; full64/65initialpassed, staleResumepointerfixturecorrectedthen5affectedchecksPASS. Local5173restartedv1.0.1, nativepausecaptureclear/noerrors. See docs/release-qa-1.0.1.md and durableplaytests. No commit/pushforthispatch.

## Recorded death voices — #60 complete locally

All 17 current heroes use their existing sourced DEAD_1 clips, now emitted once for controlled and companion deaths. Simultaneous deaths queue; automatic control switching preserves the line. Voice settings/mute and retry cleanup are verified. Shared rally work preserved; resulting local version 1.0.4. Final merged-source checks: 46 unit tests, TypeScript/build and 12 relevant browser checks pass; fresh local preview v1.0.4 loads without errors. See docs/character-death-audio.md for coverage and Anna/Morgan/Robin availability. No push.


## Gold pickup UX — #61 complete locally

Local1.0.5 uses source gold bullion in drops, battle treasury and shop currency. Pickups show a gold +number near the controlled hero; pickups within500ms aggregate and play one confirmation per cluster. Uncollected gold expires after20 active battle seconds, with4 seconds of fading; pause consumes no lifetime.46unit/build and4focused browser checks pass. See docs/gold-ux-review.md. No push.
- [x] Local1.0.6 / #62: rebuild Black Keep from sourced Stronghold tiles at2×, three connected chunks and matching collision; remove baked decorative chests/invisible barricades; update map-relative concealed spawn fallback;47unit/build and targeted finalmap/campaign browser checks pass. See `docs/black-keep-rebuild.md`.

## Local1.0.7 deployment UX — #63/#64/#65

Padded measured deployment panel, Black Keep right gutter, allfour projected courtyards clear; nativeAuto-place/Enter preserves manual positions and uses legal32px lattice with64px separation; doesnotbeginbattle. NativeHUD/camp text3× rasterization, larger compact camp labels. Twoall-stage Retina browser checks and BlackKeep path check pass; rootcoordinatesfinalbuild/swordintegration. See docs/deployment-layout-review.md. No push.

## Release1.0.8 — #67

Deployment cursor and planning grid explicitly hidden on launch, with native Auto-place/R coverage on all four maps at809px/1440px. Release includes reviewed local1.0.1–1.0.7 changes. Full checks recorded in docs/release-qa-1.0.8.md.
