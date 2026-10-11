# Named commander campaign proposal

October 11, 2026. Design only; no gameplay or save changes implemented.

## Recommendation: keep four missions first

All three villains fit the existing arc if Village gains a short commander finale. Keep Road as onboarding, then Gangrel → Walhart → Validar. This is a compressed Awakening-inspired alternate campaign, not a claim that these four locations reproduce the original story. Do not portray Walhart as Validar's subordinate: his invasion is a separate threat; briefings can explain that the party turns from the Valmese invasion to the Grimleal afterward.

| Mission | Commander and role | Distinct encounter | Objective and proposed duration |
| --- | --- | --- | --- |
| 1. Bandit Road | No major villain | Learn movement, attack recovery, healing, switching, ambush pressure | Existing three ambushes and eastern exit; 2.5–3 minutes |
| 2. Village Watch | Gangrel, mobile sword fighter | Short, readable pursuit burst followed by a clear recovery window; a telegraphed ranged Levin Sword strike can follow once the basic boss works. Light soldiers, axemen and archers keep his silhouette readable | Protect the village, then defeat Gangrel while it survives; shorten to two regular waves plus boss, about 3 minutes |
| 3. Castle Siege | Walhart, armored mounted conqueror | Slow committed axe strike; clear directional windup and longer recovery. Knights/heavies pressure entrances while a few archers cover them | Existing camp defense plus commander defeat; about 3–3.5 minutes |
| 4. Black Keep | Validar, dark-magic leader | Slow, strongly telegraphed aimed spell; reposition between casts. Mages/assassins pressure flanks, limited heavy guards protect his approach | Existing advance and final commander defeat; about 3–3.5 minutes |

Start with boss roles using existing attack/projectile primitives. Avoid simultaneous new charge, aura, teleport, summon and shield systems. Readability should come from a different silhouette, weapon icon, windup, cadence and minion composition—not merely more HP. Keep reinforcements bounded by the existing hostile caps and announce their entry. Actual HP, cadence and spell timings require an uninterrupted standard-party playtest; the current 900/1400 HP values are starting references, not promises of a three-minute clear.

For Village, the camp must remain the objective throughout the boss. Replace the current `hold-waves` victory with an explicit defense-then-commander rule; otherwise the existing completion handler will end the mission before Gangrel appears. Do not append a boss to the full three-wave schedule and unintentionally stretch the mission. Preserve current save/result idempotency and fallen-member recovery.

## Four versus five missions

Four missions cost the least and preserve the already playable progression. They provide roughly 12–13 active battle minutes plus party selection, dialogue and shops. The older magic-party full-route trial recorded 12:40; the newer standard-party trial only completed Road (2:31) and an early Village segment. Neither proves the new named bosses or a current 20-minute human campaign.

A fifth stage becomes worthwhile if the desired goal is **about 20 minutes including preparation** and each villain needs a location that reflects his story role. Stronger five-stage alternative:

1. Road onboarding.
2. Village defense ending with Gangrel.
3. Castle defense against a Valmese vanguard, foreshadowing Walhart.
4. Attack Walhart's castle and defeat him.
5. Compact Grimleal ritual hall ending with Validar.

This adds a genuinely different final setting and objective opportunity rather than another large empty keep. However, Village and Castle already cover defense, and Castle/Keep pacing is still unvalidated. Build the four-stage boss slice first. Add the fifth only after a full trial shows either narrative whiplash or a campaign materially too short. A fifth map requires a source-consistent ritual/temple tile set, authored collision and navigation, a new briefing/shop/result transition, and removal of the hard-coded four-mission completion boundary (`acceptMissionResult` currently checks `missionIndex >= 4`). Existing saves need migration rather than silently treating a previously finished campaign as unfinished.

## Lore and source boundaries

Nintendo's official character introductions identify [Gangrel as Plegia's war-seeking king](https://guide.fire-emblem-heroes.com/en-US/10004001000530-2/), [Walhart as the emperor of Valm who conquers by strength](https://guide.fire-emblem-heroes.com/en-US/10006001000273-2/), and [Validar as the Grimleal leader working to revive Grima](https://guide.fire-emblem-heroes.com/en-US/10005003000306-2/). These support the narrative roles, not exact Awakening combat stats. The proposed real-time attacks are adaptations for this game, not copied canonical skill rules. Asset availability/crops and original-game weapon identities are being independently checked in the companion asset/lore audit; do not infer working sprite animations from a character name in an atlas.

## Review gates

- Distinguishable commander silhouette/weapon, readable windup and safe response at desktop and phone widths.
- Village cannot finish before Gangrel; camp loss can still end the battle.
- Commander introductions/reinforcements respect caps, reachable entry points and pause.
- All three encounters can be cleared by a standard sword/bow/flyer/healer party without requiring one exact character.
- Normal-input full route records elapsed time, retries, fallen companions and HP at each result; no injected kills or health.
- Portrait, voice, map-sprite and weapon sources are verified separately. No generic art labeled as a named boss.
