# CI readiness audit

Release baseline: v1.1.5, commit `8002252ff03e30c317789dba434ce6da42e09967`. The successful release run is https://github.com/joncady/feadventures/actions/runs/38334779248. This patch does not change production code or version.

## Confirmed defect

The installed Playwright implementation in `node_modules/playwright-core/lib/coreBundle.js` defaults `waitForFunctionExpression` to the **main world** (line 25672). It calls `predicate()` without awaiting it and checks that result for truthiness (lines 25707–25709). An async predicate returns a truthy Promise immediately. The outer result subsequently adopts that Promise, but a resolved `false` is returned without another polling iteration. This is not an isolated-world or dynamic-import availability defect.

The focused browser regression proves both properties against the installed runtime: a document script's main-world variable is visible; `waitForFunction(async () => false)` resolves false after one invocation. The replacement repeatedly awaits the resolved predicate until it is true.

## Patch

Twenty-four readiness waits across nineteen existing specs now call `waitForAsyncReady`, implemented with awaited `page.evaluate` inside `expect.poll`. Assertions, fixtures, native input, renderer behavior, and global timeout settings are unchanged. The helper uses the configured normal assertion timeout instead of an implicit truthy Promise.

Module entry literals remain consistent with existing fixtures. A partial change to current-document script URLs was rejected in independent review because readiness and fixture mutation could otherwise import different HMR module instances. No HMR instance mismatch is claimed as a demonstrated failure here; a fresh isolated Playwright server is used.

## Validation

- Installed-runtime regression: 1/1 passed, 2.3 seconds total.
- Typecheck passed.
- Diff whitespace check passed.
- Independent serial CI-mode browser review: **12/12 passed in 1.1 minutes**. Covered the runtime contract, actual Black Keep doorway traversal, six campaign behavior cases, native control remapping/capture, and both dual-stick touch cases (including healing, guard, and pause). No source changes during the run. The historical Keep screenshot overwritten by its fixture was restored to HEAD.
- Independent source review approved: all 24 replacements preserve assertions and fixture behavior; native keyboard and touch events remain real. This is focused readiness coverage, not a fresh full-campaign balance or real-phone acceptance.

## Remaining narrow risks

- The pre-existing combat fixture holds Space for a fixed 80 ms before release. Under a stalled software-rendered frame, that hold could miss the update that consumes the key. Change it only if a reproduced failure demonstrates the issue; the remapping fixture already holds attack/rally until an observed native action.
- Short synchronous DOM readiness waits are retained; this defect concerns asynchronous predicates. Other fixed transient waits need case-specific evidence rather than a blanket timeout increase.

Untracked gameplay recordings and pre-existing review images are preserved. No commit, push, production version bump, rendering shortcut, test removal, or blanket timeout expansion is included. Snapshot/transient fixed-count cases require independent evidence before further changes; this audit does not claim to solve every CI reliability issue.
