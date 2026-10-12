import Phaser from 'phaser';

/** Native overlay: movement and guard each retain their own pointer. */
export class TouchControls {
  readonly root:Phaser.GameObjects.Container;
  private owner:number|undefined;
  private guardOwner:number|undefined;
  private attackOwner:number|undefined;
  private attackCenter={x:820,y:320};
  private attackBase:Phaser.GameObjects.Arc;
  private attackKnob:Phaser.GameObjects.Arc;
  private attackDirection:Phaser.GameObjects.Graphics;
  private enabled=false;
  private center={x:76,y:450};
  private radius=40;
  private attackRadius=36;
  private base:Phaser.GameObjects.Arc;
  private knob:Phaser.GameObjects.Arc;
  private actions:Phaser.GameObjects.Container[]=[];
  constructor(private scene:Phaser.Scene){
    this.root=scene.add.container().setDepth(1000).setVisible(false);
    this.base=scene.add.circle(0,0,48,0x183e57,.42).setStrokeStyle(2,0xd3c291,.65).setInteractive(new Phaser.Geom.Circle(48,48,48),Phaser.Geom.Circle.Contains);
    this.knob=scene.add.circle(0,0,20,0xd3c291,.65);this.root.add([this.base,this.knob]);
    this.base.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(!this.enabled||this.owner!==undefined)return;this.owner=p.id;this.move(p);});
    this.attackBase=scene.add.circle(0,0,48,0x183e57,.42).setStrokeStyle(2,0xd3c291,.8).setInteractive(new Phaser.Geom.Circle(48,48,48),Phaser.Geom.Circle.Contains);
    this.attackKnob=scene.add.circle(0,0,18,0xe7a55d,.8);
    this.attackDirection=scene.add.graphics();this.root.add(this.attackDirection);
    const attackIcon=scene.add.text(0,0,'⌖',{fontSize:'30px',color:'#f3e7c9'}).setOrigin(.5);this.root.add([this.attackBase,this.attackKnob,attackIcon]);this.attackBase.setData('icon',attackIcon);
    this.attackBase.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(!this.enabled||this.attackOwner!==undefined)return;this.attackOwner=p.id;this.aim(p);});
    const move=(p:Phaser.Input.Pointer)=>{if(p.id===this.owner)this.move(p);if(p.id===this.attackOwner)this.aim(p);};
    const up=(p:Phaser.Input.Pointer)=>{if(p.id===this.owner){this.owner=undefined;this.knob.setPosition(this.center.x,this.center.y);scene.game.events.emit('touch-move',{x:0,y:0});}if(p.id===this.attackOwner){this.attackOwner=undefined;this.attackDirection.clear();this.attackKnob.setPosition(this.attackCenter.x,this.attackCenter.y);scene.game.events.emit('touch-aim',undefined);}if(p.id===this.guardOwner){this.guardOwner=undefined;scene.game.events.emit('touch-action','guard-end');}};
    scene.input.on('pointermove',move);scene.input.on('pointerup',up);scene.input.on('pointerupoutside',up);
    const out=()=>{if([this.owner,this.attackOwner,this.guardOwner].some(id=>id!==undefined&&!scene.input.manager.pointers[id]?.isDown))this.reset();};scene.input.on('gameout',out);
    const blur=()=>this.reset();window.addEventListener('blur',blur);scene.game.events.on('orientation-blocked',blur);
    const cancel=()=>this.reset();scene.game.canvas.addEventListener('touchcancel',cancel);
    ['‹','›','↻','⚑','+','◇','Ⅱ'].forEach((label,i)=>{const action=['previous','next','weapon','rally','self-heal','guard-start','pause'][i];const box=scene.add.rectangle(0,0,48,48,0x183e57,.85).setStrokeStyle(1,0xd3c291,.7).setInteractive();const text=scene.add.text(0,0,label,{fontFamily:'serif',fontSize:'28px',color:'#f3e7c9'}).setOrigin(.5);const button=scene.add.container(0,0,[box,text]);this.root.add(button);this.actions.push(button);box.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(!this.enabled)return;if(action==='guard-start'){if(this.guardOwner!==undefined)return;this.guardOwner=p.id;}if(action==='pause')scene.game.events.emit('ui-action','pause');else scene.game.events.emit('touch-action',action);});});
    const resize=()=>this.layout();scene.scale.on('resize',resize);this.layout();
    scene.events.once('shutdown',()=>{this.reset();scene.scale.off('resize',resize);scene.input.off('gameout',out);scene.input.off('pointermove',move);scene.input.off('pointerup',up);scene.input.off('pointerupoutside',up);window.removeEventListener('blur',blur);scene.game.events.off('orientation-blocked',blur);scene.game.canvas.removeEventListener('touchcancel',cancel);});
  }
  setEnabled(value:boolean):void {this.enabled=value;this.scene.registry.set('touch-overlay-active',value);this.root.setVisible(value);if(value)this.layout();else this.reset();}
  private layout():void {
    const width=this.scene.game.canvas.getBoundingClientRect().width||896;
    const target=Math.max(48,44*896/width),gap=target*.12;
    this.radius=target*.62;this.center={x:target*.9,y:544-target*.9};
    this.base.setPosition(this.center.x,this.center.y).setScale(this.radius*1.2/48);
    this.knob.setScale(target*.28/20);if(this.owner===undefined)this.knob.setPosition(this.center.x,this.center.y);
    this.attackRadius=target*.675;const outer=this.attackRadius*1.2;const commandLeft=896-target*.55-2*(target+gap)-target/2;const attackY=Math.max(230,158+outer+12);const commandTop=544-target*.55-(target+gap)-target/2;const attackX=commandTop<attackY+outer?Math.min(896-outer-12,commandLeft-outer-8):896-outer-12;this.attackCenter={x:attackX,y:attackY};this.attackBase.setPosition(this.attackCenter.x,this.attackCenter.y).setScale(this.attackRadius*1.2/48);this.attackKnob.setScale(target*.28/18);if(this.attackOwner===undefined)this.attackKnob.setPosition(this.attackCenter.x,this.attackCenter.y);(this.attackBase.getData('icon') as Phaser.GameObjects.Text).setPosition(this.attackCenter.x,this.attackCenter.y);
    this.actions.forEach((button,i)=>{button.setScale(target/48);if(i===6)button.setPosition(this.center.x,this.center.y-this.radius*1.2-target*.7);else button.setPosition(896-target*.55-(2-i%3)*(target+gap),544-target*.55-Math.floor(i/3)*(target+gap));});
    this.scene.registry.set('touch-control-layout',{joystick:{...this.center},radius:this.radius,attack:{...this.attackCenter,radius:this.attackRadius},actions:this.actions.map(b=>({x:b.x,y:b.y,size:target}))});
  }
  private move(p:Phaser.Input.Pointer):void {const dx=p.x-this.center.x,dy=p.y-this.center.y,length=Math.hypot(dx,dy),scale=length>this.radius?this.radius/length:1;this.knob.setPosition(this.center.x+dx*scale,this.center.y+dy*scale);this.scene.game.events.emit('touch-move',{x:length<this.radius*.2?0:dx*scale/this.radius,y:length<this.radius*.2?0:dy*scale/this.radius});}
  private aim(p:Phaser.Input.Pointer):void {const dx=p.x-this.attackCenter.x,dy=p.y-this.attackCenter.y,length=Math.hypot(dx,dy),scale=length>this.attackRadius?this.attackRadius/length:1;this.attackKnob.setPosition(this.attackCenter.x+dx*scale,this.attackCenter.y+dy*scale);this.attackDirection.clear();if(length>=this.attackRadius*.15){const nx=dx/length,ny=dy/length,r=this.attackRadius*1.2;this.attackDirection.lineStyle(6,0xffe7a0,1).beginPath().moveTo(this.attackCenter.x+nx*(r-12),this.attackCenter.y+ny*(r-12)).lineTo(this.attackCenter.x+nx*(r+5),this.attackCenter.y+ny*(r+5)).strokePath();}this.scene.game.events.emit('touch-aim',length<this.attackRadius*.15?{x:0,y:0}:{x:dx/length,y:dy/length});}
  private reset():void {this.attackDirection.clear();this.owner=undefined;this.guardOwner=undefined;this.attackOwner=undefined;this.attackDirection.clear();this.attackKnob.setPosition(this.attackCenter.x,this.attackCenter.y);this.scene.game.events.emit('touch-aim',undefined);this.knob.setPosition(this.center.x,this.center.y);this.scene.game.events.emit('touch-move',{x:0,y:0});this.scene.game.events.emit('touch-action','guard-end');}
}
