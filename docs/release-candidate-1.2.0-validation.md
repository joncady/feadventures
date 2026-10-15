# Local release candidate 1.2.0 validation

This candidate remains local. No version bump, commit, push, or deployment was performed by the release validator. Natural full-campaign and physical-phone acceptance are separate gates.

## Final checks

- Complete unit/typecheck/production build: **98/98 unit tests passed**, TypeScript passed, Vite production build passed.
- One complete serial browser run from a frozen source/public/test copy, fresh strict-port5211 server, HMR disabled, and isolated output: **157 passed,2 failed,159 total**,24.4 minutes. This was not a single all-green run after the final fixes.
- Both findings were resolved and verified with focused checks while preserving behavior assertions. The159 cases are covered by the complete run plus these affected reruns.
- Final shop changes additionally passed four native checks covering party return, portrait selection, replacement/migration readability at667px, fullscreen/page transitions, and resizing.

## Findings and repairs

1. A manually constructed browser context wrote the returning-player guide acknowledgement at the default4173 origin rather than the isolated5211 origin. The resulting first-time guide correctly blocked battle controls. Custom contexts now derive the storage origin from the configured test baseURL; header, retry, accessibility, and rotation checks passed in eight affected cases.
2. Classic commander guards had changed from level3 to2 when expanded chapter progression was added. Production compatibility logic now preserves classic level3 and uses chapter-level-plus-one for the expanded campaign. The original tactical assertion passed unchanged.
3. A rapid portrait-to-landscape resize fixture tapped before Phaser’s input transform caught up with CSS canvas fit. It now observes displayScale matching the actual canvas bounds before the native tap. The unchanged fullscreen/pointer assertions passed twice. No phone runtime fix or arbitrary sleep was introduced.
4. Walhart lacked armored/mounted effectiveness metadata. Source now merges commander tags into Arena combat resolution; regression checks verify specialist effectiveness and unchanged ordinary damage.
5. Shop staff summaries disclosed raw cooldowns and forge power rather than actual battle recovery/healing. Summaries now use the member’s speed-adjusted tactical recovery, Fortify’s four-ally cap/healing bonus, and healing gains from staff forging. Final unit checks and four native shop checks passed.

An earlier live-workspace run was discarded as invalid: HMR navigation interrupted state queries and parallel test processes deleted shared artifacts. It supplies no product acceptance conclusions. The frozen run used separate source, result, and report directories. Temporary root test configs were removed and17 overwritten historical tracked captures restored; unrelated recordings and retry images were preserved.

## Remaining acceptance

- Completed: one natural carried-progression ten-chapter route, including the final outcome, as recorded below. Broader combat balance remains open.
- Broader party combinations, solo/no-healer routes, and actual flying-body traversal on every map.
- Human phone play, touch ergonomics, native browser fullscreen behavior, and glyph appearance.

The optional ad-hoc native Walhart damage fixture was discarded after invalid Phaser Text setup; it is not counted as acceptance evidence. Automated unit regression and reviewed Arena metadata integration remain the evidence for that narrow repair.

## Urgent AI healer follow-up

A natural finale attempt exposed companion self-healing starvation: slightly injured allies could always outrank a critically injured caster. The reviewed AI-only correction lets a caster at or below30% HP participate in severity ranking, triggers temporary staff use for that emergency, and keeps healing mode until self HP reaches50% or other urgent patients are cleared. Explicit controlled-player Space still targets allies; Shift+Space remains self-heal.

Four focused native staff/Shift/self/rally tests passed39.3s against refreshed frozen source with isolated output. The complete final unit/typecheck/build check now passes **99/99 unit tests**, superseding the earlier98 count. Natural finale acceptance was verified afterward, as recorded below. Nothing was published.

## Finale pressure follow-up

Only expanded chapter10 ordinary pressure was reduced:24 authored guards, hostile cap8,11-second releases,45-second minimum waves and10-second rests. Guard HP×2.5, damage×1.7, and Validar2200HP are unchanged. The regression verifies boss arrival cannot precede168 seconds. Native launch checks confirm queued releases stay blocked at the cap and resume after one hostile falls.

The final complete unit/typecheck/build check now passes **100/100 unit tests**. Two fresh-story/result/finale native checks passed25.9s; the original classic siege placement/staged guard assertion passed unchanged4.3s. These targeted checks supplement the previous full159-case coverage; no additional complete browser run was claimed. Natural finale completion was verified afterward, as recorded below. No version bump or publication was performed.

## Natural campaign outcome

The carried-progression balanced-party trial has now cleared chapters1–9 and the patched chapter10 finale. The final mission won in240 seconds with26 recorded defeats, against Validar’s unchanged2200HP; Frederick finished at99HP and Ricken at97HP. The actual Results → Continue interaction reached the campaign-complete state. Earlier retries and failures were retained rather than presented as a flawless first attempt.

This establishes one complete natural campaign route with carried progression and the final reviewed fixes. It does not establish balance for every companion combination, solo/no-healer completion, physical-phone acceptance, or broad accessibility certification. The local review server remains http://127.0.0.1:5173/. No version bump, commit, push, or deployment was performed.

## Published release

The user explicitly approved publishing on October14,2026. Frontend/package version is now **1.2.0**. Release implementation commit: `464a344f3c0200dc2925d3968e581a219216d8bb`; final test-only acceptance repair: `91ab60adcc3be41f37c0bece671d603c58648346`.

[Successful complete CI and Pages deployment](https://github.com/joncady/feadventures/actions/runs/38598702607). All three browser shards and the100-test unit/type/build gate passed. Actual public HTTP200 and a fresh844×390 touch-browser load confirmed the servedv1.2.0 badge and `assets/index-CevZ7RuA.js`, with no page errors.

The first release run was blocked by three acceptance-fixture issues: fixed wall-clock Morgan idle sampling aliased frames; a three-size guide case exceeded its aggregate budget; the continuous ten-result-boundary case exhausted60 seconds after nine successful boundaries and tenth Arena readiness. Independently reviewed test-only fixes observe actual animation updates, parameterize the three unchanged guide-size cases, and give only the continuous ten-boundary integration case a120-second CI aggregate budget. No runtime behavior, skips, or assertion weakening was introduced.

Live game: https://joncady.github.io/feadventures/. Choose **New Story** for the ten-chapter route; old saved classic-four campaigns remain on their compatible original route. Human physical-phone acceptance and broader party balance remain open. This publication note was added locally after verification; no further product changes were made.
