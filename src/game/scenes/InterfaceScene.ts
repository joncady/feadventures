import Phaser from 'phaser';
import { WORLD } from '../data/config';
import type { Hud } from './ArenaScene';

export interface InterfaceState {
  ready: boolean;
  playing: boolean;
  paused: boolean;
  muted: boolean;
  settingsOpen: boolean;
  result: string;
  audio: { music: number; effects: number; voices: number; characterVoices: boolean; spellEffect: string };
}
export class InterfaceScene extends Phaser.Scene {
  private state!: InterfaceState;
  private menuButton!: Phaser.GameObjects.Container;
  private pauseButton!: Phaser.GameObjects.Container;
  private instructions!: Phaser.GameObjects.Text;
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
  private readonly style = { fontFamily: 'FE', fontSize: '13px', color: '#44351e' };
  constructor() { super('Interface'); }
  create(): void {
    this.add.rectangle(WORLD.width/2, 17, WORLD.width, 34, 0x183e57, .94);
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
    this.notice = this.add.text(12, WORLD.height-58, '', { ...this.style, color:'#fff1c7', fontSize:'11px', backgroundColor:'#183e57', wordWrap:{width:610} });
    this.instructions = this.add.text(12, WORLD.height-30, 'WASD / Arrows: Move   Space / Click: Attack\nMouse: Aim   Q: Ally orders   P: Pause', { ...this.style, fontSize:'10px', color:'#fff1c7', backgroundColor:'#183e57' });
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
    this.pauseOverlay = this.panel(300, 160, 'Paused');
    this.button(this.pauseOverlay, -128, -17, 256, 'Resume', () => this.request('pause'));
    this.button(this.pauseOverlay, -128, 24, 256, 'Main menu', () => this.request('main-menu'));
    this.endOverlay = this.panel(340, 208, 'The battle is over');
    this.resultText = this.add.text(0,-43,'',{...this.style,align:'center',wordWrap:{width:290}}).setOrigin(.5,0); this.endOverlay.add(this.resultText);
    this.button(this.endOverlay, -148, 19, 296, 'Try again', () => this.request('restart'));
    this.button(this.endOverlay, -148, 58, 296, 'Choose hero', () => this.request('choose'));
    const onState = (state:InterfaceState) => this.apply(state);
    const onNotice = (text:string) => this.notice.setText(text);
    const onHud = (hud:Hud) => this.stats.setText(`Wave ${hud.wave}  ·  Defeated ${hud.kills}  ·  Allies ${hud.allies}/2`);
    this.game.events.on('ui-state',onState); this.game.events.on('ui-notice',onNotice); this.game.events.on('hud',onHud);
    this.events.once('shutdown',()=>{this.game.events.off('ui-state',onState);this.game.events.off('ui-notice',onNotice);this.game.events.off('hud',onHud);});
    this.apply(this.registry.get('interface-state'));
    this.notice.setText(this.registry.get('interface-notice') ?? '');
  }
  private request(id:string):void { this.game.events.emit('ui-action',id); }
  private button(parent:Phaser.GameObjects.Container,x:number,y:number,width:number,label:string,action:()=>void):Phaser.GameObjects.Text {
    const frame = this.add.nineslice(x,y,'ui-parchment',undefined,width,28,8,8,8,8).setOrigin(0).setInteractive({useHandCursor:true});
    const text = this.add.text(x+width/2,y+14,label,this.style).setOrigin(.5);
    frame.on('pointerdown',()=>{frame.setTint(0xe1c187);action();}); frame.on('pointerup',()=>frame.clearTint()); frame.on('pointerout',()=>frame.clearTint());
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
    if(!state)return;this.state=state;
    const inBattle = state.playing || Boolean(state.result);
    this.menuButton.setVisible(inBattle); this.pauseButton.setVisible(state.playing);
    this.notice.setVisible(inBattle); this.instructions.setVisible(inBattle);
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
