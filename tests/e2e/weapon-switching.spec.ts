import {test,expect} from '@playwright/test';
test('F switches equipped action and preserves an existing recovery deadline',async({page})=>{
 await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle'}).waitFor();
 await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);game.events.emit('ui-character','robin');});
 await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Arena').hero;})).toBe('robin');
 await page.keyboard.press('f');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Arena').profile().weapon;})).toBe('sword');
 const state=await page.evaluate(async()=>{
  const entry='/src/main.ts';const {game}=await import(entry);const s=game.scene.getScene('Arena');
  s.time.removeAllEvents();s.enemies.clear(true,true);s.spawning=1;
  s.partyStates.get('robin').loadout.equippedSlot=2;s.lastAttack=s.time.now;
  const deadline=s.lastAttack+s.attackDelay();s.actionUntil=0;s.playerShot=undefined;
  const changed=s.switchWeapon();const after=s.lastAttack+s.attackDelay();
  const profile=s.profile();s.actionUntil=s.time.now+200;const blocked=s.switchWeapon();
  return {changed,deadline,after,weapon:profile.weapon,blocked,slot:s.partyStates.get('robin').loadout.equippedSlot};
 });
 expect(state.changed).toBe(true);expect(state.after).toBeGreaterThanOrEqual(state.deadline);expect(state.weapon).toBe('tome');expect(state.slot).toBe(0);expect(state.blocked).toBe(false);
});
