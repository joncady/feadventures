# Campaign preparation UX

This pass uses Awakening's short companion dialogue → equipment preparations → battle structure. The reference is Nintendo's [Awakening electronic manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/fire_emblem__awakening_1/ElectronicManual_Nintendo3DS_FireEmblemAwakening_EN.pdf), which documents dialogue advancement, preparations and shops. The mission dialogue is original writing; it does not reproduce Awakening scripts.

Each mission opens with three brief exchanges from the chosen party, their existing sourced portraits, and one persistent objective. Space/Enter and pointer confirmation advance the same flow. Every navigation/confirmation/rejection uses the existing UI audio feedback pipeline. There is no mandatory delay or autoplay that prevents reading.

Preparations show the treasury, current party member, level and three weapons. Q/E rotates members; WASD chooses commands; Enter confirms. Class-valid unique purchases and per-item forging preserve the existing three-slot inventory and F switching. Purchases replace the currently equipped slot if inventory is full, explained on the screen. Existing sourced parchment panels and FE font retain the game's visual language. Free healing between missions protects campaign beatability; progression, gold and inventories persist.

Forging costs100G per step and preserves weapon identity, up to+3. Each step adds2 weapon damage or2 staff healing. Forged names, price/max state and rejection feedback are displayed.

Future UX refinements: preview replacement before confirming purchases, describe damage/cooldown tradeoffs directly beside shop offers, and a compact campaign route screen. No new custom raster art is introduced by this scene.

Dialogue presentation now follows the supplied Awakening reference: two large existing sourced bust portraits above a compact bottom parchment panel, a separate dark nameplate with gold text, and a purple next caret. The active speaker is full brightness; the other chosen companion is dimmed. Portrait scaling preserves the loaded frame's aspect ratio. A solo party shows one portrait rather than inventing an unchosen companion. Original mission text and preparations remain unchanged. Space, Enter and clicking the dialogue panel advance; the recorded `dialogue-advance` cue uses the effects category and existing mute settings. No typewriter delay is imposed.
