# CI browser-test sharding

## Measured baseline

The successful [v1.1.0 workflow](https://github.com/joncady/feadventures/actions/runs/38185322773) ran 104 browser tests in **17 minutes 31 seconds** on its Ubuntu runner. Unit tests, typecheck, and production build took 13 seconds; Chromium installation took 18 seconds. The browser suite is the bottleneck. Its former dot reporter and absence of uploaded reports prevent reliable per-test duration reconstruction from this run.

## Local change

The workflow now starts three independent Ubuntu browser jobs alongside the production build. Each browser job runs one Playwright worker and a distinct native `--shard=N/3` partition. One worker per runner retains the software-WebGL game-clock isolation that made the previous suite reliable. File-level sharding preserves existing test fixture/hook semantics; `fullyParallel` is not enabled.

The `deploy` job requires both `build` and the entire `browser-tests` matrix. A failed shard blocks deployment. `fail-fast: false` lets other shards finish and supply diagnostic evidence. Existing branch concurrency cancellation remains enabled. The production artifact is built once; uploading it before test completion does not publish it.

CI now uses the list reporter plus an HTML report, uploads each shard's report/test-results, and retains traces and screenshots for failures. This supplies measured durations for future balancing. No tests are skipped, renderer fidelity reduced, retries added, or game clocks bypassed.

Browser caching is deliberately omitted: its maximum baseline saving is roughly 18 seconds and would not address the 17.5-minute bottleneck.

## Coverage and validation

Before the mobile attack changes, Playwright's JSON collection yielded 104 spec IDs, distributed 35 / 35 / 34 across the three shards. Their union contained exactly the same 104 IDs, with no duplicates or omissions. Distinct suite titles matter: four renderer/DPR tests share one file, line, and leaf title but have distinct IDs.

After the permanent dual-stick and healing/guard regressions were added, final collection yielded **106 IDs**, distributed **38 / 34 / 34**, again exactly once with no omissions. The file-level partition automatically includes new tests; it is not a hardcoded list of files.

The expensive enemy-animation audit, navigation-load suite, and roster audit are on shards 1, 2, and 3 respectively. The renderer/DPR resize matrix shares shard 3 with the roster audit. Counts are not a proof of equal runtime; the new reports will reveal the slowest partition after an authorized push.

YAML parsed successfully, structural assertions verified the three-shard matrix and deploy dependencies, and TypeScript typecheck passed. Representative CI-mode shard invocations over guard/effectiveness, mission-results, and version specs passed all **9 selected tests** (8 in 35.2 seconds on shard 1, zero on shard 2, 1 in 2.3 seconds on shard 3). This small file-level sample is deliberately unbalanced; the full collection above has no empty shards. These checks exercised the exact shard option, one-worker CI configuration, and HTML reporter without a redundant full-suite run.

## Expected improvement and limits

The ideal equal-work browser critical path is approximately 5 minutes 50 seconds, plus job setup. That is an estimate, not a measured remote result. File-level duration imbalance, runner queues, and new tests can make it longer. Three machines use roughly comparable aggregate test minutes with additional setup overhead; the intended benefit is shorter release waiting time, not fewer checks.

Follow [Playwright's sharding documentation](https://playwright.dev/docs/test-sharding) and [CI setup guidance](https://playwright.dev/docs/ci-intro). Reassess the slowest shard from the first release reports before tuning further.
