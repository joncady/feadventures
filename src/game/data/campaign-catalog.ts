/** Stable IDs are persisted; chapter numbers are presentation, never save identities. */
export const CLASSIC_MISSION_IDS = ['east-road','village','castle-defense','dark-castle'] as const;
export const EXPANDED_MISSION_IDS = ['east-road','village-watch','plegian-gate','village','valm-landing','castle-defense','chonsin-pass','conqueror-hall','grimleal-approach','dark-castle'] as const;
export type CampaignId = 'classic-four' | 'awakening-ten';
export type MissionId = typeof EXPANDED_MISSION_IDS[number];
export const DEFAULT_CAMPAIGN_ID:CampaignId = 'classic-four';
export function missionIds(campaign:CampaignId=DEFAULT_CAMPAIGN_ID):readonly MissionId[] {
 return campaign==='awakening-ten'?EXPANDED_MISSION_IDS:CLASSIC_MISSION_IDS;
}
export function isCampaignId(value:unknown):value is CampaignId {return value==='classic-four'||value==='awakening-ten';}
export function missionIdAt(index:number,campaign:CampaignId=DEFAULT_CAMPAIGN_ID):MissionId|undefined {return missionIds(campaign)[index];}
export function missionIndexFor(id:string,campaign:CampaignId=DEFAULT_CAMPAIGN_ID):number {return missionIds(campaign).findIndex(mission=>mission===id);}
export interface MissionChapter {
 id:MissionId;title:string;arc:'plegia'|'valm'|'grimleal';
 targetSeconds:number;enemyLevel:number;rewardGold:number;
 /** Advance gates must be authored per route; no global X-coordinate array. */
 advanceGates?:readonly {x:number;y:number;radius:number}[];
 plannedCommander?:'gangrel'|'yenfay'|'walhart'|'aversa'|'validar';
}
export const EXPANDED_CHAPTERS:readonly MissionChapter[]=[
 {id:'east-road',title:'Reports from the East',arc:'plegia',targetSeconds:150,enemyLevel:1,rewardGold:80,advanceGates:[{x:448,y:272,radius:110},{x:832,y:272,radius:110},{x:1184,y:272,radius:110}]},
 {id:'village-watch',title:'The Village Watch',arc:'plegia',targetSeconds:180,enemyLevel:2,rewardGold:100},
 {id:'plegian-gate',title:'Through the Plegian Gate',arc:'plegia',targetSeconds:180,enemyLevel:3,rewardGold:110,advanceGates:[{x:448,y:352,radius:100},{x:448,y:96,radius:100}]},
 {id:'village',title:'The Mad King',arc:'plegia',targetSeconds:195,enemyLevel:4,rewardGold:150,plannedCommander:'gangrel'},
 {id:'valm-landing',title:'A Valmese Foothold',arc:'valm',targetSeconds:180,enemyLevel:5,rewardGold:120,advanceGates:[{x:448,y:272,radius:110},{x:832,y:272,radius:110},{x:1184,y:272,radius:110}]},
 {id:'castle-defense',title:'The Castle Siege',arc:'valm',targetSeconds:195,enemyLevel:6,rewardGold:140},
 {id:'chonsin-pass',title:'The Chon’sin Pass',arc:'valm',targetSeconds:180,enemyLevel:7,rewardGold:160,plannedCommander:'yenfay'},
 {id:'conqueror-hall',title:'The Conqueror',arc:'valm',targetSeconds:210,enemyLevel:8,rewardGold:180,plannedCommander:'walhart'},
 {id:'grimleal-approach',title:'The Grimleal Approach',arc:'grimleal',targetSeconds:195,enemyLevel:9,rewardGold:180,plannedCommander:'aversa'},
 {id:'dark-castle',title:'Break the Black Keep',arc:'grimleal',targetSeconds:225,enemyLevel:10,rewardGold:200,plannedCommander:'validar'},
];
export function chapterFor(id:MissionId):MissionChapter {return EXPANDED_CHAPTERS.find(chapter=>chapter.id===id)!;}
