import type { WeaponCapabilities, WeaponDefinition } from '../data/equipment';
/** Pure, shared shape data: renderer/combat adapters consume this without hero-specific branches. */
export function weaponCapabilities(weapon:WeaponDefinition):WeaponCapabilities {
 if(weapon.capabilities)return structuredClone(weapon.capabilities);
 const shape:WeaponCapabilities['shape']=weapon.type==='sword'?{kind:'cone',angle:100}:weapon.type==='axe'?{kind:'cone',angle:130}:weapon.type==='lance'?{kind:'cone',angle:45}:{kind:'projectile',pierce:0};
 return {shape,windupMs:0,recoveryMs:weapon.cooldown,...(weapon.type==='staff'?{healing:{kind:'single' as const,radius:weapon.range,maxTargets:1}}:{})};
}
/** AOE rolls/hits are associated with one attack snapshot, not whichever weapon is equipped later. */
export function attackSnapshot(weapon:WeaponDefinition) {return {weapon:structuredClone(weapon),capabilities:weaponCapabilities(weapon)};}
export function targetsInImpact<T extends {x:number;y:number}>(center:{x:number;y:number},targets:readonly T[],radius:number,maxTargets:number):T[]{
 return targets.map((target,index)=>({target,index,distance:Math.hypot(target.x-center.x,target.y-center.y)})).filter(t=>t.distance<=radius).sort((a,b)=>a.distance-b.distance||a.index-b.index).slice(0,Math.max(0,Math.floor(maxTargets))).map(t=>t.target);
}
