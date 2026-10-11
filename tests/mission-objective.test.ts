import {test} from 'node:test';import assert from 'node:assert/strict';
import {victoryReady,formatClock} from '../src/game/systems/mission-objective';
import {newCampaign,completeMission,acceptMissionResult} from '../src/game/systems/campaign';
import {saveCampaign,loadCampaign,decodeCampaignSave} from '../src/game/systems/campaign-save';
const state={phase:'complete',enemies:1,pending:0,commanderDefeated:true,exitReached:true};
test('defeat-all requires every active and scheduled enemy; timed and commander goals are explicit',()=>{
 assert.equal(victoryReady('defeat-all',state),false);assert.equal(victoryReady('defeat-all',{...state,enemies:0,pending:1}),false);assert.equal(victoryReady('defeat-all',{...state,enemies:0,pending:0}),true);
 assert.equal(victoryReady('hold-waves',state),true);assert.equal(victoryReady('hold-waves',{...state,phase:'wave'}),false);
 assert.equal(victoryReady('defeat-commander',state),true);assert.equal(victoryReady('defeat-commander',{...state,commanderDefeated:false}),false);
 assert.equal(victoryReady('reach-exit',{...state,exitReached:false}),false);assert.equal(victoryReady('reach-exit',state),true);assert.equal(formatClock(92),'1:32');
});
test('victory persists earned progression once and reload waits for explicit advancement',()=>{
 const campaign=newCampaign(['chrom']),members=structuredClone(campaign.members);members[0].progress.xp=42;members[0].health=33;
 const result={missionIndex:0,reason:'Eastern exit reached',elapsed:180,kills:20,gold:25,reward:100,progressBefore:[{hero:'chrom' as const,level:1,xp:0}]};
 assert.equal(completeMission(campaign,result,members),true);assert.equal(campaign.missionIndex,0);assert.equal(campaign.gold,245);assert.equal(campaign.members[0].health,33);assert.equal(completeMission(campaign,result,members),false);
 const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 assert.equal(saveCampaign(storage,campaign),true);const restored=loadCampaign(storage)!.campaign;assert.deepEqual(restored.pendingResult,result);assert.equal(restored.members[0].progress.xp,42);
 assert.equal(acceptMissionResult(restored),true);assert.equal(restored.missionIndex,1);assert.equal(restored.members[0].health,100);assert.equal(restored.gold,245);assert.equal(acceptMissionResult(restored),false);assert.equal(restored.gold,245);
});
test('corrupt pending result snapshots are rejected without breaking existing saves',()=>{
 const campaign=newCampaign(['chrom']);const raw=()=>JSON.stringify({version:1,savedAt:new Date().toISOString(),campaign});assert.ok(decodeCampaignSave(raw()));
 campaign.pendingResult={missionIndex:0,reason:'Done',elapsed:12,kills:5,gold:20,reward:100,progressBefore:[{hero:'chrom',level:1,xp:0}]};assert.ok(decodeCampaignSave(raw()));campaign.pendingResult.missionIndex=2;assert.equal(decodeCampaignSave(raw()),undefined);
 campaign.pendingResult.missionIndex=0;campaign.pendingResult.progressBefore[0].hero='lissa';assert.equal(decodeCampaignSave(raw()),undefined);
});
