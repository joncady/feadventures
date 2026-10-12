# Release QA — v1.1.2

Published October 12, 2026. Production release commit `65561ab`, final fixture stabilization commit `ef5aa26c00090404c5976381ec3b8f170da8462b`.

[Successful workflow](https://github.com/joncady/feadventures/actions/runs/38282154186): 67 unit tests, typecheck/build, and all 107 browser tests passed (38 / 35 / 34). Pages deployment succeeded. Successful workflow duration: 12:06; longest browser step about 11.2 minutes. Earlier blocked runs exposed fixture issues and extended the overall release session.

Local final checks: 67 unit tests/build plus four affected fullscreen/dual-stick/staff/rally cases passed. Additional road, allied cleanup, healer feedback and rally voice cases passed after fixture corrections.

## Fixture corrections

- Road fixture expected the superseded Village damage scale 1.25; approved Village scale is now 1.55. Road hit and player damage assertions remain unchanged.
- Allied restart validates a new projectile group and inactive old projectiles, allowing legitimate fresh enemy shots.
- Native healer return-switch input is held 200ms so CPU-rendered frames observe the key. Staff, icon and self-healing assertions are unchanged.
- Exact 20-second rally duration permits floating-point rounding at six decimal places, after a result of 19999.999999999996ms. All voice routing/cooldown assertions remain.

No production game changes were made during those corrections.

## Published phone layout

Actual public Pages site returned v1.1.2. Chromium phone emulation at 844×390, DPR2, entered viewport fullscreen fallback through the top-right control. Native Auto-place and Begin battle inputs opened the tactical Castle stage. The rendered canvas fit the viewport (642.31×389.98 CSS pixels); screenshot confirms aligned two rows of three commands, enlarged right attack stick, top-right fullscreen and bottom cooldown bar. No page exceptions or HTTP resource failures. This is browser-emulated layout evidence, not physical thumb ergonomics confirmation.

Evidence: `playtests/release-1.1.2/live-landscape.png`. This post-release report/proof remains local to avoid an unnecessary deployment solely for evidence.
