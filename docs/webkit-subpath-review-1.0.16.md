# WebKit and production subpath smoke — local 1.0.16

October 11, 2026. Installed Playwright WebKit 2370, 1039×1066 CSS viewport, DPR2, real Phaser WebGL renderer (type 2), without renderer bypass or synthetic victory. Browser slot was used after the independent Chromium reviewer finished its captures. No commit/push.

Native keyboard selected Chrom and Lucina through the phased party flow and Begin Story. Three native Enter presses advanced dialogue to the shop. Native pointer selected Deploy, Auto-place and Begin battle. Holding D moved Chrom from x96 to x204.12; native P paused and resumed. Reload preserved the two-member mission-zero checkpoint, and native saved-story selection reopened its dialogue. This is a short route smoke before the first enemy release, not sustained combat or a complete campaign test.

The existing production build was served with `/feadventures/` mapped to its dist root. WebKit loaded assets and started the story through the native phase controls, with a saved campaign. No HTTP error responses or page errors occurred in either run. This verifies relative production asset loading and initial story flow at the GitHub Pages path; it does not claim the entire combat suite runs against production.

Evidence: [dev state/save trace](playtests/webkit-1.0.16/dev.json), [production subpath trace](playtests/webkit-1.0.16/subpath.json), [battle capture](playtests/webkit-1.0.16/battle.png), [production story capture](playtests/webkit-1.0.16/subpath-story.png), [smoke harness](playtests/webkit-1.0.16/smoke.mjs). Harness's Playwright import uses this workstation's absolute module path; adjust it when reproducing elsewhere.

Initial run's only failure was a stale harness expectation for the label `Resume story`; current saved-story UI includes a stage label. The final run clicks the actual native resume label bounds and passes. No production fix was needed.

Chromium is installed; Firefox executable is absent. No browser download was attempted. Issue #7 remains open for Firefox, alternate-engine automated CI projects, and sustained mixed-weapon/device performance profiling.
