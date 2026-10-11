import type { Hero } from './config';
export const MISSION_BRIEFS=[
 {title:'1 · Rumors on the East Road',objective:'Advance east. Fight through the bandits and reach the eastern road marker.',lines:['Reports of bandits on the eastern road. The village needs us before nightfall.','Then we move together. Keep an eye on the trees—an empty road can still hide an ambush.','Agreed. We clear a path, and nobody gets left behind.']},
 {title:'2 · The Village Holds',objective:'Protect the village through three attacks. Keep the village standing.',lines:['The villagers have taken shelter, but the bandits are gathering again.','We cannot cover every road alone. Give each companion a post and watch the approaches.','Hold the line. Their homes are counting on us.']},
 {title:'3 · A Castle Under Siege',objective:'Defend the camp. Hold the entrances and defeat the siege commander.',lines:['The castle gates are open, and the enemy means to use every one of them.','Our archers can cover the barricades. The rest of us must stop anyone who slips through.','This time, they come to us. Make every opening cost them.']},
 {title:'4 · Into the Dark Keep',objective:'Advance into the enemy keep and defeat the final commander.',lines:['The attacks lead back to this keep. Their commander is waiting inside.','Then this ends here. Take the courtyard first, and do not charge past your allies.','One last push. We fight our way forward—together.']},
] as const;
// Original mission dialogue inspired by Awakening's companion-focused preparation scenes.
export function missionDialogue(mission:number,party:Hero[]):{hero:Hero;text:string}[]{const brief=MISSION_BRIEFS[Math.min(3,Math.max(0,mission))];return brief.lines.map((text,i)=>({hero:party[i%Math.max(1,party.length)]??'chrom',text}));}
