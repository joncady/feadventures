import Phaser from 'phaser';
import { HERO_NAMES, WORLD, type Hero } from '../data/config';
import { CLASS_NAMES, itemWeapon, equippedWeapon, initialLoadout, type Loadout } from '../data/equipment';
import { STAT_KEYS, attackPower, type Progress, type Stats } from './progression';

export class BattleHud {
  private timers: Phaser.Time.TimerEvent[] = [];
  private objects: Phaser.GameObjects.GameObject[] = [];
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
  private loadout?: Loadout;
  private details: Phaser.GameObjects.GameObject[] = [];
  private expanded = false;
  private visible = true;
  private keyListener: (event: KeyboardEvent) => void;
  private health = 100;
  private maxHealth = 100;
  private slots: { background: Phaser.GameObjects.Rectangle; icon: Phaser.GameObjects.Image; text: Phaser.GameObjects.Text }[] = [];
  private readonly x = WORLD.width - 212;
  private readonly y = WORLD.height - 84;
  constructor(private scene: Phaser.Scene, private hero: Hero, toggleOrders: () => void) {
    const previous = new Set(scene.children.list);
    const style = { fontFamily: 'FE', fontSize: '12px', color: '#44351e' };
    scene.add.nineslice(this.x, this.y, 'ui-parchment', undefined, 204, 76, 12, 12, 12, 12).setOrigin(0).setDepth(100);
    scene.add.zone(this.x, this.y, 204, 76).setOrigin(0).setDepth(100).setInteractive();
    this.graphics = scene.add.graphics().setDepth(101);
    this.top = scene.add.text(12, 9, '', { ...style, color: '#f8eac6' }).setDepth(101).setVisible(false);
    this.title = scene.add.text(this.x + 54, this.y + 8, HERO_NAMES[hero], { ...style, fontSize: '12px', color: '#f8eac6' }).setDepth(102);
    scene.add.text(this.x + 54, this.y + 25, CLASS_NAMES[hero], { ...style, fontSize: '10px' }).setDepth(102);
    const faceKey = scene.textures.exists(`portrait-face-${hero}`) ? `portrait-face-${hero}` : `portrait-${hero}`;
    scene.add.image(this.x + 29, this.y + 32, faceKey).setDisplaySize(38, 38).setDepth(102);
    this.xp = scene.add.text(this.x + 54, this.y + 38, '', { ...style, fontSize: '10px' }).setDepth(102);
    this.hp = scene.add.text(this.x + 54, this.y + 53, '', { ...style, fontSize: '10px' }).setDepth(102);
    this.combat = scene.add.text(this.x + 12, this.y - 82, '', { ...style, fontSize: '10px' }).setDepth(102);
    this.stats = scene.add.text(this.x + 12, this.y - 67, '', { ...style, fontSize: '9px' }).setDepth(102);
    for (let slot = 0; slot < 3; slot++) {
      const y = this.y - 50 + slot * 12;
      const background = scene.add.rectangle(this.x + 102, y + 5, 180, 11, 0xe8d5a5, .7).setDepth(101);
      const icon = scene.add.image(this.x + 20, y + 5, 'weapon-sword').setDisplaySize(10, 10).setDepth(102);
      const text = scene.add.text(this.x + 30, y, '', { ...style, fontSize: '10px' }).setDepth(102);
      this.slots.push({ background, icon, text });
    }
    this.orders = scene.add.text(this.x + 12, this.y - 12, '', { ...style, fontSize: '9px', color: '#183e57' }).setDepth(102).setInteractive({ useHandCursor: true });
    this.orders.on('pointerdown', toggleOrders);
    const detailPanel = scene.add.nineslice(this.x, this.y - 94, 'ui-parchment', undefined, 204, 90, 12, 12, 12, 12).setOrigin(0).setDepth(100);
    const detailZone = scene.add.zone(this.x, this.y - 94, 204, 90).setOrigin(0).setDepth(100).setInteractive();
    this.details = [detailPanel, detailZone, this.combat, this.stats, ...this.slots.flatMap(row => [row.background, row.icon, row.text])];
    const info = scene.add.text(this.x + 157, this.y + 25, 'Info', { ...style, fontSize: '9px', color: '#183e57' }).setDepth(103).setInteractive({useHandCursor:true});
    const toggle = () => { if (!this.visible) return; this.expanded = !this.expanded; this.applyDetailVisibility(); this.scene.game.events.emit('ux-feedback', {kind: 'confirm'}); };
    info.on('pointerdown', toggle);
    this.keyListener = (event:KeyboardEvent) => {if(event.key.toLowerCase() === 'i' && !event.repeat && !scene.game.scene.isPaused(scene.scene.key)) toggle();};
    window.addEventListener('keydown', this.keyListener);
    this.applyDetailVisibility();
    this.growth = scene.add.text(this.x + 10, this.y - 128, '', { ...style, fontSize: '11px', color: '#fff2c4', backgroundColor: '#183e57', wordWrap: { width: 184 } }).setDepth(102);
    this.objects = scene.children.list.filter(object => !previous.has(object));
    for (const object of this.objects) (object as Phaser.GameObjects.Sprite).setScrollFactor?.(0);
  }
  setVisible(visible:boolean):void {
    this.visible = visible;
    for(const object of this.objects)(object as Phaser.GameObjects.Sprite).setVisible?.(visible);
    this.top.setVisible(false);
    this.applyDetailVisibility();
    for (let slot = 0; slot < this.slots.length; slot++) {
      const show = visible && this.expanded && Boolean(this.loadout?.items[slot]);
      this.slots[slot].background.setVisible(show); this.slots[slot].icon.setVisible(show); this.slots[slot].text.setVisible(show);
    }
  }
  private applyDetailVisibility():void { this.orders.setVisible(false); for (const object of this.details) (object as Phaser.GameObjects.Sprite).setVisible?.(this.visible && this.expanded); for (let slot=0;slot<this.slots.length;slot++){const row=this.slots[slot],show=this.visible&&this.expanded&&Boolean(this.loadout?.items[slot]);row.background.setVisible(show);row.icon.setVisible(show);row.text.setVisible(show);} }
  destroy(): void { window.removeEventListener('keydown', this.keyListener); this.scene.tweens.killTweensOf(this);for(const timer of this.timers)timer.remove();for (const object of this.objects) object.destroy(); }
  synchronize(progress: Progress): void { this.displayedLevel=progress.level; this.displayedXp=progress.xp; this.pendingXp=0; }
  update(progress: Progress, health: number, wave: number, kills: number, mode: string, allies: number, loadout: Loadout = initialLoadout(this.hero)): void {
    this.loadout = loadout;
    this.health = health; this.maxHealth = progress.stats.hp;
    const snapshot = JSON.stringify([progress.stats, health, wave, kills, mode, allies, loadout]);
    if (snapshot !== this.snapshot) {
      this.snapshot = snapshot;
      this.top.setText(`Wave ${wave}  ·  Defeated ${kills}  ·  Allies ${allies}/2`);
      this.hp.setText(`HP  ${health}/${progress.stats.hp}`);
      const s = progress.stats;
      this.stats.setText(`Str ${s.str}  Mag ${s.mag}  Def ${s.def}  Res ${s.res}`);
      const weapon = equippedWeapon(loadout);
      this.combat.setText(`Atk ${attackPower(progress, this.hero, weapon)}  Rng ${weapon.minRange ? `${weapon.minRange}–` : ''}${weapon.range}`);
      for (let slot = 0; slot < this.slots.length; slot++) {
        const row = this.slots[slot];
        const item = loadout.items[slot];
        const selected = slot === loadout.equippedSlot;
        row.background.setVisible(this.visible && this.expanded && Boolean(item)).setFillStyle(selected ? 0xfaf0c3 : 0xe8d5a5, .7);
        row.icon.setVisible(this.visible && this.expanded && Boolean(item)); row.text.setVisible(this.visible && this.expanded && Boolean(item));
        if (item) {
          const choice = itemWeapon(item);
          row.icon.setTexture(choice.icon).setDisplaySize(10, 10);
          row.text.setText(`${selected ? '› ' : ''}${choice.name}  ${item.uses === null ? '∞' : item.uses}`);
        }
      }
      this.orders.setText(mode==='deployment'?'Place heroes, then begin':mode==='tactical'?'F: Weapon  ·  Q / E: Hero':`F: Weapon  ·  Q: ${mode}`);
    }
    this.applyDetailVisibility();
    this.draw();
  }
  gain(amount: number, gains: Stats[]): void {
    this.pendingXp += amount;
    if (gains.length) {
      const summary = STAT_KEYS.map(k => [k, gains.reduce((n, g) => n + g[k], 0)] as const).filter(([, v]) => v > 0).map(([k, v]) => `${k.toUpperCase()} +${v}`).join('  ');
      this.growth.setText(summary || 'Level up');
      this.timers.push(this.scene.time.delayedCall(3500, () => this.growth.setText('')));
    }
    if (!this.filling) this.fill();
  }
  private fill(): void {
    if (!this.pendingXp) { this.filling = false; return; }
    this.filling = true;
    const amount = Math.min(this.pendingXp, 100 - this.displayedXp); this.pendingXp -= amount;
    const tick = this.scene.time.addEvent({ delay: 80, loop: true, callback: () => this.scene.game.events.emit('effect', 'xp-tick', { volume: .12 }) });
    this.timers.push(tick);
    this.scene.tweens.add({ targets: this, displayedXp: this.displayedXp + amount, duration: Math.max(160, amount * 12), onComplete: () => {
      tick.remove();
      if (this.displayedXp >= 100) { this.displayedLevel++; this.displayedXp = 0; this.scene.game.events.emit('effect', 'level-up', { volume: .25 }); }
      this.fill();
    } });
  }
  private draw(): void {
    const g = this.graphics; g.clear();
    g.fillStyle(0x183e57, .92).fillRoundedRect(this.x + 50, this.y + 6, 142, 17, 6);
    g.lineStyle(1, 0xae8746).strokeRect(this.x + 9, this.y + 9, 40, 46);
    g.fillStyle(0x80613a).fillRect(this.x + 54, this.y + 49, 136, 3).fillRect(this.x + 54, this.y + 65, 136, 6);
    g.fillStyle(0xdeb850).fillRect(this.x + 54, this.y + 49, 136 * this.displayedXp / 100, 3);
    const fraction = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    g.fillStyle(fraction <= .25 ? 0xca6553 : fraction <= .5 ? 0xe0af50 : 0x91bd54).fillRect(this.x + 54, this.y + 65, 136 * fraction, 6);
    this.xp.setText(`LV ${this.displayedLevel}    EXP ${Math.floor(this.displayedXp)}`);
  }
}
