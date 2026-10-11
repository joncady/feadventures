/** Shared placement manifest: compose-campaign-maps.py reads this exact JSON literal. */
export const EAST_ROAD_CHUNKS = [
 {
  "id": "west-muster",
  "source": "public/assets/maps/east-road-west.png",
  "sourceRect": [
   0,
   0,
   384,
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
    384,
    128
   ],
   [
    0,
    416,
    384,
    128
   ],
   [
    96,
    128,
    128,
    48
   ]
  ],
  "sockets": [
   {
    "id": "road-east",
    "side": "east",
    "position": {
     "x": 384,
     "y": 272
    }
   }
  ]
 },
 {
  "id": "woodland-crossing",
  "source": "public/assets/maps/east-road-center.png",
  "sourceRect": [
   0,
   0,
   448,
   544
  ],
  "position": {
   "x": 384,
   "y": 0
  },
  "scale": 1,
  "terrain": [
   [
    0,
    0,
    448,
    128
   ],
   [
    0,
    416,
    448,
    128
   ],
   [
    320,
    128,
    96,
    64
   ],
   [
    48,
    352,
    96,
    64
   ]
  ],
  "sockets": [
   {
    "id": "road-west",
    "side": "west",
    "position": {
     "x": 0,
     "y": 272
    }
   },
   {
    "id": "road-east",
    "side": "east",
    "position": {
     "x": 448,
     "y": 272
    }
   }
  ]
 },
 {
  "id": "east-ambush",
  "source": "public/assets/maps/east-road-east.png",
  "sourceRect": [
   0,
   0,
   448,
   544
  ],
  "position": {
   "x": 832,
   "y": 0
  },
  "scale": 1,
  "terrain": [
   [
    0,
    0,
    448,
    128
   ],
   [
    0,
    416,
    448,
    128
   ],
   [
    192,
    128,
    128,
    48
   ],
   [
    128,
    352,
    96,
    64
   ]
  ],
  "sockets": [
   {
    "id": "road-west",
    "side": "west",
    "position": {
     "x": 0,
     "y": 272
    }
   }
  ]
 }
] as const;
