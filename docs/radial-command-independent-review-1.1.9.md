# Mobile radial command review

Independent **GO**, October13,2026. No production edits or push by reviewer.

Six cases667×375,844×390,932×430, normal page and actual Chromium fullscreen. Currentv1.1.8 movement/attack radii, outer hit radii and knobs are retained exactly. Attack center stays77–83%canvas width on the right. Previous/next flank the wheel; Rally is bottom-left, weapon bottom-right, with shield Guard and staff-only self-heal in the lower row. All targets remain in bounds and at least44CSSpx. Circle-to-visible command gap≥10.1logical units; minimap, bottom cooldown, header Pause/fullscreen remain clear. Minimap is full100logical height in these cases, using preserved projection math.

Actual dual CDP input works simultaneously at all six sizes; releasing movement retains aim, releasing all resets both. Actual top Pause opens modal and Resume returns to combat. Zero page errors. In solo party, previous/next and Rally dim. Tapping the unavailable previous control at each size leaves lastAttack unchanged and pointerAttack false: no battlefield clickthrough. Visible unavailable controls intentionally consume touch through inert availability-gated handlers; hidden self-heal removes its hit target.

Four-member native fullscreen interaction sequence verified:

- Next changes Chrom→Frederick and equipped image to sourced lance.
- Weapon tap switches Frederick lance→sword and updates the image immediately.
- Previous returns to Chrom.
- Rally enters cooldown and dims; another tap causes no attack or action.
- Next twice selects Lissa: staff image and self-heal become visible; full-health self-heal is dim, injured/ready self-heal becomes active.
- Authored injury50HP followed by actual self-heal tap restores65HP; button dims during cooldown.
- Guard hold engages, warm/thick border renders, touch cancel releases it.
- Authored one-item loadout dims weapon switch; touching it retains item and lastAttack, with no battlefield clickthrough.

The shield is a platform glyph fallback approved by root, not a claim of a sourced Awakening shield icon. Chromium renders a recognizable shield/cross. Exact appearance on physical iPhone still needs user acceptance. Recorded availability fixtures deliberately isolate releases/enemies and authored health/loadout; screenshots are input/layout evidence, not natural combat balance.

Builder typecheck and two focused native touch tests passed19.8s. Reviewer additionally captured the six real-runtime cases and the four-member sequence. Previous lifecycle repair is unchanged; recreation review remains applicable.

- [Six measured cases](playtests/radial-commands-1.1.9/measurements.json)
- [Native interactions](playtests/radial-commands-1.1.9/interactions.json)
- [Four-member fullscreen](playtests/radial-commands-1.1.9/party-844-full.png)
- [Solo normal page](playtests/radial-commands-1.1.9/844-page.png)
- [Staff and held Guard](playtests/radial-commands-1.1.9/staff-guard-844.png)

Version badge reflects the existing dev-server define during review; release owner handles version separately.
