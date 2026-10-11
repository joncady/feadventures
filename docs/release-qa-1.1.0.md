# Release verification — 1.1.0

October 11, 2026. User approved publishing the four-stage commander, selected-portrait, objective flag, and phone fullscreen containment batch.

- `npm run check`: 67 unit tests passed; TypeScript and production build passed.
- `CI=1 npm run test:e2e`: all 104 browser tests passed using one worker in 7.1 minutes.
- Existing independent commander trials and desktop/phone captures are recorded in `named-commander-independent-review.md`; portrait and objective review is in `selection-objective-independent-review.md`.
- Historical proof screenshots overwritten by the browser sweep were restored; current intentional 1.1.0 evidence remains included.

Phone fullscreen containment restores visibility of the bottom actions. Browser emulation does not replace a physical phone trial, and fixed logical UI targets remain small at short landscape heights. Full campaign balance and larger mobile touch targets remain follow-up work.
