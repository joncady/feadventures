# Selected portraits and world goals — independent local 1.1.0 review

October 11, 2026. Local only, no commit or push.

Reviewed all 17 heroes selected and deselected through the actual party handlers, keeping the three-companion limit intact. All 34 runtime preview/card checks matched the expected neutral versus selected texture, including genuine v1 Chrom/Lucina/Frederick variants and the 14 sourced expressions. Every variant is pixel-distinct, keeps transparent alpha, and matches its neutral canvas dimensions/aspect ratio. Runtime preview scaling preserves aspect. Contact-sheet inspection found no new face framing, haircut, or crop issue; Morgan and both Robin variants retain their sourced hair composites and use open-eye expressions. `playtests/selection-objective-1.1.0/portrait-contact-sheet.png` and `source-validation.json` record this check. The first provisional selection fixture accumulated companions and hit the normal party limit; it was corrected to clear previous companions before each case, then rerun with zero mismatches.

Sequential mission review verifies newly assigned world standards and matching minimap goal payloads rather than a player-following marker:

| Mission | World and minimap goal |
|---|---|
| Road | (448,272), then (832,272), then (1120,272) as its ambush phases progress |
| Village | (512,352), defended village camp |
| Castle | (640,448), defended keep |
| Black Keep | (512,128), commander throne |

All use the source gold/red standard, world scroll factor 1, and no equipment-sword OBJECTIVE label. Explicit scene-start reset prevents stale references. Independent review caught defense standards hidden behind camp depth 5; the final standard depth 6 fixes that while keeping it below units. Final Village/Castle battle captures verify visibility.

Phone regression: fresh 390×844 and 844×390 touch/fullscreen contexts both keep the entire canvas and bottom party actions within the viewport; actual Begin Story taps enter dialogue; auto-place and Begin battle transition correctly; compact touch layouts remain enabled; no page errors. See `phone-regression.json` and phone captures. This is emulator coverage, not a real-device performance or 44 CSS pixel target-size claim. The viewport changes themselves already passed the broader Chromium/WebKit phase review documented in the commander report.

The builder's final check passed 67 unit tests, typecheck, and build. This bounded reviewer pass focuses on the changed art/state/coordinates/layout rather than rerunning unrelated combat trials. Exact crops and provenance remain recorded in `asset-sources.json` and `import-selection-portraits.py`.
