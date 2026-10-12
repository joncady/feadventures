# Mobile landscape gate — 1.1.3

Mobile coarse-pointer devices now require landscape to play. A viewport-level rotate prompt covers all preparation and battle screens in portrait. Narrow fine-pointer desktop windows continue to work. Logical Phaser coordinates and canvas rotation remain unchanged.

Entering portrait clears touch-stick ownership, movement, aim, guard and keyboard state. Global game input is disabled. Only scenes that were actively running are paused and remembered; already paused scenes (including a manually paused battle) remain paused on return. Scenes opened by an asynchronous boot or transition while portrait is active are also captured. Only audio paused by this gate resumes.

Fullscreen attempts `screen.orientation.lock('landscape')` when the browser supports it. Failure is intentionally tolerated. iPhone Safari does not offer reliable browser orientation locking; there the user rotates the phone, with the same portrait gate protecting the game. Exiting real fullscreen unlocks orientation when supported. No CSS rotation workaround is used because it misaligns input coordinates and safe areas.

Validation: policy tests cover coarse portrait, landscape, fine-pointer desktop and square viewports; API tests cover unavailable/rejected orientation locking and the fullscreen requirement. Independent browser review covers actual portrait-to-landscape transitions, held-touch cancellation, pause ownership and unsupported WebKit behavior. See the independent review artifact for measured results.
