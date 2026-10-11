import type {DamageKind} from './combat';
export const GUARD = {capacity:100,drainPerSecond:30,recoveryPerSecond:22,restartThreshold:30,damageMultiplier:.35,impactCost:18,speedMultiplier:.45,halfArc:Math.PI/3} as const;
export interface GuardState {meter:number;broken:boolean;active:boolean;}
export function newGuard():GuardState {return {meter:GUARD.capacity,broken:false,active:false};}
/** Game-clock delta only: paused or unfocused scenes must not update this state. */
export function updateGuard(state:GuardState,held:boolean,deltaMs:number,allowed=true):void {
 const seconds=Math.max(0,Math.min(250,deltaMs))/1000;
 if(state.broken&&state.meter>=GUARD.restartThreshold&&!held)state.broken=false;
 state.active=held&&allowed&&!state.broken&&state.meter>0;
 state.meter=Math.max(0,Math.min(GUARD.capacity,state.meter+(state.active?-GUARD.drainPerSecond:GUARD.recoveryPerSecond)*seconds));
 if(state.meter<=0){state.active=false;state.broken=true;}
}
/** sourceDirection points from defender to attacker/projectile origin; facing uses the same world angle. */
export function guardCovers(facing:number,sourceDirection:number):boolean {return Math.abs(Math.atan2(Math.sin(sourceDirection-facing),Math.cos(sourceDirection-facing)))<=GUARD.halfArc;}
export function guardedDamage(state:GuardState,damage:number,kind:DamageKind,facing:number,sourceDirection:number):{damage:number;blocked:boolean} {
 const blocked=state.active&&kind==='physical'&&guardCovers(facing,sourceDirection);
 if(!blocked)return {damage,blocked:false};
 state.meter=Math.max(0,state.meter-GUARD.impactCost);
 if(state.meter===0){state.active=false;state.broken=true;}
 return {damage:Math.max(1,Math.round(damage*GUARD.damageMultiplier)),blocked:true};
}
