import type {Hero} from './config';
export type RallyVoice={key:string;file:string;indexedPath:string;durationMs:number};
// User-selected cut-ins; exact dialogue has not been transcribed by this agent.
export const RALLY_VOICES:Partial<Record<Hero,readonly RallyVoice[]>> = {
  "chrom": [
    {
      "key": "voice-chrom-rally-1-1",
      "file": "audio/chrom-rally-1-1.wav",
      "indexedPath": "audio-review/399888/421-SE_VOICE_CHROM_CUTIN1_1.wav",
      "durationMs": 970
    },
    {
      "key": "voice-chrom-rally-1-2",
      "file": "audio/chrom-rally-1-2.wav",
      "indexedPath": "audio-review/399888/422-SE_VOICE_CHROM_CUTIN1_2.wav",
      "durationMs": 1220
    },
    {
      "key": "voice-chrom-rally-1-3",
      "file": "audio/chrom-rally-1-3.wav",
      "indexedPath": "audio-review/399888/423-SE_VOICE_CHROM_CUTIN1_3.wav",
      "durationMs": 1158
    },
    {
      "key": "voice-chrom-rally-2-1",
      "file": "audio/chrom-rally-2-1.wav",
      "indexedPath": "audio-review/399888/424-SE_VOICE_CHROM_CUTIN2_1.wav",
      "durationMs": 1314
    }
  ],
  "lucina": [
    {
      "key": "voice-lucina-rally-1-1",
      "file": "audio/lucina-rally-1-1.wav",
      "indexedPath": "audio-review/399888/2081-SE_VOICE_MARTH_CUTIN1_1.wav",
      "durationMs": 1095
    },
    {
      "key": "voice-lucina-rally-1-2",
      "file": "audio/lucina-rally-1-2.wav",
      "indexedPath": "audio-review/399888/2082-SE_VOICE_MARTH_CUTIN1_2.wav",
      "durationMs": 1126
    },
    {
      "key": "voice-lucina-rally-1-3",
      "file": "audio/lucina-rally-1-3.wav",
      "indexedPath": "audio-review/399888/2083-SE_VOICE_MARTH_CUTIN1_3.wav",
      "durationMs": 1408
    },
    {
      "key": "voice-lucina-rally-2-1",
      "file": "audio/lucina-rally-2-1.wav",
      "indexedPath": "audio-review/399888/2084-SE_VOICE_MARTH_CUTIN2_1.wav",
      "durationMs": 1252
    }
  ],
  "frederick": [
    {
      "key": "voice-frederick-rally-1-1",
      "file": "audio/frederick-rally-1-1.wav",
      "indexedPath": "audio-review/399888/1096-SE_VOICE_FREDERIK_CUTIN1_1.wav",
      "durationMs": 532
    },
    {
      "key": "voice-frederick-rally-1-2",
      "file": "audio/frederick-rally-1-2.wav",
      "indexedPath": "audio-review/399888/1097-SE_VOICE_FREDERIK_CUTIN1_2.wav",
      "durationMs": 1439
    },
    {
      "key": "voice-frederick-rally-1-3",
      "file": "audio/frederick-rally-1-3.wav",
      "indexedPath": "audio-review/399888/1098-SE_VOICE_FREDERIK_CUTIN1_3.wav",
      "durationMs": 845
    },
    {
      "key": "voice-frederick-rally-2-1",
      "file": "audio/frederick-rally-2-1.wav",
      "indexedPath": "audio-review/399888/1099-SE_VOICE_FREDERIK_CUTIN2_1.wav",
      "durationMs": 1502
    }
  ],
  "virion": [
    {
      "key": "voice-virion-rally-1-1",
      "file": "audio/virion-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3531-SE_VOICE_VIAUR_CUTIN1_1.wav",
      "durationMs": 2065
    },
    {
      "key": "voice-virion-rally-1-2",
      "file": "audio/virion-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3532-SE_VOICE_VIAUR_CUTIN1_2.wav",
      "durationMs": 1815
    },
    {
      "key": "voice-virion-rally-1-3",
      "file": "audio/virion-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3533-SE_VOICE_VIAUR_CUTIN1_3.wav",
      "durationMs": 626
    },
    {
      "key": "voice-virion-rally-2-1",
      "file": "audio/virion-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3534-SE_VOICE_VIAUR_CUTIN2_1.wav",
      "durationMs": 1533
    },
    {
      "key": "voice-virion-rally-2-1-alt",
      "file": "audio/virion-rally-2-1-alt.wav",
      "indexedPath": "audio-review/399888/3535-SE_VOICE_VIAUR_CUTIN2_1_ALT.wav",
      "durationMs": 1752
    }
  ],
  "sumia": [
    {
      "key": "voice-sumia-rally-1-1",
      "file": "audio/sumia-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3078-SE_VOICE_SMIA_CUTIN1_1.wav",
      "durationMs": 1001
    },
    {
      "key": "voice-sumia-rally-1-2",
      "file": "audio/sumia-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3079-SE_VOICE_SMIA_CUTIN1_2.wav",
      "durationMs": 782
    },
    {
      "key": "voice-sumia-rally-1-3",
      "file": "audio/sumia-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3080-SE_VOICE_SMIA_CUTIN1_3.wav",
      "durationMs": 1189
    },
    {
      "key": "voice-sumia-rally-2-1",
      "file": "audio/sumia-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3081-SE_VOICE_SMIA_CUTIN2_1.wav",
      "durationMs": 939
    }
  ],
  "morgan": [
    {
      "key": "voice-morgan-rally-1-1",
      "file": "audio/morgan-rally-1-1.wav",
      "indexedPath": "audio-review/399888/1911-SE_VOICE_MARC_M_CUTIN1_1.wav",
      "durationMs": 1345
    },
    {
      "key": "voice-morgan-rally-1-2",
      "file": "audio/morgan-rally-1-2.wav",
      "indexedPath": "audio-review/399888/1912-SE_VOICE_MARC_M_CUTIN1_2.wav",
      "durationMs": 782
    },
    {
      "key": "voice-morgan-rally-1-3",
      "file": "audio/morgan-rally-1-3.wav",
      "indexedPath": "audio-review/399888/1913-SE_VOICE_MARC_M_CUTIN1_3.wav",
      "durationMs": 688
    },
    {
      "key": "voice-morgan-rally-2-1",
      "file": "audio/morgan-rally-2-1.wav",
      "indexedPath": "audio-review/399888/1914-SE_VOICE_MARC_M_CUTIN2_1.wav",
      "durationMs": 688
    }
  ],
  "cordelia": [
    {
      "key": "voice-cordelia-rally-1-1",
      "file": "audio/cordelia-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3257-SE_VOICE_TIAMO_CUTIN1_1.wav",
      "durationMs": 1314
    },
    {
      "key": "voice-cordelia-rally-1-2",
      "file": "audio/cordelia-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3258-SE_VOICE_TIAMO_CUTIN1_2.wav",
      "durationMs": 1126
    },
    {
      "key": "voice-cordelia-rally-1-3",
      "file": "audio/cordelia-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3259-SE_VOICE_TIAMO_CUTIN1_3.wav",
      "durationMs": 907
    },
    {
      "key": "voice-cordelia-rally-2-1",
      "file": "audio/cordelia-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3260-SE_VOICE_TIAMO_CUTIN2_1.wav",
      "durationMs": 907
    }
  ],
  "lissa": [
    {
      "key": "voice-lissa-rally-1-1",
      "file": "audio/lissa-rally-1-1.wav",
      "indexedPath": "audio-review/399888/1719-SE_VOICE_LIZ_CUTIN1_1.wav",
      "durationMs": 1408
    },
    {
      "key": "voice-lissa-rally-1-2",
      "file": "audio/lissa-rally-1-2.wav",
      "indexedPath": "audio-review/399888/1720-SE_VOICE_LIZ_CUTIN1_2.wav",
      "durationMs": 1220
    },
    {
      "key": "voice-lissa-rally-1-3",
      "file": "audio/lissa-rally-1-3.wav",
      "indexedPath": "audio-review/399888/1721-SE_VOICE_LIZ_CUTIN1_3.wav",
      "durationMs": 1314
    },
    {
      "key": "voice-lissa-rally-2-1",
      "file": "audio/lissa-rally-2-1.wav",
      "indexedPath": "audio-review/399888/1722-SE_VOICE_LIZ_CUTIN2_1.wav",
      "durationMs": 1439
    }
  ],
  "lonqu": [
    {
      "key": "voice-lonqu-rally-1-1",
      "file": "audio/lonqu-rally-1-1.wav",
      "indexedPath": "audio-review/399888/2776-SE_VOICE_RONKUU_CUTIN1_1.wav",
      "durationMs": 1158
    },
    {
      "key": "voice-lonqu-rally-1-2",
      "file": "audio/lonqu-rally-1-2.wav",
      "indexedPath": "audio-review/399888/2777-SE_VOICE_RONKUU_CUTIN1_2.wav",
      "durationMs": 1064
    },
    {
      "key": "voice-lonqu-rally-1-3",
      "file": "audio/lonqu-rally-1-3.wav",
      "indexedPath": "audio-review/399888/2778-SE_VOICE_RONKUU_CUTIN1_3.wav",
      "durationMs": 939
    },
    {
      "key": "voice-lonqu-rally-2-1",
      "file": "audio/lonqu-rally-2-1.wav",
      "indexedPath": "audio-review/399888/2779-SE_VOICE_RONKUU_CUTIN2_1.wav",
      "durationMs": 1220
    }
  ],
  "miriel": [
    {
      "key": "voice-miriel-rally-1-1",
      "file": "audio/miriel-rally-1-1.wav",
      "indexedPath": "audio-review/399888/2156-SE_VOICE_MYRIEL_CUTIN1_1.wav",
      "durationMs": 1345
    },
    {
      "key": "voice-miriel-rally-1-2",
      "file": "audio/miriel-rally-1-2.wav",
      "indexedPath": "audio-review/399888/2157-SE_VOICE_MYRIEL_CUTIN1_2.wav",
      "durationMs": 2065
    },
    {
      "key": "voice-miriel-rally-1-3",
      "file": "audio/miriel-rally-1-3.wav",
      "indexedPath": "audio-review/399888/2158-SE_VOICE_MYRIEL_CUTIN1_3.wav",
      "durationMs": 1533
    },
    {
      "key": "voice-miriel-rally-2-1",
      "file": "audio/miriel-rally-2-1.wav",
      "indexedPath": "audio-review/399888/2159-SE_VOICE_MYRIEL_CUTIN2_1.wav",
      "durationMs": 1564
    }
  ],
  "ricken": [
    {
      "key": "voice-ricken-rally-1-1",
      "file": "audio/ricken-rally-1-1.wav",
      "indexedPath": "audio-review/399888/1660-SE_VOICE_LICHT_CUTIN1_1.wav",
      "durationMs": 1126
    },
    {
      "key": "voice-ricken-rally-1-2",
      "file": "audio/ricken-rally-1-2.wav",
      "indexedPath": "audio-review/399888/1661-SE_VOICE_LICHT_CUTIN1_2.wav",
      "durationMs": 1189
    },
    {
      "key": "voice-ricken-rally-1-3",
      "file": "audio/ricken-rally-1-3.wav",
      "indexedPath": "audio-review/399888/1662-SE_VOICE_LICHT_CUTIN1_3.wav",
      "durationMs": 782
    },
    {
      "key": "voice-ricken-rally-2-1",
      "file": "audio/ricken-rally-2-1.wav",
      "indexedPath": "audio-review/399888/1663-SE_VOICE_LICHT_CUTIN2_1.wav",
      "durationMs": 1189
    }
  ],
  "stahl": [
    {
      "key": "voice-stahl-rally-1-1",
      "file": "audio/stahl-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3201-SE_VOICE_SORT_CUTIN1_1.wav",
      "durationMs": 1126
    },
    {
      "key": "voice-stahl-rally-1-2",
      "file": "audio/stahl-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3202-SE_VOICE_SORT_CUTIN1_2.wav",
      "durationMs": 501
    },
    {
      "key": "voice-stahl-rally-1-3",
      "file": "audio/stahl-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3203-SE_VOICE_SORT_CUTIN1_3.wav",
      "durationMs": 1189
    },
    {
      "key": "voice-stahl-rally-2-1",
      "file": "audio/stahl-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3204-SE_VOICE_SORT_CUTIN2_1.wav",
      "durationMs": 626
    }
  ],
  "sully": [
    {
      "key": "voice-sully-rally-1-1",
      "file": "audio/sully-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3141-SE_VOICE_SOIREE_CUTIN1_1.wav",
      "durationMs": 1314
    },
    {
      "key": "voice-sully-rally-1-2",
      "file": "audio/sully-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3142-SE_VOICE_SOIREE_CUTIN1_2.wav",
      "durationMs": 1690
    },
    {
      "key": "voice-sully-rally-1-3",
      "file": "audio/sully-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3143-SE_VOICE_SOIREE_CUTIN1_3.wav",
      "durationMs": 970
    },
    {
      "key": "voice-sully-rally-2-1",
      "file": "audio/sully-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3144-SE_VOICE_SOIREE_CUTIN2_1.wav",
      "durationMs": 1189
    }
  ],
  "tharja": [
    {
      "key": "voice-tharja-rally-1-1",
      "file": "audio/tharja-rally-1-1.wav",
      "indexedPath": "audio-review/399888/2831-SE_VOICE_SALLYA_CUTIN1_1.wav",
      "durationMs": 1783
    },
    {
      "key": "voice-tharja-rally-1-2",
      "file": "audio/tharja-rally-1-2.wav",
      "indexedPath": "audio-review/399888/2832-SE_VOICE_SALLYA_CUTIN1_2.wav",
      "durationMs": 970
    },
    {
      "key": "voice-tharja-rally-1-3",
      "file": "audio/tharja-rally-1-3.wav",
      "indexedPath": "audio-review/399888/2833-SE_VOICE_SALLYA_CUTIN1_3.wav",
      "durationMs": 2034
    },
    {
      "key": "voice-tharja-rally-2-1",
      "file": "audio/tharja-rally-2-1.wav",
      "indexedPath": "audio-review/399888/2834-SE_VOICE_SALLYA_CUTIN2_1.wav",
      "durationMs": 1658
    }
  ],
  "vaike": [
    {
      "key": "voice-vaike-rally-1-1",
      "file": "audio/vaike-rally-1-1.wav",
      "indexedPath": "audio-review/399888/3679-SE_VOICE_WYCK_CUTIN1_1.wav",
      "durationMs": 1033
    },
    {
      "key": "voice-vaike-rally-1-2",
      "file": "audio/vaike-rally-1-2.wav",
      "indexedPath": "audio-review/399888/3680-SE_VOICE_WYCK_CUTIN1_2.wav",
      "durationMs": 1408
    },
    {
      "key": "voice-vaike-rally-1-3",
      "file": "audio/vaike-rally-1-3.wav",
      "indexedPath": "audio-review/399888/3681-SE_VOICE_WYCK_CUTIN1_3.wav",
      "durationMs": 2065
    },
    {
      "key": "voice-vaike-rally-1-3-alt",
      "file": "audio/vaike-rally-1-3-alt.wav",
      "indexedPath": "audio-review/399888/3682-SE_VOICE_WYCK_CUTIN1_3_ALT.wav",
      "durationMs": 1658
    },
    {
      "key": "voice-vaike-rally-2-1",
      "file": "audio/vaike-rally-2-1.wav",
      "indexedPath": "audio-review/399888/3683-SE_VOICE_WYCK_CUTIN2_1.wav",
      "durationMs": 907
    }
  ],
  "robin": [
    {
      "key": "voice-robin-rally-1-1",
      "file": "audio/robin-rally-1-1.wav",
      "indexedPath": "audio-review/406669/225-SE_VOICE_PLAYER_M1_CUTIN1_1.wav",
      "durationMs": 1502
    },
    {
      "key": "voice-robin-rally-1-2",
      "file": "audio/robin-rally-1-2.wav",
      "indexedPath": "audio-review/406669/226-SE_VOICE_PLAYER_M1_CUTIN1_2.wav",
      "durationMs": 813
    },
    {
      "key": "voice-robin-rally-1-3",
      "file": "audio/robin-rally-1-3.wav",
      "indexedPath": "audio-review/406669/227-SE_VOICE_PLAYER_M1_CUTIN1_3.wav",
      "durationMs": 970
    },
    {
      "key": "voice-robin-rally-2-1",
      "file": "audio/robin-rally-2-1.wav",
      "indexedPath": "audio-review/406669/228-SE_VOICE_PLAYER_M1_CUTIN2_1.wav",
      "durationMs": 688
    }
  ],
  "robin-female": [
    {
      "key": "voice-robin-female-rally-2-1",
      "file": "audio/robin-female-rally-2-1.wav",
      "indexedPath": "audio-review/406669/10-SE_VOICE_PLAYER_F1_CUTIN2_1.wav",
      "durationMs": 720
    },
    {
      "key": "voice-robin-female-rally-1-1",
      "file": "audio/robin-female-rally-1-1.wav",
      "indexedPath": "audio-review/406669/7-SE_VOICE_PLAYER_F1_CUTIN1_1.wav",
      "durationMs": 1408
    },
    {
      "key": "voice-robin-female-rally-1-2",
      "file": "audio/robin-female-rally-1-2.wav",
      "indexedPath": "audio-review/406669/8-SE_VOICE_PLAYER_F1_CUTIN1_2.wav",
      "durationMs": 782
    },
    {
      "key": "voice-robin-female-rally-1-3",
      "file": "audio/robin-female-rally-1-3.wav",
      "indexedPath": "audio-review/406669/9-SE_VOICE_PLAYER_F1_CUTIN1_3.wav",
      "durationMs": 1064
    }
  ]
};
