import {test,expect} from '@playwright/test';

test('allied soldiers attract mage fire, take resistance damage and ignore friendly projectiles',async({page})=>{
  await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  const before=await page.evaluate(async()=>{
    const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();
    s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;
    const allies=s.allies.getChildren();allies[1].destroy();const ally=allies[0];ally.body.reset(300,230);ally.body.updateFromGameObject();ally.setData('speed',0);
    s.player.body.reset(190,230);s.player.body.updateFromGameObject();
    const mage=s.enemies.create(500,230,'mage');mage.setSize(28,28).setOffset(11,15);mage.body.reset(500,230);mage.body.updateFromGameObject();mage.setData({health:45,maxHealth:45,resistance:5,weapon:'tome',speed:0,damage:14});
    s.navigation.setTarget(s.bodyCenter(s.player));s.targetFields.get(ally).setTarget(s.bodyCenter(ally));
    s.updateEnemy(mage,1000);s.updateEnemy(mage,1250);s.updateEnemy(mage,1900);
    const projectile=s.arrows.getChildren()[0];
    const result={targetsAlly:s.brains.get(mage).targetUnit===ally,weapon:projectile.getData('weapon'),friendlyHealth:ally.getData('health')};
    s.projectileHit(projectile,mage);result.friendlyHealth=mage.getData('health');
    // Resolve this projectile directly to isolate faction filtering and resistance
    // from frame-rate-dependent projectile travel (covered by ranged combat tests).
    s.projectileHit(projectile,ally); mage.destroy(); s.scene.resume();return result;
  });
  expect(before).toEqual({targetsAlly:true,weapon:'tome',friendlyHealth:45});
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return s.allies.getChildren()[0].getData('health');})).toBe(88);
  expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').health;})).toBe(100);
});

test('allies fight enemies, do not count toward waves and their death does not end the run',async({page})=>{
  await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  const state=await page.evaluate(async()=>{
    const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.allyMode='attack';s.brains=new WeakMap();s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=0;
    const ally=s.allies.getChildren()[0];s.allies.getChildren()[1].destroy();ally.body.reset(300,230);ally.body.updateFromGameObject();
    const enemy=s.enemies.create(350,230,'soldier');enemy.setSize(28,28).setOffset(11,15);enemy.body.reset(350,230);enemy.body.updateFromGameObject();enemy.setData({health:60,maxHealth:60,weapon:'sword',speed:0,damage:10});
    s.updateEnemy(ally,1000);s.updateEnemy(ally,1250);s.updateEnemy(ally,1600);const damaged=enemy.getData('health');
    s.damageEnemy(enemy,100,'sword');s.update(1700);const advancing=s.advancing;
    s.damageEnemy(ally,200,'sword');return {damaged,advancing,ended:s.ended,kills:s.kills,allies:s.allies.countActive()};
  });
  expect(state).toEqual({damaged:42,advancing:true,ended:false,kills:1,allies:0});
  await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {allies:s.allies.countActive(),fields:s.targetFields.size,arrows:s.arrows.countActive()};})).toEqual({allies:2,fields:2,arrows:0});
});
