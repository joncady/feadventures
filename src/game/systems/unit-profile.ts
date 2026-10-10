import { ENEMY_TYPES, HEROES, HERO_PROFILES, type Hero } from '../data/config';
import type { WeaponType } from './combat';
export interface UnitDefinition { key:string;weapon:WeaponType;attack:{kind:'melee'|'ranged';range:number;minRange?:number;windup:number;cooldown:number;recovery:number}; }
export function unitDefinition(key:string):UnitDefinition {
 if(HEROES.includes(key as Hero)){
  const p=HERO_PROFILES[key as Hero];const ranged=p.weapon==='bow'||p.weapon==='tome';
  return {key,weapon:p.weapon,attack:{kind:ranged?'ranged':'melee',range:p.range,minRange:p.minRange,windup:p.weapon==='tome'?250:p.weapon==='bow'?180:200,cooldown:p.cooldown,recovery:100}};
 }
 return ENEMY_TYPES.find(x=>x.key===key)??ENEMY_TYPES[0];
}
