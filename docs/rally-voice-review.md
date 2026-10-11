# Randomized rally cut-ins — v1.0.3

User selected `SE_VOICE_CHROM_CUTIN1_1.wav`, then requested randomized cut-ins that work across characters. This supersedes the earlier pending support-dialogue selection. This change uses the user-selected category; the agent has not listened to or transcribed these recordings and does not claim every cut-in explicitly asks for help.

Successful R rally chooses one of the controlled character’s own cut-ins. There are 70 unchanged indexed recordings across 17 voices, including separate male and female Robin. Immediate repeats are avoided when another loaded clip is available. Playback respects voice volume, global mute and the character-voice toggle. The existing 10-second regroup and 20-second cooldown remain. Voice routing additionally throttles 20-second repeat events and protects the recording’s measured duration plus 150ms from attack/damage/selection interruptions; death retains priority. Missing optional rally audio does not block startup and falls back to existing confirmation feedback. Soldiers retain their posts.

Exact filenames, original local index paths, source URLs, duration and SHA-256 are in `rally-audio-sources.json`. Every voice uses CUTIN1_1, CUTIN1_2, CUTIN1_3 and CUTIN2_1, with these source identifiers:

| Character | Indexed voice identifier |
|---|---|
| Chrom | CHROM |
| Lucina | MARTH |
| Frederick | FREDERIK |
| Virion | VIAUR |
| Sumia | SMIA |
| Morgan (male) | MARC_M |
| Cordelia | TIAMO |
| Lissa | LIZ |
| Lon’qu | RONKUU |
| Miriel | MYRIEL |
| Ricken | LICHT |
| Stahl | SORT |
| Sully | SOIREE |
| Tharja | SALLYA |
| Vaike | WYCK |
| Robin (male) | PLAYER_M1 |
| Robin (female) | PLAYER_F1 |

Names have the form `SE_VOICE_<identifier>_CUTIN1_1.wav`, etc. Also included: `SE_VOICE_VIAUR_CUTIN2_1_ALT.wav` and `SE_VOICE_WYCK_CUTIN1_3_ALT.wav`. Female Robin’s original review index lacks a display-name field; PLAYER_F1 ownership matches the existing imported female-Robin audio mapping. No voice is assigned across characters.

Verification: 46 unit tests pass; production typecheck/build pass; 8 focused browser tests pass (new rally audio, existing audio settings, existing rally/urgent-healing behavior). New browser checks exercise real R inputs/repeat rejection, all 17 randomized pools with no immediate repeats, measured-duration protection, muted and zero-volume routes, missing cache, real loader failures and fallback. Browser tests inspect loaded audio buffers and playback requests; they do not establish audible listening. All 70 shipped files match their original indexed SHA-256. `scripts/prepare-rally-audio.py` reproduces them from the existing local inventory without downloads, synthesis or edits to recordings.

Prepared against current dirty local v1.0.2 with issue59 and portrait follow-ups preserved. Version bumped once to 1.0.3 using the repository release command. No commit, push, tag, PR or deployment. Full campaign playback was not rerun for this audio change.
