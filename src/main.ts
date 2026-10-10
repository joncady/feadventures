import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { ArenaScene, type Hud } from './game/scenes/ArenaScene';
import { HEROES, WORLD, type Hero } from './game/data/config';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: WORLD.width, height: WORLD.height,
  pixelArt: true, backgroundColor: '#1d3026',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, ArenaScene],
});
let hero: Hero = 'chrom';
let playing = false;
let paused = false;
let music: Phaser.Sound.BaseSound | undefined;
let muted = true;
let loadingFailed = false;
const startButton = element<HTMLButtonElement>('start');
const pauseButton = element<HTMLButtonElement>('pause');
const notice = (text: string) => { element('notice').textContent = text; };

game.events.on('asset-error', (key: string) => {
  loadingFailed = true; notice(`Could not load ${key}. Reload to retry.`);
});
game.events.on('assets-ready', () => {
  game.sound.mute = muted;
  game.sound.once('unlocked', () => { game.sound.mute = muted; });
  if (loadingFailed) return;
  startButton.disabled = false; startButton.textContent = 'Begin battle';
  element<HTMLButtonElement>('music').disabled = false;
  notice('Choose a hero, then begin.');
});
game.events.on('notice', notice);
game.events.on('hud', (hud: Hud) => {
  element('health').textContent = `HP ${hud.health} / 100`;
  element('wave').textContent = `Wave ${hud.wave}`;
  element('kills').textContent = `Defeated ${hud.kills}`;
  element('game').dataset.enemies = String(hud.enemies);
});
game.events.on('game-over', (result: { wave: number; kills: number }) => {
  playing = false; pauseButton.disabled = true;
  element('end').hidden = false;
  element('result').textContent = `Reached wave ${result.wave} · Defeated ${result.kills} enemies`;
  notice('Choose Try again for a fresh battle.');
});
function start(): void {
  game.scene.stop('Boot'); game.scene.stop('Arena');
  element('menu').hidden = true; element('end').hidden = true;
  playing = true; paused = false; pauseButton.disabled = false; pauseButton.textContent = 'Pause';
  element('hero-name').textContent = hero[0].toUpperCase() + hero.slice(1);
  game.scene.start('Arena', { hero });
  element('game').focus();
}
function togglePause(): void {
  if (!playing) return;
  paused = !paused;
  if (paused) { game.scene.pause('Arena'); music?.pause(); }
  else { game.scene.getScene('Arena').input.keyboard?.resetKeys(); game.scene.resume('Arena'); music?.resume(); }
  if (!paused) element('game').focus();
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
  notice(paused ? 'Paused — press P or Resume to continue.' : 'Back to battle. Space to strike.');
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
  button.addEventListener('click', () => {
    const value = button.dataset.character;
    if (!HEROES.includes(value as Hero)) return;
    hero = value as Hero;
    for (const option of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
      const selected = option === button;
      option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected));
    }
  });
}
startButton.addEventListener('click', start);
element('restart').addEventListener('click', start);
element('choose').addEventListener('click', () => {
  game.scene.stop('Arena'); element('end').hidden = true; element('menu').hidden = false;
  notice('Choose a hero, then begin.');
});
pauseButton.addEventListener('click', togglePause);
window.addEventListener('keydown', event => {
  if (event.code === 'KeyP' && !event.repeat) togglePause();
});
window.addEventListener('blur', () => {
  if (playing && !paused) togglePause();
});
element('music').addEventListener('click', () => {
  muted = !muted;
  game.sound.mute = muted;
  if (!muted && !music) {
    music = game.sound.add('music', { loop: true, volume: 0.18 });
    music.play();
    if (paused) music.pause();
  }
  const label = muted ? 'Unmute audio' : 'Mute audio';
  element('music').setAttribute('aria-label', label);
  element('music').setAttribute('title', label);
  element('music').setAttribute('aria-pressed', String(!muted));
  if (playing) element('game').focus();
});
element('fullscreen').addEventListener('click', () => {
  const action = document.fullscreenElement ? document.exitFullscreen() : document.querySelector('.game-shell')!.requestFullscreen();
  void action.catch(() => notice('Fullscreen is unavailable in this browser.'));
});
