import type {MapChunk} from './map-chunks';
export interface ExpansionLayout {id:string;width:number;height:number;style:string;chunks:readonly MapChunk[];roads:readonly (readonly[number,number,number,number])[];houses:readonly (readonly[number,number,number,number])[];carpet:readonly (readonly[number,number,number,number])[];throne:readonly[number,number]|null}
/** Exact source composition and collision manifest, read by compose-expanded-maps.py. */
export const EXPANSION_LAYOUTS = [
 {
  "id": "village-watch",
  "width": 832,
  "height": 640,
  "style": "village",
  "chunks": [
   {
    "id": "village-watch-section-1",
    "source": "public/assets/maps/village-watch-section-1.png",
    "sourceRect": [
     0,
     0,
     832,
     192
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      352,
      96
     ],
     [
      480,
      0,
      352,
      96
     ]
    ],
    "sockets": [
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 416,
       "y": 192
      }
     }
    ]
   },
   {
    "id": "village-watch-section-2",
    "source": "public/assets/maps/village-watch-section-2.png",
    "sourceRect": [
     0,
     0,
     832,
     256
    ],
    "position": {
     "x": 0,
     "y": 192
    },
    "scale": 1,
    "terrain": [
     [
      0,
      32,
      96,
      192
     ],
     [
      736,
      32,
      96,
      192
     ],
     [
      192,
      0,
      64,
      64
     ],
     [
      576,
      0,
      64,
      64
     ],
     [
      192,
      224,
      64,
      32
     ],
     [
      576,
      224,
      64,
      32
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 416,
       "y": 0
      }
     },
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 416,
       "y": 256
      }
     }
    ]
   },
   {
    "id": "village-watch-section-3",
    "source": "public/assets/maps/village-watch-section-3.png",
    "sourceRect": [
     0,
     0,
     832,
     192
    ],
    "position": {
     "x": 0,
     "y": 448
    },
    "scale": 1,
    "terrain": [
     [
      0,
      96,
      352,
      96
     ],
     [
      480,
      96,
      352,
      96
     ],
     [
      192,
      0,
      64,
      32
     ],
     [
      576,
      0,
      64,
      32
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 416,
       "y": 0
      }
     }
    ]
   }
  ],
  "roads": [
   [
    96,
    288,
    640,
    96
   ],
   [
    352,
    96,
    128,
    448
   ],
   [
    352,
    0,
    128,
    640
   ]
  ],
  "houses": [
   [
    192,
    192,
    64,
    64
   ],
   [
    576,
    192,
    64,
    64
   ],
   [
    192,
    416,
    64,
    64
   ],
   [
    576,
    416,
    64,
    64
   ]
  ],
  "carpet": [],
  "throne": null
 },
 {
  "id": "plegian-gate",
  "width": 896,
  "height": 640,
  "style": "stone",
  "chunks": [
   {
    "id": "plegian-gate-section-1",
    "source": "public/assets/maps/plegian-gate-section-1.png",
    "sourceRect": [
     0,
     0,
     896,
     192
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      384,
      32
     ],
     [
      512,
      0,
      384,
      32
     ],
     [
      0,
      32,
      32,
      160
     ],
     [
      864,
      32,
      32,
      160
     ]
    ],
    "sockets": [
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 448,
       "y": 192
      }
     }
    ]
   },
   {
    "id": "plegian-gate-section-2",
    "source": "public/assets/maps/plegian-gate-section-2.png",
    "sourceRect": [
     0,
     0,
     896,
     256
    ],
    "position": {
     "x": 0,
     "y": 192
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      32,
      256
     ],
     [
      864,
      0,
      32,
      256
     ],
     [
      32,
      0,
      288,
      32
     ],
     [
      576,
      0,
      288,
      32
     ],
     [
      32,
      224,
      256,
      32
     ],
     [
      608,
      224,
      256,
      32
     ],
     [
      224,
      96,
      64,
      64
     ],
     [
      608,
      96,
      64,
      64
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 448,
       "y": 0
      }
     },
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 448,
       "y": 256
      }
     }
    ]
   },
   {
    "id": "plegian-gate-section-3",
    "source": "public/assets/maps/plegian-gate-section-3.png",
    "sourceRect": [
     0,
     0,
     896,
     192
    ],
    "position": {
     "x": 0,
     "y": 448
    },
    "scale": 1,
    "terrain": [
     [
      0,
      160,
      384,
      32
     ],
     [
      512,
      160,
      384,
      32
     ],
     [
      0,
      0,
      32,
      160
     ],
     [
      864,
      0,
      32,
      160
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 448,
       "y": 0
      }
     }
    ]
   }
  ],
  "roads": [],
  "houses": [],
  "carpet": [
   [
    384,
    32,
    128,
    576
   ]
  ],
  "throne": null
 },
 {
  "id": "valm-landing",
  "width": 1280,
  "height": 544,
  "style": "landing",
  "chunks": [
   {
    "id": "valm-landing-section-1",
    "source": "public/assets/maps/valm-landing-section-1.png",
    "sourceRect": [
     0,
     0,
     320,
     544
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      320,
      128
     ],
     [
      0,
      416,
      320,
      128
     ]
    ],
    "sockets": [
     {
      "id": "east",
      "side": "east",
      "position": {
       "x": 320,
       "y": 272
      }
     }
    ]
   },
   {
    "id": "valm-landing-section-2",
    "source": "public/assets/maps/valm-landing-section-2.png",
    "sourceRect": [
     0,
     0,
     640,
     544
    ],
    "position": {
     "x": 320,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      640,
      128
     ],
     [
      0,
      416,
      640,
      128
     ],
     [
      256,
      128,
      128,
      64
     ],
     [
      544,
      352,
      96,
      64
     ]
    ],
    "sockets": [
     {
      "id": "west",
      "side": "west",
      "position": {
       "x": 0,
       "y": 272
      }
     },
     {
      "id": "east",
      "side": "east",
      "position": {
       "x": 640,
       "y": 272
      }
     }
    ]
   },
   {
    "id": "valm-landing-section-3",
    "source": "public/assets/maps/valm-landing-section-3.png",
    "sourceRect": [
     0,
     0,
     320,
     544
    ],
    "position": {
     "x": 960,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      320,
      128
     ],
     [
      0,
      416,
      320,
      128
     ],
     [
      0,
      352,
      32,
      64
     ]
    ],
    "sockets": [
     {
      "id": "west",
      "side": "west",
      "position": {
       "x": 0,
       "y": 272
      }
     }
    ]
   }
  ],
  "roads": [
   [
    0,
    192,
    1280,
    160
   ]
  ],
  "houses": [],
  "carpet": [],
  "throne": null
 },
 {
  "id": "chonsin-pass",
  "width": 1024,
  "height": 544,
  "style": "forest",
  "chunks": [
   {
    "id": "chonsin-pass-section-1",
    "source": "public/assets/maps/chonsin-pass-section-1.png",
    "sourceRect": [
     0,
     0,
     320,
     544
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      320,
      96
     ],
     [
      0,
      448,
      320,
      96
     ]
    ],
    "sockets": [
     {
      "id": "east",
      "side": "east",
      "position": {
       "x": 320,
       "y": 272
      }
     }
    ]
   },
   {
    "id": "chonsin-pass-section-2",
    "source": "public/assets/maps/chonsin-pass-section-2.png",
    "sourceRect": [
     0,
     0,
     384,
     544
    ],
    "position": {
     "x": 320,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      384,
      96
     ],
     [
      0,
      448,
      384,
      96
     ],
     [
      64,
      96,
      128,
      128
     ],
     [
      320,
      320,
      64,
      128
     ]
    ],
    "sockets": [
     {
      "id": "west",
      "side": "west",
      "position": {
       "x": 0,
       "y": 272
      }
     },
     {
      "id": "east",
      "side": "east",
      "position": {
       "x": 384,
       "y": 272
      }
     }
    ]
   },
   {
    "id": "chonsin-pass-section-3",
    "source": "public/assets/maps/chonsin-pass-section-3.png",
    "sourceRect": [
     0,
     0,
     320,
     544
    ],
    "position": {
     "x": 704,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      320,
      96
     ],
     [
      0,
      448,
      320,
      96
     ],
     [
      0,
      320,
      64,
      128
     ]
    ],
    "sockets": [
     {
      "id": "west",
      "side": "west",
      "position": {
       "x": 0,
       "y": 272
      }
     }
    ]
   }
  ],
  "roads": [
   [
    0,
    224,
    1024,
    96
   ],
   [
    192,
    128,
    192,
    256
   ],
   [
    768,
    128,
    192,
    256
   ]
  ],
  "houses": [],
  "carpet": [],
  "throne": null
 },
 {
  "id": "conqueror-hall",
  "width": 1024,
  "height": 768,
  "style": "stone",
  "chunks": [
   {
    "id": "conqueror-hall-section-1",
    "source": "public/assets/maps/conqueror-hall-section-1.png",
    "sourceRect": [
     0,
     0,
     1024,
     256
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      1024,
      32
     ],
     [
      0,
      32,
      32,
      224
     ],
     [
      992,
      32,
      32,
      224
     ],
     [
      224,
      96,
      64,
      64
     ],
     [
      736,
      96,
      64,
      64
     ]
    ],
    "sockets": [
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 512,
       "y": 256
      }
     }
    ]
   },
   {
    "id": "conqueror-hall-section-2",
    "source": "public/assets/maps/conqueror-hall-section-2.png",
    "sourceRect": [
     0,
     0,
     1024,
     256
    ],
    "position": {
     "x": 0,
     "y": 256
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      32,
      256
     ],
     [
      992,
      0,
      32,
      256
     ],
     [
      32,
      0,
      224,
      32
     ],
     [
      768,
      0,
      224,
      32
     ],
     [
      224,
      96,
      64,
      64
     ],
     [
      736,
      96,
      64,
      64
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 512,
       "y": 0
      }
     },
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 512,
       "y": 256
      }
     }
    ]
   },
   {
    "id": "conqueror-hall-section-3",
    "source": "public/assets/maps/conqueror-hall-section-3.png",
    "sourceRect": [
     0,
     0,
     1024,
     256
    ],
    "position": {
     "x": 0,
     "y": 512
    },
    "scale": 1,
    "terrain": [
     [
      0,
      224,
      1024,
      32
     ],
     [
      0,
      0,
      32,
      224
     ],
     [
      992,
      0,
      32,
      224
     ],
     [
      32,
      0,
      224,
      32
     ],
     [
      768,
      0,
      224,
      32
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 512,
       "y": 0
      }
     }
    ]
   }
  ],
  "roads": [],
  "houses": [],
  "carpet": [
   [
    416,
    32,
    192,
    704
   ]
  ],
  "throne": [
   496,
   64
  ]
 },
 {
  "id": "grimleal-approach",
  "width": 832,
  "height": 640,
  "style": "stone",
  "chunks": [
   {
    "id": "grimleal-approach-section-1",
    "source": "public/assets/maps/grimleal-approach-section-1.png",
    "sourceRect": [
     0,
     0,
     832,
     192
    ],
    "position": {
     "x": 0,
     "y": 0
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      352,
      32
     ],
     [
      480,
      0,
      352,
      32
     ],
     [
      0,
      32,
      32,
      160
     ],
     [
      800,
      32,
      32,
      160
     ],
     [
      192,
      160,
      64,
      32
     ],
     [
      576,
      160,
      64,
      32
     ]
    ],
    "sockets": [
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 416,
       "y": 192
      }
     }
    ]
   },
   {
    "id": "grimleal-approach-section-2",
    "source": "public/assets/maps/grimleal-approach-section-2.png",
    "sourceRect": [
     0,
     0,
     832,
     256
    ],
    "position": {
     "x": 0,
     "y": 192
    },
    "scale": 1,
    "terrain": [
     [
      0,
      0,
      32,
      256
     ],
     [
      800,
      0,
      32,
      256
     ],
     [
      192,
      0,
      64,
      32
     ],
     [
      576,
      0,
      64,
      32
     ],
     [
      192,
      192,
      64,
      64
     ],
     [
      576,
      192,
      64,
      64
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 416,
       "y": 0
      }
     },
     {
      "id": "south",
      "side": "south",
      "position": {
       "x": 416,
       "y": 256
      }
     }
    ]
   },
   {
    "id": "grimleal-approach-section-3",
    "source": "public/assets/maps/grimleal-approach-section-3.png",
    "sourceRect": [
     0,
     0,
     832,
     192
    ],
    "position": {
     "x": 0,
     "y": 448
    },
    "scale": 1,
    "terrain": [
     [
      0,
      160,
      352,
      32
     ],
     [
      480,
      160,
      352,
      32
     ],
     [
      0,
      0,
      32,
      160
     ],
     [
      800,
      0,
      32,
      160
     ]
    ],
    "sockets": [
     {
      "id": "north",
      "side": "north",
      "position": {
       "x": 416,
       "y": 0
      }
     }
    ]
   }
  ],
  "roads": [],
  "houses": [],
  "carpet": [
   [
    384,
    32,
    64,
    576
   ],
   [
    32,
    288,
    768,
    64
   ]
  ],
  "throne": null
 }
] as const satisfies readonly ExpansionLayout[];
