# Weapon capabilities and critical feedback integration

Local implementation, pending independent review and natural ten-stage acceptance. No release/push from this agent.

- Player and companion launch state now captures hero, actual forged weapon, power, capabilities and one critical roll. Player windup transfers to the companion on Q/E without changing its captured weapon. Projectiles retain captured state even when the equipped slot changes.
- Elfire/Arcfire/Bolganone impact radii48/64/80, caps4/5/6, increasingly long recoveries. Forge +1 adds2 power and4 radius to these area tomes, never to the existing single-shot Fire definition.
- Thoron has a32px piercing projectile body, at most6 distinct targets, overlap deduplication. Brave sword/axe/bow schedule two strikes/shots within one recovery; shared critical state and one critical cue. Companion melee burst uses its native attack target.
- Fortify heals living wounded friends within240, up to4, caps at HP max, cannot revive; healing XP awarded once for useful restoration. Existing Shift+self, normal Space ally targeting, AI urgency retained.
- Existing critical multiplier remains3 in the shared damage resolver. Current growth-relative chance is preserved. Actual critical damage uses a gold star/number rather than CRIT prose and emits one hero-critical event per launch; no event on misses/healing. Recorded per-hero CUTIN clips have global4s/hero8s pacing, death/rally priority,320px companion audibility and existing voice preferences.
- Shop focus preview describes power/range/AOE/crit/cooldown and whether buying equips/replaces. Current equipment badge and forge before/after power/AOE comparisons are explicit. Campaign agent owns chapter stock, prices, replacement confirmation and migration compensation.

Verification:

- Full unit suite92passed at integration checkpoint; subsequent forged-AOE summary check passed separately (suite now one extra test).
- TypeScript passed after final changes.
- Four capability browser checks passed: actual area/piercing damage and friend immunity; actual Fortify recovery/no revive/no overheal; actual Brave two strikes with one critical event; recorded audio dispatch pacing/mute and empty-attack silence.
- Existing bow/restart, lance reach/triangle and weapon cooldown switching3passed.
- Existing staff selection, Shift self-heal, ally healing, urgent AI heal/rally4passed.
- The audio-dispatch fixture routes known critical events to the real listener and intercepts sound.play; it confirms registered clip selection, not audible human audition. Separate damage fixtures confirm native critical events.
- One discarded repeated-paused-attack fixture produced a Phaser CanvasText context error with globally forced Math.random. The precise cause was not established; final fixtures avoid that global override for audio routing. Do not describe this as a demonstrated gameplay crash or a proven RNG engine defect.

Genuine Yen'fay/Aversa source hashes, original sheets, normalized40frame sprite atlases, portraits and crop script are included. Aversa's source physical swing row is reused as idle during tome casts to avoid displaying a sword swing as spell animation. No synthetic sprite artwork or device speech introduced.
