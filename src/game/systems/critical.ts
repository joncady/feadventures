import type { Progress } from './progression';
/** Preserve the reviewed growth-relative survival rule until campaign tuning explicitly changes it. */
export function criticalChance(progress:Progress|undefined,weaponBonus=0):number {
 if(!progress)return 0;
 return Math.max(0,Math.min(.25,((progress.stats.skill-progress.base.skill)/2+(progress.stats.luck-progress.base.luck)/4+weaponBonus)/100));
}
export function rollCritical(progress:Progress|undefined,weaponBonus=0,random:()=>number=Math.random):boolean {return random()<criticalChance(progress,weaponBonus);}
/** One sampled critical state and one feedback emission for an entire burst/impact. */
export class CriticalAttack {
 readonly critical:boolean;
 private emitted=false;
 constructor(progress:Progress|undefined,weaponBonus=0,random:()=>number=Math.random){this.critical=rollCritical(progress,weaponBonus,random);}
 claimFeedback():boolean {if(!this.critical||this.emitted)return false;this.emitted=true;return true;}
}
