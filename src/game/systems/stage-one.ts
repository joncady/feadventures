/** Stage clock uses scene time: pauses freeze releases and intermissions. */
export const STAGE_ONE = { waves:3, waveMinimum:45000, releaseInterval:8000, intermission:10000, bossWarning:8000, hostileCap:24, bossHealth:3600 } as const;
export type BattlePhase = 'opening'|'wave'|'rest'|'boss-warning'|'boss'|'complete';
export interface StageSettings {waves:number;waveMinimum:number;releaseInterval:number;intermission:number;bossWarning:number;hostileCap:number;bossHealth:number}
export class StageOne {
  constructor(public settings:StageSettings=STAGE_ONE){}
  phase:BattlePhase='opening';
  wave=0;
  deadline=0;
  waveStarted=0;
  start(now:number):void {this.phase='opening';this.deadline=now+5000;this.wave=0;}
  advance(now:number,clear:boolean):'wave'|'rest'|'boss-warning'|'boss'|'complete'|undefined {
    if((this.phase==='opening'||this.phase==='rest')&&now>=this.deadline){this.phase='wave';this.wave++;this.waveStarted=now;return 'wave';}
    if(this.phase==='wave'&&clear&&now>=this.waveStarted+this.settings.waveMinimum){if(this.wave>=this.settings.waves&&this.settings.bossHealth===0){this.phase='complete';return 'complete';}this.phase=this.wave<this.settings.waves?'rest':'boss-warning';this.deadline=now+(this.phase==='rest'?this.settings.intermission:this.settings.bossWarning);return this.phase;}
    if(this.phase==='boss-warning'&&now>=this.deadline){this.phase='boss';return 'boss';}
    if(this.phase==='boss'&&clear){this.phase='complete';return 'complete';}
  }
}
