import { test } from 'node:test';
import assert from 'node:assert/strict';
import { combatDamage, weaponMatchup, withinWeaponRange, type WeaponType } from '../src/game/systems/combat';

test('all three triangle edges have reciprocal advantage and disadvantage', () => {
  for (const [winner, loser] of [['sword', 'axe'], ['axe', 'lance'], ['lance', 'sword']] as const) {
    assert.equal(weaponMatchup(winner, loser), 1);
    assert.equal(weaponMatchup(loser, winner), -1);
    assert.equal(combatDamage(35, winner, loser), 42);
    assert.equal(combatDamage(35, loser, winner), 28);
  }
});
test('same weapons, bows and tomes remain neutral', () => {
  const types: WeaponType[] = ['sword', 'lance', 'axe', 'bow', 'tome'];
  for (const weapon of types) {
    assert.equal(combatDamage(35, weapon, weapon), 35);
    for (const neutral of ['bow', 'tome'] as const) {
      assert.equal(weaponMatchup(weapon, neutral), 0);
      assert.equal(weaponMatchup(neutral, weapon), 0);
    }
  }
  assert.equal(combatDamage(1, 'sword', 'lance'), 1);
});
test('bow range excludes the close dead zone and stops at maximum range', () => {
  assert.equal(withinWeaponRange(89, 90, 420), false);
  assert.equal(withinWeaponRange(90, 90, 420), true);
  assert.equal(withinWeaponRange(420, 90, 420), true);
  assert.equal(withinWeaponRange(421, 90, 420), false);
});

test('bow effectiveness doubles damage only against flying targets', () => {
  assert.equal(combatDamage(8, 'bow', 'lance', true), 16);
  assert.equal(combatDamage(8, 'bow', 'lance'), 8);
  assert.equal(combatDamage(10, 'axe', 'lance', true), 12);
});
