# Independent shop portrait and control review — local 1.0.15

Reviewed October 11, 2026, against local Vite 5173. Reviewer made no production edits. No commit or push.

Ready for local user review. Bottom portraits are visibly selectable, the active member uses navy/gold, and the corresponding equipment changes correctly. The unavailable leader is visibly dimmed during companion selection. Permanent keyboard legends and the header utility row are quieter; primary actions remain visible.

## Evidence

- Chromium 600, 809, 1039 and 1440px widths, 1066px height, DPR2. Four-member fixture Chrom / Robin (Female) / Lissa / Cordelia. All portraits and names fit, including shortened Robin (F), and Deploy remains separate from the strip. No page errors. [Matrix](playtests/shop-portrait-review/matrix.json).
- Native pointer hover followed by clicking Robin's portrait selects index 1 with exactly one cursor feedback event. Native E selects Lissa with one additional event. Inventory shows Robin's Fire/Iron Sword and compatible offers before changing to Lissa.
- Solo Robin (Male) fixture through live resize 1440 → 809 → 600 → 1039 → 1440 preserves selection and inventory. The full portrait preserves its source aspect. E with one member has no redundant cursor feedback. [Supplementary evidence](playtests/shop-portrait-review/extra.json).
- Native Enter advances leader selection; the unavailable leader tile has alpha 0.52. All five children are dimmed as a unit, preserving the existing star and disabled interaction.
- Deployment still exposes Auto-place and Begin battle, with persistent movement legend hidden. Native P opens Pause with full movement/attack/hero-switch/weapon/rally/self-heal instructions and Resume / Settings / Main menu actions. Native pointer click on Pause Settings opens audio categories and Fullscreen; no shortcut knowledge is required.

## Captures

- [Narrow shop](playtests/shop-portrait-review/shop-600.png)
- [Wide shop](playtests/shop-portrait-review/shop-1440.png)
- [Disabled leader](playtests/shop-portrait-review/leader-disabled.png)
- [Pause controls](playtests/shop-portrait-review/pause-controls.png)
- [Solo narrow shop](playtests/shop-portrait-review/solo-resize-600.png)

This is targeted UI coverage, not a campaign or cross-browser release audit. Secondary shop explanatory copy remains small at 600px because the fixed logical canvas scales down; a responsive shop redesign remains useful later. The portrait strip improves this selection task but does not yet change the large parchment panel's overall composition.
