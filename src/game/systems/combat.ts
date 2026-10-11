export type WeaponType = 'sword' | 'axe' | 'lance' | 'bow' | 'tome' | 'staff';
export type Matchup = -1 | 0 | 1;
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
