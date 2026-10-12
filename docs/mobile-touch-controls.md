# Touch input checkpoint — 1.0.16 (local)

The combat overlay stays inside Phaser. Touch/coarse-pointer devices see a translucent bottom-left joystick, plus compact previous/next hero, weapon, rally, self-heal, and held guard actions. A battlefield tap sets aim and requests one attack; desktop keyboard/mouse controls remain available.

The joystick owns its pointer until release. Other fingers can aim and attack without changing movement. UI touches are consumed by the upper Interface scene. Releasing the aiming pointer does not release the joystick. Touch cancellation, browser blur, pause, and leaving battle clear movement and held guard.

No new artwork was generated. Controls use native geometric drawing/text symbols and the existing interface palette. These are an initial functional input layer, not a final mobile visual system. On very narrow portrait screens the existing fixed logical canvas still shrinks targets; a dedicated portrait/mobile composition remains necessary.

Issue #8 also requires keyboard remapping, reduced motion, asset-loading failure/retry and broader accessibility work. This input checkpoint alone does not close the issue.

Validation: TypeScript check passed. One targeted Chromium/CDP test uses actual touch events to hold the joystick while a second finger aims/attacks; the joystick itself never requests an attack, and touch cancellation clears movement. Independent phone portrait/landscape and per-finger release review is still pending at this implementation checkpoint.

Responsive follow-up: native action hit targets now measure at least 44 CSS pixels at the current canvas width. Landscape coarse-pointer devices omit the decorative page header and fit the canvas to the viewport height. The joystick keeps immutable circle geometry and scales its native object, so its visible circle and input transform stay aligned across canvas sizes. Touch mode hides the lower character card, moves attack readiness to the upper field, and places pause above the joystick so controls do not cover the minimap title or card. Individual-finger release must be tested with accurate `changedTouches`; CDP's end-event array must not be assumed to represent remaining touches.

Portrait regression verified: the native Chromium/CDP test now runs at 390×844. Startup joystick movement does not attack; a second finger attacks; ending that finger (actual `changedTouches` semantics) preserves joystick movement; cancellation stops it. A live 809→390 resize retains safe movement. All seven native action targets meet 44 CSS pixels, and a guard-button touch cannot fall through to an attack. The targeted test passed in 6.3 seconds; final independent captures remain separate evidence.

## 1.1.1: independent right-thumb attack stick

The right side now has a 360-degree attack stick between the minimap and lower action row. Pressing its center attacks in the current facing direction; dragging aims independently of the movement joystick. Holding requests attacks only as the normal weapon cooldown permits, without repeated recovery notices or bypassing attack commitment. Releasing stops new requests and retains the last aim. Battlefield tap remains available as a single-shot alternative.

Movement, attack, and guard retain separate pointer ownership. Touch cancellation, browser blur, pause, settings, battle exit, and shutdown clear held input. Staff uses the ordinary ally healing policy; the separate plus action remains explicit self-healing. Desktop mouse/Space semantics remain unchanged.

The attack hit-circle measures at least 47.5 CSS pixels at narrow widths, with its own smaller radius to clear minimap and action controls. Position and scaled hit geometry are reported in `touch-control-layout.attack` for native-touch regression checks. Artwork remains Phaser geometry in the existing palette.
