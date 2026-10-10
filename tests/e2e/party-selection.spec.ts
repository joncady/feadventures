import {test,expect,type Page} from '@playwright/test';
async function point(page:Page,x:number,y:number){const b=(await page.locator('canvas').boundingBox())!;await page.mouse.click(b.x+x*b.width/896,b.y+y*b.height/544);}
async function card(page:Page,hero:string){const p=await page.evaluate(async hero=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('character-card-centers')[hero];},hero);await point(page,p.x,p.y);}
test('native party picker selects three companions, keeps soldiers and routes bow/magic/flying combat',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin battle'}).waitFor();
 await point(page,534,96);await card(page,'morgan');await card(page,'virion');await card(page,'sumia');await card(page,'vaike');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('interface-state').companions;})).toEqual(['morgan','virion','sumia']);
 await point(page,448,506);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').allies.countActive();})).toBe(5);
 const result=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.time.removeAllEvents();s.spawning=1;s.allyMode='attack';s.enemies.clear(true,true);
  const results=[];
  for(const hero of ['morgan','virion','sumia']){
   s.enemies.clear(true,true);s.arrows.clear(true,true);s.brains=new WeakMap();
   const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')===hero);ally.body.reset(200,230);ally.body.updateFromGameObject();
   const enemy=s.enemies.create(hero==='sumia'?280:420,230,'soldier');enemy.setSize(28,28).setOffset(11,15);enemy.body.updateFromGameObject();enemy.setData({health:100,maxHealth:100,weapon:'sword',speed:0,damage:0});
   s.updateEnemy(ally,1000);s.updateEnemy(ally,1250);s.updateEnemy(ally,1900);
   const arrow=s.arrows.getChildren()[0];
   const range=arrow?.getData('maxRange');
   if(arrow){arrow.setPosition(enemy.x,enemy.y);arrow.body.updateFromGameObject();s.projectileHit(arrow,enemy);}
   results.push({hero,weapon:ally.getData('weapon'),health:enemy.getData('health'),flying:ally.getData('flying'),range});
  }
  const flyer=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='sumia');s.damageEnemy(flyer,35,'bow','enemy');
  return {results,flyerHealth:flyer.getData('health'),soldiers:s.allies.getChildren().filter((a:any)=>!a.getData('companionHero')).length};
 });
 expect(result.results).toEqual([{hero:'morgan',weapon:'tome',health:70,flying:false,range:300},{hero:'virion',weapon:'bow',health:65,flying:false,range:420},{hero:'sumia',weapon:'lance',health:58,flying:true,range:undefined}]);
 expect(result.flyerHealth).toBe(30);expect(result.soldiers).toBe(2);
 await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {allies:s.allies.countActive(),mode:s.allyMode,arrows:s.arrows.countActive()};})).toEqual({allies:5,mode:'defend',arrows:0});
});
test('selection acknowledges character and menu/stage music switch without duplicate loops',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin battle'}).waitFor();
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const original=game.sound.play.bind(game.sound);const keys:string[]=[];game.registry.set('selection-sounds',keys);game.sound.play=(key:string,options:any)=>{keys.push(key);return original(key,options);};});
 await card(page,'vaike');
 const menu=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {selected:game.registry.get('interface-state').hero,keys:game.registry.get('selection-sounds'),menu:Boolean(game.sound.get('music-menu')),stage:Boolean(game.sound.get('music'))};});
 expect(menu).toMatchObject({selected:'vaike',menu:true,stage:false});expect(menu.keys).toContain('voice-vaike-select');
 await point(page,448,506);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {menu:Boolean(game.sound.get('music-menu')),stage:Boolean(game.sound.get('music'))};})).toEqual({menu:false,stage:true});
 await point(page,706,17);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {menu:Boolean(game.sound.get('music-menu')),stage:Boolean(game.sound.get('music')),picker:game.scene.getScene('Interface').menu.visible,pause:game.scene.getScene('Interface').pauseButton.visible};})).toEqual({menu:true,stage:false,picker:true,pause:false});
});
