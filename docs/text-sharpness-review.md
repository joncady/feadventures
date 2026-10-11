# Native text sharpness — 1.0.10

The previous framebuffer had only 896 × 544 pixels. Phaser's `pixelArt` setting also applied inline `image-rendering: pixelated`, so the browser enlarged/downscaled that framebuffer with nearest-neighbor sampling. A 3× Text canvas alone could not preserve its antialiased detail in the final low-resolution framebuffer.

The HUD, menus, dialogue, world labels, and buttons remain Phaser Text and Game Objects. `src/game/rendering/sharp-rendering.ts` installs a bounded supersampling adapter for pinned Phaser 3.90.0. The final framebuffer is 2× logical size for smaller/DPR1 windows and 3× when display width × device pixel ratio needs it. All Text textures use 3× resolution and linear filtering. Sprite and map textures retain nearest filtering. The browser downsamples the dense framebuffer with normal antialiasing.

The Scale Manager stays at 896 × 544. During each native renderer draw only, the adapter scales the camera viewport and render matrix into physical pixels, then restores both in `finally`. Camera world bounds, culling, follow behavior, placement coordinates, pointer hit tests, UI layout, and game units stay logical. This applies to WebGL and Canvas. No DOM HUD has been introduced.

## Upgrade and performance limits

Phaser 3.90 has no supported game-level `resolution` configuration; this adapter wraps the renderer's documented `render` method and accesses the native camera render matrix (not included in Phaser's Camera TypeScript declaration). Keep Phaser pinned and rerun render/input/layout coverage when upgrading it. The current game has scene cameras and Graphics-generated textures; it does not use camera render-to-texture, postprocessing framebuffers, or external render textures. Those features need dedicated adapter review before introduction.

The backing density changes on window/Scale Manager resize, not per frame. GPU pixel fill and backing memory increase by 4–9× versus the old framebuffer. The cap prevents unrestricted device-pixel-ratio scaling. This is a quality tradeoff, not a measured claim of identical performance on all hardware.

## Validation

Native rendering tests cover DPR1/DPR2 with actual WebGL and forced Canvas fallback. They resize through 600, 809 and 1440 pixels, verify logical camera/layout size, verify nearest sprite/linear native Text sampling, and place a unit with the mouse after resizing. Existing deployment tests exercise all four stages and both narrow/wide layouts.

48 unit checks and TypeScript/production build passed. The complete 87-check browser run passed 86 checks; its sole failure was a pre-existing Rally fixture requiring the browser to execute three keyboard commands within one second (remaining cooldown was 18,816.7 ms). That fixture now checks the actual configured 20,000 ms cooldown from the accepted activation timestamp. All seven focused Rally/rendering checks passed after that test-only correction. Production Rally behavior was unchanged.

The independent reviewer captured 90 states across widths 600, 809, 939, 1039 and 1440 at DPR1/DPR2. All 40 deployment courtyard checks and 40 native Space/Enter/R launches passed, with no page errors. Live resizing plus mouse auto-placement and native pause Resume remained aligned. See `text-layout-independent-review.md` and its durable screenshots for details. At 600px the fixed FIT composition still makes text small; this patch improves sharpness rather than adding a new mobile layout.

Release verification subsequently completed all 87 cases across a complete run plus five focused checks after test-only timing stabilization; see `release-qa-1.0.10.md`.
