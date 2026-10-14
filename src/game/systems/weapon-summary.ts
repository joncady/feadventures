import type {Hero} from '../data/config';import {attackCooldown,type Progress} from './progression';
import type {WeaponDefinition} from '../data/equipment';import {weaponCapabilities} from './weapon-capabilities';
/** Compact comparison vocabulary stays consistent between purchase and forge previews. */
export function weaponSummary(weapon:WeaponDefinition,context?:{hero:Hero;progress:Progress}):string {
 const ability=weaponCapabilities(weapon),shape=ability.shape;
 const behavior=ability.healing?.kind==='area'?`Heal +${weapon.healingBonus??0} · Area ${ability.healing.radius} / ${ability.healing.maxTargets} allies`:weapon.type==='staff'?`Heal +${weapon.healingBonus??0}`:shape.kind==='impact'?`AOE ${shape.radius}`:shape.kind==='line'?'Piercing line':ability.burst?`${ability.burst.count} hits`:shape.kind==='cone'?'Melee':'Single shot';
 return `${behavior} · ${weapon.type==='staff'?'':`Power ${weapon.damage} · `}Range ${weapon.minRange?`${weapon.minRange}–`:''}${weapon.range} · Ready ${((context?attackCooldown(context.progress,context.hero,weapon)*2.4:weapon.cooldown)/1000).toFixed(2)}s${weapon.criticalBonus?` · Crit +${weapon.criticalBonus}%`:''}`;
}

export function forgeBenefit(before:WeaponDefinition,after:WeaponDefinition):string {
 return before.type==='staff'?`Heal bonus +${before.healingBonus??0} → +${after.healingBonus??0}`:`Power ${before.damage} → ${after.damage}${before.capabilities?.shape.kind==='impact'&&after.capabilities?.shape.kind==='impact'&&before.type==='tome'?` · AOE ${before.capabilities.shape.radius} → ${after.capabilities.shape.radius}`:''}`;
}
