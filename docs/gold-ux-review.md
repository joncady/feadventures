# Gold UX — local1.0.5 / issue61

Gold now uses the recognizable bullion stack from the existing Awakening inventory sheet: https://www.spriters-resource.com/3ds/fireemblemawakening/asset/486149/ . Exact source crop [96,176,112,192],16×16px; original transparency retained. `scripts/compose-campaign-maps.py` reproduces it. No new or painted art.

Collection shows a gold-colored +amount above the controlled hero, without a central message. Collections within500ms add into the same popup and share one confirmation sound. Treasury and shop prices use the same icon plus numbers; the battle cooldown text no longer repeats gold.

Uncollected gold lasts20 active battle seconds, fading over its final4 seconds. The lifetime uses the battle clock, so pause and deployment consume no time. Expired gold disappears without modifying treasury. This is initial tuning;20s leaves time to finish a skirmish and collect nearby spoils.

Validation:46 unit tests, strict TypeScript and production build pass; gold browser regression and3 campaign-save/developer checks pass. Gold regression checks actual enemy-death drop lifetime, fade/expiry, aggregated +34 near the hero, absence of central pickup feedback, icon treasury and pause-safe clock. Screenshot: playtests/gold-feedback-1.0.5.png. No commit/push/deploy.
