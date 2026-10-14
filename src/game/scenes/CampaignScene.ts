import {weaponSummary,forgeBenefit} from '../systems/weapon-summary';
import { reducedMotion } from '../input/control-preferences';
import Phaser from 'phaser';
import {mapForCampaign} from '../data/campaign-expansion';
import type {CampaignId} from '../data/campaign-catalog';
import { HERO_NAMES, type Hero } from '../data/config';
import { CLASS_NAMES, WEAPONS, canEquip, itemWeapon, shopWeaponIds, type Loadout } from '../data/equipment';
import {attackCooldown,type Progress} from '../systems/progression';
import { SHOP_PRICES,campaignForgeCost,type LegacyEquipmentNotice } from '../systems/campaign';
import { missionBrief, missionDialogue } from '../data/campaign-dialogue';
export interface CampaignMemberView {hero:Hero;progress:Progress;loadout:Loadout;health:number;}
export interface CampaignSceneData {campaignId?:CampaignId;migrationNotice?:LegacyEquipmentNotice;missionIndex:number;gold:number;party:Hero[];members:CampaignMemberView[];skipDialogue?:boolean;complete?:boolean;victory?:boolean;victoryReason?:string;}
export class CampaignScene extends Phaser.Scene {
 private dataState!:CampaignSceneData;private line=0;private phase:'dialogue'|'shop'='dialogue';private heroIndex=0;private focus=0;private rows:Phaser.GameObjects.Text[]=[];private choiceActions:(()=>void)[]=[];private content?:Phaser.GameObjects.Container;private message='';private finished=false;private armoryPage=0;private detailsText?:Phaser.GameObjects.Text;private replacement?:{hero:Hero;itemId:string};private resizeFrame=0;private renderedWidth=0;
 private readonly style={fontFamily:'FE',fontSize:'16px',color:'#44351e'};
 constructor(){super('Campaign');}
 init(data:CampaignSceneData):void{this.dataState=data;this.line=0;this.phase=data.skipDialogue?'shop':'dialogue';this.heroIndex=0;this.focus=0;this.message='';this.finished=false;this.armoryPage=0;this.replacement=undefined;this.resizeFrame=0;this.renderedWidth=0;}
 create():void{
  this.cameras.main.setBackgroundColor('#132f3a');
  const background=mapForCampaign(this.dataState.campaignId??'classic-four',Math.min(this.dataState.missionIndex,this.dataState.campaignId==='awakening-ten'?9:3))!.backgroundKey;
  if(this.textures.exists(background))this.add.image(448,272,background).setDisplaySize(896,544).setAlpha(.3);
  const listener=(state:{gold:number;members:CampaignMemberView[];message?:string})=>{this.dataState.gold=state.gold;this.dataState.members=state.members;this.message=state.message??'Equipment updated.';this.render();};
  this.game.events.on('campaign-shop-state',listener);
  const key=(event:KeyboardEvent)=>{if(this.finished||this.registry.get('controls-open'))return;const k=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','enter','q','e'].includes(k)){event.preventDefault();event.stopImmediatePropagation();}else return;if(event.repeat)return;if(this.phase==='dialogue'){if(k===' '||k==='enter')this.advance();return;}if(['q','e'].includes(k)){this.selectHero((this.heroIndex+(k==='q'?-1:1)+this.dataState.party.length)%this.dataState.party.length);}else if(['w','a','arrowup','arrowleft','s','d','arrowdown','arrowright'].includes(k)){this.focus=(this.focus+(['w','a','arrowup','arrowleft'].includes(k)?-1:1)+this.choiceActions.length)%this.choiceActions.length;this.feedback('cursor');this.updateFocus();}else if(k===' '||k==='enter')this.choiceActions[this.focus]?.();};
  const resized=()=>{if(this.resizeFrame)return;this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=0;if(this.finished||(!this.sys.isActive()&&!this.sys.isPaused()))return;const width=this.game.canvas.getBoundingClientRect().width;if(!Number.isFinite(width)||width<=0||Math.abs(width-this.renderedWidth)<.1)return;const focus=this.focus;this.render();this.focus=Math.min(focus,Math.max(0,this.rows.length-1));this.updateFocus();});};
  this.scale.on(Phaser.Scale.Events.RESIZE,resized);
  window.addEventListener('keydown',key,true);this.events.once('shutdown',()=>{window.removeEventListener('keydown',key,true);this.game.events.off('campaign-shop-state',listener);this.scale.off(Phaser.Scale.Events.RESIZE,resized);if(this.resizeFrame)cancelAnimationFrame(this.resizeFrame);this.resizeFrame=0;});this.render();
 }
 private feedback(kind:string,message?:string):void{this.game.events.emit('ux-feedback',{kind,message});}
 private panel(x:number,y:number,w:number,h:number):Phaser.GameObjects.NineSlice{return this.add.nineslice(x,y,'ui-parchment',undefined,w,h,12,12,12,12).setOrigin(0);}
 private text(x:number,y:number,value:string,size=16):Phaser.GameObjects.Text{return this.add.text(x,y,value,{...this.style,fontSize:`${size}px`,wordWrap:{width:680}});}
 private render():void{
  const width=this.game.canvas.getBoundingClientRect().width;if(Number.isFinite(width)&&width>0)this.renderedWidth=width;
  this.content?.destroy(true);this.content=this.add.container();this.rows=[];this.choiceActions=[];
  const add=(obj:Phaser.GameObjects.GameObject)=>{this.content!.add(obj);return obj;};
  if(this.phase==='dialogue'&&!this.dataState.complete){this.renderDialogue();return;}
  add(this.panel(44,32,808,80));const brief=missionBrief(this.dataState.missionIndex,this.dataState.campaignId);add(this.text(65,45,this.dataState.complete?'Campaign complete':brief.title,24));add(this.text(65,79,this.dataState.complete?'The roads are safe. Your companions fought together to the end.':brief.objective,13));
  if(this.dataState.victoryReason)add(this.text(65,115,this.dataState.victoryReason,12).setColor('#eadab7'));
  if(this.dataState.complete){add(this.panel(180,160,536,260));add(this.text(218,190,'The campaign is won.',25));add(this.text(218,239,`Treasury: ${this.dataState.gold} gold\n${this.dataState.members.map(m=>`${HERO_NAMES[m.hero]} · Level ${m.progress.level}`).join('\n')}`,17));this.choice(240,365,'Return to the main menu',()=>this.continue());return;}
  this.renderShop();
  if(this.dataState.migrationNotice&&!this.dataState.migrationNotice.acknowledged)this.renderMigrationNotice();else if(this.replacement)this.renderReplacement();
 }
 private renderDialogue():void{
  const dialogue=missionDialogue(this.dataState.missionIndex,this.dataState.party,this.dataState.campaignId),current=dialogue[this.line];
  const activeSide=this.line%2;
  const other=dialogue.find((entry,i)=>i!==this.line&&entry.hero!==current.hero)?.hero;
  const heroes=activeSide===0?[current.hero,other]:[other,current.hero];
  const add=(obj:Phaser.GameObjects.GameObject)=>{this.content!.add(obj);return obj;};
  const brief=missionBrief(this.dataState.missionIndex,this.dataState.campaignId);
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
  const caret=add(this.text(834,494,'▼',18).setColor('#62447d')) as Phaser.GameObjects.Text;
  if(!reducedMotion())this.tweens.add({targets:caret,alpha:.35,duration:650,yoyo:true,repeat:-1});
  const next=this.add.zone(25,405,846,119).setOrigin(0).setInteractive().setData('dialogue-next',true);add(next);
  next.on('pointerdown',()=>this.advance());
  this.content!.setData('dialogue-speaker',current.hero).setData('dialogue-line',this.line);
 }
 private choice(x:number,y:number,label:string,action:()=>void,unaffordable=false,disabledReason?:string,icon?:string,value?:string,details?:string):void{
  const index=this.rows.length,width=this.phase==='dialogue'||label==='Deploy →'?200:x>=500?270:x===66||x===208?132:310;const row=this.text(x,y,label,this.phase==='shop'&&(x===190||x>=500)?14:16).setFixedSize(width,30).setPadding(icon?32:8,5,8,5).setData('details',details??'').setData('unaffordable',unaffordable).setInteractive(new Phaser.Geom.Rectangle(0,0,width,30),Phaser.Geom.Rectangle.Contains);this.content!.add(row);if(value){this.content!.add(this.text(x+width-72,y+7,value.replace(' G',''),12).setColor(unaffordable?'#827258':'#80613a'));if(value.endsWith(' G'))this.content!.add(this.add.image(x+width-84,y+14,'gold').setDisplaySize(16,16).setAlpha(unaffordable?.45:1));}if(icon){const image=this.add.image(x+17,y+15,icon).setDisplaySize(18,18);image.setAlpha(unaffordable?.45:1);this.content!.add(image);}this.rows.push(row);const activate=()=>{if(unaffordable){this.message=disabledReason??'Not enough gold. Collect gold in the next mission.';this.feedback('reject');this.render();}else action();};this.choiceActions.push(activate);row.on('pointerover',()=>{this.focus=index;this.feedback('cursor');this.updateFocus();});row.on('pointerdown',activate);this.updateFocus();
 }
 private updateFocus():void{if(this.detailsText?.active)this.detailsText.setText((this.rows[this.focus]?.getData('details')??'').replaceAll('Power ','Atk ').replaceAll('Range ','Rng ').replaceAll('Equipped · ','').replace('Added to bag; current weapon stays equipped.','Bag · equipped item unchanged').replace('Replaces equipped item after confirmation.','Replace equipped item · confirm')); this.rows.forEach((row,i)=>row.setColor(row.getData('unaffordable')?'#827258':i===this.focus?'#153e66':'#44351e').setBackgroundColor(i===this.focus?'#fff2cd':'#e6d2a9'));}
 private advance():void{this.game.events.emit('effect','dialogue-advance',{volume:.22});const count=missionDialogue(this.dataState.missionIndex,this.dataState.party,this.dataState.campaignId).length;if(this.dataState.complete){this.continue();return;}if(++this.line>=count){this.phase='shop';this.focus=0;}this.render();}
 private selectHero(index:number):void{
  if(index===this.heroIndex)return;
  this.heroIndex=index;this.focus=0;this.message='';this.armoryPage=0;this.replacement=undefined;this.feedback('cursor');this.render();
 }
 private renderPartyStrip():void{
  const width=94,gap=12,start=66;
  this.dataState.party.forEach((hero,index)=>{
   const x=start+index*(width+gap),selected=index===this.heroIndex;
   const tile=this.add.container(x,425).setData('shop-party-hero',hero).setData('shop-party-selected',selected);
   const frame=this.add.rectangle(0,0,width,64,selected?0x203e4d:0xd3bd94).setOrigin(0).setStrokeStyle(selected?2:1,selected?0xc9a251:0x9d875e);
   const portrait=this.add.image(width/2,25,`portrait-face-${hero}`).setDisplaySize(42,42);
   const label=hero==='robin'?'Robin (M)':hero==='robin-female'?'Robin (F)':HERO_NAMES[hero];
   const name=this.text(width/2,48,label,12).setOrigin(.5,0).setColor(selected?'#f9ebc7':'#44351e');
   const hit=this.add.zone(0,0,width,64).setOrigin(0).setInteractive({useHandCursor:true}).setData('shop-party-select',hero);
   hit.on('pointerdown',()=>this.selectHero(index));
   tile.add([frame,portrait,name,hit]);this.content!.add(tile);
  });
 }
 private renderShop():void{
  const hero=this.dataState.party[this.heroIndex],member=this.dataState.members.find(m=>m.hero===hero);this.content!.add(this.panel(44,129,808,398));this.content!.add(this.text(66,147,'Preparations',23));this.content!.add(this.add.image(680,163,'gold').setDisplaySize(24,24));this.content!.add(this.text(700,151,`${this.dataState.gold}`,20).setColor('#183e57'));const portrait=this.add.image(121,277,`portrait-${hero}`);portrait.setScale(Math.min(125/portrait.width,140/portrait.height));this.content!.add(portrait);this.content!.add(this.text(66,354,CLASS_NAMES[hero],13).setWordWrapWidth(120));this.content!.add(this.text(190,191,`${HERO_NAMES[hero]} · LV ${member?.progress.level??1}`,22));
  this.renderPartyStrip();
  this.content!.add(this.text(198,216,'EQUIPMENT · FORGE +2 POWER / HEAL',10).setColor('#80613a'));this.content!.add(this.text(534,216,'ARMORY · BUY',10).setColor('#80613a'));
  if(member){member.loadout.items.forEach((item,slot)=>{const weapon=itemWeapon(item),level=item.forge??0,max=level>=3,cost=campaignForgeCost(this.dataState.campaignId,level);this.choice(190,229+slot*34,`${slot===member.loadout.equippedSlot?'› ':''}${weapon.name}`,()=>{this.game.events.emit('campaign-shop-upgrade',{hero,slot});},max||this.dataState.gold<cost,max?'This weapon is fully forged (+3).':undefined,weapon.icon,max?'MAX':`${cost} G`,`${slot===member.loadout.equippedSlot?'Equipped · ':''}${weaponSummary(weapon,member)}${max?'':`\nForge: ${forgeBenefit(weapon,itemWeapon({...item,forge:level+1}))}`}`);});
   const owned=new Set(member.loadout.items.map(i=>i.weaponId));const allOffers=(this.dataState.campaignId==='awakening-ten'?shopWeaponIds(this.dataState.missionIndex+1):['steel-lance','steel-axe','steel-bow','killing-edge','thunder','wind','heal','nosferatu']).filter(id=>!owned.has(id)&&canEquip(hero,{weaponId:id,uses:null})&&SHOP_PRICES[id]).sort((a,b)=>(WEAPONS[b].tier??1)-(WEAPONS[a].tier??1));
   const pages=Math.max(1,Math.ceil(allOffers.length/3));this.armoryPage=Math.min(this.armoryPage,pages-1);const offers=allOffers.slice(this.armoryPage*3,this.armoryPage*3+3);
   if(pages>1)this.choice(526,334,`More weapons →  ${this.armoryPage+1}/${pages}`,()=>{this.armoryPage=(this.armoryPage+1)%pages;this.feedback('cursor');this.render();});
   offers.forEach((id,i)=>this.choice(526,229+i*34,WEAPONS[id].name,()=>{if(member.loadout.items.length===3){this.replacement={hero,itemId:id};this.render();}else this.game.events.emit('campaign-shop-buy',{hero,itemId:id});},this.dataState.gold<SHOP_PRICES[id],undefined,WEAPONS[id].icon,`${SHOP_PRICES[id]} G`,`${weaponSummary(WEAPONS[id],member)}\n${member.loadout.items.length<3?'Added to bag; current weapon stays equipped.':'Replaces equipped item after confirmation.'}`));if(!offers.length)this.content!.add(this.text(526,228,'All class weapons stocked.',13));
  }
  this.detailsText=this.text(190,366,'',this.readableSize()).setWordWrapWidth(620).setData('weapon-preview',true);this.content!.add(this.detailsText);
  this.content!.add(this.text(190,342,'Full health restored between missions.',13).setWordWrapWidth(310));this.content!.add(this.text(190,500,this.message,12).setWordWrapWidth(310));this.choice(526,493,'Change party',()=>{this.finished=true;this.feedback('confirm');this.game.events.emit('campaign-edit-party');});this.choice(600,449,'Deploy →',()=>this.continue());this.focus=Math.min(this.focus,Math.max(0,this.rows.length-1));this.updateFocus();
 }
 private readableSize():number {return Math.max(16,Math.ceil(12/Math.max(.1,this.game.canvas.getBoundingClientRect().width/896)));}
 private modalButton(x:number,y:number,width:number,label:string,action:()=>void):void {
  const scale=Math.max(.1,this.game.canvas.getBoundingClientRect().width/896),height=Math.ceil(44/scale),size=this.readableSize(),index=this.rows.length;
  const row=this.text(x,y,label,size).setFixedSize(width,height).setPadding(8,Math.max(5,Math.floor((height-size-4)/2)),8,5).setInteractive(new Phaser.Geom.Rectangle(0,0,width,height),Phaser.Geom.Rectangle.Contains).setData('modal-action',label);
  this.content!.add(row);this.rows.push(row);this.choiceActions.push(action);row.on('pointerover',()=>{this.focus=index;this.updateFocus();});row.on('pointerdown',action);
 }
 private renderReplacement():void {
  const pending=this.replacement!,member=this.dataState.members.find(m=>m.hero===pending.hero)!,old=itemWeapon(member.loadout.items[member.loadout.equippedSlot]),next=WEAPONS[pending.itemId],size=this.readableSize();
  this.content!.add(this.add.rectangle(448,272,896,544,0x10242c,.85).setInteractive());this.content!.add(this.panel(140,116,660,360).setData('replacement-frame',true));this.content!.add(this.text(168,138,'Replace equipped item?',Math.max(24,size)));
  this.content!.add(this.text(168,190,`${old.name} → ${next.name}\nReady ${(attackCooldown(member.progress,member.hero,old)*2.4/1000).toFixed(2)} → ${(attackCooldown(member.progress,member.hero,next)*2.4/1000).toFixed(2)}s\n${weaponSummary(next,member).replace(/ · Ready [\d.]+s/,'').replaceAll('Power ','Atk ').replaceAll('Range ','Rng ')}\n${SHOP_PRICES[pending.itemId]} gold · ${HERO_NAMES[pending.hero]}\nThe replaced item is removed.`,size).setWordWrapWidth(604).setData('replacement-copy',true));
  this.rows=[];this.choiceActions=[];this.modalButton(168,374,280,'Cancel',()=>{this.replacement=undefined;this.render();});this.modalButton(492,374,280,'Replace',()=>{this.replacement=undefined;this.game.events.emit('campaign-shop-buy',pending);});this.focus=0;this.updateFocus();
 }
 private renderMigrationNotice():void {
  const notice=this.dataState.migrationNotice!,size=this.readableSize();this.content!.add(this.add.rectangle(448,272,896,544,0x10242c,.85).setInteractive());this.content!.add(this.panel(140,116,660,360).setData('migration-frame',true));
  this.content!.add(this.text(168,138,'Equipment updated',Math.max(24,size)));
  const affected=[...new Set(notice.items.map(item=>HERO_NAMES[item.hero]))],names=affected.length<=3?affected.join(', '):`${affected.slice(0,2).join(', ')} and ${affected.length-2} others`;
  this.content!.add(this.text(168,190,`${names}\n${notice.refundGold} gold refunded for class-restricted items and all forge costs.\nYour original save was backed up.`,size).setWordWrapWidth(604).setData('migration-copy',true));
  this.rows=[];this.choiceActions=[];this.modalButton(268,374,360,'Continue',()=>{notice.acknowledged=true;this.game.events.emit('campaign-migration-acknowledge');this.render();});this.focus=0;this.updateFocus();
 }
 private continue():void{if(this.finished)return;this.finished=true;this.feedback('confirm');this.game.events.emit('campaign-continue');}
}
