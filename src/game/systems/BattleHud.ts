import Phaser from 'phaser';
import { HERO_NAMES, HERO_PROFILES, WORLD, type Hero } from '../data/config';
import { CLASS_NAMES, INVENTORY_CAPACITY, equippedWeapon, initialLoadout } from '../data/equipment';
import { STAT_KEYS, attackPower, type Progress, type Stats } from './progression';

export class BattleHud {
  private graphics: Phaser.GameObjects.Graphics;
  private top: Phaser.GameObjects.Text;
  private title: Phaser.GameObjects.Text;
  private hp: Phaser.GameObjects.Text;
  private xp: Phaser.GameObjects.Text;
  private stats: Phaser.GameObjects.Text;
  private combat: Phaser.GameObjects.Text;
  private orders: Phaser.GameObjects.Text;
  private growth: Phaser.GameObjects.Text;
  private displayedXp = 0;
  private displayedLevel = 1;
  private pendingXp = 0;
  private filling = false;
  private snapshot = '';
  private health = 100;
  private maxHealth = 100;
  private readonly x = WORLD.width - 248;
  private readonly y = WORLD.height - 226;
  constructor(private scene: Phaser.Scene, private hero: Hero, toggleOrders: () => void) {
    const style = { fontFamily: 'FE', fontSize: '12px', color: '#44351e' };
    scene.add.nineslice(this.x, this.y, 'ui-parchment', undefined, 240, 216, 16, 16, 16, 16).setOrigin(0).setDepth(100);
    scene.add.zone(this.x, this.y, 240, 216).setOrigin(0).setDepth(100).setInteractive();
    this.graphics = scene.add.graphics().setDepth(101);
    this.top = scene.add.text(12, 9, '', { ...style, color: '#f8eac6' }).setDepth(101).setVisible(false);
    this.title = scene.add.text(this.x + 84, this.y + 10, HERO_NAMES[hero], { ...style, fontSize: '14px', color: '#f8eac6' }).setDepth(102);
    scene.add.text(this.x + 84, this.y + 29, CLASS_NAMES[hero], { ...style, fontSize: '11px' }).setDepth(102);
    // Use the upper half of the original bust so the face is readable at HUD size.
    const portrait = scene.textures.get(`portrait-${hero}`);
    const source = portrait.getSourceImage() as HTMLImageElement;
    if (!portrait.has('hud-face')) portrait.add('hud-face', 0, source.width * .3, source.height * .03, source.width * .4, source.height * .48);
    scene.add.image(this.x + 44, this.y + 44, `portrait-${hero}`, 'hud-face').setDisplaySize(58, 62).setDepth(102);
    this.xp = scene.add.text(this.x + 84, this.y + 45, '', { ...style, fontSize: '11px' }).setDepth(102);
    this.hp = scene.add.text(this.x + 84, this.y + 64, '', style).setDepth(102);
    this.stats = scene.add.text(this.x + 15, this.y + 88, '', { ...style, lineSpacing: 2 }).setDepth(102);
    this.combat = scene.add.text(this.x + 86, this.y + 88, '', { ...style, fontSize: '11px', lineSpacing: 2 }).setDepth(102);
    const loadout = initialLoadout(hero);
    for (let slot = 0; slot < INVENTORY_CAPACITY; slot++) {
      const y = this.y + 117 + slot * 15;
      scene.add.rectangle(this.x + 159, y + 7, 140, 14, slot === loadout.equippedSlot ? 0xfaf0c3 : 0xe8d5a5, .7).setDepth(101);
      const item = loadout.items[slot];
      if (item) {
        const weapon = equippedWeapon({ ...loadout, equippedSlot: slot });
        scene.add.image(this.x + 95, y + 7, weapon.icon).setDisplaySize(12, 12).setDepth(102);
        scene.add.text(this.x + 105, y, weapon.name, { ...style, fontSize: '11px' }).setDepth(102);
        scene.add.text(this.x + 216, y, item.uses === null ? '∞' : String(item.uses), { ...style, fontSize: '11px' }).setDepth(102);
      } else scene.add.text(this.x + 105, y, '—', { ...style, color: '#897449', fontSize: '11px' }).setDepth(102);
    }
    this.orders = scene.add.text(this.x + 15, this.y + 196, '', { ...style, fontSize: '10px', color: '#183e57' }).setDepth(102).setInteractive({ useHandCursor: true });
    this.orders.on('pointerdown', toggleOrders);
    this.growth = scene.add.text(this.x + 10, this.y - 38, '', { ...style, fontSize: '11px', color: '#fff2c4', backgroundColor: '#183e57', wordWrap: { width: 222 } }).setDepth(102);
  }
  update(progress: Progress, health: number, wave: number, kills: number, mode: string, allies: number): void {
    this.health = health; this.maxHealth = progress.stats.hp;
    const snapshot = JSON.stringify([progress.stats, health, wave, kills, mode, allies]);
    if (snapshot !== this.snapshot) {
      this.snapshot = snapshot;
      this.top.setText(`Wave ${wave}  ·  Defeated ${kills}  ·  Allies ${allies}/2`);
      this.hp.setText(`HP  ${health}/${progress.stats.hp}`);
      const s = progress.stats;
      this.stats.setText(`Str   ${s.str}\nMag ${s.mag}\nSkl   ${s.skill}\nSpd ${s.speed}\nLck   ${s.luck}\nDef   ${s.def}\nRes   ${s.res}`);
      const profile = HERO_PROFILES[this.hero];
      this.combat.setText(`Atk ${attackPower(progress, this.hero)}     Rng ${profile.minRange ? `${profile.minRange}–` : ''}${profile.range}px\nCrit ${Math.round(Math.min(.25, ((s.skill-progress.base.skill)/2+(s.luck-progress.base.luck)/4)/100)*100)}%`);
      this.orders.setText(`[Q] ${mode.toUpperCase()}  ·  ${allies} soldiers`);
    }
    this.draw();
  }
  gain(amount: number, gains: Stats[]): void {
    this.pendingXp += amount;
    if (gains.length) {
      const summary = STAT_KEYS.map(k => [k, gains.reduce((n, g) => n + g[k], 0)] as const).filter(([, v]) => v > 0).map(([k, v]) => `${k.toUpperCase()} +${v}`).join('  ');
      this.growth.setText(summary || 'Level up');
      this.scene.time.delayedCall(3500, () => this.growth.setText(''));
    }
    if (!this.filling) this.fill();
  }
  private fill(): void {
    if (!this.pendingXp) { this.filling = false; return; }
    this.filling = true;
    const amount = Math.min(this.pendingXp, 100 - this.displayedXp); this.pendingXp -= amount;
    const tick = this.scene.time.addEvent({ delay: 80, loop: true, callback: () => this.scene.game.events.emit('effect', 'xp-tick', { volume: .12 }) });
    this.scene.tweens.add({ targets: this, displayedXp: this.displayedXp + amount, duration: Math.max(160, amount * 12), onComplete: () => {
      tick.remove();
      if (this.displayedXp >= 100) { this.displayedLevel++; this.displayedXp = 0; this.scene.game.events.emit('effect', 'level-up', { volume: .25 }); }
      this.fill();
    } });
  }
  private draw(): void {
    const g = this.graphics; g.clear();
    g.fillStyle(0x183e57, .92).fillRoundedRect(this.x + 78, this.y + 8, 148, 19, 8);
    g.lineStyle(1, 0xae8746).strokeRect(this.x + 13, this.y + 12, 62, 64);
    g.fillStyle(0x80613a).fillRect(this.x + 84, this.y + 59, 140, 3).fillRect(this.x + 84, this.y + 80, 140, 4);
    g.fillStyle(0xdeb850).fillRect(this.x + 84, this.y + 59, 140 * this.displayedXp / 100, 3);
    g.fillStyle(0x91bd54).fillRect(this.x + 84, this.y + 80, 140 * Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1), 4);
    this.xp.setText(`LV ${this.displayedLevel}    EXP ${Math.floor(this.displayedXp)}`);
  }
}
