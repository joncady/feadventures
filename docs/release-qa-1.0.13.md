# Local 1.0.13 review

Release 1.0.13 approved for publishing on October 11, 2026.

## Completion and progression (#74)

Phaser-native Results makes victory explicit before progression. It shows the fulfilled objective, elapsed battle time, kills, pickup gold/completion reward and each member's XP/levels/health. Continue accepts once; a held battle Space must be released before confirming. Earned rewards/progression are checkpointed once with pending Results, so reload → Resume returns to the summary. Acceptance advances/heals exactly once.

The header states the current objective and wave/reinforcement countdown. Road escape, timed village defense and commander victories retain their existing goals; current maps are not falsely labeled defeat-all. Future defeat-all configuration waits for active and scheduled enemies. Earlier attackers remain when a commander enters, and entry respects the hostile cap. See [mission flow](mission-completion-flow.md).

Results music uses the existing menu `purpose.mp3` recording and honors existing music settings. It is not claimed as a dedicated Awakening victory theme; that audio remains a separate follow-up.

## Small feedback fixes (#76–#79)

Health pickup feedback shows the actual restored amount as a green number beside the hero; the physical 88 → 100 HP fixture renders +12 in #a2ffc3. Dodge uses ↷ with a quiet existing cursor cue instead of text. Expired native notices clear their text as well as visibility and stay hidden through state updates.

Gold remains collectible/persistent and appears briefly beside the hero on pickup. The permanent combat treasury display is hidden because gold is spent in preparations; shop prices and Results reward totals retain gold icons/numbers.

## Checks

- 51 unit tests passed; final TypeScript and production build passed.
- Fresh release audit: all 97 browser checks passed in 8.5 minutes on the final combined source, in CI mode with one worker. All 51 unit tests, TypeScript and production build passed again.
- After the final bounded gold-counter visibility change and future defeat-all reason correction, all 12 affected gold/HUD/feedback/results/selection browser checks passed; final build/typecheck passed. No full-suite repeat was needed for the visibility change.
- Independent review at 600/809/1039/1440 CSS px, DPR2 found no Results overlap. Four members included Robin (Female), Frederick and fallen Lissa. Native Resume/Enter and duplicate continuation preserved treasury exactly. See [independent review](completion-flow-independent-review.md).
- Fresh repo preview on 127.0.0.1:5173 shows HTML v1.0.13 and native registry 1.0.13; no page errors. A real physical gold pickup produced 31 and the persistent counter remained hidden. A physical health pickup produced green +12.

The transition/objective tests use controlled battle boundaries; these checks do not claim a new natural four-map playthrough or exact audio-identity audition. Commander-entry pressure should be assessed in the next natural Castle/Keep playthrough. The visual captures use spawned pickup/result fixtures and pause AI/time for stable screenshots, not fabricated playthrough evidence.

## Current preview evidence

[Combat gold HUD hidden](playtests/completion-1.0.13/gold-hidden-battle-1.0.13.png) · [Green health pickup](playtests/completion-1.0.13/health-pickup-1.0.13.png) · [Results on fresh local 1.0.13](playtests/completion-1.0.13/results-local-1.0.13.png)
