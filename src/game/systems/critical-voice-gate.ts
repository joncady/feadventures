/** Critical voice pacing is independent of damage: silenced/suppressed voices never suppress a hit. */
export class CriticalVoiceGate {
 private lastAt=-Infinity;
 private lastHeroAt=new Map<string,number>();
 accept(hero:string,now:number,options:{controlled:boolean;distance:number;busy:boolean;muted:boolean}):boolean {
  if(options.muted||options.busy||(!options.controlled&&options.distance>320)||now-this.lastAt<4000||now-(this.lastHeroAt.get(hero)??-Infinity)<8000)return false;
  this.lastAt=now;this.lastHeroAt.set(hero,now);return true;
 }
 reset():void {this.lastAt=-Infinity;this.lastHeroAt.clear();}
}
