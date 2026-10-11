export type VictoryCondition='reach-exit'|'hold-waves'|'defeat-commander'|'defeat-all'|'defend-commander';
export interface VictoryState {phase:string;enemies:number;pending:number;commanderDefeated:boolean;exitReached:boolean;objectiveAlive?:boolean;}
/** Required enemies include scheduled reinforcements, even while off-screen. */
export function victoryReady(condition:VictoryCondition,state:VictoryState):boolean {
 if(condition==='defeat-all')return state.phase==='complete'&&state.enemies===0&&state.pending===0;
 if(condition==='reach-exit')return state.phase==='complete'&&state.exitReached;
 if(condition==='defend-commander')return state.phase==='complete'&&state.commanderDefeated&&state.objectiveAlive===true;
 if(condition==='hold-waves')return state.phase==='complete';
 return state.phase==='complete'&&state.commanderDefeated;
}
export function formatClock(seconds:number):string {return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
