# Action feedback audit

Local checkpoint: every discrete menu/planning action should acknowledge success or explain rejection. Audio cues follow the effects slider and global mute. Voice lines remain separate.

| Action | Visual feedback | Audio |
| --- | --- | --- |
| Menu focus / deployment cursor | focus outline / grid cursor | WARC_14_3 cursor cue, throttled 65 ms |
| Hero / party selection | selected card; party add/remove toast | confirmation + available selection voice |
| Deployment confirmation | unit placed, automatic next selection, toast | confirmation |
| Outside / occupied placement; incomplete army | explanatory native toast | rejection, throttled 450 ms |
| Q/E character switch | portrait / stats / controlled hero update + toast | confirmation + selection voice |
| F equipment switch | equipment rows / equipped icon + toast | confirmation; rejection during action |
| Attack | action animation, slash / projectile, cooldown bar | weapon-specific effect |
| Attack during recovery | native explanation, existing readiness bar | rejection, throttled 450 ms |
| Heal | green ring and restored HP text | Heal effect |
| Heal without patient | explains lack of wounded ally in range | rejection |
| Damage / death | flash, HP change, unit removal / control transfer | damage / death effect and available voice |
| Pause / resume | overlay / state + toast | confirmation |
| Win / lose | result panel | confirmation / rejection pending dedicated verified result sounds |

No sound on every animation frame or automatic cursor advance; no repeated sound while holding attack. Continuous battlefield footsteps remain deferred to avoid multiplying noise across NPCs. WARC_14_3 is user-confirmed as a starting cursor cue; confirmation/rejection variants are provisional, not verified exact matches to the reference video.

Review next: dedicated verified accept/cancel/error/result clips; contextual tutorial for healing; telegraphed flank pushes rather than merely higher HP. Tight hand-authored maps remain the immediate priority; procedural generation should preserve tested entrance widths, guard coverage, and travel time.
