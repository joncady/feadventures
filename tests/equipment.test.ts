import { test } from 'node:test';
import assert from 'node:assert/strict';
import { type Loadout, canEquip, cycleWeapon, equip, equippedWeapon, initialLoadout, weaponProfile, INVENTORY_CAPACITY } from '../src/game/data/equipment';
import { HEROES } from '../src/game/data/config';
import { attackPower, newProgress } from '../src/game/systems/progression';

test('class permissions and remaining uses restrict equipment', () => {
  const loadout:Loadout={items:[{weaponId:'fire',uses:null},{weaponId:'iron-sword',uses:null},{weaponId:'iron-bow',uses:null}],equippedSlot:0};
  assert.equal(equip(loadout,'robin',1),true);assert.equal(equippedWeapon(loadout).type,'sword');
  assert.equal(equip(loadout,'robin',2),false);assert.equal(equip(loadout,'robin',9),false);
  loadout.items[1].uses=0;assert.equal(equip(loadout,'robin',1),false);
  assert.equal(canEquip('virion',{weaponId:'fire',uses:null}),false);
});

test('all roster entries receive two or three class-valid equipment actions',()=>{
 for(const hero of HEROES){const loadout=initialLoadout(hero);assert.ok(loadout.items.length>=2&&loadout.items.length<=INVENTORY_CAPACITY);for(const item of loadout.items)assert.ok(canEquip(hero,item),`${hero}: ${item.weaponId}`);}
});

test('cycling wraps in order and skips exhausted or forbidden weapons',()=>{
 const loadout=initialLoadout('frederick');assert.equal(equippedWeapon(loadout).type,'lance');
 assert.ok(cycleWeapon(loadout,'frederick'));assert.equal(equippedWeapon(loadout).type,'sword');
 assert.ok(cycleWeapon(loadout,'frederick'));assert.equal(equippedWeapon(loadout).type,'axe');
 assert.ok(cycleWeapon(loadout,'frederick'));assert.equal(equippedWeapon(loadout).type,'lance');
 loadout.items[1].uses=0;assert.ok(cycleWeapon(loadout,'frederick'));assert.equal(equippedWeapon(loadout).type,'axe');
});

test('equipment changes range, cooldown and the progression stat used for damage',()=>{
 const loadout=initialLoadout('robin'),progress=newProgress();progress.stats.mag+=9;progress.stats.str+=2;
 assert.equal(attackPower(progress,'robin',equippedWeapon(loadout)),39);
 assert.ok(cycleWeapon(loadout,'robin'));assert.equal(weaponProfile('robin',loadout).range,85);assert.equal(attackPower(progress,'robin',equippedWeapon(loadout)),37);
 assert.ok(cycleWeapon(loadout,'robin'));assert.equal(weaponProfile('robin',loadout).range,360);assert.equal(weaponProfile('robin',loadout).cooldown,850);
 const lissa=initialLoadout('lissa');assert.equal(equippedWeapon(lissa).type,'staff');assert.equal(equippedWeapon(lissa).effect,'heal');
});
