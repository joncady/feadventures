import {CAMPAIGN_MAPS,type MapDefinition} from './maps';
import {EXPANDED_CHAPTERS,type MissionChapter,type MissionId,type CampaignId} from './campaign-catalog';
import {EXPANSION_LAYOUTS} from './expansion-layouts';
import {assembleTerrain} from './map-chunks';
import {authoredMapGeometry} from './map-art';

export interface ExpandedMissionDefinition extends MapDefinition {
 chapter:MissionChapter;
 /** Only playable after Arena integration and this chapter's authored review. */
 readiness:'existing-map'|'integration-required'|'boss-assets-required';
}
const original=(id:string):MapDefinition=>CAMPAIGN_MAPS.find(map=>map.id===id)!;
/** Authored progression, independent of the selected party. Normal-input trials tune these targets. */
const CHAPTER_BUDGETS:Partial<Record<MissionId,Partial<MapDefinition['waves']>>>= {
 'village-watch':{minimumMs:75000,releaseIntervalMs:10000,healthScale:1.15},
 'plegian-gate':{minimumMs:75000,healthScale:1.3},
 village:{minimumMs:60000,healthScale:1.45,bossHealth:950},
 'valm-landing':{minimumMs:50000,intermissionMs:10000,healthScale:1.6},
 'castle-defense':{minimumMs:50000,intermissionMs:10000,healthScale:1.75},
 'chonsin-pass':{minimumMs:60000,intermissionMs:10000,healthScale:1.95},
 'conqueror-hall':{minimumMs:65000,healthScale:2.1},
 'grimleal-approach':{minimumMs:60000,healthScale:2.3},
 'dark-castle':{healthScale:2.5,damageScale:1.7,bossHealth:2200,batches:2,hostileCap:8,releaseIntervalMs:11000,minimumMs:45000,intermissionMs:10000},
};
function mission(id:MissionId,source:string,changes:Partial<MapDefinition>,readiness:ExpandedMissionDefinition['readiness']):ExpandedMissionDefinition {
 const chapter=EXPANDED_CHAPTERS.find(value=>value.id===id)!;
 const layout=EXPANSION_LAYOUTS.find(value=>value.id===id);
 const base = {...structuredClone(original(source)),...changes,...(layout?{width:layout.width,height:layout.height,backgroundKey:`mission-${id}`,backgroundPath:`maps/${id}.png`,chunks:layout.chunks,terrain:assembleTerrain(layout)}:{}),waves:{...original(source).waves,...changes.waves,...CHAPTER_BUDGETS[id]},id,title:`${EXPANDED_CHAPTERS.indexOf(chapter)+1} · ${chapter.title}`,name:chapter.title,advanceGates:chapter.advanceGates,spawnMargin:changes.spawnMargin??32,chapter,readiness};
 const art=authoredMapGeometry(id,base);
 return {...base,...art,chapter:{...chapter,advanceGates:art.advanceGates??chapter.advanceGates}};
}
/** Data foundation, intentionally not selected by the launcher until integration is reviewed.
 * Six additions use their own authored source-tile compositions and shared collision
 * manifest. Indexed-only Aversa/Yen'fay sprites still block their boss readiness.
 */
export const EXPANDED_CAMPAIGN_MAPS:readonly ExpandedMissionDefinition[]=[
 mission('east-road','east-road',{},'existing-map'),
 mission('village-watch','village',{commander:undefined,spawnEntries:[{x:416,y:16},{x:416,y:624}],spawnMargin:24,heroCamp:{x:416,y:320,health:850},courtyard:{left:256,top:192,right:576,bottom:480},soldiers:[{x:320,y:288},{x:512,y:288},{x:320,y:384},{x:512,y:384}],camps:[{name:'West raiders',x:40,y:160,units:['axeman','soldier','archer','soldier']},{name:'East raiders',x:792,y:160,units:['soldier','archer','soldier','mage']},{name:'West flank',x:40,y:480,units:['axeman','soldier','mage','archer']},{name:'East flank',x:792,y:480,units:['soldier','axeman','archer','soldier']}],objective:{kind:'defend',victory:'hold-waves',label:'Protect the village through both attacks',x:416,y:320,radius:96},waves:{...original('village').waves,count:2,bossHealth:0,damageScale:1.2}},'integration-required'),
 mission('plegian-gate','dark-castle',{commander:undefined,spawnEntries:[{x:448,y:16},{x:448,y:624}],heroCamp:{x:448,y:528,health:1000},courtyard:{left:256,top:448,right:640,bottom:608},soldierCount:2,soldiers:[{x:384,y:512},{x:512,y:512}],camps:[{name:'North patrol',x:128,y:128,units:['knight','soldier','archer','mage']},{name:'North watch',x:768,y:128,units:['archer','knight','soldier','mage']},{name:'West guard',x:128,y:352,units:['knight','archer','soldier','axeman']},{name:'East guard',x:768,y:352,units:['soldier','mage','archer','knight']}],objective:{kind:'advance',victory:'reach-exit',label:'Clear the gate patrols, then reach the northern flag',x:448,y:96,radius:96},waves:{...original('dark-castle').waves,count:2,bossHealth:0,hostileCap:14,damageScale:1}},'integration-required'),
 mission('village','village',{},'existing-map'),
 mission('valm-landing','east-road',{spawnEntries:[{x:16,y:272},{x:1264,y:272}],objective:{...original('east-road').objective,label:'Clear the Valmese patrols, then reach the inland flag'},camps:[{name:'Beach patrol',x:448,y:160,units:['knight','soldier','mage','archer']},{name:'South patrol',x:800,y:384,units:['soldier','archer','knight','mage']},{name:'Inland watch',x:1180,y:160,units:['mage','knight','archer','soldier']},{name:'Rear patrol',x:1180,y:384,units:['knight','archer','soldier','mage']}],waves:{...original('east-road').waves,hostileCap:16,damageScale:1.3}},'integration-required'),
 mission('castle-defense','castle-defense',{commander:undefined,soldiers:original('castle-defense').soldiers.slice(0,4),objective:{...original('castle-defense').objective,victory:'hold-waves',label:'Protect the castle through three assaults'},waves:{...original('castle-defense').waves,bossHealth:0,hostileCap:18,damageScale:1.3}},'integration-required'),
 mission('chonsin-pass','east-road',{commander:'yenfay',spawnEntries:[{x:16,y:272},{x:1008,y:272}],heroCamp:{x:160,y:272,health:1200},courtyard:{left:64,top:192,right:288,bottom:352},camps:[{name:'West guard',x:40,y:160,units:['assassin','soldier','archer','soldier']},{name:'East guard',x:984,y:160,units:['soldier','archer','assassin','knight']},{name:'West flank',x:40,y:384,units:['soldier','assassin','archer','mage']},{name:'East flank',x:984,y:384,units:['assassin','soldier','archer','knight']}],objective:{kind:'boss',victory:'defeat-commander',label:'Defeat Yen’fay at the pass',x:896,y:272,radius:96},waves:{...original('east-road').waves,count:2,bossHealth:1100,hostileCap:18,damageScale:1.4}},'integration-required'),
 mission('conqueror-hall','dark-castle',{commander:'walhart',spawnEntries:[{x:512,y:48},{x:512,y:720}],camps:[{name:'Throne sentry',x:128,y:112,units:['knight','heavy','archer','mage']},{name:'Imperial guard',x:896,y:112,units:['heavy','knight','mage','archer']},{name:'West sentry',x:128,y:384,units:['knight','mage','archer','heavy']},{name:'East sentry',x:896,y:384,units:['heavy','archer','knight','mage']}],objective:{...original('dark-castle').objective,label:'Defeat Walhart in his stronghold'},waves:{...original('dark-castle').waves,count:2,bossHealth:1500,hostileCap:20,damageScale:1.4}},'integration-required'),
 mission('grimleal-approach','village',{commander:'aversa',spawnEntries:[{x:416,y:16},{x:416,y:624}],heroCamp:{x:416,y:528,health:1000},companionBehavior:'follow',courtyard:{left:256,top:448,right:576,bottom:608},soldierCount:2,soldiers:[{x:352,y:480},{x:480,y:480}],camps:[{name:'West cultists',x:96,y:128,units:['mage','assassin','archer','knight']},{name:'East cultists',x:736,y:128,units:['mage','archer','assassin','soldier']},{name:'West ritual guard',x:96,y:320,units:['knight','mage','assassin','archer']},{name:'East ritual guard',x:736,y:320,units:['mage','soldier','archer','assassin']}],objective:{kind:'boss',victory:'defeat-commander',label:'Defeat Aversa and reach the Black Keep',x:416,y:128,radius:96},waves:{...original('village').waves,bossHealth:1300,hostileCap:20,damageScale:1.5}},'integration-required'),
 mission('dark-castle','dark-castle',{spawnEntries:[{x:512,y:48},{x:512,y:720}]},'existing-map'),
];
export function expandedMap(idOrIndex:MissionId|number):ExpandedMissionDefinition|undefined {return typeof idOrIndex==='number'?EXPANDED_CAMPAIGN_MAPS[idOrIndex]:EXPANDED_CAMPAIGN_MAPS.find(map=>map.id===idOrIndex);}
export function mapsForCampaign(campaignId:CampaignId='classic-four'):readonly MapDefinition[] {return campaignId==='awakening-ten'?EXPANDED_CAMPAIGN_MAPS:CAMPAIGN_MAPS;}
/** Deliberately returns undefined for unknown identity rather than loading chapter one. */
export function mapForCampaign(campaignId:CampaignId,idOrIndex:MissionId|number):MapDefinition|undefined {const maps=mapsForCampaign(campaignId);return typeof idOrIndex==='number'?maps[idOrIndex]:maps.find(map=>map.id===idOrIndex);}
