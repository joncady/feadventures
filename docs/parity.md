# v1 → v2 parity checklist

The user approved the current incremental release on 2026-10-10. Full parity remains unfinished; keep subsequent work local and require approval before the next deployment.

The archived v1 source defines the comparison, including mechanics currently disabled by its unfinished canvas conversion. A passing build or a survival smoke test alone does not establish feature parity.

| Behavior | Initial published build | Current local work / remaining gap |
| --- | --- | --- |
| Three hero choices | Present | Present |
| Player health display | Present | Present |
| Enemy health display | Missing | Red bars follow enemies and reflect damage |
| Sword attack sound | Present, loading race possible | Asset loading gate corrected |
| Enemy receives damage sound | Missing | Restored once per successful player strike |
| Player receives damage sound | Present, loading race possible | Asset loading gate corrected |
| Arrow shot sound | Missing | Restored with original asset |
| Player death sound | Missing | Restored with original defeated asset |
| Archer projectiles / retreat | Missing; contact damage only | Restored distance behavior, aimed shots and arrow collisions |
| Directional and attack sprite rows | Missing | Still uses standing-row frames; restore all directions and attack state |
| Two-player keyboard play | Missing | Restore selection limit, independent controls, targeting and all-player defeat |
| GameCube adapter input | Missing | Archived bridge remains; requires hardware verification before parity can be claimed |
| Melee enemy attack behavior | Replaced by contact damage | Implemented timed wind-ups, locked aim, recovery/cooldown and enemy-specific ranges; balance still needs comparison |
| Terrain navigation | Absent in v1; direct pursuit in initial build | Shared navigation field routes around expanded terrain, restricts spawns to reachable areas; archers seek clear shots |
| Combat balance | Changed | Player damage 10 → 35; enemy HP, speeds, wave budgets and attack timing differ; reconcile or explicitly accept |
| Health pickup behavior | Changed | v1 timer-based rare spawn → v2 drops on kill; v2 items expire; reconcile or explicitly accept |
| Stage countdown | Removed | Restore countdown/start gating |
| Wave progression | Present, changed counts | Compare original multiplier/count/spawn decay before accepting |
| Music/fullscreen | Present | Volume icon now starts all audio muted; user-requested change |
| Bottom prototype caption | Present | Removed; user-requested change |
| Restart cleanup | Improved | Keep regression coverage as projectiles and co-op are restored |

Map progression was already disabled in archived v1 (`stages[0]` is hard-coded). Obstacle-aware pathfinding was also absent. These are planned improvements rather than losses of working v1 behavior.

The initial public release was `49ab95e`. The next approved incremental release includes the local fixes above; deployment status is tracked in GitHub Actions. See `combat-roadmap.md` for the expanded and ranked backlog.
