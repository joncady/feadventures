import {type Hero} from '../data/config';
import {canEquip,initialLoadout,WEAPONS,FORGE_COST,MAX_FORGE,type Loadout} from '../data/equipment';
import {newProgress,type Progress} from './progression';
export interface CampaignMember {hero:Hero;progress:Progress;loadout:Loadout;health:number}
export interface MissionResult {missionIndex:number;reason:string;kills:number;elapsed:number;gold:number;reward:number;progressBefore:{hero:Hero;level:number;xp:number}[]}
export interface CampaignState {missionIndex:number;gold:number;members:CampaignMember[];complete:boolean;pendingResult?:MissionResult}
/** Progress and rewards are committed once at victory; Continue only advances. */
export function completeMission(state:CampaignState,result:MissionResult,members:CampaignMember[]):boolean {if(state.pendingResult||state.complete||result.missionIndex!==state.missionIndex)return false;state.members=cloneMembers(members);state.gold+=result.gold+result.reward;state.pendingResult=structuredClone(result);return true;}
export function acceptMissionResult(state:CampaignState):boolean {if(!state.pendingResult)return false;delete state.pendingResult;state.missionIndex++;state.complete=state.missionIndex>=4;state.members.forEach(member=>member.health=member.progress.stats.hp);return true;}
export const SHOP_PRICES:Record<string,number>={'steel-lance':120,'steel-axe':120,'steel-bow':120,'killing-edge':150,thunder:120,nosferatu:150,heal:100,'iron-sword':70,'iron-lance':70,'iron-axe':70,'iron-bow':70,fire:70};
export function newCampaign(party:Hero[]):CampaignState {return {missionIndex:0,gold:120,members:party.map(hero=>({hero,health:100,progress:newProgress(),loadout:initialLoadout(hero)})),complete:false};}
export function cloneMembers(members:CampaignMember[]):CampaignMember[]{return structuredClone(members);}
export function buyCampaignItem(state:CampaignState,hero:Hero,itemId:string):boolean {const member=state.members.find(m=>m.hero===hero),price=SHOP_PRICES[itemId];if(!member||!WEAPONS[itemId]||!price||state.gold<price||member.loadout.items.some(item=>item.weaponId===itemId)||!canEquip(hero,{weaponId:itemId,uses:null}))return false;const item={weaponId:itemId,uses:null};if(member.loadout.items.length<3)member.loadout.items.push(item);else member.loadout.items[member.loadout.equippedSlot]=item;state.gold-=price;return true;}
export function upgradeCampaignItem(state:CampaignState,hero:Hero,slot:number):boolean {
 const member=state.members.find(m=>m.hero===hero);
 if(!member||!Number.isInteger(slot)||slot<0||state.gold<FORGE_COST)return false;
 const item=member.loadout.items[slot];
 if(!item||!canEquip(hero,item))return false;
 const forge=item.forge??0;
 if(!Number.isInteger(forge)||forge<0||forge>=MAX_FORGE)return false;
 item.forge=forge+1;state.gold-=FORGE_COST;return true;
}
