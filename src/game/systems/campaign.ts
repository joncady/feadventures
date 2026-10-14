import {HEROES,type Hero} from '../data/config';
import {canEquip,initialLoadout,WEAPONS,FORGE_COST,MAX_FORGE,type Loadout} from '../data/equipment';
import {newProgress,type Progress} from './progression';
import {missionIds,missionIdAt,type CampaignId,type MissionId} from '../data/campaign-catalog';
export interface CampaignMember {hero:Hero;progress:Progress;loadout:Loadout;health:number}
export interface MissionResult {missionIndex:number;missionId?:MissionId;reason:string;kills:number;elapsed:number;gold:number;reward:number;progressBefore:{hero:Hero;level:number;xp:number}[]}
export interface LegacyEquipmentNotice {kind:'legacy-equipment';refundGold:number;items:{hero:Hero;weaponId:string;forge:number}[];acknowledged:boolean}
export interface CampaignState {campaignId?:CampaignId;missionId?:MissionId;missionIndex:number;gold:number;members:CampaignMember[];reserve?:CampaignMember[];complete:boolean;pendingResult?:MissionResult;migrationNotice?:LegacyEquipmentNotice}
/** Progress and rewards are committed once at victory; Continue only advances. */
export function completeMission(state:CampaignState,result:MissionResult,members:CampaignMember[]):boolean {const id=missionIdAt(state.missionIndex,state.campaignId);if(state.pendingResult||state.complete||!id||result.missionIndex!==state.missionIndex||(result.missionId!==undefined&&result.missionId!==id))return false;state.members=cloneMembers(members);state.gold+=result.gold+result.reward;state.pendingResult=structuredClone(result);return true;}
export function acceptMissionResult(state:CampaignState):boolean {if(!state.pendingResult)return false;delete state.pendingResult;state.missionIndex++;state.complete=state.missionIndex>=missionIds(state.campaignId).length;if(state.campaignId!==undefined){state.missionId=missionIdAt(state.missionIndex,state.campaignId);}state.members.forEach(member=>member.health=member.progress.stats.hp);return true;}
export const SHOP_PRICES:Record<string,number>={'steel-lance':120,'steel-axe':120,'steel-bow':120,'killing-edge':150,thunder:120,wind:90,nosferatu:150,heal:100,'iron-sword':70,'iron-lance':70,'iron-axe':70,'iron-bow':70,fire:70,'steel-sword':120,rapier:160,armourslayer:160,javelin:140,hammer:160,'hand-axe':140,'beast-killer':160,elfire:160,mend:140,'silver-sword':230,'silver-lance':230,'silver-axe':240,'silver-bow':230,'levin-sword':240,'killer-bow':240,'killer-axe':240,longbow:260,arcfire:250,physic:240,bolganone:360,thoron:360,'brave-sword':380,'brave-axe':380,'brave-bow':380,fortify:380};
export function campaignForgeCost(campaignId:CampaignId|undefined,forge:number):number {return campaignId==='awakening-ten'?[100,180,280][Math.min(2,Math.max(0,forge))]:FORGE_COST;}
export function newCampaign(party:Hero[],campaignId?:CampaignId):CampaignState {return {...(campaignId!==undefined?{campaignId,missionId:missionIdAt(0,campaignId)}:{}),missionIndex:0,gold:120,members:party.map(hero=>({hero,health:100,progress:newProgress(),loadout:initialLoadout(hero)})),complete:false};}
export function cloneMembers(members:CampaignMember[]):CampaignMember[]{return structuredClone(members);}
export function buyCampaignItem(state:CampaignState,hero:Hero,itemId:string):boolean {const member=state.members.find(m=>m.hero===hero),price=SHOP_PRICES[itemId];if(!member||!WEAPONS[itemId]||!price||(state.campaignId==='awakening-ten'&&(WEAPONS[itemId].unlockMission??1)>state.missionIndex+1)||state.gold<price||member.loadout.items.some(item=>item.weaponId===itemId)||!canEquip(hero,{weaponId:itemId,uses:null}))return false;const item={weaponId:itemId,uses:null};if(member.loadout.items.length<3)member.loadout.items.push(item);else member.loadout.items[member.loadout.equippedSlot]=item;state.gold-=price;return true;}
export function upgradeCampaignItem(state:CampaignState,hero:Hero,slot:number):boolean {
 const member=state.members.find(m=>m.hero===hero);
 if(!member||!Number.isInteger(slot)||slot<0)return false;
 const item=member.loadout.items[slot];
 if(!item||!canEquip(hero,item))return false;
 const forge=item.forge??0;
 const cost=campaignForgeCost(state.campaignId,forge);
 if(!Number.isInteger(forge)||forge<0||forge>=MAX_FORGE||state.gold<cost)return false;
 item.forge=forge+1;state.gold-=cost;return true;
}

/** Reorder active party without discarding benched heroes' earned XP or equipment. */
export function changeCampaignParty(state:CampaignState,party:Hero[]):boolean {
 if(state.complete||state.pendingResult||party.length<1||party.length>4||party.some(hero=>!HEROES.includes(hero))||new Set(party).size!==party.length)return false;
 const roster=cloneMembers([...state.members,...(state.reserve??[])]);
 const selected=party.map(hero=>roster.find(member=>member.hero===hero)??newCampaign([hero]).members[0]);
 state.members=cloneMembers(selected);state.reserve=roster.filter(member=>!party.includes(member.hero));return true;
}
