import {HEROES,type Hero} from '../data/config';
import {canEquip,MAX_FORGE,migrateLegacyRestrictedLoadout,WEAPONS,CLASS_NAMES,type InventoryItem,type Loadout} from '../data/equipment';
import {STAT_KEYS} from './progression';
import type {CampaignState,LegacyEquipmentNotice} from './campaign';
import {isCampaignId,missionIds,missionIdAt,missionIndexFor,type CampaignId,type MissionId} from '../data/campaign-catalog';
export const CAMPAIGN_SAVE_KEY='feadventures.campaign.v1';
export const LEGACY_CAMPAIGN_BACKUP_KEY='feadventures.campaign.v1.backup';
export interface CampaignSave {version:2;savedAt:string;campaignId:CampaignId;missionId:MissionId|null;campaign:CampaignState}
export interface SaveStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
const number=(value:unknown,max=1000000)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max;
/** Only formerly class-valid items qualify for restriction migration; malformed saves never do. */
function rawLegacyLoadoutValid(hero:Hero,loadout:Loadout):boolean {
 if(!loadout||!Array.isArray(loadout.items)||loadout.items.length<1||loadout.items.length>3||!Number.isInteger(loadout.equippedSlot)||loadout.equippedSlot<0||loadout.equippedSlot>=loadout.items.length)return false;
 return loadout.items.every((item:InventoryItem)=>{
  if(!item||!WEAPONS[item.weaponId]||(item.uses!==null&&(!Number.isInteger(item.uses)||item.uses!<1))||(item.forge!==undefined&&(!Number.isInteger(item.forge)||item.forge<0||item.forge>MAX_FORGE)))return false;
  if(canEquip(hero,item))return true;
  if(item.weaponId==='nosferatu')return ['Dark Mage','Mage','Sage','Tactician'].includes(CLASS_NAMES[hero]);
  if(item.weaponId==='falchion'||item.weaponId==='parallel-falchion')return ['Lord','Great Knight','Myrmidon','Tactician','Cavalier'].includes(CLASS_NAMES[hero]);
  return false;
 });
}
/** Reject incompatible or corrupt saves rather than passing unchecked data into combat. */
export function decodeCampaignSave(raw:string|null):CampaignSave|undefined {
 try {
  if(!raw)return;const save=JSON.parse(raw),state=save.campaign;
  if((save.version!==1&&save.version!==2)||typeof save.savedAt!=='string'||!Number.isFinite(Date.parse(save.savedAt))||!state)return;
  const campaignId:CampaignId=save.version===1?'classic-four':save.campaignId;
  if(!isCampaignId(campaignId)||!Number.isInteger(state.missionIndex)||state.missionIndex<0||typeof state.complete!=='boolean')return;
  const count=missionIds(campaignId).length;
  if(save.version===1){if(state.missionIndex>count||state.complete!==(state.missionIndex===count)||(state.campaignId!==undefined&&state.campaignId!=='classic-four'))return;}
  else {
   if(state.campaignId!==undefined&&state.campaignId!==campaignId)return;
   if(state.complete){if(save.missionId!==null||state.missionIndex!==count||state.missionId!==undefined)return;}
   else {const index=typeof save.missionId==='string'?missionIndexFor(save.missionId,campaignId):-1;if(index<0||(state.missionId!==undefined&&state.missionId!==save.missionId))return;state.missionIndex=index;}
  }
  if(!number(state.gold,save.version===2&&state.migrationNotice?1022950:1000000)||!Array.isArray(state.members)||state.members.length<1||state.members.length>4)return;
  if(state.reserve!==undefined&&(!Array.isArray(state.reserve)||state.reserve.length>HEROES.length-state.members.length))return;
  const notice:LegacyEquipmentNotice={kind:'legacy-equipment',refundGold:0,items:[],acknowledged:false};
  const seen=new Set();
  for(const member of [...state.members,...(state.reserve??[])]){
   if(!HEROES.includes(member.hero)||seen.has(member.hero)||!number(member.health,10000))return;seen.add(member.hero);
   if(save.version===1){
    if(!rawLegacyLoadoutValid(member.hero as Hero,member.loadout))return;
    for(const item of member.loadout.items as InventoryItem[])if(!canEquip(member.hero as Hero,item)){
     const forge=item.forge??0;notice.items.push({hero:member.hero,weaponId:item.weaponId,forge});
     // Actual v1 shop price: Nosferatu150; personal Falchions were not sold. Old forging100/tier.
     notice.refundGold+=(item.weaponId==='nosferatu'?150:0)+100*forge;
    }
    member.loadout=migrateLegacyRestrictedLoadout(member.hero as Hero,member.loadout);
   }
   const p=member.progress,l=member.loadout;
   if(!p||!Number.isInteger(p.level)||p.level<1||p.level>1000||!number(p.xp,99)||!p.stats||!p.base||STAT_KEYS.some(key=>!number(p.stats[key],10000)||!number(p.base[key],10000))||p.stats.hp<1||member.health>p.stats.hp)return;
   if(!l||!Array.isArray(l.items)||l.items.length<1||l.items.length>3||!Number.isInteger(l.equippedSlot)||l.equippedSlot<0||l.equippedSlot>=l.items.length)return;
   for(const item of l.items)if(!canEquip(member.hero as Hero,item)||(item.uses!==null&&(!Number.isInteger(item.uses)||item.uses<1))||(item.forge!==undefined&&(!Number.isInteger(item.forge)||item.forge<0||item.forge>MAX_FORGE)))return;
  }
  if(state.pendingResult){const r=state.pendingResult;if(save.version===2&&r.missionId!==undefined){if(r.missionId!==save.missionId)return;r.missionIndex=state.missionIndex;}if(state.complete||r.missionIndex!==state.missionIndex||(r.missionId!==undefined&&r.missionId!==missionIdAt(state.missionIndex,campaignId))||typeof r.reason!=='string'||r.reason.length>500||!number(r.kills)||!number(r.elapsed)||!Number.isInteger(r.elapsed)||!number(r.gold)||!number(r.reward)||!Array.isArray(r.progressBefore)||r.progressBefore.length!==state.members.length)return;const before=new Set();for(const p of r.progressBefore){if(!state.members.some((member:{hero:string})=>member.hero===p.hero)||before.has(p.hero)||!Number.isInteger(p.level)||p.level<1||p.level>1000||!number(p.xp,99))return;before.add(p.hero);}}
  if(save.version===2&&campaignId==='awakening-ten'){state.campaignId=campaignId;state.missionId=missionIdAt(state.missionIndex,campaignId);}
  if(save.version===1&&notice.items.length){state.gold+=notice.refundGold;state.migrationNotice=notice;}
  if(!number(state.gold,1022950))return;
  if(state.migrationNotice){const n=state.migrationNotice;if(n.kind!=='legacy-equipment'||!number(n.refundGold)||typeof n.acknowledged!=='boolean'||!Array.isArray(n.items)||n.items.length<1||n.items.length>HEROES.length*3||n.items.some((item:{hero:Hero;weaponId:string;forge:number})=>!HEROES.includes(item.hero)||!['nosferatu','falchion','parallel-falchion'].includes(item.weaponId)||!Number.isInteger(item.forge)||item.forge<0||item.forge>MAX_FORGE))return;}
  return {version:2,savedAt:save.savedAt,campaignId,missionId:missionIdAt(state.missionIndex,campaignId)??null,campaign:structuredClone(state)};
 }catch{return;}
}
/** Never overwrite a valid original checkpoint without first keeping its exact bytes. */
function preserveLegacyBackup(storage:SaveStorage):void {const raw=storage.getItem(CAMPAIGN_SAVE_KEY);if(!raw)return;let legacy=false;try{legacy=JSON.parse(raw).version===1;}catch{return;}if(legacy&&decodeCampaignSave(raw)&&storage.getItem(LEGACY_CAMPAIGN_BACKUP_KEY)===null)storage.setItem(LEGACY_CAMPAIGN_BACKUP_KEY,raw);}
export function loadCampaign(storage:SaveStorage):CampaignSave|undefined {try{const raw=storage.getItem(CAMPAIGN_SAVE_KEY),decoded=decodeCampaignSave(raw);if(decoded&&raw&&JSON.parse(raw).version===1)saveCampaign(storage,decoded.campaign);return decoded;}catch{return;}}
export function saveCampaign(storage:SaveStorage,campaign:CampaignState):boolean {try{const campaignId=campaign.campaignId??'classic-four',state=structuredClone(campaign),missionId=missionIdAt(state.missionIndex,campaignId);if(state.campaignId!==undefined)state.missionId=missionId;if(state.pendingResult&&state.campaignId!==undefined)state.pendingResult.missionId=missionId;const save={version:2,savedAt:new Date().toISOString(),campaignId,missionId:missionId??null,campaign:state};preserveLegacyBackup(storage);storage.setItem(CAMPAIGN_SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
