# Party selection refresh — local 1.0.14

First implementation slice from the industry audit, kept local for user review. No combat/map/shop changes and no new raster assets.

- Leader selection automatically advances to Select Companions. Leader remains visible with a marker and dimmed content; selecting it gives a reason instead of adding it twice.
- Four-slot tray holds leader and up to three companions. Back retains valid companions; selecting a replacement leader removes only that hero from companions.
- Begin Story opens the actual story. A solo party requires a second deliberate confirmation. Fixed NPC count was removed.
- Neutral navy portrait wells replace repeated parchment cards. Gold outlines indicate focus; blue surfaces and numbered marks indicate selected companions. One main parchment preview preserves original portrait proportions.
- Below 720 CSS canvas pixels, three-column roster pages show nine heroes per page with larger tiles/type and a concise side preview. Keyboard focus changes the displayed page; quiet Previous/Next controls and a page indicator also expose all heroes to mouse users, with unavailable directions disabled; wide layout shows all seventeen heroes. World/camera dimensions remain unchanged.
- Keyboard: WASD/arrows focus roster; Enter/Space choose; Tab toggles primary-action focus; Enter/Space activate focused primary; Escape returns to leader; R activates current primary action. Held/repeated confirmation keys are ignored.

Validation: 51 unit tests, TypeScript and production build pass. Native phased-party browser test passes: automatic phase transition, Back retention, remove companion and two-step solo launch. Independent window-size audit follows. Existing native-coordinate menu fixtures were migrated to the new geometry; five affected browser checks passed across sequential runs (native party role/audio, phased Back/solo, road deployment, tactical keyboard). Final independent responsive audit pending.

User review: select leader, choose/remove companions, return Back and change leader, then Begin Story. Resize below 720 canvas CSS pixels and use Down to browse all heroes. Try a solo party and check that its confirmation is understandable.
