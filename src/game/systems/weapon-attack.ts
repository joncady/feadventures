import type {Hero} from '../data/config';
import type {WeaponDefinition} from '../data/equipment';
import {attackPower,type Progress} from './progression';
import {CriticalAttack} from './critical';
import {attackSnapshot,targetsInImpact} from './weapon-capabilities';
export interface AttackTarget {x:number;y:number;active:boolean;health:number;faction:'player'|'ally'|'enemy';structure?:boolean;}
/** Immutable launch data survives hot swapping heroes/weapons and delayed burst frames. */
export function createWeaponAttack(hero:Hero,progress:Progress,weapon:WeaponDefinition,random:()=>number=Math.random) {
 const snapshot=attackSnapshot(weapon);
 return {...snapshot,hero,power:attackPower(progress,hero,weapon),critical:new CriticalAttack(weapon.type==='staff'?undefined:progress,weapon.criticalBonus??0,random),hitTargets:new Set<unknown>()};
}
export type WeaponAttack=ReturnType<typeof createWeaponAttack>;
export function hostileTargets<T extends AttackTarget>(faction:AttackTarget['faction'],targets:readonly T[]):T[] {return targets.filter(t=>t.active&&t.health>0&&!t.structure&&((faction==='enemy')!==(t.faction==='enemy')));}
/** Area targets are selected at impact, sorted by distance and bounded by weapon data. */
export function impactTargets<T extends AttackTarget>(attack:WeaponAttack,faction:AttackTarget['faction'],center:{x:number;y:number},targets:readonly T[]):T[]{
 const shape=attack.capabilities.shape;if(shape.kind!=='impact')return [];
 return targetsInImpact(center,hostileTargets(faction,targets),shape.radius,shape.maxTargets);
}
/** One arrow cannot repeatedly damage a target through repeated overlap callbacks. */
export function claimAttackTarget(attack:WeaponAttack,target:unknown):boolean {if(attack.hitTargets.has(target))return false;attack.hitTargets.add(target);return true;}
export function realDamageDrain(before:number,after:number,drain:number):number {return Math.round(Math.max(0,before-Math.max(0,after))*Math.max(0,Math.min(1,drain)));}
