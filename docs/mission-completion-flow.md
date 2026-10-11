# Mission completion flow

Local follow-up to release 1.0.12, tracked by GitHub issue #74.

## Truthful goals

- Bandit Road: survive three ambush phases and reach the eastern exit. Leaving surviving bandits behind is allowed; this is an escape objective, not defeat-all.
- Village Watch: protect the village through three timed attacks. Surviving raiders withdraw at the end.
- Castle Siege: defend until the commander arrives, then defeat that commander. Remaining attackers retreat after their commander falls.
- Black Keep: defeat the commander; remaining guards surrender.

The native header displays the current goal plus the current wave/reinforcement countdown. This is a phase timer, not a promise of an exact mission duration. If a release is still waiting, the header says reinforcements are incoming; a delayed commander says approaching. Neither falsely displays 0:00 as a guaranteed completion time. Pause freezes the battle clock. The existing wave timings and release intervals are preserved.

Commander entry no longer silently erases the previous wave. If the hostile cap is full, entry waits for a free slot. An explicit `defeat-all` condition is available for future maps and requires all active and scheduled enemies to be gone; none of the four current maps claims that objective.

## Results and saves

Victory stops combat and opens a Phaser-native results scene with the fulfilled objective, battle duration, enemies defeated, collected gold, completion reward and each hero's XP/level progress. Enter, Space or Continue deliberately moves to the next mission's dialogue/preparations. A Space key already held from combat must be released before it can confirm. The entry pointer debounce prevents the battle click from immediately accepting results.

Earned members/progression/gold and a pending result are checkpointed once at victory. Resume after reloading opens that pending results screen. Continue clears the pending result, advances once, restores health and writes the next checkpoint; repeated Continue cannot award gold or advance again. Old saves without a pending result remain compatible. Developer jumps continue to preserve the regular campaign save.

## Audio

Results use the existing `music-menu` key, honoring music volume and mute. Its recording is the existing `purpose.mp3`, also used for battle music. This first pass does **not** claim to import or match Awakening's dedicated victory theme. That remains part of audio issue #41. Recorded character/death voices and their settings are unchanged.

## Verification

Focused coverage includes all four mission transitions, real final-wave village readiness with survivors, road exit gating, commander entry retaining attackers and respecting the hostile cap, scheduled/live enemy defeat-all gating, paused countdowns, held Space, reward idempotence, pending-result reload/Resume, and defeat retry preserving the pre-mission checkpoint. Independent window-size review and the full suite are recorded separately once complete.
