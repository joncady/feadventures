# UI refresh audit — 1.0.13

October 11, 2026. Read-only source/research and existing capture review; no production UI changes, new art, or version bump. Live browser review follows release-agent clearance. We begin from the assumption that the current presentation is insufficient, rather than treating every existing box as a constraint.

## Finding

The game has enough sourced art to look substantially better. Its prototype appearance comes primarily from composition: one parchment texture is stretched into almost every interactive surface, identical navy rectangles hold unrelated information, small labels compete at the same weight, and permanent utility buttons are more visually prominent than combat decisions. Text sharpness fixed rasterization; it did not fix hierarchy, density, or fixed-layout scaling. This is primarily an implementation/design-system problem, with a smaller asset gap around exact Awakening decorative nameplates and cursor art.

## Reference research: what transfers

These are primary publisher/developer references. Design recommendations below are our inference from their described interface structure and reference material, not publisher rules or copied layouts.

| Reference | Verified structure | Transfer to this real-time game |
|---|---|---|
| [Awakening official manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/fire_emblem__awakening_1/ElectronicManual_Nintendo3DS_FireEmblemAwakening_EN.pdf), PDF pages 21–22 and 26–29 | Preparation separates unit choice, map, victory condition and unit count. Battle information offers regular/full detail and contextual icon descriptions. Blue/red/green distinguish faction and action ranges. | Keep objective and party vitality stable; expose inventory/stats on demand. Separate selection from deployment. Adapt dual-screen information to one display rather than duplicating every panel. |
| [Nintendo Triangle Strategy battlefield guide](https://www.nintendo.com/en-ca/whatsnew/tips-for-getting-started-with-triangle-strategy/) | Bottom-screen action order, colored range/threat tiles and lines; detailed target information appears when inspecting a target. | A single stable ability/cooldown area, localized threat/target feedback, minimal normal combat text. Do not add a turn-order bar to a real-time game. |
| [Atlus Unicorn Overlord official system](https://unicornoverlord.atlus.com/), Features / Battlefield / Battle; [official tips PDF](https://unicornoverlord.atlus.com/media/pdf/unicorn_overlord_tips_v2.pdf) | Real-time stage objectives depend on conditions such as defeating the enemy general; unit tactics are prepared ahead of encounters. | Strong phase separation: formation → briefing/preparation → combat → explicit results. The HUD should answer objective, party readiness and next available action. Tips PDF link discovered but exceeds web-tool size limit; do not claim its pages were reviewed. |
| [Nintendo Fire Emblem Engage gallery](https://www.nintendo.com/au/games/nintendo-switch/fire-emblem-engage/) and [official Somniel trailer](https://www.youtube.com/watch?v=oJrItZRyALY) | Battle and between-battle preparation have distinct contexts; publisher exposes battle/map screenshots and home-base preparation. | Give combat and preparation distinct surface density. Publisher screenshots failed image fetch in this session, so no pixel-specific claims about their exact border geometry. |
| [Square Enix Tactics Ogre: Reborn overview](https://www.square-enix-games.com/en_GB/news/tactics-ogre-reborn) | Publisher identifies controls/UI improvements as part of the remake. | Include keyboard navigation, focus and quick comparison in the refresh scope. Page body currently loads sparsely; no unsupported screenshot-specific claims. |

The useful common principle is deliberate information timing. Ornament supports a few focal surfaces; it does not turn each number into a separate framed card. Avoid a generic modern dashboard or importing another game's palette wholesale.

## Current evidence and annotated observations

Existing durable captures are linked rather than altered. Some baseline images predate 1.0.13; source inspection confirms the relevant layout/material choices persist. They establish visual problems, not fresh regression-test claims.

- [Selection baseline](playtests/text-review-menu-1440-dpr2-1.0.10.png): 17 individually gold-framed cards plus gold preview and gold buttons create equal-weight rectangles. Top mode buttons compete with the title; bottom text explains missing flow. Right preview leaves large parchment blank areas. The webpage slogan consumes vertical space before the actual game.
- [Battle baseline](playtests/completion-1.0.13/gold-hidden-battle-1.0.13.png): large opaque party panel, minimap title, center notices, bottom cooldown and player card establish five competing text islands. The fixture's enormous countdown is artificial test data, not a verified user-facing timing bug. The panel shape hierarchy remains a real visual issue.
- [Dialogue baseline](playtests/campaign-dialogue-left.png): two full portraits and bottom box are the strongest existing composition. Keep this direction. Current inactive speaker at .42 alpha is excessively ghostlike; retain opaque silhouette with restrained dark tint. Mission header text over busy map and oversized stretch of medium parchment reduce polish.
- [Results baseline](playtests/completion-1.0.13/results-809-dpr2.png): explicit progression solves the abrupt transition, but a single near-full-screen gold sheet contains several same-weight sentences. Reward, XP and fallen state lack compact visual grouping. Show the earned change with bars/numbers; keep explanatory recovery copy secondary.
- [Pause at 600](playtests/text-review-pause-600-dpr1-1.0.10.png): controls fit, but fit is not readability. Prior independent review measured a 13px logical label at about 8.4 CSS px in this window.
- Source: `InterfaceScene.ts` creates repeated fixed-coordinate surfaces and 10–13px labels; `CampaignScene.ts` uses colored text-background rows for focused shop options. The shop portrait is forced to 125×140 and can distort different portrait proportions. Treat this as a specific visual bug for the shop-refresh slice.

## Assets: sufficient now, gaps to source separately

| Local asset / provenance | Current use | Refresh use |
|---|---|---|
| `asset-library/awakening/80213.png`, [sheet 80213](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/80213/) | Only medium crop x9,y443 to x313,y595 is extracted as `public/assets/ui-parchment.png` and used everywhere. | Use different source frames for dialog, shop and inset panels; avoid compressing the same large border into 28px controls. Candidate exact visible bounds for extraction review: Large approximately x9,y25..x313,y122; extra-large left x9,y170..x313,y379; medium current verified crop; Small approximately x9,y716..x185,y837; Shop x9,y989..x313,y1084; extra-small x9,y1134..x208,y1249. Approximate bounds require pixel/alpha verification before extraction. |
| Existing full portraits + `portrait-face-*` | Party/selection/dialogue | Portrait-led preview and slim party strips. Preserve aspect, use per-character face anchors; do not stretch busts to a universal aspect. |
| `weapon-icons.png`, [486162](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/486162/) | Weapon badges | Unified 16px glyph baseline, 24–32px focused/equipped icons, equipment comparison. |
| `item-icons.png`, [486149](https://www.spriters-resource.com/3ds/fireemblemawakening/asset/486149/) | Items and bullion | Shop and results numbers; verified bullion x96,y176..x112,y192. No persistent gold during combat. |
| Existing FE font and recorded cursor/confirm/reject/advance effects | Text/audio | Retain identity, sharp text texture settings and exactly one sound per accepted action. |

The parchment sheet does not contain exact original navy/gold lozenge nameplates, selection hand, tabs or ornamental icon trays. Do not claim those exist in our assets. Source a suitable verified sheet if exact reproduction is needed. Phaser geometry for layout, shadows, dividers and semantic bars is appropriate; no new custom raster art or AI art is proposed.

## Proposed small visual system

Three surface ranks, not one frame per object:

1. **World/context:** battlefield or restrained sourced menu background; no opaque frame. A quiet scrim can separate overlay screens from map noise.
2. **Information:** compact navy inset (#163443), thin muted gold rule (#aa9569), ivory type (#f3e7c9), 8px inner padding. Party vitality, objective and ability status share this language. Insets should visibly recede relative to main action.
3. **Decision/story:** sourced parchment for the active preview, dialogue and modal; dark brown text (#3f321f). Use source frame proportions and a subtle 2–3px downward shadow. Main affirmative action uses a navy inset and gold edge on parchment; secondary buttons are quiet text/icon rows. Gold saturation appears on focus and earned reward, not every idle card.

Spacing tokens: 4 / 8 / 12 / 16 / 24px. Baseline grid 4px. Standard control height 36px logical; primary 40px. Glyphs native16px or integer multiples, 8px icon-to-label gap. No unmatched emoji as new shipped assets. Suggested type ranks: screen title24–28, character name18–20, primary value16–18, body14–16, tertiary12. Critical gameplay labels must remain readable at target CSS display size; nominal logical font size alone is not acceptance.

Color meaning: ivory normal, gold focus/reward, blue friendly/control, red hostile/danger, green healing. Pair color with a symbol/shape/bar; do not use gold as both warning and selected state. Preserve existing text texture linear filtering and sprite nearest filtering.

States: idle quiet; focus gold edge + sourced cursor if available, otherwise a clear geometric indicator; selected blue/ivory check or numbered slot independently of focus; pressed 1px downward offset and brief tint; disabled dim content plus reason on focus, never only gray text. Input changes focus without double sound. The selected hero and keyboard focus must be separately legible.

Motion proposal: focus response60–90ms; panel entrance140–180ms; confirmation90–120ms; screen crossfade180–240ms; reward fill300–500ms; danger pulse600ms only while relevant. No decorative perpetual breathing on all cards; reduce-motion option should eliminate travel/scale without delaying input.

## Ranked implementation slices

### 1. Party selection + common primitives (highest impact)

Resolve existing #71–73 and phased selection #72 together: title/step indicator `Leader → Companions → Story`; click/confirm leader automatically enters companions; leader tile remains visible but disabled with leader marker. A three-slot selected-party tray makes omissions obvious. Back returns to leader without clearing valid companions. Begin Story is the only primary action; confirm an empty companion party before leaving. No fixed NPC count.

Visual composition: slim header, neutral portrait grid, focused tile edged gold, single parchment preview with large aspect-preserved portrait and 2–3 icon-supported role facts. Bottom tray and primary action align to one baseline. Eliminate mode buttons and instructional paragraph. Keep keyboard traversal and stable roster order.

Acceptance: focus vs leader vs companion distinguishable; all17 names fit; selected count visible; no duplicate input audio; zero companions requires deliberate confirmation. At600px use fewer grid columns and a compact preview instead of shrinking all text.

### 2. Combat HUD + deployment

Slim four portrait/health rows with optional tiny name; hide XP text during ordinary combat and expose detailed card with Info. Objective top-center as icon + short phrase + actual progress/timer. Minimap lighter frame; no persistent long mission copy. Center announcements expire cleanly. Put weapon and cooldown together in one compact strip; retain near-character heal/damage/gold numbers. Audio/fullscreen utilities belong in pause/settings, with only Pause/Menu as small controls during battle. Keep map deployable region clear; use a right/side rail for placement controls only when legal cells remain fully visible.

Acceptance: enemy attack visuals remain visible behind/beside HUD; no occupied deployable cell hidden under a click-intercepting panel; at most one center announcement; ability/rally state readable without sentences. Test all4maps, both expanded/compact Info, all party sizes.

### 3. Shop and preparations

Resolve #69 return to party selection and #70 duplicate switch sound. Show companion portrait tabs/strip, then Equipment and Armory as two clean lists in one decision panel. Use an icon + item name + numeric cost row; focused row shows concise stat delta, equipped marker and transaction result. One dominant Deploy action, secondary Change Party. Preserve portrait aspect. Clarify replacement before spending when inventory full.

### 4. Dialogue, results and pause

Keep two-portrait dialogue; use matching source-sized story frame, restrained active/inactive contrast, speaker nameplate and caret. Results: small victory heading, objective check, three compact summary metrics, four aligned portrait/XP rows, one Continue. Pause uses a short main menu with Controls one secondary view rather than a dense controls slab as first state. No new functionality needed to improve these compositions.

## Audit/QA gate for each slice

Capture menu leader/companions/empty confirmation, dialogue left/right, shop equipped/unaffordable/full inventory, all4deployment maps, battle with hurt/fallen companions, compact/full Info, pause, results. Matrix: widths600/809/1039/1440 at DPR1 and2, height1066; one1440→809→600 live resize and fullscreen roundtrip. Native controls must stay aligned after resize. Test no clipped text, hover/focus parity, equal sound count, portrait proportion/face visibility and background separation. Small-window goal is legibility and reflow, not merely zero overflow. First refresh slice should be user-reviewed before applying every new primitive across all screens.

## First implementation brief: one reviewable slice

Build the common surfaces and party selection first, without changing combat simulation or purchases. Suggested logical896×544 composition: title/step rail at y42–84; portrait roster x32–574, y104–422; selected preview x600–864,y104–422; party tray x32–574,y446–512; Back/Begin Story x600–864,y454–514. Replace17 thick cards with quiet portrait wells; only one focused card gets a strong frame. Preview is the single main parchment surface. Four party slots include leader and three companions; empty slots have a quiet outline/slot number, not a paragraph. The decision action should communicate the current step: `Choose leader` becomes `Begin Story` after entering companions.

At600px CSS width, the fixed896 layout must not simply shrink: use a compact 3-column roster with keyboard scroll focus and a small selected-hero panel; keep party tray and Back/primary action visible. Avoid independently scaling hit zones without display objects. A shared Phaser layout profile should place containers and recompute text wrap lengths, while Arena/world dimensions remain unchanged. At809px+, use the two-column roster/preview composition. Precise breakpoint must be verified against actual canvas CSS width, not just window width.

Combat follow-up area budget: proposed slim party rows164×112 logical versus current192×150 (about36%less panel area), a short280×28 objective, no default bottom-right detailed card, and one approximately240×28 weapon/cooldown strip. Inspecting stats should be deliberate and freeze/pause combat or avoid hiding nearby danger. This is a proposal requiring user review, not a claimed implemented improvement. Important figures get enough room; the goal is fewer opaque surfaces, not shrinking every label.

A useful approval comparison is the existing selection screenshot beside the new phased selection at809 and1440, then600 legibility. Ask the reviewer whether phase, focused hero, selected party and next action are immediately apparent before extending the style to every screen. No need to source more decorative assets before this first slice.

## Fresh 1.0.13 browser evidence

After release full-suite clearance, one isolated Chromium browser captured18 current states at DPR2. Selection and shop cover600/809/1039/1440 window widths; two dialogue speakers, all4mission deployments, native Enter auto-placement/R battle launch, pause and final results cover1039. No page errors. Captures are in `playtests/industry-ui-audit/`; `capture-report.json` records scope. This is a representative visual audit, not the future full regression matrix or a natural campaign win. Later-map/result runtime shortcuts were used to expose screens; battle launch and pause used native controls. The first incorrect pre-launch combat capture was overwritten by a native-launch repeat.

- [Selection at600](playtests/industry-ui-audit/selection-600.png): fixed five-column layout persists with tiny names, multiple mode buttons and Review battlefield. This confirms #71–73/#72 remain actual pending work, not only stale baseline captures.
- [Shop at1039](playtests/industry-ui-audit/shop-1039.png): giant mission banner and shop frame have almost the same visual weight; empty center area and plain pale option rectangles flatten the screen. Equipment choice has no clear stat comparison. Existing icons are useful and should remain.
- [Keep battle at1039](playtests/industry-ui-audit/battle-keep-1039.png): five gold utility buttons compete with objective; large party/info panels show redundant HP/level/XP. Compact row + inspect-on-demand is a clear improvement opportunity.
- [Dialogue](playtests/industry-ui-audit/dialogue-right-1039.png): inactive Chrom is ghostlike over highly noisy forest. Use a quieter sourced context/backdrop and darkened opaque portrait, retaining current active portrait prominence.
- [Pause](playtests/industry-ui-audit/pause-1039.png): controls are legible at1039 but every pause begins with a dense reference chart. Header behind pause reverts to `Battle · Defeat all four camps` even on Keep commander objective. Pause also says Mouse aims ranged attacks, while melee now supports directional aim. These are small copy/state bugs; verify and track in the next slice rather than delaying the release.
- [Final results](playtests/industry-ui-audit/results-1039.png): “Full health restored before the next mission” appears beside Finish campaign. Filed as [#80](https://github.com/joncady/feadventures/issues/80). The synthetic0:00/0defeated is the audit shortcut, not a gameplay bug.

No extra asset collection is necessary before the first phased-selection/common-surface slice. All captures and the audit document remain local follow-up artifacts; production UI/source did not change during this audit.
