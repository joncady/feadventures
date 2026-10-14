# First-battle controls proposal

Status: interactive mockup for blind review. No production source, version, or persistence changed.

Open `docs/playtests/first-time-controls-proposal/mockup.html`. Click Next/Back/Skip; toggle Desktop instructions, Staff, or Solo to review context-specific steps. The screenshot background is an existing v1.1.9 review capture; final implementation uses current live geometry from TouchControls rather than screenshot coordinates. HTML is a review artifact only. Production remains Phaser native.

## Smallest useful design

Pause before the first battle begins, dim the battlefield, outline one relevant control, and show one short sentence on a sourced parchment card. Visible “Battle paused” status prevents a false urgency. Skip is available at every step; last Next becomes Begin battle. No practice requirement or midcombat interruption. Default six steps: Move, Aim & attack, Switch hero, Switch weapon, Call for help, Guard. A seventh Heal step appears only with a staff equipped. Solo omits companion switching and Rally; one-weapon loadouts omit weapon switching. Desktop uses current remapped key labels rather than misleading touch outlines.

Text:
- Move: Drag the left stick to move.
- Aim & attack: Hold and drag the right stick toward your target to attack.
- Switch hero: Tap either arrow to control the previous or next living party member.
- Switch weapon: Tap your weapon icon to cycle this character’s equipped weapons.
- Rally: Tap the flag to rally nearby companions to you. Rally lasts 10 seconds.
- Guard: Hold the shield to block frontal physical attacks. Guard uses stamina.
- Staff: With a staff equipped, tap + to heal yourself. Hold and drag the right stick toward an ally to heal them.

Use existing `ui-parchment` and frame assets, existing font/style, a Phaser Graphics outline, small Next/Back/Skip native buttons, and normal sourced cursor/confirm sounds. Do not author new raster art. Maintain >=44 CSS px touch targets, >=12 CSS px copy, and avoid covering the highlighted control. Screenshot mockup uses static previous-version positions; native final geometry must come from touch-control-layout registry, including staff row reflow and canvas resize.

## Integration / persistence

`src/main.ts` ui-launch currently calls Arena.launchBattle immediately then publishes battle phase. Split this into an intercepted launch request and a single guarded actual launch callback: after valid full deployment, open the guide while Arena remains in deployment/physics paused. Completion or Skip calls launch exactly once. Do not start the battle clock, spawn timers, music battle switch, or launch effect until dismissal. Publishing guide state can display TouchControls visually for mobile but keep it disabled; expose preview visibility separately from setEnabled, which changes touch-overlay-active/input state. Desktop key hints should read keyFor/keyLabel.

Persist only on explicit Skip or final Begin battle: localStorage key `feadventures:first-time-controls:v1`, value `{status:'completed'|'skipped'}`. This is onboarding state, separate from campaign saves and release version. Reload midway should show again. Storage failure must not block play; use in-memory fallback for this browser session. Clear-save behavior should preserve onboarding unless user selects replay; add Replay quick guide in Pause -> Controls later or in same slice if native panel has room. Replaying from Pause must preserve manual pause and resume only via explicit Resume, unlike first-launch Begin battle.

Modal ownership: set registry guide-open / input-blocked, release held movement/aim/guard, consume keyboard/touch events, and disable underlying buttons to prevent click-through. Keep Next/Skip outside active wheel hit areas. On rotation, orientation gate owns pause until landscape returns; no inadvertent unpause. Reset all overlay references/step state in scene create; unsubscribe shutdown listeners. Re-render from current CSS scale and device mode. Do not mark completion on scene shutdown or accidental Escape; Escape may Skip only with explicit copy/confirmation policy.

## Acceptance checks after blind review approval

1. Fresh browser -> deploy -> guide; no clock/spawns/health loss during guide; Next/Back works; Begin starts one battle.
2. Skip on first step persists; next battle/reload does not show. Complete persists likewise. Reload midway still shows.
3. Solo, one weapon, staff equipped, and no staff produce correct steps. No invisible Heal control highlighted.
4. Held attack/movement/guard before opening or dismissal cannot leak into combat; Start key released before launch.
5. Desktop current remapped hints; mobile 667x375, 844x390, 932x430, normal header/fullscreen, DPR variation; targets and text readable, highlighted control unobscured.
6. Rotation/manual Pause/replay/scene restart/storage denied preserve intended pause and lifecycle behavior; no stale references.
7. Independent blind reviewer can identify movement, directional attacks, companion switching, weapon switching, Rally, Guard, and staff healing without project history.

## Blind review revisions

First-step Back hidden; Skip explicitly begins battle; one-time/replay explanation always visible. Switch hero uses two independent arrow outlines. Desktop uses a true desktop background and states mouse aiming applies to swords. Guard specifies physical frontal attacks plus stamina on both modes. Staff variant uses a real staff capture with a bright Plus guide-preview overlay: full-health controls are otherwise dimmed nearly invisible, so native tutorial preview should keep disabled controls visually legible without enabling gameplay input. Interactive mockup buttons were exercised by renderer; independent blind assessment is screenshot-only because reviewer browser inventory was unavailable.
