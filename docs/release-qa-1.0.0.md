# Local release QA — 1.0.0

2026-10-11. This is a local release candidate. Nothing was pushed, tagged or deployed.

## Verification

- 43 unit tests passed; strict TypeScript and production build passed.
- Full browser integration:60/60 passed in1.7minutes, followed by the new frontend version check1/1. Total61 browser checks passed.
- Visible HTML version and injected APP_VERSION match package1.0.0; package and lock are aligned.
- Coverage includes fresh campaign and transitions, checkpoint Resume/retry, developer save preservation, four-member native mouse/keyboard deployment, character and weapon switching, urgent staff support/restoration, rally cooldown/post return, flying and ranged terrain behavior, obstacle navigation, enemy recovery, native HUD, category audio/mute and scene cleanup.

No blocking regression was observed in those checks. Automated campaign transitions use fixtures; they are not another normal-speed full campaign proof.

## Ordinary play evidence

The stronger road completed in2:18 with a fallen healer and damaged companion. The compact village at final enemy damage1.25 completed in152.407seconds using ordinary controls; near141seconds Virion53HP/Sumia81HP, one NPC fallen, village897/900. Healing did meaningful work, but the support party remained comfortable. Native R activation/cooldown was reviewed separately. See docs/playtests/road-danger-review.md and village-rally-healing-review.md.

An earlier complete default campaign was beaten in12:40.76. The full campaign was not replayed after the current village/rally/urgent-healing changes.

## GitHub remains the bug source

Implemented local work is recorded under #49–#53 and prior campaign issues. Existing follow-ups #40/#41/#48 remain relevant: broader UX tuning, exact recorded audio identification and healer/aim/party balance. Remaining legacy asset provenance uncertainty is documented in the asset index. The production bundle emits a size advisory, not a build failure. No separate bug tracker was created here.
