# Road damage and dialogue UX review — 2026-10-11

Ordinary keyboard and mouse controls completed the first road mission in 138.265 seconds (2:18), reaching the genuine village briefing. The party was Morgan/Miriel/Sumia/Virion with no NPC soldiers; time, enemies, HP and campaign state were not altered by the driver.

The first-map enemy damage multiplier increased from 0.65 to 1.10. At the default 50% combat damage setting, a standard soldier hit now deals 6HP instead of 4HP. Player stats, damage and later-map multipliers are unchanged. Miriel dropped to 40HP by 80 seconds and was defeated by 100 seconds; Sumia reached 69HP, while Morgan and Virion stayed healthy. The mission remained beatable, and the existing intermission recovery restored the fallen companion. This is one party/route observation, not a comprehensive balance claim.

Dialogue now uses native portrait conversation presentation with original mission-aware lines and keyboard/pointer advancement. Separate recorded WARC_14_0 dialogue feedback obeys effects volume and immediate mute; its page-turn association is a provisional candidate, not an aurally verified reference match. Generic UI movement continues using WARC_14_3.

Verification: 42 unit tests, TypeScript and production build passed; 8 road/deployment/campaign browser checks, 4 audio settings checks and 1 native dialogue check passed. Local only; no push or deployment.

Evidence: road-danger-natural.log and road-danger-natural-outcome.png record ordinary play. campaign-dialogue-left.png and campaign-dialogue-right.png show final portrait/layout states.
