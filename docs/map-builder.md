# Authoring small campaign maps

`MapChunk` is an authored room or route section: a source image/crop, scale, placement, collision rectangles in local coordinates and named entrance sockets. Keep art source URLs and credits in the asset index. Native HUD shapes are UI; world art is cropped/composed online source pixels.

The east road is the working example, not merely a future interface. `src/game/data/east-road-chunks.ts` contains three modules: west muster, woodland crossing, east ambush. `compose-campaign-maps.py` reads this exact JSON-literal manifest, exports each module and assembles its precomposed background using the same positions. `maps.ts` uses those same modules to assemble runtime collision. Rendering a single precomposed PNG keeps the sprint simple without divorcing collision from authored section positions.

To extend a route:

1. Crop/build a section from credited online tiles at a consistent pixel scale. Add its source to `asset-sources.json` or the index source table.
2. Define its local terrain and west/east (or north/south) entrance sockets.
3. Use `connectChunk(existing, 'road-east', next, 'road-west')` to align entrances, then add the resulting chunk to the layout.
4. Run `validateLayout(layout)` before rendering; `assembleTerrain(layout)` transforms local collision using placement and scale.
5. Put deployment, objective, guard posts and ambush sites in `MapDefinition`. Check ground paths as well as flight shortcuts, and test with real movement.
6. Recompose backgrounds, run `tests/maps.test.ts`, and visually verify source crop seams and collision.

The first route's three chunks have matching edge sockets at the east-west road center. Mission 2–4 use authored whole-scene layouts for this first sprint. The API does not yet randomize layouts, ensure graph connectivity or infer collision from art; those remain explicit future work in #43. This avoids presenting random generation as complete.

Mission one is a 1280×544 route, matching the battle camera height. Its source-composed forest banks bound a 288px central ground corridor, with four short bank protrusions narrowing local lanes. West deployment remains connected to all four authored ambush sites and each eastward checkpoint; concealed side-entry candidates are legal at both road ends. It has no NPC soldiers, while missions two through four retain their four guards. The same three-chunk JSON manifest drives both the forest artwork and runtime collision.

Mission two uses `village-layout.ts` as the shared authored manifest for a compact 1024×704 defended village. A 320×192 deployment square surrounds the central camp. Four sourced houses and forest boundaries prevent wandering through empty corners while leaving six legal ambush entries and connected approaches. All four NPC guard posts remain near the square, and the original three-wave cadence/budget is preserved. `compose-campaign-maps.py` reads the same manifest for source-pixel roads, houses, and forest banks.

Black Keep (local1.0.6) now uses three connected authored modules from `black-keep-chunks.ts`: south entry hall, middle guard hall, north throne room. The composition script crops the existing credited Stronghold sheet into16px stone slabs, raised wall bricks, columns, carpet and throne, then enlarges at2× (32px terrain tiles, matching road/village). It exports each room and a assembled runtime PNG; the latter is a build output, not a resized screenshot of someone else's full map. Shared local terrain rectangles place visible walls and drive collision. Doorways are320px wide, and all deployment cells/camp centers reach the boss. No decorative chest tiles or invisible breakable gates remain. Authored chunk sockets connect rooms; randomized generation remains future #43.
