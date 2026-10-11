# Legacy parity and accepted campaign changes

Reviewed 2026-10-11 against release 1.0.8 and archived `v1/`. This supersedes the initial migration checklist. Publication was explicitly approved by the user; the old local-only gate is no longer current. GitHub issue #9 remains the acceptance record, with the detailed comparison in [legacy-parity-review.md](legacy-parity-review.md).

“Parity” here means retaining the real-time combat experience and recording deliberate replacements. It does not mean restoring the earlier infinite swarm, random spawning, or two-player controls into the approved single-player campaign.

| Behavior | Current status and evidence |
| --- | --- |
| Three original heroes | Retained inside a 17-hero roster, including separate Robin genders; `data/config.ts`, `roster-magic.spec.ts`. |
| Directional movement, idle and attack frames | Imported and audited; `animation-layout.ts`, `animations.spec.ts`, `enemy-animation-audit.spec.ts`, `companion-facing-range.spec.ts`. Exact animation fidelity remains tracked separately (#4). |
| Directional attacks | Mouse/world aim supports attacking while retreating; `sword-direction.spec.ts`, `mouse-aim.spec.ts`. |
| Health feedback | Enemy health bars, party health bars and native player card; `native-interface.spec.ts`, `hud-compact.spec.ts`. |
| Enemy combat | Timed melee windups, recovery and range; archer/mage projectiles and navigation; `enemy-behavior.spec.ts`, `support-and-retaliation.spec.ts`. |
| Balance, drops and waves | Intentional campaign replacements, values and acceptance rationale recorded in the detailed review. |
| Battle start | Explicit deployment, Space placement, Enter auto-place and Begin battle/R gating; stage clock has a five-second opening. Replaces the old countdown; `tactical-battle.spec.ts`, `deployment-spacing.spec.ts`. |
| Campaign | Four objective missions, dialogue/shop, boss reinforcement phases; `campaign.spec.ts`, `black-keep.spec.ts`, `stage-one.test.ts`. Archived v1 hard-coded its first map. |
| Progression and equipment | Per-companion XP, 100 XP levels and growths, F weapon switching, staff healing and urgent AI healing; `progression.test.ts`, `weapon-switching.spec.ts`, `rally-healing.spec.ts`. |
| Party control | Q/E cycle living heroes; R calls help for 10 seconds with a 20-second cooldown. Replaces attack/defend orders; `tactical-battle.spec.ts`, `rally-healing.spec.ts`. |
| Audio | Independent music/effects/voices; recorded attack, selection, Rally and death lines; proximity-scaled battle effects. Music defaults on, superseding the early mute preference. `audio-settings.spec.ts`, `character-death-voice.spec.ts`, `rally-voice.spec.ts`. Exact unidentified legacy effects remain #41. |
| UI and cleanup | Phaser UI, pause controls, fullscreen, restart/menu cleanup; `pause-controls.spec.ts`, `native-interface.spec.ts`, `game.spec.ts`. Text density/sharpness remains a separate UX issue (#64). |
| Save | Browser campaign checkpoint, validated schema and retry rollback; not a live mid-fight save. `campaign-save.test.ts`, `campaign-save.spec.ts`. |
| Two-player keyboard / GameCube bridge | Not implemented in the current campaign. Explicitly deferred with multiplayer/backend stretch work (#5/#34); do not claim full input-device parity. |

The tests listed are evidence pointers, not a claim that this documentation pass reran them. Use the release QA and CI records for actual executions. Remaining navigation/performance, animation fidelity and multiplayer work stays separately tracked; none requires resurrecting retired v1 wave rules.
