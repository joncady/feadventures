# Battle controls and accessibility — local 1.1.4

Settings → Controls & accessibility opens a separate Phaser-native panel. C opens it from Settings; arrows/Tab select actions, Enter confirms, Escape cancels key capture or returns to Settings. The scene pauses without changing the player's prior pause state.

Twelve battle actions share one binding model: four movement keys, attack, previous/next hero, weapon, rally, pause, guard, and self-heal modifier. Unique letter/number/Space/left Shift/left Control mappings are saved to `feadventures.controls.v1`. I, Escape, Tab, arrows and developer shortcuts are reserved. Arrows remain movement alternatives. Party menus and deployment retain their existing navigation keys and the panel explains that scope. Reset restores defaults. Pause instructions show current bindings. Mouse and touch actions stay available.

Reduced motion follows the operating system unless explicitly saved. It removes floating feedback travel (damage, healing, gold and evade numbers/symbols) while retaining fades, character animation, cooldown timing and combat telegraphs. This avoids removing information required to judge an attack.

Loading errors open a native Retry loading affordance. Retry reloads the page and its existing checkpoint rather than attempting to recover a partially loaded texture/audio cache.

Validation: typecheck and 71 unit tests pass. New preference tests reject malformed/duplicate/reserved mappings and exercise system defaults. `tests/e2e/control-preferences.spec.ts` exercises real keyboard action remaps, rejected collisions, capture suppression and reload persistence; independent browser/layout review is pending.
