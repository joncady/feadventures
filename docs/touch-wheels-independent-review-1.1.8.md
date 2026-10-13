# Additional50% touch wheel enlargement — independent review

October13,2026. Final **GO** after resolving command clearance and right-thumb reach. Reviewer made no production edits or push.

Six mobile cases:667×375,844×390,932×430, each normal page retaining context header and actual Chromium fullscreen. Both drag/visual/hit radii are precisely1.5× currentv1.1.7 dimensions; source knobs use the same factor. Attack wheel centers stay on the right at86.25–89.60%canvas width in every case.

Initial enlarged layout had3.7logical command clearance at844 normal page. A whole-grid left fallback fixed intersection but moved the wheel to60%width, which root rejected for thumb reach. Final layout preserves right placement by reducing only the necessary minimap height:80.001logical at667 normal,97.702 at844 normal, otherwise100. This leaves≥8logical between minimap and wheel,≥10 between circle and command grid, exceeding the5logical outward aim marker. Terrain image height exactly matches registry height in measured cases. Source review confirms border, goal, enemy/allied dots, controlled marker, and camera outline all project through actual height. Deployment/desktop stay100logical.

Movement outer leftedge8 and bottom524 remain in bounds. Bottom cooldown starts525, with114+logical lateral separation from movement circle. Six commands stay aligned2×3. Top Pause keeps44CSSpx hit target; actual touch pauses, modal Resume unpauses in all six. Tapping former floating Pause location does not pause. Header visuals no longer intersect Menu/minimap.

Actual two-finger CDP input in every case produces movement≈0.70 and attack aim≈(0.814,−0.581) simultaneously. Releasing movement retains aim; releasing both clears movement/aim. JSON field `releasedAim` is the historical script label for release of the movement pointer; observed control data identifies it unambiguously. No page errors. Prior lifecycle correction2984bbc is unchanged and independently passed initial creation plus three desktop/mobile recreations with resize and fresh Pause/Info references.

This is native input/layout verification, not real-phone hardware acceptance or natural boss balance. The smallest normal-page minimap is approximately46CSSpx high; fullscreen retains its previous height. Larger wheels cover more battlefield by request. All screenshots were buffered until browser close, using the exact existing document entry module to avoid duplicate games or HMR changes.

- [Six measured cases](playtests/touch-wheels-1.1.8/measurements.json)
- [Phone844 normal page](playtests/touch-wheels-1.1.8/844-page.png)
- [Phone844 fullscreen](playtests/touch-wheels-1.1.8/844-full.png)
- [Phone667 normal page](playtests/touch-wheels-1.1.8/667-page.png)

Screens depict short Siege opening layout fixtures, not complete gameplay. Badge reflects the existing dev server define; release owner handles version separately.

Final numerical spacing repair: command padding is10.1logical rather than10, eliminating a1e−14 rounding failure while retaining the unchanged test requirement of≥10. The same10.1 is used in minimap-height calculation and right slot bottom, preserving size/position consistency. Typecheck and both native attack-stick tests passed19.6s on this final source. Only0.1logical extra spacing changed from the accepted right-column matrix.
