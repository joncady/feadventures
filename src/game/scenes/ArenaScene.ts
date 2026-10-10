import Phaser from 'phaser';
import { ENEMY_TYPES, HERO_PROFILES, HERO_SHEETS, isFlying, OBSTACLES, WORLD, type Hero } from '../data/config';
import { direction, inMeleeRange, validSpawn, waveSize, type Point } from '../systems/rules';
import { combatDamage, weaponAttackSound, weaponMatchup, withinWeaponRange, type WeaponType } from '../systems/combat';
import { NavigationField } from '../systems/navigation';

type Enemy = Phaser.Physics.Arcade.Sprite;
type EnemyDefinition = typeof ENEMY_TYPES[number];
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
export interface Hud { health: number; wave: number; kills: number; enemies: number }
export class ArenaScene extends Phaser.Scene {
  private hero: Hero = 'chrom';
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
  init(data: { hero?: Hero }): void {
    this.hero = data.hero ?? 'chrom';
    this.brains = new WeakMap(); this.targetFields.clear(); this.allyRoutes.clear();
    this.playerShot = undefined; this.actionUntil = 0; this.pointerAim = undefined; this.pointerAttack = false;
    this.health = 100; this.wave = 1; this.kills = 0;
    this.facing = { x: 1, y: 0 }; this.keyboardFacing = { ...this.facing }; this.lastAttack = -Infinity;
    this.lastDamage = -Infinity; this.spawning = 0; this.advancing = false; this.ended = false;
  }
  create(): void {
    this.add.image(WORLD.width / 2, WORLD.height / 2, 'map').setDisplaySize(WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.navigation = new NavigationField(WORLD.width, WORLD.height, OBSTACLES);
    this.walls = this.physics.add.staticGroup();
    for (const [x, y, width, height] of OBSTACLES) {
      const wall = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.walls.add(wall);
    }
    this.player = this.physics.add.sprite(190, 230, this.hero).setCollideWorldBounds(true).setDepth(10);
    this.player.setSize(28, 28).setOffset(11, 15);
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
    this.physics.add.collider(this.allies, this.allies);
    this.physics.add.collider(this.allies, this.enemies);
    if (!isFlying(this.hero)) this.physics.add.collider(this.player, this.allies);
    if (!isFlying(this.hero)) this.physics.add.collider(this.player, this.enemies);
    // Resolve terrain last: crowd separation must not leave bodies inside walls.
    if (!isFlying(this.hero)) this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.allies, this.walls);
    this.physics.add.overlap(this.player, this.pickups, (_player, item) => {
      item.destroy(); this.health = Math.min(100, this.health + 25); this.publishHud();
    });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.input.on('pointermove', this.updatePointerAim, this);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
    this.spawnAllies(); this.startWave(); this.publishHud();
  }
  update(time: number): void {
    if (this.ended) return;
    if (!isFlying(this.hero)) this.recoverFromTerrain(this.player);
    const horizontal = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown);
    const vertical = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown);
    const movement = direction(horizontal, vertical);
    const profile = HERO_PROFILES[this.hero];
    this.player.setVelocity(movement.x * profile.speed, movement.y * profile.speed);
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
      if (this.playerShot || time < this.actionUntil) { this.player.setVelocity(movement.x * 90, movement.y * 90); this.player.setFlipX((this.playerShot?.aim ?? this.facing).x > 0); }
      else if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk-${row}`, true);
      else { this.player.anims.play(`${this.hero}-idle`, true); this.player.setFlipX(this.facing.x > 0); }
    } else {
      if (horizontal || vertical) this.player.anims.play(`${this.hero}-walk`, true);
      else this.player.anims.play(`${this.hero}-idle`, true);
      this.player.setFlipX(this.facing.x > 0);
    }
    const attackRequested = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.pointerAttack;
    this.pointerAttack = false;
    if (attackRequested && time - this.lastAttack >= profile.cooldown) {
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
      if (Phaser.Math.Distance.BetweenPoints(arrow.getData('origin') as Point, this.bodyCenter(arrow)) > (arrow.getData('maxRange') as number) || time >= (arrow.getData('expires') as number) || arrow.x < 0 || arrow.y < 0 || arrow.x > WORLD.width || arrow.y > WORLD.height) arrow.destroy();
    }
    this.drawHealthBars();
    if (this.spawning === 0 && this.enemies.countActive() === 0 && !this.advancing) {
      this.advancing = true;
      this.game.events.emit('notice', `Wave ${this.wave} cleared. Catch your breath…`);
      this.time.delayedCall(1600, () => { this.wave++; this.advancing = false; this.startWave(); });
    }
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
  private recoverFromTerrain(sprite: Enemy): void {
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
  private faction(unit: Enemy): 'player' | 'ally' | 'enemy' {
    return unit === this.player ? 'player' : unit.getData('faction') === 'ally' ? 'ally' : 'enemy';
  }
  private chooseTarget(unit: Enemy, current?: Enemy): Enemy | undefined {
    const targets = this.faction(unit) === 'ally'
      ? this.enemies.getChildren() as Enemy[]
      : [this.player, ...this.allies.getChildren() as Enemy[]];
    const origin = this.bodyCenter(unit);
    let living = targets.filter(target => target.active && (target === this.player ? !this.ended : target.getData('health') > 0));
    if (this.faction(unit) === 'enemy' && isFlying(this.hero) && !this.navigation.isWalkable(this.bodyCenter(this.player))) {
      const reachableAllies = living.filter(target => target !== this.player && this.targetFields.get(target)?.hasRoute(origin));
      if (reachableAllies.length) living = reachableAllies;
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
    else this.damageEnemy(target, arrow.getData('damage'), arrow.getData('weapon'));
    arrow.destroy(); this.game.events.emit('effect', 'damage', { volume: 0.3 });
  }
  private spawnAllies(): void {
    for (const [x, y] of [[168, 280], [120, 230]]) {
      const ally = this.allies.create(x, y, 'soldier') as Enemy;
      ally.setSize(28, 28).setOffset(11, 15).setCollideWorldBounds(true).setTint(0x8edfff).setDepth(9);
      ally.setData({ faction: 'ally', weapon: 'sword', health: 100, maxHealth: 100, defense: 3, resistance: 2, damage: 18, speed: 85 });
      const marker = this.add.text(x, y, 'ALLY', { fontFamily: 'system-ui', fontSize: '10px', color: '#9de6ff', backgroundColor: '#15201b' }).setDepth(21);
      ally.setData('weaponMarker', marker);
      this.targetFields.set(ally, new NavigationField(WORLD.width, WORLD.height, OBSTACLES));
      this.allyRoutes.set(ally, new NavigationField(WORLD.width, WORLD.height, OBSTACLES));
      ally.once('destroy', () => { marker.destroy(); this.targetFields.delete(ally); this.allyRoutes.delete(ally); });
    }
  }
  private updateEnemy(enemy: Enemy, time: number): void {
    this.recoverFromTerrain(enemy);
    const definition = ENEMY_TYPES.find(type => type.key === enemy.texture.key) ?? ENEMY_TYPES[0];
    let brain = this.brains.get(enemy);
    if (!brain || brain.type !== definition.key) {
      brain = { type: definition.key, phase: 'chase', aim: { x: 1, y: 0 }, target: { x: 0, y: 0 }, strikeAt: 0, recoverUntil: 0, nextAttackAt: time + 250, retreating: false };
      this.brains.set(enemy, brain);
    }
    if (brain.phase === 'chase') brain.targetUnit = this.chooseTarget(enemy, brain.targetUnit);
    const targetUnit = brain.targetUnit;
    if (!targetUnit?.active) {
      brain.phase = 'chase'; brain.targetUnit = undefined;
      enemy.setVelocity(0); enemy.anims.play(`${enemy.texture.key}-idle`, true); return;
    }
    const origin = this.bodyCenter(enemy), target = this.bodyCenter(targetUnit);
    const route = this.faction(enemy) === 'ally' ? this.allyRoutes.get(enemy)! : targetUnit === this.player ? this.navigation : this.targetFields.get(targetUnit)!;
    if (this.faction(enemy) === 'ally') route.setTarget(target, isFlying(this.hero) && targetUnit === this.player);
    const distance = Phaser.Math.Distance.Between(origin.x, origin.y, target.x, target.y);
    const visible = this.hasLineOfSight(origin, target);
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
      enemy.setVelocity(0).setFlipX(brain.aim.x > 0); enemy.anims.play(`${enemy.texture.key}-action`);
      this.drawTelegraph(enemy, brain, definition);
      return;
    }
    const holdPosition = attack.kind === 'melee' ? distance <= attack.range * 0.9 && visible : distance <= 260 && visible && !brain.retreating;
    if (holdPosition) { enemy.setVelocity(0); enemy.anims.play(`${enemy.texture.key}-idle`, true); return; }
    const waypoint = !brain.retreating && route.canTravel(origin, target)
      ? target : route.nextWaypoint(origin, brain.retreating);
    if (!waypoint) { enemy.setVelocity(0); enemy.anims.stop(); return; }
    const movement = direction(waypoint.x - origin.x, waypoint.y - origin.y);
    const speed = enemy.getData('speed') as number;
    // Reach cell centers without overshooting them at low frame rates.
    const stepSpeed = Math.min(speed, Phaser.Math.Distance.Between(origin.x, origin.y, waypoint.x, waypoint.y) / Math.max(this.game.loop.delta / 1000, 0.001));
    enemy.setVelocity(movement.x * stepSpeed, movement.y * stepSpeed).setFlipX(movement.x > 0);
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
    if (inMeleeRange(origin, target, brain.aim, definition.attack.range) && this.hasLineOfSight(origin, target)) {
      if (targetUnit === this.player) this.takeDamage(enemy.getData('damage') as number, definition.weapon);
      else this.damageEnemy(targetUnit, enemy.getData('damage') as number, definition.weapon);
    }
  }
  private hasLineOfSight(from: Point, to: Point): boolean {
    const line = new Phaser.Geom.Line(from.x, from.y, to.x, to.y);
    return !OBSTACLES.some(([x, y, width, height]) => Phaser.Geom.Intersects.LineToRectangle(line, new Phaser.Geom.Rectangle(x, y, width, height)));
  }
  private fireArrow(source: Enemy, aim: Point, faction: 'player' | 'ally' | 'enemy' = 'enemy', weapon: WeaponType = 'bow'): void {
    const origin = this.bodyCenter(source);
    const magic = weapon === 'tome';
    const arrow = this.arrows.create(origin.x + aim.x * 28, origin.y + aim.y * 28, magic ? 'fire-bolt' : 'arrow', magic ? undefined : 'shaft') as Enemy;
    const speed = faction === 'player' ? 360 : 230;
    const range = faction === 'player' ? HERO_PROFILES[this.hero].range : (ENEMY_TYPES.find(type => type.key === source.texture.key) ?? ENEMY_TYPES[0]).attack.range;
    arrow.setDisplaySize(magic ? 24 : 40, magic ? 24 : 8).setRotation(Math.atan2(aim.y, aim.x) + (magic ? Math.PI / 2 : Math.PI)).setDepth(12);
    if (faction === 'player' && !magic) arrow.setTint(0x9de6ff);
    arrow.setSize(10 / arrow.scaleX, 10 / arrow.scaleY).setVelocity(aim.x * speed, aim.y * speed);
    arrow.setData({ faction, weapon, origin, minRange: faction === 'player' ? HERO_PROFILES[this.hero].minRange : 0, maxRange: range,
      damage: faction === 'player' ? HERO_PROFILES[this.hero].damage : source.getData('damage'), expires: this.time.now + range / speed * 1000 });
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
    this.playerWeapon.setPosition(Phaser.Math.Clamp(this.player.x + 34, 8, WORLD.width - 8), Math.max(8, this.player.y - 32));
    this.flightShadow.setPosition(this.player.x, this.player.y + 22);
    this.healthBar.clear().fillStyle(0x15201b).fillRect(this.player.x - 25, this.player.y - 36, 50, 8)
      .fillStyle(0x7fce88).fillRect(this.player.x - 24, this.player.y - 35, 48 * this.health / 100, 6);
    for (const object of [...this.enemies.getChildren(), ...this.allies.getChildren()]) {
      const enemy = object as Enemy;
      const fraction = Phaser.Math.Clamp((enemy.getData('health') as number) / (enemy.getData('maxHealth') as number), 0, 1);
      const x = Phaser.Math.Clamp(enemy.x - 20, 1, WORLD.width - 41);
      const y = Math.max(1, enemy.y - 34);
      const weapon = this.enemyWeapon(enemy);
      const matchup = weaponMatchup(HERO_PROFILES[this.hero].weapon, weapon);
      const color = matchup === 1 ? 0x7fce88 : matchup === -1 ? 0xffb070 : 0xb2cad0;
      // Weapon initials and +/- make matchup readable without relying on color alone.
      const label = this.faction(enemy) === 'ally' ? 'ALLY' : `${matchup === 1 ? '+' : matchup === -1 ? '-' : ''}`;
      const marker = enemy.getData('weaponMarker') as Phaser.GameObjects.Text | undefined;
      const icon = enemy.getData('weaponIcon') as Phaser.GameObjects.Image | undefined;
      icon?.setPosition(Math.min(x + 48, WORLD.width - 8), y + 3);
      if (marker) marker.setPosition(Math.min(x + 58, WORLD.width - 12), y - 4).setText(label).setColor(this.faction(enemy) === 'ally' ? '#9de6ff' : `#${color.toString(16).padStart(6, '0')}`);
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
    const candidates = this.navigation.reachablePoints().filter(point => validSpawn(point.x, point.y, OBSTACLES, this.bodyCenter(this.player)));
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
    const marker = this.add.text(enemy.x, enemy.y, '', { fontFamily: 'system-ui', fontSize: '11px', backgroundColor: '#15201b' }).setDepth(21);
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
    this.player.setFlipX(this.facing.x > 0);
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
      hit = true; this.damageEnemy(enemy, profile.damage, profile.weapon);
    }
    if (hit) this.game.events.emit('effect', 'damage', { volume: 0.3 });
  }
  private damageEnemy(enemy: Enemy, base: number, weapon: WeaponType): void {
    const protection = (enemy.getData(weapon === 'tome' ? 'resistance' : 'defense') as number | undefined) ?? 0;
    const damage = combatDamage(Math.max(1, base - protection), weapon, this.enemyWeapon(enemy));
    const health = (enemy.getData('health') as number) - damage;
    enemy.setData('health', health);
    const text = this.add.text(enemy.x, enemy.y - 42, `${damage}${weaponMatchup(weapon, this.enemyWeapon(enemy)) === 1 ? ' ↑' : weaponMatchup(weapon, this.enemyWeapon(enemy)) === -1 ? ' ↓' : ''}`,
      { fontFamily: 'system-ui', fontSize: '13px', color: '#f5edda', stroke: '#15201b', strokeThickness: 3 }).setDepth(25);
    this.tweens.add({ targets: text, y: text.y - 18, alpha: 0, duration: 650, onComplete: () => text.destroy() });
    if (health <= 0) {
      const { x, y } = enemy; const hostile = this.faction(enemy) === 'enemy'; enemy.destroy(); if (hostile) this.kills++;
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
    const damage = combatDamage(base, weapon, HERO_PROFILES[this.hero].weapon, isFlying(this.hero));
    if (this.ended || this.time.now - this.lastDamage < 700) return;
    this.lastDamage = this.time.now;
    this.health = Math.max(0, this.health - damage);
    this.game.events.emit('effect', 'damage', { volume: 0.2 });
    this.game.events.emit('hero-voice', { hero: this.hero, event: this.health <= 0 ? 'death' : 'damage' });
    this.player.setTint(0xffaaaa);
    this.time.delayedCall(180, () => { if (this.player.active) this.player.clearTint(); });
    this.publishHud();
    if (this.health === 0) {
      this.game.events.emit('effect', 'death', { volume: 0.3 });
      this.playerShot = undefined; this.aimGuide.clear(); this.telegraphs.clear();
      this.ended = true; this.arrows.clear(true, true); this.physics.pause(); this.time.removeAllEvents();
      this.game.events.emit('game-over', { wave: this.wave, kills: this.kills });
    }
  }
  private publishHud(): void {
    this.game.events.emit('hud', { health: this.health, wave: this.wave, kills: this.kills, enemies: this.enemies.countActive() } satisfies Hud);
  }
}
