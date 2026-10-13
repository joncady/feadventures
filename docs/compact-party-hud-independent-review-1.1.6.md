# Compact party HUD — independent review, v1.1.6

October 13, 2026. Slice A acceptance: **GO**, within the stated combat-party scope. No implementation edits, version bump, commit, or push performed by reviewer.

## Evidence

- 7/7 focused browser tests passed in37.7s: native health presentation, roster selection, Info equipment toggle/F controls, landscape gate and rotation clearing held touch input.
- Builder reported unit/typecheck/build pass; reviewer did not duplicate that full check.
- [Measured matrix](playtests/compact-party-hud-review/measurements.json): five sizes1280×800,1440×900,667×375,844×390,932×430; normal page and actual Chromium fullscreen; one/two/four party members. Thirty fixtures, no page errors.
- Essential phone HP text measured12.09–13.44 CSSpx. The normal page retains title/version/context. Larger desktop text measured17.42–27.32 CSSpx depending fullscreen.
- Four-member party background is146×136 logical units throughout the matrix, versus previous192×150:31.1% smaller rectangular area. Dynamic font sizing did not increase row height beyond32 in these tested sizes. This measures rectangle area, not total scene occlusion.
- State fixture uses132/132 grown HP,45/120 injured,15/110 critical,0/105 fallen. Color is supplemented by the bar fraction, controlled portrait thick border, fallen dash/dim/diagonal. Exact max HP remains in Info; combat value is current HP only.
- [Interaction evidence](playtests/compact-party-hud-review/interactions.json): real E switches Chrom→Frederick, I expands inspection with Frederick LV/EXP, HP, stats, weapon list, then I/Q returns. Deployment still displays names/LV/Not placed. Live landscape resizing932→667→844 retains CSS HP minimum and native touch layout.

## Images

- [Phone normal page667](playtests/compact-party-hud-review/667-page.png)
- [Phone fullscreen844](playtests/compact-party-hud-review/844-full.png)
- [Desktop page1280](playtests/compact-party-hud-review/1280-page.png)
- [Live resized844/boss panel fixture](playtests/compact-party-hud-review/live-844.png)
- [Prior baseline phone844](playtests/combat-hud-proposal/current-phone-844.png) is a previously captured1.1.5 fixture, not a newly reconstructed before image.

The party panel occupies x12..158; commander panel x320..576,y40..104, minimap x716..880. There is no party/commander/minimap rectangle overlap. Central opening notices remain unchanged and below the commander panel. Real battlefield actors can still move behind any overlay; this slice reduces rather than eliminates occlusion. Boss image is a layout fixture using existing Gangrel art, not a natural encounter completion trial.

## Scope and remaining limits

Attack stick, aligned2×3 commands, bottom cooldown, top-right fullscreen, remapping and reduced-motion source paths were unchanged. Existing rotation tests verify shared input ownership; the thirty screenshot fixtures do not constitute real-phone hardware acceptance or natural combat balance. Commander/objective consolidation and mobile controls overlapping the bottom Info card are retained existing layout and remain candidates for Slice B/C. Source portraits are unchanged, with names discoverable by control/Info; this is not a claim of full accessibility certification.

## Mobile inspection follow-up

The former bottom Info card is covered by mobile commands, so acceptance additionally requires the new Pause → Info view. Actual single-game runtime review uses the exact document entry script URL, not a second import of bare main.ts; invalid duplicate-game fixture attempts were discarded.

The native pointer path passes at844×390, normal page and actual fullscreen: Pause → Info, all four party members' LV/XP/HP/equipped weapon, Back retaining manual pause, and Resume unpausing. Entry Info visible frame and interactive hit rectangle are both44 CSSpx high. Back/Resume are44 CSSpx high; text is12.09CSSpx on page and12.90 fullscreen. Scene recreation retains exactly four Info row references and correct four member texts, without accumulation. [Measured values](playtests/compact-party-hud-review/pause-info.json) and [Info screenshot](playtests/compact-party-hud-review/info-page.png).

The additional native pause-controls and native-interface regression tests passed2/2 in16.2s. This brings targeted browser checks to9/9. Existing other Pause options retain their previous small touch sizes; only the new Info entry and its navigation were changed, and general Pause touch sizing remains follow-up work.

Smallest-phone delta also passes at667×375 page/fullscreen: Info/Back/Resume all44CSSpx high; essential text12.11/12.41CSSpx, four correct rows, Back paused/Resume active, scene recreation four correct rows. [667 measurements](playtests/compact-party-hud-review/pause-info-667.json), [667 Info capture](playtests/compact-party-hud-review/info-667-page.png).
