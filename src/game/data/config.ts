export const PLAYER_SPEED_SCALE = .72;
export const WORLD = { width: 896, height: 544 } as const;
export const HEROES = ['chrom', 'lucina', 'frederick', 'virion', 'sumia', 'morgan', 'robin', 'robin-female', 'cordelia', 'lissa', 'lonqu', 'miriel', 'ricken', 'stahl', 'sully', 'tharja', 'vaike'] as const;
export type Hero = typeof HEROES[number];
export const HERO_SHEETS = Object.fromEntries(HEROES.map(hero => [hero, {
  frameHeight: hero === 'sumia' || hero === 'cordelia' ? 55 : 50,
  directional: true,
}])) as Record<Hero, { frameHeight: number; directional: boolean }>;
export const isFlying = (hero: Hero): boolean => hero === 'sumia' || hero === 'cordelia';
export const HERO_NAMES: Record<Hero, string> = {
  'chrom': 'Chrom',
  'lucina': 'Lucina',
  'frederick': 'Frederick',
  'virion': 'Virion',
  'sumia': 'Sumia',
  'morgan': 'Morgan',
  'robin': 'Robin (Male)',
  'robin-female': 'Robin (Female)',
  'cordelia': 'Cordelia',
  'lissa': 'Lissa',
  'lonqu': 'Lon’qu',
  'miriel': 'Miriel',
  'ricken': 'Ricken',
  'stahl': 'Stahl',
  'sully': 'Sully',
  'tharja': 'Tharja',
  'vaike': 'Vaike'
};
export const HERO_PROFILES = {
  chrom: { weapon: 'sword', range: 85, minRange: 0, damage: 35, cooldown: 320, speed: 170, description: 'Sword · close combat · strong against axes' },
  lucina: { weapon: 'sword', range: 85, minRange: 0, damage: 35, cooldown: 320, speed: 170, description: 'Sword · close combat · strong against axes' },
  frederick: { weapon: 'lance', range: 110, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'Lance · longer reach · strong against swords' },
  virion: { weapon: 'bow', range: 420, minRange: 90, damage: 35, cooldown: 520, speed: 170, description: 'Bow · ranged shots · keep enemies outside the inner ring' },
  sumia: { weapon: 'lance', range: 110, minRange: 0, damage: 35, cooldown: 380, speed: 190, description: 'Pegasus · fly over terrain · lance reach · vulnerable to bows' },
  morgan: { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · cast a ranged bolt · no close-range dead zone' },
  'robin-female': { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · female Robin · ranged magic' },
  robin: { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · cast a ranged bolt · no close-range dead zone' },
  cordelia: { weapon: 'lance', range: 110, minRange: 0, damage: 35, cooldown: 380, speed: 190, description: 'Pegasus · fly over terrain · vulnerable to bows' },
  lissa: { weapon: 'axe', range: 85, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'War Cleric · axe attacks · strong against lances' },
  lonqu: { weapon: 'sword', range: 85, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'Sword · directional attacks' },
  miriel: { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · cast a ranged bolt · no close-range dead zone' },
  ricken: { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · cast a ranged bolt · no close-range dead zone' },
  stahl: { weapon: 'sword', range: 85, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'Sword · directional attacks' },
  sully: { weapon: 'lance', range: 110, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'Lance · directional attacks' },
  tharja: { weapon: 'tome', range: 300, minRange: 0, damage: 30, cooldown: 600, speed: 170, description: 'Fire tome · cast a ranged bolt · no close-range dead zone' },
  vaike: { weapon: 'axe', range: 85, minRange: 0, damage: 35, cooldown: 380, speed: 170, description: 'Axe · directional attacks' },
} as const;
export const ENEMY_TYPES = [
  { key: 'soldier', weapon: 'sword', file: 'enemy1.png', defense: 0, resistance: 0, health: 60, speed: 60, damage: 10, attack: { kind: 'melee', range: 60, windup: 350, cooldown: 1100, recovery: 200 } },
  { key: 'assassin', weapon: 'sword', file: 'enemy2.png', defense: 0, resistance: 3, health: 40, speed: 100, damage: 12, attack: { kind: 'melee', range: 55, windup: 180, cooldown: 800, recovery: 120 } },
  { key: 'heavy', weapon: 'axe', file: 'enemy3.png', defense: 8, resistance: 2, health: 100, speed: 38, damage: 18, attack: { kind: 'melee', range: 75, windup: 650, cooldown: 1800, recovery: 350 } },
  { key: 'knight', weapon: 'lance', file: 'enemy4.png', defense: 6, resistance: 0, health: 75, speed: 75, damage: 12, attack: { kind: 'melee', range: 65, windup: 400, cooldown: 1200, recovery: 250 } },
  { key: 'archer', weapon: 'bow', file: 'enemy5.png', defense: 0, resistance: 0, health: 50, speed: 55, damage: 8, attack: { kind: 'ranged', range: 420, windup: 450, cooldown: 1500, recovery: 200 } },
  { key: 'mage', weapon: 'tome', file: 'mage.png', defense: 0, resistance: 5, health: 45, speed: 50, damage: 14, attack: { kind: 'ranged', range: 330, windup: 650, cooldown: 1700, recovery: 250 } },
  { key: 'axeman', weapon: 'axe', file: 'axeman.png', defense: 2, resistance: 0, health: 80, speed: 48, damage: 16, attack: { kind: 'melee', range: 70, windup: 550, cooldown: 1450, recovery: 300 } },
] as const;
// Original map rectangles, in the original 896 × 544 world coordinates.
export const OBSTACLES: readonly [number, number, number, number][] = [
  [216, 104, 202, 50], [634, 226, 262, 318], [0, 396, 132, 148],
  [0, 0, 150, 78], [708, 56, 120, 40], [412, 484, 230, 60],
  [144, 0, 82, 36], [0, 360, 44, 44], [404, 64, 46, 42],
  [458, 412, 192, 72], [576, 292, 72, 120], [546, 0, 30, 17],
  [540, 80, 36, 80], [576, 130, 70, 18], [272, 334, 68, 74],
];
