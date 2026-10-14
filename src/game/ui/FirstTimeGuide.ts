import Phaser from 'phaser';
import {keyFor,keyLabel} from '../input/control-preferences';
export const FIRST_TIME_GUIDE_KEY='feadventures:first-time-controls:v1';
let remembered=false;
export function needsFirstTimeGuide():boolean{try{return !remembered&&!localStorage.getItem(FIRST_TIME_GUIDE_KEY);}catch{return !remembered;}}
export function rememberGuide(status:'completed'|'skipped'):void{remembered=true;try{localStorage.setItem(FIRST_TIME_GUIDE_KEY,JSON.stringify({status}));}catch{}}
type Target='move'|'attack'|number[];
interface Step{title:string;copy:string;target:Target}
interface Layout{joystick:{x:number;y:number};radius:number;attack:{x:number;y:number;radius:number};actions:{x:number;y:number;size:number}[]}
export class FirstTimeGuide{
 readonly root:Phaser.GameObjects.Container;
 private card:Phaser.GameObjects.Container;private frame:Phaser.GameObjects.NineSlice;private outline:Phaser.GameObjects.Graphics;
 private targetIcon:Phaser.GameObjects.Text;
 private count:Phaser.GameObjects.Text;private title:Phaser.GameObjects.Text;private copy:Phaser.GameObjects.Text;private hint:Phaser.GameObjects.Text;
 private buttons:Phaser.GameObjects.Container[]=[];private steps:Step[]=[];private index=0;private first=false;private touch=false;private done?:()=>void;
 constructor(private scene:Phaser.Scene,private preview:(show:boolean,touch?:boolean)=>void){
 const style={fontFamily:'FE',fontSize:'16px',color:'#34281c',resolution:3};
 this.root=scene.add.container().setDepth(10000).setVisible(false);this.root.add(scene.add.rectangle(448,272,896,544,0x071722,.76).setInteractive());
 this.outline=scene.add.graphics();this.root.add(this.outline);this.targetIcon=scene.add.text(0,0,'',{fontSize:'30px',color:'#fff0ca',resolution:3}).setOrigin(.5).setVisible(false);this.root.add(this.targetIcon);this.card=scene.add.container();this.root.add(this.card);
 this.frame=scene.add.nineslice(0,0,'ui-parchment',undefined,390,250,18,18,18,18).setOrigin(0);this.card.add(this.frame);
 this.count=scene.add.text(20,16,'',style);this.title=scene.add.text(20,42,'',style);this.copy=scene.add.text(20,80,'',{...style,wordWrap:{width:350}});this.hint=scene.add.text(20,150,'',{...style,wordWrap:{width:350}});this.card.add([this.count,this.title,this.copy,this.hint]);
 ['Skip & begin','Back','Next'].forEach((label,i)=>{const box=scene.add.nineslice(0,0,'ui-parchment',undefined,110,44,8,8,8,8).setOrigin(0).setInteractive();const text=scene.add.text(55,22,label,{...style,align:'center',wordWrap:{width:100}}).setOrigin(.5);const b=scene.add.container(20+i*120,190,[box,text]);this.card.add(b);this.buttons.push(b);box.on('pointerup',()=>{if(!this.root.visible)return;scene.game.events.emit('ux-feedback',{kind:'confirm'});if(i===0)this.close('skipped');else if(i===1){this.index--;this.render();}else this.next();});});
 const key=(e:KeyboardEvent)=>{if(!this.root.visible||this.scene.registry.get('landscape-required'))return;e.preventDefault();e.stopImmediatePropagation();if(e.type==='keyup'&&!e.repeat){if(['Enter','Space','Escape','ArrowLeft'].includes(e.code))scene.game.events.emit('ux-feedback',{kind:e.code==='ArrowLeft'?'cursor':'confirm'});if(e.code==='Enter'||e.code==='Space')this.next();else if(e.code==='Escape')this.close('skipped');else if(e.code==='ArrowLeft'&&this.index>0){this.index--;this.render();}}};window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);const resize=()=>{if(this.root.visible)this.render();};scene.scale.on('resize',resize);
 scene.events.once('shutdown',()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);scene.scale.off('resize',resize);this.preview(false);scene.registry.set('first-time-guide-open',false);});
 }
 get visible():boolean{return this.root.visible;}
 open(o:{first:boolean;touch:boolean;party:number;weapons:number;staff:boolean},done:()=>void):void{
 this.first=o.first;this.touch=o.touch;this.done=done;this.index=0;const k=(a:Parameters<typeof keyFor>[0])=>keyLabel(keyFor(a));
 const step=(title:string,mobile:string,desktop:string,target:Target):Step=>({title,copy:o.touch?mobile:desktop,target});
 this.steps=[step('Move','Drag the left stick to move.',`${k('up')}${k('left')}${k('down')}${k('right')} / Arrows: move.`,'move'),step('Aim & attack','Hold and drag the right stick toward your target to attack.',`Aim with the mouse, including swords. ${k('attack')} or left-click attacks.`,'attack')];
 if(o.party>1)this.steps.push(step('Switch hero','Tap either arrow to control the previous or next living party member.',`${k('previous')} / ${k('next')}: previous or next living party member.`,[0,1]));
 if(o.weapons>1)this.steps.push(step('Switch weapon','Tap your weapon icon to cycle this character’s equipped weapons.',`${k('weapon')}: cycle equipped weapons.`,[2]));
 if(o.party>1)this.steps.push(step('Call for help','Tap the flag to rally companions for 10 seconds. Rally must recharge.',`${k('rally')}: rally companions for 10 seconds. Rally must recharge.`,[3]));
 this.steps.push(step('Guard','Hold the shield to block frontal physical attacks. Guard uses stamina.',`Hold ${k('guard')} or right mouse to block frontal physical attacks. Guard uses stamina.`,[5]));
 if(o.staff)this.steps.push(step('Heal with a staff','Tap + to heal yourself. Hold and drag the right stick toward an ally to heal them.',`${k('selfHeal')} + ${k('attack')}: heal yourself. ${k('attack')}: heal an ally.`,[4]));
 this.root.setVisible(true);this.scene.registry.set('first-time-guide-open',true);this.preview(true,o.touch);this.render();
 }
 private next():void{if(this.index<this.steps.length-1){this.index++;this.render();}else this.close('completed');}
 private close(status:'completed'|'skipped'):void{if(!this.root.visible)return;if(this.first)rememberGuide(status);this.root.setVisible(false);this.scene.registry.set('first-time-guide-open',false);this.preview(false);this.scene.input.keyboard?.resetKeys();this.scene.game.events.emit('touch-move',{x:0,y:0});this.scene.game.events.emit('touch-aim',undefined);this.scene.game.events.emit('touch-action','guard-end');const done=this.done;this.done=undefined;done?.();}
 private render():void{
 const scale=Math.max(.1,this.scene.game.canvas.getBoundingClientRect().width/896),font=Math.ceil(12/scale),height=Math.max(44,44/scale),step=this.steps[this.index];this.count.setText(`Battle paused · ${this.index+1} / ${this.steps.length}`).setFontSize(font);this.title.setText(step.title).setFontSize(Math.max(22,font+5));this.copy.setText(step.copy).setFontSize(Math.max(16,font));this.hint.setText(this.first?'Shown once. Replay from Settings → Controls.':'Replay guide · battle remains paused.').setFontSize(font);
 const l=this.scene.registry.get('touch-control-layout') as Layout|undefined;
 const targetRight=this.touch&&step.target!=='move';
 const leftEdge=!l?896:step.target==='attack'?l.attack.x-l.attack.radius*1.2-7:step.target==='move'?896:Math.min(...step.target.map(i=>l.actions[i].x-l.actions[i].size/2-4));
 // Right-side target outlines need the entire left arrow visible, not just its center.
 this.card.setPosition(this.touch?(targetRight?Math.max(16,Math.min(120,leftEdge-406)):290):253,100);this.hint.setY(this.copy.y+this.copy.height+12);const by=this.hint.y+this.hint.height+12;this.frame.setSize(390,by+height+16);this.buttons.forEach((b,i)=>{b.setY(by);const frame=b.list[0] as Phaser.GameObjects.NineSlice;frame.setSize(110,height);(frame.input!.hitArea as Phaser.Geom.Rectangle).setTo(0,0,110,height);(b.list[1] as Phaser.GameObjects.Text).setY(height/2).setFontSize(font);});this.buttons[1].setVisible(this.index>0);(this.buttons[0].list[1] as Phaser.GameObjects.Text).setText(this.first?'Skip':'Close guide');(this.buttons[2].list[1] as Phaser.GameObjects.Text).setText(this.index===this.steps.length-1?(this.first?'Begin battle':'Done'):'Next →');
 this.outline.clear();this.targetIcon.setVisible(false);if(!this.touch||!l)return;this.outline.lineStyle(4,0xffe596,1);if(step.target==='move')this.outline.strokeCircle(l.joystick.x,l.joystick.y,l.radius+7);else if(step.target==='attack')this.outline.strokeCircle(l.attack.x,l.attack.y,l.attack.radius*1.2+7);else for(const i of step.target){const b=l.actions[i];if(b){this.outline.strokeRoundedRect(b.x-b.size/2-4,b.y-b.size/2-4,b.size+8,b.size+8,5);if(i===4||i===5)this.targetIcon.setText(i===4?'+':'⛨').setPosition(b.x,b.y).setFontSize(Math.max(30,font+8)).setVisible(true);}}
 }
}
