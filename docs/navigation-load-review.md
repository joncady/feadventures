# Authored-map navigation load review

Local validation on 2026-10-11, following release 1.0.8. This slice adds regression coverage and measurements; production movement, navigation and enemy caps are unchanged.

Run `npx playwright test tests/e2e/navigation-load.spec.ts --workers=1` from Main Game. Each map runs eight seconds of real Chromium rendering and Arcade Physics, with its configured cap of live soldiers seeded around the authored camps. Damage is disabled and HP increased to keep the sample population fixed. Allies and scheduled releases are removed to isolate hostile navigation. Thus this is a reproducible capped pursuit sample, not a full campaign benchmark or representative mixed-weapon battle. JSON measurements are attached to each Playwright result; screenshots are in `docs/playtests/navigation-cap-stage-*.png`.

Instrumentation wraps `NavigationField.setTarget` only in the test browser, measuring calls, actual target-cell rebuilds and elapsed time inside that method. It also samples enemy-update durations and animation frame intervals. Field construction, rendering, physics and other path queries are outside the setTarget timing. No instrumentation ships in the game.

Representative second sequential run on the current laptop:

| Stage | Hostile cap | Rebuilds | setTarget total / ~8 seconds | Frame median / p95 (ms) | Enemy update p95 (ms) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Bandit Road | 14 | 450 | 39.0 ms | 16.9 / 38.1 | 0.1 |
| Village Watch | 14 | 447 | 44.1 ms | 16.7 / 19.3 | 0.1 |
| Castle Siege | 22 | 414 | 62.8 ms | 23.5 / 33.9 | 1.0 |
| Black Keep | 24 | 736 | 78.1 ms | 16.7 / 31.8 | 0.1 |

All capped units moved more than 24 pixels, with no body embedded in terrain at the end. The first run had a road frame p95 of 85 ms while its setTarget cost remained only 31 ms total; this variability is why these timings are observations, not an FPS guarantee. No navigation optimization is justified by this sample. Keep the existing caps. Mixed-weapon swarms, sustained campaign load, WebKit/Firefox, and slower hardware remain follow-ups under issue #7.

The additional Keep crowd fixture places 24 ground soldiers in the throne room and a stationary living target in the entry room. Every soldier must cross both physical doorways within 20 seconds, remain clear of terrain, and be destroyed with projectiles on return to the main menu. The unit navigation regression independently walks legal route segments from every authored camp to both the deployment center and objective, rather than checking connectivity alone.

Verification: 48 unit checks and TypeScript/production build pass. All five browser checks pass: capped pursuit on all four stages and Keep doorway/cleanup. The cleanup fixture was corrected to inspect the destroyed group safely after scene shutdown. No production code or version bump is required for this test-only slice.
