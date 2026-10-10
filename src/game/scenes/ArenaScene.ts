import Phaser from 'phaser';
import { ENEMY_TYPES, HEROES, HERO_PROFILES, HERO_SHEETS, isFlying, OBSTACLES, PLAYER_SPEED_SCALE, WORLD, type Hero } from '../data/config';
import { direction, inMeleeRange, validSpawn, waveSize, type Point } from '../systems/rules';
import { combatDamage, weaponAttackSound, weaponMatchup, withinWeaponRange, type WeaponType } from '../systems/combat';
import { BattleHud } from '../systems/BattleHud';
import { newProgress, type Progress, gainExperience, attackPower, attackCooldown, killExperience } from '../systems/progression';
import { actionFlipX } from '../data/animation-layout';
import { initialLoadout } from '../data/equipment';
import { unitDefinition, type UnitDefinition } from '../systems/unit-profile';
import { BATTLEFIELD, defaultDeployment } from '../data/battlefield';
import { HERO_NAMES } from '../data/config';
import { NavigationField } from '../systems/navigation';

type Enemy = Phaser.Physics.Arcade.Sprite;
type EnemyDefinition = UnitDefinition;
interface EnemyBrain {
  type: string;
  phase: 'chase' | 'windup' | 'recover';
  aim: Point;
  target: Point;
  strikeAt: number;
  recoverUntil: number;
  nextAttackAt: number;
  retreating: boolean;
  targetUnit?: Enemy;
}
export interface Hud { maxHealth:number; level:number; xp:number; allyMode:string; allies:number; allyCapacity:number; health: number; wave: number; kills: number; enemies: number }
export class ArenaScene extends Phaser.Scene {
  private tactical = false;
  private deploying = false;
  private party: Hero[] = [];
  private selectedDeployment: Hero = 'chrom';
  private deployment: Partial<Record<Hero,Point>> = {};
  private partyStates = new Map<Hero,{health:number;progress:Progress;lastAttack:number;lastDamage:number}>();
  private campLabels: Phaser.GameObjects.GameObject[] = [];
  private width: number = WORLD.width;
  private height: number = WORLD.height;
  private terrain: readonly (readonly [number,number,number,number])[] = OBSTACLES;
  private hero: Hero = 'chrom';
  private companions: Hero[] = [];
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerWeapon!: Phaser.GameObjects.Image;
  private flightShadow!: Phaser.GameObjects.Ellipse;
  private enemies!: Phaser.Physics.Arcade.Group;
  private allies!: Phaser.Physics.Arcade.Group;
  private targetFields = new Map<Enemy, NavigationField>();
  private allyRoutes = new Map<Enemy, NavigationField>();
  private pickups!: Phaser.Physics.Arcade.Group;
  private arrows!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private health = 100;
  private progression = newProgress();
  private battleHud!:BattleHud;
  private allyMode:'defend'|'attack' = 'defend';
  private wave = 1;
  private kills = 0;
  private facing: Point = { x: 1, y: 0 };
  private lastAttack = -Infinity;
  private actionUntil = 0;
  private pointerAim: Point | undefined;
  private keyboardFacing: Point = { x: 1, y: 0 };
  private pointerAttack = false;
  private lastDamage = -Infinity;
  private spawning = 0;
  private advancing = false;
  private ended = false;
  private playerShot: { aim: Point; at: number } | undefined;
  private aimGuide!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private telegraphs!: Phaser.GameObjects.Graphics;
  private navigation!: NavigationField;
  private brains = new WeakMap<Enemy, EnemyBrain>();
  constructor() { super('Arena'); }
  init(data: { hero?: Hero; companions?: Hero[]; tactical?:boolean }): void {
    this.tactical = data.tactical === true; this.deploying=this.tactical;
    this.width=this.tactical?BATTLEFIELD.width:WORLD.width;this.height=this.tactical?BATTLEFIELD.height:WORLD.height;this.terrain=this.tactical?BATTLEFIELD.terrain:OBSTACLES;
    this.hero = data.hero ?? 'chrom';
    this.companions = [...new Set(data.companions ?? [])].filter(h => h !== this.hero && HEROES.includes(h)).slice(0,3);
    this.party=[this.hero,...this.companions];this.selectedDeployment=this.hero;this.deployment=defaultDeployment(this.party);this.partyStates.clear();this.campLabels=[];
    for(const h of this.party)this.partyStates.set(h,{health:100,progress:newProgress(),lastAttack:-Infinity,lastDamage:-Infinity});
    this.brains = new WeakMap(); this.targetFields.clear(); this.allyRoutes.clear();
    this.playerShot = undefined; this.actionUntil = 0; this.pointerAim = undefined; this.pointerAttack = false;
    this.health = 100; this.progression = this.partyStates.get(this.hero)!.progress; this.allyMode = 'defend'; this.wave = 1; this.kills = 0;
    this.facing = { x: 1, y: 0 }; this.keyboardFacing = { ...this.facing }; this.lastAttack = -Infinity;
    this.lastDamage = -Infinity; this.spawning = 0; this.advancing = false; this.ended = false;
  }
  create(): void {
    this.add.image(this.width / 2, this.height / 2, this.tactical?'battlefield':'map').setDisplaySize(this.width, this.height);
    this.physics.world.setBounds(0, 0, this.width, this.height);
    this.navigation = new NavigationField(this.width, this.height, this.terrain);
    this.walls = this.physics.add.staticGroup();
    for (const [x, y, width, height] of this.terrain) {
      const wall = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.walls.add(wall);
    }
    this.player = this.physics.add.sprite(190, 230, this.hero).setCollideWorldBounds(true).setDepth(10);
    this.player.setSize(28, 28).setOffset(11, 15);
    if(this.tactical){const start=this.deployment[this.hero]!;this.player.body!.reset(start.x,start.y);}
    this.playerWeapon = this.add.image(0, 0, `weapon-${HERO_PROFILES[this.hero].weapon}`).setDisplaySize(16, 16).setDepth(21);
    this.flightShadow = this.add.ellipse(0, 0, 32, 12, 0x15201b, 0.4).setDepth(8).setVisible(false);
    if (isFlying(this.hero)) this.player.setDepth(12);
    this.enemies = this.physics.add.group();
    this.allies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.arrows = this.physics.add.group();
    this.physics.add.collider(this.arrows, this.walls, arrow => arrow.destroy());
    this.physics.add.overlap(this.player, this.arrows, (_player, arrow) => this.projectileHit(arrow as Enemy, this.player));
    this.physics.add.overlap(this.arrows, this.enemies, (arrow, target) => this.projectileHit(arrow as Enemy, target as Enemy));
    this.physics.add.overlap(this.arrows, this.allies, (arrow, target) => this.projectileHit(arrow as Enemy, target as Enemy));
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.allies, this.allies, undefined, (a,b) => this.unitFlying(a as Enemy) === this.unitFlying(b as Enemy));
    this.physics.add.collider(this.allies, this.enemies, undefined, a => !this.unitFlying(a as Enemy));
    this.physics.add.collider(this.player, this.allies, undefined, (_player, ally) => !isFlying(this.hero) && !this.unitFlying(ally as Enemy));
    this.physics.add.collider(this.player, this.enemies, undefined, () => !isFlying(this.hero));
    // Resolve terrain last: crowd separation must not leave bodies inside walls.
    this.physics.add.collider(this.player, this.walls, undefined, () => !isFlying(this.hero));
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.allies, this.walls, undefined, a => !this.unitFlying(a as Enemy));
    this.physics.add.overlap(this.player, this.pickups, (_player, item) => {
      item.destroy(); this.health = Math.min(this.progression.stats.hp, this.health + 25); this.publishHud();
    });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,Q,E') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.input.on('pointermove', this.updatePointerAim, this);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over:Phaser.GameObjects.GameObject[]) => {
      if (over.length) return;
      if(this.deploying){const point=pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;this.placeDeployment(point);return;}
      if (!pointer.leftButtonDown() || this.ended || !['bow', 'tome'].includes(HERO_PROFILES[this.hero].weapon)) return;
      this.updatePointerAim(pointer); this.pointerAttack = true;
    });
    this.input.on('gameout', () => { this.pointerAim = undefined; this.pointerAttack = false; });
    this.events.on(Phaser.Scenes.Events.PAUSE, () => { this.pointerAim = undefined; this.pointerAttack = false; });
    this.aimGuide = this.add.graphics().setDepth(7);
    this.healthBar = this.add.graphics().setDepth(20);
    this.telegraphs = this.add.graphics().setDepth(8);
    this.navigation.setTarget(this.bodyCenter(this.player), isFlying(this.hero));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.resetKeys();
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.input.removeAllListeners();
      this.events.removeAllListeners(Phaser.Scenes.Events.PAUSE);
    });
    this.battleHud = new BattleHud(this,this.hero,()=>this.tactical?this.switchCharacter(1):this.toggleAllyMode());
    this.spawnAllies();
    if(this.tactical){this.cameras.main.setBounds(0,0,this.width,this.height).setZoom(.5).centerOn(this.width/2,this.height/2);this.physics.pause();this.battleHud.setVisible(false);this.showCamps();this.game.events.emit('deployment',this.party);}
    else this.startWave();
    this.publishHud();
  }
  update(time: number): void {
    if (this.ended) return;
    if(this.deploying){this.drawHealthBars();this.publishTacticalMap();return;}
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.tactical?this.switchCharacter(-1):this.toggleAllyMode();
    if (this.tactical && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.switchCharacter(1);
    if (!isFlying(this.hero)) this.recoverFromTerrain(this.player);
    const horizontal = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown);
    const vertical = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown);
    const movement = direction(horizontal, vertical);
    const profile = HERO_PROFILES[this.hero];
    this.player.setVelocity(movement.x * (profile.speed*PLAYER_SPEED_SCALE+2*(this.progression.stats.speed-this.progression.base.speed)), movement.y * (profile.speed*PLAYER_SPEED_SCALE+2*(this.progression.stats.speed-this.progression.base.speed)));
    if (horizontal || vertical) this.keyboardFacing = movement;
    this.facing = { ...this.keyboardFacing };
    if (this.pointerAim && ['bow', 'tome'].includes(profile.weapon)) {
      const origin = this.bodyCenter(this.player);
      const aim = direction(this.pointerAim.x - origin.x, this.pointerAim.y - origin.y);
      if (aim.x || aim.y) this.facing = aim;
    }
    if (HERO_SHEETS[this.hero].directional) {
      this.player.setFlipX(false);
      const row = this.directionName(horizontal || vertical ? movement : this.facing);
      if (this.playerShot || time < this.actionUntil) { this.player.setVelocity(movement.x * 90, movement.y * 90); this.player.setFlipX(actionFlipX(this.hero,(this.playerShot?.aim ?? this.facing).x)); }
      else if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk-${row}`, true);
      else { this.player.anims.play(`${this.hero}-idle`, true); this.player.setFlipX(this.facing.x > 0); }
    } else {
      if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk`, true);
      else this.player.anims.play(`${this.hero}-idle`, true);
      this.player.setFlipX(this.facing.x > 0);
    }
    const attackRequested = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.pointerAttack;
    this.pointerAttack = false;
    if (attackRequested && time - this.lastAttack >= attackCooldown(this.progression,this.hero)) {
      this.lastAttack = time; this.attack();
    }
    if (this.playerShot && time >= this.playerShot.at) {
      this.fireArrow(this.player, this.playerShot.aim, 'player', profile.weapon);
      this.playerShot = undefined;
    }
    this.drawAimGuide();
    this.navigation.setTarget(this.bodyCenter(this.player), isFlying(this.hero));
    this.telegraphs.clear();
    for (const object of this.allies.getChildren()) {
      const ally = object as Enemy;
      this.targetFields.get(ally)?.setTarget(this.bodyCenter(ally));
      this.updateEnemy(ally, time);
    }
    for (const object of this.enemies.getChildren()) {
      this.updateEnemy(object as Enemy, time);
      if (this.ended) break;
    }
    if (this.ended) return;
    for (const object of [...this.arrows.getChildren()]) {
      const arrow = object as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.BetweenPoints(arrow.getData('origin') as Point, this.bodyCenter(arrow)) > (arrow.getData('maxRange') as number) || time >= (arrow.getData('expires') as number) || arrow.x < 0 || arrow.y < 0 || arrow.x > this.width || arrow.y > this.height) arrow.destroy();
    }
    this.drawHealthBars();
    this.battleHud.update(this.progression,this.health,this.wave,this.kills,this.tactical?'tactical':this.allyMode,this.allies.countActive());
    if(this.tactical){this.publishTacticalMap();if(this.enemies.countActive()===0 && !this.arrows.getChildren().some(a=>a.getData('faction')==='enemy'))this.finishTactical(true);return;}
    if (this.spawning === 0 && this.enemies.countActive() === 0 && !this.advancing) {
      this.advancing = true;
      this.game.events.emit('notice', `Wave ${this.wave} cleared. Catch your breath…`);
      this.time.delayedCall(1600, () => { this.wave++; this.advancing = false; this.startWave(); });
    }
  }
  selectDeployment(hero:Hero):void { if(this.deploying && this.party.includes(hero)){this.selectedDeployment=hero;this.game.events.emit('notice',`Place ${HERO_NAMES[hero]} on open terrain.`);} }
  private placeDeployment(point:Point):boolean {
    const valid=(isFlying(this.selectedDeployment)?point.x>=20&&point.x<=this.width-20&&point.y>=20&&point.y<=this.height-20:this.navigation.isWalkable({x:point.x,y:point.y+4.5})) && !Object.entries(this.deployment).some(([hero,p])=>hero!==this.selectedDeployment && p && Phaser.Math.Distance.BetweenPoints(p,point)<64) && !BATTLEFIELD.soldiers.some(p=>Phaser.Math.Distance.BetweenPoints(p,point)<64) && !BATTLEFIELD.camps.some(p=>Phaser.Math.Distance.BetweenPoints(p,point)<150);
    if(!valid){this.game.events.emit('notice','Choose open terrain away from camps and other units.');return false;}
    const unit=this.selectedDeployment===this.hero?this.player:this.allies.getChildren().find(a=>a.getData('companionHero')===this.selectedDeployment) as Enemy;
    unit.body!.reset(point.x,point.y);unit.body!.updateFromGameObject();unit.setData('home',{x:point.x,y:point.y});this.deployment[this.selectedDeployment]={x:point.x,y:point.y};
    this.game.events.emit('notice',`${HERO_NAMES[this.selectedDeployment]} deployed. Select another character or begin battle.`);return true;
  }
  private showCamps():void {
    for(const camp of BATTLEFIELD.camps){
      this.campLabels.push(this.add.circle(camp.x,camp.y,48,0x9c3434,.35).setStrokeStyle(3,0xe56565).setDepth(2));
      const counts=Object.entries(camp.units.reduce<Record<string,number>>((a,key)=>{a[key]=(a[key]??0)+1;return a;},{})).map(([key,n])=>`${n} ${key}`).join(' · ');
      this.campLabels.push(this.add.text(camp.x,camp.y-50,`${camp.name}\n${counts}`,{fontFamily:'FE',fontSize:'22px',color:'#fff0c6',backgroundColor:'#522c2c',align:'center'}).setOrigin(.5).setDepth(22));
      for(const [i,key] of camp.units.entries())this.createHostile(camp.x+(i%2)*60-30,camp.y+Math.floor(i/2)*60-30,key);
    }
    this.game.events.emit('notice','Select a party member, then click the battlefield to place them. Camps show exact enemy counts.');
  }
  launchBattle():void {
    if(!this.deploying || this.ended)return;
    this.deploying=false;for(const object of this.campLabels)object.destroy();this.campLabels=[];
    this.cameras.main.setZoom(1).startFollow(this.player,true,.12,.12).setDeadzone(180,100);
    this.physics.resume();this.input.keyboard?.resetKeys();this.pointerAim=undefined;this.pointerAttack=false;
    this.battleHud.destroy();this.battleHud=new BattleHud(this,this.hero,()=>this.switchCharacter(1));this.battleHud.synchronize(this.progression);
    this.game.events.emit('notice','Defeat all four camps. Q / E switch characters; soldiers and companions hold their assigned fronts.');this.publishHud();
  }
  private createHostile(x:number,y:number,key:string):Enemy {
    const type=ENEMY_TYPES.find(t=>t.key===key)!;const enemy=this.enemies.create(x,y,key) as Enemy;
    enemy.setSize(28,28).setOffset(11,15).setCollideWorldBounds(true).setDepth(9);enemy.body!.updateFromGameObject();
    const icon=this.add.image(x,y,`weapon-${type.weapon}`).setDisplaySize(16,16).setDepth(21);
    const marker=this.add.text(x,y,'',{fontFamily:'FE',fontSize:'11px',backgroundColor:'#15201b'}).setDepth(21);enemy.setData({weaponIcon:icon,weaponMarker:marker,weapon:type.weapon,defense:type.defense,resistance:type.resistance,health:type.health,maxHealth:type.health,speed:type.speed,damage:type.damage});enemy.once('destroy',()=>{marker.destroy();icon.destroy();});return enemy;
  }
  private switchCharacter(step:number):boolean {
    if(!this.tactical || this.deploying || this.ended)return false;
    const previous=this.hero,state=this.partyStates.get(previous)!;state.health=this.health;state.lastAttack=this.lastAttack;state.lastDamage=this.lastDamage;
    const index=this.party.indexOf(previous);let hero:Hero|undefined;
    for(let n=1;n<this.party.length;n++){const candidate=this.party[(index+step*n+this.party.length*2)%this.party.length];if(this.partyStates.get(candidate)!.health>0){hero=candidate;break;}}
    if(!hero)return false;
    const ally=this.allies.getChildren().find(a=>a.getData('companionHero')===hero) as Enemy|undefined;if(!ally)return false;
    const next=this.partyStates.get(hero)!;next.health=ally.getData('health');const nextBrain=this.brains.get(ally);if(nextBrain)next.lastAttack=Math.max(next.lastAttack,nextBrain.nextAttackAt-attackCooldown(next.progress,hero));
    const from={x:this.player.x,y:this.player.y},to={x:ally.x,y:ally.y};const shot=this.playerShot;
    this.hero=hero;this.health=next.health;this.progression=next.progress;this.lastAttack=next.lastAttack;this.lastDamage=next.lastDamage;
    this.player.setTexture(hero).clearTint().setDepth(isFlying(hero)?12:10).setSize(28,28).setOffset(11,15);this.player.body!.reset(to.x,to.y);this.player.body!.updateFromGameObject();this.player.setVelocity(0);this.player.anims.play(`${hero}-idle`);
    ally.setTexture(previous).setDepth(isFlying(previous)?12:9).setSize(28,28).setOffset(11,15);ally.body!.reset(from.x,from.y);ally.body!.updateFromGameObject();ally.setVelocity(0);
    const p=HERO_PROFILES[previous];ally.setData({companionHero:previous,flying:isFlying(previous),weapon:p.weapon,health:state.health,maxHealth:state.progress.stats.hp,progression:state.progress,loadout:initialLoadout(previous),damage:attackPower(state.progress,previous),speed:p.speed*PLAYER_SPEED_SCALE+2*(state.progress.stats.speed-state.progress.base.speed),defense:state.progress.stats.def,resistance:state.progress.stats.res,home:this.deployment[previous],pendingShot:shot,nextAttackAt:state.lastAttack+attackCooldown(state.progress,previous)});
    (ally.getData('weaponIcon') as Phaser.GameObjects.Image).setTexture(`weapon-${p.weapon}`);this.playerWeapon.setTexture(`weapon-${HERO_PROFILES[hero].weapon}`);
    this.brains.delete(ally);for(const unit of [...this.enemies.getChildren(),...this.allies.getChildren()]){const brain=this.brains.get(unit as Enemy);if(brain?.targetUnit===this.player)brain.targetUnit=ally;else if(brain?.targetUnit===ally)brain.targetUnit=this.player;}
    if(state.health<=0)ally.destroy();else ally.anims.play(`${previous}-idle`);
    this.playerShot=undefined;this.actionUntil=0;this.pointerAim=undefined;this.pointerAttack=false;this.facing={x:1,y:0};this.keyboardFacing={...this.facing};
    this.battleHud.destroy();this.battleHud=new BattleHud(this,hero,()=>this.switchCharacter(1));this.battleHud.synchronize(this.progression);
    this.game.events.emit('controlled-character',hero);this.game.events.emit('hero-voice',{hero,event:'select'});this.publishHud();return true;
  }
  private finishTactical(victory:boolean):void {
    if(this.ended)return;this.ended=true;this.playerShot=undefined;this.arrows.clear(true,true);this.physics.pause();this.time.removeAllEvents();this.aimGuide.clear();this.telegraphs.clear();this.game.events.emit('game-over',{wave:1,kills:this.kills,victory});
  }
  private publishTacticalMap():void {
    const camera=this.cameras.main;
    this.game.events.emit('tactical-map',{width:this.width,height:this.height,deploying:this.deploying,party:this.party.map(hero=>{const state=this.partyStates.get(hero)!;const health=hero===this.hero?this.health:state.health;return {hero,health,level:state.progress.level,xp:state.progress.xp};}),controlled:this.hero,allies:[{x:this.player.x,y:this.player.y},...this.allies.getChildren().map(a=>({x:(a as Enemy).x,y:(a as Enemy).y}))],enemies:this.enemies.getChildren().map(a=>({x:(a as Enemy).x,y:(a as Enemy).y})),camera:{x:camera.worldView.x,y:camera.worldView.y,width:camera.worldView.width,height:camera.worldView.height}});
  }
  private updatePointerAim(pointer: Phaser.Input.Pointer): void {
    if (this.ended || pointer.x < 0 || pointer.y < 0 || pointer.x > WORLD.width || pointer.y > WORLD.height) return;
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    this.pointerAim = { x: point.x, y: point.y };
  }
  private bodyCenter(sprite: Phaser.Physics.Arcade.Sprite): Point {
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    return { x: body.center.x, y: body.center.y };
  }
  private unitFlying(unit:Enemy):boolean { return unit === this.player ? isFlying(this.hero) : unit.getData('flying') === true; }
  private recoverFromTerrain(sprite: Enemy): void {
    if(this.unitFlying(sprite))return;
    const center = this.bodyCenter(sprite);
    const point = this.navigation.recoveryPoint(center);
    if (!point) return;
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.reset(sprite.x + point.x - center.x, sprite.y + point.y - center.y);
    // Arcade reset starts at the sprite top-left; restore the configured body offset.
    body.updateFromGameObject();
    body.prev.copy(body.position);
    body.prevFrame.copy(body.position);
  }
  private toggleAllyMode():void {
    if(this.ended)return;
    this.allyMode=this.allyMode==='defend'?'attack':'defend';
    for(const ally of this.allies.getChildren())this.brains.delete(ally as Enemy);
    this.game.events.emit('notice',`Allies: ${this.allyMode} — Q toggles orders. No mid-battle respawn.`);
    this.publishHud();
  }
  private awardExperience(key:string):void {
    if(this.tactical){
      this.partyStates.get(this.hero)!.health=this.health;
      for(const [hero,state] of this.partyStates){if(state.health<=0)continue;const amount=killExperience(state.progress.level,1,key),hp=state.progress.stats.hp;const gains=gainExperience(state.progress,hero,amount);state.health+=state.progress.stats.hp-hp;if(hero===this.hero){this.health=state.health;this.battleHud.gain(amount,gains);}else{const ally=this.allies.getChildren().find(a=>a.getData('companionHero')===hero) as Enemy|undefined;ally?.setData({health:state.health,maxHealth:state.progress.stats.hp,defense:state.progress.stats.def,resistance:state.progress.stats.res,damage:attackPower(state.progress,hero),speed:HERO_PROFILES[hero].speed*PLAYER_SPEED_SCALE+2*(state.progress.stats.speed-state.progress.base.speed)});}}
      return;
    }
    const amount=killExperience(this.progression.level,this.wave,key),hp=this.progression.stats.hp;
    const gains=gainExperience(this.progression,this.hero,amount);
    this.health+=this.progression.stats.hp-hp;
    this.battleHud.gain(amount,gains);
  }
  private faction(unit: Enemy): 'player' | 'ally' | 'enemy' {
    return unit === this.player ? 'player' : unit.getData('faction') === 'ally' ? 'ally' : 'enemy';
  }
  private chooseTarget(unit: Enemy, current?: Enemy): Enemy | undefined {
    let targets = this.faction(unit) === 'ally'
      ? this.enemies.getChildren() as Enemy[]
      : [this.player, ...this.allies.getChildren() as Enemy[]];
    const origin = this.bodyCenter(unit);
    if(this.faction(unit)==='ally' && (this.tactical || this.allyMode==='defend')) {
      const player=this.tactical?(unit.getData('home') as Point ?? origin):this.bodyCenter(this.player);
      targets=targets.filter(target=>Phaser.Math.Distance.BetweenPoints(player,this.bodyCenter(target))<=(this.tactical?350:160) && Phaser.Math.Distance.BetweenPoints(origin,player)<=(this.tactical?450:200));
    }
    let living = targets.filter(target => target.active && (target === this.player ? !this.ended : target.getData('health') > 0));
    if (this.faction(unit) === 'enemy' && living.some(target => this.unitFlying(target) && !this.navigation.isWalkable(this.bodyCenter(target)))) {
      const reachable = living.filter(target => this.navigation.isWalkable(this.bodyCenter(target)) && (target===this.player ? this.navigation.hasRoute(origin) : this.targetFields.get(target)?.hasRoute(origin)));
      if(reachable.length)living=reachable;
    }
    const distance = (target: Enemy) => Phaser.Math.Distance.BetweenPoints(origin, this.bodyCenter(target));
    let best = living.reduce<Enemy | undefined>((a, b) => !a || distance(b) < distance(a) ? b : a, undefined);
    // Keep a living target unless another is meaningfully closer; avoid crowd target flicker.
    if (current && living.includes(current) && best && distance(current) <= distance(best) + 40) best = current;
    return best;
  }
  private projectileHit(arrow: Enemy, target: Enemy): void {
    if (!arrow.active || !target.active) return;
    const faction = arrow.getData('faction');
    if ((faction === 'enemy') === (this.faction(target) === 'enemy')) return;
    const distance = Phaser.Math.Distance.BetweenPoints(arrow.getData('origin') as Point, this.bodyCenter(arrow));
    if (!withinWeaponRange(distance, arrow.getData('minRange'), arrow.getData('maxRange'))) return;
    if (target === this.player) this.takeDamage(arrow.getData('damage'), arrow.getData('weapon'));
    else this.damageEnemy(target, arrow.getData('damage'), arrow.getData('weapon'),faction,arrow.getData('attackingHero'));
    arrow.destroy(); this.game.events.emit('effect', 'damage', { volume: 0.3 });
  }
  private spawnAllies(): void {
    const units: { key:string;x:number;y:number;hero?:Hero }[] = this.tactical?BATTLEFIELD.soldiers.map(p=>({key:'soldier',...p})):[{key:'soldier',x:168,y:280},{key:'soldier',x:120,y:230}];
    const positions = [[236,230],[190,310],[138,310]];
    this.companions.forEach((hero,i)=>units.push({key:hero,hero,x:this.tactical?this.deployment[hero]!.x:positions[i][0],y:this.tactical?this.deployment[hero]!.y:positions[i][1]}));
    for (const unit of units) {
      const {x,y,key,hero}=unit;
      const ally=this.allies.create(x,y,key) as Enemy;
      ally.setSize(28,28).setOffset(11,15).setCollideWorldBounds(true).setTint(0x8edfff).setDepth(hero&&isFlying(hero)?12:9);
      const p=hero?HERO_PROFILES[hero]:undefined;
      ally.setData({faction:'ally',companionHero:hero,flying:hero?isFlying(hero):false,weapon:p?.weapon??'sword',health:100,maxHealth:100,defense:hero?0:3,resistance:hero?0:2,damage:p?.damage??18,speed:p?p.speed*PLAYER_SPEED_SCALE:85,progression:hero?this.partyStates.get(hero)!.progress:undefined,loadout:hero?initialLoadout(hero):undefined});
      ally.setData('home',{x,y});
      const marker=this.add.text(x,y,hero?hero==='robin-female'?'ROBIN F':hero.toUpperCase():'ALLY',{fontFamily:'FE',fontSize:'10px',color:'#9de6ff',backgroundColor:'#15201b'}).setDepth(21);
      ally.setData('weaponMarker',marker);
      const icon=this.add.image(x,y,`weapon-${p?.weapon??'sword'}`).setDisplaySize(16,16).setDepth(21);ally.setData('weaponIcon',icon);
      this.targetFields.set(ally,new NavigationField(this.width,this.height,this.terrain));
      this.allyRoutes.set(ally,new NavigationField(this.width,this.height,this.terrain));
      ally.once('destroy',()=>{marker.destroy();icon.destroy();this.targetFields.delete(ally);this.allyRoutes.delete(ally);});
    }
  }
  private updateEnemy(enemy: Enemy, time: number): void {
    this.recoverFromTerrain(enemy);
    const pending=enemy.getData('pendingShot') as {aim:Point;at:number}|undefined;
    if(pending){enemy.setVelocity(0);if(time>=pending.at){this.fireArrow(enemy,pending.aim,'ally',this.enemyWeapon(enemy));enemy.setData('pendingShot',undefined);}return;}
    const original = unitDefinition(enemy.texture.key);
    const companion=enemy.getData('companionHero') as Hero|undefined;
    const definition=companion&&this.tactical?{...original,attack:{...original.attack,cooldown:attackCooldown(enemy.getData('progression'),companion)}}:original;
    let brain = this.brains.get(enemy);
    if (!brain || brain.type !== definition.key) {
      brain = { type: definition.key, phase: 'chase', aim: { x: 1, y: 0 }, target: { x: 0, y: 0 }, strikeAt: 0, recoverUntil: 0, nextAttackAt: Math.max(time + 250, enemy.getData('nextAttackAt') ?? 0), retreating: false };
      this.brains.set(enemy, brain);
    }
    if (brain.phase === 'chase') brain.targetUnit = this.chooseTarget(enemy, brain.targetUnit);
    const targetUnit = brain.targetUnit;
    if (!targetUnit?.active) {
      brain.phase = 'chase'; brain.targetUnit = undefined;
      if(this.faction(enemy)==='ally') {
        const origin=this.bodyCenter(enemy),target=this.tactical?enemy.getData('home') as Point:this.bodyCenter(this.player);
        const field=this.allyRoutes.get(enemy)!;field.setTarget(target,isFlying(this.hero));
        const destination=this.unitFlying(enemy)||field.canTravel(origin,target)?target:field.nextWaypoint(origin);
        if(destination && Phaser.Math.Distance.BetweenPoints(origin,target)>70){const aim=direction(destination.x-origin.x,destination.y-origin.y);enemy.setVelocity(aim.x*enemy.getData('speed'),aim.y*enemy.getData('speed')).setFlipX(false);enemy.anims.play(`${enemy.texture.key}-walk-${this.directionName(aim)}`,true);return;}
      }
      enemy.setVelocity(0); enemy.anims.play(`${enemy.texture.key}-idle`, true); return;
    }
    const origin = this.bodyCenter(enemy), target = this.bodyCenter(targetUnit);
    const route = this.faction(enemy) === 'ally' ? this.allyRoutes.get(enemy)! : targetUnit === this.player ? this.navigation : this.targetFields.get(targetUnit)!;
    if (this.faction(enemy) === 'ally') route.setTarget(target, isFlying(this.hero) && targetUnit === this.player);
    const distance = Phaser.Math.Distance.Between(origin.x, origin.y, target.x, target.y);
    const visible = this.unitFlying(enemy) || this.hasLineOfSight(origin, target);
    const attack = definition.attack;
    if (brain.phase === 'windup') {
      enemy.setVelocity(0);
      this.drawTelegraph(enemy, brain, definition);
      if (time >= brain.strikeAt) {
        this.resolveEnemyAttack(enemy, brain, definition);
        brain.phase = 'recover'; brain.recoverUntil = time + attack.recovery;
        brain.nextAttackAt = time + attack.cooldown;
      }
      return;
    }
    if (brain.phase === 'recover') {
      if (time < brain.recoverUntil) { enemy.setVelocity(0); enemy.anims.stop(); return; }
      brain.phase = 'chase';
    }
    if (attack.kind === 'ranged') {
      if (distance < (definition.weapon === 'tome' ? 65 : 140)) brain.retreating = true;
      if (distance >= (definition.weapon === 'tome' ? 110 : 180)) brain.retreating = false;
    }
    const canAttack = distance <= attack.range && visible && !brain.retreating;
    if (canAttack && time >= brain.nextAttackAt) {
      brain.phase = 'windup'; brain.aim = direction(target.x - origin.x, target.y - origin.y);
      brain.target = target; brain.strikeAt = time + attack.windup;
      enemy.setVelocity(0).setFlipX(actionFlipX(enemy.texture.key,brain.aim.x)); enemy.anims.play(`${enemy.texture.key}-action`);
      this.drawTelegraph(enemy, brain, definition);
      return;
    }
    const holdPosition = attack.kind === 'melee' ? distance <= attack.range * 0.9 && visible : distance <= 260 && visible && !brain.retreating;
    if (holdPosition) { enemy.setVelocity(0); enemy.anims.play(`${enemy.texture.key}-idle`, true); return; }
    const waypoint = !brain.retreating && (this.unitFlying(enemy) || route.canTravel(origin, target))
      ? target : route.nextWaypoint(origin, brain.retreating);
    if (!waypoint) { enemy.setVelocity(0); enemy.anims.stop(); return; }
    const movement = direction(waypoint.x - origin.x, waypoint.y - origin.y);
    const speed = enemy.getData('speed') as number;
    // Reach cell centers without overshooting them at low frame rates.
    const stepSpeed = Math.min(speed, Phaser.Math.Distance.Between(origin.x, origin.y, waypoint.x, waypoint.y) / Math.max(this.game.loop.delta / 1000, 0.001));
    enemy.setVelocity(movement.x * stepSpeed, movement.y * stepSpeed).setFlipX(false);
    if (stepSpeed > 1) { enemy.setFlipX(false); enemy.anims.play(`${enemy.texture.key}-walk-${this.directionName(movement)}`, true); }
    else enemy.anims.stop();
  }
  private directionName(aim: Point): string {
    const x = Math.abs(aim.x) > 0.3 ? Math.sign(aim.x) : 0;
    const y = Math.abs(aim.y) > 0.3 ? Math.sign(aim.y) : 0;
    return x && y ? `${y > 0 ? 'down' : 'up'}-${x > 0 ? 'right' : 'left'}` : x ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
  }
  private drawTelegraph(enemy: Enemy, brain: EnemyBrain, definition: EnemyDefinition): void {
    const range = definition.attack.range;
    this.telegraphs.lineStyle(2, 0xf4bd62, 0.8);
    if (definition.attack.kind === 'melee') {
      this.telegraphs.fillStyle(0xf4bd62, 0.08).fillCircle(enemy.x, enemy.y, range).strokeCircle(enemy.x, enemy.y, range);
    }
    const length = definition.attack.kind === 'melee' ? range : 100;
    this.telegraphs.lineBetween(enemy.x, enemy.y, enemy.x + brain.aim.x * length, enemy.y + brain.aim.y * length);
  }
  private resolveEnemyAttack(enemy: Enemy, brain: EnemyBrain, definition: EnemyDefinition): void {
    if (this.ended || !enemy.active) return;
    const targetUnit = brain.targetUnit ?? this.player;
    if (!targetUnit.active) return;
    const origin = this.bodyCenter(enemy), target = this.bodyCenter(targetUnit);
    if (definition.attack.kind === 'ranged') {
      if (this.hasLineOfSight(origin, brain.target)) this.fireArrow(enemy, brain.aim, this.faction(enemy), definition.weapon);
      return;
    }
    this.game.events.emit('effect', weaponAttackSound(definition.weapon), { volume: 0.18 });
    const slash = this.add.image(enemy.x + brain.aim.x * 35, enemy.y + brain.aim.y * 35, 'slash')
      .setDisplaySize(55, 55).setRotation(Math.atan2(brain.aim.y, brain.aim.x)).setTint(0xffb070).setDepth(15);
    this.tweens.add({ targets: slash, alpha: 0, duration: 180, onComplete: () => slash.destroy() });
    if (inMeleeRange(origin, target, brain.aim, definition.attack.range) && (this.unitFlying(enemy) || this.hasLineOfSight(origin, target))) {
      if (targetUnit === this.player) this.takeDamage(enemy.getData('damage') as number, definition.weapon);
      else this.damageEnemy(targetUnit, enemy.getData('damage') as number, definition.weapon,this.faction(enemy),enemy.getData('companionHero'));
    }
  }
  private hasLineOfSight(from: Point, to: Point): boolean {
    const line = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
    return !this.terrain.some(([x, y, width, height]) => Phaser.Geom.Intersects.LineToRectangle(line, new Phaser.Geom.Rectangle(x, y, width, height)));
  }
  private fireArrow(source: Enemy, aim: Point, faction: 'player' | 'ally' | 'enemy' = 'enemy', weapon: WeaponType = 'bow'): void {
    const origin = this.bodyCenter(source);
    const magic = weapon === 'tome';
    const arrow = this.arrows.create(origin.x + aim.x * 28, origin.y + aim.y * 28, magic ? 'fire-bolt' : 'arrow', magic ? undefined : 'shaft') as Enemy;
    const speed = faction === 'player' ? 360 : 230;
    const definition = unitDefinition(source.texture.key);
    const range = faction === 'player' ? HERO_PROFILES[this.hero].range : definition.attack.range;
    arrow.setDisplaySize(magic ? 24 : 40, magic ? 24 : 8).setRotation(Math.atan2(aim.y, aim.x) + (magic ? Math.PI / 2 : Math.PI)).setDepth(12);
    if (faction === 'player' && !magic) arrow.setTint(0x9de6ff);
    arrow.setSize(10 / arrow.scaleX, 10 / arrow.scaleY).setVelocity(aim.x * speed, aim.y * speed);
    arrow.setData({ faction, weapon, origin,attackingHero:faction==='player'?this.hero:source.getData('companionHero'), minRange: faction === 'player' ? HERO_PROFILES[this.hero].minRange : (definition.attack.minRange ?? 0), maxRange: range,
      damage: faction === 'player' ? attackPower(this.progression,this.hero) : source.getData('companionHero')?attackPower(source.getData('progression'),source.getData('companionHero')):source.getData('damage'), expires: this.time.now + range / speed * 1000 });
    if (magic) this.game.events.emit('spell-effect');
    else this.game.events.emit('effect', 'arrow-fire', { volume: 0.25 });
  }
  private drawAimGuide(): void {
    this.aimGuide.clear();
    if (!['bow', 'tome'].includes(HERO_PROFILES[this.hero].weapon)) return;
    const origin = this.bodyCenter(this.player), profile = HERO_PROFILES[this.hero];
    const aim = this.playerShot?.aim ?? this.facing;
    this.aimGuide.lineStyle(1, 0xe79d79, 0.45).strokeCircle(origin.x, origin.y, profile.minRange);
    this.aimGuide.lineStyle(this.playerShot ? 3 : 1, 0x9de6ff, 0.6);
    this.aimGuide.lineBetween(origin.x + aim.x * profile.minRange, origin.y + aim.y * profile.minRange,
      origin.x + aim.x * profile.range, origin.y + aim.y * profile.range);
  }
  private drawHealthBars(): void {
    this.playerWeapon.setPosition(Phaser.Math.Clamp(this.player.x + 34, 8, this.width - 8), Math.max(8, this.player.y - 32));
    this.flightShadow.setPosition(this.player.x, this.player.y + 22);
    this.healthBar.clear().fillStyle(0x15201b).fillRect(this.player.x - 25, this.player.y - 36, 50, 8)
      .fillStyle(0x7fce88).fillRect(this.player.x - 24, this.player.y - 35, 48 * this.health / this.progression.stats.hp, 6);
    for (const object of [...this.enemies.getChildren(), ...this.allies.getChildren()]) {
      const enemy = object as Enemy;
      const fraction = Phaser.Math.Clamp((enemy.getData('health') as number) / (enemy.getData('maxHealth') as number), 0, 1);
      const x = Phaser.Math.Clamp(enemy.x - 20, 1, this.width - 41);
      const y = Math.max(1, enemy.y - 34);
      const weapon = this.enemyWeapon(enemy);
      const matchup = weaponMatchup(HERO_PROFILES[this.hero].weapon, weapon);
      const color = matchup === 1 ? 0x7fce88 : matchup === -1 ? 0xffb070 : 0xb2cad0;
      // Weapon initials and +/- make matchup readable without relying on color alone.
      const label = this.faction(enemy) === 'ally' ? (enemy.getData('companionHero') ? String(enemy.getData('companionHero')).replace('robin-female','ROBIN F').toUpperCase() : 'ALLY') : `${matchup === 1 ? '+' : matchup === -1 ? '-' : ''}`;
      const marker = enemy.getData('weaponMarker') as Phaser.GameObjects.Text | undefined;
      const icon = enemy.getData('weaponIcon') as Phaser.GameObjects.Image | undefined;
      icon?.setPosition(Math.min(x + 48, this.width - 8), y + 3);
      if (marker) marker.setPosition(Math.min(x + 58, this.width - 12), y - 4).setText(label).setColor(this.faction(enemy) === 'ally' ? '#9de6ff' : `#${color.toString(16).padStart(6, '0')}`);
      this.healthBar.fillStyle(0x15201b).fillRect(x, y, 40, 7)
        .fillStyle(this.faction(enemy) === 'ally' ? 0x9de6ff : 0xe56565).fillRect(x + 1, y + 1, 38 * fraction, 5);
    }
  }
  private startWave(): void {
    this.spawning = waveSize(this.wave);
    this.game.events.emit('notice', `Wave ${this.wave} — ${this.spawning} enemies. Space to strike.`);
    this.spawnEnemy();
    this.time.addEvent({ delay: Math.max(450, 1400 - this.wave * 80), repeat: this.spawning - 1, callback: () => this.spawnEnemy() });
    this.publishHud();
  }
  private spawnEnemy(): void {
    if (this.ended || this.spawning <= 0) return;
    this.navigation.setTarget(this.bodyCenter(this.player), isFlying(this.hero));
    const candidates = this.navigation.reachablePoints().filter(point => validSpawn(point.x, point.y, this.terrain, this.bodyCenter(this.player)));
    if (candidates.length === 0) {
      this.time.delayedCall(500, () => this.spawnEnemy());
      return;
    }
    const position = candidates[Phaser.Math.Between(0, candidates.length - 1)];
    const type = ENEMY_TYPES[Phaser.Math.Between(0, ENEMY_TYPES.length - 1)];
    const enemy = this.enemies.create(position.x, position.y - 4.5, type.key) as Enemy;
    enemy.setSize(28, 28).setOffset(11, 15).setCollideWorldBounds(true).setDepth(9);
    const icon = this.add.image(enemy.x, enemy.y, `weapon-${type.weapon}`).setDisplaySize(16, 16).setDepth(21);
    enemy.setData('weaponIcon', icon);
    const marker = this.add.text(enemy.x, enemy.y, '', { fontFamily: 'FE', fontSize: '11px', backgroundColor: '#15201b' }).setDepth(21);
    enemy.setData('weaponMarker', marker);
    enemy.once('destroy', () => { marker.destroy(); icon.destroy(); });
    enemy.setData({ weapon: type.weapon, defense: type.defense, resistance: type.resistance, health: type.health, maxHealth: type.health, speed: type.speed + Math.min(25, this.wave * 2), damage: type.damage });
    this.spawning--; this.publishHud();
  }
  private enemyWeapon(enemy: Enemy): WeaponType {
    return (enemy.getData('weapon') as WeaponType | undefined) ?? (ENEMY_TYPES.find(type => type.key === enemy.texture.key) ?? ENEMY_TYPES[0]).weapon;
  }
  private attack(): void {
    const profile = HERO_PROFILES[this.hero];
    this.actionUntil = this.time.now + 200;
    this.player.anims.play(`${this.hero}-action`);
    this.player.setFlipX(actionFlipX(this.hero,this.facing.x));
    this.game.events.emit('hero-attack', { hero: this.hero, spell: profile.weapon === 'tome' ? 'Fire' : undefined });
    if (profile.weapon === 'bow' || profile.weapon === 'tome') {
      this.playerShot = { aim: { ...this.facing }, at: this.time.now + (profile.weapon === 'tome' ? 250 : 180) };
      this.player.anims.play(`${this.hero}-action`);
      return;
    }
    this.game.events.emit('effect', weaponAttackSound(profile.weapon), { volume: 0.25 });
    const slash = this.add.image(this.player.x + this.facing.x * profile.range / 2, this.player.y + this.facing.y * profile.range / 2, 'slash')
      .setDisplaySize(profile.range * 0.77, profile.range * 0.77).setRotation(Math.atan2(this.facing.y, this.facing.x)).setDepth(15);
    this.tweens.add({ targets: slash, alpha: 0, duration: 160, onComplete: () => slash.destroy() });
    let hit = false;
    for (const object of [...this.enemies.getChildren()]) {
      const enemy = object as Enemy;
      if (!inMeleeRange(this.bodyCenter(this.player), this.bodyCenter(enemy), this.facing, profile.range) || !this.hasLineOfSight(this.bodyCenter(this.player), this.bodyCenter(enemy))) continue;
      hit = true; this.damageEnemy(enemy, attackPower(this.progression,this.hero), profile.weapon);
    }
    if (hit) this.game.events.emit('effect', 'damage', { volume: 0.3 });
  }
  private damageEnemy(enemy: Enemy, base: number, weapon: WeaponType, attacker:'player'|'ally'|'enemy'='player',attackingHero?:Hero): void {
    if (!enemy.active) return;
    const targetProgress=enemy.getData('progression') as Progress|undefined;
    if(this.tactical && targetProgress){const avoid=Math.min(.25,((targetProgress.stats.speed-targetProgress.base.speed)*3+targetProgress.stats.luck-targetProgress.base.luck)/200);if(Math.random()<avoid)return;}
    const protection = (enemy.getData(weapon === 'tome' ? 'resistance' : 'defense') as number | undefined) ?? 0;
    const attackingProgress=attackingHero?this.partyStates.get(attackingHero)?.progress:attacker==='player'?this.progression:undefined;
    const criticalChance=attackingProgress?Math.min(.25,((attackingProgress.stats.skill-attackingProgress.base.skill)/2+(attackingProgress.stats.luck-attackingProgress.base.luck)/4)/100):0;
    const critical=Math.random()<criticalChance;
    const damage = combatDamage(Math.max(1, base - protection)*(critical?3:1), weapon, this.enemyWeapon(enemy),this.unitFlying(enemy));
    const health = (enemy.getData('health') as number) - damage;
    enemy.setData('health', health);
    const companion=enemy.getData('companionHero') as Hero|undefined;if(companion)this.partyStates.get(companion)!.health=Math.max(0,health);
    const text = this.add.text(enemy.x, enemy.y - 42, `${critical?'CRIT ':''}${damage}${weaponMatchup(weapon, this.enemyWeapon(enemy)) === 1 ? ' ↑' : weaponMatchup(weapon, this.enemyWeapon(enemy)) === -1 ? ' ↓' : ''}`,
      { fontFamily: 'FE', fontSize: '13px', color: '#f5edda', stroke: '#15201b', strokeThickness: 3 }).setDepth(25);
    this.tweens.add({ targets: text, y: text.y - 18, alpha: 0, duration: 650, onComplete: () => text.destroy() });
    if (health <= 0) {
      const { x, y } = enemy; const typeKey=enemy.texture.key; const companion=enemy.getData('companionHero') as Hero|undefined;if(companion)this.partyStates.get(companion)!.health=0; const hostile = this.faction(enemy) === 'enemy'; enemy.destroy(); if (hostile) { this.kills++; this.awardExperience(typeKey); }
      if (hostile && Phaser.Math.Between(1, 5) === 1 && this.pickups.countActive() < 3) {
        const item = this.pickups.create(x, y, 'vulnerary') as Enemy;
        item.setDisplaySize(20, 20); item.setSize(item.width, item.height);
        this.time.delayedCall(12000, () => { if (item.active) item.destroy(); });
      }
    } else {
      enemy.setTint(0xffb5a0);
      this.time.delayedCall(120, () => { if (enemy.active) { enemy.clearTint(); if (this.faction(enemy) === 'ally') enemy.setTint(0x8edfff); } });
    }
    this.publishHud();
  }
  private takeDamage(base: number, weapon: WeaponType = HERO_PROFILES[this.hero].weapon): void {
    const protection = weapon === 'tome' ? this.progression.stats.res : this.progression.stats.def;
    const damage = combatDamage(Math.max(1,base-protection), weapon, HERO_PROFILES[this.hero].weapon, isFlying(this.hero));
    if (this.ended || this.time.now - this.lastDamage < 700) return;
    const avoid=Math.min(.25,((this.progression.stats.speed-this.progression.base.speed)*3+this.progression.stats.luck-this.progression.base.luck)/200);
    if(Math.random()<avoid){this.game.events.emit('notice','Dodged!');return;}
    this.lastDamage = this.time.now;
    this.health = Math.max(0, this.health - damage);
    this.game.events.emit('effect', 'damage', { volume: 0.2 });
    this.game.events.emit('hero-voice', { hero: this.hero, event: this.health <= 0 ? 'death' : 'damage' });
    this.player.setTint(0xffaaaa);
    this.time.delayedCall(180, () => { if (this.player.active) this.player.clearTint(); });
    this.publishHud();
    if (this.health === 0 && this.tactical){this.partyStates.get(this.hero)!.health=0;if(this.switchCharacter(1))return;this.finishTactical(false);return;}
    if (this.health === 0) {
      this.game.events.emit('effect', 'death', { volume: 0.3 });
      this.playerShot = undefined; this.aimGuide.clear(); this.telegraphs.clear();
      this.ended = true; this.arrows.clear(true, true); this.physics.pause(); this.time.removeAllEvents();
      this.game.events.emit('game-over', { wave: this.wave, kills: this.kills });
    }
  }
  private publishHud(): void {
    this.game.events.emit('hud', { health: this.health, maxHealth:this.progression.stats.hp, level:this.progression.level, xp:this.progression.xp, allyMode:this.allyMode, allies:this.allies.countActive(), allyCapacity:(this.tactical?4:2)+this.companions.length, wave: this.wave, kills: this.kills, enemies: this.enemies.countActive() } satisfies Hud);
  }
}
