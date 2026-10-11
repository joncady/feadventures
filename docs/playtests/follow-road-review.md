# Tight road and companion follow review — 2026-10-11

Normal native mouse/keyboard controls selected Chrom with Virion, Sumia and Lissa, advanced the three briefings/shop/deployment, and started level one. No HP, time, enemies or campaign state was modified. Diagnostics read the already-loaded entrypoint through its actual script URL.

Four800ms right/left reversals moved the leader160→258→160 twice at y288. Companions retained stable individual world-space slots rather than flipping sides with each turn. At rest they were approximately193/155/155pixels from Chrom; all three had zero velocity, and no browser errors occurred. There were exactly three companions and zero NPC soldiers. The authentic settled screenshot and trace are adjacent files.

The map agent independently completed the narrowed1280×544 road through ordinary controls in158.991seconds, with all four heroes surviving and no NPCs. The eastern objective transitioned to the village briefing. Map collision tests confirm ground ambush routes and legal deployment; later maps retain four NPCs.

Implementation: staggered leader observations with48px movement threshold, eased anchors, irregular164–206px offsets tied to each member,88/44px walk/stop hysteresis and slower arrival. Combat/healing targets remain active, flyers remain terrain-independent, and hold-map deployment posts retain their original behavior.

Verification:40 unit checks and production build/typecheck passed. Integrated55 browser checks initially had53passes and two stale fixture failures; all16 targeted HUD/aim/tactical checks passed after deriving the moved planning-control coordinates and polling the short aiming windup more frequently. No gameplay changes were needed for those failures. No push/deploy.
