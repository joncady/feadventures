import {COMMANDERS,commanderDefinition,type CommanderId} from '../data/commanders';
import {healAmount,healingExperience,restoreHealth,selectHealingTarget} from '../systems/healing';
import {StageOne,STAGE_ONE} from '../systems/stage-one';
import Phaser from 'phaser';
import { ENEMY_TYPES, HEROES, HERO_PROFILES, HERO_SHEETS, isFlying, OBSTACLES, PLAYER_SPEED_SCALE, WORLD, type Hero } from '../data/config';
import {victoryReady,formatClock} from '../systems/mission-objective';
import { direction, inMeleeRange, validSpawn, waveSize, type Point } from '../systems/rules';
import { scaleDamage, resolveDamage, weaponAttackSound, weaponMatchup, withinWeaponRange, type WeaponType, type CombatWeapon, type EffectivenessTag } from '../systems/combat';
import {newGuard,updateGuard,guardedDamage,GUARD} from '../systems/guard';
import { BattleHud } from '../systems/BattleHud';
import { newProgress, type Progress, gainExperience, attackPower, attackCooldown, killExperience } from '../systems/progression';
import { actionFlipX } from '../data/animation-layout';
import { initialLoadout, equippedWeapon, cycleWeapon, weaponProfile, type Loadout, WEAPONS } from '../data/equipment';
import { unitDefinition, type UnitDefinition } from '../systems/unit-profile';
import { defaultDeployment } from '../data/battlefield';
import {getMap,type MapDefinition} from '../data/maps';
import {cloneMembers,type CampaignMember} from '../systems/campaign';
import { HERO_NAMES } from '../data/config';
import { NavigationField } from '../systems/navigation';
import {FollowFormation} from '../systems/follow-formation';

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
  private map:MapDefinition=getMap(2);
  private missionIndex:number|undefined;
  private missionGold=0;
  private treasuryGold=0;
  private goldPopup?:Phaser.GameObjects.Text;
  private goldPopupTotal=0;
  private goldCollectedAt=-Infinity;
  private objectiveReached=false;
  private objectiveMarker?:Phaser.GameObjects.Image;
  private camp?:Enemy;
  private planningGrid!:Phaser.GameObjects.Graphics;
  private stage=new StageOne();
  private releases:{at:number;camp:number;key:string;elite?:boolean}[]=[];
  private boss?:Enemy;
  private bossThresholds=new Set<number>();
  private battleClock=0;
  private deploymentCursor:Point={x:800,y:480};
  private deploymentGuide!:Phaser.GameObjects.Graphics;
  private tactical = false;
  private deploying = false;
  private party: Hero[] = [];
  private selectedDeployment: string = 'chrom';
  private deployment: Record<string,Point> = {};
  private partyStates = new Map<Hero,{health:number;progress:Progress;lastAttack:number;lastDamage:number;loadout:Loadout}>();
  private allyWarningAt = new Map<Hero,number>();
  private siegeWalls:Enemy[]=[];
  private siegeRoutes=new WeakMap<Enemy,NavigationField>();
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
  private followFormation=new FollowFormation();
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
  private touchMovement={x:0,y:0};
  private touchSelfHeal=false;
  private touchAim:Point|undefined;
  private touchGuard=false;
  private guard=newGuard();
  private guardGuide!:Phaser.GameObjects.Graphics;
  private actionAim: Point = { x: 1, y: 0 };
  private lastDamage = -Infinity;
  private spawning = 0;
  private fallenVoices = new Set<Hero>();
  private rallyUntil = 0;
  private rallyReadyAt = 0;
  private advancing = false;
  private ended = false;
  private playerShot: { aim: Point; at: number } | undefined;
  private aimGuide!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private telegraphs!: Phaser.GameObjects.Graphics;
  private navigation!: NavigationField;
  private brains = new WeakMap<Enemy, EnemyBrain>();
  constructor() { super('Arena'); }
  init(data: { hero?: Hero; companions?: Hero[]; tactical?:boolean;missionIndex?:number;members?:CampaignMember[];gold?:number }): void {
    this.fallenVoices.clear();this.rallyUntil=0;this.rallyReadyAt=0;this.missionIndex=data.missionIndex;this.map=getMap(data.missionIndex??2);this.missionGold=0;this.goldPopup=undefined;this.goldPopupTotal=0;this.goldCollectedAt=-Infinity;this.treasuryGold=data.gold??0;this.objectiveReached=false;this.objectiveMarker=undefined;
    this.tactical = data.tactical === true; this.deploying=this.tactical;
    this.width=this.tactical?this.map.width:WORLD.width;this.height=this.tactical?this.map.height:WORLD.height;this.terrain=this.tactical?[...this.map.terrain,...this.map.siegeWalls.map(w=>w.rect)]:OBSTACLES;
    this.hero = data.hero ?? 'chrom';
    this.companions = [...new Set(data.companions ?? [])].filter(h => h !== this.hero && HEROES.includes(h)).slice(0,3);
    this.party=[this.hero,...this.companions];this.selectedDeployment=this.hero;this.deployment=this.tactical?{}:defaultDeployment(this.party) as Record<string,Point>;this.partyStates.clear();this.campLabels=[];
    for(const h of this.party)this.partyStates.set(h,{health:100,progress:newProgress(),lastAttack:-Infinity,lastDamage:-Infinity,loadout:initialLoadout(h)});
    this.siegeRoutes=new WeakMap();this.siegeWalls=[];this.camp=undefined;this.battleClock=0;this.stage=new StageOne(this.missionIndex===undefined?STAGE_ONE:{waves:this.map.waves.count,waveMinimum:this.map.waves.minimumMs,releaseInterval:this.map.waves.releaseIntervalMs,intermission:this.map.waves.intermissionMs,bossWarning:8000,hostileCap:this.map.waves.hostileCap,bossHealth:this.map.waves.bossHealth});this.releases=[];this.boss=undefined;this.bossThresholds.clear();this.deploymentCursor=this.missionIndex===undefined?{x:480,y:352}:{x:this.map.courtyard.left+96,y:Math.max(this.map.courtyard.top+96,Math.min(this.map.courtyard.bottom-96,480))};
    if(data.members)for(const member of cloneMembers(data.members)){if(this.party.includes(member.hero))this.partyStates.set(member.hero,{...member,lastAttack:-Infinity,lastDamage:-Infinity});}
    this.allyWarningAt.clear();this.brains = new WeakMap(); this.targetFields.clear(); this.allyRoutes.clear();this.followFormation=new FollowFormation();
    this.guard=newGuard();this.touchGuard=false;this.touchAim=undefined;this.touchMovement={x:0,y:0};this.touchSelfHeal=false;
    this.playerShot = undefined; this.actionUntil = 0; this.pointerAim = undefined; this.pointerAttack = false;
    this.health = this.partyStates.get(this.hero)!.health; this.progression = this.partyStates.get(this.hero)!.progress; this.allyMode = 'defend'; this.wave = 1; this.kills = 0;
    this.facing = { x: 1, y: 0 }; this.keyboardFacing = { ...this.facing }; this.lastAttack = -Infinity;
    this.lastDamage = -Infinity; this.spawning = 0; this.advancing = false; this.ended = false;
  }
  create(): void {
    this.add.image(this.width / 2, this.height / 2, this.tactical?(this.missionIndex===undefined?'battlefield':this.map.backgroundKey):'map').setDisplaySize(this.width, this.height);
    this.physics.world.setBounds(0, 0, this.width, this.height);
    this.navigation = new NavigationField(this.width, this.height, this.terrain);
    this.walls = this.physics.add.staticGroup();
    for (const [x, y, width, height] of (this.tactical?this.map.terrain:this.terrain)) {
      const wall = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.walls.add(wall);
    }
    this.player = this.physics.add.sprite(190, 230, this.hero).setCollideWorldBounds(true).setDepth(10);
    this.player.setSize(28, 28).setOffset(11, 15);
    if(this.tactical){this.player.setVisible(false);this.player.body!.enable=false;}
    this.playerWeapon = this.add.image(0, 0, `weapon-${this.profile().weapon}`).setDisplaySize(16, 16).setDepth(21);
    this.flightShadow = this.add.ellipse(0, 0, 32, 12, 0x15201b, 0.4).setDepth(8).setVisible(false);
    if (isFlying(this.hero)) this.player.setDepth(12);
    this.enemies = this.physics.add.group();
    this.allies = this.physics.add.group();
    if(this.tactical&&['defend','survive'].includes(this.map.objective.kind)){this.camp=this.physics.add.sprite(this.map.heroCamp.x,this.map.heroCamp.y,'hero-camp').setDepth(5).setImmovable(true);(this.camp.body as Phaser.Physics.Arcade.Body).moves=false;this.add.text(this.map.heroCamp.x,this.map.heroCamp.y-62,this.map.objective.kind==='defend'?'VILLAGE':'KEEP',{fontFamily:'FE',fontSize:'12px',color:'#d8edff',backgroundColor:'#183e57'}).setOrigin(.5).setDepth(21);this.camp.setData({faction:'ally',weapon:'tome',health:this.map.heroCamp.health,maxHealth:this.map.heroCamp.health,defense:8,resistance:5});const field=new NavigationField(this.width,this.height,this.terrain);field.setTarget(this.bodyCenter(this.camp));this.targetFields.set(this.camp,field);}
    if(this.tactical)for(const section of this.map.siegeWalls){
      const [x,y,width,height]=section.rect;
      const wall=this.physics.add.sprite(x+width/2,y+height/2,'siege-wall').setDisplaySize(width,height).setImmovable(true).setAlpha(0);
      (wall.body as Phaser.Physics.Arcade.Body).moves=false;
      const art=this.add.tileSprite(wall.x,wall.y,width,height,'siege-wall').setDepth(6);
      wall.setData({structure:true,faction:'ally',weapon:'tome',health:section.health,maxHealth:section.health,defense:0,resistance:0,rect:section.rect,name:section.name,art});
      this.siegeWalls.push(wall);this.targetFields.set(wall,new NavigationField(this.width,this.height,this.terrain));
      this.physics.add.collider(this.player,wall,undefined,()=>!isFlying(this.hero));
      this.physics.add.collider(this.enemies,wall);
      this.physics.add.collider(this.allies,wall,undefined,(a,b)=>!this.unitFlying(a as Enemy)&&!this.unitFlying(b as Enemy));
      wall.once('destroy',()=>art.destroy());
    }
    this.pickups = this.physics.add.group();
    this.arrows = this.physics.add.group();
    this.physics.add.collider(this.arrows, this.walls, arrow => arrow.destroy());
    for(const wall of this.siegeWalls)this.physics.add.overlap(wall,this.arrows,(_wall,arrow)=>{const shot=arrow as Enemy;if(shot.getData('weapon')==='bow'){if(shot.getData('siegeTarget')===wall)this.projectileHit(shot,wall);}else if(shot.getData('faction')==='enemy')this.projectileHit(shot,wall);else shot.destroy();});
    if(this.camp)this.physics.add.overlap(this.camp,this.arrows,(_camp,arrow)=>this.projectileHit(arrow as Enemy,this.camp!));
    this.physics.add.overlap(this.player, this.arrows, (_player, arrow) => this.projectileHit(arrow as Enemy, this.player));
    this.physics.add.overlap(this.arrows, this.enemies, (arrow, target) => this.projectileHit(arrow as Enemy, target as Enemy));
    this.physics.add.overlap(this.arrows, this.allies, (arrow, target) => this.projectileHit(arrow as Enemy, target as Enemy));
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.allies, this.allies, undefined, (a,b) => this.unitFlying(a as Enemy) === this.unitFlying(b as Enemy));
    this.physics.add.collider(this.allies, this.enemies, undefined, (a,b) => !this.unitFlying(a as Enemy)&&!this.unitFlying(b as Enemy));
    this.physics.add.collider(this.player, this.allies, undefined, (a,b) => !this.tactical&&!this.unitFlying(a as Enemy)&&!this.unitFlying(b as Enemy));
    this.physics.add.collider(this.player, this.enemies, undefined, () => !isFlying(this.hero));
    // Resolve terrain last: crowd separation must not leave bodies inside walls.
    this.physics.add.collider(this.player, this.walls, undefined, () => !isFlying(this.hero));
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.allies, this.walls, undefined, (a,b) => !this.unitFlying(a as Enemy)&&!this.unitFlying(b as Enemy));
    this.physics.add.overlap(this.player, this.pickups, (_player, item) => {
      const pickup=item as Enemy;if(pickup.getData('gold')){this.missionGold+=pickup.getData('gold');this.game.events.emit('campaign-gold',this.missionGold);this.showGoldPickup(pickup.getData('gold'));}else {const before=this.health;this.health = Math.min(this.progression.stats.hp, this.health + 25);const restored=this.health-before;if(restored){this.showHealthGain(this.player,restored);this.feedback('confirm');}}item.destroy();this.publishHud();
    });
    const switchEquipment=()=>this.switchWeapon();this.game.events.on('ui-switch-weapon',switchEquipment);this.events.once('shutdown',()=>this.game.events.off('ui-switch-weapon',switchEquipment));
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,Q,E,R,SHIFT,CTRL') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    if(this.input.manager.pointers.length<4)this.input.addPointer(4-this.input.manager.pointers.length);
    this.input.mouse?.disableContextMenu();
    const touchMove=(point:Point)=>{this.touchMovement=point;};
    const touchAction=(action:string)=>{if(action==='guard-end'){this.touchGuard=false;return;}if(this.deploying||this.ended)return;if(action==='guard-start'){this.touchGuard=true;return;}if(action==='previous')this.switchCharacter(-1);else if(action==='next')this.switchCharacter(1);else if(action==='weapon')this.switchWeapon();else if(action==='rally')this.rallyCompanions();else if(action==='self-heal'&&this.profile().weapon==='staff'){this.touchSelfHeal=true;this.pointerAttack=true;}};
    const touchAim=(aim:Point|undefined)=>{if(!aim&&this.touchAim&&(this.touchAim.x||this.touchAim.y))this.keyboardFacing={...this.touchAim};this.touchAim=aim;if(aim)this.pointerAim=undefined;if(aim&&(aim.x||aim.y))this.keyboardFacing={...aim};};
    this.game.events.on('touch-aim',touchAim);
    this.game.events.on('touch-move',touchMove);this.game.events.on('touch-action',touchAction);
    this.events.once('shutdown',()=>{this.game.events.off('touch-aim',touchAim);this.game.events.off('touch-move',touchMove);this.game.events.off('touch-action',touchAction);});
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{if(!pointer.wasTouch)this.updatePointerAim(pointer);});
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over:Phaser.GameObjects.GameObject[]) => {
      if (over.length) return;
      if(this.deploying){const point=pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;if(!this.insideDeployment(point)){this.feedback('reject','Deploy inside the courtyard.');return;}this.deploymentCursor=this.clampDeploymentCursor(point);this.confirmDeployment();return;}
      if ((!pointer.wasTouch&&!pointer.leftButtonDown()) || this.ended || (!pointer.wasTouch&&this.profile().weapon === 'staff')) return;
      this.updatePointerAim(pointer); this.pointerAttack = true;
    });
    this.input.on('gameout', () => { this.pointerAim = undefined; this.pointerAttack = false;this.touchGuard=false; });
    this.events.on(Phaser.Scenes.Events.PAUSE, () => { this.touchAim=undefined;this.touchMovement={x:0,y:0};this.touchGuard=false;this.guard.active=false;this.guardGuide.clear(); this.pointerAim = undefined; this.pointerAttack = false; });
    this.planningGrid=this.add.graphics().setDepth(3);if(this.tactical){const c=this.map.courtyard;this.planningGrid.fillStyle(0x48aaff,.12).fillRect(c.left,c.top,c.right-c.left,c.bottom-c.top);this.planningGrid.lineStyle(1,0xb7d5e9,.35);for(let x=0;x<=this.width;x+=64)this.planningGrid.lineBetween(x,0,x,this.height);for(let y=0;y<=this.height;y+=64)this.planningGrid.lineBetween(0,y,this.width,y);}
    this.deploymentGuide=this.add.graphics().setDepth(24);
    this.aimGuide = this.add.graphics().setDepth(7);
    this.guardGuide=this.add.graphics().setDepth(24);
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
    if(this.tactical){this.objectiveMarker=this.add.image(this.map.objective.kind==='advance'?448:this.map.objective.x,this.map.objective.y,'objective-standard').setDisplaySize(30,40).setDepth(6);}
    this.spawnAllies();
    if(this.tactical){this.deploymentCursor=this.clampDeploymentCursor(this.deploymentCursor);const positions=Phaser.Utils.Array.Shuffle([...this.map.soldiers]);for(const [i,unit] of this.allies.getChildren().filter(a=>!a.getData('companionHero')).entries()){this.selectedDeployment=unit.getData('deploymentId');this.placeDeployment(positions[i]);}this.selectedDeployment=this.hero;if(!this.canDeploy(this.deploymentCursor)){const c=this.map.courtyard;outer:for(let y=c.top+32;y<c.bottom;y+=64)for(let x=c.left+32;x<c.right;x+=64)if(this.canDeploy({x,y})){this.deploymentCursor={x,y};break outer;}}}

    if(this.tactical){this.cameras.main.setBounds(0,0,this.width,this.height).setZoom(.7).centerOn(this.width/2,this.height/2);this.physics.pause();this.battleHud.setVisible(false);this.showCamps();this.game.events.emit('deployment',this.party);}
    else this.startWave();
    this.publishHud();
  }
  update(time: number,delta=0): void {
    if (this.ended) return;
    if(this.deploying){this.deploymentGuide.clear().fillStyle(0x48aaff,.3).fillRect(this.deploymentCursor.x-32,this.deploymentCursor.y-32,64,64).lineStyle(3,0x79bcff).strokeRect(this.deploymentCursor.x-32,this.deploymentCursor.y-32,64,64);this.drawHealthBars();this.publishTacticalMap();return;}
    if(this.tactical)this.battleClock+=delta;
    this.updateGoldPickups();
    if(this.rallyUntil && time>=this.rallyUntil)this.endRally();
    if(this.tactical&&Phaser.Input.Keyboard.JustDown(this.keys.R))this.rallyCompanions();
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.tactical?this.switchCharacter(-1):this.toggleAllyMode();
    if (this.tactical && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.switchCharacter(1);
    if (!isFlying(this.hero)) this.recoverFromTerrain(this.player);
    const horizontal = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown) + this.touchMovement.x;
    const vertical = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown) + this.touchMovement.y;
    const movement = direction(horizontal, vertical);
    const profile = this.profile();
    updateGuard(this.guard,this.touchGuard||this.keys.CTRL.isDown||this.input.activePointer.rightButtonDown(),delta,!this.playerShot&&time>=this.actionUntil);
    this.player.setVelocity(movement.x * (profile.speed*PLAYER_SPEED_SCALE+2*(this.progression.stats.speed-this.progression.base.speed)), movement.y * (profile.speed*PLAYER_SPEED_SCALE+2*(this.progression.stats.speed-this.progression.base.speed)));
    if (horizontal || vertical) this.keyboardFacing = movement;
    this.facing = { ...this.keyboardFacing };
    if (this.pointerAim && profile.weapon !== 'staff') {
      // Keep aiming at the screen cursor as the camera follows a retreating hero.
      if(!this.input.activePointer.wasTouch)this.updatePointerAim(this.input.activePointer);
      const origin = this.bodyCenter(this.player);
      const aim = direction(this.pointerAim.x - origin.x, this.pointerAim.y - origin.y);
      if (aim.x || aim.y) this.facing = aim;
    }
    if(this.touchAim&&(this.touchAim.x||this.touchAim.y))this.facing={...this.touchAim};
    if (HERO_SHEETS[this.hero].directional) {
      this.player.setFlipX(false);
      const row = this.directionName(horizontal || vertical ? movement : this.facing);
      if (this.playerShot || time < this.actionUntil) { this.player.setVelocity(movement.x * 90, movement.y * 90); this.player.setFlipX(actionFlipX(this.hero,(this.playerShot?.aim ?? this.actionAim).x)); }
      else if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk-${row}`, true);
      else { this.player.anims.play(`${this.hero}-idle`, true); this.player.setFlipX(false); }
    } else {
      if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk`, true);
      else this.player.anims.play(`${this.hero}-idle`, true);
      this.player.setFlipX(this.facing.x > 0);
    }
    if(this.tactical&&time-this.lastAttack<this.attackDelay()*.65)this.player.setVelocity(movement.x*profile.speed*PLAYER_SPEED_SCALE*.3,movement.y*profile.speed*PLAYER_SPEED_SCALE*.3);
    if(this.guard.active){this.player.setVelocity(movement.x*profile.speed*PLAYER_SPEED_SCALE*GUARD.speedMultiplier,movement.y*profile.speed*PLAYER_SPEED_SCALE*GUARD.speedMultiplier);this.player.anims.play(`${this.hero}-idle`,true);this.player.setFlipX(false);}
    this.drawGuard();
    const attackRequested = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.pointerAttack || !!this.touchAim;
    this.pointerAttack = false;
    if(attackRequested&&this.guard.active)this.feedback('reject');
    if(attackRequested && !this.touchAim && !this.guard.active && time-this.lastAttack<this.attackDelay())this.feedback('reject','Attack recovering — wait for the bar.');
    if (attackRequested && !this.guard.active && time - this.lastAttack >= this.attackDelay()) {
      if(profile.weapon==='staff'){if(this.castHeal(this.player))this.lastAttack=time;}else {this.lastAttack = time; this.attack();}
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
    this.touchSelfHeal=false;
    if(this.registry.get('touch-overlay-active'))this.battleHud.setVisible(false);
    this.battleHud.update(this.progression,this.health,this.wave,this.kills,this.tactical?'tactical':this.allyMode,this.allies.countActive(),this.weaponLoadout());
    if(this.tactical){this.updateStage(this.battleClock);if(!this.ended)this.publishTacticalMap();return;}
    if (this.spawning === 0 && this.enemies.countActive() === 0 && !this.advancing) {
      this.advancing = true;
      this.game.events.emit('notice', `Wave ${this.wave} cleared. Catch your breath…`);
      this.time.delayedCall(1600, () => { this.wave++; this.advancing = false; this.startWave(); });
    }
  }
  private combatTags(unit:Enemy):EffectivenessTag[] {const tags=[...(unit.getData('combatTags')??[])] as EffectivenessTag[];if(this.unitFlying(unit))tags.push('flying');const hero=unit===this.player?this.hero:unit.getData('companionHero');if(['frederick','stahl','sully'].includes(hero))tags.push('mounted');if(hero==='frederick'||['knight','heavy'].includes(unit.texture.key))tags.push('armored');return tags;}
  private drawGuard():void {this.guardGuide.clear();if(!this.guard.active&&!this.guard.broken)return;const origin=this.bodyCenter(this.player),angle=Math.atan2(this.facing.y,this.facing.x);if(this.guard.active)this.guardGuide.lineStyle(4,0xbce9ff,.9).beginPath().arc(origin.x,origin.y,34,angle-GUARD.halfArc,angle+GUARD.halfArc,false).strokePath();this.guardGuide.fillStyle(0x192d36,.85).fillRect(origin.x-24,origin.y+32,48,5).fillStyle(this.guard.broken?0xf1a46b:0xbce9ff,1).fillRect(origin.x-24,origin.y+32,48*this.guard.meter/GUARD.capacity,5);}
  private weaponLoadout():Loadout {return this.partyStates.get(this.hero)!.loadout;}
  private profile(){return weaponProfile(this.hero,this.weaponLoadout());}
  private feedback(kind:string,message?:string):void {this.game.events.emit('ux-feedback',{kind,message});}
  switchWeapon():boolean {
    if(this.deploying||this.ended||this.scene.isPaused())return false;
    if(this.playerShot||this.time.now<this.actionUntil){this.feedback('reject','Finish your current action before switching.');return false;}
    const readyAt=this.lastAttack+this.attackDelay();
    if(!cycleWeapon(this.weaponLoadout(),this.hero)){this.feedback('reject','No other weapon equipped.');return false;}
    this.feedback('confirm',`${this.profile().name} equipped`);
    // The next action may have a shorter base delay, but the old recovery must finish.
    this.lastAttack=Math.max(this.lastAttack,readyAt-this.attackDelay());
    this.partyStates.get(this.hero)!.lastAttack=this.lastAttack;
    this.playerWeapon.setTexture(this.profile().icon);this.pointerAttack=false;
    this.game.events.emit('notice',this.profile().weapon==='staff'?'Heal: Space / click for allies · Shift + Space for yourself':`${this.profile().name} equipped · F: next weapon / ability`);
    this.publishHud();return true;
  }
  private attackDelay():number {return attackCooldown(this.progression,this.hero,equippedWeapon(this.weaponLoadout()))*(this.tactical?2.4:1);}
  soundGain(point:Point):number {if(!this.player)return 1;const distance=Math.hypot(point.x-this.player.x,point.y-this.player.y);return distance<=160?1:Math.max(0,1-(distance-160)/640)**2;}
  selectSoldierDeployment():void {if(!this.deploying)return;const soldiers=this.allies.getChildren().filter(a=>!a.getData('companionHero'));if(!soldiers.length){this.feedback('reject','This mission has no NPC soldiers to place.');return;}const unit=soldiers.find(a=>!this.deployment[a.getData('deploymentId')])??soldiers[(soldiers.findIndex(a=>a.getData('deploymentId')===this.selectedDeployment)+1)%soldiers.length];this.selectedDeployment=unit.getData('deploymentId');this.game.events.emit('notice',`Place Soldier ${Number(this.selectedDeployment.split('-')[1])+1} on open terrain.`);}
  private clampDeploymentCursor(point:Point):Point {const c=this.map.courtyard;const snap=(value:number,low:number,high:number)=>Phaser.Math.Clamp(Math.floor(value/64)*64+32,Math.ceil((low+20-32)/64)*64+32,Math.floor((high-20-32)/64)*64+32);return {x:snap(point.x,c.left,c.right),y:snap(point.y,c.top,c.bottom)};}
  nudgeDeployment(dx:number,dy:number):void {if(!this.deploying)return;const previous=this.deploymentCursor;this.deploymentCursor=this.clampDeploymentCursor({x:previous.x+Math.sign(dx)*64,y:previous.y+Math.sign(dy)*64});if(previous.x!==this.deploymentCursor.x||previous.y!==this.deploymentCursor.y)this.feedback('cursor');else this.feedback('reject','Keep deployment inside the courtyard.');}
  confirmDeployment():boolean {if(!this.deploying)return false;const placedId=this.selectedDeployment;if(!this.placeDeployment(this.deploymentCursor))return false;this.feedback('confirm',`${HERO_NAMES[placedId as Hero]} deployed`);const ids:readonly string[]=this.party;const index=ids.indexOf(placedId);const next=[...ids.slice(index+1),...ids.slice(0,index+1)].find(id=>!this.deployment[id]);if(next){this.selectedDeployment=next;for(let n=0;n<40;n++){const c=this.map.courtyard;this.deploymentCursor=this.deploymentCursor.x+64>c.right-32?{x:c.left+32,y:this.deploymentCursor.y+64>c.bottom-32?c.top+32:this.deploymentCursor.y+64}:{x:this.deploymentCursor.x+64,y:this.deploymentCursor.y};if(this.canDeploy(this.deploymentCursor))break;}this.game.events.emit('notice',`Placed. Next: ${HERO_NAMES[next as Hero]??'Soldier '+(Number(next.split('-')[1])+1)}. WASD moves; Space places.`);}else this.game.events.emit('notice','Army ready. R or Begin battle starts stage one.');return true;}
  selectDeployment(hero:Hero):void { if(this.deploying && this.party.includes(hero)){this.feedback('cursor');this.selectedDeployment=hero;this.deploymentCursor=this.deployment[hero]??this.deploymentCursor;this.game.events.emit('notice',`Place ${HERO_NAMES[hero]} on open terrain.`);} }
  autoPlaceDeployment():number {
    if(!this.deploying||this.ended)return 0;
    const previous=this.selectedDeployment,c=this.map.courtyard;let placed=0;
    for(const hero of this.party){if(this.deployment[hero])continue;this.selectedDeployment=hero;
      outer:for(let y=c.top+32;y<c.bottom;y+=32)for(let x=c.left+32;x<c.right;x+=32){const point={x,y};if(this.canDeploy(point)){this.placeDeployment(point);placed++;break outer;}}
    }
    this.selectedDeployment=this.party.find(h=>!this.deployment[h])??previous;
    this.feedback(placed?'confirm':'reject',placed?`Deployed ${placed} heroes`:'No empty deployment cells');return placed;
  }
  private insideDeployment(point:Point):boolean {const c=this.map.courtyard;return point.x>=c.left+20&&point.x<=c.right-20&&point.y>=c.top+20&&point.y<=c.bottom-20;}
  private canDeploy(point:Point):boolean {
return this.insideDeployment(point) && (isFlying(this.selectedDeployment as Hero)?point.x>=20&&point.x<=this.width-20&&point.y>=20&&point.y<=this.height-20:this.navigation.isWalkable({x:point.x,y:point.y+4.5})) && !Object.entries(this.deployment).some(([hero,p])=>hero!==this.selectedDeployment && p && Phaser.Math.Distance.BetweenPoints(p,point)<64) && !this.map.camps.some(p=>Phaser.Math.Distance.BetweenPoints(p,point)<150) && (!this.camp||Phaser.Math.Distance.BetweenPoints(this.map.heroCamp,point)>=64);
  }
  private placeDeployment(point:Point):boolean {
    const valid=this.canDeploy(point);
    if(!valid){this.feedback('reject','Choose an empty courtyard cell.');this.game.events.emit('notice','Deploy inside the castle courtyard, away from the camp and other units.');return false;}
    const unit=this.selectedDeployment===this.hero?this.player:this.allies.getChildren().find(a=>(a.getData('companionHero')??a.getData('deploymentId'))===this.selectedDeployment) as Enemy;
    unit.setVisible(true);unit.body!.enable=true;unit.body!.reset(point.x,point.y);unit.body!.updateFromGameObject();unit.setData('home',{x:point.x,y:point.y});this.deployment[this.selectedDeployment]={x:point.x,y:point.y};
    this.game.events.emit('notice',`${HERO_NAMES[this.selectedDeployment as Hero]??'Soldier'} deployed. Select another unit or begin battle.`);return true;
  }
  private showCamps():void {
    for(const camp of this.map.camps){
      this.campLabels.push(this.add.circle(camp.x,camp.y,48,0x9c3434,.35).setStrokeStyle(3,0xe56565).setDepth(2));
      const planned:Record<string,number>={};for(let wave=1;wave<=this.stage.settings.waves;wave++)for(let batch=0;batch<(this.missionIndex===undefined?4:this.map.waves.batches??4);batch++){const key=camp.units[(batch+wave-1)%4];planned[key]=(planned[key]??0)+1;}const entries=Object.entries(planned).map(([key,n])=>`${n} ${key}`);const counts=[entries.slice(0,2).join(' · '),entries.slice(2).join(' · ')].filter(Boolean).join('\n');
      this.campLabels.push(this.add.text(Phaser.Math.Clamp(camp.x+(camp.x<this.width/2?-80:80),150,this.width-150),camp.y+(camp.y<600?100:-80),`${camp.name}\n${counts}`,{fontFamily:'FE',fontSize:'18px',color:'#fff0c6',backgroundColor:'#522c2c',align:'center',lineSpacing:3,padding:{x:6,y:4}}).setResolution(3).setOrigin(.5).setDepth(22));

    }
    this.game.events.emit('notice',`${this.map.title}: ${this.map.objective.label}. WASD + Space deploys heroes in blue cells.`);
  }
  launchBattle():boolean {
    if(!this.deploying || this.ended)return false;
    if(this.party.some(h=>!this.deployment[h])||this.allies.getChildren().some(a=>!this.deployment[a.getData('companionHero')??a.getData('deploymentId')])){this.feedback('reject','Place every hero before beginning.');this.game.events.emit('notice','Place every party member before beginning. Soldiers are already deployed.');return false;}
    this.deploying=false;this.deploymentGuide.clear().setVisible(false);this.planningGrid.clear().setVisible(false);this.battleClock=0;this.stage.start(0);for(const object of this.campLabels)object.destroy();this.campLabels=[];
    this.cameras.main.setZoom(1).startFollow(this.player,true,.12,.12).setDeadzone(180,100);
    this.physics.resume();this.input.keyboard?.resetKeys();this.pointerAim=undefined;this.pointerAttack=false;
    this.battleHud.destroy();this.battleHud=new BattleHud(this,this.hero,()=>this.switchCharacter(1));this.battleHud.synchronize(this.progression);
    this.game.events.emit('notice',`${this.map.title} begins in 5 seconds. ${this.map.objective.label}.`);this.publishHud();return true;
  }
  private campSpawnPoint(index:number):Point|undefined {
    const camp=this.map.camps[index];
    const offsets=[[0,0],[-80,0],[80,0],[0,80],[0,-80],[-80,80],[80,80],[-160,0],[160,0],[0,160],[0,-160]];
    const assault=this.missionIndex!==undefined&&this.map.id==='dark-castle';
    const candidates=offsets.map(([x,y])=>({x:camp.x+x,y:camp.y+y}));
    if(this.map.id==='east-road')candidates.push(...[192,272,352].flatMap(y=>[{x:40,y},{x:this.width-40,y}]));
    if(this.map.id==='village')candidates.push({x:512,y:40},{x:512,y:this.height-40},...[176,528].flatMap(y=>[{x:40,y},{x:this.width-40,y}]));
    if(assault)candidates.push(...[96,this.height-96].flatMap(y=>[{x:128,y},{x:this.width-128,y}]));
    else candidates.push({x:camp.x<this.width/2?40:this.width-40,y:40},{x:camp.x<this.width/2?40:this.width-40,y:this.height-40});
    const view=this.cameras.main.worldView,margin=this.missionIndex===1?24:assault?32:70;
    return candidates.find(p=>this.navigation.isWalkable(p)&&!(p.x>view.x-margin&&p.x<view.right+margin&&p.y>view.y-margin&&p.y<view.bottom+margin)&&![this.player,...this.allies.getChildren(),...this.enemies.getChildren()].some(a=>a.active&&Phaser.Math.Distance.Between(p.x,p.y,(a as Enemy).x,(a as Enemy).y)<52));
  }
  private updateStage(now:number):void {
    const ready=this.releases.find(r=>now>=r.at&&this.campSpawnPoint(r.camp));
    if(ready&&this.enemies.countActive()<this.stage.settings.hostileCap){
      const point=this.campSpawnPoint(ready.camp);
      if(point){const unit=this.createHostile(point.x,point.y,ready.key);if(ready.elite){unit.setData({level:3,health:Math.round(unit.getData('health')*1.5),maxHealth:Math.round(unit.getData('maxHealth')*1.5),damage:Math.round(unit.getData('damage')*1.25)});unit.setTint(0xe8b4ff);}this.releases.splice(this.releases.indexOf(ready),1);}
    }
    if(this.boss?.active){
      const commander=this.map.commander;
      const thresholds=commander==='validar'?[.5]:commander==='gangrel'?[.5]:[.75,.4];
      for(const threshold of thresholds)if(this.boss.getData('health')<=this.stage.settings.bossHealth*threshold&&!this.bossThresholds.has(threshold)){this.bossThresholds.add(threshold);const guards=commander==='gangrel'?['soldier','archer']:commander==='validar'?['knight','mage','knight']:this.missionIndex===undefined?['knight','mage','axeman','knight','mage','axeman']:['knight','axeman'];guards.forEach((key,i)=>this.releases.push({at:now+1500*(i+1),camp:1,key,elite:true}));this.game.events.emit('notice',commander?`${COMMANDERS[commander].name} calls guards!`:'Commander calls reinforcements!');}
      this.releases.sort((a,b)=>a.at-b.at);
    }
    const clear=this.releases.length===0&&this.enemies.countActive()===0&&!this.arrows.getChildren().some(a=>a.getData('faction')==='enemy');
    const campaignWaveReady=this.missionIndex!==undefined&&this.map.objective.victory!=='defeat-all'&&this.stage.phase==='wave'&&this.releases.length===0&&(this.map.objective.kind!=='advance'||this.player.x>=[448,832,1120][Math.min(2,this.stage.wave-1)]-24);
    const commanderDefeated=this.missionIndex!==undefined&&this.stage.phase==='boss'&&!!this.boss&&!this.boss.active;
    if(commanderDefeated&&this.map.objective.victory!=='defeat-all')this.releases=[];
    const bossEntryBlocked=this.stage.phase==='boss-warning'&&(this.enemies.countActive()>=this.stage.settings.hostileCap||this.map.objective.kind!=='boss'&&!this.campSpawnPoint(1));
    const change=bossEntryBlocked?undefined:this.stage.advance(now,clear||campaignWaveReady||(commanderDefeated&&this.map.objective.victory!=='defeat-all'));
    if(change==='wave'){
      this.wave=this.stage.wave;this.game.events.emit('notice',`Wave ${this.wave}/${this.stage.settings.waves}. ${this.map.objective.kind==='advance'?`Advance east to ${['the road bend','the village approach','the eastern exit'][Math.min(2,this.wave-1)]}`:this.map.objective.label}.`);
      if(this.map.objective.kind==='advance')this.objectiveMarker?.setPosition([448,832,1120][Math.min(2,this.wave-1)],this.map.objective.y);
      for(let batch=0;batch<(this.missionIndex===undefined?4:this.map.waves.batches??4);batch++)for(let camp=0;camp<4;camp++)this.releases.push({at:now+batch*this.stage.settings.releaseInterval+camp*500,camp,key:this.map.camps[camp].units[(batch+this.wave-1)%4]});
    }else if(change==='rest')this.game.events.emit('notice',this.missionIndex===undefined?'Fronts cleared. Regroup: next wave in 10 seconds.':`Reinforcements arrive in ${Math.ceil(this.stage.settings.intermission/1000)} seconds. Hold your positions.`);
    else if(change==='boss-warning')this.game.events.emit('notice',this.map.commander?`${COMMANDERS[this.map.commander].name} approaches · 8s`:this.map.objective.kind==='boss'?'The final commander enters the throne room in 8 seconds!':'The siege commander approaches the northeast camp in 8 seconds!');
    else if(change==='boss'){
      // Earlier attackers remain in the field when the commander arrives.
      const point=this.map.objective.kind==='boss'?{x:this.map.objective.x,y:this.map.objective.y}:this.campSpawnPoint(1)!;
      const id=this.map.commander,profile=id?COMMANDERS[id]:undefined;
      this.boss=this.createHostile(point.x,point.y,id??'heavy');
      this.boss.setData({boss:true,commanderId:id,strikes:0,level:profile?.level??5,health:this.stage.settings.bossHealth,maxHealth:this.stage.settings.bossHealth,defense:profile?.defense??8,resistance:profile?.resistance??5,speed:profile?.speed??55,damage:profile?.damage??32});
      if(!id)this.boss.setScale(1.3).setTint(0xffca85);
      this.game.events.emit('notice',id?`${profile!.name} · ${profile!.title}`:this.missionIndex===undefined?'Outskirts Commander! Defeat the commander and every remaining minion.':'Defeat the commander to break the enemy army.');
    }
    if(this.stage.phase==='complete'){
      const exitReached=Phaser.Math.Distance.BetweenPoints(this.player,this.map.objective)<=this.map.objective.radius;
      const won=this.missionIndex===undefined?clear:victoryReady(this.map.objective.victory,{phase:this.stage.phase,enemies:this.enemies.countActive(),pending:this.releases.length,commanderDefeated,exitReached,objectiveAlive:!!this.camp?.active&&this.camp.getData('health')>0});
      if(won)this.finishTactical(true);
      else if(this.map.objective.kind==='advance'&&!this.objectiveReached){this.objectiveReached=true;this.game.events.emit('notice','Ambush waves survived. Reach the eastern exit to complete the mission.');}
    }
    this.spawning=this.releases.length;
  }
  private createHostile(x:number,y:number,key:string):Enemy {
    const type=COMMANDERS[key as CommanderId]??ENEMY_TYPES.find(t=>t.key===key)!;const enemy=this.enemies.create(x,y,key) as Enemy;
    enemy.setSize(28,28).setOffset(11,15).setCollideWorldBounds(true).setDepth(9);enemy.body!.updateFromGameObject();
    const icon=this.add.image(x,y,`weapon-${type.weapon}`).setDisplaySize(16,16).setDepth(21);
    const health=Math.round(('health' in type?Number(type.health):100)*(this.missionIndex===undefined?1:this.map.waves.healthScale??1));
    const marker=this.add.text(x,y,'',{fontFamily:'FE',fontSize:'11px',backgroundColor:'#15201b'}).setDepth(21);enemy.setData({weaponIcon:icon,weaponMarker:marker,weapon:type.weapon,defense:type.defense,resistance:type.resistance,health,maxHealth:health,speed:type.speed,damage:Math.round(type.damage*(this.missionIndex===undefined?1:this.map.waves.damageScale)),level:this.missionIndex===undefined?1:this.missionIndex+1});enemy.once('destroy',()=>{marker.destroy();icon.destroy();});return enemy;
  }
  private switchCharacter(step:number):boolean {
    if(!this.tactical || this.deploying || this.ended)return false;
    const previous=this.hero,state=this.partyStates.get(previous)!;state.health=this.health;state.lastAttack=this.lastAttack;state.lastDamage=this.lastDamage;
    const index=this.party.indexOf(previous);let hero:Hero|undefined;
    for(let n=1;n<this.party.length;n++){const candidate=this.party[(index+step*n+this.party.length*2)%this.party.length];if(this.partyStates.get(candidate)!.health>0){hero=candidate;break;}}
    if(!hero){this.feedback('reject','No other living companion to control.');return false;}
    const ally=this.allies.getChildren().find(a=>a.getData('companionHero')===hero) as Enemy|undefined;if(!ally)return false;
    const autoPrior=ally.getData('autoHealPrior') as number|undefined;if(autoPrior!==undefined)this.setCompanionSlot(ally,autoPrior);ally.setData({autoHealPrior:undefined,autoHealReadyAt:undefined});
    const next=this.partyStates.get(hero)!;next.health=ally.getData('health');const nextBrain=this.brains.get(ally);if(nextBrain)next.lastAttack=Math.max(next.lastAttack,nextBrain.nextAttackAt-attackCooldown(next.progress,hero,equippedWeapon(next.loadout))*2.4);
    const from={x:this.player.x,y:this.player.y},to={x:ally.x,y:ally.y};const shot=this.playerShot;
    this.hero=hero;this.health=next.health;this.progression=next.progress;this.lastAttack=next.lastAttack;this.lastDamage=next.lastDamage;
    this.player.setTexture(hero).setFlipX(false).clearTint().setDepth(isFlying(hero)?12:10).setSize(28,28).setOffset(11,15);this.player.body!.reset(to.x,to.y);this.player.body!.updateFromGameObject();this.player.setVelocity(0);this.player.anims.play(`${hero}-idle`);
    ally.setTexture(previous).setFlipX(false).setDepth(isFlying(previous)?12:9).setSize(28,28).setOffset(11,15);ally.body!.reset(from.x,from.y);ally.body!.updateFromGameObject();ally.setVelocity(0);
    const p=weaponProfile(previous,state.loadout);ally.setData({companionHero:previous,flying:isFlying(previous),weapon:p.weapon,health:state.health,maxHealth:state.progress.stats.hp,progression:state.progress,loadout:state.loadout,damage:attackPower(state.progress,previous,equippedWeapon(state.loadout)),speed:p.speed*PLAYER_SPEED_SCALE+2*(state.progress.stats.speed-state.progress.base.speed),defense:state.progress.stats.def,resistance:state.progress.stats.res,home:this.deployment[previous],pendingShot:shot,nextAttackAt:state.lastAttack+attackCooldown(state.progress,previous,equippedWeapon(state.loadout))*2.4});
    (ally.getData('weaponIcon') as Phaser.GameObjects.Image).setTexture(`weapon-${p.weapon}`);this.playerWeapon.setTexture(`weapon-${this.profile().weapon}`);
    this.brains.delete(ally);for(const unit of [...this.enemies.getChildren(),...this.allies.getChildren()]){const brain=this.brains.get(unit as Enemy);if(brain?.targetUnit===this.player)brain.targetUnit=ally;else if(brain?.targetUnit===ally)brain.targetUnit=this.player;}
    if(state.health<=0)ally.destroy();else ally.anims.play(`${previous}-idle`);
    this.playerShot=undefined;this.actionUntil=0;this.pointerAim=undefined;this.pointerAttack=false;this.guard=newGuard();this.touchGuard=false;this.touchAim=undefined;this.touchMovement={x:0,y:0};this.touchSelfHeal=false;this.guardGuide.clear();this.facing={x:1,y:0};this.keyboardFacing={...this.facing};
    this.battleHud.destroy();this.battleHud=new BattleHud(this,hero,()=>this.switchCharacter(1));this.battleHud.synchronize(this.progression);
    this.feedback('confirm',`${HERO_NAMES[hero]} · controlling`);this.game.events.emit('controlled-character',hero);this.game.events.emit('hero-voice',{hero,event:'select'});this.publishHud();return true;
  }
  private finishTactical(victory:boolean,reason?:string):void {
    if(this.ended)return;for(const unit of this.allies.getChildren() as Enemy[]){const prior=unit.getData('autoHealPrior') as number|undefined;if(prior!==undefined)this.setCompanionSlot(unit,prior);}this.ended=true;this.guard.active=false;this.touchGuard=false;this.guardGuide.clear();this.releases=[];this.playerShot=undefined;this.arrows.clear(true,true);this.physics.pause();this.time.removeAllEvents();this.aimGuide.clear();this.telegraphs.clear();this.partyStates.get(this.hero)!.health=this.health;const members=this.party.map(hero=>{const state=this.partyStates.get(hero)!;return {hero,health:state.health,progress:state.progress,loadout:state.loadout};});const victoryReason=victory?(this.map.objective.victory==='defeat-all'?'All enemy forces defeated.':this.map.objective.kind==='advance'?'Eastern exit reached. The party escaped the ambushes.':this.map.objective.kind==='defend'?this.map.commander?`${COMMANDERS[this.map.commander].name} defeated. The village stands.`:'Three attacks survived. The raiders withdraw; the village stands.':this.map.objective.kind==='survive'?this.map.commander?`${COMMANDERS[this.map.commander].name} defeated. The remaining attackers retreat.`:'Siege commander defeated. The remaining attackers retreat.':this.map.commander?`${COMMANDERS[this.map.commander].name} defeated. The remaining guards surrender.`:'Keep commander defeated. The remaining guards surrender.'):reason;this.game.events.emit('game-over',{wave:this.wave,kills:this.kills,victory,reason:victoryReason,missionIndex:this.missionIndex,members:cloneMembers(members),gold:this.missionGold,elapsed:Math.floor(this.battleClock/1000),heldKeys:this.keys.SPACE.isDown?['Space']:[]});
  }
  private objectiveStatus():string {
    const phase=this.stage.phase,condition=this.map.objective.victory;
    const label=(condition==='hold-waves'||condition==='defend-commander')?'Protect village':condition==='reach-exit'?'Reach eastern exit':condition==='defeat-all'?'Defeat all enemies':this.map.objective.kind==='survive'?'Defend keep':'Defeat commander';
    const remaining=Math.max(0,Math.ceil(((phase==='wave'?this.stage.waveStarted+this.stage.settings.waveMinimum:this.stage.deadline)-this.battleClock)/1000));
    if(phase==='wave')return `${label} · ${this.stage.wave}/${this.stage.settings.waves} · ${remaining>0?formatClock(remaining):this.releases.length?'Reinforcements incoming':'Advance'}`;
    if(phase==='opening')return `${label} · Begins ${formatClock(remaining)}`;
    if(phase==='rest')return `${label} · Next attack ${formatClock(remaining)}`;
    if(phase==='boss-warning')return remaining>0?`Commander arrives · ${formatClock(remaining)}`:'Commander approaching';
    if(phase==='boss'&&condition==='defeat-all')return `Defeat all enemies · ${this.enemies.countActive()} + ${this.releases.length} incoming`;
    if(phase==='boss')return `Defeat ${this.map.commander?COMMANDERS[this.map.commander].name:'commander'}${this.boss?.active?` · HP ${Math.max(0,this.boss.getData('health'))}/${this.boss.getData('maxHealth')}`:''}`;
    return condition==='reach-exit'?'Reach eastern exit · Ambush waves survived':`${label} · ${this.enemies.countActive()} remaining`;
  }
  private publishTacticalMap():void {
    const camera=this.cameras.main;
    this.game.events.emit('tactical-map',{goal:this.objectiveMarker?{x:this.objectiveMarker.x,y:this.objectiveMarker.y}:{x:this.map.heroCamp.x,y:this.map.heroCamp.y},rally:{active:this.rallyUntil>this.time.now,remaining:Math.max(0,Math.ceil((this.rallyUntil-this.time.now)/1000)),cooldown:Math.max(0,Math.ceil((this.rallyReadyAt-this.time.now)/1000)),available:!this.deploying&&this.time.now>=this.rallyReadyAt},missionIndex:this.missionIndex,title:this.map.title,objective:this.map.objective.label,objectiveStatus:this.objectiveStatus(),gold:this.treasuryGold+this.missionGold,totalWaves:this.stage.settings.waves,width:this.width,height:this.height,deploying:this.deploying,selected:this.selectedDeployment,party:this.party.map(hero=>{const state=this.partyStates.get(hero)!;const health=hero===this.hero?this.health:state.health;return {hero,placed:!!this.deployment[hero],health,maxHealth:state.progress.stats.hp,level:state.progress.level,xp:state.progress.xp,equippedWeaponId:equippedWeapon(state.loadout).id};}),camp:this.camp?.active?{health:this.camp.getData('health'),maxHealth:this.camp.getData('maxHealth')}:undefined,cooldown:{fraction:Phaser.Math.Clamp((this.time.now-this.lastAttack)/this.attackDelay(),0,1),remaining:Math.max(0,(this.lastAttack+this.attackDelay()-this.time.now)/1000),recovering:this.time.now-this.lastAttack<this.attackDelay()*.65},stagePhase:this.stage.phase,wave:this.stage.wave,remaining:Math.max(0,Math.ceil(((this.stage.phase==='wave'?this.stage.waveStarted+this.stage.settings.waveMinimum:this.stage.deadline)-this.battleClock)/1000)),elapsed:Math.floor(this.battleClock/1000),pending:this.releases.length,boss:this.boss?.active?{id:this.map.commander,name:this.map.commander?COMMANDERS[this.map.commander].name:'Commander',title:this.map.commander?COMMANDERS[this.map.commander].title:'',phase:this.brains.get(this.boss)?.phase??'chase',enraged:this.map.commander==='validar'&&this.boss.getData('health')/this.boss.getData('maxHealth')<=.5,health:this.boss.getData('health'),maxHealth:this.boss.getData('maxHealth')}:undefined,controlled:this.hero,controlledPosition:this.player.visible?{x:this.player.x,y:this.player.y}:undefined,placed:Object.keys(this.deployment).length,total:this.party.length+this.map.soldierCount,allies:[...(this.player.visible?[{x:this.player.x,y:this.player.y}]:[]),...this.allies.getChildren().filter(a=>(a as Enemy).visible).map(a=>({x:(a as Enemy).x,y:(a as Enemy).y}))],enemies:this.enemies.getChildren().filter(a=>this.cameras.main.worldView.contains((a as Enemy).x,(a as Enemy).y)).map(a=>({x:(a as Enemy).x,y:(a as Enemy).y})),camera:{x:camera.worldView.x,y:camera.worldView.y,width:camera.worldView.width,height:camera.worldView.height}});
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
  private awardExperience(key:string,enemyLevel=1):void {
    if(this.tactical){
      this.partyStates.get(this.hero)!.health=this.health;
      for(const [hero,state] of this.partyStates){if(state.health<=0)continue;const amount=Math.max(1,Math.floor(killExperience(state.progress.level,enemyLevel,key)*(this.missionIndex===undefined?1:.15))),hp=state.progress.stats.hp;const gains=gainExperience(state.progress,hero,amount);state.health+=state.progress.stats.hp-hp;if(hero===this.hero){this.health=state.health;this.battleHud.gain(amount,gains);}else{const ally=this.allies.getChildren().find(a=>a.getData('companionHero')===hero) as Enemy|undefined;ally?.setData({health:state.health,maxHealth:state.progress.stats.hp,defense:state.progress.stats.def,resistance:state.progress.stats.res,damage:attackPower(state.progress,hero,equippedWeapon(state.loadout)),speed:HERO_PROFILES[hero].speed*PLAYER_SPEED_SCALE+2*(state.progress.stats.speed-state.progress.base.speed)});}}
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
  rallyCompanions():boolean {
    if(!this.tactical||this.deploying||this.ended)return false;
    if(!(this.allies.getChildren() as Enemy[]).some(u=>u.active&&u.getData('companionHero')&&u.getData('health')>0)){this.feedback('reject','No living companions to rally.');return false;}
    if(this.time.now<this.rallyReadyAt){this.feedback('reject',`Rally ready in ${Math.ceil((this.rallyReadyAt-this.time.now)/1000)}s`);return false;}
    this.rallyUntil=this.time.now+10000;this.rallyReadyAt=this.time.now+20000;
    for(const unit of this.allies.getChildren() as Enemy[])if(unit.getData('companionHero')){unit.setData({retaliation:undefined,rallyEngagement:undefined,rallyReturning:false});this.brains.delete(unit);}
    this.game.events.emit('hero-voice',{hero:this.hero,event:'rally'});
    this.feedback('confirm','Companions rally to you for 10 seconds');return true;
  }
  private endRally():void {
    this.rallyUntil=0;
    // Finish fighting around the gathered position, without chasing beyond its original AOE.
    // Once that pocket is clear, the normal post anchor takes over at walking speed.
    for(const unit of this.allies.getChildren() as Enemy[])if(unit.active&&unit.getData('companionHero'))unit.setData('rallyEngagement',this.bodyCenter(unit));
    this.game.events.emit('notice','Rally ended — companions finish nearby engagements.');
  }
  private rallying(unit:Enemy):boolean {return this.rallyUntil>this.time.now&&!!unit.getData('companionHero');}
  private allyAnchor(unit:Enemy):Point {
    if(this.rallying(unit)){const center=this.bodyCenter(this.player),slot=this.party.indexOf(unit.getData('companionHero'));const offsets=[{x:-84,y:-60},{x:86,y:44},{x:-44,y:90},{x:72,y:-82}];const offset=offsets[Math.max(0,slot)%offsets.length];const target={x:Phaser.Math.Clamp(center.x+offset.x,24,this.width-24),y:Phaser.Math.Clamp(center.y+offset.y,24,this.height-24)};return this.unitFlying(unit)?target:this.navigation.recoveryPoint(target)??target;}

    const holds=this.tactical&&(this.map.companionBehavior==='hold'||(this.missionIndex===undefined&&!unit.getData('companionHero')));
    if(holds){
      const origin=this.bodyCenter(unit),home=unit.getData('home') as Point??origin;
      const engagement=unit.getData('rallyEngagement') as Point|undefined;
      const threats=(anchor:Point,radius:number)=>(this.enemies.getChildren() as Enemy[]).some(enemy=>enemy.active&&enemy.getData('health')>0&&Phaser.Math.Distance.BetweenPoints(anchor,this.bodyCenter(enemy))<=radius);
      if(engagement){if(threats(engagement,this.map.companionRadius))return engagement;unit.setData({rallyEngagement:undefined,rallyReturning:true});}
      if(unit.getData('rallyReturning')){
        if(Phaser.Math.Distance.BetweenPoints(origin,home)<=32)unit.setData('rallyReturning',false);
        else if(threats(origin,140)){unit.setData('rallyEngagement',origin);return origin;}
      }
      return home;
    }
    const center=this.bodyCenter(this.player);if(this.missionIndex===undefined)return center;
    const hero=unit.getData('companionHero') as Hero|undefined;const slot=hero?this.party.indexOf(hero):this.party.length+Number(String(unit.getData('deploymentId')).split('-')[1]??0);
    const anchor=this.followFormation.anchor(this.followIdentity(unit),slot,center,this.time.now);const target={x:Phaser.Math.Clamp(anchor.x,24,this.width-24),y:Phaser.Math.Clamp(anchor.y,24,this.height-24)};return this.unitFlying(unit)?target:this.navigation.recoveryPoint(target)??target;
  }
  private followIdentity(unit:Enemy):string {return unit.getData('companionHero')??unit.getData('deploymentId')??unit.name;}
  private following(unit:Enemy,origin:Point,target:Point):boolean {return this.tactical&&this.missionIndex!==undefined&&this.map.companionBehavior==='follow'?this.followFormation.moving(this.followIdentity(unit),origin,target):Phaser.Math.Distance.BetweenPoints(origin,target)>(this.tactical?16:70);}
  private followSpeed(unit:Enemy,origin:Point,target:Point):number {const distance=Phaser.Math.Distance.BetweenPoints(origin,target);return unit.getData('speed')*(this.missionIndex!==undefined&&this.map.companionBehavior==='follow'?Phaser.Math.Clamp(distance/130,.45,.94):this.tactical&&unit.getData('companionHero')&&!this.rallying(unit)?Phaser.Math.Clamp(distance/130,.45,.75):1);}
  private retaliationRadius(unit:Enemy):number {return this.tactical&&this.map.companionBehavior==='hold'?(unit.getData('companionHero')?this.map.companionRadius:Math.min(300,this.map.companionRadius)):480;}
  private chooseTarget(unit: Enemy, current?: Enemy): Enemy | undefined {
    if(this.enemyWeapon(unit)==='staff')return undefined;
    if(this.rallying(unit)&&Phaser.Math.Distance.BetweenPoints(this.bodyCenter(unit),this.allyAnchor(unit))>150)return undefined;
    const retaliation=unit.getData('retaliation') as {unit:Enemy;until:number}|undefined;
    if(retaliation){const anchor=this.allyAnchor(unit);if(retaliation.until>this.time.now&&retaliation.unit.active&&retaliation.unit.getData('health')>0&&Phaser.Math.Distance.BetweenPoints(anchor,this.bodyCenter(retaliation.unit))<=this.retaliationRadius(unit))return retaliation.unit;unit.setData('retaliation',undefined);}
    let targets = this.faction(unit) === 'ally'
      ? this.enemies.getChildren() as Enemy[]
      : [this.player, ...this.allies.getChildren() as Enemy[],...(this.camp?.active?[this.camp]:[]),...this.siegeWalls.filter(w=>w.active)];
    const origin = this.bodyCenter(unit);
    if(this.faction(unit)==='ally' && (this.tactical || this.allyMode==='defend')) {
      const anchor=this.allyAnchor(unit);
      const radius=this.tactical?(unit.getData('companionHero')?this.map.companionRadius:550):160;
      const loadout=unit.getData('loadout') as Loadout|undefined;const ranged=this.enemyWeapon(unit)==='bow'||this.enemyWeapon(unit)==='tome';const reach=loadout?equippedWeapon(loadout).range:unitDefinition(unit.texture.key).attack.range;
      targets=targets.filter(target=>(Phaser.Math.Distance.BetweenPoints(anchor,this.bodyCenter(target))<=radius||(this.tactical&&ranged&&Phaser.Math.Distance.BetweenPoints(origin,this.bodyCenter(target))<=reach)) && Phaser.Math.Distance.BetweenPoints(origin,anchor)<=(this.tactical?radius+32:200));
    }
    let living = targets.filter(target => target.active && (target === this.player ? !this.ended : target.getData('health') > 0));
    if (this.faction(unit) === 'enemy' && living.some(target => this.unitFlying(target) && !this.navigation.isWalkable(this.bodyCenter(target)))) {
      const reachable = living.filter(target => this.navigation.isWalkable(this.bodyCenter(target)) && (target===this.player ? this.navigation.hasRoute(origin) : this.targetFields.get(target)?.hasRoute(origin)));
      if(reachable.length)living=reachable;
    }
    if(this.tactical&&!this.unitFlying(unit)){
      let field=this.siegeRoutes.get(unit);if(!field){field=new NavigationField(this.width,this.height,this.terrain);this.siegeRoutes.set(unit,field);}field.setTarget(origin);
      const ranged=this.enemyWeapon(unit)==='bow'||this.enemyWeapon(unit)==='tome';
      if(this.faction(unit)==='enemy'){
        const reachable=living.filter(t=>field.hasRoute(this.bodyCenter(t)));
        if(!reachable.length){living=this.siegeWalls.filter(w=>w.active&&field.hasRoute(this.structureTarget(w,origin)));}
        else living=reachable;
      }else if(!ranged)living=living.filter(t=>field.hasRoute(this.bodyCenter(t)));
    }
    const distance = (target: Enemy) => Phaser.Math.Distance.BetweenPoints(origin, this.bodyCenter(target));
    let best = living.reduce<Enemy | undefined>((a, b) => !a || distance(b) < distance(a) ? b : a, undefined);
    if(this.tactical&&this.faction(unit)==='enemy'&&best&&!best.getData('structure')&&!this.hasLineOfSight(origin,this.bodyCenter(best))){
      const nearby=this.siegeWalls.filter(w=>w.active&&Phaser.Math.Distance.BetweenPoints(origin,this.structureTarget(w,origin))<100).sort((a,b)=>Phaser.Math.Distance.BetweenPoints(origin,this.structureTarget(a,origin))-Phaser.Math.Distance.BetweenPoints(origin,this.structureTarget(b,origin)))[0];if(nearby)best=nearby;
    }
    // Keep a living target unless another is meaningfully closer; avoid crowd target flicker.
    if (current && living.includes(current) && best && !best.getData('structure') && distance(current) <= distance(best) + 40) best = current;
    return best;
  }
  private projectileHit(arrow: Enemy, target: Enemy): void {
    if (!arrow.active || !target.active) return;
    const faction = arrow.getData('faction');
    if ((faction === 'enemy') === (this.faction(target) === 'enemy')) return;
    const distance = Phaser.Math.Distance.BetweenPoints(arrow.getData('origin') as Point, this.bodyCenter(arrow));
    if (!withinWeaponRange(distance, arrow.getData('minRange'), arrow.getData('maxRange'))) return;
    const healthBefore=target===this.player?this.health:target.getData('health');
    if (target === this.player) this.takeDamage(arrow.getData('damage'), arrow.getData('weapon'),arrow.getData('origin'));
    else this.damageEnemy(target, arrow.getData('damage'), arrow.getData('weapon'),faction,arrow.getData('attackingHero'),arrow.getData('source'),WEAPONS[arrow.getData('weaponId')]);
    const drain=WEAPONS[arrow.getData('weaponId')]?.drain??0;
    if(drain&&arrow.getData('attackingHero')){const hero=arrow.getData('attackingHero') as Hero;const restored=Math.round(Math.max(0,healthBefore-Math.max(0,target===this.player?this.health:target.active?target.getData('health'):0))*drain);const state=this.partyStates.get(hero);if(state&&state.health>0){state.health=Math.min(state.progress.stats.hp,(hero===this.hero?this.health:state.health)+restored);if(hero===this.hero)this.health=state.health;else (this.allies.getChildren().find(a=>a.getData('companionHero')===hero) as Enemy|undefined)?.setData('health',state.health);}}
    arrow.destroy(); this.game.events.emit('effect', 'damage', { volume: 0.3, position:{x:target.x,y:target.y} });
  }
  private spawnAllies(): void {
    const units: { key:string;x:number;y:number;hero?:Hero }[] = this.tactical?Array.from({length:this.map.soldierCount},()=>({key:'soldier',x:0,y:0})):[{key:'soldier',x:168,y:280},{key:'soldier',x:120,y:230}];
    const positions = [[236,230],[190,310],[138,310]];
    this.companions.forEach((hero,i)=>units.push({key:hero,hero,x:this.tactical?0:positions[i][0],y:this.tactical?0:positions[i][1]}));
    for (const [index,unit] of units.entries()) {
      const {x,y,key,hero}=unit;
      const ally=this.allies.create(x,y,key) as Enemy;
      ally.setSize(28,28).setOffset(11,15).setCollideWorldBounds(true).setTint(0x8edfff).setDepth(hero&&isFlying(hero)?12:9);
      const p=hero?weaponProfile(hero,this.partyStates.get(hero)!.loadout):undefined;
      ally.setData({faction:'ally',companionHero:hero,flying:hero?isFlying(hero):false,weapon:p?.weapon??'sword',health:hero?this.partyStates.get(hero)!.health:100,maxHealth:hero?this.partyStates.get(hero)!.progress.stats.hp:100,defense:hero?0:3,resistance:hero?0:2,damage:p?.damage??18,speed:p?p.speed*PLAYER_SPEED_SCALE:85,progression:hero?this.partyStates.get(hero)!.progress:undefined,loadout:hero?this.partyStates.get(hero)!.loadout:undefined});
      ally.setData('home',{x,y});if(this.tactical){ally.setData('deploymentId',hero??`soldier-${index}`);ally.setVisible(false);ally.body!.enable=false;}
      const marker=this.add.text(x,y,hero?hero==='robin-female'?'ROBIN F':hero.toUpperCase():'ALLY',{fontFamily:'FE',fontSize:'10px',color:'#9de6ff',backgroundColor:'#15201b'}).setDepth(21);
      ally.setData('weaponMarker',marker);
      const icon=this.add.image(x,y,`weapon-${p?.weapon??'sword'}`).setDisplaySize(16,16).setDepth(21);ally.setData('weaponIcon',icon);
      this.targetFields.set(ally,new NavigationField(this.width,this.height,this.terrain));
      this.allyRoutes.set(ally,new NavigationField(this.width,this.height,this.terrain));
      ally.once('destroy',()=>{marker.destroy();icon.destroy();this.targetFields.delete(ally);this.allyRoutes.delete(ally);});
    }
  }
  private setCompanionSlot(unit:Enemy,slot:number):void {
    const hero=unit.getData('companionHero') as Hero,state=this.partyStates.get(hero)!;state.loadout.equippedSlot=slot;const p=weaponProfile(hero,state.loadout);unit.setData({weapon:p.weapon,damage:attackPower(state.progress,hero,equippedWeapon(state.loadout)),pendingShot:undefined});this.brains.delete(unit);
  }
  private updateUrgentHealing(unit:Enemy):void {
    const hero=unit.getData('companionHero') as Hero|undefined;if(!hero||hero===this.hero)return;
    const state=this.partyStates.get(hero)!;const prior=unit.getData('autoHealPrior') as number|undefined;
    const anchor=this.allyAnchor(unit),origin=this.bodyCenter(unit);
    const patients=[this.player,...this.allies.getChildren() as Enemy[]].filter(u=>u!==unit&&u.active&&u.visible).filter(u=>{const hp=u===this.player?this.health:u.getData('health'),max=u===this.player?this.progression.stats.hp:u.getData('maxHealth');return hp>0&&hp/max<(prior===undefined?.5:.75)&&Phaser.Math.Distance.BetweenPoints(anchor,this.bodyCenter(u))<=this.retaliationRadius(unit)&&Phaser.Math.Distance.BetweenPoints(origin,this.bodyCenter(u))<=320&&(this.unitFlying(unit)||this.navigation.isWalkable(this.bodyCenter(u)));});
    if(prior!==undefined){if(!patients.length){this.setCompanionSlot(unit,prior);unit.setData({autoHealPrior:undefined,autoHealReadyAt:this.time.now+4000});}return;}
    if(!patients.length||this.time.now<(unit.getData('autoHealReadyAt')??0)||equippedWeapon(state.loadout).type==='staff')return;
    const slot=state.loadout.items.findIndex(item=>WEAPONS[item.weaponId].type==='staff');if(slot<0)return;
    unit.setData('autoHealPrior',state.loadout.equippedSlot);this.setCompanionSlot(unit,slot);this.game.events.emit('notice',`${HERO_NAMES[hero]} switches to urgent healing`);
  }
  private updateEnemy(enemy: Enemy, time: number): void {
    this.updateUrgentHealing(enemy);
    this.recoverFromTerrain(enemy);
    if(time<(enemy.getData('healUntil')??0)){enemy.setVelocity(0);return;}
    const healer=enemy.getData('companionHero') as Hero|undefined;
    if(healer&&this.enemyWeapon(enemy)==='staff'){
      enemy.setData('retaliation',undefined);this.brains.delete(enemy);
      const state=this.partyStates.get(healer)!;const weapon=equippedWeapon(state.loadout);
      if(time-state.lastAttack>=attackCooldown(state.progress,healer,weapon)*(this.tactical?2.4:1)&&this.castHeal(enemy)){enemy.setVelocity(0);return;}
      const origin=this.bodyCenter(enemy),anchor=this.allyAnchor(enemy);
      const wounded=[this.player,...this.allies.getChildren() as Enemy[]].filter(u=>u!==enemy&&u.active&&u.visible&&(u===this.player?this.health:u.getData('health'))>0&&(u===this.player?this.health<this.progression.stats.hp:u.getData('health')<u.getData('maxHealth'))&&Phaser.Math.Distance.BetweenPoints(anchor,this.bodyCenter(u))<=this.retaliationRadius(enemy)).sort((a,b)=>Phaser.Math.Distance.BetweenPoints(origin,this.bodyCenter(a))-Phaser.Math.Distance.BetweenPoints(origin,this.bodyCenter(b)));
      const target=wounded.length?this.bodyCenter(wounded[0]):anchor;
      const stop=wounded.length?weapon.range*.7:16;
      if(wounded.length?Phaser.Math.Distance.BetweenPoints(origin,target)<=stop:!this.following(enemy,origin,target)){enemy.setVelocity(0).setFlipX(false);enemy.anims.play(`${enemy.texture.key}-idle`,true);return;}
      const field=this.allyRoutes.get(enemy)!;field.setTarget(target,this.unitFlying(enemy));const waypoint=this.unitFlying(enemy)||field.canTravel(origin,target)?target:field.nextWaypoint(origin);
      if(waypoint){const aim=direction(waypoint.x-origin.x,waypoint.y-origin.y);const speed=wounded.length?enemy.getData('speed'):this.followSpeed(enemy,origin,target);enemy.setVelocity(aim.x*speed,aim.y*speed).setFlipX(false);enemy.anims.play(`${enemy.texture.key}-walk-${this.directionName(aim)}`,true);}else {enemy.setVelocity(0).setFlipX(false);enemy.anims.play(`${enemy.texture.key}-idle`,true);}
      return;
    }
    const pending=enemy.getData('pendingShot') as {aim:Point;at:number}|undefined;
    if(pending){enemy.setVelocity(0);if(time>=pending.at){this.fireArrow(enemy,pending.aim,'ally',this.enemyWeapon(enemy));enemy.setData('pendingShot',undefined);}return;}
    const equipment=enemy.getData('loadout') as Loadout|undefined;
    const original = unitDefinition(enemy.texture.key,equipment?equippedWeapon(equipment):undefined);
    const companion=enemy.getData('companionHero') as Hero|undefined;
    const commanderId=enemy.getData('commanderId') as CommanderId|undefined;
    const definition=commanderId?commanderDefinition(commanderId,enemy.getData('strikes'),enemy.getData('health')/enemy.getData('maxHealth')):companion&&this.tactical?{...original,attack:{...original.attack,cooldown:attackCooldown(enemy.getData('progression'),companion,equipment?equippedWeapon(equipment):undefined)*2.4}}:enemy.getData('boss')?{...original,attack:{...original.attack,windup:950,recovery:850,cooldown:1900,range:115}}:original;
    if(commanderId){enemy.setData('weapon',definition.weapon);(enemy.getData('weaponIcon') as Phaser.GameObjects.Image).setTexture(`weapon-${definition.weapon}`);}
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
        const origin=this.bodyCenter(enemy),target=this.allyAnchor(enemy);
        const field=this.allyRoutes.get(enemy)!;field.setTarget(target,this.unitFlying(enemy));
        const destination=this.unitFlying(enemy)||field.canTravel(origin,target)?target:field.nextWaypoint(origin);
        if(destination && this.following(enemy,origin,target)){const aim=direction(destination.x-origin.x,destination.y-origin.y);const speed=this.followSpeed(enemy,origin,target);enemy.setVelocity(aim.x*speed,aim.y*speed).setFlipX(false);enemy.anims.play(`${enemy.texture.key}-walk-${this.directionName(aim)}`,true);return;}
      }
      enemy.setVelocity(0).setFlipX(false); enemy.anims.play(`${enemy.texture.key}-idle`, true); return;
    }
    const origin = this.bodyCenter(enemy), target = this.structureTarget(targetUnit,origin);
    const route = this.faction(enemy) === 'ally' ? this.allyRoutes.get(enemy)! : targetUnit === this.player ? this.navigation : this.targetFields.get(targetUnit)!;
    if(targetUnit.getData('structure'))route.setTarget(target);
    if (this.faction(enemy) === 'ally') route.setTarget(target,this.unitFlying(enemy));
    const distance = Phaser.Math.Distance.Between(origin.x, origin.y, target.x, target.y);
    const visible = this.unitFlying(enemy) || this.hasLineOfSight(origin, target,definition.weapon==='bow');
    const attack = definition.attack;
    if (brain.phase === 'windup') {
      enemy.setVelocity(0);
      this.drawTelegraph(enemy, brain, definition);
      if (time >= brain.strikeAt) {
        this.resolveEnemyAttack(enemy, brain, definition);
        brain.phase = 'recover'; brain.recoverUntil = time + attack.recovery;
        brain.nextAttackAt = time + attack.cooldown;
        if(commanderId)enemy.setData('strikes',(enemy.getData('strikes')??0)+1);
      }
      return;
    }
    if (brain.phase === 'recover') {
      if (time < brain.recoverUntil) { enemy.setVelocity(0); enemy.anims.stop(); return; }
      brain.phase = 'chase';
    }
    if (attack.kind === 'ranged') {
      const minimum=attack.minRange??0;
      if(distance<minimum)brain.retreating=true;
      if(distance>=Math.min(attack.range,minimum+Math.min(30,(attack.range-minimum)*.15)))brain.retreating=false;
    }
    const canAttack = distance >= (attack.minRange??0) && distance <= attack.range && visible && !brain.retreating;
    if (canAttack && time >= brain.nextAttackAt) {
      brain.phase = 'windup'; brain.aim = direction(target.x - origin.x, target.y - origin.y);
      brain.target = target; brain.strikeAt = time + attack.windup;
      enemy.setVelocity(0).setFlipX(actionFlipX(enemy.texture.key,brain.aim.x)); enemy.anims.play(`${enemy.texture.key}-action`);
      this.drawTelegraph(enemy, brain, definition);
      return;
    }
    const holdPosition = attack.kind === 'melee' ? distance <= attack.range * 0.9 && visible : distance >= (attack.minRange??0) && distance <= attack.range && visible && !brain.retreating;
    if (holdPosition) { enemy.setVelocity(0).setFlipX(false); enemy.anims.play(`${enemy.texture.key}-idle`, true); return; }
    const waypoint = !brain.retreating && (this.unitFlying(enemy) || route.canTravel(origin, target))
      ? target : route.nextWaypoint(origin, brain.retreating);
    if (!waypoint) { enemy.setVelocity(0).setFlipX(false); enemy.anims.play(`${enemy.texture.key}-idle`,true); return; }
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
    const length = definition.attack.kind === 'melee' ? range : enemy.getData('commanderId')?range:100;
    if(enemy.getData('commanderId')&&definition.attack.kind==='ranged'){this.telegraphs.lineStyle(3,enemy.getData('commanderId')==='validar'?0xd1a1ff:0xffed8b,.9);this.telegraphs.strokeCircle(brain.target.x,brain.target.y,22);}
    this.telegraphs.lineBetween(enemy.x, enemy.y, enemy.x + brain.aim.x * length, enemy.y + brain.aim.y * length);
  }
  private resolveEnemyAttack(enemy: Enemy, brain: EnemyBrain, definition: EnemyDefinition): void {
    if (this.ended || !enemy.active) return;
    const targetUnit = brain.targetUnit ?? this.player;
    if (!targetUnit.active) return;
    const origin = this.bodyCenter(enemy), target = this.structureTarget(targetUnit,origin);
    if (definition.attack.kind === 'ranged') {
      if (this.hasLineOfSight(origin, brain.target,definition.weapon==='bow')) this.fireArrow(enemy, brain.aim, this.faction(enemy), definition.weapon);
      return;
    }
    this.game.events.emit('effect', weaponAttackSound(definition.weapon), { volume: 0.18, position:{x:enemy.x,y:enemy.y} });
    const slash = this.add.image(enemy.x + brain.aim.x * 35, enemy.y + brain.aim.y * 35, 'slash')
      .setDisplaySize(55, 55).setRotation(Math.atan2(brain.aim.y, brain.aim.x)).setTint(0xffb070).setDepth(15);
    this.tweens.add({ targets: slash, alpha: 0, duration: 180, onComplete: () => slash.destroy() });
    if (inMeleeRange(origin, target, brain.aim, definition.attack.range) && (this.unitFlying(enemy) || this.hasLineOfSight(origin, target))) {
      if (targetUnit === this.player) this.takeDamage(enemy.getData('damage') as number, definition.weapon,this.bodyCenter(enemy));
      else this.damageEnemy(targetUnit, enemy.getData('damage') as number, definition.weapon,this.faction(enemy),enemy.getData('companionHero'),enemy);
    }
  }
  private structureTarget(unit:Enemy,origin:Point):Point {
    if(!unit.getData('structure'))return this.bodyCenter(unit);
    const [x,y,w,h]=unit.getData('rect') as readonly number[];
    return {x:origin.x<x?x-24:origin.x>x+w?x+w+24:Phaser.Math.Clamp(origin.x,x+24,x+w-24),y:origin.y<y?y-24:origin.y>y+h?y+h+24:Phaser.Math.Clamp(origin.y,y+24,y+h-24)};
  }
  private breachWall(wall:Enemy):void {
    const name=wall.getData('name');this.siegeRoutes=new WeakMap();wall.destroy();this.targetFields.delete(wall);
    this.terrain=[...this.map.terrain,...this.siegeWalls.filter(w=>w.active).map(w=>w.getData('rect'))];
    this.navigation=new NavigationField(this.width,this.height,this.terrain);this.navigation.setTarget(this.bodyCenter(this.player),isFlying(this.hero));
    for(const unit of [...this.allies.getChildren(),...(this.camp?.active?[this.camp]:[]),...this.siegeWalls.filter(w=>w.active)] as Enemy[]){const field=new NavigationField(this.width,this.height,this.terrain);field.setTarget(this.bodyCenter(unit));this.targetFields.set(unit,field);if(!unit.getData('structure')&&unit!==this.camp)this.allyRoutes.set(unit,new NavigationField(this.width,this.height,this.terrain));}
    for(const unit of [...this.enemies.getChildren(),...this.allies.getChildren()])this.brains.delete(unit as Enemy);
    this.game.events.emit('notice',`${name} wall breached! Protect the camp.`);
  }
  private hasLineOfSight(from: Point, to: Point, overWalls=false): boolean {
    const line = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
    return !(overWalls&&this.tactical?this.map.terrain:this.terrain).some(([x, y, width, height]) => Phaser.Geom.Intersects.LineToRectangle(line, new Phaser.Geom.Rectangle(x, y, width, height)));
  }
  private fireArrow(source: Enemy, aim: Point, faction: 'player' | 'ally' | 'enemy' = 'enemy', weapon: WeaponType = 'bow'): void {
    const origin = this.bodyCenter(source);
    const magic = weapon === 'tome';
    const arrow = this.arrows.create(origin.x + aim.x * 28, origin.y + aim.y * 28, magic ? 'fire-bolt' : 'arrow', magic ? undefined : 'shaft') as Enemy;
    const speed = faction === 'player' ? 360 : 230;
    const sourceLoadout=faction==='player'?this.weaponLoadout():source.getData('loadout') as Loadout|undefined;
    const sourceWeapon=sourceLoadout?equippedWeapon(sourceLoadout):undefined;
    const definition = unitDefinition(source.texture.key,sourceWeapon);
    const range = faction === 'player' ? this.profile().range : source.getData('commanderId')?commanderDefinition(source.getData('commanderId'),source.getData('strikes'),source.getData('health')/source.getData('maxHealth')).attack.range:definition.attack.range;
    arrow.setDisplaySize(magic ? 24 : 40, magic ? 24 : 8).setRotation(Math.atan2(aim.y, aim.x) + (magic ? Math.PI / 2 : Math.PI)).setDepth(12);
    if (faction === 'player' && !magic) arrow.setTint(0x9de6ff);
    arrow.setSize(10 / arrow.scaleX, 10 / arrow.scaleY).setVelocity(aim.x * speed, aim.y * speed);
    arrow.setData({ source,faction, weapon, origin,weaponId:sourceWeapon?.id,siegeTarget:this.brains.get(source)?.targetUnit?.getData('structure')?this.brains.get(source)?.targetUnit:undefined,attackingHero:faction==='player'?this.hero:source.getData('companionHero'), minRange: faction === 'player' ? this.profile().minRange : (definition.attack.minRange ?? 0), maxRange: range,
      damage: faction === 'player' ? attackPower(this.progression,this.hero,equippedWeapon(this.weaponLoadout())) : source.getData('companionHero')?attackPower(source.getData('progression'),source.getData('companionHero'),sourceWeapon):source.getData('damage'), expires: this.time.now + range / speed * 1000 });
    if(sourceWeapon?.id==='wind')arrow.setTint(0xa9efc4);
    if(source.getData('commanderId')==='validar')arrow.setTint(0xc183ff);
    if(source.getData('commanderId')==='gangrel')arrow.setTint(0xffee87);
    if (magic) this.game.events.emit('spell-effect',{x:source.x,y:source.y});
    else this.game.events.emit('effect', 'arrow-fire', { volume: 0.25, position:{x:source.x,y:source.y} });
  }
  private drawAimGuide(): void {
    this.aimGuide.clear();
    if (this.profile().weapon === 'staff') {
      const origin=this.bodyCenter(this.player),profile=this.profile(),{patient}=this.healingSelection(this.player);
      this.aimGuide.lineStyle(1,patient?0x8deaa8:0xacb7b9,.28).strokeCircle(origin.x,origin.y,profile.range);
      const ringTarget=(this.keys.SHIFT.isDown||this.touchSelfHeal)?this.player:patient?.unit;
      if(ringTarget)this.aimGuide.lineStyle(2,patient?0x8deaa8:0xacb7b9,.85).strokeCircle(ringTarget.x,ringTarget.y,26);
      return;
    }
    const origin = this.bodyCenter(this.player), profile = this.profile();
    const aim = this.playerShot?.aim ?? this.facing;
    this.aimGuide.lineStyle(1, 0xe79d79, 0.45).strokeCircle(origin.x, origin.y, profile.minRange);
    this.aimGuide.lineStyle(this.playerShot ? 3 : 1, 0x9de6ff, 0.6);
    this.aimGuide.lineBetween(origin.x + aim.x * profile.minRange, origin.y + aim.y * profile.minRange,
      origin.x + aim.x * profile.range, origin.y + aim.y * profile.range);
  }
  private drawHealthBars(): void {
    this.playerWeapon.setVisible(this.player.visible);
    this.playerWeapon.setPosition(Phaser.Math.Clamp(this.player.x + 34, 8, this.width - 8), Math.max(8, this.player.y - 32));
    this.flightShadow.setPosition(this.player.x, this.player.y + 22);
    this.healthBar.clear();
    if(this.player.visible)this.healthBar.fillStyle(0x15201b).fillRect(this.player.x - 25, this.player.y - 36, 50, 8)
      .fillStyle(0x7fce88).fillRect(this.player.x - 24, this.player.y - 35, 48 * this.health / this.progression.stats.hp, 6);
    for (const object of [...this.enemies.getChildren(), ...this.allies.getChildren(),...(this.camp?.active?[this.camp]:[]),...this.siegeWalls.filter(w=>w.active)]) {
      const enemy = object as Enemy;
      const fraction = Phaser.Math.Clamp((enemy.getData('health') as number) / (enemy.getData('maxHealth') as number), 0, 1);
      const x = Phaser.Math.Clamp(enemy.x - 20, 1, this.width - 41);
      const rect=enemy.getData('rect') as readonly number[]|undefined;
      const y = Math.max(1, rect?rect[1]-12:enemy.y - 34);
      const weapon = this.enemyWeapon(enemy);
      const matchup = weaponMatchup(this.profile().weapon, weapon);
      const color = matchup === 1 ? 0x7fce88 : matchup === -1 ? 0xffb070 : 0xb2cad0;
      // Weapon initials and +/- make matchup readable without relying on color alone.
      const label = enemy.getData('boss')?(enemy.getData('commanderId')?COMMANDERS[enemy.getData('commanderId') as CommanderId].name.toUpperCase():'COMMANDER'):enemy.getData('level')>1?`LV ${enemy.getData('level')}`:this.faction(enemy) === 'ally' ? (enemy.getData('companionHero') ? String(enemy.getData('companionHero')).replace('robin-female','ROBIN F').toUpperCase() : 'ALLY') : `${matchup === 1 ? '+' : matchup === -1 ? '-' : ''}`;
      const marker = enemy.getData('weaponMarker') as Phaser.GameObjects.Text | undefined;
      const icon = enemy.getData('weaponIcon') as Phaser.GameObjects.Image | undefined;
      icon?.setVisible(enemy.visible);marker?.setVisible(enemy.visible);if(!enemy.visible)continue;
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
  /** Preview and cast share the same explicit self/ally intent. AI retains its self fallback. */
  private healingSelection(source:Enemy) {
    const hero=source===this.player?this.hero:source.getData('companionHero') as Hero;
    const range=equippedWeapon(this.partyStates.get(hero)!.loadout).range;
    const candidates=[this.player,...this.allies.getChildren() as Enemy[]].filter(unit=>unit.active&&unit.visible).map(unit=>({...this.bodyCenter(unit),unit,active:unit.active,health:unit===this.player?this.health:unit.getData('health') as number,maxHealth:unit===this.player?this.progression.stats.hp:unit.getData('maxHealth') as number}));
    const caster=candidates.find(candidate=>candidate.unit===source);
    const controlled=source===this.player,self=controlled&&(this.keys.SHIFT.isDown||this.touchSelfHeal);
    const patient=self?(caster?.active&&caster.health>0&&caster.health<caster.maxHealth?caster:undefined):selectHealingTarget(this.bodyCenter(source),controlled?candidates.filter(candidate=>candidate!==caster):candidates,range,controlled?undefined:caster);
    return {candidates,patient,self};
  }
  private castHeal(source:Enemy):boolean {
    const hero=source===this.player?this.hero:source.getData('companionHero') as Hero|undefined;
    if(!hero)return false;
    const state=this.partyStates.get(hero)!;
    const weapon=equippedWeapon(state.loadout);
    if(weapon.type!=='staff')return false;
    const cooldown=attackCooldown(state.progress,hero,weapon)*(this.tactical?2.4:1);
    if(this.time.now-(source===this.player?this.lastAttack:state.lastAttack)<cooldown)return false;
    const {candidates,patient,self}=this.healingSelection(source);
    if(!patient){
      if(source===this.player)this.feedback('reject',self?'You are at full HP':candidates.some(unit=>unit.unit!==source&&unit.health>0&&unit.health<unit.maxHealth)?'Wounded ally out of range':'All allies at full HP');
      return false;
    }
    const result=restoreHealth(patient.health,patient.maxHealth,healAmount(state.progress.stats.mag)+(weapon.healingBonus??0));
    if(!result.restored)return false;
    const targetHero=patient.unit===this.player?this.hero:patient.unit.getData('companionHero') as Hero|undefined;
    if(patient.unit===this.player)this.health=result.health;else patient.unit.setData('health',result.health);
    if(targetHero)this.partyStates.get(targetHero)!.health=result.health;
    const hpBefore=state.progress.stats.hp,experience=Math.max(1,Math.floor(healingExperience(state.progress.level,result.restored)*(this.missionIndex===undefined?1:.15))),gains=gainExperience(state.progress,hero,experience);
    state.health=(source===this.player?this.health:source.getData('health'))+state.progress.stats.hp-hpBefore;
    state.lastAttack=this.time.now;
    if(source===this.player){this.health=state.health;this.lastAttack=this.time.now;this.actionUntil=this.time.now+350;this.battleHud.gain(experience,gains);}else source.setData({health:state.health,maxHealth:state.progress.stats.hp,defense:state.progress.stats.def,resistance:state.progress.stats.res,nextAttackAt:this.time.now+attackCooldown(state.progress,hero,weapon)*(this.tactical?2.4:1)});
    if(source===this.player)this.game.events.emit('ux-feedback-visible',{kind:'clear'});
    if(source!==this.player&&source.getData('autoHealPrior')!==undefined)this.feedback('confirm',`${HERO_NAMES[hero]}: urgent heal`);
    source.setFlipX(actionFlipX(hero,patient.unit.x-source.x));source.anims.play(`${hero}-action`);source.setData('healUntil',this.time.now+350);
    if(this.cache.audio.exists('heal'))this.game.events.emit('effect','heal',{volume:.3,position:{x:source.x,y:source.y}});
    const ring=this.add.graphics().setDepth(24).lineStyle(3,0x8deaa8,.9).strokeCircle(patient.unit.x,patient.unit.y,30);
    this.showHealthGain(patient.unit,result.restored);
    this.tweens.add({targets:ring,alpha:0,duration:650,onComplete:()=>ring.destroy()});
    this.publishHud();return true;
  }
  private showHealthGain(unit:Enemy,amount:number):void {
    const text=this.add.text(unit.x+22,unit.y-38,`+${amount}`,{fontFamily:'FE',fontSize:'14px',color:'#a2ffc3',stroke:'#15201b',strokeThickness:3}).setOrigin(.5).setDepth(25).setData('health-gain',amount);
    this.tweens.add({targets:text,y:text.y-18,alpha:0,duration:650,onComplete:()=>text.destroy()});
  }
  private attack(): void {
    const profile = this.profile();
    this.actionUntil = this.time.now + 200;
    this.actionAim = { ...this.facing };
    this.player.anims.play(`${this.hero}-action`);
    this.player.setFlipX(actionFlipX(this.hero,this.facing.x));
    if(profile.weapon==='staff'){this.castHeal(this.player);return;}
    this.game.events.emit('hero-attack', { hero: this.hero, spell: profile.weapon === 'tome' ? profile.name : undefined });
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
      hit = true; this.damageEnemy(enemy, attackPower(this.progression,this.hero,equippedWeapon(this.weaponLoadout())), profile.weapon);
    }
    if (hit) this.game.events.emit('effect', 'damage', { volume: 0.3 });
  }
  private damageEnemy(enemy: Enemy, base: number, weapon: WeaponType, attacker:'player'|'ally'|'enemy'='player',attackingHero?:Hero,source?:Enemy,attackWeapon?:CombatWeapon): void {
    if (!enemy.active) return;
    if(enemy.getData('structure')){if(attacker!=='enemy')return;enemy.setData('health',enemy.getData('health')-scaleDamage(base,this.registry.get('damage-scale')??.5));if(enemy.getData('health')<=0)this.breachWall(enemy);return;}
    const defendedHero=enemy.getData('companionHero') as Hero|undefined;
    if(defendedHero&&attacker==='enemy'){const state=this.partyStates.get(defendedHero)!;if(this.time.now-state.lastDamage<700)return;state.lastDamage=this.time.now;}
    const targetProgress=enemy.getData('progression') as Progress|undefined;
    if(this.tactical && targetProgress){const avoid=Math.min(.25,((targetProgress.stats.speed-targetProgress.base.speed)*3+targetProgress.stats.luck-targetProgress.base.luck)/200);if(Math.random()<avoid)return;}
    const attackingProgress=attackingHero?this.partyStates.get(attackingHero)?.progress:attacker==='player'?this.progression:undefined;
    const attackingLoadout=attackingHero?this.partyStates.get(attackingHero)?.loadout:attacker==='player'?this.weaponLoadout():undefined;const criticalBonus=attackingLoadout?equippedWeapon(attackingLoadout).criticalBonus??0:0;
    const criticalChance=attackingProgress?Math.min(.25,((attackingProgress.stats.skill-attackingProgress.base.skill)/2+(attackingProgress.stats.luck-attackingProgress.base.luck)/4+criticalBonus)/100):0;
    const critical=Math.random()<criticalChance;
    const resolved=resolveDamage({power:base,weapon:attackWeapon??(attackingLoadout?equippedWeapon(attackingLoadout):{type:weapon}),defenderWeapon:this.enemyWeapon(enemy),defense:enemy.getData('defense')??0,resistance:enemy.getData('resistance')??0,targetTags:this.combatTags(enemy),critical,scale:this.tactical?(this.registry.get('damage-scale')??.5):1});
    const damage=resolved.damage;
    const health = (enemy.getData('health') as number) - damage;
    enemy.setData('health', health);if(enemy===this.camp&&health<=0){this.finishTactical(false,'Hero camp destroyed.');return;}
    const companion=enemy.getData('companionHero') as Hero|undefined;
    if(this.faction(enemy)==='ally'&&attacker==='enemy'&&source?.active&&health>0&&Phaser.Math.Distance.BetweenPoints(this.allyAnchor(enemy),this.bodyCenter(source))<=this.retaliationRadius(enemy)){enemy.setData('retaliation',{unit:source,until:this.time.now+6000});const brain=this.brains.get(enemy);if(brain?.phase==='chase')brain.targetUnit=source;}
    if(this.tactical&&companion&&attacker==='enemy'&&health>0&&this.time.now-(this.allyWarningAt.get(companion)??-Infinity)>6000){this.allyWarningAt.set(companion,this.time.now);this.game.events.emit('companion-warning',{hero:companion,health:Math.max(0,health)});}
    if(companion)this.partyStates.get(companion)!.health=Math.max(0,health);
    const text = this.add.text(enemy.x, enemy.y - 42, `${critical?'CRIT ':''}${damage}${resolved.effective?' ✦':''}${weaponMatchup(weapon, this.enemyWeapon(enemy)) === 1 ? ' ↑' : weaponMatchup(weapon, this.enemyWeapon(enemy)) === -1 ? ' ↓' : ''}`,
      { fontFamily: 'FE', fontSize: '13px', color: '#f5edda', stroke: '#15201b', strokeThickness: 3 }).setDepth(25);
    this.tweens.add({ targets: text, y: text.y - 18, alpha: 0, duration: 650, onComplete: () => text.destroy() });
    if (health <= 0) {
      const { x, y } = enemy; const typeKey=enemy.texture.key;const defeatedLevel=enemy.getData('level')??1; const companion=enemy.getData('companionHero') as Hero|undefined;if(companion){this.partyStates.get(companion)!.health=0;this.heroDeath(companion);} const hostile = this.faction(enemy) === 'enemy'; enemy.destroy(); if (hostile) { this.kills++; this.awardExperience(typeKey,defeatedLevel); }
      if(hostile&&this.tactical){const coin=this.pickups.create(x,y,'gold') as Enemy;coin.setDisplaySize(20,20).setDepth(12).setData({gold:Phaser.Math.Between(12,22),goldExpires:this.battleClock+20000});coin.setSize(coin.width,coin.height);}
      if (hostile && Phaser.Math.Between(1, 5) === 1 && this.pickups.getChildren().filter(pickup => pickup.active && pickup.getData('gold') === undefined).length < 3) {
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
  private updateGoldPickups():void {
    for(const pickup of this.pickups.getChildren() as Enemy[]){
      const expires=pickup.getData('goldExpires') as number|undefined;
      if(expires===undefined)continue;
      const remaining=expires-this.battleClock;
      if(remaining<=0)pickup.destroy();
      else pickup.setAlpha(remaining<4000?.3+.7*remaining/4000:1);
    }
  }
  private showGoldPickup(amount:number):void {
    const clustered=this.battleClock-this.goldCollectedAt<500&&this.goldPopup?.active;
    this.goldPopupTotal=clustered?this.goldPopupTotal+amount:amount;
    if(!clustered){this.goldPopup?.destroy();this.goldPopup=this.add.text(this.player.x,this.player.y-45,'',{fontFamily:'FE',fontSize:'16px',color:'#f7d878',stroke:'#352717',strokeThickness:3}).setOrigin(.5).setDepth(26);this.feedback('confirm');}
    this.goldCollectedAt=this.battleClock;
    const popup=this.goldPopup!;this.tweens.killTweensOf(popup);
    popup.setPosition(this.player.x,this.player.y-45).setAlpha(1).setText(`+${this.goldPopupTotal}`);
    this.tweens.add({targets:popup,y:popup.y-22,alpha:0,duration:1000,onComplete:()=>popup.destroy()});
  }
  private heroDeath(hero:Hero):void {if(this.fallenVoices.has(hero))return;this.fallenVoices.add(hero);this.game.events.emit('hero-voice',{hero,event:'death'});}
  private takeDamage(base: number, weapon: WeaponType = this.profile().weapon,source?:Point): void {
    const resolved=resolveDamage({power:base,weapon:{type:weapon},defenderWeapon:this.profile().weapon,defense:this.progression.stats.def,resistance:this.progression.stats.res,targetTags:this.combatTags(this.player),scale:this.tactical?(this.registry.get('damage-scale')??.5):1});
    let damage=resolved.damage;
    if (this.ended || this.time.now - this.lastDamage < 700) return;
    const avoid=Math.min(.25,((this.progression.stats.speed-this.progression.base.speed)*3+this.progression.stats.luck-this.progression.base.luck)/200);
    if(Math.random()<avoid){this.lastDamage=this.time.now;const symbol=this.add.text(this.player.x+22,this.player.y-38,'↷',{fontFamily:'sans-serif',fontSize:'22px',color:'#bce9ff',stroke:'#15201b',strokeThickness:3}).setOrigin(.5).setDepth(25).setData('evade-feedback',true);this.tweens.add({targets:symbol,y:symbol.y-15,alpha:0,duration:650,onComplete:()=>symbol.destroy()});this.game.events.emit('effect','ui-cursor',{volume:.12,position:{x:this.player.x,y:this.player.y}});return;}
    if(source){const origin=this.bodyCenter(this.player),blocked=guardedDamage(this.guard,damage,resolved.kind,Math.atan2(this.facing.y,this.facing.x),Math.atan2(source.y-origin.y,source.x-origin.x));damage=blocked.damage;if(blocked.blocked){this.guardGuide.setAlpha(.65);this.tweens.add({targets:this.guardGuide,alpha:1,duration:120});this.game.events.emit('effect','ui-confirm',{volume:.14,position:origin});}}
    this.lastDamage = this.time.now;
    this.health = Math.max(0, this.health - damage);
    this.game.events.emit('effect', 'damage', { volume: 0.2 });
    if(this.health<=0)this.heroDeath(this.hero);else this.game.events.emit('hero-voice',{hero:this.hero,event:'damage'});
    this.player.setTint(0xffaaaa);
    this.time.delayedCall(180, () => { if (this.player.active) this.player.clearTint(); });
    this.publishHud();
    if (this.health === 0 && this.tactical){this.partyStates.get(this.hero)!.health=0;if(this.switchCharacter(1))return;this.finishTactical(false);return;}
    if (this.health === 0) {
      this.game.events.emit('effect', 'death', { volume: 0.3 });
      this.guard.active=false;this.touchGuard=false;this.guardGuide.clear();this.playerShot = undefined; this.aimGuide.clear(); this.telegraphs.clear();
      this.ended = true; this.arrows.clear(true, true); this.physics.pause(); this.time.removeAllEvents();
      this.game.events.emit('game-over', { wave: this.wave, kills: this.kills });
    }
  }
  private publishHud(): void {
    this.game.events.emit('hud', { health: this.health, maxHealth:this.progression.stats.hp, level:this.progression.level, xp:this.progression.xp, allyMode:this.allyMode, allies:this.allies.countActive(), allyCapacity:(this.tactical?this.map.soldierCount:2)+this.companions.length, wave: this.wave, kills: this.kills, enemies: this.enemies.countActive() } satisfies Hud);
  }
}
