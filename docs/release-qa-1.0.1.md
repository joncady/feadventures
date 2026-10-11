# Local release QA —1.0.1

2026-10-11. Local user-review candidate; no commit or push made for this update. Published1.0.0 remains separate.

## Changes linked to GitHub

- #55: Vertical character navigation wraps within the same column, including the partial final row.
- #56: All17 characters use shared normalized source portrait faces across selection/preview/party/playercard.
- #57: Walking/idle/control-transfer sprite flips are explicit; healing actions face their patient. No global movement-row flip.
- #58: AI approach and retreat distances derive equipped range/minRange; short-range Nosferatu no longer idles in221–260px dead band.
- #59: Native pause menu contains controls, Resume, Audio and Main menu. Combat control hints are removed; planning guidance remains. Version bumped once to1.0.1.

## Verification

43unit tests, strict TypeScript and production build passed. Full browser integration initially64/65passed: the remaining old native-interface fixture clicked the former Resume location. The updated native pointer fixture and four related pause/facing/range/version checks then all passed (5/5); the full65suite was not redundantly repeated after that correction and removal of transient launch control hints.

Fresh owned local Vite was restarted at127.0.0.1:5173 so package/build version refreshed. Ordinary Begin battle/P input captured local-1.0.1-pause.png: readable controls, visiblev1.0.1, no page errors. Existing browser checkpoint storage was untouched. Portrait selection image and original audit notes are durable in docs/playtests; facing/range reproduction is documented there.

No new full normal-speed campaign was played for this patch. Existing balance/aim/audio exact-match and uncertain legacy asset provenance remain GitHub follow-ups, not release-blocking regressions found by these checks. GitHub remains the bug source.
