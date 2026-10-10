import Phaser from 'phaser';
import { ENEMY_TYPES, HEROES } from '../data/config';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    this.load.setPath(`${import.meta.env.BASE_URL}assets/`);
    this.load.image('map', 'map.png');
    this.load.image('title', 'titleScreen.png');
    this.load.image('vulnerary', 'vulnerary.png');
    this.load.image('slash', 'slash.png');
    // The original sheets have ten rows across 492px; slice row zero explicitly.
    for (const hero of HEROES) this.load.spritesheet(hero, `${hero}.png`, { frameWidth: 50, frameHeight: 49, endFrame: 3 });
    for (const enemy of ENEMY_TYPES) this.load.spritesheet(enemy.key, enemy.file, { frameWidth: 50, frameHeight: 49, endFrame: 3 });
    for (const [key, file] of [['attack', 'attack.mp3'], ['damage', 'damage.mp3'], ['music', 'purpose.mp3']] as const) this.load.audio(key, file);
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.game.events.emit('asset-error', file.key));
  }
  create(): void {
    this.add.image(448, 272, 'title');
    for (const key of [...HEROES, ...ENEMY_TYPES.map(enemy => enemy.key)]) {
      this.anims.create({ key: `${key}-walk`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
    this.game.events.emit('ready');
  }
}
