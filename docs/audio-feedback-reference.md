# Awakening feedback reference

Reference: [Apotheosis Secret Path Final Turn](https://www.youtube.com/watch?v=qAgGtCCYTs4), ShadowMario3, 3:49. The page loaded and the video played in the browser. Visual review confirms the compact grid selection, unit health bars, a three-dimensional battle cutaway, and parchment phase announcements. Browser observations expose frames and DOM, **not audible audio**, so no waveform or listening match to this recording is claimed.

The downloaded [Battle and Menu Sound Effects archive](https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/401959/) contains `WARC_14_3.wav`. The user identified this as close to the moving-around sound. Its unchanged 0.418-second mono 44.1-kHz WAV now ships as `audio/ui-move.wav`.

| Feedback | Local key | Confidence |
| --- | --- | --- |
| Menu/grid cursor movement | `ui-cursor` | User-selected starting cue; archive identity verified |
| Dialogue page advance | `dialogue-advance` | Unchanged recorded `WARC_14_0.wav`; provisional short noise cue, not an audible reference match |
| Confirm, deploy, equip, swap | `ui-confirm` | Same clip with higher playback pitch; provisional UX treatment |
| Invalid placement/action | `ui-reject` | Same clip with lower playback pitch; provisional UX treatment |
| Back/pause/settings | Cursor or confirmation cue | Shared starting vocabulary, not a verified Awakening match |
| Heal | `heal` | Recorded `WARC_14_3.wav` reused provisionally; not verified as the original healing cue |
| Battle begin | `battle-start` | Existing unchanged `WARC_SYS_FIRST_0.wav` |
| Attack | Existing weapon-specific effects | Existing sword/bow clips and temporary axe/lance/magic effects; no new reference match |
| Damage, death, XP, level up | Existing keys | Existing mappings; no new reference match |

`scripts/prepare-feedback-audio.py` reproduces the new clips from the local audition library. `docs/ui-audio-sources.json` records provenance. Distinct archive confirmation, cancellation, healing, equip, and phase cues still need an audible audition before replacing these provisional choices. Effects obey the sound-effects volume control; voices remain independently controlled. Continuous walking should not play the cursor sound every frame: use it for deliberate selection/grid movement, and throttle repeat input.

## Dialogue candidate audition

The dialogue route is separate from generic selection/confirmation. `WARC_14_0.wav` and `WARC_14_1.wav` are both 0.197-second clips with similar zero-crossing rate, with `_1` approximately half the RMS amplitude of `_0`. `WARC_14_30.wav` is a 0.174-second alternative with a higher zero-crossing rate. These numerical features suggest short noise textures worth auditioning for paper/page movement; they do **not** establish semantic identity. `_0` ships provisionally, without trimming, synthesis, or device speech. The original audition library remains the authority for replacement; the user can compare `_0`, `_1`, and `_30` before choosing a final cue.
