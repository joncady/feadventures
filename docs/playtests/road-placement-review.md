# Native first-road placement fix — 2026-10-11, #51

Reproduced the reported party using ordinary native menu clicks: Chrom, Frederick, Lissa and Miriel. The planning roster originally covered the western legal deployment area and intercepted battlefield mouse input. It now occupies the bottom-right band below the fitted map; damage controls use the bottom middle, preserving the visible map and clickable cells.

Mouse clicks placed Chrom at(96,224), Frederick at(160,224), and Lissa at(224,288). Space placed the automatically selected Miriel at(288,288), and R started battle with all four. No direct runtime placement, HP/time changes or state injection was used. Zero NPC soldiers and no browser errors were observed. Adjacent screenshots show Lissa selected after two placements, all four placed, and battle started.

The native regression also verifies camera world/screen inverse round trips at0.7 planning zoom and the exact chosen deployment coordinates. Cursor snapping now uses actual64px grid centers; the narrowed road supports rows224 and288 instead of clamping an invalid center to320. The initial cursor is snapped consistently. The overview map fits the canvas width; the bottom band now provides deliberate planning controls instead of an overlay over deployable terrain.

Both native mouse placement and WASD/Space placement remain supported; each successful placement automatically selects the next unplaced hero. Verification:41 unit tests, strict TypeScript/production build and all22 relevant road/HUD/campaign/tactical browser regressions passed. No push/deploy.
