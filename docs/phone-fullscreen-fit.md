# Phone fullscreen containment

The reported landscape screenshot showed a width-fitted canvas taller than the phone viewport. Element fullscreen expands the shell to screen width; its game child retained the width-only aspect ratio, clipping the party tray and primary action.

The game now contains its 896 × 544 logical canvas by both usable viewport dimensions, subtracting safe-area insets. `visualViewport` updates browser chrome height changes. A parent ResizeObserver refreshes Phaser FIT without changing logical coordinates or input mapping. Selection's existing compact roster paging follows the actual fitted canvas width.

On browsers without element fullscreen (including iPhone Safari), the same Settings action toggles a fitted viewport presentation. Browser chrome can remain present; this fallback does not promise native OS fullscreen. Settings remains available to exit.

Implementation is local in the 1.1.0 batch. Touch-enabled browser reproduction at 844 × 390 confirmed the complete canvas and bottom action visible (637 × 387 CSS pixels). Automated orientation/browser-height regression covers 844 × 390, 932 × 430, 667 × 375, 390 × 844, and 844 × 340. Independent review covers additional screens and WebKit; this is emulation, not a physical iPhone claim.

The observer coalesces refreshes into the next animation frame and ignores unchanged dimensions, avoiding a WebKit ResizeObserver notification loop. This containment fix restores access to the bottom actions; the existing fixed logical composition still scales some buttons below a 44 CSS-pixel touch target in short landscape windows. A separate responsive mobile UI pass is needed for larger visual targets and text.
