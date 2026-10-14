import { CONTROL_LABELS, DEFAULT_BINDINGS, readControlPreferences, saveControlPreferences, keyFor, keyLabel, validBinding, type ControlAction, type ControlPreferences } from '../input/control-preferences';
import Phaser from 'phaser';
import { TouchControls } from '../input/TouchControls';
import { APP_VERSION } from '../data/version';
import { getMap } from '../data/maps';
import { HEROES, HERO_NAMES, HERO_PROFILES, WORLD, type Hero } from '../data/config';
import { initialLoadout, equippedWeapon, WEAPONS } from '../data/equipment';
import type { CommanderId } from '../data/commanders';
import type { Hud } from './ArenaScene';

export interface InterfaceState {
  preparationEditing?: boolean;
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
  private touchControls!:TouchControls;
  private touchUsed=false;
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
  private bossPanel!:Phaser.GameObjects.Container;
  private bossPortrait!:Phaser.GameObjects.Image;
  private bossName!:Phaser.GameObjects.Text;
  private bossPhase!:Phaser.GameObjects.Text;
  private bossHealth!:Phaser.GameObjects.Graphics;
  private minimap!:Phaser.GameObjects.Graphics;
  private miniTerrain!:Phaser.GameObjects.Image;
  private miniTitle!:Phaser.GameObjects.Text;
  private legend!:Phaser.GameObjects.Text;
  private menu!: Phaser.GameObjects.Container;
  private cards = new Map<Hero, Phaser.GameObjects.Rectangle>();
  private heroTiles:Phaser.GameObjects.Container[]=[];
  private rosterColumns=5;
  private rosterPaging!:Phaser.GameObjects.Container;
  private rosterPageLabel!:Phaser.GameObjects.Text;
  private rosterPrevious!:Phaser.GameObjects.Text;
  private rosterNext!:Phaser.GameObjects.Text;
  private compactParty=false;
  private previewFrame!:Phaser.GameObjects.NineSlice;
  private backControl!:Phaser.GameObjects.Container;
  private primaryControl!:Phaser.GameObjects.Container;
  private partyTray!:Phaser.GameObjects.Container;
  private emptyConfirmation=false;
  private partyActionFocus=false;
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
  private headerUtilities!: Phaser.GameObjects.Container;
  private speaker!: Phaser.GameObjects.Graphics;
  private stats!: Phaser.GameObjects.Text;
  private notice!: Phaser.GameObjects.Text;
  private pauseKeyLabels:Phaser.GameObjects.Text[]=[];
  private pauseGuardText!:Phaser.GameObjects.Text;
  private controlPanel!:Phaser.GameObjects.Container;
  private controlRows:Phaser.GameObjects.Text[]=[];
  private controlFocus=0;
  private capturing:ControlAction|undefined;
  private controlPrefs:ControlPreferences=readControlPreferences();
  private controlMessage!:Phaser.GameObjects.Text;
  private settings!: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private partyInfo!:Phaser.GameObjects.Container;
  private partyInfoRows:Phaser.GameObjects.Text[]=[];
  private partyInfoOpen=false;
  private tacticalSnapshot?:TacticalMap;
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
    // Scene instances survive shutdown; never retain destroyed controls across phases.
    this.partyInfoRows=[];this.partyInfoOpen=false;this.tacticalSnapshot=undefined;
    this.controlRows=[];this.pauseKeyLabels=[];this.controlFocus=0;this.capturing=undefined;this.controlPrefs=readControlPreferences();this.registry.set('controls-open',false);this.registry.set('controls-capture',false);
    this.events.once('shutdown',()=>{if(this.registry.get('controls-open'))this.game.events.emit('controls-open',false);this.registry.set('controls-open',false);this.registry.set('controls-capture',false);this.capturing=undefined;});
    this.touchUsed=window.matchMedia('(pointer: coarse)').matches;
    this.touchControls=new TouchControls(this);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(p.wasTouch){this.touchUsed=true;this.touchControls.setEnabled(this.state?.phase==='battle'&&this.state.playing&&!this.state.paused&&!this.state.settingsOpen);}});
    this.registry.set('app-version', APP_VERSION);
    this.partyHeads=[];this.partyWeaponIcons=[];this.partyRows=[];this.partyZones=[];this.selectionMarks=new Map();this.cards=new Map();this.heroTiles=[];this.emptyConfirmation=false;this.partyActionFocus=false;this.values={};this.warningTimer=undefined;this.actionFeedbackTimer=undefined;
    this.add.rectangle(WORLD.width/2, 17, WORLD.width, 34, 0x183e57, .94);
    this.warning=this.add.text(300,9,'',{...this.style,color:'#ffcd8c',fontSize:'11px'}).setDepth(90);
    const onWarning=({hero,health}:{hero:Hero;health:number})=>{this.warning.setText(`${HERO_NAMES[hero]} under attack! HP ${health}`);this.warningTimer?.remove();this.warningTimer=this.time.delayedCall(4000,()=>this.warning.setText(''));};this.game.events.on('companion-warning',onWarning);this.events.once('shutdown',()=>this.game.events.off('companion-warning',onWarning));
    this.actionFeedback=this.add.text(448,44,'',{...this.style,color:'#fff0c6',fontSize:'13px',backgroundColor:'#183e57',padding:{x:10,y:5}}).setOrigin(.5,0).setDepth(150).setVisible(false);
    const onFeedback=({kind,message}:{kind:string;message?:string})=>{if(kind==='clear'){this.actionFeedbackTimer?.remove();this.actionFeedback.setVisible(false);return;}if(!message)return;this.actionFeedback.setPosition(this.state?.playing?448:740,this.state?.playing?(this.bossPanel?.visible?110:44):382).setWordWrapWidth(this.state?.playing?760:218).setText(message).setColor(kind==='reject'?'#ffbd98':'#fff0c6').setVisible(true);this.actionFeedbackTimer?.remove();this.actionFeedbackTimer=this.time.delayedCall(1300,()=>this.actionFeedback.setVisible(false));};this.game.events.on('ux-feedback-visible',onFeedback);this.events.once('shutdown',()=>this.game.events.off('ux-feedback-visible',onFeedback));
    this.stats = this.add.text(12, 9, 'Choose your hero', { ...this.style, color:'#fff0c6', fontSize:'12px' });
    this.headerUtilities=this.add.container();
    this.button(this.headerUtilities, 678, 3, 124, 'Settings', () => this.request('audio-options'));
    const fullscreen=this.add.container().setDepth(180);
    this.button(fullscreen,0,0,28,'⛶',()=>this.request('fullscreen'));
    const layoutFullscreen=()=>{const width=this.game.canvas.getBoundingClientRect().width||896;const factor=this.touchUsed?Math.max(1,44*896/width/28):1;fullscreen.setScale(factor).setPosition(896-28*factor-4,3);const shift=Math.min(0,fullscreen.x-8-802);this.headerUtilities.setX(shift);this.menuButton?.setX(shift);if(this.pauseButton){const frame=this.pauseButton.list[0] as Phaser.GameObjects.NineSlice;if(this.touchUsed){const hit=28*factor,center=fullscreen.x-8-hit/2;this.pauseButton.setScale(1).setPosition(center-14,3);frame.setPosition(0,0).setSize(28,28);(frame.input!.hitArea as Phaser.Geom.Rectangle).setTo(14-hit/2,14-hit/2,hit,hit);this.pauseText.setPosition(14,14).setFontSize(18);this.menuButton?.setX(Math.min(shift,center-hit/2-8-734));}else{this.pauseButton.setScale(1).setPosition(shift,0);frame.setPosition(737,3).setSize(65,28);(frame.input!.hitArea as Phaser.Geom.Rectangle).setTo(0,0,65,28);this.pauseText.setPosition(769.5,17).setFontSize(13);}}this.registry.set('fullscreen-control',{x:fullscreen.x,y:fullscreen.y,width:28*factor,height:28*factor});};
    // Layout after the new Pause control is created; scene restarts retain destroyed old references.
    this.scale.on('resize',layoutFullscreen);this.events.once('shutdown',()=>this.scale.off('resize',layoutFullscreen));
    this.menuButton = this.add.container();
    this.button(this.menuButton, 678, 3, 56, 'Menu', () => this.request('main-menu'));
    this.pauseButton = this.add.container();
    this.pauseText = this.button(this.pauseButton, 737, 3, 65, 'Pause', () => this.request('pause'));layoutFullscreen();
    const sound = this.add.container(805, 3).setVisible(false);
    this.button(sound, 0, 0, 37, '', () => this.request('music'));
    this.speaker = this.add.graphics(); sound.add(this.speaker);
    this.notice = this.add.text(WORLD.width/2, 78, '', { ...this.style, color:'#fff1c7', fontSize:'11px', align:'center', backgroundColor:'#183e57', padding:{x:6,y:3}, wordWrap:{width:420} }).setOrigin(.5,0).setDepth(91);
    this.instructions = this.add.text(12, WORLD.height-30, 'WASD / Arrows: Move   Space / Click: Attack\nMouse: Aim   Q: Ally orders   P: Pause', { ...this.style, fontSize:'10px', color:'#fff1c7', backgroundColor:'#183e57' });
    this.preparePortraits();this.createCharacterMenu();this.createTacticalInterface();
    const onSave=(save:typeof this.saveState)=>{this.saveState=save;this.updateResume();};
    this.game.events.on('campaign-save-state',onSave);this.events.once('shutdown',()=>this.game.events.off('campaign-save-state',onSave));
    onSave(this.registry.get('campaign-save-state')??this.saveState);
    this.settings = this.panel(360, 414, 'Settings');
    this.button(this.settings,-158,175,316,'Controls & accessibility · C',()=>this.openControls());
    this.createControls();
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
    this.button(this.settings, -158, 139, 151, 'Fullscreen', () => this.request('fullscreen'));
    this.button(this.settings, 7, 139, 151, 'Close', () => this.request('audio-close'));
    this.pauseOverlay = this.panel(620, 480, 'Paused · Battle controls');
    const controls=[['WASD / Arrows','Move'],['Mouse','Aim attacks (including melee)'],['Space / Left click','Attack or cast equipped ability'],['Q / E','Previous / next living hero'],['F','Switch weapon or ability'],['I / Info','Inspect stats and equipment'],['R','Call companions · 10s / 20s cooldown'],['P','Pause / resume battle']];
    controls.forEach(([key,meaning],i)=>{const y=-140+i*27;const label=this.add.text(-266,y,key,{...this.style,fontSize:'14px',color:'#183e57'});this.pauseKeyLabels.push(label);this.pauseOverlay.add(label);this.pauseOverlay.add(this.add.text(-100,y,meaning,{...this.style,fontSize:'13px'}));});
    this.pauseGuardText=this.add.text(-266,84,'Ctrl / right mouse: Guard frontal physical attacks.\nStaff: Space heals allies · Shift + Space heals yourself.\nCompanions with staves automatically help nearby allies in danger.',{...this.style,fontSize:'11px',wordWrap:{width:530}});this.pauseOverlay.add(this.pauseGuardText);
    this.pauseActions=[()=>this.request('pause'),()=>this.showPartyInfo(),()=>this.request('audio-options'),()=>this.request('main-menu')];
    this.pauseChoices=['Resume','Info','Settings','Main menu'].map((label,i)=>this.button(this.pauseOverlay,-270+i*140,135,130,label,this.pauseActions[i]));
    const layoutPauseInfo=()=>{const scale=Math.max(.1,this.game.canvas.getBoundingClientRect().width/WORLD.width),height=Math.max(28,44/scale);const text=this.pauseChoices[1],index=this.pauseOverlay.list.indexOf(text),frame=this.pauseOverlay.list[index-1] as Phaser.GameObjects.NineSlice;frame.setSize(130,height);if(frame.input)(frame.input.hitArea as Phaser.Geom.Rectangle).setTo(0,0,130,height);text.setY(135+height/2);};
    this.scale.on('resize',layoutPauseInfo);this.events.once('shutdown',()=>this.scale.off('resize',layoutPauseInfo));layoutPauseInfo();
    this.partyInfo=this.panel(620,400,'Party · Progress and equipment').setVisible(false);
    for(let i=0;i<4;i++){const row=this.add.text(-270,-138+i*65,'',{...this.style,fontSize:'18px',color:'#183e57'});this.partyInfo.add(row);this.partyInfoRows.push(row);}
    const back=this.add.container(-270,140),resume=this.add.container(40,140);this.partyInfo.add([back,resume]);
    this.button(back,0,0,90,'Back',()=>{this.partyInfoOpen=false;this.apply(this.state);});
    this.button(resume,0,0,90,'Resume',()=>{this.partyInfoOpen=false;this.request('pause');});
    const layoutInfo=()=>{const scale=Math.max(.1,this.game.canvas.getBoundingClientRect().width/WORLD.width),factor=Math.max(1,44/(28*scale));back.setScale(factor);resume.setScale(factor);};
    this.scale.on('resize',layoutInfo);this.events.once('shutdown',()=>this.scale.off('resize',layoutInfo));layoutInfo();
    this.refreshPauseBindings();
    const retryPanel=this.textures.exists('ui-parchment')?this.panel(360,180,'Unable to load game assets'):this.add.container(WORLD.width/2,WORLD.height/2).add([this.add.rectangle(0,0,WORLD.width,WORLD.height,0x0d1d28,.9).setInteractive(),this.add.rectangle(0,0,360,180,0x183e57).setStrokeStyle(2,0xe6d19a),this.add.text(0,-68,'Unable to load game assets',{...this.style,color:'#fff1c7',fontSize:'18px'}).setOrigin(.5)]);retryPanel.setDepth(260).setVisible(false);const fallback=!this.textures.exists('ui-parchment');retryPanel.add(this.add.text(0,-40,'Check your connection, then try again.',{...this.style,color:fallback?'#fff1c7':'#44351e',fontSize:'13px'}).setOrigin(.5));if(fallback){const retryTarget=this.add.rectangle(0,42,280,46,0xe6d19a).setInteractive({useHandCursor:true});retryTarget.on('pointerdown',()=>this.game.events.emit('ui-retry-load'));retryPanel.add([retryTarget,this.add.text(0,42,'Retry loading',{...this.style,color:'#183e57',fontSize:'18px'}).setOrigin(.5)]);}else this.button(retryPanel,-140,18,280,'Retry loading',()=>this.game.events.emit('ui-retry-load'));const onLoadingError=()=>retryPanel.setVisible(true);this.game.events.on('loading-error',onLoadingError);this.events.once('shutdown',()=>this.game.events.off('loading-error',onLoadingError));if(this.registry.get('loading-error'))onLoadingError();
    this.endOverlay = this.panel(340, 208, 'The battle is over');
    this.resultText = this.add.text(0,-43,'',{...this.style,align:'center',wordWrap:{width:290}}).setOrigin(.5,0); this.endOverlay.add(this.resultText);
    this.button(this.endOverlay, -148, 19, 296, 'Try again', () => this.request('restart'));
    this.button(this.endOverlay, -148, 58, 296, 'Choose hero', () => this.request('choose'));
    const onState = (state:InterfaceState) => this.apply(state);
    const onNotice = (text:string) => {this.notice.setY(this.bossPanel?.visible?136:78).setText(text);this.noticeTimer?.remove();this.notice.setVisible(Boolean(text)&&this.state.playing&&this.state.phase!=='deployment');this.noticeTimer=this.time.delayedCall(6500,()=>this.notice.setText('').setVisible(false));};
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
      for(const variant of ['', '-selected']){
      const sourceKey=variant?`portrait-selected-${hero}`:`portrait-${hero}`;if(!this.textures.exists(sourceKey))continue;
      const original=this.textures.get(sourceKey);original.setFilter(Phaser.Textures.FilterMode.LINEAR);
      const key=`portrait-face${variant}-${hero}`;
      if(!this.textures.exists(key)){
        const face=this.textures.createCanvas(key,160,160)!;
        const [eyeX,eyeY]=eyes[hero];
        face.context.drawImage(original.getSourceImage() as HTMLImageElement,80-eyeX,64-eyeY);
        face.refresh().setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      }
    }
  }
  private createCharacterMenu():void {
    this.menu=this.add.container().setDepth(80);
    this.menu.add(this.add.rectangle(448,289,896,510,0x132b3b,.98).setInteractive());
    this.selectionTitle=this.add.text(28,48,'',{...this.style,color:'#f9ebc7',fontSize:'25px'});this.menu.add(this.selectionTitle);
    this.selectionSummary=this.add.text(28,83,'',{...this.style,fontSize:'15px',color:'#c8b789'});this.menu.add(this.selectionSummary);
    for(const [index,hero] of HEROES.entries()){
      const tile=this.add.container();this.menu.add(tile);this.heroTiles.push(tile);
      const card=this.add.rectangle(0,0,100,76,0x203e4d).setOrigin(0).setStrokeStyle(1,0x49616a).setInteractive({useHandCursor:true});
      card.on('pointerover',()=>{if(this.focusIndex!==index){this.focusIndex=index;this.layoutParty();this.game.events.emit('ux-feedback',{kind:'cursor'});}});
      card.on('pointerdown',()=>this.game.events.emit('ui-character',hero));this.cards.set(hero,card);tile.add(card);
      tile.add(this.add.image(50,27,`portrait-face-${hero}`).setDisplaySize(52,52).setData('hero-portrait',hero));
      tile.add(this.add.image(89,12,equippedWeapon(initialLoadout(hero)).icon).setDisplaySize(16,16));
      tile.add(this.add.text(50,57,HERO_NAMES[hero],{...this.style,fontSize:'13px',color:'#f3e7c9'}).setOrigin(.5,0));
      const mark=this.add.text(5,4,'',{...this.style,fontSize:'13px',color:'#9ad2ee'});tile.add(mark);this.selectionMarks.set(hero,mark);
    }
    this.previewFrame=this.add.nineslice(612,116,'ui-parchment',undefined,256,310,14,14,14,14).setOrigin(0);this.menu.add(this.previewFrame);
    this.previewPortrait=this.add.image(740,218,'portrait-chrom');this.menu.add(this.previewPortrait);
    this.previewName=this.add.text(740,305,'',{...this.style,fontSize:'20px'}).setOrigin(.5,0);this.menu.add(this.previewName);
    this.description=this.add.text(632,336,'',{...this.style,fontSize:'15px',wordWrap:{width:215},lineSpacing:4});this.menu.add(this.description);
    this.focusFrame=this.add.graphics();this.menu.add(this.focusFrame);
    this.partyTray=this.add.container(28,442);this.menu.add(this.partyTray);
    this.legend=this.add.text(28,519,'',{...this.style,fontSize:'13px',color:'#c8b789'});this.menu.add(this.legend);
    this.backControl=this.add.container();this.menu.add(this.backControl);this.button(this.backControl,612,444,90,'Back',()=>{this.emptyConfirmation=false;this.request('leader-mode');});
    this.primaryControl=this.add.container();this.menu.add(this.primaryControl);this.begin=this.button(this.primaryControl,714,444,154,'Begin Story',()=>this.beginStory(),false);
    this.saveHint=this.add.text(612,512,'',{...this.style,fontSize:'11px',color:'#dbcba5'});this.menu.add(this.saveHint);
    this.resumeControl=this.add.container();this.menu.add(this.resumeControl);this.resumeLabel=this.button(this.resumeControl,612,480,256,'Resume campaign',()=>this.game.events.emit('campaign-resume'));
    this.rosterPaging=this.add.container();this.menu.add(this.rosterPaging);
    const changePage=(step:number)=>{const page=Math.floor(this.focusIndex/9),next=page+step;if(next<0||next>Math.floor((HEROES.length-1)/9))return;this.focusIndex=Math.min(next*9+this.focusIndex%9,HEROES.length-1);this.partyActionFocus=false;this.layoutParty();this.game.events.emit('ux-feedback',{kind:'cursor'});};
    this.rosterPrevious=this.add.text(616,85,'‹ Prev',{...this.style,color:'#f3e7c9',fontSize:'20px',padding:{x:3,y:3}}).setInteractive({useHandCursor:true}).on('pointerdown',()=>changePage(-1));
    this.rosterPageLabel=this.add.text(740,88,'',{...this.style,color:'#c8b789',fontSize:'18px'}).setOrigin(.5,0);
    this.rosterNext=this.add.text(787,85,'Next ›',{...this.style,color:'#f3e7c9',fontSize:'20px',padding:{x:3,y:3}}).setInteractive({useHandCursor:true}).on('pointerdown',()=>changePage(1));
    this.rosterPaging.add([this.rosterPrevious,this.rosterPageLabel,this.rosterNext]);
    const resize=()=>this.layoutParty();this.scale.on('resize',resize);this.events.once('shutdown',()=>this.scale.off('resize',resize));this.layoutParty();
  }
  private beginStory():void {
    if(this.state.selectionMode==='player'){this.game.events.emit('ui-character',HEROES[this.focusIndex]);return;}
    if(!this.state.companions.length&&!this.emptyConfirmation){this.emptyConfirmation=true;this.legend.setText(this.state.preparationEditing?'Travel alone? Press Return to preparations again to confirm.':'Travel alone? Press Begin Story again to confirm.');this.game.events.emit('ux-feedback',{kind:'reject'});return;}
    this.emptyConfirmation=false;this.game.events.emit('ux-feedback',{kind:'confirm'});this.request('start');
  }
  private layoutParty():void {
    if(!this.menu)return;
    this.compactParty=this.scale.displaySize.width<720;this.rosterColumns=this.compactParty?3:5;
    const page=this.compactParty?Math.floor(this.focusIndex/9):0;
    if(this.rosterPaging){this.rosterPaging.setVisible(this.compactParty);this.rosterPageLabel.setText(`${page+1} / ${Math.ceil(HEROES.length/9)}`);this.rosterPrevious.setAlpha(page===0?.35:1);this.rosterNext.setAlpha(page===Math.floor((HEROES.length-1)/9)?.35:1);if(page===0)this.rosterPrevious.disableInteractive();else this.rosterPrevious.setInteractive({useHandCursor:true});if(page===Math.floor((HEROES.length-1)/9))this.rosterNext.disableInteractive();else this.rosterNext.setInteractive({useHandCursor:true});}
    const bounds:Record<string,{x:number;y:number}>={};
    this.heroTiles.forEach((tile,i)=>{const n=this.compactParty?i%9:i;const x=28+(n%this.rosterColumns)*(this.compactParty?180:114),y=116+Math.floor(n/this.rosterColumns)*(this.compactParty?101:80);tile.setPosition(x,y).setVisible(!this.compactParty||Math.floor(i/9)===page);tile.setScale(this.compactParty?1.3:1);bounds[HEROES[i]]={x:x+50*tile.scaleX,y:y+38*tile.scaleY};});
    // Compact mode pages the roster rather than squeezing all seventeen names.
    this.previewFrame.setVisible(true);this.previewPortrait.setVisible(true);this.previewName.setVisible(true);this.description.setVisible(true);this.description.setFontSize(this.compactParty?19:15);
    this.selectionTitle.setFontSize(this.compactParty?30:25);this.selectionSummary.setFontSize(this.compactParty?20:15);
    this.registry.set('character-card-centers',bounds);this.drawFocus();
  }
  private updateResume():void {if(!this.resumeControl)return;this.resumeControl.setVisible(!this.state?.preparationEditing&&this.saveState.available&&!this.saveState.complete);this.resumeLabel.setText(`Resume · ${this.saveState.missionName}`);this.saveHint.setText(this.saveState.available&&!this.saveState.complete?'A new campaign replaces this checkpoint.':'');}
  private portraitKey(hero:Hero,face=false):string {const selected=hero===this.state?.hero||this.state?.companions.includes(hero);const alternative=face?`portrait-face-selected-${hero}`:`portrait-selected-${hero}`;return selected&&this.textures.exists(alternative)?alternative:face?`portrait-face-${hero}`:`portrait-${hero}`;}
  private updatePreview():void {if(!this.previewName)return;const hero=HEROES[this.focusIndex],key=this.portraitKey(hero);this.previewPortrait.setTexture(key);const source=this.textures.get(key).getSourceImage();const scale=Math.min(196/source.width,174/source.height);this.previewPortrait.setDisplaySize(source.width*scale,source.height*scale);this.previewName.setText(HERO_NAMES[hero]);this.description.setText(initialLoadout(hero).items.map(item=>WEAPONS[item.weaponId].name).join(' · '));}
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
    this.deploymentControls=this.add.text(12,40,'',{...this.style,fontSize:'11px',color:'#d2e2e8',lineSpacing:3,wordWrap:{width:216}});this.deploymentPanel.add(this.deploymentControls);
    this.deploymentBegin=this.add.container(12,80);this.deploymentPanel.add(this.deploymentBegin);this.button(this.deploymentBegin,0,0,132,'Auto-place',()=>this.game.events.emit('ui-deploy-auto'));this.button(this.deploymentBegin,0,40,132,'Begin battle',()=>this.game.events.emit('ui-launch'));
    this.bossPanel=this.add.container(320,40).setDepth(88).setVisible(false);
    this.bossPanel.add(this.add.rectangle(0,0,256,64,0x152c37,.9).setOrigin(0).setStrokeStyle(1,0xae8746));
    this.bossPortrait=this.add.image(27,30,'portrait-face-chrom').setDisplaySize(44,44);this.bossPanel.add(this.bossPortrait);
    this.bossName=this.add.text(54,6,'',{...this.style,fontSize:'16px',color:'#fff0c6'});this.bossPanel.add(this.bossName);
    this.bossPhase=this.add.text(54,44,'',{...this.style,fontSize:'12px',color:'#eacb9e'});this.bossPanel.add(this.bossPhase);
    this.bossHealth=this.add.graphics();this.bossPanel.add(this.bossHealth);
    this.miniTerrain=this.add.image(798,108,'battlefield').setDisplaySize(164,100).setTint(0x7c929b).setDepth(85);
    this.minimap=this.add.graphics().setDepth(86);this.miniTitle=this.add.text(722,42,'Battlefield',{...this.style,fontSize:'10px',color:'#fff0c6'}).setDepth(86);
  }
  private drawTacticalMap(data:TacticalMap):void {
    if(!this.state?.tactical)return;
    this.tacticalSnapshot=data;
    const controlledUnit=data.party.find(p=>p.hero===data.controlled),controlledItem=controlledUnit?.equippedWeaponId?WEAPONS[controlledUnit.equippedWeaponId]:undefined;this.touchControls.updateCommands({living:data.party.filter(p=>p.health>0).length,weaponIcon:controlledItem?.icon??'weapon-sword',weaponCount:controlledUnit?.weaponCount??1,staff:controlledItem?.type==='staff',rally:!!data.rally?.available,heal:(controlledUnit?.health??0)<(controlledUnit?.maxHealth??0)&&data.cooldown.fraction===1});
    const minimapHeight=!data.deploying&&this.touchUsed?Math.min(100,this.registry.get('touch-minimap-height')??100):100;
    const background=getMap(data.missionIndex??2).backgroundKey;if(this.textures.exists(background))this.miniTerrain.setTexture(background).setDisplaySize(164,minimapHeight).setY(58+minimapHeight/2);
    const canvasBounds=this.game.canvas.getBoundingClientRect();
    const cssScale=Math.max(.1,canvasBounds.width/WORLD.width);
    const combatFont=Math.max(17,Math.ceil(12/cssScale));
    const rowHeight=data.deploying?34:Math.max(32,combatFont+10);
    const rosterHeight=Math.max(1,data.party.length)*rowHeight+(data.deploying?14:8);
    const panelWidthVitality=data.deploying?192:146;
    const roadPlanning=data.deploying&&data.missionIndex===0;
    this.partyPanel.setPosition(roadPlanning?WORLD.width-216:0,roadPlanning?WORLD.height-48-rosterHeight:0);
    this.partyBackground.setSize(panelWidthVitality,rosterHeight).setPosition(12+panelWidthVitality/2,40+rosterHeight/2).setAlpha(data.deploying?.94:.72);
    this.damageControls.setPosition(roadPlanning?-260:0,rosterHeight-150-(roadPlanning?36:0)).setVisible(data.deploying);
    const rally=data.rally;
    this.rallyLabel.setPosition(16,rosterHeight+45).setVisible(!data.deploying&&!!rally&&data.party.filter(p=>p.health>0).length>1).setText(rally?.active?`Rallying · ${Math.ceil(rally.remaining)}s`:rally?.available?'Rally ready':`Rally · ${Math.ceil(rally?.cooldown??0)}s`).setColor(rally?.active?'#a8dcaa':rally?.available?'#fff0c6':'#acb7b9');
    this.partyHealth.clear();
    for(const [i,row] of this.partyRows.entries()){
      const unit=data.party[i],y=44+i*rowHeight;
      this.partyZones[i].setVisible(!!unit).setPosition(108,62+i*34);
      row.setVisible(!!unit).setPosition(data.deploying?60:52,data.deploying?48+i*34:y).setFontSize(data.deploying?10:combatFont);
      const head=this.partyHeads[i];head.setVisible(!!unit).setPosition(data.deploying?38:32,data.deploying?62+i*34:y+14);
      if(unit)head.setTexture(`portrait-face-${unit.hero}`).setDisplaySize(data.deploying?30:26,data.deploying?30:26).setAlpha(unit.health>0?1:.3);
      const item=unit?.equippedWeaponId?WEAPONS[unit.equippedWeaponId]:undefined;
      this.partyWeaponIcons[i].setVisible(data.deploying&&!!item);
      if(item)this.partyWeaponIcons[i].setTexture(item.icon).setAlpha(unit.health>0?1:.3);
      row.setText(unit?(data.deploying?`${data.selected===unit.hero?'▶ ':''}${HERO_NAMES[unit.hero]}  LV ${unit.level}\n${!unit.placed?'Not placed':`${unit.health<=0?'Fallen':`HP ${Math.max(0,unit.health)} / ${unit.maxHealth??unit.health}`} · XP ${unit.xp}`}`:unit.health<=0?'—':`${Math.max(0,Math.ceil(unit.health))}`):'').setAlpha(unit&&unit.health>0?1:.55);
      if(!unit)continue;
      const fraction=Phaser.Math.Clamp(unit.health/Math.max(1,unit.maxHealth??unit.health),0,1),color=unit.health<=0?0x53636c:fraction>.5?0x88c899:fraction>.25?0xe8be6c:0xe87969;
      if(data.deploying)this.partyHealth.fillStyle(0x0c2533).fillRect(59,76+i*34,131,5).fillStyle(color).fillRect(60,77+i*34,129*fraction,3);
      else{
        this.partyHealth.fillStyle(0x0c2533).fillRect(53,y+combatFont+1,95,5).fillStyle(color).fillRect(54,y+combatFont+2,93*fraction,3);
        const controlled=data.controlled===unit.hero;
        if(controlled||fraction<=.25)this.partyHealth.lineStyle(controlled?2:1,controlled?0xe8c57b:color).strokeRect(18,y,28,28);
        if(unit.health<=0)this.partyHealth.lineStyle(1,0x89949a).lineBetween(20,y+3,44,y+25);
      }
    }
    this.soldiersControl.setVisible(false);this.soldiersButton.setText(`Place soldiers · ${data.placed-data.party.filter(p=>p.placed).length}/${getMap(data.missionIndex??2).soldierCount}`);
    this.deploymentHeroes=data.party.map(p=>p.hero);this.selectedDeployment=data.selected;
    const keepPlanning=data.deploying&&data.missionIndex===3,panelWidth=keepPlanning?156:240;
    this.deploymentHint.setWordWrapWidth(panelWidth-24).setText(data.party.every(p=>p.placed)?'Army ready.':data.objective??'Choose deployment positions.');
    this.deploymentControls.setWordWrapWidth(panelWidth-24).setY(12+this.deploymentHint.height+10);
    this.deploymentBegin.setY(this.deploymentControls.y+this.deploymentControls.height+16);
    const panelHeight=this.deploymentBegin.y+68+12;
    this.deploymentBackground.setSize(panelWidth,panelHeight);
    this.deploymentPanel.setPosition(keepPlanning?728:12,WORLD.height-12-panelHeight);
    const boss=data.boss;this.bossPanel.setVisible(!data.deploying&&!!boss?.id);
    if(this.actionFeedback.visible)this.actionFeedback.setY(this.bossPanel.visible?110:44);
    this.notice.setY(this.bossPanel.visible?136:78);
    if(boss?.id){const key=`portrait-${boss.id}`;if(this.textures.exists(key))this.bossPortrait.setTexture(key).setDisplaySize(44,44);this.bossName.setText(`${boss.name??boss.id}  ${Math.max(0,Math.ceil(boss.health))}`).setWordWrapWidth(196);this.bossPhase.setText(boss.phase==='windup'?'Preparing attack':boss.phase==='recover'?'Opening':boss.enraged?'Dark magic intensifies':'Commander');this.bossHealth.clear().fillStyle(0x351c23).fillRect(54,29,192,8).fillStyle(0xd47870).fillRect(55,30,190*Phaser.Math.Clamp(boss.health/Math.max(1,boss.maxHealth),0,1),6);}
    this.miniTitle.setText(data.title??'Battlefield');
    if(!data.deploying)this.stats.setText(data.objectiveStatus??data.objective??'Complete the objective');
    // Gold is spent in preparations; combat uses brief pickup feedback only.
    this.goldCounter.setVisible(false);this.goldValue.setText(`${data.gold??0}`);this.cooldownBar.clear();this.cooldownText.setVisible(!data.deploying);if(!data.deploying){const cooldownY=525,cooldownX=this.touchUsed?300:330,cooldownWidth=this.touchUsed?180:280;this.cooldownText.setPosition(cooldownX+cooldownWidth/2,cooldownY-11);this.cooldownBar.fillStyle(0x183e57).fillRect(cooldownX,cooldownY,cooldownWidth,10).fillStyle(data.cooldown.recovering?0xe7a55d:data.cooldown.fraction===1?0x85cda1:0x86baff).fillRect(cooldownX+2,cooldownY+2,(cooldownWidth-4)*data.cooldown.fraction,6);this.cooldownText.setText(`${data.cooldown.recovering?'Recovering':data.cooldown.fraction===1?'Attack ready':'Recharging'}${data.cooldown.remaining>0?` · ${data.cooldown.remaining.toFixed(1)}s`:''}${data.camp?` · Camp ${Math.max(0,data.camp.health)}`:''}`);}
    const g=this.minimap;g.clear().fillStyle(0x152c37,.96).fillRect(712,38,172,20).lineStyle(1,0xae8746).strokeRect(716,58,164,minimapHeight);
    const sx=164/data.width,sy=minimapHeight/data.height;
    for(const p of data.enemies)g.fillStyle(0xeb5555).fillCircle(716+p.x*sx,58+p.y*sy,2);
    for(const p of data.allies)g.fillStyle(0x77bfff).fillCircle(716+p.x*sx,58+p.y*sy,2);
    if(data.goal){const x=716+data.goal.x*sx,y=58+data.goal.y*sy;g.lineStyle(1,0xffdd75).lineBetween(x-2,y-4,x-2,y+5).fillStyle(0xffdd75).fillTriangle(x-1,y-4,x+5,y-2,x-1,y);}
    const controlled=data.controlledPosition;if(controlled)g.lineStyle(1,0xffedb2).strokeCircle(716+controlled.x*sx,58+controlled.y*sy,4);
    g.lineStyle(1,0xe6d19a,.65).strokeRect(716+data.camera.x*sx,58+data.camera.y*sy,Math.min(164,data.camera.width*sx),Math.min(minimapHeight,data.camera.height*sy));
  }
  private drawFocus():void {const tile=this.heroTiles[this.focusIndex];if(!tile)return;this.focusFrame.clear().lineStyle(2,0xe7c878).strokeRect(tile.x-2,tile.y-2,100*tile.scaleX+4,76*tile.scaleY+4);this.updatePreview();this.registry.set('character-focus',HEROES[this.focusIndex]);}
  private navigate(event:KeyboardEvent):void {
    if(this.controlPanel?.visible){this.navigateControls(event);return;}
    if(this.state?.settingsOpen&&event.code==='KeyC'&&!event.repeat){this.openControls();event.preventDefault();return;}
    if(!this.state||this.state.settingsOpen||this.state.result)return;
    if(event.target instanceof HTMLElement&&event.target.closest('button,input,select,textarea,dialog'))return;
    const key=event.key.toLowerCase();
    if(this.state.paused&&this.partyInfoOpen){if(['escape','enter',' '].includes(key)&&!event.repeat){this.partyInfoOpen=false;this.apply(this.state);event.preventDefault();event.stopImmediatePropagation();}return;}
    if(this.state.paused){if(['w','a','arrowup','arrowleft','s','d','arrowdown','arrowright'].includes(key)){this.pauseFocus=(this.pauseFocus+(['w','a','arrowup','arrowleft'].includes(key)?-1:1)+this.pauseActions.length)%this.pauseActions.length;this.game.events.emit('ux-feedback',{kind:'cursor'});this.updatePauseFocus();}else if((key==='enter'||key===' ')&&!event.repeat)this.pauseActions[this.pauseFocus]?.();else return;event.preventDefault();event.stopImmediatePropagation();return;}
    if(this.state.phase==='battle'){if(event.code===keyFor('weapon')&&!event.repeat&&!this.state.paused){this.game.events.emit('ui-switch-weapon');event.preventDefault();}return;}
    if(this.state.phase==='deployment'){
      if(['q','e'].includes(key)){const i=this.deploymentHeroes.indexOf(this.selectedDeployment as Hero);this.game.events.emit('ui-deploy-hero',this.deploymentHeroes[(i+(key==='q'?-1:1)+this.deploymentHeroes.length)%this.deploymentHeroes.length]);}
      else if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(key)){this.game.events.emit('ui-deploy-move',['a','arrowleft'].includes(key)?-32:['d','arrowright'].includes(key)?32:0,['w','arrowup'].includes(key)?-32:['s','arrowdown'].includes(key)?32:0);}
      else if(key===' '&&!event.repeat)this.game.events.emit('ui-deploy-confirm');
      else if(key==='enter'&&!event.repeat)this.game.events.emit('ui-deploy-auto');
      else if(key==='r')this.game.events.emit('ui-launch');else return;
    }else {
      const move=({w:-this.rosterColumns,arrowup:-this.rosterColumns,s:this.rosterColumns,arrowdown:this.rosterColumns,a:-1,arrowleft:-1,d:1,arrowright:1} as Record<string,number>)[key];
      if(move!==undefined){this.partyActionFocus=false;this.begin.setColor('#44351e');this.focusIndex=(this.focusIndex+move+HEROES.length)%HEROES.length;this.layoutParty();this.game.events.emit('ux-feedback',{kind:'cursor'});}
      else if(key==='tab'){this.partyActionFocus=!this.partyActionFocus;this.begin.setColor(this.partyActionFocus?'#153e66':'#44351e');this.game.events.emit('ux-feedback',{kind:'cursor'});}
      else if((key==='enter'||key===' ')&&!event.repeat){if(this.partyActionFocus)this.beginStory();else this.game.events.emit('ui-character',HEROES[this.focusIndex]);}
      else if(key==='escape'||key==='backspace'){this.emptyConfirmation=false;this.request('leader-mode');}
      else if(key==='r'&&!event.repeat)this.beginStory();else return;
    }
    event.preventDefault();
  }
  private createControls():void {
    this.controlPanel=this.panel(600,500,'Battle controls & accessibility').setDepth(240).setVisible(false);
    const actions=Object.keys(DEFAULT_BINDINGS) as ControlAction[];
    actions.forEach((action,i)=>{const col=i<6?0:1,row=i%6,x=-276+col*280,y=-204+row*48;this.controlRows.push(this.button(this.controlPanel,x,y,264,'',()=>{this.controlFocus=i;this.captureControl(action);}));});
    this.controlRows.push(this.button(this.controlPanel,-276,98,552,'',()=>{this.controlPrefs.reducedMotion=!this.controlPrefs.reducedMotion;this.persistControls();}));
    this.controlRows.push(this.button(this.controlPanel,-276,142,264,'Reset defaults',()=>{this.controlPrefs={bindings:{...DEFAULT_BINDINGS},reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches};this.persistControls();}));
    this.controlRows.push(this.button(this.controlPanel,12,142,264,'Back',()=>this.closeControls()));
    this.controlMessage=this.add.text(0,186,'Battle bindings only. Menus and deployment retain default keys.\nChoose an action, then press a key. Escape cancels.',{...this.style,fontSize:'12px',align:'center',wordWrap:{width:540}}).setOrigin(.5,0);this.controlPanel.add(this.controlMessage);this.renderControls();
  }
  private openControls():void {this.controlFocus=0;this.capturing=undefined;this.registry.set('controls-open',true);this.game.events.emit('controls-open',true);this.controlPanel.setVisible(true);this.renderControls();}
  private closeControls():void {this.capturing=undefined;this.registry.set('controls-open',false);this.registry.set('controls-capture',false);this.game.events.emit('controls-open',false);this.controlPanel.setVisible(false);}
  private captureControl(action:ControlAction):void {this.capturing=action;this.registry.set('controls-capture',true);this.controlMessage.setText(`Press a new key for ${CONTROL_LABELS[action]}. Escape cancels.`);this.renderControls();}
  private refreshPauseBindings():void {const labels=[`${keyLabel(keyFor('up'))}${keyLabel(keyFor('left'))}${keyLabel(keyFor('down'))}${keyLabel(keyFor('right'))} / Arrows`,'Mouse',`${keyLabel(keyFor('attack'))} / Left click`,`${keyLabel(keyFor('previous'))} / ${keyLabel(keyFor('next'))}`,keyLabel(keyFor('weapon')),'I / Info',keyLabel(keyFor('rally')),keyLabel(keyFor('pause'))];this.pauseKeyLabels.forEach((text,i)=>text.setText(labels[i]));this.pauseGuardText?.setText(`${keyLabel(keyFor('guard'))} / right mouse: Guard frontal physical attacks.\nStaff: ${keyLabel(keyFor('attack'))} heals allies · ${keyLabel(keyFor('selfHeal'))} + ${keyLabel(keyFor('attack'))} heals yourself.\nCompanions with staves automatically help nearby allies in danger.`);}
  private persistControls():void {saveControlPreferences(this.controlPrefs);this.game.events.emit('controls-changed');this.refreshPauseBindings();this.renderControls();}
  private renderControls():void {const actions=Object.keys(DEFAULT_BINDINGS) as ControlAction[];actions.forEach((a,i)=>this.controlRows[i].setText(`${CONTROL_LABELS[a]} · ${this.capturing===a?'…':keyLabel(this.controlPrefs.bindings[a])}`));this.controlRows[12]?.setText(`Reduced motion · ${this.controlPrefs.reducedMotion?'On':'Off'}`);this.controlRows.forEach((row,i)=>row.setColor(i===this.controlFocus?'#153e66':'#44351e').setBackgroundColor(i===this.controlFocus?'#fff2cd':'#00000000'));}
  private navigateControls(event:KeyboardEvent):void {
    event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
    if(this.capturing){if(event.code==='Escape'){this.capturing=undefined;this.registry.set('controls-capture',false);this.controlMessage.setText('Change canceled.');this.renderControls();return;}const action=this.capturing;if(!validBinding(event.code)){this.controlMessage.setText('Use a letter, number, Space, Shift or Control. I and navigation keys are reserved.');return;}const conflict=(Object.keys(DEFAULT_BINDINGS) as ControlAction[]).find(a=>a!==action&&this.controlPrefs.bindings[a]===event.code);if(conflict){this.controlMessage.setText(`${keyLabel(event.code)} is already assigned to ${CONTROL_LABELS[conflict]}.`);return;}this.controlPrefs.bindings[action]=event.code;this.capturing=undefined;this.registry.set('controls-capture',false);this.controlMessage.setText('Saved. Arrow keys still move and navigate menus.');this.persistControls();return;}
    if(event.code==='Escape'){this.closeControls();return;}if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Tab'].includes(event.code)){this.controlFocus=(this.controlFocus+(['ArrowUp','ArrowLeft'].includes(event.code)?-1:1)+this.controlRows.length)%this.controlRows.length;this.renderControls();return;}
    if(event.code==='Enter'||event.code==='Space'){const actions=Object.keys(DEFAULT_BINDINGS) as ControlAction[];if(this.controlFocus<12)this.captureControl(actions[this.controlFocus]);else if(this.controlFocus===12){this.controlPrefs.reducedMotion=!this.controlPrefs.reducedMotion;this.persistControls();}else if(this.controlFocus===13){this.controlPrefs={bindings:{...DEFAULT_BINDINGS},reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches};this.persistControls();}else this.closeControls();}
  }
  private showPartyInfo():void {
    this.partyInfoOpen=true;
    const scale=Math.max(.1,this.game.canvas.getBoundingClientRect().width/WORLD.width),font=Math.max(18,Math.ceil(12/scale));
    this.partyInfoRows.forEach((row,i)=>{const unit=this.tacticalSnapshot?.party[i],item=unit?.equippedWeaponId?WEAPONS[unit.equippedWeaponId]:undefined;row.setVisible(!!unit).setFontSize(font).setText(unit?`${unit.hero===this.tacticalSnapshot?.controlled?'▶ ':''}${HERO_NAMES[unit.hero]} · LV ${unit.level} · XP ${unit.xp}\n${unit.health<=0?'Fallen':`HP ${Math.ceil(unit.health)} / ${unit.maxHealth??unit.health}`} · ${item?.name??'Equipment'}`:'');});
    this.apply(this.state);
  }
  private updatePauseFocus():void {this.pauseChoices.forEach((choice,i)=>choice.setColor(i===this.pauseFocus?'#153e66':'#44351e').setBackgroundColor(i===this.pauseFocus?'#fff2cd':'#00000000'));}
  private request(id:string):void { this.game.events.emit('ui-action',id); }
  private button(parent:Phaser.GameObjects.Container,x:number,y:number,width:number,label:string,action:()=>void,feedback=true):Phaser.GameObjects.Text {
    const frame = this.add.nineslice(x,y,'ui-parchment',undefined,width,28,8,8,8,8).setOrigin(0).setInteractive({useHandCursor:true});
    const text = this.add.text(x+width/2,y+14,label,this.style).setOrigin(.5);
    frame.on('pointerdown',()=>{if(feedback)this.game.events.emit('ux-feedback',{kind:'confirm'});frame.setTint(0xe1c187);action();}); frame.on('pointerup',()=>frame.clearTint()); frame.on('pointerout',()=>frame.clearTint());
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
    if(!state)return;this.touchControls.setEnabled(this.touchUsed&&state.phase==='battle'&&state.playing&&!state.paused&&!state.settingsOpen);if(state.paused&&!this.state?.paused)this.pauseFocus=0;this.state=state;this.updatePauseFocus();if(state.phase!=='battle'||state.result)this.warning.setText('');
    if(!state.playing){this.goldCounter.setVisible(false);this.cooldownBar.clear();this.cooldownText.setVisible(false);}
    this.menu.setVisible(!state.playing && !state.result && !state.settingsOpen);
    if(state.phase==='party')this.stats.setText(state.selectionMode==='player'?'Choose your party leader':'Select Companions');
    this.selectionTitle.setText(state.selectionMode === 'player' ? 'Choose your party leader' : 'Select Companions');
    this.selectionSummary.setText(state.selectionMode==='player'?'1 · Leader   →   2 · Companions   →   Story':`Leader: ${HERO_NAMES[state.hero]}   ·   ${state.companions.length}/3 companions`);
    this.backControl.setVisible(state.selectionMode==='companions');
    if(state.tactical && state.phase==='deployment')this.stats.setText('Deployment · Four known camps · Place your party');
    this.begin.setText(state.selectionMode==='player'?'Choose leader':state.preparationEditing?'Return to preparations':'Begin Story');this.legend.setText(this.emptyConfirmation?state.preparationEditing?'Travel alone? Press Return to preparations again to confirm.':'Travel alone? Press Begin Story again to confirm.':'');
    const tacticalVisible=state.tactical&&state.playing&&!state.result;this.partyPanel.setVisible(tacticalVisible);if(!tacticalVisible)this.bossPanel.setVisible(false);this.deploymentPanel.setVisible(tacticalVisible&&state.phase==='deployment');this.minimap.setVisible(tacticalVisible);this.miniTerrain.setVisible(tacticalVisible);this.miniTitle.setVisible(tacticalVisible);
    this.instructions.setText(state.tactical?'WASD: Move · Space / Click: Attack · Mouse: Aim\nQ/E: Hero · F: Weapon · R: Rally · I: Info · P: Pause':'WASD / Arrows: Move   Space / Click: Attack\nMouse: Aim   Q: Ally orders   P: Pause');
    this.updateResume();this.updatePreview();
    this.partyTray.removeAll(true);
    [state.hero,...state.companions].forEach((hero,i)=>{const x=i*142;this.partyTray.add(this.add.rectangle(x,0,134,58,0x203e4d).setOrigin(0).setStrokeStyle(1,0x49616a));this.partyTray.add(this.add.image(x+25,28,`portrait-face-${hero}`).setDisplaySize(42,42));this.partyTray.add(this.add.text(x+51,10,i===0?'Leader':`${i}`,{...this.style,color:'#9ad2ee',fontSize:'13px'}));this.partyTray.add(this.add.text(x+51,30,HERO_NAMES[hero],{...this.style,color:'#f3e7c9',fontSize:'12px'}));});
    for(let i=state.companions.length+1;i<4;i++)this.partyTray.add(this.add.text(i*142+18,20,`+ Companion ${i}`,{...this.style,color:'#819aa5',fontSize:'13px'}));
    this.begin.setAlpha(state.ready ? 1 : .5);
    for(const [hero,card] of this.cards){
      const portrait=this.heroTiles[HEROES.indexOf(hero)].list.find(child=>child.getData('hero-portrait')) as Phaser.GameObjects.Image;portrait.setTexture(this.portraitKey(hero,true));
      const unavailable=state.selectionMode==='companions'&&hero===state.hero;
      this.heroTiles[HEROES.indexOf(hero)].setAlpha(unavailable?.52:1).setData('leader-unavailable',unavailable);
      card.setFillStyle(0x203e4d).setAlpha(1);this.selectionMarks.get(hero)?.setText(hero===state.hero?'★':state.companions.includes(hero)?`${state.companions.indexOf(hero)+1}`:'');
      if(hero===state.hero)card.setFillStyle(0x344c59);
      else if(state.companions.includes(hero))card.setFillStyle(0x315b70);
    }
    const inBattle = state.playing || Boolean(state.result);
    this.headerUtilities.setVisible(!inBattle || state.phase==='deployment');this.menuButton.setVisible(inBattle); this.pauseButton.setVisible(state.playing && state.phase!=='deployment');
    this.notice.setVisible(inBattle && state.phase!=='deployment' && Boolean(this.notice.text)); this.instructions.setVisible(false);
    this.pauseText.setText(this.touchUsed?(state.paused?'▶':'Ⅱ'):(state.paused?'Resume':'Pause')).setAlpha(state.playing?1:.5);
    this.settings.setVisible(state.settingsOpen);
    if(!state.paused)this.partyInfoOpen=false;
    this.pauseOverlay.setVisible(state.playing&&state.paused&&!state.settingsOpen&&!this.partyInfoOpen);
    this.partyInfo.setVisible(state.playing&&state.paused&&!state.settingsOpen&&this.partyInfoOpen);
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

interface TacticalMap {goal?:{x:number;y:number};rally?:{active:boolean;remaining:number;cooldown:number;available:boolean};missionIndex?:number;title?:string;objective?:string;objectiveStatus?:string;totalWaves?:number;gold?:number;camp?:{health:number;maxHealth:number};cooldown:{fraction:number;remaining:number;recovering:boolean};stagePhase:string;wave:number;remaining:number;elapsed:number;pending:number;boss?:{id?:CommanderId;name?:string;title?:string;phase?:string;enraged?:boolean;health:number;maxHealth:number};width:number;height:number;deploying:boolean;controlled:Hero;controlledPosition?:{x:number;y:number};selected:string;placed:number;total:number;party:{hero:Hero;placed:boolean;health:number;maxHealth?:number;level:number;xp:number;equippedWeaponId?:string;weaponCount?:number}[];allies:{x:number;y:number}[];enemies:{x:number;y:number}[];camera:{x:number;y:number;width:number;height:number};}
