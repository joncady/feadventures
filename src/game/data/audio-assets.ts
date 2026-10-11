import {RALLY_VOICES} from './rally-voices';
export const AUDIO_ASSETS = [
  ...Object.values(RALLY_VOICES).flatMap(clips=>clips.map(({key,file})=>({key,file}))),
  // Recorded short noise cue; dialogue/page-turn identity awaits an audible audition.
  { key: "dialogue-advance", file: "audio/dialogue-advance.wav" },
  // Cursor clip chosen by the user; confirmation/rejection are provisional pitch variants.
  { key: "ui-cursor", file: "audio/ui-move.wav" },
  { key: "ui-confirm", file: "audio/ui-move.wav" },
  { key: "ui-reject", file: "audio/ui-move.wav" },
  { key: "heal", file: "audio/ui-move.wav" },
  {
    "key": "voice-chrom-attack",
    "file": "audio/chrom-attack.wav"
  },
  {
    "key": "voice-chrom-damage",
    "file": "audio/chrom-damage.wav"
  },
  {
    "key": "voice-chrom-death",
    "file": "audio/chrom-death.wav"
  },
  {
    "key": "voice-chrom-select",
    "file": "audio/chrom-select.wav"
  },
  {
    "key": "voice-lucina-attack",
    "file": "audio/lucina-attack.wav"
  },
  {
    "key": "voice-lucina-damage",
    "file": "audio/lucina-damage.wav"
  },
  {
    "key": "voice-lucina-death",
    "file": "audio/lucina-death.wav"
  },
  {
    "key": "voice-lucina-select",
    "file": "audio/lucina-select.wav"
  },
  {
    "key": "voice-frederick-attack",
    "file": "audio/frederick-attack.wav"
  },
  {
    "key": "voice-frederick-damage",
    "file": "audio/frederick-damage.wav"
  },
  {
    "key": "voice-frederick-death",
    "file": "audio/frederick-death.wav"
  },
  {
    "key": "voice-frederick-select",
    "file": "audio/frederick-select.wav"
  },
  {
    "key": "voice-virion-attack",
    "file": "audio/virion-attack.wav"
  },
  {
    "key": "voice-virion-damage",
    "file": "audio/virion-damage.wav"
  },
  {
    "key": "voice-virion-death",
    "file": "audio/virion-death.wav"
  },
  {
    "key": "voice-virion-select",
    "file": "audio/virion-select.wav"
  },
  {
    "key": "voice-sumia-attack",
    "file": "audio/sumia-attack.wav"
  },
  {
    "key": "voice-sumia-damage",
    "file": "audio/sumia-damage.wav"
  },
  {
    "key": "voice-sumia-death",
    "file": "audio/sumia-death.wav"
  },
  {
    "key": "voice-sumia-select",
    "file": "audio/sumia-select.wav"
  },
  {
    "key": "voice-morgan-attack",
    "file": "audio/morgan-attack.wav"
  },
  {
    "key": "voice-morgan-damage",
    "file": "audio/morgan-damage.wav"
  },
  {
    "key": "voice-morgan-death",
    "file": "audio/morgan-death.wav"
  },
  {
    "key": "voice-morgan-select",
    "file": "audio/morgan-select.wav"
  },
  {
    "key": "voice-cordelia-attack",
    "file": "audio/cordelia-attack.wav"
  },
  {
    "key": "voice-cordelia-damage",
    "file": "audio/cordelia-damage.wav"
  },
  {
    "key": "voice-cordelia-death",
    "file": "audio/cordelia-death.wav"
  },
  {
    "key": "voice-cordelia-select",
    "file": "audio/cordelia-select.wav"
  },
  {
    "key": "voice-lissa-attack",
    "file": "audio/lissa-attack.wav"
  },
  {
    "key": "voice-lissa-damage",
    "file": "audio/lissa-damage.wav"
  },
  {
    "key": "voice-lissa-death",
    "file": "audio/lissa-death.wav"
  },
  {
    "key": "voice-lissa-select",
    "file": "audio/lissa-select.wav"
  },
  {
    "key": "voice-lonqu-attack",
    "file": "audio/lonqu-attack.wav"
  },
  {
    "key": "voice-lonqu-damage",
    "file": "audio/lonqu-damage.wav"
  },
  {
    "key": "voice-lonqu-death",
    "file": "audio/lonqu-death.wav"
  },
  {
    "key": "voice-lonqu-select",
    "file": "audio/lonqu-select.wav"
  },
  {
    "key": "voice-miriel-attack",
    "file": "audio/miriel-attack.wav"
  },
  {
    "key": "voice-miriel-damage",
    "file": "audio/miriel-damage.wav"
  },
  {
    "key": "voice-miriel-death",
    "file": "audio/miriel-death.wav"
  },
  {
    "key": "voice-miriel-select",
    "file": "audio/miriel-select.wav"
  },
  {
    "key": "voice-ricken-attack",
    "file": "audio/ricken-attack.wav"
  },
  {
    "key": "voice-ricken-damage",
    "file": "audio/ricken-damage.wav"
  },
  {
    "key": "voice-ricken-death",
    "file": "audio/ricken-death.wav"
  },
  {
    "key": "voice-ricken-select",
    "file": "audio/ricken-select.wav"
  },
  {
    "key": "voice-stahl-attack",
    "file": "audio/stahl-attack.wav"
  },
  {
    "key": "voice-stahl-damage",
    "file": "audio/stahl-damage.wav"
  },
  {
    "key": "voice-stahl-death",
    "file": "audio/stahl-death.wav"
  },
  {
    "key": "voice-stahl-select",
    "file": "audio/stahl-select.wav"
  },
  {
    "key": "voice-sully-attack",
    "file": "audio/sully-attack.wav"
  },
  {
    "key": "voice-sully-damage",
    "file": "audio/sully-damage.wav"
  },
  {
    "key": "voice-sully-death",
    "file": "audio/sully-death.wav"
  },
  {
    "key": "voice-sully-select",
    "file": "audio/sully-select.wav"
  },
  {
    "key": "voice-tharja-attack",
    "file": "audio/tharja-attack.wav"
  },
  {
    "key": "voice-tharja-damage",
    "file": "audio/tharja-damage.wav"
  },
  {
    "key": "voice-tharja-death",
    "file": "audio/tharja-death.wav"
  },
  {
    "key": "voice-tharja-select",
    "file": "audio/tharja-select.wav"
  },
  {
    "key": "voice-vaike-attack",
    "file": "audio/vaike-attack.wav"
  },
  {
    "key": "voice-vaike-damage",
    "file": "audio/vaike-damage.wav"
  },
  {
    "key": "voice-vaike-death",
    "file": "audio/vaike-death.wav"
  },
  {
    "key": "voice-vaike-select",
    "file": "audio/vaike-select.wav"
  },
  {
    "key": "voice-robin-attack",
    "file": "audio/robin-attack.wav"
  },
  {
    "key": "voice-robin-damage",
    "file": "audio/robin-damage.wav"
  },
  {
    "key": "voice-robin-death",
    "file": "audio/robin-death.wav"
  },
  {
    "key": "voice-robin-select",
    "file": "audio/robin-select.wav"
  },
  {
    "key": "voice-robin-female-attack",
    "file": "audio/robin-female-attack.wav"
  },
  {
    "key": "voice-robin-female-damage",
    "file": "audio/robin-female-damage.wav"
  },
  {
    "key": "voice-robin-female-death",
    "file": "audio/robin-female-death.wav"
  },
  {
    "key": "voice-robin-female-select",
    "file": "audio/robin-female-select.wav"
  },
  {
    "key": "archive-effect-1",
    "file": "audio/effect-WARC_EFFECT_1.wav"
  },
  {
    "key": "archive-effect-2",
    "file": "audio/effect-WARC_EFFECT_10.wav"
  },
  {
    "key": "archive-effect-3",
    "file": "audio/effect-WARC_EFFECT_11.wav"
  }
] as const;
