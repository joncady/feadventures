import {test,expect} from '@playwright/test';
test('gold does not consume health drop slots, three health items cap drops and restart clears both',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.stop('Menu');game.scene.start('Arena',{hero:'chrom',companions:['miriel'],tactical:true,missionIndex:1});});
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return !!game.scene.getScene('Arena').pickups;});
 const result=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);
  const a=game.scene.getScene('Arena');game.scene.pause('Arena');
  const healthCount=()=>a.pickups.getChildren().filter((p:any)=>p.active&&p.texture.key==='vulnerary').length;
  for(let i=0;i<12;i++)a.pickups.create(800+i,400,'gold').setData('gold',12);
  // Use the exact loaded module URL so only health RNG is deterministic.
  const modulePath=performance.getEntriesByType('resource').map(entry=>entry.name).find(url=>url.includes('/deps/phaser.js'))!;const Phaser=(await import(modulePath)).default;
  const original=Phaser.Math.Between;Phaser.Math.Between=(min:number,max:number)=>min===1&&max===5?1:original(min,max);
  try{
   const kill=()=>{const enemy=a.createHostile(820,420,'soldier');a.damageEnemy(enemy,10000,'sword');};
   kill();const crowded=healthCount();kill();kill();const cappedAt=healthCount();kill();const afterFourth=healthCount();
   const stale=a.pickups.getChildren().slice();game.scene.stop('Arena');game.scene.start('Arena',{hero:'chrom',companions:['miriel'],tactical:true,missionIndex:1});
   return{crowded,cappedAt,afterFourth,newCount:game.scene.getScene('Arena').pickups.countActive(),oldActive:stale.filter((p:any)=>p.active).length};
  }finally{Phaser.Math.Between=original;}
 });
 expect(result).toEqual({crowded:1,cappedAt:3,afterFourth:3,newCount:0,oldActive:0});
});
