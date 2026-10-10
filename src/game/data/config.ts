export const WORLD = { width: 896, height: 544 } as const;
export const HEROES = ['chrom', 'lucina', 'frederick'] as const;
export type Hero = typeof HEROES[number];
export const ENEMY_TYPES = [
  { key: 'soldier', file: 'enemy1.png', health: 60, speed: 60, damage: 10 },
  { key: 'assassin', file: 'enemy2.png', health: 40, speed: 100, damage: 12 },
  { key: 'heavy', file: 'enemy3.png', health: 100, speed: 38, damage: 18 },
  { key: 'knight', file: 'enemy4.png', health: 75, speed: 75, damage: 12 },
  { key: 'archer', file: 'enemy5.png', health: 50, speed: 55, damage: 8 },
] as const;
// Original map rectangles, in the original 896 × 544 world coordinates.
export const OBSTACLES: readonly [number, number, number, number][] = [
  [216, 104, 202, 50], [634, 226, 262, 318], [0, 396, 132, 148],
  [0, 0, 150, 78], [708, 56, 120, 40], [412, 484, 230, 60],
  [144, 0, 82, 36], [0, 360, 44, 44], [404, 64, 46, 42],
  [458, 412, 192, 72], [576, 292, 72, 120], [546, 0, 30, 17],
  [540, 80, 36, 80], [576, 130, 70, 18], [272, 334, 68, 74],
];
