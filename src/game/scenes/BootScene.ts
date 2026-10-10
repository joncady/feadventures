import Phaser from 'phaser';
import { AUDIO_ASSETS } from '../data/audio-assets';
import { ENEMY_TYPES, HEROES, HERO_SHEETS } from '../data/config';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    if (this.textures.exists('map')) return;
    this.load.setPath(`${import.meta.env.BASE_URL}assets/`);
    this.load.image('ui-parchment', 'ui-parchment.png');
    this.load.image('map', 'map.png');
    this.load.image('title', 'titleScreen.png');
    this.load.image('vulnerary', 'vulnerary.png');
    this.load.image('slash', 'slash.png');
    this.load.image('arrow', 'arrow.png');
    for (const weapon of ['sword', 'axe', 'lance', 'bow', 'tome']) this.load.image(`weapon-${weapon}`, `weapon-${weapon}.png`);
    for (const hero of HEROES) this.load.image(`portrait-${hero}`, `${hero === 'chrom' ? 'chromPortrait1' : hero === 'lucina' ? 'lucinaPortrait1' : hero === 'frederick' ? 'frederickPortrait1' : hero + 'Portrait'}.png`);
    // The original sheets have ten rows across 492px; slice row zero explicitly.
    for (const hero of HEROES) this.load.spritesheet(hero, `${hero}${['chrom', 'lucina', 'frederick'].includes(hero) ? '-animated' : ''}.png`, { frameWidth: 50, frameHeight: HERO_SHEETS[hero].frameHeight, endFrame: HERO_SHEETS[hero].directional ? 39 : 3 });
    for (const enemy of ENEMY_TYPES) this.load.spritesheet(enemy.key, enemy.file.replace('.png', '-animated.png'), { frameWidth: 50, frameHeight: 50, endFrame: 39 });
    for (const [key, file] of [['attack', 'attack.mp3'], ['damage', 'damage.mp3'], ['music', 'purpose.mp3'], ['arrow-fire', 'arrowFire.mp3'], ['death', 'defeated.mp3']] as const) this.load.audio(key, file);
    this.load.audio('battle-start', 'audio/battle-start.wav');
    for (const key of ['axe-impact', 'lance-thrust', 'fire-cast', 'xp-tick', 'level-up']) this.load.audio(key, `audio/${key}.wav`);
    for (const clip of AUDIO_ASSETS) this.load.audio(clip.key, clip.file);
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.game.events.emit('asset-error', file.key));
  }
  create(): void {
    void document.fonts.load('14px FE').then(() => this.createLoadedInterface()).catch(() => this.game.events.emit('asset-error', 'FE font'));
  }
  private createLoadedInterface(): void {
    this.add.image(448, 272, 'title');
    if (!this.scene.isActive('Interface')) this.scene.launch('Interface');
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
    // Legacy sheets have the opposite down-diagonal row order to the new imports.
    const groundDiagonals = ['chrom', 'lucina', 'frederick', 'soldier', 'assassin', 'heavy', 'knight', 'archer', 'morgan', 'robin', 'robin-female', 'lissa', 'lonqu', 'miriel', 'ricken', 'stahl', 'sully', 'tharja', 'vaike', 'mage', 'axeman'];
    const movementRows = [['left', 2], ['right', 3], ['down', 4], ['up', 5], ['down-right', 7], ['down-left', 6], ['up-right', 8], ['up-left', 9]] as const;
    for (const key of [...HEROES, ...ENEMY_TYPES.map(type => type.key)]) {
      for (const [name, importedRow] of movementRows) {
        const row = groundDiagonals.includes(key) && (importedRow === 6 || importedRow === 7) ? 13 - importedRow : importedRow;
        this.anims.create({ key: `${key}-walk-${name}`, frames: this.anims.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
      }
    }
    for (const hero of [...HEROES, ...ENEMY_TYPES.map(type => type.key)]) this.anims.create({ key: `${hero}-action`, frames: this.anims.generateFrameNumbers(hero, { start: 4, end: 7 }), frameRate: 20 });
    this.anims.create({ key: 'virion-shoot', frames: this.anims.generateFrameNumbers('virion', { start: 4, end: 7 }), frameRate: 16 });
    this.game.events.emit('assets-ready');
  }
}
