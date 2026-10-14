import type { EffectivenessTag } from '../systems/combat';
import type { UnitDefinition } from '../systems/unit-profile';
export const COMMANDER_IDS=['gangrel','walhart','validar','yenfay','aversa'] as const;
export type CommanderId=typeof COMMANDER_IDS[number];
export interface CommanderProfile {id:CommanderId;name:string;title:string;weapon:'sword'|'axe'|'tome';defense:number;resistance:number;speed:number;damage:number;level:number;attack:UnitDefinition['attack'];flying?:boolean;impactRadius?:number;impactMaxTargets?:number;combatTags?:readonly EffectivenessTag[];}
export const COMMANDERS:Record<CommanderId,CommanderProfile>={
 gangrel:{id:'gangrel',name:'Gangrel',title:'Mad King',weapon:'sword',defense:4,resistance:6,speed:100,damage:27,level:5,attack:{kind:'melee',range:90,windup:650,recovery:800,cooldown:1550}},
 walhart:{id:'walhart',name:'Walhart',title:'Conqueror',combatTags:['armored','mounted'],weapon:'axe',defense:10,resistance:4,speed:64,damage:38,level:7,attack:{kind:'melee',range:125,windup:1150,recovery:1350,cooldown:2600}},
 yenfay:{id:'yenfay',name:'Yen’fay',title:'Silent Blade',weapon:'sword',defense:8,resistance:7,speed:105,damage:35,level:8,attack:{kind:'melee',range:100,windup:850,recovery:1050,cooldown:1900}},
 aversa:{id:'aversa',name:'Aversa',title:'Dark Flier',weapon:'tome',defense:6,resistance:12,speed:78,damage:34,level:10,flying:true,impactRadius:70,impactMaxTargets:3,attack:{kind:'ranged',range:360,minRange:80,windup:1350,recovery:1250,cooldown:2900}},
 validar:{id:'validar',name:'Validar',title:'Grimleal Leader',weapon:'tome',defense:5,resistance:10,speed:58,damage:32,level:9,attack:{kind:'ranged',range:380,minRange:65,windup:1100,recovery:1000,cooldown:2400}}
};
export function commanderDefinition(id:CommanderId,strikes=0,healthFraction=1):UnitDefinition {
 const profile=COMMANDERS[id];
 if(id==='gangrel'&&strikes%3===2)return {key:id,weapon:'tome',attack:{kind:'ranged',range:300,minRange:0,windup:1200,recovery:1050,cooldown:2250}};
 return {key:id,weapon:profile.weapon,attack:{...profile.attack,...(id==='validar'&&healthFraction<=.5?{cooldown:2000,recovery:850}:{})}};
}

/** Legacy siege uses level 3 guards; expanded chapters advance their local enemy level. */
export function commanderGuardLevel(baseLevel:number,expanded:boolean):number {return expanded?baseLevel+1:3;}
