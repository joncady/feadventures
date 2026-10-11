# Healing readability — local 1.0.11

This is the healing/loadout visibility slice of issue #48, not a new balance pass or completion of the whole campaign UX issue.

## What changed

- The native party panel shows each character's currently equipped item icon, including automatic urgent-healing switches and manual F/Q/E changes. Uses existing Awakening weapon icons; no new art or DOM HUD.
- A controlled character with a staff shows a faint range circle and a stronger green ring around the actual eligible patient. The preview and cast share the same target selector: most injured nearby ally, proximity tie-breaker, then the existing wounded-caster fallback.
- A deliberate unsuccessful heal distinguishes `All allies at full HP` from `Wounded ally out of range`. Existing rejection sound, category volume, mute and rejection throttle remain in effect. Idle previews make no sounds.
- A successful player heal clears a stale rejection toast, then uses the existing local heal sound and near-patient +HP effect, without additional central text.
- Healing range, amount, cooldown, XP, automatic-healing thresholds, enemy behavior and mission balance are unchanged.

## Evidence

Before: native keyboard selection of Lissa, deployment and Space attack at full party HP showed the ambiguous “No wounded ally within healing range” message and no staff guide. The party panel showed HP/XP with no equipped action.

Meaningful browser coverage in `tests/e2e/healer-feedback.spec.ts` exercises actual Space/F/Q/E inputs. Fixture injury/positioning only establishes deterministic patient states: full HP, wounded outside range, eligible injured companion, equipment/control changes, and wounded caster fallback. Existing support/retaliation, rally-healing and weapon-switch tests passed (7 checks); both new native checks passed before the final toast-clear assertion. Final checks and independent size review are recorded below when finished.

48 unit tests and strict TypeScript/production build passed. Package/lock version is 1.0.11; this follow-up remains local and unpushed.

## Final validation

The final two native healer tests, including stale-toast removal after successful casting, and the existing native pause-menu check passed (3 checks). Final strict TypeScript/production build passed at 1.0.11. Independent review covered all four stages at 809, 1039 and 1440px DPR2 (12 stage/size cases); no new icon/text overlaps or deployment occlusion. Robin (Female) left 16 logical pixels before the item icon at the narrow size. Existing transient staff teaching notice is large but unchanged.

Local Vite restored on 5173 with version 1.0.11. Healer screenshot: `docs/playtests/healer-feedback-1.0.11.png`. Issue #48 remains open for boss aiming education and a normal-speed standard-party campaign balance review.

## Explicit self-healing · local 1.0.12

Issue #75: with a staff equipped, hold Shift to move the target ring to the controlled character; Shift + Space heals that character even with a more injured ally nearby. Normal Space/click now selects wounded allies only. AI staff users retain their existing self fallback. A full-health self target shows a gray ring and rejection feedback, with no healing, XP, or cooldown consumed. Pause controls include the shortcut.

Native browser coverage includes Shift press/release target changes, injured self versus lower-HP ally, full-HP rejection, ability and Q/E changes, and existing urgent-healing/restored-weapon checks. All four focused browser checks and 48 unit tests passed; release audit runs the wider suite before push.
