import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { direction, inMeleeRange, validSpawn, waveSize } from '../src/game/systems/rules';
describe('movement and combat', () => {
  it('normalizes diagonals to the same speed as cardinal movement', () => {
    const diagonal = direction(1, 1);
    assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 0.00001);
    assert.deepEqual(direction(0, 0), { x: 0, y: 0 });
  });
  it('hits only enemies within reach and ahead of the player', () => {
    const player = { x: 100, y: 100 }, facing = { x: 1, y: 0 };
    assert.equal(inMeleeRange(player, { x: 150, y: 100 }, facing), true);
    assert.equal(inMeleeRange(player, { x: 50, y: 100 }, facing), false);
    assert.equal(inMeleeRange(player, { x: 190, y: 100 }, facing), false);
    assert.equal(inMeleeRange(player, player, facing), true);
  });
  it('rejects spawns overlapping terrain or too close to the hero', () => {
    const obstacles = [[200, 200, 100, 100]], player = { x: 10, y: 10 };
    assert.equal(validSpawn(100, 100, obstacles, player), false);
    assert.equal(validSpawn(190, 250, obstacles, player), false);
    assert.equal(validSpawn(400, 400, obstacles, player), true);
  });
  it('increases the wave budget', () => { assert.equal(waveSize(1), 5); assert.equal(waveSize(2), 7); });
});
