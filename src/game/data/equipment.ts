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
}
export interface InventoryItem { weaponId: string; uses: number | null; }
export interface Loadout { items: InventoryItem[]; equippedSlot: number; }
export const INVENTORY_CAPACITY = 5;
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
const initialWeapon: Record<WeaponType,string> = { sword:'iron-sword',lance:'iron-lance',axe:'iron-axe',bow:'iron-bow',tome:'fire' };
export function initialLoadout(hero:Hero):Loadout { return { items:[{weaponId:initialWeapon[HERO_PROFILES[hero].weapon],uses:null}],equippedSlot:0 }; }
export function equippedWeapon(loadout:Loadout):WeaponDefinition { return WEAPONS[loadout.items[loadout.equippedSlot].weaponId]; }
export const CLASS_NAMES: Record<Hero,string> = {chrom:'Lord',lucina:'Lord',frederick:'Great Knight',virion:'Archer',sumia:'Pegasus Knight',cordelia:'Pegasus Knight',morgan:'Tactician',robin:'Tactician','robin-female':'Tactician',lissa:'War Cleric',lonqu:'Myrmidon',miriel:'Mage',ricken:'Mage',stahl:'Cavalier',sully:'Cavalier',tharja:'Dark Mage',vaike:'Fighter'};

// Class permissions are separate from inventory: owning an item does not permit equipping it.
const permissions: Record<string, readonly WeaponType[]> = {
  Lord:['sword'], 'Great Knight':['sword','lance','axe'], Archer:['bow'],
  'Pegasus Knight':['lance'], Tactician:['sword','tome'], 'War Cleric':['axe'],
  Myrmidon:['sword'], Mage:['tome'], Cavalier:['sword','lance'], 'Dark Mage':['tome'], Fighter:['axe'],
};
export function canEquip(hero:Hero,item:InventoryItem):boolean {
  const weapon=WEAPONS[item.weaponId];
  return Boolean(weapon && item.uses !== 0 && permissions[CLASS_NAMES[hero]].includes(weapon.type));
}
export function equip(loadout:Loadout,hero:Hero,slot:number):boolean {
  if(!Number.isInteger(slot)||slot<0||slot>=Math.min(loadout.items.length,INVENTORY_CAPACITY)||!canEquip(hero,loadout.items[slot]))return false;
  loadout.equippedSlot=slot;return true;
}
