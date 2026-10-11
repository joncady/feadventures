# Bounded standard-party natural trial — local 1.0.16

October 11, 2026. Chrom / Virion / Sumia / Lissa, default 50% damage, normal real-time native keyboard and mouse. No injected kills, health, wave changes, map jumps, clock acceleration or invulnerability. A separate local Vite server disabled hot reload so concurrent touch fixes could not reset the loaded trial. Chromium 1440×1066, DPR1, actual Phaser rendering.

The driver reads positions, cooldowns, camera transforms and navigation geometry to choose normal movement/attack input. This is an automated functional playtest, not evidence that a new human understands the HUD. It forged Falchion +1 through the actual shop before Road, selected native Auto-place, used Chrom's directional melee and allowed Lissa's ordinary AI support. It was prepared to switch to Lissa if Chrom dropped below 45 HP; this never became necessary on Road. It did not prioritize rescuing a low-health companion, an important driver limitation.

## Observed route

- Road won naturally in **2:31**, three ambush waves and **48 defeated**. Collected **637 gold**, earned the **100** mission reward. At results: Chrom **80/101**, Virion **95/100**, Sumia **fallen**, Lissa **100/100**. Chrom, Virion and Lissa reached level 2; Sumia retained level 1 / XP57. No retries or damage-setting changes.
- Native results Continue advanced to Village preparations. Sumia revived and all members returned to full health. Equipment/progress persisted, including forged Falchion +1; treasury displayed **757**. A second ordinary Falchion forge was selected before Village deployment.
- Village ran normally for **0:51**, reached the first wave's rest after **16 defeated**. Last sample: camp **894/900**, Chrom101/101, Virion95/100, Sumia100/101, Lissa81/101. The orchestrator then stopped the bounded trial to release the browser slot for critical phone-control validation.

Road temporarily accumulated enemies while Chrom lingered near a forest edge at x814/y190. Sumia fell during that pressure. Because the driver ignored low companion HP and used its own route planner, this does not isolate either an AI bug or a balance failure. Lissa repeatedly restored other party health through normal support, making her value visible. Accurate camera-derived mouse aim avoided the older guessed-screen-position issue for Chrom's attacks.

No game page errors were recorded. The interruption closed the browser while the harness tried to release a held movement key, producing an automation cleanup error. The durable trace and Road victory capture were saved beforehand. No terminal game/save state is inferred beyond those recorded observations.

Evidence: [trace](playtests/standard-party-1.0.16/trace.json), [Road results](playtests/standard-party-1.0.16/road-victory.png), [native-input driver](playtests/standard-party-1.0.16/driver.mjs). Workstation-specific Playwright import path requires adjustment elsewhere.

## UX assessment and limits

Useful: directional retreat/attack works, actual XP/stat progression survives the mission boundary, fallen companions explicitly return for the next mission, and staff support meaningfully restores health under pressure. Risk worth human review: a flying companion can become isolated beyond the ground leader's immediate route; a help warning should prompt a timely switch or rally rather than relying on the healer following automatically.

**Issue #48 remains open.** This trial proves Road and an early Village segment, not a full standard-party campaign. Castle/Keep boss aiming, final-map pressure and a fresh full-route duration still need a dedicated uninterrupted trial. Do not claim all four stages, boss balance, mobile campaign usability or final victory from this run.
