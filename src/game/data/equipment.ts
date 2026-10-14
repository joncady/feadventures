import { HERO_PROFILES, type Hero } from './config';
import type { WeaponType, DamageKind, EffectivenessTag } from '../systems/combat';

export type WeaponTier = 1 | 2 | 3 | 4;
export type AttackShape = {kind:'cone';angle:number} | {kind:'projectile';pierce:number} | {kind:'impact';radius:number;maxTargets:number} | {kind:'line';width:number};
export interface WeaponCapabilities {shape:AttackShape;windupMs:number;recoveryMs:number;burst?:{count:number;intervalMs:number};healing?:{kind:'single'|'area';radius:number;maxTargets:number};}
export interface WeaponDefinition {
  id: string;
  name: string;
  type: WeaponType;
  icon: string;
  range: number;
  minRange: number;
  damage: number;
  cooldown: number;
  effect: string;
  damageKind?: DamageKind;
  effectiveAgainst?: readonly EffectivenessTag[];
  drain?: number;
  criticalBonus?: number;
  healingBonus?: number;
  tier?: WeaponTier;
  unlockMission?: number;
  capabilities?: WeaponCapabilities;
  allowedHeroes?: readonly Hero[];
  allowedClasses?: readonly string[];
}
export interface InventoryItem { weaponId: string; uses: number | null; forge?: number; }
export interface Loadout { items: InventoryItem[]; equippedSlot: number; }
export const INVENTORY_CAPACITY = 3;
export type WeaponRank = 'E' | 'D' | 'C' | 'B' | 'A';
export interface Proficiency { type: WeaponType; rank: WeaponRank; }
// Preserve the reviewed survival balance while separating equipment from characters.
export const WEAPONS: Record<string, WeaponDefinition> = {
  'iron-sword': { id:'iron-sword',name:'Iron Sword',type:'sword',icon:'weapon-sword',range:85,minRange:0,damage:35,cooldown:320,effect:'attack' },
  'iron-lance': { id:'iron-lance',name:'Iron Lance',type:'lance',icon:'weapon-lance',range:110,minRange:0,damage:35,cooldown:380,effect:'lance-thrust' },
  'iron-axe': { id:'iron-axe',name:'Iron Axe',type:'axe',icon:'weapon-axe',range:85,minRange:0,damage:35,cooldown:380,effect:'axe-impact' },
  'iron-bow': { id:'iron-bow',name:'Iron Bow',type:'bow',icon:'weapon-bow',range:420,minRange:90,damage:35,cooldown:520,effect:'arrow-fire' },
  fire: { id:'fire',name:'Fire',type:'tome',icon:'weapon-tome',range:300,minRange:0,damage:30,cooldown:600,effect:'fire-cast' },
};
// Awakening weapon families, with ranges and timing adapted for real-time play.
function variant(base:string,id:string,name:string,changes:Partial<WeaponDefinition>):WeaponDefinition {
 return {...WEAPONS[base],id,name,...changes};
}
Object.assign(WEAPONS,{
 falchion:variant('iron-sword','falchion','Falchion',{allowedHeroes:['chrom'],effectiveAgainst:['dragon']}),
 'parallel-falchion':variant('iron-sword','parallel-falchion','Parallel Falchion',{allowedHeroes:['lucina'],effectiveAgainst:['dragon']}),
 'steel-bow':variant('iron-bow','steel-bow','Steel Bow',{damage:46,cooldown:740}),
 'steel-lance':variant('iron-lance','steel-lance','Steel Lance',{damage:46,cooldown:580}),
 'steel-axe':variant('iron-axe','steel-axe','Steel Axe',{damage:48,cooldown:600}),
 'killing-edge':variant('iron-sword','killing-edge','Killing Edge',{damage:32,cooldown:430,criticalBonus:20}),
 thunder:variant('fire','thunder','Thunder',{range:360,damage:38,cooldown:850}),
 wind:variant('fire','wind','Wind',{range:340,damage:26,cooldown:650,damageKind:'magical',effectiveAgainst:['flying']}),
 nosferatu:variant('fire','nosferatu','Nosferatu',{range:220,damage:26,cooldown:950,drain:.5,allowedClasses:['Dark Mage','Sorcerer']}),
 heal:{id:'heal',name:'Heal',type:'staff',icon:'weapon-staff',range:180,minRange:0,damage:0,cooldown:1800,effect:'heal'},
});
// Authored real-time capabilities. Fire-family area damage is an adaptation, not Awakening's turn-based behavior.
Object.assign(WEAPONS, {
 'steel-sword':variant('iron-sword','steel-sword','Steel Sword',{damage:46,cooldown:580,tier:2,unlockMission:3}),
 rapier:variant('iron-sword','rapier','Rapier',{damage:30,cooldown:480,tier:2,unlockMission:3,allowedHeroes:['chrom','lucina'],effectiveAgainst:['armored','mounted']}),
 armourslayer:variant('iron-sword','armourslayer','Armourslayer',{damage:32,cooldown:620,tier:2,unlockMission:3,effectiveAgainst:['armored']}),
 javelin:variant('iron-lance','javelin','Javelin',{range:250,damage:29,cooldown:720,tier:2,unlockMission:3,capabilities:{shape:{kind:'projectile',pierce:0},windupMs:100,recoveryMs:620}}),
 hammer:variant('iron-axe','hammer','Hammer',{damage:34,cooldown:760,tier:2,unlockMission:3,effectiveAgainst:['armored']}),
 'hand-axe':variant('iron-axe','hand-axe','Hand Axe',{range:230,damage:30,cooldown:780,tier:2,unlockMission:3,capabilities:{shape:{kind:'projectile',pierce:0},windupMs:120,recoveryMs:660}}),
 'beast-killer':variant('iron-lance','beast-killer','Beast Killer',{damage:33,cooldown:640,tier:2,unlockMission:4,effectiveAgainst:['mounted']}),
 elfire:variant('fire','elfire','Elfire',{damage:30,cooldown:800,tier:2,unlockMission:3,capabilities:{shape:{kind:'impact',radius:48,maxTargets:4},windupMs:100,recoveryMs:700}}),
 mend:variant('heal','mend','Mend',{healingBonus:8,cooldown:2300,tier:2,unlockMission:3}),
 'silver-sword':variant('iron-sword','silver-sword','Silver Sword',{damage:53,cooldown:620,tier:3,unlockMission:6}),
 'silver-lance':variant('iron-lance','silver-lance','Silver Lance',{damage:55,cooldown:690,tier:3,unlockMission:6}),
 'silver-axe':variant('iron-axe','silver-axe','Silver Axe',{damage:58,cooldown:820,tier:3,unlockMission:6}),
 'silver-bow':variant('iron-bow','silver-bow','Silver Bow',{damage:53,cooldown:850,tier:3,unlockMission:6}),
 'levin-sword':variant('iron-sword','levin-sword','Levin Sword',{damage:35,range:250,cooldown:880,damageKind:'magical',tier:3,unlockMission:6,capabilities:{shape:{kind:'projectile',pierce:0},windupMs:100,recoveryMs:780}}),
 'killer-bow':variant('iron-bow','killer-bow','Killer Bow',{damage:32,cooldown:720,criticalBonus:20,tier:3,unlockMission:6}),
 'killer-axe':variant('iron-axe','killer-axe','Killer Axe',{damage:36,cooldown:690,criticalBonus:20,tier:3,unlockMission:6}),
 longbow:variant('iron-bow','longbow','Longbow',{range:540,minRange:140,damage:38,cooldown:980,tier:3,unlockMission:6}),
 arcfire:variant('fire','arcfire','Arcfire',{damage:33,cooldown:950,tier:3,unlockMission:6,capabilities:{shape:{kind:'impact',radius:64,maxTargets:5},windupMs:140,recoveryMs:810}}),
 physic:variant('heal','physic','Physic',{range:400,healingBonus:4,cooldown:2800,tier:3,unlockMission:6}),
 bolganone:variant('fire','bolganone','Bolganone',{damage:36,cooldown:1200,tier:4,unlockMission:9,capabilities:{shape:{kind:'impact',radius:80,maxTargets:6},windupMs:200,recoveryMs:1000}}),
 thoron:variant('fire','thoron','Thoron',{damage:44,range:400,cooldown:1100,criticalBonus:10,tier:4,unlockMission:9,capabilities:{shape:{kind:'line',width:32},windupMs:200,recoveryMs:900}}),
 'brave-sword':variant('iron-sword','brave-sword','Brave Sword',{damage:29,cooldown:950,tier:4,unlockMission:9,capabilities:{shape:{kind:'cone',angle:100},windupMs:100,recoveryMs:850,burst:{count:2,intervalMs:140}}}),
 'brave-axe':variant('iron-axe','brave-axe','Brave Axe',{damage:32,cooldown:1200,tier:4,unlockMission:9,capabilities:{shape:{kind:'cone',angle:130},windupMs:180,recoveryMs:1020,burst:{count:2,intervalMs:180}}}),
 'brave-bow':variant('iron-bow','brave-bow','Brave Bow',{damage:29,cooldown:1100,tier:4,unlockMission:9,capabilities:{shape:{kind:'projectile',pierce:0},windupMs:120,recoveryMs:980,burst:{count:2,intervalMs:180}}}),
 fortify:variant('heal','fortify','Fortify',{range:240,healingBonus:2,cooldown:6000,tier:4,unlockMission:9,capabilities:{shape:{kind:'impact',radius:240,maxTargets:4},windupMs:150,recoveryMs:5850,healing:{kind:'area',radius:240,maxTargets:4}}}),
});
/** Existing starters remain available immediately; advanced shop items have authored mission gates. */
export function shopWeaponIds(missionOrdinal:number):string[] {return Object.values(WEAPONS).filter(w=>!w.allowedHeroes && (w.unlockMission??1)<=missionOrdinal).map(w=>w.id);}
// Two or three class-valid actions per hero; switching never refills the attack timer.
const starterItems: Record<Hero,readonly string[]> = {
  chrom:['falchion','iron-sword'],lucina:['parallel-falchion','iron-sword'],
  frederick:['iron-lance','iron-sword','iron-axe'],virion:['iron-bow','steel-bow'],
  sumia:['iron-lance','steel-lance'],cordelia:['iron-lance','steel-lance'],
  morgan:['fire','iron-sword','thunder'],robin:['fire','iron-sword','thunder'],'robin-female':['fire','iron-sword','thunder'],
  lissa:['heal','iron-axe'],lonqu:['iron-sword','killing-edge'],miriel:['fire','thunder','heal'],ricken:['fire','thunder'],
  stahl:['iron-sword','iron-lance'],sully:['iron-lance','iron-sword'],tharja:['fire','nosferatu'],vaike:['iron-axe','steel-axe'],
};
export function initialLoadout(hero:Hero):Loadout { return {items:starterItems[hero].map(weaponId=>({weaponId,uses:null})),equippedSlot:0}; }
export const MAX_FORGE = 3;
export const FORGE_COST = 100;
/** Derive per-item power without mutating the shared definition or changing weapon identity. */
export function itemWeapon(item:InventoryItem):WeaponDefinition {
 const base=WEAPONS[item.weaponId];
 const forge=Number.isFinite(item.forge)?Math.max(0,Math.min(MAX_FORGE,Math.floor(item.forge!))):0;
 if(!forge)return base;
 const capabilities=base.capabilities?structuredClone(base.capabilities):undefined;
 if(capabilities?.shape.kind==='impact'&&base.type==='tome')capabilities.shape.radius+=4*forge;
 return {...base,...(capabilities?{capabilities}:{}),name:`${base.name} +${forge}`,damage:base.damage+(base.type==='staff'?0:2*forge),healingBonus:(base.healingBonus??0)+(base.type==='staff'?2*forge:0)};
}
export function equippedWeapon(loadout:Loadout):WeaponDefinition {return itemWeapon(loadout.items[loadout.equippedSlot]);}
export const CLASS_NAMES: Record<Hero,string> = {chrom:'Lord',lucina:'Lord',frederick:'Great Knight',virion:'Archer',sumia:'Pegasus Knight',cordelia:'Pegasus Knight',morgan:'Tactician',robin:'Tactician','robin-female':'Tactician',lissa:'War Cleric',lonqu:'Myrmidon',miriel:'Sage',ricken:'Mage',stahl:'Cavalier',sully:'Cavalier',tharja:'Dark Mage',vaike:'Fighter'};

// Class permissions are separate from inventory: owning an item does not permit equipping it.
const permissions: Record<string, readonly WeaponType[]> = {
  Lord:['sword'], 'Great Knight':['sword','lance','axe'], Archer:['bow'],
  'Pegasus Knight':['lance'], Tactician:['sword','tome'], 'War Cleric':['axe','staff'],
  Myrmidon:['sword'], Sage:['tome','staff'], Mage:['tome'], Cavalier:['sword','lance'], 'Dark Mage':['tome'], Fighter:['axe'],
};
export function canEquip(hero:Hero,item:InventoryItem):boolean {
  const weapon=WEAPONS[item.weaponId];
  return Boolean(weapon && item.uses !== 0 && permissions[CLASS_NAMES[hero]].includes(weapon.type) && (!weapon.allowedHeroes||weapon.allowedHeroes.includes(hero)) && (!weapon.allowedClasses||weapon.allowedClasses.includes(CLASS_NAMES[hero])));
}
export function equip(loadout:Loadout,hero:Hero,slot:number):boolean {
  if(!Number.isInteger(slot)||slot<0||slot>=Math.min(loadout.items.length,INVENTORY_CAPACITY)||!canEquip(hero,loadout.items[slot]))return false;
  loadout.equippedSlot=slot;return true;
}

export function cycleWeapon(loadout:Loadout,hero:Hero,direction=1):boolean {
 const count=Math.min(INVENTORY_CAPACITY,loadout.items.length);
 for(let offset=1;offset<count;offset++){
  const slot=((loadout.equippedSlot+offset*Math.sign(direction || 1))%count+count)%count;
  if(equip(loadout,hero,slot))return true;
 }return false;
}
export function weaponProfile(hero:Hero,loadout:Loadout) {
 const weapon=equippedWeapon(loadout);
 return {...HERO_PROFILES[hero],...weapon,weapon:weapon.type};
}

/** Repair only newly restricted items in legacy-v1 bags; all other invalid data remains invalid. */
export function migrateLegacyRestrictedLoadout(hero:Hero,loadout:Loadout):Loadout {
 const newlyForbidden=(item:InventoryItem)=>item.weaponId==='nosferatu'?CLASS_NAMES[hero]!=='Dark Mage':item.weaponId==='falchion'?hero!=='chrom':item.weaponId==='parallel-falchion'?hero!=='lucina':false;
 const changed=loadout.items.some(newlyForbidden);
 if(!changed)return loadout;
 const permitted=loadout.items.filter(item=>!newlyForbidden(item));
 // Preserve all unaffected gear and restore a class-valid starter only when the bag becomes empty.
 const items=permitted.length?permitted:initialLoadout(hero).items.slice(0,1);
 const equipped=loadout.items[loadout.equippedSlot];
 return {items,equippedSlot:Math.max(0,items.indexOf(equipped))};
}
