import {test,expect} from '@playwright/test';
test('legacy hero has exact directional frames and melee action is not overwritten by idle',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin battle'}).click();
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;});
 await page.locator('#game').focus();await page.keyboard.down('s');await page.keyboard.down('d');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const p=game.scene.getScene('Arena').player;return {key:p.anims.currentAnim.key,row:Math.floor(Number(p.frame.name)/4),width:p.frame.width,height:p.frame.height,flip:p.flipX};})).toEqual({key:'chrom-walk-down-right',row:6,width:50,height:50,flip:false});
 await page.keyboard.up('s');await page.keyboard.up('d');
 const action=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.attack();const before=s.player.anims.currentAnim.key;s.update(s.time.now+100);const during=s.player.anims.currentAnim.key;s.update(s.time.now+250);return {before,during,after:s.player.anims.currentAnim.key};});
 expect(action).toEqual({before:'chrom-action',during:'chrom-action',after:'chrom-idle'});
});
