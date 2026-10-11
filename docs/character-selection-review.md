# Character selection and party HUD review

The Awakening roster portraits already contain 254×254 or 256×256 sourced artwork. The previous 46px nearest-filtered presentation hid that detail. Selection now uses 56px face frames and a 174px focused bust, with linear sampling restricted to portrait textures. World sprites retain their pixel-art sampling. Source files are unchanged; provenance remains in `asset-sources.json`, `character-imports.json`, and the complete asset index. These are cropped source assets, not generated illustrations.

The five-column roster reserves a parchment detail panel for the focused hero. A gold star identifies the party leader; numbered blue cards identify companions in Q/E order. A pale outline represents keyboard or pointer focus independently. WASD moves five columns per vertical step, Enter selects, Tab changes leader/companion mode, and R reviews the battlefield. F9 exposes the developer maps. Resume appears when a checkpoint is available; the menu explains that starting another campaign replaces it.

Party rows now use green, amber, and red health bars based on current/max HP, with HP numbers below each name. Fallen units retain a subdued portrait and the explicit label “Fallen.” The bars use the real maximum health from the tactical map payload, so leveling does not misrepresent damage.

## Source review limits

The supplied Spriters Resource UI sheet (80213) and Morgan portrait sheet (63381) returned HTTP403 during this review. Existing downloaded Awakening parchment and portrait assets, recorded extraction metadata, and the user's reference screenshot were inspected locally. No claim is made that new remote assets were fetched or that the implementation reproduces every original game interaction.

## Prioritized remaining UX work

1. Provide an explicit keyboard focus step for Resume and Review battlefield; current shortcuts exist, but buttons are primarily pointer actions.
2. Explain the staff-equipped requirement when choosing a healing companion and show each party member's selected weapon during preparation.
3. Preserve consistent selection feedback across menu, shop and deployment. Native health bars and selection focus now have clear visual states; the remaining review should verify sound and cancellation behavior together.

Verification: typecheck and the focused native browser test cover five-column navigation, focused portrait identity, max-health display, and fallen-unit contrast. `/tmp/party-health-display-fixture.png` is deliberately a UI fixture showing healthy, wounded, critical and fallen units; it is not natural gameplay evidence.
