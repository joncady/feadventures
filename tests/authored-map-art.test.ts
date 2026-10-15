import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {AUTHORED_MAP_ART} from '../src/game/data/map-art/generated';
import {EXPANDED_CAMPAIGN_MAPS} from '../src/game/data/campaign-expansion';
import {CAMPAIGN_MAPS} from '../src/game/data/maps';
import {NavigationField} from '../src/game/systems/navigation';

test('authored chapter crop stamps preserve native 2x source geometry and provenance',()=>{
 for(const file of readdirSync('src/game/data/map-art/chapters').filter(name=>name.endsWith('.json'))){
  const art=JSON.parse(readFileSync(`src/game/data/map-art/chapters/${file}`,'utf8')) as {id:string;credits:unknown[];layers:{source:string;crop:number[];rect:number[];mode:string;scale?:number}[]};
  assert.ok(art.credits.length,art.id);
  for(const layer of art.layers){
   const [, ,w,h]=layer.crop;const [, ,dw,dh]=layer.rect;
   const scale='scale' in layer?Number(layer.scale):2;
   assert.ok(existsSync(layer.source),`${art.id}: source unavailable`);
   const png=readFileSync(layer.source);assert.equal(png.toString('ascii',1,4),'PNG');
   assert.ok(layer.crop[0]>=0&&layer.crop[1]>=0&&layer.crop[0]+w<=png.readUInt32BE(16)&&layer.crop[1]+h<=png.readUInt32BE(20),`${art.id}: crop outside source`);
   if(layer.mode==='stamp')assert.deepEqual([dw,dh],[w*scale,h*scale],`${art.id}: source art stretched`);
  }
 }
});
test('reviewed landing and shrine use expanded-only textures and physically block their actual landmarks',()=>{
 const coast=EXPANDED_CAMPAIGN_MAPS.find(m=>m.id==='valm-landing')!;
 const shrine=EXPANDED_CAMPAIGN_MAPS.find(m=>m.id==='grimleal-approach')!;
 for(const m of [coast,shrine]){assert.equal(m.backgroundKey,`mission-expanded-${m.id}`);assert.equal(m.backgroundPath,`maps/expanded/${m.id}.png`);assert.ok(existsSync(`public/assets/${m.backgroundPath}`));}
 const c=new NavigationField(coast.width,coast.height,coast.terrain);
 for(const p of [{x:160,y:480},{x:480,y:320},{x:880,y:320}])assert.equal(c.isWalkable(p),false,'sea, closed portcullis and yard house must be solid');
 assert.ok(c.isWalkable({x:480,y:384}),'bridge approach remains traversable up to closed gate');
 const s=new NavigationField(shrine.width,shrine.height,shrine.terrain);
 for(const p of [{x:400,y:272},{x:352,y:560},{x:736,y:560}])assert.equal(s.isWalkable(p),false,'facade and paired bastions must be solid');
 for(const p of [{x:512,y:560},{x:608,y:560}])assert.ok(s.isWalkable(p),'central bastion approach stays clear');
 assert.equal(coast.soldierCount,0,'illustrative mockup guards must not become extra gameplay NPCs');assert.equal(shrine.soldierCount,2);
 for(const m of CAMPAIGN_MAPS)assert.equal(m.backgroundKey,`mission-${m.id}`,'classic texture identity must remain unchanged');
});
test('all integrated deployment zones reserve legal NPC cells and still fit four ground heroes with live barricades',()=>{
 for(const map of EXPANDED_CAMPAIGN_MAPS.filter(m=>m.backgroundPath.startsWith('maps/expanded/'))){
  const nav=new NavigationField(map.width,map.height,[...map.terrain,...map.siegeWalls.map(w=>w.rect)]),c=map.courtyard,occupied:{x:number;y:number}[]=[];
  const valid=(p:{x:number;y:number})=>p.x>=c.left+20&&p.x<=c.right-20&&p.y>=c.top+20&&p.y<=c.bottom-20&&nav.isWalkable({x:p.x,y:p.y+4.5})&&!occupied.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<64)&&!map.camps.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<150)&&(!['defend','survive'].includes(map.objective.kind)||Math.hypot(map.heroCamp.x-p.x,map.heroCamp.y-p.y)>=64);
  for(const p of map.soldiers){assert.ok(valid(p),`${map.id}: NPC outside legal deployment/spacing`);occupied.push(p);}
  for(let i=0;i<4;i++){let found=false;outer:for(let y=c.top+32;y<c.bottom;y+=32)for(let x=c.left+32;x<c.right;x+=32)if(valid({x,y})){occupied.push({x,y});found=true;break outer;}assert.ok(found,`${map.id}: auto-place cannot fit hero ${i+1} after NPC reservation`);}
 }
});
test('expanded castle preserves barricade count and health without permanent terrain under destructible footprints',()=>{
 const classic=CAMPAIGN_MAPS.find(m=>m.id==='castle-defense')!,castle=EXPANDED_CAMPAIGN_MAPS.find(m=>m.id==='castle-defense')!;
 assert.equal(castle.siegeWalls.length,classic.siegeWalls.length);
 assert.deepEqual(castle.siegeWalls.map(w=>w.health),classic.siegeWalls.map(w=>w.health));
 for(const wall of castle.siegeWalls){const [x,y,w,h]=wall.rect;for(const [sx,sy,sw,sh] of castle.terrain)assert.equal(x<sx+sw&&x+w>sx&&y<sy+sh&&y+h>sy,false,`${wall.name}: permanent obstacle would remain after destruction`);}
 const live=new NavigationField(castle.width,castle.height,[...castle.terrain,...castle.siegeWalls.map(w=>w.rect)]);
 for(const p of [{x:640,y:320},{x:896,y:448},{x:640,y:640},{x:384,y:448}])assert.ok(live.isWalkable(p),'all four entrances stay open with live barricades');
});
