# Deployment layout review — local 1.0.7

GitHub issues #63, #64, #65.

The former fixed 400×84 panel stacked objective, soldier copy, controls and the 28px Begin button with insufficient spacing. On the rebuilt Black Keep it also intercepted clicks over the south courtyard.

The native Phaser panel now measures wrapped text, uses 12px outer padding, 10px between objective and controls, 16px before actions and 12px between buttons. Redundant soldier explanation is removed. Black Keep uses the unused right gutter (x728, width156); other stages use a 240px left panel, outside their projected courtyards. The roster, damage controls and minimap were also checked against every courtyard.

Auto-place / Enter fills only unplaced heroes, preserving existing positions and NPC posts. It scans legal positions on the same32px cursor lattice, with64px unit separation and existing walkability/flying rules. A64px-only search missed valid cells offset by32px on Black Keep, so the native placement lattice is used. It confirms the placed count and does not start battle; R / Begin remains a separate action gated by completed deployment.

Camp labels were16px world text reduced to11.2px by the planning camera’s0.7 zoom. They now rasterize at3× resolution, use18px source text, two count entries per line and separated anchors. Native interface text also rasterizes at3×; pixel-art sprite/map rendering is retained. No global sprite smoothing or new art.

Focused browser checks pass at809×1066 and1440×1000, device scale factor2: all four map courtyards clear of deployment/roster/damage/minimap overlays; 16px action separation; native Space manual placement preserved; Enter and native mouse Auto-place complete four-hero parties with unique positions; R starts each battle. The Black Keep door/path check also passes. Screenshots: docs/playtests/deployment-spacing-809.png and deployment-spacing-1440.png.

Local only; no commit or push. Final release verification is coordinated by the main agent alongside the directional sword fix.
