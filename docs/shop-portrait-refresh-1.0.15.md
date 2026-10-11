# Local shop portrait refresh — 1.0.15

The unavailable leader is dimmed as a complete card during companion selection, including portrait, name, weapon and background. Gold focus remains separate.

Shop character navigation is a bottom portrait strip. Click a portrait or use Q/E to change the inspected member. Selected portrait has a navy surface and gold border. Re-selecting the current member is silent; changing member sends exactly one cursor event. The large inspected portrait preserves its source aspect ratio. Robin portraits use concise gender-qualified labels in the strip.

Persistent keyboard instruction legends were removed from party selection, deployment, shop and dialogue. Primary actions, confirmation of traveling alone, deployment objective, navigation, buying and forging remain visible. Combat has only Menu and Pause in its utility header. The previous Audio, mute and Full toolbar is replaced by one Settings action on party selection/deployment; combat Settings is in Pause. Fullscreen lives inside Settings. Pause retains battle controls and self-heal instructions.

Validation: 51 unit tests passed, and the final TypeScript check and production build passed. Three targeted browser tests passed, covering phased selection, dialogue progression, clickable shop portrait selection, no duplicate selection feedback and Q/E cycling. Independent multi-window visual review follows separately. All changes are local; no commit or push.

Review: choose leader, verify subdued unavailable card in companion phase; enter story and click through dialogue; select shop portraits, check equipment updates for each member, forge/buy if affordable; try Q/E; deploy and check only Menu/Pause utility actions during combat, then Pause → Settings → Fullscreen.
