# Remaining board reconciliation

Read-only source and GitHub issue review, October 11, 2026, after the approved local 1.0.15 UI trial. No gameplay changes or issue closures were made by this review. Existing test files and review artifacts are evidence of scope; this review did not rerun those suites.

| Issue | Current evidence | Genuine remaining work |
| --- | --- | --- |
| #5 Local co-op/controller | Single controlled hero and Q/E party switching. | Two simultaneous players, gamepad connection handling and real adapter validation. Defer with multiplayer rather than forcing it into this cleanup. |
| #7 Browser/performance | Chromium gameplay suite; capped navigation review on four maps and physical Keep doorway traversal. `playwright.config.ts` declares no Firefox/WebKit projects. | Alternate-engine coverage, hosted subpath regression, mixed-weapon sustained profiling. Existing headless navigation sample is not a real-device FPS guarantee. |
| #12 Weapon rules | `systems/combat.ts` tests reciprocal triangle and bow/flying ×2 final damage. Both `damageEnemy` and `takeDamage` call the helper; allies use the former. Defense/resistance chosen by tome family. | Shared helper already exists, so old ally-resolver wording is stale. Missing explicit damage kind, per-weapon effectiveness tags, wind effectiveness and rank model; document deterministic departures from Awakening. Avoid changing current balance merely to satisfy stale wording. |
| #16 Guard | No guard input/state/meter or guarded damage branch found. | Optional facing-arc physical block with resource, attack exclusion, rear/magic policy and restart/pause coverage. This is a new mechanic, not a low-hanging bug. |
| #35 Named commanders | `ArenaScene` commander is a heavy enemy, scale 1.3, tint, higher stats. | Verified named-villain sprite import/direction audit and distinct readable telegraph. Do not label the generic boss a named character. |
| #40 Action/visual UX | Industry audit, phased party selection and shop portrait strip documented. | Broader shop composition, battle HUD hierarchy and remaining per-action feedback acceptance. A delivered audit can be recorded separately from implementing every recommendation. |
| #41 Recorded UX audio | `audio-feedback-reference.md` explicitly identifies provisional cues. Cursor/confirm/reject/heal reuse user-chosen movement recording. | Exact reference-video matches require audible human audition; numerical waveform features do not identify a semantic cue. `BootScene.ts` still loads both menu and battle music from `purpose.mp3`, so distinct music remains a real improvement. |
| #43 Procedural maps | `map-chunks.ts` provides source crops, terrain composition, socket placement and limited bounds validation; four authored maps exist. | Seeded procedural generation and socket/reachability/population validation are explicitly stretch scope. Keep authored golden path stable. |
| #48 Campaign balance/teaching | Staff equipment icons, self-heal, heal rings, east-exit objective and party support implemented. Existing standard-party playtest reported controls/balance differences. | Fresh normal-speed standard-party full campaign evidence with settings, timings, losses/retries; boss aiming readability and pressure tuning judged from actual play. Fixture victory tests do not replace that. |

## Suggested completion order

1. Finish preparation-flow bugs #69–73 and copy defects #80–82, with native keyboard/pointer and resize review. Local party/shop reviews already cover much of #70–73; close only after current acceptance is verified. Shop-return purchase/progression preservation (#69) requires explicit review.
2. Touch controls and settings (#8): implement joystick/tap aim without obscuring combat, verify pointer ownership and pause/restart. Audio preferences persistence, remapping and reduced motion were not found in current source; an asset-error reload notice already exists.
3. Browser/subpath regression (#7), then a recorded standard-party normal campaign trial (#48).
4. Typed combat/effectiveness completion (#12) and verified named boss (#35), each separately reviewed for balance and sprite directions.
5. Guard (#16) only as a deliberately reviewed new combat mechanic. Audio exact-match work (#41) should remain candidly open until listening evidence exists.

Defer #5/#34 multiplayer and #43 procedural stretch. Broad audit recommendations should become bounded reviewable slices, rather than treating every cosmetic recommendation as a release blocker.
