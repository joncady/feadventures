# Compact map kit and level recommendations

Research checkpoint: 2026-10-10. These candidates are downloaded for review, not integrated into the game. No procedural generation in this slice.

## Best starting point: Courtyard

RandomWizard's [one-screen courtyard](https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/9) is already designed around a central starting party defending against reinforcements from all sides. The creator permits editing with credit. It is a 15×10 tile layout, native 240×160 pixels. At 3× nearest-neighbor scale this becomes 720×480: compact enough to read most of the battle without moving the camera, with 48px terrain tiles close to our character scale. Adapt the reference rather than just stretching the current large field.

For real-time play, remove single-tile pinch points, leave 2–3 tiles around each entrance, keep the camp center and four NPC posts, and reserve a short off-screen arrival collar outside each gate. Put breakable barricades beside open entrances; retain bow firing lanes and flying traversal. Keep deploy bounds tied to the actual walkable courtyard mask. A screenshot does not provide collision data; authored navigation and deployment masks remain required.

## Next compact stages

| Candidate | Use | Required adaptation |
| --- | --- | --- |
| Courtyard | Level one, defend camp on four fronts | Widen passages and preserve open entrances |
| Castle Moat | Level two, approach and breach objective | Add a second ground route; keep Pegasus shortcut |
| Royal Great Hall | Final compact commander arena | Widen central aisle; use side rooms for reinforcements |
| Baron's Castle | Alternative short assault | Remove awkward stairs/chests until interactions exist |

The final three are from RandomWizard's [six-map castle pack](https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39), explicitly free to use and edit. Credit RandomWizard for layouts and N426 for the improved castle tileset. The pack has no scripted tile changes. The directly linked older Discord editable file for the courtyard currently returns 404; the creator-posted PNG reference was downloaded successfully. No editable TMX was recovered, and the references must not be represented as editable map data.

## Building blocks collected

- Existing N426 castle kit: modular walls, cracked walls, doors/portcullis, floors, pillars, railings, roofs, bridges, carpet and bookshelves. [Creator post](https://feuniverse.us/t/fire-emblem-resource-repository-battle-animations-portraits-music-etc/3326/1775).
- New [Fort kit](https://feuniverse.us/t/updated-fort-tileset/9288): houses, shops, cliffs, mountains, grass transitions, trees, fences, floors and pillar variants. Credit ZoramineFae and Flasuban, preserving original game attribution.
- New [Stronghold kit](https://feuniverse.us/t/updated-stronghold-tileset/6134): doors, sideways stairs, broken walls, shaded floors, treasure-room tiles, roofs, grass/water transitions. Credit ZoramineFae, N426, Flasuban and Wan. The source explicitly notes its flame tiles do not animate.

These GBA kits are 16px tiles with a coherent pixel scale. They are a first-pass style match, not Awakening-native graphics. Downloaded sheets may contain palettes/meta-tile arrangements rather than ready Tiled JSON; extracting sprite frames alone does not supply connectivity, terrain types or animations.

Local review bundle: `asset-library/map-candidates/compact/contact-sheet.png`; originals and provenance are beside it in `sources.json`.

## Later procedural generation

Use authored rooms and corridors only after the first compact map feels good. A future assembler should connect entrance sockets, preserve at least two routes, keep arrival sites beyond the initial camera, validate ground/flying reachability and deployment masks, and test seeds for choke points. This is a backlog stretch goal; do not generate random walls before the hand-authored golden path is verified.
