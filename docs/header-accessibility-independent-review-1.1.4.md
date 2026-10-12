# Independent mobile header and accessibility review — 1.1.4

Release recommendation: pass after the fixes below. No source, version, commit, or push changes were made by the reviewer.

## Evidence

- Chromium and WebKit at 390 × 844 and 844 × 390: page title, tagline, and version remain visible before fullscreen. Portrait guidance occupies only the game shell. Landscape canvas fits below the measured header. Explicit viewport fullscreen hides page context; exit restores it. Screens: `playtests/header-accessibility-1.1.4/{chromium,webkit}-{portrait,landscape,fullscreen}.png`.
- Existing mobile rotation tests passed: held movement/attack clear on rotation, running battle resumes, manual pause survives rotation, orientation lock is requested only during fullscreen, and rejected locks retain guidance. Existing fullscreen bounds and bottom-action checks passed.
- Twelve gameplay bindings remapped and persisted; reserved I rejected; Escape canceled capture; real remapped movement and global pause worked; Reset defaults restored all bindings. Remapped attack/weapon/rally and capture suppression passed the durable control-preferences regression. Menus/planning intentionally retain fixed navigation, explained by the settings subtitle.
- Reduced motion leaves a real +HP popup stationary while preserving its readable fade. Source review confirms attack telegraphs, healing rings, sprite animations, and gameplay timing are unchanged; decorative dialogue caret pulsing is removed when enabled.
- Critical Chrom atlas and parchment frame failures were held until an actual native Retry click. Both recovered to enabled character selection with no page errors. Missing parchment uses a readable asset-independent rectangle/text error panel. Screens: `retry-chrom-animated.png.png`, `retry-ui-parchment.png.png`.
- Normal story → Arena → Results routing was exercised. While the shared capture flag is active, dialogue/result keys cannot advance or change the saved pending reward. These phases currently stop Interface, so this is a defensive guard test rather than a claim that the controls modal is reachable there.
- Final unit/typecheck/build check: 71 unit tests passed; production build passed.
- Fresh stable independent browser review: 5/5 tests passed in 23.4 seconds. Existing mobile suite: 4/4 passed. Final durable control-preferences review: 2/2 passed in 8.6 seconds. Independent regressions are retained in `tests/e2e/header-accessibility.spec.ts`.

## Issues caught and resolved

1. Interface restart retained destroyed controls/pause label objects, causing a null canvas error during normal story-to-battle creation. Owner now resets the new arrays and capture lifecycle on scene creation/shutdown. Normal routing passed after the fix.
2. Campaign and Results capture-phase key handlers could consume keys before the controls handler. Owner added the shared modal guard; no-advance assertions passed.
3. Missing parchment initially produced an unreadable placeholder-backed Retry button. Owner added the asset-independent native fallback; screenshot and actual recovery passed.
4. An instant synthetic rally key press fell between Phaser frames. The durable fixture now holds the key until the real action is observed; production input was unchanged.

The original one-time failed pickup-image test was replaced with persistent critical-resource failures; the latter are the release evidence. Browser emulation verifies layout/input semantics, not physical iPhone orientation-lock support or real-device GPU performance.
