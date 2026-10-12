# Independent feedback review — local 1.1.2

October 12, 2026. Current source review plus actual rendered Chromium phone captures (390×844, 844×390, 667×375; DPR2). Source fixtures expose normal Arena simulation and native keyboard/mouse/CDP touch inputs. No production edits, commit or push by reviewer.

## Phone and rally checks

Four focused browser tests passed: phone fullscreen fallback through orientation/browser-chrome changes; six cardinal/diagonal dual-stick directions and independent release/cancel; staff healing/self-healing/guard/pause separation; rally lifecycle including living nearby target retention, 300px leash escape, idle walking home, and interruption of return by a fresh nearby enemy. Fullscreen uses a native top-right target measuring 44 CSS pixels in all captured widths, without opening Settings. Android-style actual element fullscreen also entered successfully; Chromium will not resize a native fullscreen window without first exiting, so orientation matrix uses the iPhone-style viewport fallback.

Attack outer diameter is about 71 CSS pixels versus the prior 47.5 (1.5×). A bright direction stroke reaches just past the rim, outside the center thumb position. Real CDP gestures verified all angles. This is simulated input and rendered layout review, not a physical thumb usability study; a phone trial should confirm comfort and reach.

A real portrait-layout defect was found: the bottom utility at logical x547–653 / y433–539 intersected the cooldown bar x330–610 / y525–535. Returned to the mobile builder for a narrower bottom bar, preserving desktop y525. Final recheck below records closure.

Rally engagement handoff stays bounded to the gathered 300px pocket while enemies remain. It releases an empty pocket and walks toward the original post at 45–75% movement speed. A nearby new threat interrupts that return. Follow missions continue using their existing follow behavior rather than acquiring permanent posts.

## Normal-time Village pressure trial

Same four heroes and automatic deployment: Chrom, Miriel, Lissa, Frederick. Driver used actual native movement, mouse aim and Space with standard cooldowns, fought nearest enemies near the village, and left companion attacks/urgent healing to ordinary AI. No HP, kills, wave, clock, enemy or invulnerability mutations during battle. Normal default damage setting.

The upgraded trial was an explicitly initialized before-battle fixture: level 3 from `gainExperience` with fixed growth sample, forge +1 on carried items. It is a plausible Road carryover, but was not purchased in a shop or earned on a preceding full Road playthrough. The fresh trial started with default level 1 equipment. These are independent random battles, not a controlled causal experiment.

| Fixture | Victory time | Defeated | Final Chrom HP | Village HP | Companion outcome |
| --- | --- | --- | --- | --- | --- |
| Fresh | 2:17 | 34 | 59 | 880/900 | All survived |
| Level 3 / forge +1 | 2:11 | 33 | 58 | 795/900 | Miriel fell; Lissa/Frederick survived |

Sampled minima: fresh Chrom59, Miriel68, Lissa62, Frederick53; upgraded Chrom58, Miriel0, Lissa96, Frederick66. No page errors. Both end captures show Battle won. Stronger regular-wave pressure and meaningful boss damage were observable even with a healer-heavy upgraded party. This does not prove full-campaign difficulty, a 3-minute minimum, physical phone battle comfort, or that upgrading causes greater danger. Direct Arena fixture bypassed campaign runtime, so the legacy end overlay is fixture behavior rather than evidence about campaign completion screens.

Evidence: [trial data](playtests/feedback-1.1.2/village-trials.json), [fresh victory](playtests/feedback-1.1.2/village-fresh-end.png), [upgraded victory](playtests/feedback-1.1.2/village-upgraded-end.png), [native-input driver](playtests/feedback-1.1.2/village-driver.mjs), [phone geometry](playtests/feedback-1.1.2/layout.json). Driver Playwright import paths are workstation-specific.

## Final recheck

The confirmed overlap is fixed: mobile cooldown x300–480 / y525–535, with centered label x390; desktop x330–610 remains unchanged. Fresh final captures at 390, 844 and 667 CSS widths show the entire bottom bar without a touch utility intersection. Fullscreen control stayed reachable, and the canvas remained inside the visual viewport. No page errors. Repeated focused test run: **4/4 passed in 24.1s** after the fix. Captures were refreshed after restarting the local development server to clear Vite HMR module cache following edits; the discarded stale capture attempt was a harness/development-module issue.

Ready for local user review. No push authorization assumed.

## Horizontal command-row follow-up

Final user-requested six commands are now one horizontal baseline in fresh 844×390, 390×844 and 667×375 captures, with Pause separately above the left movement stick. The 44 CSS targets preserve independent pointer ownership. At the tightest captured portrait width, the row begins at logical x191 while the movement rim ends at x174 (17px logical gap); command bottoms end at y505, above cooldown label and the unchanged y525 bar. The 1.5× attack wheel remains unchanged. No page errors. Native touch test rerun checks all directions, movement/attack release, healing, guard and pause with the final geometry.

## Final clarification: matching 2×3 columns

The user's final choice supersedes the single-row experiment: two rows of three commands with identical x coordinates, no stagger. Final 844×390, 390×844 and 667×375 screenshots replace the earlier captures. All commands remain 44 CSS targets; bottom cooldown remains at y525. Landscape enlarged attack circle remains in its previous right-side position. To prevent a real portrait overlap, the circle moves left only where its vertical bounds intersect the upper command row, leaving an 8px logical gap between its rim and the command grid. In 390px portrait this puts the circle near the middle of the tiny battlefield; controls do not collide, but it obscures center action. Portrait comfort needs physical user judgment and a more spacious mobile composition later. Landscape is the clearer play orientation. No source edits by reviewer.
