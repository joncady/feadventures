import { HERO_PROFILES, type Hero } from './config';
import type { WeaponType } from '../systems/combat';

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
  drain?: number;
  criticalBonus?: number;
  healingBonus?: number;
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
 falchion:variant('iron-sword','falchion','Falchion',{}),
 'parallel-falchion':variant('iron-sword','parallel-falchion','Parallel Falchion',{}),
 'steel-bow':variant('iron-bow','steel-bow','Steel Bow',{damage:46,cooldown:740}),
 'steel-lance':variant('iron-lance','steel-lance','Steel Lance',{damage:46,cooldown:580}),
 'steel-axe':variant('iron-axe','steel-axe','Steel Axe',{damage:48,cooldown:600}),
 'killing-edge':variant('iron-sword','killing-edge','Killing Edge',{damage:32,cooldown:430,criticalBonus:20}),
 thunder:variant('fire','thunder','Thunder',{range:360,damage:38,cooldown:850}),
 nosferatu:variant('fire','nosferatu','Nosferatu',{range:220,damage:26,cooldown:950,drain:.5}),
 heal:{id:'heal',name:'Heal',type:'staff',icon:'weapon-staff',range:180,minRange:0,damage:0,cooldown:1800,effect:'heal'},
});
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
 return {...base,name:`${base.name} +${forge}`,damage:base.damage+(base.type==='staff'?0:2*forge),healingBonus:(base.healingBonus??0)+(base.type==='staff'?2*forge:0)};
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
  return Boolean(weapon && item.uses !== 0 && permissions[CLASS_NAMES[hero]].includes(weapon.type));
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
