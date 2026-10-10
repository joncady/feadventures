import Phaser from 'phaser';
import { ENEMY_TYPES, HEROES, HERO_SHEETS } from '../data/config';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    if (this.textures.exists('map')) return;
    this.load.setPath(`${import.meta.env.BASE_URL}assets/`);
    this.load.image('map', 'map.png');
    this.load.image('title', 'titleScreen.png');
    this.load.image('vulnerary', 'vulnerary.png');
    this.load.image('slash', 'slash.png');
    this.load.image('arrow', 'arrow.png');
    for (const weapon of ['sword', 'axe', 'lance', 'bow', 'tome']) this.load.image(`weapon-${weapon}`, `weapon-${weapon}.png`);
    // The original sheets have ten rows across 492px; slice row zero explicitly.
    for (const hero of HEROES) this.load.spritesheet(hero, `${hero}.png`, { frameWidth: 50, frameHeight: HERO_SHEETS[hero].frameHeight, endFrame: HERO_SHEETS[hero].directional ? 39 : 3 });
    for (const enemy of ENEMY_TYPES) this.load.spritesheet(enemy.key, enemy.file, { frameWidth: 50, frameHeight: 49, endFrame: 3 });
    for (const [key, file] of [['attack', 'attack.mp3'], ['damage', 'damage.mp3'], ['music', 'purpose.mp3'], ['arrow-fire', 'arrowFire.mp3'], ['death', 'defeated.mp3']] as const) this.load.audio(key, file);
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.game.events.emit('asset-error', file.key));
  }
  create(): void {
    this.add.image(448, 272, 'title');
    if (this.anims.exists('chrom-idle')) { this.game.events.emit('assets-ready'); return; }
    const fire = this.add.graphics();
    fire.fillStyle(0xff6d22, 0.3).fillCircle(12, 12, 12);
    fire.fillStyle(0xff6d22).fillCircle(12, 12, 8);
    fire.fillStyle(0xffe8a2).fillTriangle(7, 17, 12, 3, 17, 17);
    fire.generateTexture('fire-bolt', 24, 24); fire.destroy();
    this.textures.get('arrow').add('shaft', 0, 0, 40, 100, 20);
    for (const key of [...HEROES, ...ENEMY_TYPES.map(enemy => enemy.key)]) {
      this.anims.create({ key: `${key}-idle`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `${key}-walk`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
    // Verified Archer blue palette: idle row 0, bow action row 1, cardinal walk rows 2–5 and diagonal rows 6–9.
    for (const hero of HEROES.filter(hero => HERO_SHEETS[hero].directional)) for (const [name, row] of [['left', 2], ['right', 3], ['down', 4], ['up', 5], ['down-right', 6], ['down-left', 7], ['up-right', 8], ['up-left', 9]] as const) {
      this.anims.create({ key: `${hero}-walk-${name}`, frames: this.anims.generateFrameNumbers(hero, { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
    }
    for (const hero of HEROES.filter(hero => HERO_SHEETS[hero].directional)) this.anims.create({ key: `${hero}-action`, frames: this.anims.generateFrameNumbers(hero, { start: 4, end: 7 }), frameRate: 20 });
    this.anims.create({ key: 'virion-shoot', frames: this.anims.generateFrameNumbers('virion', { start: 4, end: 7 }), frameRate: 16 });
    this.game.events.emit('assets-ready');
  }
}
