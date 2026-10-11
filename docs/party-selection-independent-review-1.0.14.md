# Independent party-selection review — local 1.0.14

Reviewed October 11, 2026. Production implementation by a separate agent; reviewer made no production source changes. Local only: http://127.0.0.1:5173/. No commit or push.

## Verdict

Ready for user review. The phased flow is clearer, the roster no longer consists of competing gold frames, and the focused full portrait creates one clear decision surface. Leader, selected companion slot number and keyboard focus remain distinct. Both Robin names fit. Portraits preserve proportions. At600px the three-column paged roster increases character-name size relative to the old five-column scaling.

## Scope and evidence

- Chromium at600/809/1039/1440 window widths,1066px height, DPR1 and2: native Enter chooses Chrom; D then Enter selects Lucina; Escape returns to leader while retaining Lucina. Each matrix entry records phase, count, actual canvas CSS width, visible tiles and browser errors in [matrix.json](playtests/party-refresh-review/matrix.json).
- Native live resize1440→809→600→1440 maintains focus and selected state, switches between full17 and compact9/page roster, and keeps Back/Begin Story visible. Screenshots `resize-*.png`.
- Independent600px native controls: reselecting leader rejected without adding him; compact Next pointer click reveals remaining8 heroes and focuses Lissa; one cursor sound recorded for that accepted page change. Edge Next is dimmed. Keyboard Down also exposed page2 in the earlier pass.
- Empty-party Tab→Enter leaves Campaign inactive and shows deliberate solo confirmation; second Enter starts Campaign. Confirmation and sound keys recorded in [native-flow.json](playtests/party-refresh-review/native-flow.json).
- No browser page errors in final matrix. One canvas per clean page. This is a UI-flow review, not a full campaign regression or cross-browser certification.

## Findings corrected before final review

1. Compact tiles originally scaled to118px logical height with101px row spacing, hiding first-row names. Implementation reduced scale to1.30; final captures show no overlap.
2. Preview description overflowed parchment and feedback overlapped party slots. Implementation shortened preview description and relocated transient feedback inside preview.
3. Compact roster initially hid8 heroes with keyboard-only paging. Added quiet native Previous/Next and page count; pointer Next tested successfully.
4. Utility header now mirrors selection phase.

## Remaining design notes

600px tertiary shortcut text and empty-slot labels remain small, though primary names, phase and actions are legible. Further responsive typography can improve those secondary labels. Full preview now lists equipment names rather than additional role prose; user should assess whether weapon icons and short equipment names are enough guidance. This slice retains the existing external webpage slogan and utility buttons; combat/shop refresh is outside this review.

## Representative captures

- [Companions at1440 DPR2](playtests/party-refresh-review/companions-1440-dpr2.png)
- [Companions at600 DPR1](playtests/party-refresh-review/companions-600-dpr1.png)
- [Compact second page](playtests/party-refresh-review/compact-second-page.png)
- [Solo confirmation](playtests/party-refresh-review/solo-confirmation.png)

Review harness initially loaded duplicate dev-entry modules after Vite hot reload. Those misleading captures were overwritten after clean Vite restart and standard variable-based imports. They are not reported as a production UI regression.
