import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canEquip, equip, equippedWeapon, initialLoadout } from '../src/game/data/equipment';

test('inventory can hold different weapons while class permissions and remaining uses restrict equipment', () => {
  const loadout=initialLoadout('robin');
  loadout.items.push({weaponId:'iron-sword',uses:null},{weaponId:'iron-bow',uses:null},{weaponId:'iron-sword',uses:0});
  assert.equal(equip(loadout,'robin',1),true);assert.equal(equippedWeapon(loadout).type,'sword');
  assert.equal(equip(loadout,'robin',2),false);assert.equal(equip(loadout,'robin',3),false);
  assert.equal(equip(loadout,'robin',9),false);assert.equal(equippedWeapon(loadout).type,'sword');
  assert.equal(canEquip('virion',{weaponId:'fire',uses:null}),false);
});
