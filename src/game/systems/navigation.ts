import type { Point } from './rules';

export type TerrainRect = readonly [number, number, number, number];

/** A shared breadth-first flow field on terrain expanded by the moving body's radius. */
export class NavigationField {
  private readonly columns: number;
  private readonly rows: number;
  private readonly points: Point[];
  private readonly walkable: boolean[];
  private readonly neighbors: number[][];
  private readonly distances: Int32Array;
  private targetCell = -1;
  private reachable: Point[] = [];

  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly terrain: readonly TerrainRect[],
    private readonly cellSize = 16,
    private readonly radius = 14,
  ) {
    this.columns = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.points = Array.from({ length: this.columns * this.rows }, (_, index) => ({
      x: Math.min((index % this.columns + 0.5) * cellSize, width),
      y: Math.min((Math.floor(index / this.columns) + 0.5) * cellSize, height),
    }));
    this.walkable = this.points.map(point => this.isWalkable(point));
    this.neighbors = this.points.map((point, index) => {
      if (!this.walkable[index]) return [];
      const column = index % this.columns, row = Math.floor(index / this.columns);
      const candidates: number[] = [];
      if (column > 0) candidates.push(index - 1);
      if (column + 1 < this.columns) candidates.push(index + 1);
      if (row > 0) candidates.push(index - this.columns);
      if (row + 1 < this.rows) candidates.push(index + this.columns);
      return candidates.filter(next => this.walkable[next] && this.canTravel(point, this.points[next]));
    });
    this.distances = new Int32Array(this.points.length).fill(-1);
  }

  isWalkable(point: Point): boolean {
    return point.x >= this.radius && point.y >= this.radius && point.x <= this.width - this.radius && point.y <= this.height - this.radius &&
      !this.terrain.some(([x, y, width, height]) => point.x > x - this.radius && point.x < x + width + this.radius && point.y > y - this.radius && point.y < y + height + this.radius);
  }

  canTravel(from: Point, to: Point): boolean {
    if (!this.isWalkable(from) || !this.isWalkable(to)) return false;
    return !this.terrain.some(([x, y, width, height]) => {
      // Intersect the segment with the interior of an expanded rectangle. Tangency is safe.
      const epsilon = 0.000001;
      const bounds = [[x - this.radius + epsilon, x + width + this.radius - epsilon], [y - this.radius + epsilon, y + height + this.radius - epsilon]];
      const origins = [from.x, from.y], delta = [to.x - from.x, to.y - from.y];
      let near = 0, far = 1;
      for (let axis = 0; axis < 2; axis++) {
        if (delta[axis] === 0) {
          if (origins[axis] < bounds[axis][0] || origins[axis] > bounds[axis][1]) return false;
        } else {
          const a = (bounds[axis][0] - origins[axis]) / delta[axis];
          const b = (bounds[axis][1] - origins[axis]) / delta[axis];
          near = Math.max(near, Math.min(a, b));
          far = Math.min(far, Math.max(a, b));
          if (near > far) return false;
        }
      }
      return near <= far;
    });
  }

  setTarget(target: Point): void {
    const cell = this.nearestCell(target);
    if (cell === this.targetCell) return;
    this.targetCell = cell;
    this.distances.fill(-1);
    if (cell >= 0) {
      const queue = new Int32Array(this.points.length);
      let read = 0, write = 1;
      queue[0] = cell; this.distances[cell] = 0;
      while (read < write) {
        const current = queue[read++];
        for (const next of this.neighbors[current]) {
          if (this.distances[next] !== -1) continue;
          this.distances[next] = this.distances[current] + 1;
          queue[write++] = next;
        }
      }
    }
    this.reachable = this.points.filter((_point, index) => this.distances[index] >= 0);
  }

  reachablePoints(): readonly Point[] { return this.reachable; }

  hasRoute(from: Point): boolean {
    const cell = this.nearestCell(from);
    return cell >= 0 && this.distances[cell] >= 0;
  }

  nextWaypoint(from: Point, retreat = false): Point | undefined {
    const cell = this.nearestCell(from);
    if (cell < 0 || this.distances[cell] < 0) return undefined;
    let next = cell;
    for (const neighbor of this.neighbors[cell]) {
      if (this.distances[neighbor] < 0) continue;
      if (retreat ? this.distances[neighbor] > this.distances[next] : this.distances[neighbor] < this.distances[next]) next = neighbor;
    }
    const waypoint = this.points[next];
    return this.canTravel(from, waypoint) ? waypoint : this.points[cell];
  }

  private nearestCell(point: Point): number {
    const column = Math.floor(point.x / this.cellSize), row = Math.floor(point.y / this.cellSize);
    const index = row * this.columns + column;
    if (column >= 0 && column < this.columns && row >= 0 && row < this.rows && this.walkable[index] && this.canTravel(point, this.points[index])) return index;
    let closest = -1, best = Infinity;
    for (let candidate = 0; candidate < this.points.length; candidate++) {
      if (!this.walkable[candidate]) continue;
      const destination = this.points[candidate];
      const distance = (point.x - destination.x) ** 2 + (point.y - destination.y) ** 2;
      if (distance < best && this.canTravel(point, destination)) { best = distance; closest = candidate; }
    }
    return closest;
  }
}
