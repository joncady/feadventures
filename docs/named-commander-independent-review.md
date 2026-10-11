# Independent commander review — local 1.1.0

October 11, 2026. Independent review of the four-stage commander slice. Local only; no commit or push performed by this reviewer.

## Source and identity

Reviewed `commander-assets-lore-review.md`, the six exact source sheets, `import-commanders.py`, normalized proof, Boot registrations, commander profiles, objective rules, and native UI. Gangrel's red Trickster frame block, Walhart's mounted armored Conqueror block at source y1024, and Validar's named sorcerer are distinct from generic enemies. Neutral portraits correspond to each named character. Ten atlas rows preserve source orientation; eight walk facings plus idle/action remain registered independently rather than globally flipping walk sprites. Validar's original action row contains shadows only, so the importer intentionally reuses visible idle frames while the cast telegraph communicates his action.

## Validation and fix loop

- Independent `npm run check`: 67 tests passed, TypeScript and production build passed.
- Fresh frozen mission-results browser suite: 6/6 passed. Covers Village waiting for Gangrel, cap-blocked entry retaining existing attackers, paused objective clock, pending result reload/no duplicate rewards, and held Space not dismissing victory.
- Initial browser run was invalidated by concurrent Vite HMR: fixed `/src/main.ts` imports could instantiate a second game when the native script had a timestamp. A fresh frozen run passed; reviewer scripts now import the exact native module script URL. This is not evidence of a production loading failure.
- Found boss panel `recover` versus `recovery` label mismatch and stale transient feedback obscuring its name. Builder corrected both; final visual rerun follows below.

Boss overview captures use explicit state fixtures to make all three panels repeatable. They do **not** prove normal combat balance. Five viewport configurations: 600×1066, 809×1066, 1440×1066, phone 390×844 portrait, and 844×390 landscape, all DPR2. Evidence is in `playtests/commanders-1.1.0/window-matrix.json` and corresponding `boss-*.png` captures.

## Normal input trials

Each mission starts from the existing developer mission jump with a fresh level-one Chrom, Robin (Female), Virion, and Lissa party; auto-place, keyboard movement, mouse aim/attacks, Q/E switching, and rally. No enemy health, damage, kills, phase, game clock, or player health was injected during these trials. Read-only state observations chose inputs; this is an automated play trial, not a human subjective playtest or a carried-progression full campaign.

| Mission | Outcome | Battle time | Notes |
|---|---|---|---|
| Village / Gangrel | First attempt clear | 2:08 | 33 kills; camp 868/900 at 2:00; Gangrel's 700 HP lasted about 20 seconds. The first boss is forgiving with an active healer. |
| Castle / Walhart | First attempt clear | 3:51 | 40 kills; Walhart's 900 HP fight lasted about 83 seconds. Low HP prompted switching; at 3:50 camp 539/800, party HP 59/75/91/20. No companion fell. |
| Keep / Validar | First attempt clear | 3:06 | 37 kills; the 1400 HP boss lasted about 41 seconds. At 3:00 party HP was 85/101/101/56; all survived. Existing minions surrendered without being counted as kills. |

The three commanders adapt existing combat primitives: Gangrel alternates two sword attacks with a locked-aim Levin bolt; Walhart exposes a longer axe commitment/recovery; Validar keeps a visible 1.1-second aimed cast windup and accelerates cooldown below half HP without refilling health. Reinforcements are bounded by hostile caps. Commander defeat legitimately causes surviving minions to retreat/surrender; result wording does not pretend they were killed.

## Limits and next human review

Current checkpoint saves preserve mission/party progression and pending results, not a mid-fight boss snapshot. Native portrait phone layout still scales text small and the pre-existing large touch pads obscure much of the lower battlefield; that is a separate mobile HUD task. The new top-center boss panel itself fits the checked windows without overlapping permanent party/minimap controls. User trial should compare each attack windup and punish window, whether Gangrel needs more pressure, and whether dark bolts remain readable against the Keep tiles. No claim of full-route balance or real phone performance.

## Final affected recheck

Final frozen source: 67 unit tests, TypeScript, production build and all 13 targeted combat/results/save browser tests passed. The final desktop/phone boss captures were rerun after both transient action feedback and mission notices were moved below the commander panel.

The user-reported phone fullscreen crop was independently reproduced through its width-only container cause and reviewed after the viewport fix. A WebKit ResizeObserver feedback-loop warning found during resize was fixed with a coalesced animation-frame refresh and dimension guard. Final evidence: `playtests/commanders-1.1.0/phone-final-matrix.json`, 32 actual phase views on fresh Chromium/WebKit contexts at 390×844 and 844×390. Party selection, story dialogue, shop, deployment, combat, results, and continued preparation all fit the viewport. Actual touchscreen taps reached Begin Story, Deploy, Auto-place, Begin battle, and Continue; fullscreen exit cleared the mode; no page errors remained. WebKit used the iPhone-style viewport fallback. Real iPhone Safari and real browser chrome/safe-area behavior still need the user's device trial.

This restores visibility; it does not make the fixed logical interface a complete mobile redesign. Primary targets still shrink below 44 CSS pixels, especially in portrait. The phone selection tray and Begin Story are visible, but touch target enlargement and portrait readability remain follow-up work. The older provisional full-screen matrix was discarded because a reviewer menu-reset selector mislabeled later repeated results captures; the final fresh-context evidence checks actual active scenes.
