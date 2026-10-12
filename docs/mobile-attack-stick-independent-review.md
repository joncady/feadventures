# Independent mobile attack-stick / CI review — local 1.1.1

Reviewed 2026-10-11. No commit or push performed by the reviewer.

## Mobile input

Real Chromium CDP multi-touch input tested at 390×844 portrait and 844×390 landscape, including live orientation changes. Movement is owned by the left finger; six cardinal/diagonal aim vectors around the right stick are independently read. Holding aim repeats attacks only after the existing weapon cooldown; releasing either finger preserves the other action. Touch cancellation clears both. The center of the attack stick intentionally fires in the retained direction; dragging chooses a new 360° aim.

The attack control measured 47.52 CSS pixels across; all seven utility targets measured 44 CSS pixels. Its complete circle clears the minimap and the first utility row at both reviewed sizes. The lower character card remains hidden in touch mode. Existing fullscreen regression separately checks 844×390, 932×430, 667×375, 390×844, and 844×340 and taps the bottom party-picker action.

Evidence: `playtests/attack-stick-1.1.1/review.json`, `390.png`, and `844.png`. Captures demonstrate current composition, not a claim that the compact portrait combat view is as readable as landscape. No page errors were observed in the independent two-orientation capture pass. These are browser-emulated touch checks; a physical phone trial remains useful for thumb comfort and OS gesture interference.

Permanent regression: `tests/e2e/touch-attack-stick.spec.ts`. Also reviewed `touch-controls.spec.ts` to preserve direct battlefield tap and left joystick ownership, and `phone-fullscreen.spec.ts` for the existing Safari-style viewport fullscreen fallback. Initial three-test set passed 3/3 in 35.2 seconds.

## CI safety

`pages.yml` now runs build/typecheck/unit validation independently of three browser-test shards. Each shard has a distinct GitHub-hosted runner and one Playwright worker, preserving reliable game-clock rendering without competing headless WebGL contexts on one machine. Every test remains selected by Playwright's normal sharding; no browser test filter or reduced renderer bypass was added. Matrix fail-fast is disabled so failed runs leave evidence from all shards.

Pages deployment requires both build and the complete browser-test matrix. Pull requests cannot deploy. Failure traces/screenshots/HTML reports have distinct shard artifact names with seven-day retention. Source checkout, npm lockfile installation, and Chromium installation occur separately in each job. The existing workflow concurrency policy cancels superseded runs.

No measured remote speedup is claimed: local software-rendering durations and GitHub-hosted durations differ. First pushed run should measure shard balance, install overhead, and the slowest individual tests from HTML/list reports before further adjustment.

Follow-up actual-touch staff/guard/pause regression passed 1/1 in 6.9 seconds after initializing the application's real battle state. Staff aiming healed the injured nearby companion from 20 to 35 HP while the caster stayed at 50; the separate self-heal button then healed the caster from 50 to 65 while companion HP remained unchanged. Guard release/cancellation cleared guard. Pressing Pause with both sticks held paused Arena and cleared movement/aim. An initial reviewer fixture bypassed the main application `playing` state and therefore could not activate Pause; this was corrected in the fixture, with no production change required. Combined final affected coverage is four passing tests, executed in two serial runs.

Final source review confirmed leaving the attack stick stores its last nonzero aim, while normal movement subsequently resumes movement-facing behavior. Prior mouse/battlefield tap targeting is cleared on stick activation so stale screen coordinates cannot override stick aim. All scene shutdown, pause, touch cancellation, and browser blur clear held aim; existing guard and healing logic remains authoritative.
