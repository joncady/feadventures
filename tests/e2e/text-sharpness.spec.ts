import { test, expect } from '@playwright/test';
for (const density of [1, 2]) for (const canvasFallback of [false, true]) {
 test.describe(`native sharp text DPR${density} ${canvasFallback?'Canvas':'WebGL'}`,()=>{
  test.use({deviceScaleFactor:density});
  test('keeps logical layout and pointer coordinates after window resize',async({page})=>{
   if(canvasFallback)await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:any,...args:any[]){if(String(type).includes('webgl'))return null;return (original as any).call(this,type,...args);} as any;});
   await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
   for(const width of [600,809,1440]){
    await page.setViewportSize({width,height:1066});await page.waitForTimeout(300);
    const rendering=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const u=game.scene.getScene('Interface') as any;const texts:any[]=[];const walk=(o:any)=>{if(o.type==='Text')texts.push(o);if(o.list)o.list.forEach(walk);};u.children.list.forEach(walk);return{renderDensity:Math.max(2,Math.min(3,Math.ceil(game.scale.displaySize.width/896*devicePixelRatio))),rendererType:game.renderer.type,canvas:[game.canvas.width,game.canvas.height],logical:[game.scale.gameSize.width,game.scale.gameSize.height],camera:[u.cameras.main.width,u.cameras.main.height,u.cameras.main.zoom],texts:texts.map(t=>[t.style.resolution,t.texture.source[0].scaleMode]),sprite:game.textures.get('chrom').source[0].scaleMode,css:getComputedStyle(game.canvas).imageRendering};});
    expect(rendering.canvas).toEqual([896*rendering.renderDensity,544*rendering.renderDensity]);expect(rendering.rendererType).toBe(canvasFallback?1:2);expect(rendering.logical).toEqual([896,544]);expect(rendering.camera).toEqual([896,544,1]);expect(rendering.texts.length).toBeGreaterThan(10);expect(rendering.texts.every(t=>t[0]===3&&t[1]===0)).toBe(true);expect(rendering.sprite).toBe(1);expect(rendering.css).toBe('auto');
   }
   await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('dev-jump',0);game.events.emit('campaign-continue');game.scene.start('Arena',{hero:'chrom',companions:['virion','sumia','lissa'],tactical:true,missionIndex:0});});await page.waitForTimeout(300);
   const target=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena') as any,p=a.deploymentCursor,cam=a.cameras.main,b=game.canvas.getBoundingClientRect();return{x:b.left+(p.x-cam.worldView.x)*cam.zoom*b.width/896,y:b.top+(p.y-cam.worldView.y)*cam.zoom*b.height/544,world:{...p}};});
   await page.mouse.click(target.x,target.y);await page.waitForTimeout(100);
   expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {...(game.scene.getScene('Arena') as any).deployment.chrom};})).toEqual(target.world);
  });
 });
}
