import Phaser from 'phaser';
import { APP_VERSION } from '../data/version';
import { getMap } from '../data/maps';
import { HEROES, HERO_NAMES, HERO_PROFILES, WORLD, type Hero } from '../data/config';
import { initialLoadout, equippedWeapon, WEAPONS } from '../data/equipment';
import type { Hud } from './ArenaScene';

export interface InterfaceState {
  hero: Hero;
  phase:'party'|'deployment'|'battle';
  tactical:boolean;
  companions: Hero[];
  selectionMode: 'player'|'companions';
  ready: boolean;
  playing: boolean;
  paused: boolean;
  muted: boolean;
  settingsOpen: boolean;
  result: string;
  audio: { music: number; effects: number; voices: number; characterVoices: boolean; spellEffect: string };
}
export class InterfaceScene extends Phaser.Scene {
  private partyHealth!:Phaser.GameObjects.Graphics;
  private resumeControl!:Phaser.GameObjects.Container;
  private resumeLabel!:Phaser.GameObjects.Text;
  private saveHint!:Phaser.GameObjects.Text;
  private saveState:{available:boolean;missionName:string;complete:boolean}={available:false,missionName:'',complete:false};
  private previewPortrait!:Phaser.GameObjects.Image;
  private previewName!:Phaser.GameObjects.Text;
  private selectionMarks=new Map<Hero,Phaser.GameObjects.Text>();
  private partyWeaponIcons:Phaser.GameObjects.Image[]=[];
  private partyHeads:Phaser.GameObjects.Image[]=[];
  private goldCounter!:Phaser.GameObjects.Container;
  private goldValue!:Phaser.GameObjects.Text;
  private cooldownBar!:Phaser.GameObjects.Graphics;
  private cooldownText!:Phaser.GameObjects.Text;
  private soldiersControl!:Phaser.GameObjects.Container;
  private soldiersButton!:Phaser.GameObjects.Text;
  private warning!:Phaser.GameObjects.Text;
  private actionFeedback!:Phaser.GameObjects.Text;
  private actionFeedbackTimer?:Phaser.Time.TimerEvent;
  private warningTimer?:Phaser.Time.TimerEvent;
  private focusIndex=0;
  private focusFrame!:Phaser.GameObjects.Graphics;
  private deploymentHint!:Phaser.GameObjects.Text;
  private damageLabel!:Phaser.GameObjects.Text;
  private deploymentHeroes:Hero[]=[];
  private selectedDeployment?:string;
  private deploymentPanel!:Phaser.GameObjects.Container;
  private deploymentBackground!:Phaser.GameObjects.Rectangle;
  private deploymentControls!:Phaser.GameObjects.Text;
  private deploymentBegin!:Phaser.GameObjects.Container;
  private partyPanel!:Phaser.GameObjects.Container;
  private partyBackground!:Phaser.GameObjects.Rectangle;
  private damageControls!:Phaser.GameObjects.Container;
  private rallyLabel!:Phaser.GameObjects.Text;
  private partyRows:Phaser.GameObjects.Text[]=[];
  private partyZones:Phaser.GameObjects.Zone[]=[];
  private minimap!:Phaser.GameObjects.Graphics;
  private miniTerrain!:Phaser.GameObjects.Image;
  private miniTitle!:Phaser.GameObjects.Text;
  private legend!:Phaser.GameObjects.Text;
  private menu!: Phaser.GameObjects.Container;
  private cards = new Map<Hero, Phaser.GameObjects.NineSlice>();
  private selectionTitle!: Phaser.GameObjects.Text;
  private selectionSummary!: Phaser.GameObjects.Text;
  private description!: Phaser.GameObjects.Text;
  private begin!: Phaser.GameObjects.Text;
  private state!: InterfaceState;
  private menuButton!: Phaser.GameObjects.Container;
  private pauseButton!: Phaser.GameObjects.Container;
  private pauseFocus=0;
  private pauseChoices:Phaser.GameObjects.Text[]=[];
  private pauseActions:(()=>void)[]=[];
  private instructions!: Phaser.GameObjects.Text;
  private noticeTimer?:Phaser.Time.TimerEvent;
  private pauseText!: Phaser.GameObjects.Text;
  private speaker!: Phaser.GameObjects.Graphics;
  private stats!: Phaser.GameObjects.Text;
  private notice!: Phaser.GameObjects.Text;
  private settings!: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private endOverlay!: Phaser.GameObjects.Container;
  private resultText!: Phaser.GameObjects.Text;
  private levels!: Phaser.GameObjects.Graphics;
  private values: Partial<Record<'music'|'effects'|'voices', Phaser.GameObjects.Text>> = {};
  private enabled!: Phaser.GameObjects.Text;
  private voices!: Phaser.GameObjects.Text;
  private spell!: Phaser.GameObjects.Text;
  private readonly style = { resolution: 3, fontFamily: 'FE', fontSize: '13px', color: '#44351e' };
  constructor() { super('Interface'); }
  create(): void {
    this.registry.set('app-version', APP_VERSION);
    this.partyHeads=[];this.partyWeaponIcons=[];this.partyRows=[];this.partyZones=[];this.selectionMarks=new Map();this.cards=new Map();this.values={};this.warningTimer=undefined;this.actionFeedbackTimer=undefined;
    this.add.rectangle(WORLD.width/2, 17, WORLD.width, 34, 0x183e57, .94);
    this.warning=this.add.text(300,9,'',{...this.style,color:'#ffcd8c',fontSize:'11px'}).setDepth(90);
    const onWarning=({hero,health}:{hero:Hero;health:number})=>{this.warning.setText(`${HERO_NAMES[hero]} under attack! HP ${health} · Q/E`);this.warningTimer?.remove();this.warningTimer=this.time.delayedCall(4000,()=>this.warning.setText(''));};this.game.events.on('companion-warning',onWarning);this.events.once('shutdown',()=>this.game.events.off('companion-warning',onWarning));
    this.actionFeedback=this.add.text(448,44,'',{...this.style,color:'#fff0c6',fontSize:'13px',backgroundColor:'#183e57',padding:{x:10,y:5}}).setOrigin(.5,0).setDepth(150).setVisible(false);
    const onFeedback=({kind,message}:{kind:string;message?:string})=>{if(kind==='clear'){this.actionFeedbackTimer?.remove();this.actionFeedback.setVisible(false);return;}if(!message)return;this.actionFeedback.setPosition(448,this.state?.playing?44:470).setText(message).setColor(kind==='reject'?'#ffbd98':'#fff0c6').setVisible(true);this.actionFeedbackTimer?.remove();this.actionFeedbackTimer=this.time.delayedCall(1300,()=>this.actionFeedback.setVisible(false));};this.game.events.on('ux-feedback-visible',onFeedback);this.events.once('shutdown',()=>this.game.events.off('ux-feedback-visible',onFeedback));
    this.stats = this.add.text(12, 9, 'Choose your hero', { ...this.style, color:'#fff0c6', fontSize:'12px' });
    this.button(this.add.container(), 610, 3, 65, 'Audio', () => this.request('audio-options'));
    this.menuButton = this.add.container();
    this.button(this.menuButton, 678, 3, 56, 'Menu', () => this.request('main-menu'));
    this.pauseButton = this.add.container();
    this.pauseText = this.button(this.pauseButton, 737, 3, 65, 'Pause', () => this.request('pause'));
    const sound = this.add.container(805, 3);
    this.button(sound, 0, 0, 37, '', () => this.request('music'));
    this.speaker = this.add.graphics(); sound.add(this.speaker);
    this.button(this.add.container(), 845, 3, 43, 'Full', () => this.request('fullscreen'));
    this.notice = this.add.text(WORLD.width/2, 78, '', { ...this.style, color:'#fff1c7', fontSize:'11px', align:'center', backgroundColor:'#183e57', padding:{x:6,y:3}, wordWrap:{width:420} }).setOrigin(.5,0).setDepth(91);
    this.instructions = this.add.text(12, WORLD.height-30, 'WASD / Arrows: Move   Space / Click: Attack\nMouse: Aim   Q: Ally orders   P: Pause', { ...this.style, fontSize:'10px', color:'#fff1c7', backgroundColor:'#183e57' });
    this.preparePortraits();this.createCharacterMenu();this.createTacticalInterface();
    const onSave=(save:typeof this.saveState)=>{this.saveState=save;this.updateResume();};
    this.game.events.on('campaign-save-state',onSave);this.events.once('shutdown',()=>this.game.events.off('campaign-save-state',onSave));
    onSave(this.registry.get('campaign-save-state')??this.saveState);
    this.settings = this.panel(360, 370, 'Audio settings');
    this.enabled = this.button(this.settings, -158, -138, 316, '', () => this.request('music'));
    this.levels = this.add.graphics(); this.settings.add(this.levels);
    for (const [i, key] of (['music','effects','voices'] as const).entries()) {
      const y = -90+i*51;
      this.settings.add(this.add.text(-150, y-18, key === 'effects' ? 'Sound effects' : key[0].toUpperCase()+key.slice(1), this.style));
      this.values[key] = this.add.text(114, y-18, '', this.style); this.settings.add(this.values[key]!);
      const zone = this.add.zone(0, y+4, 300, 28).setInteractive({useHandCursor:true}); this.settings.add(zone);
      const adjust = (pointer: Phaser.Input.Pointer) => {
        const value = Math.round(Phaser.Math.Clamp((pointer.x-(WORLD.width/2-150))/300,0,1)*100);
        this.game.events.emit('ui-volume', key, value);
      };
      zone.on('pointerdown', adjust); zone.on('pointermove', (pointer: Phaser.Input.Pointer) => { if(pointer.isDown) adjust(pointer); });
    }
    this.voices = this.button(this.settings, -158, 63, 316, '', () => this.game.events.emit('ui-voices'));
    this.spell = this.button(this.settings, -158, 99, 316, '', () => this.game.events.emit('ui-spell'));
    this.button(this.settings, -158, 139, 151, 'Preview', () => this.request('audio-preview'));
    this.button(this.settings, 7, 139, 151, 'Close', () => this.request('audio-close'));
    this.pauseOverlay = this.panel(620, 400, 'Paused · Battle controls');
    const controls=[['WASD / Arrows','Move'],['Mouse','Aim ranged attacks'],['Space / Left click','Attack or cast equipped ability'],['Q / E','Previous / next living hero'],['F','Switch weapon or ability'],['I / Info','Inspect stats and equipment'],['R','Call companions · 10s / 20s cooldown'],['P','Pause / resume battle']];
    controls.forEach(([key,meaning],i)=>{const y=-140+i*27;this.pauseOverlay.add(this.add.text(-266,y,key,{...this.style,fontSize:'14px',color:'#183e57'}));this.pauseOverlay.add(this.add.text(-100,y,meaning,{...this.style,fontSize:'13px'}));});
    this.pauseOverlay.add(this.add.text(-266,84,'Staff: Space heals allies · Shift + Space heals yourself.\nCompanions with staves automatically help nearby allies in danger.',{...this.style,fontSize:'11px',wordWrap:{width:530}}));
    this.pauseActions=[()=>this.request('pause'),()=>this.request('audio-options'),()=>this.request('main-menu')];
    this.pauseChoices=['Resume · P','Audio','Main menu'].map((label,i)=>this.button(this.pauseOverlay,-270+i*185,135,170,label,this.pauseActions[i]));
    this.pauseOverlay.add(this.add.text(0,174,'← / →: choose · Enter / Space: confirm',{...this.style,fontSize:'11px'}).setOrigin(.5));
    this.endOverlay = this.panel(340, 208, 'The battle is over');
    this.resultText = this.add.text(0,-43,'',{...this.style,align:'center',wordWrap:{width:290}}).setOrigin(.5,0); this.endOverlay.add(this.resultText);
    this.button(this.endOverlay, -148, 19, 296, 'Try again', () => this.request('restart'));
    this.button(this.endOverlay, -148, 58, 296, 'Choose hero', () => this.request('choose'));
    const onState = (state:InterfaceState) => this.apply(state);
    const onNotice = (text:string) => {this.notice.setText(text);this.noticeTimer?.remove();this.notice.setVisible(Boolean(text)&&this.state.playing&&this.state.phase!=='deployment');this.noticeTimer=this.time.delayedCall(6500,()=>this.notice.setText('').setVisible(false));};
    const onKey=(event:KeyboardEvent)=>this.navigate(event);window.addEventListener('keydown',onKey);this.events.once('shutdown',()=>window.removeEventListener('keydown',onKey));
    const onHud = (hud:Hud) => this.stats.setText(this.state?.tactical?`${this.state.phase==='deployment'?'Deployment':'Battle'} · Hostiles ${hud.enemies} · Defeated ${hud.kills}`:`Wave ${hud.wave}  ·  Defeated ${hud.kills}  ·  Allies ${hud.allies}/${hud.allyCapacity}`);
    const onMap=(data:TacticalMap)=>this.drawTacticalMap(data);this.game.events.on('tactical-map',onMap);
    this.game.events.on('ui-state',onState); this.game.events.on('ui-notice',onNotice); this.game.events.on('hud',onHud);
    this.events.once('shutdown',()=>{this.game.events.off('tactical-map',onMap);this.game.events.off('ui-state',onState);this.game.events.off('ui-notice',onNotice);this.game.events.off('hud',onHud);});
    this.apply(this.registry.get('interface-state'));
    this.notice.setText(this.registry.get('interface-notice') ?? '').setVisible(false);
  }
  private preparePortraits():void {
    // Source-space face anchors align portraits without stretching; profile faces include hair framing.
    const eyes:Record<Hero,[number,number]>={chrom:[125,67],lucina:[126,80],frederick:[120,68],virion:[121,67],sumia:[125,83],morgan:[134,91],robin:[134,90],'robin-female':[120,91],cordelia:[125,68],lissa:[132,108],lonqu:[138,66],miriel:[125,82],ricken:[114,107],stahl:[120,69],sully:[126,74],tharja:[118,106],vaike:[133,71]};
    for(const hero of HEROES){
      const original=this.textures.get(`portrait-${hero}`);original.setFilter(Phaser.Textures.FilterMode.LINEAR);
      const key=`portrait-face-${hero}`;
      if(!this.textures.exists(key)){
        const face=this.textures.createCanvas(key,160,160)!;
        const [eyeX,eyeY]=eyes[hero];
        face.context.drawImage(original.getSourceImage() as HTMLImageElement,80-eyeX,64-eyeY);
        face.refresh().setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }
  }
  private createCharacterMenu():void {
    this.menu=this.add.container().setDepth(80);
    this.menu.add(this.add.rectangle(WORLD.width/2,(WORLD.height+34)/2,WORLD.width,WORLD.height-34,0x132b3b,.97).setInteractive());
    this.selectionTitle=this.add.text(WORLD.width/2,46,'',{...this.style,color:'#f9ebc7',fontSize:'22px'}).setOrigin(.5,0);this.menu.add(this.selectionTitle);
    this.button(this.menu,282,82,160,'Choose player',()=>this.request('leader-mode'));
    this.button(this.menu,454,82,160,'Companions',()=>this.request('party-mode'));
    const bounds:Record<string,{x:number;y:number}>={};
    for(const [index,hero] of HEROES.entries()){
      const x=38+(index%5)*112,y=122+Math.floor(index/5)*84;
      const card=this.add.nineslice(x,y,'ui-parchment',undefined,104,78,10,10,10,10).setOrigin(0).setInteractive({useHandCursor:true});
      card.on('pointerover',()=>{this.focusIndex=index;this.drawFocus();this.game.events.emit('ux-feedback',{kind:'cursor'});});card.on('pointerdown',()=>this.game.events.emit('ui-character',hero));this.cards.set(hero,card);this.menu.add(card);
      this.menu.add(this.add.image(x+52,y+29,`portrait-face-${hero}`).setDisplaySize(56,56));
      this.menu.add(this.add.image(x+91,y+12,equippedWeapon(initialLoadout(hero)).icon).setDisplaySize(14,14));
      this.menu.add(this.add.text(x+52,y+59,HERO_NAMES[hero],{...this.style,fontSize:'11px'}).setOrigin(.5,0));
      const mark=this.add.text(x+5,y+5,'',{...this.style,fontSize:'10px',color:'#183e57'});this.menu.add(mark);this.selectionMarks.set(hero,mark);
      bounds[hero]={x:x+52,y:y+39};
    }
    this.menu.add(this.add.nineslice(616,122,'ui-parchment',undefined,242,330,14,14,14,14).setOrigin(0));
    this.previewPortrait=this.add.image(737,218,'portrait-face-chrom').setDisplaySize(174,174);this.menu.add(this.previewPortrait);
    this.previewName=this.add.text(737,310,'',{...this.style,fontSize:'19px'}).setOrigin(.5,0);this.menu.add(this.previewName);
    this.description=this.add.text(637,343,'',{...this.style,fontSize:'12px',wordWrap:{width:204},lineSpacing:4});this.menu.add(this.description);
    this.focusFrame=this.add.graphics();this.menu.add(this.focusFrame);this.drawFocus();
    this.registry.set('character-card-centers',bounds);
    this.selectionSummary=this.add.text(38,467,'',{...this.style,fontSize:'12px',color:'#f9ebc7'});this.menu.add(this.selectionSummary);
    this.legend=this.add.text(38,489,'',{...this.style,fontSize:'10px',color:'#c8b789',wordWrap:{width:520}});this.menu.add(this.legend);
    this.begin=this.button(this.menu,626,492,222,'Review battlefield',()=>this.request('start'));
    this.saveHint=this.add.text(616,527,'',{...this.style,fontSize:'9px',color:'#dbcba5'});this.menu.add(this.saveHint);
    this.resumeControl=this.add.container();this.menu.add(this.resumeControl);this.resumeLabel=this.button(this.resumeControl,626,457,222,'Resume campaign',()=>this.game.events.emit('campaign-resume'));
  }
  private updateResume():void {if(!this.resumeControl)return;this.resumeControl.setVisible(this.saveState.available&&!this.saveState.complete);this.resumeLabel.setText(`Resume · ${this.saveState.missionName}`);this.saveHint.setText(this.saveState.available&&!this.saveState.complete?'A new campaign replaces this checkpoint.':'');}
  private updatePreview():void {if(!this.previewName)return;const hero=HEROES[this.focusIndex];this.previewPortrait.setTexture(`portrait-face-${hero}`).setDisplaySize(174,174);this.previewName.setText(HERO_NAMES[hero]);this.description.setText(`${HERO_PROFILES[hero].description}

${initialLoadout(hero).items.map(item=>WEAPONS[item.weaponId].name).join(' · ')}`);}
  private createTacticalInterface():void {
    this.goldCounter=this.add.container(270,515).setDepth(92).setVisible(false);this.goldCounter.add(this.add.image(0,0,'gold').setDisplaySize(20,20));this.goldValue=this.add.text(14,0,'',{...this.style,color:'#f7d878',fontSize:'12px'}).setOrigin(0,.5);this.goldCounter.add(this.goldValue);
    this.cooldownBar=this.add.graphics().setDepth(92);this.cooldownText=this.add.text(470,514,'',{...this.style,color:'#fff0c6',fontSize:'11px',backgroundColor:'#183e57',padding:{x:4,y:1}}).setOrigin(.5).setDepth(92);
    this.partyPanel=this.add.container().setDepth(85);
    this.partyBackground=this.add.rectangle(108,115,192,150,0x183e57,.94).setInteractive();this.partyPanel.add(this.partyBackground);this.rallyLabel=this.add.text(16,194,'Rally ready',{...this.style,fontSize:'11px',color:'#fff0c6',backgroundColor:'#183e57',padding:{x:5,y:3}}).setVisible(false);this.partyPanel.add(this.rallyLabel);
    for(let i=0;i<4;i++){const zone=this.add.zone(108,62+i*34,186,32).setInteractive({useHandCursor:true});zone.on('pointerdown',()=>{const heroes=[this.state.hero,...this.state.companions];if(this.state.phase==='deployment'&&heroes[i])this.game.events.emit('ui-deploy-hero',heroes[i]);});this.partyPanel.add(zone);this.partyZones.push(zone);const head=this.add.image(38,62+i*34,'portrait-face-chrom').setDisplaySize(30,30);this.partyPanel.add(head);this.partyHeads.push(head);const row=this.add.text(60,48+i*34,'',{...this.style,color:'#fff0c6',fontSize:'10px'}).setInteractive({useHandCursor:true});row.on('pointerdown',()=>{const heroes=[this.state.hero,...this.state.companions];if(this.state.phase==='deployment')this.game.events.emit('ui-deploy-hero',heroes[i]);});this.partyPanel.add(row);this.partyRows.push(row);const weaponIcon=this.add.image(182,66+i*34,'weapon-sword').setDisplaySize(14,14).setVisible(false);this.partyPanel.add(weaponIcon);this.partyWeaponIcons.push(weaponIcon);}
    this.damageControls=this.add.container();this.partyPanel.add(this.damageControls);this.damageControls.add(this.add.rectangle(108,208,192,30,0x183e57,.96).setInteractive());
    const adjust=(step:number)=>{const value=Math.round(Math.max(.25,Math.min(2,(this.registry.get('damage-scale')??.5)+step))*100)/100;this.registry.set('damage-scale',value);this.damageLabel.setText(`Damage ${Math.round(value*100)}%`);};
    this.button(this.damageControls,16,194,30,'−',()=>adjust(-.1));this.button(this.damageControls,170,194,30,'+',()=>adjust(.1));
    this.damageLabel=this.add.text(57,202,`Damage ${Math.round((this.registry.get('damage-scale')??.5)*100)}%`,{...this.style,color:'#fff0c6',fontSize:'12px'});this.damageControls.add(this.damageLabel);
    this.partyHealth=this.add.graphics();this.partyPanel.add(this.partyHealth);
    this.soldiersControl=this.add.container();this.partyPanel.add(this.soldiersControl);
    this.soldiersButton=this.button(this.soldiersControl,16,229,184,'Place soldiers',()=>this.game.events.emit('ui-deploy-soldier'));
    this.deploymentPanel=this.add.container().setDepth(85);
    this.deploymentBackground=this.add.rectangle(0,0,240,120,0x183e57,.96).setOrigin(0).setInteractive();this.deploymentPanel.add(this.deploymentBackground);
    this.deploymentHint=this.add.text(12,12,'Choose deployment positions.',{...this.style,fontSize:'11px',color:'#fff0c6',lineSpacing:3,wordWrap:{width:216}});this.deploymentPanel.add(this.deploymentHint);
    this.deploymentControls=this.add.text(12,40,'WASD: move cursor\nSpace: place + next\nEnter: auto-place · R: begin',{...this.style,fontSize:'11px',color:'#d2e2e8',lineSpacing:3,wordWrap:{width:216}});this.deploymentPanel.add(this.deploymentControls);
    this.deploymentBegin=this.add.container(12,80);this.deploymentPanel.add(this.deploymentBegin);this.button(this.deploymentBegin,0,0,132,'Auto-place',()=>this.game.events.emit('ui-deploy-auto'));this.button(this.deploymentBegin,0,40,132,'Begin battle',()=>this.game.events.emit('ui-launch'));
    this.miniTerrain=this.add.image(798,108,'battlefield').setDisplaySize(164,100).setTint(0x7c929b).setDepth(85);
    this.minimap=this.add.graphics().setDepth(86);this.miniTitle=this.add.text(722,42,'Battlefield',{...this.style,fontSize:'10px',color:'#fff0c6'}).setDepth(86);
  }
  private drawTacticalMap(data:TacticalMap):void {
    if(!this.state?.tactical)return;
    const background=getMap(data.missionIndex??2).backgroundKey;if(this.textures.exists(background))this.miniTerrain.setTexture(background).setDisplaySize(164,100);
    const rosterHeight=Math.max(1,data.party.length)*34+14;const roadPlanning=data.deploying&&data.missionIndex===0;this.partyPanel.setPosition(roadPlanning?WORLD.width-216:0,roadPlanning?WORLD.height-48-rosterHeight:0);this.partyBackground.setSize(192,rosterHeight).setY(40+rosterHeight/2);this.damageControls.setPosition(roadPlanning?-260:0,rosterHeight-150-(roadPlanning?36:0)).setVisible(data.deploying);const rally=data.rally;this.rallyLabel.setPosition(16,rosterHeight+45).setVisible(!data.deploying&&!!rally&&data.party.filter(p=>p.health>0).length>1).setText(rally?.active?`Rallying · ${Math.ceil(rally.remaining)}s`:rally?.available?'Rally ready':`Rally · ${Math.ceil(rally?.cooldown??0)}s`).setColor(rally?.active?'#a8dcaa':rally?.available?'#fff0c6':'#acb7b9');
    for(const [i,row] of this.partyRows.entries()){const unit=data.party[i];this.partyZones[i].setVisible(!!unit);row.setVisible(!!unit);this.partyHeads[i].setVisible(!!unit);if(unit)this.partyHeads[i].setTexture(`portrait-face-${unit.hero}`).setDisplaySize(30,30).setAlpha(unit.health>0?1:.3);const item=unit?.equippedWeaponId?WEAPONS[unit.equippedWeaponId]:undefined;this.partyWeaponIcons[i].setVisible(!!item);if(item)this.partyWeaponIcons[i].setTexture(item.icon).setAlpha(unit.health>0?1:.3);row.setText(unit?`${(data.deploying?data.selected:data.controlled)===unit.hero?'▶ ':''}${HERO_NAMES[unit.hero]}  LV ${unit.level}\n${data.deploying&&!unit.placed?'Not placed':`${unit.health<=0?'Fallen':`HP ${Math.max(0,unit.health)} / ${unit.maxHealth??unit.health}`} · XP ${unit.xp}`}`:'').setAlpha(unit&&unit.health>0?1:.4);}
    this.partyHealth.clear();for(const [i,unit]of data.party.entries()){const fraction=Phaser.Math.Clamp(unit.health/Math.max(1,unit.maxHealth??unit.health),0,1),color=unit.health<=0?0x53636c:fraction>.5?0x88c899:fraction>.25?0xe8be6c:0xe87969;this.partyHealth.fillStyle(0x0c2533).fillRect(59,76+i*34,131,5).fillStyle(color).fillRect(60,77+i*34,129*fraction,3);}
    this.soldiersControl.setVisible(false);this.soldiersButton.setText(`Place soldiers · ${data.placed-data.party.filter(p=>p.placed).length}/${getMap(data.missionIndex??2).soldierCount}`);
    this.deploymentHeroes=data.party.map(p=>p.hero);this.selectedDeployment=data.selected;
    const keepPlanning=data.deploying&&data.missionIndex===3,panelWidth=keepPlanning?156:240;
    this.deploymentHint.setWordWrapWidth(panelWidth-24).setText(data.party.every(p=>p.placed)?'Army ready.':data.objective??'Choose deployment positions.');
    this.deploymentControls.setWordWrapWidth(panelWidth-24).setY(12+this.deploymentHint.height+10);
    this.deploymentBegin.setY(this.deploymentControls.y+this.deploymentControls.height+16);
    const panelHeight=this.deploymentBegin.y+68+12;
    this.deploymentBackground.setSize(panelWidth,panelHeight);
    this.deploymentPanel.setPosition(keepPlanning?728:12,WORLD.height-12-panelHeight);
    this.miniTitle.setText(data.title??'Battlefield');
    if(!data.deploying)this.stats.setText(data.objectiveStatus??data.objective??'Complete the objective');
    // Gold is spent in preparations; combat uses brief pickup feedback only.
    this.goldCounter.setVisible(false);this.goldValue.setText(`${data.gold??0}`);this.cooldownBar.clear();this.cooldownText.setVisible(!data.deploying);if(!data.deploying){this.cooldownBar.fillStyle(0x183e57).fillRect(330,525,280,10).fillStyle(data.cooldown.recovering?0xe7a55d:data.cooldown.fraction===1?0x85cda1:0x86baff).fillRect(332,527,276*data.cooldown.fraction,6);this.cooldownText.setText(`${data.cooldown.recovering?'Recovering':data.cooldown.fraction===1?'Attack ready':'Recharging'}${data.cooldown.remaining>0?` · ${data.cooldown.remaining.toFixed(1)}s`:''}${data.camp?` · Camp ${Math.max(0,data.camp.health)}`:''}`);}
    const g=this.minimap;g.clear().fillStyle(0x152c37,.96).fillRect(712,38,172,20).lineStyle(1,0xae8746).strokeRect(716,58,164,100);
    const sx=164/data.width,sy=100/data.height;
    for(const p of data.enemies)g.fillStyle(0xeb5555).fillCircle(716+p.x*sx,58+p.y*sy,2);
    for(const p of data.allies)g.fillStyle(0x77bfff).fillCircle(716+p.x*sx,58+p.y*sy,2);
    const controlled=data.controlledPosition;if(controlled)g.lineStyle(1,0xffedb2).strokeCircle(716+controlled.x*sx,58+controlled.y*sy,4);
    g.lineStyle(1,0xe6d19a,.65).strokeRect(716+data.camera.x*sx,58+data.camera.y*sy,Math.min(164,data.camera.width*sx),Math.min(100,data.camera.height*sy));
  }
  private drawFocus():void {const x=38+(this.focusIndex%5)*112,y=122+Math.floor(this.focusIndex/5)*84;this.focusFrame.clear().lineStyle(3,0xfff0b0).strokeRect(x-2,y-2,108,82);this.updatePreview();this.registry.set('character-focus',HEROES[this.focusIndex]);}
  private navigate(event:KeyboardEvent):void {
    if(!this.state||this.state.settingsOpen||this.state.result)return;
    if(event.target instanceof HTMLElement&&event.target.closest('button,input,select,textarea,dialog'))return;
    const key=event.key.toLowerCase();
    if(this.state.paused){if(['w','a','arrowup','arrowleft','s','d','arrowdown','arrowright'].includes(key)){this.pauseFocus=(this.pauseFocus+(['w','a','arrowup','arrowleft'].includes(key)?-1:1)+this.pauseActions.length)%this.pauseActions.length;this.game.events.emit('ux-feedback',{kind:'cursor'});this.updatePauseFocus();}else if((key==='enter'||key===' ')&&!event.repeat)this.pauseActions[this.pauseFocus]?.();else return;event.preventDefault();event.stopImmediatePropagation();return;}
    if(this.state.phase==='battle'){if(key==='f'&&!event.repeat&&!this.state.paused){this.game.events.emit('ui-switch-weapon');event.preventDefault();}return;}
    if(this.state.phase==='deployment'){
      if(['q','e'].includes(key)){const i=this.deploymentHeroes.indexOf(this.selectedDeployment as Hero);this.game.events.emit('ui-deploy-hero',this.deploymentHeroes[(i+(key==='q'?-1:1)+this.deploymentHeroes.length)%this.deploymentHeroes.length]);}
      else if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(key)){this.game.events.emit('ui-deploy-move',['a','arrowleft'].includes(key)?-32:['d','arrowright'].includes(key)?32:0,['w','arrowup'].includes(key)?-32:['s','arrowdown'].includes(key)?32:0);}
      else if(key===' '&&!event.repeat)this.game.events.emit('ui-deploy-confirm');
      else if(key==='enter'&&!event.repeat)this.game.events.emit('ui-deploy-auto');
      else if(key==='r')this.game.events.emit('ui-launch');else return;
    }else {
      const move=({w:-5,arrowup:-5,s:5,arrowdown:5,a:-1,arrowleft:-1,d:1,arrowright:1} as Record<string,number>)[key];
      if(move!==undefined){if(Math.abs(move)===5){const column=this.focusIndex%5;const rows=Math.floor((HEROES.length-1-column)/5)+1;const row=Math.floor(this.focusIndex/5);this.focusIndex=((row+(move>0?1:-1)+rows)%rows)*5+column;}else this.focusIndex=(this.focusIndex+move+HEROES.length)%HEROES.length;this.drawFocus();this.game.events.emit('ux-feedback',{kind:'cursor'});}
      else if(key==='enter'||key===' ')this.game.events.emit('ui-character',HEROES[this.focusIndex]);
      else if(key==='tab')this.request(this.state.selectionMode==='player'?'party-mode':'leader-mode');
      else if(key==='r')this.request('start');else return;
    }
    event.preventDefault();
  }
  private updatePauseFocus():void {this.pauseChoices.forEach((choice,i)=>choice.setColor(i===this.pauseFocus?'#153e66':'#44351e').setBackgroundColor(i===this.pauseFocus?'#fff2cd':'#00000000'));}
  private request(id:string):void { this.game.events.emit('ui-action',id); }
  private button(parent:Phaser.GameObjects.Container,x:number,y:number,width:number,label:string,action:()=>void):Phaser.GameObjects.Text {
    const frame = this.add.nineslice(x,y,'ui-parchment',undefined,width,28,8,8,8,8).setOrigin(0).setInteractive({useHandCursor:true});
    const text = this.add.text(x+width/2,y+14,label,this.style).setOrigin(.5);
    frame.on('pointerdown',()=>{this.game.events.emit('ux-feedback',{kind:'confirm'});frame.setTint(0xe1c187);action();}); frame.on('pointerup',()=>frame.clearTint()); frame.on('pointerout',()=>frame.clearTint());
    parent.add([frame,text]); return text;
  }
  private panel(width:number,height:number,title:string):Phaser.GameObjects.Container {
    const container = this.add.container(WORLD.width/2,WORLD.height/2).setDepth(200);
    const shade=this.add.rectangle(0,0,WORLD.width,WORLD.height,0x0d1d28,.72).setInteractive();
    const frame=this.add.nineslice(-width/2,-height/2,'ui-parchment',undefined,width,height,16,16,16,16).setOrigin(0);
    const text=this.add.text(0,-height/2+16,title,{...this.style,fontSize:'20px'}).setOrigin(.5,0);
    container.add([shade,frame,text]);return container;
  }
  private apply(state:InterfaceState):void {
    if(!state)return;if(state.paused&&!this.state?.paused)this.pauseFocus=0;this.state=state;this.updatePauseFocus();if(state.phase!=='battle'||state.result)this.warning.setText('');
    if(!state.playing){this.goldCounter.setVisible(false);this.cooldownBar.clear();this.cooldownText.setVisible(false);}
    this.menu.setVisible(!state.playing && !state.result && !state.settingsOpen);
    this.selectionTitle.setText(state.selectionMode === 'player' ? 'Choose your party leader' : 'Choose up to three companions');
    if(state.tactical&&state.phase==='battle')this.stats.setText('Battle · Defeat all four camps');
    if(state.tactical && state.phase==='deployment')this.stats.setText('Deployment · Four known camps · Place your party');
    this.begin.setText(state.tactical?'Review battlefield':'Begin battle');this.legend.setText(state.tactical?'★ Leader · 1–3 Companions\nWASD: focus · Enter: choose · Tab: mode · R: battlefield · F9: developer maps':'Gold: player · Blue: companion · Q: Defend / Attack orders');
    const tacticalVisible=state.tactical&&state.playing&&!state.result;this.partyPanel.setVisible(tacticalVisible);this.deploymentPanel.setVisible(tacticalVisible&&state.phase==='deployment');this.minimap.setVisible(tacticalVisible);this.miniTerrain.setVisible(tacticalVisible);this.miniTitle.setVisible(tacticalVisible);
    this.instructions.setText(state.tactical?'WASD: Move · Space / Click: Attack · Mouse: Aim\nQ/E: Hero · F: Weapon · R: Rally · I: Info · P: Pause':'WASD / Arrows: Move   Space / Click: Attack\nMouse: Aim   Q: Ally orders   P: Pause');
    this.updateResume();this.updatePreview();
    this.selectionSummary.setText(`Leader: ${HERO_NAMES[state.hero]}   ·   ${state.companions.length}/3 companions   ·   ${state.tactical?4:2} NPC soldiers`);
    this.begin.setAlpha(state.ready ? 1 : .5);
    for(const [hero,card] of this.cards){
      card.clearTint();this.selectionMarks.get(hero)?.setText(hero===state.hero?'★':state.companions.includes(hero)?`${state.companions.indexOf(hero)+1}`:'');
      if(hero===state.hero)card.setTint(0xe7c878);
      else if(state.companions.includes(hero))card.setTint(0xadd0e5);
    }
    const inBattle = state.playing || Boolean(state.result);
    this.menuButton.setVisible(inBattle); this.pauseButton.setVisible(state.playing && state.phase!=='deployment');
    this.notice.setVisible(inBattle && state.phase!=='deployment' && Boolean(this.notice.text)); this.instructions.setVisible(false);
    this.pauseText.setText(state.paused?'Resume':'Pause').setAlpha(state.playing?1:.5);
    this.settings.setVisible(state.settingsOpen);
    this.pauseOverlay.setVisible(state.playing&&state.paused&&!state.settingsOpen);
    this.endOverlay.setVisible(Boolean(state.result)&&!state.settingsOpen);
    this.resultText.setText(state.result);
    this.enabled.setText(state.muted?'[ ] Enable audio':'[✓] Enable audio');
    this.voices.setText(state.audio.characterVoices?'[✓] Character battle voices':'[ ] Character battle voices');
    this.spell.setText(`Spell: ${state.audio.spellEffect === 'fire-cast' ? 'Fire cast' : state.audio.spellEffect.replace('archive-effect-','Archive effect ')}`);
    this.levels.clear();
    for(const [i,key] of (['music','effects','voices'] as const).entries()){
      const y=-90+i*51;const value=state.audio[key];this.values[key]!.setText(`${Math.round(value*100)}%`);
      this.levels.fillStyle(0x927447).fillRect(-150,y,300,5).fillStyle(0x285575).fillRect(-150,y,300*value,5).fillStyle(0xf8edc8).fillCircle(-150+300*value,y+2,7);
    }
    this.speaker.clear().lineStyle(2,0x183e57).fillStyle(0x183e57);
    this.speaker.fillRect(8,11,5,7).fillTriangle(12,11,19,6,19,22);
    if(state.muted)this.speaker.lineBetween(23,9,30,20).lineBetween(30,9,23,20);
    else this.speaker.beginPath().arc(20,14,7,-.8,.8).strokePath();
  }
}

interface TacticalMap {rally?:{active:boolean;remaining:number;cooldown:number;available:boolean};missionIndex?:number;title?:string;objective?:string;objectiveStatus?:string;totalWaves?:number;gold?:number;camp?:{health:number;maxHealth:number};cooldown:{fraction:number;remaining:number;recovering:boolean};stagePhase:string;wave:number;remaining:number;elapsed:number;pending:number;boss?:{health:number;maxHealth:number};width:number;height:number;deploying:boolean;controlled:Hero;controlledPosition?:{x:number;y:number};selected:string;placed:number;total:number;party:{hero:Hero;placed:boolean;health:number;maxHealth?:number;level:number;xp:number;equippedWeaponId?:string}[];allies:{x:number;y:number}[];enemies:{x:number;y:number}[];camera:{x:number;y:number;width:number;height:number};}
