# Independent batch review — local 1.0.16

Reviewed October 11, 2026. No production source changes, commit, or push by reviewer.

## Verdict

Ready for local user review on desktop and the tested touch layouts. The portrait joystick blocker was fixed and independently rechecked. No release or push approval is implied.

## Completed checks

- `npm run check`: 62 unit tests, TypeScript and production build passed. Bundle warning remains informational; no new build failure.
- Serial CI-mode affected Playwright run: 13/13 passed across shop party return, touch controls, guard/effectiveness, audio settings, phased party selection, shop portraits, pause controls, weapon switching and rally/healing.
- Shop party editing regression returns to the same mission preparations, retains treasury and XP, preserves forged equipment while Chrom is benched, and restores it after reload and reselecting Chrom.
- Native Ctrl guard regression rejects attacking while held, slows movement, mitigates frontal physical hits, leaves rear and magic damage unchanged, and resets at a new battle. Wind projectile snapshots its item identity through equipment switching and shares effectiveness rules with allied damage.
- Four-width shop captures at 600/809/1039/1440, DPR2, with four portraits: no browser errors, no portrait/action overlap. [Matrix](playtests/batch-1.0.16/matrix.json). Secondary shop copy remains small at 600px; this batch is not a complete shop redesign.
- Phone Chromium emulation 390×844 and 844×390, DPR2: joystick moves without attacking; simultaneous second touch attacks while movement remains active; touch cancellation clears movement. No browser errors.

## Mobile review findings and corrections

- Landscape clipping is corrected: final 844×390 canvas bounds x101.8/y0.6/w640.3/h388.8 fit the window. Native action targets measure at least44 CSSpx, the portrait card is hidden while touch controls show, and touch pause no longer covers the minimap label.
- Initial second-finger-release concern was a **CDP harness error**: ending the aim finger requires the aim identifier in `touchPoints`. Actual DOM instrumentation confirms changed=[2], remaining=[1], with joystick motion maintained on landscape. Cancellation clears movement. This is trusted Chromium emulation evidence, not a physical phone claim.
- Portrait390 joystick enlargement initially missed and fell through to attack. Owner replaced resized circle geometry with immutable geometry and uniform scaling. **Final independent trusted Chromium touch run passes** at390×844 and844×390: first joystick gesture moves (x≈0.6) without attack, simultaneous aim attacks, ending aim keeps joystick active, cancellation stops motion, and all action targets measure44 CSSpx. Final captures replace the initial failing phone images. [Final phone trace](playtests/batch-1.0.16/mobile-final.json).
- Owner’s final390-width regression passed6.3s, covering startup, live809→390 resize, joystick no-attack, finger ownership, minimum44 CSSpx and guard UI no-fallthrough. Reviewer independently verified startup and multitouch at both phone layouts after that regression.

## Scope limits

These are targeted fixtures and native input checks, not a naturally played full campaign, measured physical mobile performance, or certification that every project item is complete. [Separate WebKit/subpath smoke](webkit-subpath-review-1.0.16.md) verifies real WebGL native menu → dialogue → shop → deployment → battle movement → pause/resume → save/reload and production subpath asset loading. Firefox is not installed. Independent audio preference persistence and four-map HUD obstruction checks remain outside this bounded batch; root is tracking these gaps rather than claiming full-board completion.
