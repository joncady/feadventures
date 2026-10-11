import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN_MAPS} from '../src/game/data/maps';
import {assembleTerrain,validateLayout,connectChunk} from '../src/game/data/map-chunks';
import {NavigationField} from '../src/game/systems/navigation';
test('four authored maps have bounded deploy areas, spawns and reachable guard posts',()=>{
 assert.equal(CAMPAIGN_MAPS.length,4);
 for(const map of CAMPAIGN_MAPS){assert.equal(validateLayout(map).length,0);const nav=new NavigationField(map.width,map.height,map.terrain);for(const post of map.soldiers){assert.ok(post.x>map.courtyard.left&&post.x<map.courtyard.right);assert.ok(post.y>map.courtyard.top&&post.y<map.courtyard.bottom);assert.ok(nav.isWalkable(post),`${map.id}: guard post blocked`);}assert.ok(nav.isWalkable(map.objective),`${map.id}: objective blocked`);for(const spawn of map.camps){assert.ok(spawn.x>0&&spawn.x<map.width&&spawn.y>0&&spawn.y<map.height);assert.ok(nav.isWalkable(spawn),`${map.id}: spawn center blocked`);nav.setTarget(map.objective);assert.ok(nav.hasRoute(spawn),`${map.id}: spawn cannot reach objective`);}}
});
test('chunk collision assembly scales and offsets source-local terrain',()=>{assert.deepEqual(assembleTerrain({width:100,height:100,chunks:[{id:'a',source:'sourced.png',sourceRect:[0,0,20,20],position:{x:10,y:20},scale:2,terrain:[[1,2,3,4]],sockets:[]}]}),[[12,24,6,8]]);});

test('route chunk sockets align without changing local terrain',()=>{const [a,b]=CAMPAIGN_MAPS[0].chunks;const result=connectChunk(a,'road-east',b,'road-west');assert.deepEqual(result.position,b.position);assert.equal(CAMPAIGN_MAPS[0].chunks.length,3);});

test('bandit road keeps deployment and each ambush connected inside a compact forest corridor without NPCs',()=>{
 const road=CAMPAIGN_MAPS[0];assert.equal(road.height,544);assert.equal(road.soldierCount,0);assert.deepEqual(road.soldiers,[]);assert.ok(CAMPAIGN_MAPS.slice(1).every(map=>map.soldierCount===4));
 const nav=new NavigationField(road.width,road.height,road.terrain);
 for(const target of [{x:160,y:272},{x:448,y:272},{x:832,y:272},road.objective]){
  nav.setTarget(target);for(const camp of road.camps)assert.ok(nav.hasRoute(camp),`Ambush ${camp.name} cannot reach ${target.x}`);
  for(let x=96;x<=352;x+=64)for(let y=224;y<=320;y+=32)assert.ok(nav.isWalkable({x,y})&&nav.hasRoute({x,y}),`Deployment ${x},${y} is trapped`);
 }
 for(const side of [40,1240])for(const y of [192,272,352])assert.ok(nav.isWalkable({x:side,y}),`Concealed edge entry ${side},${y} blocked`);
 assert.equal(nav.isWalkable({x:640,y:64}),false);assert.equal(nav.isWalkable({x:640,y:480}),false);
});

test('compact village has four legal pressure lanes and a bounded, connected deployment square',()=>{
 const village=CAMPAIGN_MAPS[1];assert.equal(village.width,1024);assert.equal(village.height,704);assert.equal(village.soldierCount,4);assert.equal(village.soldiers.length,4);assert.equal(village.waves.count,3);assert.equal(village.waves.minimumMs,44000);
 const nav=new NavigationField(village.width,village.height,village.terrain);nav.setTarget(village.objective);
 for(let x=384;x<=640;x+=32)for(let y=288;y<=416;y+=32)assert.ok(nav.isWalkable({x,y})&&nav.hasRoute({x,y}),`Village deployment ${x},${y} is blocked`);
 for(const point of [{x:512,y:40},{x:512,y:664},{x:40,y:176},{x:40,y:528},{x:984,y:176},{x:984,y:528}])assert.ok(nav.isWalkable(point)&&nav.hasRoute(point),`Village pressure entry ${point.x},${point.y} is trapped`);
 assert.equal(nav.isWalkable({x:288,y:224}),false);assert.equal(nav.isWalkable({x:736,y:480}),false);assert.equal(nav.isWalkable({x:64,y:352}),false);
 assert.ok(village.camps.every(c=>Math.hypot(c.x-village.objective.x,c.y-village.objective.y)<510));
});
