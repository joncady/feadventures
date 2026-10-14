import Phaser from 'phaser';
import {HERO_NAMES} from '../data/config';
import {mapForCampaign} from '../data/campaign-expansion';
import {missionIds,type CampaignId} from '../data/campaign-catalog';
import type {CampaignMember, MissionResult} from '../systems/campaign';
export interface ResultsData {result:MissionResult;campaignId?:CampaignId;members:CampaignMember[];gold:number;heldKeys?:string[];}
/** A frozen, explicit boundary between combat and the next mission. */
export class ResultsScene extends Phaser.Scene {
 private dataState!:ResultsData;
 private accepted=false;
 private blockedKeys=new Set<string>();
 constructor(){super('Results');}
 init(data:ResultsData):void {this.dataState=data;this.accepted=false;this.blockedKeys=new Set(data.heldKeys??[]);}
 create():void {
  this.cameras.main.setBackgroundColor('#132f3a');
  const result=this.dataState.result,map=mapForCampaign(this.dataState.campaignId??'classic-four',result.missionIndex)!;
  const final=result.missionIndex===missionIds(this.dataState.campaignId).length-1;
  this.add.image(448,272,map.backgroundKey).setDisplaySize(896,544).setAlpha(.18);
  this.add.nineslice(52,38,'ui-parchment',undefined,792,468,12,12,12,12).setOrigin(0);
  const text=(x:number,y:number,value:string,size=18)=>this.add.text(x,y,value,{fontFamily:'FE',fontSize:`${size}px`,color:'#44351e',wordWrap:{width:728}});
  text(448,56,'Mission complete',28).setOrigin(.5,0);
  text(448,92,map.name,19).setOrigin(.5,0);
  text(84,125,`✓ ${result.reason}`,16).setData('result-objective',true);
  const clock=`${Math.floor(result.elapsed/60)}:${String(result.elapsed%60).padStart(2,'0')}`;
  text(84,179,`${clock}  ·  ${result.kills} defeated`,18);
  this.add.image(390,191,'gold').setDisplaySize(24,24);
  text(410,179,`+${result.gold}   +${result.reward} reward`,18);
  this.dataState.members.forEach((member,index)=>{
   const y=216+index*48,prior=result.progressBefore.find(row=>row.hero===member.hero);
   const portraitKey=`portrait-face-${member.hero}`;
   this.add.image(111,y+17,this.textures.exists(portraitKey)?portraitKey:`portrait-${member.hero}`).setDisplaySize(36,36);
   text(140,y,`${HERO_NAMES[member.hero]}  ·  LV ${member.progress.level}`,17);
   const gained=Math.max(0,(member.progress.level-(prior?.level??member.progress.level))*100+member.progress.xp-(prior?.xp??member.progress.xp));
   text(470,y,`+${gained} XP${prior&&member.progress.level>prior.level?`  ·  ↑ ${member.progress.level-prior.level} LV`:''}`,17);
   const hp=member.health,max=member.progress.stats.hp;
   text(140,y+22,hp>0?`HP ${hp}/${max}`:'Fallen · returns next mission',12);
  });
  text(84,424,final?'The campaign is won.':'Full health restored before the next mission.',13);
  const button=this.add.nineslice(448,467,'ui-parchment',undefined,230,38,10,10,10,10).setInteractive({useHandCursor:true}).setData('results-continue',true);
  text(448,455,final?'Finish campaign':'Continue',19).setOrigin(.5,0);
  const enteredAt=performance.now();
  button.on('pointerdown',()=>{if(performance.now()-enteredAt>=150)this.continue();});
  const key=(event:KeyboardEvent)=>{if(this.registry.get('controls-open'))return;if(this.blockedKeys.has(event.code)||event.repeat||event.code!=='Space'&&event.code!=='Enter')return;event.preventDefault();event.stopImmediatePropagation();this.continue();};
  const release=(event:KeyboardEvent)=>this.blockedKeys.delete(event.code);
  window.addEventListener('keydown',key,true);window.addEventListener('keyup',release,true);
  this.events.once('shutdown',()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',release,true);});
 }
 private continue():void {if(this.accepted)return;this.accepted=true;this.game.events.emit('ux-feedback',{kind:'confirm'});this.game.events.emit('results-continue');}
}
