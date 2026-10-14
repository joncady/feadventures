import Phaser from 'phaser';
import {COMMANDER_IDS} from '../data/commanders';
import {CAMPAIGN_MAPS} from '../data/maps';
import {EXPANDED_CAMPAIGN_MAPS} from '../data/campaign-expansion';
import { MOVEMENT_ROWS } from '../data/animation-layout';
import { AUDIO_ASSETS } from '../data/audio-assets';
import { ENEMY_TYPES, HEROES, HERO_SHEETS } from '../data/config';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload(): void {
    if (this.textures.exists('map')) return;
    this.load.setPath(`${import.meta.env.BASE_URL}assets/`);
    this.load.image('ui-parchment', 'ui-parchment.png');
    this.load.image('map', 'map.png');
    this.load.image('battlefield', 'battlefield.png');
    this.load.image('siege-wall','siege-wall.png');
    this.load.image('hero-camp','maps/camp-building.png');
    this.load.image('objective-standard','maps/objective-standard.png');
    this.load.image('gold','maps/gold-icon.png');
    this.load.image('fire-bolt','maps/fire-bolt.png');
    for(const map of new Map([...CAMPAIGN_MAPS,...EXPANDED_CAMPAIGN_MAPS].map(map=>[map.backgroundKey,map])).values())this.load.image(map.backgroundKey,map.backgroundPath);
    this.load.image('title', 'titleScreen.png');
    this.load.image('vulnerary', 'vulnerary.png');
    this.load.image('slash', 'slash.png');
    this.load.image('arrow', 'arrow.png');
    for (const weapon of ['sword', 'axe', 'lance', 'bow', 'tome','staff']) this.load.image(`weapon-${weapon}`, `weapon-${weapon}.png`);
    for (const hero of HEROES) this.load.image(`portrait-${hero}`, `${hero === 'chrom' ? 'chromPortrait1' : hero === 'lucina' ? 'lucinaPortrait1' : hero === 'frederick' ? 'frederickPortrait1' : hero + 'Portrait'}.png`);
    for(const hero of HEROES)this.load.image(`portrait-selected-${hero}`,`${hero}${['chrom','lucina','frederick'].includes(hero)?'Portrait2':'PortraitSelected'}.png`);
    // The original sheets have ten rows across 492px; slice row zero explicitly.
    for (const hero of HEROES) this.load.spritesheet(hero, `${hero}${['chrom', 'lucina', 'frederick'].includes(hero) ? '-animated' : ''}.png`, { frameWidth: 50, frameHeight: HERO_SHEETS[hero].frameHeight, endFrame: HERO_SHEETS[hero].directional ? 39 : 3 });
    for(const id of COMMANDER_IDS){this.load.spritesheet(id,`${id}-animated.png`,{frameWidth:50,frameHeight:50,endFrame:39});this.load.image(`portrait-${id}`,`${id}Portrait.png`);}
    for (const enemy of ENEMY_TYPES) this.load.spritesheet(enemy.key, enemy.file.replace('.png', '-animated.png'), { frameWidth: 50, frameHeight: 50, endFrame: 39 });
    for (const [key, file] of [['attack', 'attack.mp3'], ['damage', 'damage.mp3'], ['music', 'purpose.mp3'], ['arrow-fire', 'arrowFire.mp3'], ['death', 'defeated.mp3'], ['music-menu', 'purpose.mp3']] as const) this.load.audio(key, file);
    this.load.audio('battle-start', 'audio/battle-start.wav');
    this.load.audio('level-up','audio/level-up.wav');
    for(const [key,file] of [['axe-impact','effect-WARC_EFFECT_1.wav'],['lance-thrust','effect-WARC_EFFECT_10.wav'],['fire-cast','effect-WARC_EFFECT_11.wav']])this.load.audio(key,`audio/${file}`);
    this.load.audio('xp-tick','audio/ui-move.wav');
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
    this.textures.get('arrow').add('shaft', 0, 0, 40, 100, 20);
    for (const key of [...HEROES, ...ENEMY_TYPES.map(enemy => enemy.key),...COMMANDER_IDS]) {
      this.anims.create({ key: `${key}-idle`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `${key}-walk`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
    // Verified against source contact sheets: down-left row 6, down-right row 7.
    const movementRows = Object.entries(MOVEMENT_ROWS);
    for (const key of [...HEROES, ...ENEMY_TYPES.map(type => type.key),...COMMANDER_IDS]) {
      for (const [name, importedRow] of movementRows) {
        const row = importedRow;
        this.anims.create({ key: `${key}-walk-${name}`, frames: this.anims.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: 8, repeat: -1 });
      }
    }
    for (const hero of [...HEROES, ...ENEMY_TYPES.map(type => type.key),...COMMANDER_IDS]) this.anims.create({ key: `${hero}-action`, frames: this.anims.generateFrameNumbers(hero, { start: 4, end: 7 }), frameRate: 20 });
    this.anims.create({ key: 'virion-shoot', frames: this.anims.generateFrameNumbers('virion', { start: 4, end: 7 }), frameRate: 16 });
    this.game.events.emit('assets-ready');
  }
}
