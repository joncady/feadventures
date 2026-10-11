export type WeaponType = 'sword' | 'axe' | 'lance' | 'bow' | 'tome' | 'staff';
export type Matchup = -1 | 0 | 1;
export type DamageKind = 'physical' | 'magical';
export type EffectivenessTag = 'flying' | 'armored' | 'mounted' | 'dragon';
export interface CombatWeapon {type:WeaponType;damageKind?:DamageKind;effectiveAgainst?:readonly EffectivenessTag[];}
export interface DamageRequest {power:number;weapon:CombatWeapon;defenderWeapon:WeaponType;defense:number;resistance:number;targetTags?:readonly EffectivenessTag[];critical?:boolean;scale?:number;}
export interface DamageResult {damage:number;kind:DamageKind;matchup:Matchup;effective:boolean;}
export function damageKind(weapon:CombatWeapon):DamageKind {return weapon.damageKind??(weapon.type==='tome'||weapon.type==='staff'?'magical':'physical');}
/** Metadata fallback keeps existing enemy bows effective without giving every tome wind properties. */
export function effectivenessTags(weapon:CombatWeapon):readonly EffectivenessTag[]{return weapon.effectiveAgainst??(weapon.type==='bow'?['flying']:[]);}
/** Reviewed real-time adaptation: +/-20% triangle and x2 final effective damage, not Awakening's x3 Might. */
export function resolveDamage(request:DamageRequest):DamageResult {
 const kind=damageKind(request.weapon),matchup=weaponMatchup(request.weapon.type,request.defenderWeapon);
 const effective=effectivenessTags(request.weapon).some(tag=>request.targetTags?.includes(tag));
 const protection=kind==='magical'?request.resistance:request.defense;
 const unscaled=Math.max(1,Math.round(Math.max(1,request.power-protection)*(request.critical?3:1)*(1+.2*matchup)*(effective?2:1)));
 return {damage:scaleDamage(unscaled,request.scale??1),kind,matchup,effective};
}
const beats: Partial<Record<WeaponType, WeaponType>> = { sword: 'axe', axe: 'lance', lance: 'sword' };
export function weaponMatchup(attacker: WeaponType, defender: WeaponType): Matchup {
  if (beats[attacker] === defender) return 1;
  if (beats[defender] === attacker) return -1;
  return 0;
}
/** Deterministic real-time adaptation: +/-20% damage, bows/tomes neutral. */
export function combatDamage(base: number, attacker: WeaponType, defender: WeaponType, flying = false): number {
  return Math.max(1, Math.round(base * (1 + 0.2 * weaponMatchup(attacker, defender)) * (flying && attacker === 'bow' ? 2 : 1)));
}
export function withinWeaponRange(distance: number, minimum: number, maximum: number): boolean {
  return distance >= minimum && distance <= maximum;
}

export function weaponAttackSound(weapon: WeaponType): string {
  return ({ sword: 'attack', axe: 'axe-impact', lance: 'lance-thrust', bow: 'arrow-fire', tome: 'fire-cast', staff: 'heal' } as const)[weapon];
}

/** Apply the shared combat pacing setting after defenses and weapon modifiers. */
export function scaleDamage(damage:number,scale:number):number {return Math.max(1,Math.round(damage*Math.max(.25,Math.min(2,scale))));}
