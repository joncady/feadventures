export interface Point { x: number; y: number }
export function direction(x: number, y: number): Point {
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}
export function inMeleeRange(origin: Point, target: Point, facing: Point, reach = 85): boolean {
  const dx = target.x - origin.x, dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy);
  return distance <= reach && (distance === 0 || (dx * facing.x + dy * facing.y) / distance >= 0.15);
}
export function waveSize(wave: number): number { return 3 + wave * 2; }
export function validSpawn(x: number, y: number, obstacles: readonly (readonly number[])[], player: Point): boolean {
  return Math.hypot(x - player.x, y - player.y) > 160 &&
    !obstacles.some(([ox, oy, width, height]) => x + 22 > ox && x - 22 < ox + width && y + 22 > oy && y - 22 < oy + height);
}
