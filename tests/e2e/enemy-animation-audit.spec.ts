import {test,expect} from '@playwright/test';
test('every enemy walks without mirrored diagonals and holds correctly oriented actions',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 const records=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);const cfg='/src/game/data/config.ts';const{ENEMY_TYPES}=await import(cfg);
  const s=game.scene.getScene('Arena');s.scene.pause();s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;const result=[];
  for(const def of ENEMY_TYPES){
   const e=s.enemies.create(160,300,def.key);e.setSize(28,28).setOffset(11,15);e.body.updateFromGameObject();e.setData({health:100,speed:80,damage:0});
   s.player.body.reset(500,390);s.player.body.updateFromGameObject();s.navigation.setTarget(s.bodyCenter(s.player));s.brains=new WeakMap();s.updateEnemy(e,1000);
   const v=e.body.velocity;const length=Math.hypot(v.x,v.y);const horizontal=v.x/length>.3?'right':v.x/length<-.3?'left':'';const vertical=v.y/length>.3?'down':v.y/length<-.3?'up':'';const name=vertical&&horizontal?`${vertical}-${horizontal}`:horizontal||vertical;
   const moving=Math.hypot(v.x,v.y)>1;
   const movement={key:e.anims.currentAnim?.key,row:Math.floor(Number(e.frame.name)/4),flip:e.flipX,direction:name,moving};
   const actions=[];
   for(const sign of [-1,1]){
    const distance=def.weapon==='bow'?160:def.weapon==='tome'?120:40;
    e.body.reset(300,230);e.body.updateFromGameObject();s.player.body.reset(300+sign*distance,230);s.player.body.updateFromGameObject();s.navigation.setTarget(s.bodyCenter(s.player));s.brains=new WeakMap();
    s.updateEnemy(e,1000);s.updateEnemy(e,1250);s.updateEnemy(e,1300);actions.push({key:e.anims.currentAnim.key,flip:e.flipX,sign});
   }
   const rows:Record<string,number[]>={};for(const direction of ['left','right','down','up','down-left','down-right','up-right','up-left']){const animation=s.anims.get(`${def.key}-walk-${direction}`);rows[direction]=animation.frames.map((f:any)=>Math.floor(Number(f.textureFrame)/4));}
   result.push({type:def.key,movement,actions,rows});e.destroy();
  }
  return result;
 });
 const rows:Record<string,number>={'left':2,'right':3,'down':4,'up':5,'down-left':6,'down-right':7,'up-right':8,'up-left':9};
 expect(records).toHaveLength(7);
 for(const r of records){
  expect(r.movement.moving).toBe(true);expect(r.movement.flip).toBe(false);
  expect(r.movement.key).toBe(`${r.type}-walk-${r.movement.direction}`);
  expect(r.movement.row).toBe(rows[r.movement.direction]);
  for(const [name,row] of Object.entries(rows))expect(r.rows[name]).toEqual([row,row,row,row]);
  for(const action of r.actions){expect(action.key).toBe(`${r.type}-action`);expect(action.flip).toBe(r.type==='archer'?action.sign<0:action.sign>0);}
 }
});
