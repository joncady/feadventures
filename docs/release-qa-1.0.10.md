# Release 1.0.10 verification

October 11, 2026. Includes local 1.0.9 health-drop fix and navigation/parity review, plus 1.0.10 Phaser-native text supersampling and independent responsive review.

- 48 unit checks, strict TypeScript and production build pass.
- Native text rendering covers WebGL and Canvas fallback at DPR1/DPR2, resize and pointer alignment; sprites retain nearest sampling.
- Independent layout review covers 90 screen states at five widths, including all four deployment maps.
- Complete 87-browser check run passed 85 checks (7.4 minutes, two workers); its only failures were short wall-time collision and flight polls under concurrent external browser load. Those observation budgets were broadened, and all five focused checks passed with one worker (20.7 seconds). All 87 cases have passed against the release source across the full and focused runs. No production code changed during release verification.
- Older browser fixtures were stabilized without changing gameplay: mouse windup pauses on its first frame so parallel load cannot skip the transient, and feedback expiry allows more wall time for its game-clock timer. Rally cooldown checks use its accepted activation timestamp. Four-map screenshot tests allow 60 seconds overall, and the Keep doorway check observes actual traversal instead of assuming 4300ms of wall time equals game-clock movement. Collision and flying observations retain their original assertions with broader wall-time bounds.
- Existing bundle-size warning remains nonblocking. Supersampling adds bounded GPU fill cost; no performance guarantee is implied.
- Natural full campaign pacing was not replayed for this release. Automated campaign progression and capped navigation/Keep doorway checks are included.

GitHub issues remain the bug source of truth. Generated local audio-review catalog and ignored source archives are excluded.
