# Release QA — v1.1.1

Published commit: `05adbd3` (approved release `d1d4419` plus two test-fixture corrections). [Successful workflow](https://github.com/joncady/feadventures/actions/runs/38189257033).

All **67 unit tests** and **106 browser tests** passed, with typecheck and production build. Browser partitions passed 38 / 34 / 34 tests. Pages deployment succeeded. Each shard uploaded its HTML report and failure-evidence directory.

## Measured CI duration

| Browser shard | Browser step | Entire job |
| --- | --- | --- |
| 1 | 8:33 | 9:17 |
| 2 | 10:56 | 11:34 |
| 3 | 9:01 | 9:36 |

The successful browser critical path is **10:56**, versus **17:31** for v1.1.0's single-runner suite: approximately **38% shorter**, while covering two additional tests. Successful push-to-completion time was **11:51** (including setup and Pages deployment). Runner variation is material; this is one successful measurement, not a guaranteed duration. Two earlier attempts were safely blocked by fixture failures, so the overall release session took longer than one workflow.

## Fixture corrections

The first attempt's pointer-ownership fixture let actual bandits kill Chrom during its lengthy gesture audit, correctly resetting held touch input. It now isolates enemies while retaining real CDP input, render frames, attack cooldowns, twelve aim vectors across two orientations, independent pointer release, and cancellation checks.

The second attempt exposed a one-minute total budget inadequate for those real gestures on software WebGL; this single test now has a bounded two-minute CI budget. It also exposed a legacy restart assertion against the fleeting first-enemy count and a Wind fixture reading a pre-existing hostile projectile. Restart now verifies new projectile-group identity, all prior enemies destroyed, positive new hostile count and fresh HP/wave/kills. Wind clears preceding projectiles and asserts the newly created Wind projectile's retained weapon identity and exact effectiveness damage. No production game behavior changed during these corrections. Five affected tests passed locally in CI mode before the final full run.

## Published phone smoke

The actual Pages site returned **v1.1.1**. Browser-emulated phone landscape 844×390 entered the Safari-style viewport fullscreen fallback, selected a companion through native Phaser controls, tapped Auto-place and Begin battle, and held both movement and attack sticks with real Chromium CDP multi-touch. The native screenshot shows both thumb knobs displaced and the normal attack recovery bar. Resizing to 390×844 retained the full game canvas. No page errors occurred. This is emulated browser evidence; physical-device comfort remains the user's trial.

Evidence: `playtests/release-1.1.1/live-landscape.png`, `live-portrait.png`. Local server remains available. This post-release evidence document is local and is not pushed separately, avoiding an unnecessary additional deployment run.
