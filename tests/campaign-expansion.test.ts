import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CLASSIC_MISSION_IDS,EXPANDED_MISSION_IDS,EXPANDED_CHAPTERS,missionIndexFor,missionIdAt} from '../src/game/data/campaign-catalog';
import {EXPANDED_CAMPAIGN_MAPS} from '../src/game/data/campaign-expansion';
import {newCampaign,completeMission,acceptMissionResult,buyCampaignItem,upgradeCampaignItem,type MissionResult} from '../src/game/systems/campaign';
import {decodeCampaignSave,saveCampaign,loadCampaign,CAMPAIGN_SAVE_KEY,LEGACY_CAMPAIGN_BACKUP_KEY} from '../src/game/systems/campaign-save';
import {NavigationField} from '../src/game/systems/navigation';
import {assembleTerrain,validateLayout,connectChunk} from '../src/game/data/map-chunks';
import {existsSync} from 'node:fs';
const savedAt='2026-10-14T00:00:00.000Z';
function result(index:number):MissionResult {return {missionIndex:index,reason:'Victory',kills:10,elapsed:180,gold:20,reward:100,progressBefore:[{hero:'chrom',level:1,xp:0}]};}
test('ten chapter IDs, source-map previews and authored goals agree without replacing the classic campaign',()=>{
 assert.equal(EXPANDED_MISSION_IDS.length,10);assert.equal(new Set(EXPANDED_MISSION_IDS).size,10);
 assert.deepEqual(EXPANDED_CHAPTERS.map(chapter=>chapter.id),EXPANDED_MISSION_IDS);
 assert.deepEqual(EXPANDED_CAMPAIGN_MAPS.map(map=>map.id),EXPANDED_MISSION_IDS);
 assert.equal(missionIdAt(3),'dark-castle');assert.equal(missionIdAt(3,'awakening-ten'),'village');
 assert.equal(EXPANDED_CAMPAIGN_MAPS[6].commander,'yenfay');assert.equal(EXPANDED_CAMPAIGN_MAPS[8].commander,'aversa');
});
test('every classic checkpoint migrates by its original stable mission, including already completed campaigns',()=>{
 for(let index=0;index<=4;index++){
  const state=newCampaign(['chrom']);state.missionIndex=index;state.complete=index===4;
  state.gold=432;state.members[0].progress.xp=59;state.members[0].loadout.items[0].forge=2;
  if(index<4)state.pendingResult=result(index);
  const save=decodeCampaignSave(JSON.stringify({version:1,savedAt,campaign:state}))!;
  assert.equal(save.version,2);assert.equal(save.campaignId,'classic-four');assert.equal(save.missionId,CLASSIC_MISSION_IDS[index]??null);
  assert.deepEqual(save.campaign,state);assert.equal(save.campaign.complete,index===4);
  if(index<4){assert.equal(acceptMissionResult(save.campaign),true);assert.equal(save.campaign.complete,index===3);}
 }
});
test('ten-chapter reward and advance transitions survive checkpoint/reload exactly once',()=>{
 const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 let state=newCampaign(['chrom'],'awakening-ten');
 for(let index=0;index<10;index++){
  const victory={...result(index),missionId:EXPANDED_MISSION_IDS[index]};const before=state.gold;
  assert.equal(completeMission(state,victory,state.members),true);assert.equal(state.gold,before+120);
  assert.equal(completeMission(state,victory,state.members),false);assert.equal(saveCampaign(storage,state),true);
  state=loadCampaign(storage)!.campaign;assert.equal(state.missionId,EXPANDED_MISSION_IDS[index]);
  assert.equal(acceptMissionResult(state),true);assert.equal(acceptMissionResult(state),false);
  assert.equal(state.missionIndex,index+1);assert.equal(state.complete,index===9);assert.equal(saveCampaign(storage,state),true);
  state=loadCampaign(storage)!.campaign;
 }
 assert.equal(state.missionId,undefined);assert.equal(state.gold,1320);assert.equal(JSON.parse(values.get(CAMPAIGN_SAVE_KEY)!).missionId,null);
});
test('version two stable identity repairs stale chapter numbers, but rejects unknown campaigns, mission IDs and mismatched pending rewards',()=>{
 const campaign=newCampaign(['chrom'],'awakening-ten');campaign.missionIndex=8;campaign.missionId='dark-castle';
 const envelope={version:2,savedAt,campaignId:'awakening-ten',missionId:'dark-castle',campaign};
 const restored=decodeCampaignSave(JSON.stringify(envelope))!;assert.equal(restored.campaign.missionIndex,9);
 assert.equal(decodeCampaignSave(JSON.stringify({...envelope,campaignId:'unknown'})),undefined);
 assert.equal(decodeCampaignSave(JSON.stringify({...envelope,missionId:'missing'})),undefined);
 campaign.pendingResult={...result(8),missionId:'village'};assert.equal(decodeCampaignSave(JSON.stringify(envelope)),undefined);
 assert.equal(missionIndexFor('dark-castle','awakening-ten'),9);
});
test('all ten chapter maps have legal connected objectives, spawn sites, guard posts and deployment cells',()=>{
 for(const map of EXPANDED_CAMPAIGN_MAPS){
  assert.deepEqual(validateLayout(map),[],map.id);
  const nav=new NavigationField(map.width,map.height,map.terrain);nav.setTarget(map.objective);
  assert.ok(nav.isWalkable(map.objective),`${map.id}: objective is blocked`);
  assert.equal(map.soldiers.length,map.soldierCount,`${map.id}: guard budget differs`);
  for(const point of [...map.camps,...map.soldiers,map.heroCamp,...(map.chapter.advanceGates??[])])assert.ok(nav.isWalkable(point)&&nav.hasRoute(point),`${map.id}: target ${point.x},${point.y} blocked or disconnected`);
  let reachableCells=0;
  for(let x=map.courtyard.left+32;x<map.courtyard.right;x+=32)for(let y=map.courtyard.top+32;y<map.courtyard.bottom;y+=32)if(nav.isWalkable({x,y})){assert.ok(nav.hasRoute({x,y}),`${map.id}: selectable deployment ${x},${y} trapped`);reachableCells++;}
  assert.ok(reachableCells>=4,`${map.id}: insufficient reachable deployment cells`);
  assert.ok(existsSync(`public/assets/${map.backgroundPath}`),`${map.id}: missing authored pixels`);
  if(['village-watch','plegian-gate','valm-landing','chonsin-pass','conqueror-hall','grimleal-approach'].includes(map.id)){
   assert.deepEqual(map.terrain,assembleTerrain(map),`${map.id}: art manifest differs from runtime collision`);
   const reviewedScene=map.backgroundPath.startsWith('maps/expanded/');
   assert.equal(map.chunks.length,reviewedScene?1:3);
   if(reviewedScene){assert.equal(map.chunks[0].source,`public/assets/maps/expanded/${map.id}.png`);assert.deepEqual(map.chunks[0].sourceRect,[0,0,map.width,map.height]);}
   for(let i=1;i<map.chunks.length;i++){const prior=map.chunks[i-1],next=map.chunks[i],vertical=next.position.y>prior.position.y;assert.deepEqual(connectChunk(prior,vertical?'south':'east',next,vertical?'north':'west').position,next.position);}
  }
 }
});
test('legacy-only newly restricted items migrate without losing otherwise valid progression or equipment',()=>{
 const state=newCampaign(['robin','frederick']);state.members[0].progress.xp=83;state.members[0].loadout={items:[{weaponId:'nosferatu',uses:null,forge:2},{weaponId:'thunder',uses:null,forge:1}],equippedSlot:0};state.members[1].loadout={items:[{weaponId:'falchion',uses:null}],equippedSlot:0};
 const migrated=decodeCampaignSave(JSON.stringify({version:1,savedAt,campaign:state}))!.campaign;
 assert.equal(migrated.members[0].progress.xp,83);assert.deepEqual(migrated.members[0].loadout,{items:[{weaponId:'thunder',uses:null,forge:1}],equippedSlot:0});assert.equal(migrated.members[1].loadout.items[0].weaponId,'iron-lance');assert.equal(migrated.gold,state.gold+350);assert.equal(migrated.migrationNotice?.refundGold,350);
 assert.equal(decodeCampaignSave(JSON.stringify({version:2,savedAt,campaignId:'classic-four',missionId:'east-road',campaign:state})),undefined);
});
test('valid v1 original bytes are backed up once and compensation survives repeated reloads without multiplying',()=>{
 const state=newCampaign(['robin']);state.gold=50;state.members[0].loadout.items=[{weaponId:'nosferatu',uses:null,forge:2}];
 const raw=JSON.stringify({version:1,savedAt,campaign:state}),values=new Map<string,string>([[CAMPAIGN_SAVE_KEY,raw]]),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 const first=loadCampaign(storage)!;assert.equal(first.campaign.gold,400);assert.equal(values.get(LEGACY_CAMPAIGN_BACKUP_KEY),raw);assert.equal(JSON.parse(values.get(CAMPAIGN_SAVE_KEY)!).version,2);
 const second=loadCampaign(storage)!;assert.equal(second.campaign.gold,400);assert.deepEqual(second.campaign.migrationNotice,first.campaign.migrationNotice);assert.equal(values.get(LEGACY_CAMPAIGN_BACKUP_KEY),raw);
 // A second old checkpoint must not overwrite the first recoverable original.
 values.set(CAMPAIGN_SAVE_KEY,JSON.stringify({version:1,savedAt,campaign:newCampaign(['chrom'])}));assert.ok(loadCampaign(storage));assert.equal(values.get(LEGACY_CAMPAIGN_BACKUP_KEY),raw);
 const invalid=newCampaign(['chrom']);invalid.members[0].loadout.equippedSlot=999;const corrupt=JSON.stringify({version:1,savedAt,campaign:invalid});values.clear();values.set(CAMPAIGN_SAVE_KEY,corrupt);assert.equal(loadCampaign(storage),undefined);assert.equal(values.size,1);assert.equal(values.get(CAMPAIGN_SAVE_KEY),corrupt);
});
test('legacy restriction repair cannot hide corrupt inventory structure or formerly illegal class equipment',()=>{
 const state=newCampaign(['robin']);state.members[0].loadout={items:[{weaponId:'nosferatu',uses:null},{weaponId:'fire',uses:null}],equippedSlot:0};
 const raw=()=>JSON.stringify({version:1,savedAt,campaign:state});assert.ok(decodeCampaignSave(raw()));
 state.members[0].loadout.equippedSlot=999;assert.equal(decodeCampaignSave(raw()),undefined);state.members[0].loadout.equippedSlot=0;
 state.members[0].loadout.items[0].forge=999;assert.equal(decodeCampaignSave(raw()),undefined);delete state.members[0].loadout.items[0].forge;
 state.members[0].loadout.items[0].uses=0;assert.equal(decodeCampaignSave(raw()),undefined);state.members[0].loadout.items[0].uses=null;
 state.members[0].hero='chrom';assert.equal(decodeCampaignSave(raw()),undefined);
 state.members[0].loadout={items:[{weaponId:'nosferatu',uses:null}],equippedSlot:0};assert.equal(decodeCampaignSave(raw()),undefined);
});

test('valid upper-bound legacy treasury retains the full equipment refund and roundtrips',()=>{const state=newCampaign(['robin']);state.gold=1000000;state.members[0].loadout.items=[{weaponId:'nosferatu',uses:null,forge:2}];const raw=JSON.stringify({version:1,savedAt,campaign:state}),values=new Map<string,string>([[CAMPAIGN_SAVE_KEY,raw]]),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};assert.equal(loadCampaign(storage)!.campaign.gold,1000350);assert.equal(loadCampaign(storage)!.campaign.gold,1000350);assert.equal(values.get(LEGACY_CAMPAIGN_BACKUP_KEY),raw);});
test('expanded stock unlocks are enforced by purchases and forge costs advance while classic investments remain unchanged',()=>{
 const expanded=newCampaign(['morgan'],'awakening-ten');expanded.gold=1000;
 assert.equal(buyCampaignItem(expanded,'morgan','elfire'),false);assert.equal(expanded.gold,1000);expanded.missionIndex=2;assert.equal(buyCampaignItem(expanded,'morgan','elfire'),true);assert.equal(expanded.gold,840);
 for(const remaining of [740,560,280]){assert.equal(upgradeCampaignItem(expanded,'morgan',0),true);assert.equal(expanded.gold,remaining);}assert.equal(upgradeCampaignItem(expanded,'morgan',0),false);
 const classic=newCampaign(['morgan']);classic.gold=1000;for(const remaining of [900,800,700]){assert.equal(upgradeCampaignItem(classic,'morgan',0),true);assert.equal(classic.gold,remaining);}
});

test('final chapter spaces twenty-four guards without weakening their stats or the commander',async()=>{
 const map=EXPANDED_CAMPAIGN_MAPS[9],w=map.waves;
 assert.equal(w.count*w.batches!*map.camps.length,24);assert.equal(w.hostileCap,8);assert.equal(w.releaseIntervalMs,11000);
 assert.equal(w.healthScale,2.5);assert.equal(w.damageScale,1.7);assert.equal(w.bossHealth,2200);
 const {StageOne}=await import('../src/game/systems/stage-one');
 const stage=new StageOne({waves:w.count,waveMinimum:w.minimumMs,releaseInterval:w.releaseIntervalMs,intermission:w.intermissionMs,bossWarning:8000,hostileCap:w.hostileCap,bossHealth:w.bossHealth});stage.start(0);
 assert.equal(stage.advance(5000,true),'wave');assert.equal(stage.advance(49999,true),undefined);assert.equal(stage.advance(50000,true),'rest');
 assert.equal(stage.advance(60000,true),'wave');assert.equal(stage.advance(105000,true),'rest');assert.equal(stage.advance(115000,true),'wave');
 assert.equal(stage.advance(159999,true),undefined);assert.equal(stage.advance(160000,true),'boss-warning');assert.equal(stage.advance(167999,true),undefined);assert.equal(stage.advance(168000,true),'boss');
});
