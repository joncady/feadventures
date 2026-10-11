# Release audit — 1.0.12

Audited October 11, 2026 before the authorized release. This release includes the local 1.0.11 healing indicators and 1.0.12 explicit self-heal control. Completion-flow work is excluded.

- A staff-equipped controlled hero uses Shift + Space to heal themselves and normal Space to heal injured allies. Holding Shift moves the native target ring to the caster, including a gray full-health ring. Releasing Shift restores the ally target.
- A full-health self-heal is rejected without consuming cooldown, healing an ally, or awarding XP. Autonomous companion healing retains its existing targeting and self fallback.
- Native party equipment icons update with F/Q/E; pause controls document the staff shortcut. No DOM HUD or new art was added.
- `npm run check`: 48 unit tests passed; strict TypeScript and production build passed.
- `CI=1 npm run test:e2e -- --reporter=line`: all 90 browser tests passed in 6.3 minutes. Includes native Shift/Space/F/Q/E, autonomous healing, pause, DPR1/DPR2 WebGL/Canvas resize and pointer alignment, save/resume, gold/health pickups, death/Rally audio, and stage navigation.
- `git diff --check` passed. Generated changes to old historical test screenshots were reverted; new healing evidence is retained.

No combat balance or campaign completion changes are included. A standard-party full campaign balance playthrough remains separate from this input/feedback audit.
