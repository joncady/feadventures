import type {Point} from './rules';
interface FollowState {anchor:Point;sample:Point;desired:Point;at:number;sampledAt:number;moving:boolean}
const OFFSETS:readonly Point[]=[{x:-152,y:-84},{x:164,y:58},{x:-66,y:178},{x:92,y:-158},{x:-188,y:112},{x:196,y:-114},{x:24,y:206}];
/** World-space slots stay attached to members, so turning or swapping never flips the formation. */
export class FollowFormation {
 private states=new Map<string,FollowState>();
 anchor(member:string,slot:number,leader:Point,now:number):Point {
  const offset=OFFSETS[Math.abs(slot)%OFFSETS.length];
  let state=this.states.get(member);
  if(!state){const desired={x:leader.x+offset.x,y:leader.y+offset.y};state={anchor:{...desired},desired,sample:{...leader},at:now,sampledAt:now,moving:false};this.states.set(member,state);}
  const elapsed=Math.max(0,Math.min(.1,(now-state.at)/1000));state.at=now;
  // Ignore little corrections and stagger observations instead of reacting to every direction tap.
  if(now-state.sampledAt>=110+(Math.abs(slot)%3)*55&&Math.hypot(leader.x-state.sample.x,leader.y-state.sample.y)>=48){state.sample={...leader};state.desired={x:leader.x+offset.x,y:leader.y+offset.y};state.sampledAt=now;}
  const blend=1-Math.exp(-4*elapsed);state.anchor.x+=(state.desired.x-state.anchor.x)*blend;state.anchor.y+=(state.desired.y-state.anchor.y)*blend;
  return {...state.anchor};
 }
 moving(member:string,origin:Point,anchor:Point):boolean {
  const state=this.states.get(member);if(!state)return false;
  const distance=Math.hypot(origin.x-anchor.x,origin.y-anchor.y);
  if(state.moving&&distance<=44)state.moving=false;else if(!state.moving&&distance>=88)state.moving=true;
  return state.moving;
 }
}
