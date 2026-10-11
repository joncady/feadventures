import type { WeaponDefinition } from '../data/equipment';
import { HERO_PROFILES, type Hero } from '../data/config';
export const STAT_KEYS = ['hp','str','mag','skill','speed','luck','def','res'] as const;
export type Stat = typeof STAT_KEYS[number];
export type Stats = Record<Stat,number>;
export interface Progress { level:number; xp:number; stats:Stats; base:Stats; }
// Character base growths + selected class growths, from Serenes Forest Awakening tables.
// Children use their absolute growths: parent inheritance and Avatar asset/flaw are not selected in this prototype.
const character:Record<Hero,readonly number[]>={
 chrom:[45,40,10,40,40,70,35,20],lucina:[45,35,20,45,45,80,25,25],frederick:[60,40,10,40,35,40,40,20],virion:[35,40,30,40,45,40,25,25],sumia:[35,30,20,45,45,60,25,30],morgan:[35,35,40,40,40,50,25,25],robin:[40,40,35,35,35,55,30,20],'robin-female':[40,40,35,35,35,55,30,20],cordelia:[50,45,15,35,35,45,40,25],lissa:[35,25,35,30,35,65,15,35],lonqu:[40,35,20,50,50,55,25,20],miriel:[35,15,40,40,40,50,20,30],ricken:[50,20,35,30,30,65,30,25],stahl:[50,45,10,35,30,50,50,10],sully:[40,35,20,40,40,60,35,20],tharja:[40,25,45,25,45,40,35,20],vaike:[60,50,10,45,35,45,40,5]};
const classes={sage:[35,0,20,20,15,0,5,10],lord:[40,20,0,20,20,0,10,5],tactician:[40,15,15,15,15,0,10,10],greatKnight:[50,25,0,15,15,0,15,5],archer:[45,15,0,30,15,0,10,5],pegasus:[40,15,5,25,25,0,5,10],warCleric:[45,15,15,10,15,0,10,10],myrmidon:[40,20,0,25,25,0,5,5],mage:[35,0,20,20,20,0,5,10],cavalier:[45,20,0,20,20,0,10,5],darkMage:[50,5,15,15,15,0,10,10],fighter:[45,25,0,20,15,0,10,5]};
const heroClass:Record<Hero,keyof typeof classes>={chrom:'lord',lucina:'lord',frederick:'greatKnight',virion:'archer',sumia:'pegasus',cordelia:'pegasus',morgan:'tactician',robin:'tactician','robin-female':'tactician',lissa:'warCleric',lonqu:'myrmidon',miriel:'sage',ricken:'mage',stahl:'cavalier',sully:'cavalier',tharja:'darkMage',vaike:'fighter'};
export function newProgress():Progress {const stats={hp:100,str:20,mag:15,skill:10,speed:10,luck:10,def:0,res:0};return {level:1,xp:0,stats:{...stats},base:{...stats}};}
export function gainExperience(progress:Progress,hero:Hero,amount:number,random= Math.random):Stats[] {
 const gains:Stats[]=[];progress.xp+=Math.max(0,Math.floor(amount));
 while(progress.xp>=100){progress.xp-=100;progress.level++;const growth={} as Stats;
  for(const [i,key] of STAT_KEYS.entries()){const rate=character[hero][i]+classes[heroClass[hero]][i];const increase=Math.floor(rate/100)+(random()*100<rate%100?1:0);growth[key]=increase;progress.stats[key]+=increase;}
  gains.push(growth);
 }return gains;
}
export function attackPower(progress:Progress,hero:Hero,weapon?:WeaponDefinition):number {const profile=weapon??HERO_PROFILES[hero];const type=weapon?.type??HERO_PROFILES[hero].weapon;const stat=type==='tome'||type==='staff'?'mag':'str';return profile.damage+progress.stats[stat]-progress.base[stat];}
export function attackCooldown(progress:Progress,hero:Hero,weapon?:WeaponDefinition):number {return Math.round((weapon??HERO_PROFILES[hero]).cooldown/(1+.025*(progress.stats.speed-progress.base.speed)));}
export function killExperience(level:number,wave:number,key:string):number {const bonus=['heavy','knight','mage'].includes(key)?5:0;return Math.max(5,Math.min(40,25+bonus+2*(wave-level)));}
