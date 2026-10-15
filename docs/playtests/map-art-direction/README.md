# Map art direction — studies and integrated local candidate

All ten redesigned maps are now integrated in the [local playable game](http://127.0.0.1:5173/). See the [source-only runtime terrain contact sheet](runtime-batch/source-only-ten-map-contact.png), [frozen source hashes](runtime-batch/source-freeze-sha256.json), and [native-input route review](native-route-review/REPORT.txt). Focused actual deployment/launch, concealed arrivals, blocked placement and castle movement/flight/projectile/destruction checks passed. The full 175-case browser regression is still pending; this is not a version or release claim.

The comparison HTML preserves earlier art-direction mockups. Their sample party/enemy sprites, HUD/control masks and route overlays are illustrative; they are not screenshots or collision masks from the integrated game. Historical statements below about unchanged runtime apply to those original mockup iterations. Production terrain is rendered separately by `scripts/compose-expanded-maps.py` without baked actors or HUD. The original desktop/phone/full tabs preserve revision 3, transition tabs preserve revision 4, and the shrine concept tab preserves revision 7 alongside the approved coastal revision 6.

## Views and scale

- `*-full.png`: full proposed map with four actual current character frames and two actual red enemy frames. Source terrain is 16 px, enlarged nearest-neighbor 2× to current 32 px world tiles. Characters retain their actual 50×50 frame size, without enlargement.
- `*-desktop.png`: actual-size 896×544 world camera, zoom 1; source full-map camera origins coast `(256,128)`, ruins `(64,128)`.
- `*-phone.png`: 844×390 landscape fullscreen fit with the 896×544 camera fitted to 642×390 and centered. This intentionally shows how small characters remain on phone; it is not the full map squeezed into the camera.
- `*-routes.png`: cyan boxes identify proposed broad routes. They are **not validated collision masks**, and do not imply that every piece of visible water, stairs, gate or rubble is traversable.
- `*-current.png`: the archived pre-redesign runtime background, cropped at comparable coordinates. Current/proposed UI differs: proposed HUD is an explicit wireframe.

The blue labeled HUD boxes are illustrative safe-area overlays using current desktop party/minimap/cooldown bounds. Phone joystick and attack rings are approximate clearance envelopes, not captured Phaser controls or a functional touch-layout proof. No enemy navigation, spawning or camera pan has been validated. Character positions are illustrative. The revision-4 coast study uses only the supported sloping-bank corner family; arbitrary shoreline orientations are not supported. Architectural chunk seams and edge joins need an implementation art pass before release.

## Direction

Original revision-3 coast proposal: asymmetric sea edge, sandy landing strip, short northern stone jetty, a wooded inland bluff and complete fortified gatehouse frontage. Broad beach/quay routes offer contrast to the enclosed earlier stages. No boat asset or invented boat mechanic.

Ruins: quiet gray weathered pavement, an offset broken western enclosure, one surviving eastern gate, flooded side chamber, overgrowth and a draconic ritual destination. One bridge connects the eastern side; the broken west is the alternative entry. No fourfold mirrored columns, treasure chests or throne. The low-contrast stone uses an 8×8 interior crop of an existing floor tile, excluding its beveled border; source pixels are unchanged and remain at the same 2× world scale.

## Provenance

All raster game art comes from existing repository source assets. Exact source rectangles are in `source-crops.json`; cropping and nearest-neighbor scaling are the main art transforms. Validated terrain transitions are never rotated. Gate stairs use binary transparency extraction to remove their cyan source-map background; all surviving source pixels retain their original colors. HUD wireframe shapes/labels are explanatory overlays, not proposed custom game art.

- Fort kit: ZoramineFae / Flasuban, creator-posted sheet: https://feuniverse.us/t/updated-fort-tileset/9288
- Stronghold kit: ZoramineFae / N426 / Flasuban / Wan: https://feuniverse.us/t/updated-stronghold-tileset/6134
- Castle Moat / Royal Great Hall map chunks: RandomWizard; N426 improved castle tileset. Local source ledger records F2U/F2E with credit: https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39
- Plains sand source: repository `plains-preview-map.png`, local `plains-credits.txt` credits `{WAve}`. This reuses the already collected source, not a new download or a claim of newly verified terms.
- Character/enemy frames: existing `public/assets/` normalized game sprites; current repository asset source ledger retains their provenance.

Regenerate with Python + Pillow: `python3 docs/playtests/map-art-direction/build.py`. All generated outputs remain in this review folder.

## Transition direction checkpoint (revision 4, applied only to local mockups)

`transition-proofs.png` shows three controlled before/after vignettes at 32 px world tiles. These are synthetic boundary tests, not crops of the previous maps. `transition-proofs.py` reproduces them and preserves previous map images as `*-rev3-*.png` on its first run.

The source lookup keys are the four terrain corner states TL/TR/BL/BR, not a claim of a complete 47-tile blob family. The grass/stone family covers 14 non-checkerboard corner states; ambiguous diagonally disconnected checkerboards are intentionally unsupported. The shoreline proof authors only the available sloping convex/concave banks, not arbitrary cardinal sea edges. Every shape used in these three proofs resolves without a fallback tile; the script reports missing masks explicitly. No tile is rotated, recolored, blurred or hand painted.

The stone proof retains the quiet revision-3 interior; it changes only the boundary. These approved families now drive the two full local mockups, with unsupported patterns raising an error instead of silently selecting an unrelated tile. Grass variants use coherent 3-cell regions, with no independent per-tile random noise. Transition choices come from actual neighboring terrain. Fort's narrow-path center strips `(228,128,236,144)` and `(244,128,252,144)` are placed side by side at unchanged source-pixel scale, excluding grass fringes from path interiors. Exact boundary source rectangles are listed in `transition-source-crops.json`. The road uses actual straight edges `(256,128)`, `(256,144)`, `(224,144)`, `(240,144)` and separate junction corners, rather than repeating decorative rounded-arc tiles along straight runs.

The sloping shoreline preserves the source bank’s front/back treatment: the southern-facing bank exposes a cliff face while the opposite rim is thinner. This proof covers that exact sloping shape; arbitrary shoreline orientation is not validated.

An additional compatible creator-posted Stronghold sheet was downloaded for source inspection only into `source-candidates/stronghold-2021.png`: https://feuniverse.us/uploads/default/original/3X/4/8/48b05e6eb2beaed52e64e96406c48ba3d4ddf788.png . Creator context: https://feuniverse.us/t/updated-stronghold-tileset/6134 . It is not yet used by these proof images and does not imply all terrain orientations are available.

The revision-4 coast study was adjusted to a supported sloping headland instead of pretending the existing bank pieces support every orthogonal shoreline. Its small stone overlook stays within the landform. Both full maps use subtle 4×3-cell coherent grass variants; the quiet stone court remains quiet, with aged/rubble patches near architecture. No blanket runtime tile-renderer or collision implementation is implied.

**Review outcome:** Revision 4 is approved for discussing transition direction only. The coastal layout lost its sandy landing and quay/pier in becoming a headland; those remain unresolved. Its solid stone overlook is not a substitute for a landing. Grass variation is subtle, stone-floor uniformity is not fully addressed, and architectural crop/grounding joins still need work. No full-map, runtime, navigation, or final art acceptance is claimed.

## Revision 5 — environmental storytelling checkpoint

The **New · environmental story** tab shows a new local iteration. Revision 3 and revision 4 remain preserved and separately labeled. Preserved `*-rev5-desktop.png`, `*-rev5-phone.png`, `*-rev5-full.png`, and `*-rev5-routes.png` contain revision 5; earlier images use `*-rev3-*` / `*-rev4-*` names.

- Coast: replaces the unsupported natural-bank experiment with one coherent N426 quay family. The complete authored Castle Moat district (source rectangle `(24,0,240,160)`) retains its houses, gates, moat, bridge and corner joins. Its wall aligns with continuation tiles from the same reference `(32,64,48,80)`. Open water comes from the existing N426 castle palette `(336,80,368,112)`, in the matching cyan family. The bridge connects to a staging square, approach path and wayside camp. Existing Stahl and Sully frames illustrate gate/field guards, **not new NPC behavior**. The camp building is the existing runtime camp asset, not a new mechanic or custom raster.
- Ruins: two complete gray carved guardian reliefs from Stronghold `(400,64,432,112)` and `(432,64,464,112)` are mounted on a stone shrine facade with cap/foundation. These are **carved wall reliefs, not freestanding humanoid statues**. A complete draconic floor medallion `(352,16,400,64)` replaces the previously clipped carpet fragment. One complete gray column `(160,16,176,64)` and existing broken masonry cluster at the western approach. Source art is not artificially broken or repainted.

All character frames retain the actual 50×50 world size. Additional guards are illustration only; they do not imply implemented patrols, civilian dialogue or ally navigation. The blue HUD panels and phone rings remain approximate clearance wireframes. Collision masks and water/bridge traversal remain unimplemented. Independent review approved revision 5 for user direction review only. A narrow left shrine breach, using genuine rubble pieces, and a proposed eastern bypass are marked separately; collision/body clearance are not implemented. Sully is separated from red combat samples by more than 120 world pixels to read as a scenic guard post. Actual touch/HUD occlusion, water collision, gates and curb traversal still need implementation validation.

No new downloaded art was needed: the existing Stronghold and N426/RandomWizard source collection supplied these props. Existing source URLs and contributor credits above apply. `source-crops.json` includes new exact crop rectangles.

## Revision 6 — compact guard yard and dry shrine court

The default **New · revision 6** tab shows the current local iteration. **Previous / revision 6** compares preserved revision 5 with it. Revisions 3 and 4 also remain available, with their original labels.

Coast: the approved quay / gate / bridge district stays intact. One compact guard-muster court is linked to the main approach by an aligned open gate and path. The hut and Sully are visible below the minimap; Sully sits left of the phone aim clearance envelope. The court was reduced by about 40% from its first revision-6 draft so it does not turn empty grass into empty paving. Two verified source railing sections define the gate, and complete small shrub sprites border the outside.

Ruins: the disconnected water feature, isolated western room, unrelated portal and scattered debris were removed. The shrine facade, two mounted carved reliefs, medallion and clear front approach form one dry sanctuary. One attached collapsed western wing has a complete column, intact stone endcap and a single two-piece rubble cluster. Open combat space remains intentional; floor aging is a future polish pass, not filled with random props.

Newly used existing source rectangles: N426 ornamental railing `(0,128,64,144)` in `castle-palette.png`; complete small shrub `(384,224,400,256)` and wing stone endcap `(272,112,304,128)` in the Stronghold sheet. The hut reuses the Fort source `(400,64,448,112)`. All existing credits above apply. No additional downloads or custom painted art. Exact ledger: `source-crops.json`.

These remain **visual mockups**. Guard behavior, building interactions, collision/body clearance, shrine breach navigation, curb traversal and actual HUD/touch input overlap are unimplemented and must be checked during integration.

## Revision 7 — shrine bastion concept (coast locked)

The approved coastal revision-6 PNGs are locked by `coastal-rev6-lock.json` and remain byte-identical. Regenerate shrine only with `python3 docs/playtests/map-art-direction/build.py --shrine-only`; this does not rewrite the coast images. Previous shrine revision 6 is preserved as `grimleal-ruins-rev6-*.png`. Independent review approved the shrine concept for user direction review; its separate tab is now the default. The preserved coastal/shrine revision-6 tab and comparisons remain available.

Two low ruined bastion / gatehouse bases flank the lower approach. The left has a complete capped perimeter and arched front depth; the right uses genuine broken masonry and a clustered aged footprint. These are low bases, not intact tall towers. The central opening remains 224 world pixels wide. A floating stair fragment in the first draft was removed; no unsupported elevation is implied. Upper shrine facade and mounted reliefs remain the focal destination, and no water was added.

New exact source rectangles (unchanged existing source pixels): rear parapet `(112,64,128,80)` and complete arched front `(112,64,192,112)` from RandomWizard's `castle-moat.png`; true roof corners `(0,0,16,16)` / `(96,0,112,16)` and sides `(0,16,16,32)` / `(96,16,112,32)` from `barons-castle.png`; broken front masonry `(0,128,80,160)`, lower masonry `(0,144,80,160)`, genuine break `(128,128,144,144)` and aged grass/paving footprint `(96,240,144,288)` from Stronghold. Existing RandomWizard / N426 / ZoramineFae / Flasuban / Wan contributor credits above apply. No custom painted or AI-generated raster art.

Primary creator references were downloaded and visually inspected: N426's [map gallery](https://feuniverse.us/t/n426s-mediocre-sprite-works-and-general-bad-ideas/6943?page=2), Two Sorcerers post 28 (corner bastions framing the approach) and TempleGuard post 21 (grouped worn ruin footprints / overgrowth). Exact image URLs and hashes are in `references/sources.json`; these images are **reference only**, not extracted source art in the mockups. Fort's warm cylindrical building was inspected but rejected for this gray ruin concept rather than recolored or mislabeled as a ruined tower.

Phone command buttons overlap part of the scenic right bastion face; this is shown honestly in the phone mockup and is not evidence of implemented collision, attack visibility, or touch hitbox validation. Central approach clearance is a geometric proposal; route overlays are not pathfinding proof.
