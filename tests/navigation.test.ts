import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NavigationField } from '../src/game/systems/navigation';
import { OBSTACLES, WORLD } from '../src/game/data/config';

test('routes around terrain with clearance for the entire body', () => {
  const field = new NavigationField(320, 240, [[140, 60, 40, 120]]);
  const target = { x: 280, y: 120 };
  let position = { x: 40, y: 120 };
  field.setTarget(target);
  assert.equal(field.canTravel(position, target), false);
  for (let steps = 0; !field.canTravel(position, target) && steps < 100; steps++) {
    const next = field.nextWaypoint(position);
    assert.ok(next);
    assert.ok(field.canTravel(position, next), 'every route segment respects body clearance');
    assert.notDeepEqual(next, position, 'route makes progress');
    position = next;
  }
  assert.ok(field.canTravel(position, target));
});

test('does not cross a disconnected wall or spawn beyond it', () => {
  const field = new NavigationField(320, 240, [[150, 0, 20, 240]]);
  field.setTarget({ x: 40, y: 120 });
  assert.equal(field.hasRoute({ x: 280, y: 120 }), false);
  assert.equal(field.nextWaypoint({ x: 280, y: 120 }), undefined);
  assert.ok(field.reachablePoints().every(point => point.x < 150));
  field.setTarget({ x: 280, y: 120 });
  assert.equal(field.hasRoute({ x: 280, y: 120 }), true);
  assert.equal(field.hasRoute({ x: 40, y: 120 }), false);
});

test('rejects corner cutting and paths too close to terrain', () => {
  const field = new NavigationField(240, 240, [[100, 100, 40, 40]]);
  assert.equal(field.canTravel({ x: 80, y: 110 }, { x: 110, y: 80 }), false);
  assert.equal(field.isWalkable({ x: 90, y: 120 }), false);
  assert.equal(field.canTravel({ x: 80, y: 80 }, { x: 160, y: 80 }), true);
});

test('original arena routes around its building and spawns only reachable points', () => {
  const field = new NavigationField(WORLD.width, WORLD.height, OBSTACLES);
  const target = { x: 190, y: 234.5 };
  let position = { x: 480, y: 84.5 };
  field.setTarget(target);
  assert.equal(field.canTravel(position, target), false);
  assert.ok(field.reachablePoints().length > 500);
  assert.ok(field.reachablePoints().every(point => field.hasRoute(point) && field.isWalkable(point)));
  for (let step = 0; !field.canTravel(position, target) && step < 200; step++) {
    const next = field.nextWaypoint(position);
    assert.ok(next);
    assert.ok(field.canTravel(position, next));
    assert.notDeepEqual(next, position);
    position = next;
  }
  assert.ok(field.canTravel(position, target));
});

test('ground enemies retain legal routes toward a flyer over terrain', () => {
  const field = new NavigationField(320, 240, [[140, 60, 40, 120]]);
  field.setTarget({ x: 160, y: 120 }, true);
  assert.ok(field.reachablePoints().length > 0);
  const from = { x: 40, y: 120 }, next = field.nextWaypoint(from);
  assert.ok(next && field.canTravel(from, next));
  assert.ok(field.reachablePoints().every(p => field.isWalkable(p)));
});
