# Local asset inventory

Every file in public/assets, asset-library, v1/assets and the local audio-review audition library; excludes node_modules/build output. Catalog references identify available local sheets, not a claim to own/download the entire remote catalog.

Indexed **5078 files**. Types: font: 2, image: 170, audio: 4888, metadata: 18.

Provenance: unverified: 196, generated-placeholder: 6, documented: 205, catalog-id: 4671.

Machine-readable inventory: `asset-index.json`; reproduce with `scripts/index-assets.py`. Each entry records file size, SHA-256, image dimensions, runtime/reference/legacy scope and exact known source metadata.

## Active source gaps

27 registered files have unverified provenance: `public/assets/FE.otf`, `public/assets/arrow.png`, `public/assets/arrowFire.mp3`, `public/assets/attack.mp3`, `public/assets/chrom-animated.png`, `public/assets/chromPortrait1.png`, `public/assets/damage.mp3`, `public/assets/defeated.mp3`, `public/assets/enemy1-animated.png`, `public/assets/enemy1.png`, `public/assets/enemy2-animated.png`, `public/assets/enemy2.png`, `public/assets/enemy3-animated.png`, `public/assets/enemy3.png`, `public/assets/enemy4-animated.png`, `public/assets/enemy4.png`, `public/assets/enemy5-animated.png`, `public/assets/enemy5.png`, `public/assets/frederick-animated.png`, `public/assets/frederickPortrait1.png`, `public/assets/lucina-animated.png`, `public/assets/lucinaPortrait1.png`, `public/assets/map.png`, `public/assets/purpose.mp3`, `public/assets/slash.png`, `public/assets/titleScreen.png`, `public/assets/vulnerary.png`.

## Source gaps

Legacy original sprites, maps, music and font without existing provenance remain unverified. A matching filename is not evidence of permission. Generated menu music, healing/XP cues and three combat sounds are flagged as placeholders; active loaders use sourced substitutes after integration. Asset sheet IDs map to the Spriters Resource catalog; actor roles/palettes/crops remain documented in `asset-sources.json`.

## Campaign map kit

Maps are sourced-pixel compositions, not AI or locally painted artwork. Four source-preserving backgrounds, camp, flame and gold bag are reproduced with `scripts/compose-campaign-maps.py`. Individual layouts and gameplay terrain live in `src/game/data/maps.ts`. The high-level `MapChunk` interface specifies source crop, placement, scale, local terrain and connection sockets. Validate bounds and duplicate IDs before assembling; procedural random generation remains deferred.

| Mission | Source/design | Goal |
|---|---|---|
| East road | WAve plains + Fort trees, authored broad east-west lane | Clear low-level ambushes, reach east |
| Village | WAve plains + Fort houses, open crossroads | Protect village |
| Castle defense | Existing N426/WAve castle courtyard | Hold gates and commander |
| Black keep | RandomWizard Royal Great Hall, N426 tiles | Advance and defeat boss |

All missions target roughly three minutes; actual completion time requires playtesting. Four missions plus short intermissions aim below twenty minutes. Collision masks are authored separately from screenshots.
