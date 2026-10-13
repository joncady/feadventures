# Combat HUD refresh proposal — v1.1.5

October 12, 2026. Design proposal only; no runtime, asset, version, or deployment changes. This continues [the industry audit](industry-ui-audit-1.0.13.md), adapting its information hierarchy to the latest approved phone controls. Source measurements below come from `InterfaceScene.ts`; historical phone capture is labeled rather than passed off as fresh v1.1.5 evidence.

## Recommendation

First compact the party panel and disentangle objective, boss, and ability information. Keep the recently accepted control geometry: cooldown at bottom, fullscreen at top right, enlarged right attack stick, commands in two aligned rows of three. Do not move controls again to accommodate cosmetic changes.

The largest gain is removing duplicated labels, not adding ornament. Combat currently shows HP in both text and a bar; every party row also repeats LV/XP. The objective is repeated across header, minimap title, transient notice, and sometimes camp health in the attack cooldown. A boss introduces yet another opaque panel. This makes several unrelated text islands equally prominent.

## Measured baseline and proposed budgets

All dimensions are logical Phaser units in the current 896×544 composition. The budgets are proposals, not completed rendering measurements.

| Overlay | Current | Proposed ordinary combat | Area change |
|---|---:|---:|---:|
| Four-member party background | 192×150 | 146×136 | −31% |
| Commander panel | 256×64 | 216×48 | −37% |
| Minimap terrain | 164×100 | 144×88 | −23% |
| Minimap opaque title strip | 172×20 | Removed; stage number in header | −100% |
| Mobile cooldown | 180×10 plus sentence | Same bounds; equipped weapon glyph + remaining seconds | No position change |

These are overlay bounding rectangles, not a claim of total occluded-screen percentage: alpha, margins, overlap, and actual viewport scaling differ. Keep desktop minimap at164×100 if shrinking it compromises hostile-dot readability. Do not trade usable navigation for an area target.

At 844×390 fullscreen, FIT preserves aspect so the canvas is approximately642×390 and logical-to-CSS scale is0.717. Existing10px party text appears around7.2 CSSpx, regardless of sharp texture backing. Use17px logical for essential compact values (about12.2 CSSpx), and18–20px for current objective/boss name. At667×375 fullscreen scale is0.689, so18px gives12.4 CSSpx. These font estimates apply only to fullscreen gameplay. On the normal mobile page, the retained context header reduces the available canvas height and may lower the FIT ratio further;17–18 logical pixels are not guaranteed to meet12 CSSpx there. Measure actual canvas bounds, not screen width, and adapt font size or compact layout independently for normal-page play. Do not require fullscreen to make essential status readable.

## Slice A: compact party vitality

Keep four vertical rows at the left, where players already look for companions. Each row: the existing sourced face portrait, a long health bar, and one health number. No persistent LV/XP, no HP prefix, no tiny weapon icon unless it conveys an immediate action. Stats and equipment remain in Info; the selected hero’s name can appear once in the existing top status region.

Controlled portrait: restrained gold edge. Injured portrait: warm red edge plus low bar, preserving green/amber/red thresholds. Fallen: darkened portrait and empty bar with an explicit fallen glyph or short label in Info. Identity must not rely on color: controlled border thickness and existing portrait are independent cues. Keep every party member represented, including a one-member party. Do not add a new companion-control action in this slice.

Health changes belong near characters, as already implemented. Companion danger warning should temporarily emphasize the affected row and use a single short name/status cue. Do not run a separate long warning sentence across the battlefield at the same time.

## Slice B: objective hierarchy and commander encounter

The header answers what to do next, not all available facts: existing sourced objective flag + short state, such as `Hold village · 2/3`, or `Gangrel` during the boss. Timer remains compact and accurately follows the real stage clock. Camp/village vitality gets its own narrow bar in the objective region when relevant; remove Camp health from the attack cooldown sentence.

When the commander is active, a slim top-center portrait/name/health strip carries the boss state. Keep one short telegraph state (`Casting` / `Opening`) only while relevant; default `Commander` wastes space. Do not duplicate the boss name in the objective header. Hostile windup geometry and vulnerable opening stay primarily on the battlefield. Keep one transient announcement at a time; expire background and text together, honoring the previous floating-blue-box fix.

## Slice C: abilities and minimap

Bottom cooldown keeps its approved position and width. Existing equipped weapon glyph indicates what is charging, fill indicates readiness, numeric seconds appear only while unavailable. A short recovering cue can remain until source-supported symbol is verified; no invented emoji assets. Rally state belongs beside its existing command or a small icon/value at the party edge, not another permanent sentence.

Minimap keeps red enemies, blue allies, controlled ring, viewport outline, and sourced flag objective. Remove its redundant mission title plate. Thin muted gold edge, with less saturated terrain tint, makes it informative without becoming a second dominant card. Existing minimap projection uses separate x/y scales; changing aspect/bounds must preserve marker/camera alignment. No new zoom/ping feature proposed.

## Materials and assets

Use existing `portrait-face-*`, `weapon-{sword,lance,axe,bow,tome,staff}`, objective flag, and FE font. Use Phaser geometry for bar troughs, a restrained inset scrim, 1px divider, and focus border; these are UI layout, not new raster art. Keep sprites nearest-filtered and text high-resolution/linear-filtered. Avoid stretching the medium parchment frame around every combat element; parchment remains appropriate for Info/Pause decisions, not ordinary vitality strips.

The source [Awakening manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/fire_emblem__awakening_1/ElectronicManual_Nintendo3DS_FireEmblemAwakening_EN.pdf) separates regular/full battle information. The [Triangle Strategy guide](https://www.nintendo.com/en-ca/whatsnew/tips-for-getting-started-with-triangle-strategy/) places details in inspection context. Our inference is to prioritize persistent vitality/action/objective and reserve progression detail for Info, adapting dual-screen design to this single real-time canvas.

## Independent acceptance matrix before release

- Desktop1280×800 and1440×900; landscape phone844×390,932×430,667×375; live resize, normal-page gameplay with the context header retained, and actual fullscreen. Measure both canvas sizes separately; normal-page and fullscreen must both meet critical text/touch minimums, with a responsive compact layout if needed. Portrait remains rotate prompt, not a redesigned playable portrait HUD.
- All four maps; party1/2/4; healthy, wounded, critical, fallen; each controlled character; full/charging/recovering ability; rally active/expired; boss windup/recovery; persistent objective/camp health.
- Record actual CSS font sizes and overlay bounds. Essential values≥12 CSSpx on phone; touch targets≥44 CSSpx. Preserve attack-stick size and ownership, both thumb zones, command-grid alignment, top-right fullscreen, bottom cooldown.
- Show hostile telegraphs and enemies adjacent to every panel; HUD overlays must not hide deployment cells. Deployment is a separate retained layout in this first combat-only slice.
- No added persistent gold or tutorial text; Info/Pause retains full controls and stats. Announcements clear completely; no clipping, overflow, duplicate names, or duplicate sound.

Review decision: approve Slice A first (portrait + bar + health number, remove combat XP/LV text), then objective/boss consolidation. Avoid a simultaneous rewrite of every screen and all mobile controls.

## Fresh source-current evidence

Captured v1.1.5 on an isolated local server after the release work completed:

- [Phone844×390 fullscreen](playtests/combat-hud-proposal/current-phone-844.png)
- [Desktop1280×800 fullscreen](playtests/combat-hud-proposal/current-desktop-1280.png)
- [Overlay-budget visual](playtests/combat-hud-proposal/overlay-budget.svg)

These are layout fixtures, not natural runs: Village, Chrom/Frederick/Lissa/Ricken, autoplace, no enemy releases, leader wounded; capture occurs during the five-second battle opening. Other allies are healthy. Both actual control sticks and aligned2×3 command grid render; the phone canvas uses approximately642px of its844px window. The fresh phone capture makes the tiny HP/XP rows and duplicate opening text explicit. Boss-active layout was source-reviewed above, not newly captured; independent implementation review must include the active boss and all injury states before accepting that slice. The diagram is an explanatory layout budget, not a mocked final art direction or a shipped game asset.
