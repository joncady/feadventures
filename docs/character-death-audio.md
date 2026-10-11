# Recorded character death audio — local 1.0.4

All 17 current heroes already had registered recorded death clips. The source audit confirmed the shipped WAVs are byte-identical to their archive DEAD_1 members. This change adds the missing companion trigger and fixes playback priority/lifecycle; it introduces no generated speech or borrowed-character fallback.

| Hero | Archive member |
| --- | --- |
| chrom | VOICE_SFX_Wav/SE_VOICE_CHROM_DEAD_1.wav |
| lucina | VOICE_SFX_Wav/SE_VOICE_MARTH_DEAD_1.wav |
| frederick | VOICE_SFX_Wav/SE_VOICE_FREDERIK_DEAD_1.wav |
| virion | VOICE_SFX_Wav/SE_VOICE_VIAUR_DEAD_1.wav |
| sumia | VOICE_SFX_Wav/SE_VOICE_SMIA_DEAD_1.wav |
| morgan | VOICE_SFX_Wav/SE_VOICE_MARC_M_DEAD_1.wav |
| cordelia | VOICE_SFX_Wav/SE_VOICE_TIAMO_DEAD_1.wav |
| lissa | VOICE_SFX_Wav/SE_VOICE_LIZ_DEAD_1.wav |
| lonqu | VOICE_SFX_Wav/SE_VOICE_RONKUU_DEAD_1.wav |
| miriel | VOICE_SFX_Wav/SE_VOICE_MYRIEL_DEAD_1.wav |
| ricken | VOICE_SFX_Wav/SE_VOICE_LICHT_DEAD_1.wav |
| stahl | VOICE_SFX_Wav/SE_VOICE_SORT_DEAD_1.wav |
| sully | VOICE_SFX_Wav/SE_VOICE_SOIREE_DEAD_1.wav |
| tharja | VOICE_SFX_Wav/SE_VOICE_SALLYA_DEAD_1.wav |
| vaike | VOICE_SFX_Wav/SE_VOICE_WYCK_DEAD_1.wav |
| robin | Robin_VOICE_SFX_WAV/SE_VOICE_PLAYER_M1_DEAD_1.wav |
| robin-female | Robin_VOICE_SFX_WAV/SE_VOICE_PLAYER_F1_DEAD_1.wav |

Original archives and per-file provenance are recorded in docs/audio-sources.json. Morgan currently uses male MARC_M; a female MARC_F clip exists in the reference archive but there is no female Morgan roster option. Robin male and female use PLAYER_M1 and PLAYER_F1 respectively. Anna is not currently playable: her example is indexed at audio-review/399888/16-SE_VOICE_ANNA_DEAD_1.wav and can be mapped if Anna joins the roster. It is not substituted for another character.

A hero emits death once per battle, for controlled and companion transitions. Simultaneous falls queue their own lines without overlapping; death takes priority over attack/rally/select chatter. Automatic character switching and the final defeat result do not cut off the line. Character-voices enable, voices volume and master mute apply. Muting/disabling/retrying clears queued and current death audio; a new battle resets the per-hero trigger guard.

Shared rally VoiceGate, randomized character-specific calls and cut-in assets were preserved when integrating this change. The version is 1.0.4 because the other completed rally change already used 1.0.3.

Final merged-source verification: 46 unit tests, strict TypeScript and production build passed; 12 relevant browser checks passed (3 death, 4 audio settings, 3 rally voice, 1 version, 1 rally/healing). Controlled fixtures kill the player, two companions, and the last survivor; verify serial playback and settings; and verify actual Web Audio remains playing on defeat and stops on retry. These are regressions, not another natural full-campaign playthrough. Fresh localhost showed v1.0.4 with assets ready and no page errors. Nothing pushed.
