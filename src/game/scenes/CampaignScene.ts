import Phaser from 'phaser';
import { getMap } from '../data/maps';
import { HERO_NAMES, type Hero } from '../data/config';
import { CLASS_NAMES, WEAPONS, canEquip, itemWeapon, type Loadout } from '../data/equipment';
import type { Progress } from '../systems/progression';
import { SHOP_PRICES } from '../systems/campaign';
import { MISSION_BRIEFS, missionDialogue } from '../data/campaign-dialogue';
export interface CampaignMemberView {hero:Hero;progress:Progress;loadout:Loadout;health:number;}
export interface CampaignSceneData {missionIndex:number;gold:number;party:Hero[];members:CampaignMemberView[];complete?:boolean;victory?:boolean;victoryReason?:string;}
export class CampaignScene extends Phaser.Scene {
 private dataState!:CampaignSceneData;private line=0;private phase:'dialogue'|'shop'='dialogue';private heroIndex=0;private focus=0;private rows:Phaser.GameObjects.Text[]=[];private choiceActions:(()=>void)[]=[];private content?:Phaser.GameObjects.Container;private message='';private finished=false;
 private readonly style={fontFamily:'FE',fontSize:'16px',color:'#44351e'};
 constructor(){super('Campaign');}
 init(data:CampaignSceneData):void{this.dataState=data;this.line=0;this.phase='dialogue';this.heroIndex=0;this.focus=0;this.message='';this.finished=false;}
 create():void{
  this.cameras.main.setBackgroundColor('#132f3a');
  const background=getMap(this.dataState.missionIndex).backgroundKey;
  if(this.textures.exists(background))this.add.image(448,272,background).setDisplaySize(896,544).setAlpha(.3);
  const listener=(state:{gold:number;members:CampaignMemberView[];message?:string})=>{this.dataState.gold=state.gold;this.dataState.members=state.members;this.message=state.message??'Equipment updated.';this.render();};
  this.game.events.on('campaign-shop-state',listener);
  const key=(event:KeyboardEvent)=>{if(this.finished)return;const k=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','enter','q','e'].includes(k)){event.preventDefault();event.stopImmediatePropagation();}else return;if(event.repeat)return;if(this.phase==='dialogue'){if(k===' '||k==='enter')this.advance();return;}if(['q','e'].includes(k)){this.heroIndex=(this.heroIndex+(k==='q'?-1:1)+this.dataState.party.length)%this.dataState.party.length;this.focus=0;this.feedback('cursor');this.render();}else if(['w','a','arrowup','arrowleft','s','d','arrowdown','arrowright'].includes(k)){this.focus=(this.focus+(['w','a','arrowup','arrowleft'].includes(k)?-1:1)+this.choiceActions.length)%this.choiceActions.length;this.feedback('cursor');this.updateFocus();}else if(k===' '||k==='enter')this.choiceActions[this.focus]?.();};
  window.addEventListener('keydown',key,true);this.events.once('shutdown',()=>{window.removeEventListener('keydown',key,true);this.game.events.off('campaign-shop-state',listener);});this.render();
 }
 private feedback(kind:string,message?:string):void{this.game.events.emit('ux-feedback',{kind,message});}
 private panel(x:number,y:number,w:number,h:number):Phaser.GameObjects.NineSlice{return this.add.nineslice(x,y,'ui-parchment',undefined,w,h,12,12,12,12).setOrigin(0);}
 private text(x:number,y:number,value:string,size=16):Phaser.GameObjects.Text{return this.add.text(x,y,value,{...this.style,fontSize:`${size}px`,wordWrap:{width:680}});}
 private render():void{
  this.content?.destroy(true);this.content=this.add.container();this.rows=[];this.choiceActions=[];
  const add=(obj:Phaser.GameObjects.GameObject)=>{this.content!.add(obj);return obj;};
  if(this.phase==='dialogue'&&!this.dataState.complete){this.renderDialogue();return;}
  add(this.panel(44,32,808,80));const brief=MISSION_BRIEFS[Math.min(3,this.dataState.missionIndex)];add(this.text(65,45,this.dataState.complete?'Campaign complete':brief.title,24));add(this.text(65,79,this.dataState.complete?'The roads are safe. Your companions fought together to the end.':brief.objective,13));
  if(this.dataState.victoryReason)add(this.text(65,115,this.dataState.victoryReason,12).setColor('#eadab7'));
  if(this.dataState.complete){add(this.panel(180,160,536,260));add(this.text(218,190,'The eastern campaign is won.',25));add(this.text(218,239,`Treasury: ${this.dataState.gold} gold\n${this.dataState.members.map(m=>`${HERO_NAMES[m.hero]} · Level ${m.progress.level}`).join('\n')}`,17));this.choice(240,365,'Return to the main menu',()=>this.continue());return;}
  this.renderShop();
 }
 private renderDialogue():void{
  const dialogue=missionDialogue(this.dataState.missionIndex,this.dataState.party),current=dialogue[this.line];
  const activeSide=this.line%2;
  const other=dialogue.find((entry,i)=>i!==this.line&&entry.hero!==current.hero)?.hero;
  const heroes=activeSide===0?[current.hero,other]:[other,current.hero];
  const add=(obj:Phaser.GameObjects.GameObject)=>{this.content!.add(obj);return obj;};
  const brief=MISSION_BRIEFS[Math.min(3,this.dataState.missionIndex)];
  add(this.text(30,24,brief.title,19).setColor('#f4e7c7').setShadow(1,2,'#10212b',3));
  add(this.text(30,51,brief.objective,12).setColor('#eadab7').setWordWrapWidth(760));
  heroes.forEach((hero,side)=>{if(!hero)return;const portrait=this.add.image(side===0?225:671,416,`portrait-${hero}`).setOrigin(.5,1);
   const scale=Math.min(340/portrait.width,340/portrait.height);
   portrait.setScale(scale).setAlpha(side===activeSide?1:.42).setTint(side===activeSide?0xffffff:0x8295a0).setData('dialogue-side',side).setData('speaker-active',side===activeSide);add(portrait);
  });
  add(this.panel(25,405,846,119));
  add(this.panel(activeSide===0?48:634,380,214,39).setTint(0x403726));
  add(this.text(activeSide===0?65:651,389,HERO_NAMES[current.hero],19).setColor('#f7e5b2'));
  add(this.text(49,430,current.text,19).setWordWrapWidth(775).setLineSpacing(6));
  add(this.text(49,502,'Space / Enter / Click',11).setColor('#80613a'));
  const caret=add(this.text(834,494,'▼',18).setColor('#62447d')) as Phaser.GameObjects.Text;
  this.tweens.add({targets:caret,alpha:.35,duration:650,yoyo:true,repeat:-1});
  const next=this.add.zone(25,405,846,119).setOrigin(0).setInteractive().setData('dialogue-next',true);add(next);
  next.on('pointerdown',()=>this.advance());
  this.content!.setData('dialogue-speaker',current.hero).setData('dialogue-line',this.line);
 }
 private choice(x:number,y:number,label:string,action:()=>void,unaffordable=false,disabledReason?:string,icon?:string,value?:string):void{
  const index=this.rows.length,width=this.phase==='dialogue'||label==='Deploy →'?200:x>=500?270:x===66||x===208?132:310;const row=this.text(x,y,label,this.phase==='shop'&&(x===190||x>=500)?14:16).setFixedSize(width,30).setPadding(icon?32:8,5,8,5).setData('unaffordable',unaffordable).setInteractive(new Phaser.Geom.Rectangle(0,0,width,30),Phaser.Geom.Rectangle.Contains);this.content!.add(row);if(value){this.content!.add(this.text(x+width-72,y+7,value.replace(' G',''),12).setColor(unaffordable?'#827258':'#80613a'));if(value.endsWith(' G'))this.content!.add(this.add.image(x+width-84,y+14,'gold').setDisplaySize(16,16).setAlpha(unaffordable?.45:1));}if(icon){const image=this.add.image(x+17,y+15,icon).setDisplaySize(18,18);image.setAlpha(unaffordable?.45:1);this.content!.add(image);}this.rows.push(row);const activate=()=>{if(unaffordable){this.message=disabledReason??'Not enough gold. Collect gold in the next mission.';this.feedback('reject');this.render();}else action();};this.choiceActions.push(activate);row.on('pointerover',()=>{this.focus=index;this.feedback('cursor');this.updateFocus();});row.on('pointerdown',activate);this.updateFocus();
 }
 private updateFocus():void{this.rows.forEach((row,i)=>row.setColor(row.getData('unaffordable')?'#827258':i===this.focus?'#153e66':'#44351e').setBackgroundColor(i===this.focus?'#fff2cd':'#e6d2a9'));}
 private advance():void{this.game.events.emit('effect','dialogue-advance',{volume:.22});const count=missionDialogue(this.dataState.missionIndex,this.dataState.party).length;if(this.dataState.complete){this.continue();return;}if(++this.line>=count){this.phase='shop';this.focus=2;}this.render();}
 private renderShop():void{
  const hero=this.dataState.party[this.heroIndex],member=this.dataState.members.find(m=>m.hero===hero);this.content!.add(this.panel(44,129,808,372));this.content!.add(this.text(66,147,'Preparations',23));this.content!.add(this.add.image(680,163,'gold').setDisplaySize(24,24));this.content!.add(this.text(700,151,`${this.dataState.gold}`,20).setColor('#183e57'));this.content!.add(this.add.image(121,277,`portrait-${hero}`).setDisplaySize(125,140));this.content!.add(this.text(66,354,CLASS_NAMES[hero],13).setWordWrapWidth(120));this.content!.add(this.text(190,191,`${HERO_NAMES[hero]} · LV ${member?.progress.level??1}`,22));this.content!.add(this.text(66,389,'Q / E: companion\nWASD: option · Enter: confirm',13));
  this.choice(66,437,'◀ Companion',()=>{this.heroIndex=(this.heroIndex-1+this.dataState.party.length)%this.dataState.party.length;this.focus=0;this.feedback('cursor');this.render();});this.choice(208,437,'Companion ▶',()=>{this.heroIndex=(this.heroIndex+1)%this.dataState.party.length;this.focus=0;this.feedback('cursor');this.render();});
  this.content!.add(this.text(198,216,'EQUIPMENT · FORGE +2 POWER / HEAL',10).setColor('#80613a'));this.content!.add(this.text(534,216,'ARMORY · BUY',10).setColor('#80613a'));
  if(member){member.loadout.items.forEach((item,slot)=>{const weapon=itemWeapon(item),level=item.forge??0,max=level>=3;this.choice(190,229+slot*34,`${slot===member.loadout.equippedSlot?'› ':''}${weapon.name}`,()=>{this.game.events.emit('campaign-shop-upgrade',{hero,slot});},max||this.dataState.gold<100,max?'This weapon is fully forged (+3).':undefined,weapon.icon,max?'MAX':'100 G');});
   const owned=new Set(member.loadout.items.map(i=>i.weaponId));const offers=['steel-lance','steel-axe','steel-bow','killing-edge','thunder','heal','nosferatu'].filter(id=>!owned.has(id)&&canEquip(hero,{weaponId:id,uses:null})).slice(0,3);
   offers.forEach((id,i)=>this.choice(526,229+i*34,WEAPONS[id].name,()=>this.game.events.emit('campaign-shop-buy',{hero,itemId:id}),this.dataState.gold<SHOP_PRICES[id],undefined,WEAPONS[id].icon,`${SHOP_PRICES[id]} G`));if(!offers.length)this.content!.add(this.text(526,228,'All class weapons stocked.',13));
  }
  this.content!.add(this.text(190,342,'Full health restored between missions.\nThree slots: new purchases replace the equipped item when full.',13).setWordWrapWidth(600));this.content!.add(this.text(370,397,this.message,14).setWordWrapWidth(430));this.choice(600,449,'Deploy →',()=>this.continue());this.focus=Math.min(this.focus,Math.max(0,this.rows.length-1));this.updateFocus();
 }
 private continue():void{if(this.finished)return;this.finished=true;this.feedback('confirm');this.game.events.emit('campaign-continue');}
}
