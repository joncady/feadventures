import Phaser from 'phaser';
import { ENEMY_TYPES, OBSTACLES, WORLD, type Hero } from '../data/config';
import { direction, inMeleeRange, validSpawn, waveSize, type Point } from '../systems/rules';

type Enemy = Phaser.Physics.Arcade.Sprite;
export interface Hud { health: number; wave: number; kills: number; enemies: number }
export class ArenaScene extends Phaser.Scene {
  private hero: Hero = 'chrom';
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private health = 100;
  private wave = 1;
  private kills = 0;
  private facing: Point = { x: 1, y: 0 };
  private lastAttack = -Infinity;
  private lastDamage = -Infinity;
  private spawning = 0;
  private advancing = false;
  private ended = false;
  private healthBar!: Phaser.GameObjects.Graphics;
  constructor() { super('Arena'); }
  init(data: { hero?: Hero }): void {
    this.hero = data.hero ?? 'chrom';
    this.health = 100; this.wave = 1; this.kills = 0;
    this.facing = { x: 1, y: 0 }; this.lastAttack = -Infinity;
    this.lastDamage = -Infinity; this.spawning = 0; this.advancing = false; this.ended = false;
  }
  create(): void {
    this.add.image(WORLD.width / 2, WORLD.height / 2, 'map').setDisplaySize(WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.walls = this.physics.add.staticGroup();
    for (const [x, y, width, height] of OBSTACLES) {
      const wall = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.walls.add(wall);
    }
    this.player = this.physics.add.sprite(190, 230, this.hero).setCollideWorldBounds(true).setDepth(10);
    this.player.setSize(28, 28).setOffset(11, 15);
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => this.takeDamage(enemy as Enemy));
    this.physics.add.overlap(this.player, this.pickups, (_player, item) => {
      item.destroy(); this.health = Math.min(100, this.health + 25); this.publishHud();
    });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.healthBar = this.add.graphics().setDepth(20);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.resetKeys();
      this.tweens.killAll();
      this.time.removeAllEvents();
    });
    this.startWave(); this.publishHud();
  }
  update(time: number): void {
    if (this.ended) return;
    const horizontal = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown);
    const vertical = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown);
    const movement = direction(horizontal, vertical);
    this.player.setVelocity(movement.x * 170, movement.y * 170);
    if (horizontal || vertical) { this.facing = movement; this.player.anims.play(`${this.hero}-walk`, true); }
    else { this.player.anims.stop(); this.player.setFrame(0); }
    this.player.setFlipX(this.facing.x > 0);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && time - this.lastAttack >= 320) {
      this.lastAttack = time; this.attack();
    }
    for (const object of this.enemies.getChildren()) {
      const enemy = object as Enemy;
      const move = direction(this.player.x - enemy.x, this.player.y - enemy.y);
      const speed = enemy.getData('speed') as number;
      enemy.setVelocity(move.x * speed, move.y * speed).setFlipX(move.x > 0);
      enemy.anims.play(`${enemy.texture.key}-walk`, true);
    }
    this.healthBar.clear().fillStyle(0x15201b).fillRect(this.player.x - 24, this.player.y - 35, 48, 6)
      .fillStyle(0x7fce88).fillRect(this.player.x - 24, this.player.y - 35, 48 * this.health / 100, 6);
    if (this.spawning === 0 && this.enemies.countActive() === 0 && !this.advancing) {
      this.advancing = true;
      this.game.events.emit('notice', `Wave ${this.wave} cleared. Catch your breath…`);
      this.time.delayedCall(1600, () => { this.wave++; this.advancing = false; this.startWave(); });
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
    let position: Point | undefined;
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = Phaser.Math.Between(26, WORLD.width - 26), y = Phaser.Math.Between(26, WORLD.height - 26);
      if (validSpawn(x, y, OBSTACLES, this.player)) { position = { x, y }; break; }
    }
    // Known open area; bounded retries cannot hang the browser.
    position ??= { x: 850, y: 180 };
    const type = ENEMY_TYPES[Phaser.Math.Between(0, ENEMY_TYPES.length - 1)];
    const enemy = this.enemies.create(position.x, position.y, type.key) as Enemy;
    enemy.setSize(28, 28).setOffset(11, 15).setCollideWorldBounds(true).setDepth(9);
    enemy.setData({ health: type.health, speed: type.speed + Math.min(25, this.wave * 2), damage: type.damage });
    this.spawning--; this.publishHud();
  }
  private attack(): void {
    this.sound.play('attack', { volume: 0.25 });
    const slash = this.add.image(this.player.x + this.facing.x * 45, this.player.y + this.facing.y * 45, 'slash')
      .setDisplaySize(65, 65).setRotation(Math.atan2(this.facing.y, this.facing.x)).setDepth(15);
    this.tweens.add({ targets: slash, alpha: 0, duration: 160, onComplete: () => slash.destroy() });
    for (const object of [...this.enemies.getChildren()]) {
      const enemy = object as Enemy;
      if (!inMeleeRange(this.player, enemy, this.facing)) continue;
      const health = (enemy.getData('health') as number) - 35;
      enemy.setData('health', health);
      if (health <= 0) {
        const { x, y } = enemy;
        enemy.destroy(); this.kills++;
        if (Phaser.Math.Between(1, 5) === 1 && this.pickups.countActive() < 3) {
          const item = this.pickups.create(x, y, 'vulnerary') as Phaser.Physics.Arcade.Sprite;
          item.setDisplaySize(20, 20); item.setSize(item.width, item.height);
          this.time.delayedCall(12000, () => { if (item.active) item.destroy(); });
        }
      } else {
        enemy.setTint(0xffb5a0);
        this.time.delayedCall(120, () => { if (enemy.active) enemy.clearTint(); });
      }
    }
    this.publishHud();
  }
  private takeDamage(enemy: Enemy): void {
    if (this.ended || this.time.now - this.lastDamage < 700) return;
    this.lastDamage = this.time.now;
    this.health = Math.max(0, this.health - (enemy.getData('damage') as number));
    this.sound.play('damage', { volume: 0.2 });
    this.player.setTint(0xffaaaa);
    this.time.delayedCall(180, () => { if (this.player.active) this.player.clearTint(); });
    this.publishHud();
    if (this.health === 0) {
      this.ended = true; this.physics.pause(); this.time.removeAllEvents();
      this.game.events.emit('game-over', { wave: this.wave, kills: this.kills });
    }
  }
  private publishHud(): void {
    this.game.events.emit('hud', { health: this.health, wave: this.wave, kills: this.kills, enemies: this.enemies.countActive() } satisfies Hud);
  }
}
