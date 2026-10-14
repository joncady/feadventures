/** Heal staff recovery follows Awakening's 8 + floor(Mag / 2) formula.
 * Real-time range/cooldowns are supplied by equipment, rather than turn-based tiles.
 */
export function healAmount(magic:number):number {
  return 8+Math.floor(Math.max(0,magic)/2);
}

export interface HealingUnit {
  x:number;
  y:number;
  health:number;
  maxHealth:number;
  active:boolean;
}

/** Prefer the ally in greatest danger, with proximity breaking equal-health ties.
 * Callers supply friendly living units only; castles and barricades are not patients.
 * A critically injured AI caster joins the same urgency ranking; otherwise it is a fallback.
 * Healing never revives a fallen unit or wastes a cast on full HP.
 */
export function selectHealingTarget<T extends HealingUnit>(source:{x:number;y:number},candidates:readonly T[],range:number,caster?:T):T|undefined {
  const distance=(unit:T)=>Math.hypot(unit.x-source.x,unit.y-source.y);
  const target=candidates.filter(unit=>unit!==caster&&unit.active&&unit.health>0&&unit.health<unit.maxHealth&&distance(unit)<=range)
    .reduce<T|undefined>((best,unit)=>{
      if(!best)return unit;
      const health=unit.health/unit.maxHealth,bestHealth=best.health/best.maxHealth;
      return health<bestHealth||(health===bestHealth&&distance(unit)<distance(best))?unit:best;
    },undefined);
  if(caster?.active&&caster.health>0&&caster.health/caster.maxHealth<=.3&&(!target||caster.health/caster.maxHealth<target.health/target.maxHealth))return caster;
  return target??(caster?.active&&caster.health>0&&caster.health<caster.maxHealth?caster:undefined);
}

/** XP is granted only for a successful restoration, never idle/full-health casts.
 * 17 is the original Heal staff's base XP; levels reduce it for this real-time loop.
 */
export function healingExperience(level:number,restored:number):number {
  return restored>0?Math.max(5,17-Math.max(0,Math.floor(level)-1)):0;
}

export function restoreHealth(health:number,maxHealth:number,amount:number):{health:number;restored:number} {
  if(health<=0||maxHealth<=0)return {health,restored:0};
  const next=Math.min(maxHealth,health+Math.max(0,Math.floor(amount)));
  return {health:next,restored:Math.max(0,next-health)};
}
