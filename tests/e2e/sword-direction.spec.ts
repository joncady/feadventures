import {test,expect} from '@playwright/test';

test('sword attacks toward the mouse while retreating, with keyboard facing fallback',async({page})=>{
  await page.setViewportSize({width:900,height:900});
  await page.goto('/?battle=legacy');
  await page.getByRole('button',{name:'Chrom',exact:true}).press('Enter');
  await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  await page.evaluate(async()=>{
    const {game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');
    s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;
    s.updateEnemy=()=>{};s.player.setPosition(448,288);
    const enemy=s.enemies.create(490,288,'soldier');enemy.setSize(20,20).setOffset(15,15).setData({health:100,maxHealth:100,weapon:'sword'});
  });
  const bounds=(await page.locator('canvas').boundingBox())!;
  await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.45);
  await page.locator('#game').focus();await page.keyboard.down('a');
  await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');return s.facing.x>0&&s.player.body.velocity.x<0;})).toBe(true);
  await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');const e=s.enemies.getChildren()[0];e.setPosition(s.player.x+30,s.player.y);e.body.updateFromGameObject();s.lastAttack=-Infinity;});
  await page.keyboard.down('Space');await page.waitForTimeout(100);await page.keyboard.up('Space');
  await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');return s.enemies.getChildren()[0].getData('health');})).toBeLessThan(100);
  await page.keyboard.up('a');
  await page.mouse.move(0,0);
  await page.keyboard.down('a');
  await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return (game.scene.getScene('Arena') as any).facing.x;})).toBe(-1);
  await page.keyboard.up('a');
});
