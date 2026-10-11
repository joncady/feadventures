import {HEROES,type Hero} from '../data/config';
import {canEquip,MAX_FORGE} from '../data/equipment';
import {STAT_KEYS} from './progression';
import type {CampaignState} from './campaign';
export const CAMPAIGN_SAVE_KEY='feadventures.campaign.v1';
export interface CampaignSave {version:1;savedAt:string;campaign:CampaignState}
export interface SaveStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
const number=(value:unknown,max=1000000)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max;
/** Reject incompatible or corrupt saves rather than passing unchecked data into combat. */
export function decodeCampaignSave(raw:string|null):CampaignSave|undefined {
 try {
  if(!raw)return;const save=JSON.parse(raw),state=save.campaign;
  if(save.version!==1||typeof save.savedAt!=='string'||!Number.isFinite(Date.parse(save.savedAt))||!state||!Number.isInteger(state.missionIndex)||state.missionIndex<0||state.missionIndex>4||!number(state.gold)||typeof state.complete!=='boolean'||state.complete!==(state.missionIndex===4)||!Array.isArray(state.members)||state.members.length<1||state.members.length>4)return;
  const seen=new Set();
  for(const member of state.members){
   if(!HEROES.includes(member.hero)||seen.has(member.hero)||!number(member.health,10000))return;seen.add(member.hero);
   const p=member.progress,l=member.loadout;
   if(!p||!Number.isInteger(p.level)||p.level<1||p.level>1000||!number(p.xp,99)||!p.stats||!p.base||STAT_KEYS.some(key=>!number(p.stats[key],10000)||!number(p.base[key],10000))||p.stats.hp<1||member.health>p.stats.hp)return;
   if(!l||!Array.isArray(l.items)||l.items.length<1||l.items.length>3||!Number.isInteger(l.equippedSlot)||l.equippedSlot<0||l.equippedSlot>=l.items.length)return;
   for(const item of l.items)if(!canEquip(member.hero as Hero,item)||(item.uses!==null&&(!Number.isInteger(item.uses)||item.uses<1))||(item.forge!==undefined&&(!Number.isInteger(item.forge)||item.forge<0||item.forge>MAX_FORGE)))return;
  }
  if(state.pendingResult){const r=state.pendingResult;if(state.complete||r.missionIndex!==state.missionIndex||typeof r.reason!=='string'||r.reason.length>500||!number(r.kills)||!number(r.elapsed)||!Number.isInteger(r.elapsed)||!number(r.gold)||!number(r.reward)||!Array.isArray(r.progressBefore)||r.progressBefore.length!==state.members.length)return;const before=new Set();for(const p of r.progressBefore){if(!seen.has(p.hero)||before.has(p.hero)||!Number.isInteger(p.level)||p.level<1||p.level>1000||!number(p.xp,99))return;before.add(p.hero);}}
  return structuredClone(save) as CampaignSave;
 }catch{return;}
}
export function loadCampaign(storage:SaveStorage):CampaignSave|undefined {try{return decodeCampaignSave(storage.getItem(CAMPAIGN_SAVE_KEY));}catch{return;}}
export function saveCampaign(storage:SaveStorage,campaign:CampaignState):boolean {try{storage.setItem(CAMPAIGN_SAVE_KEY,JSON.stringify({version:1,savedAt:new Date().toISOString(),campaign}));return true;}catch{return false;}}
