import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { ArenaScene, type Hud } from './game/scenes/ArenaScene';
import { HEROES, HERO_PROFILES, HERO_NAMES, WORLD, type Hero } from './game/data/config';

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
  element('hero-name').textContent = `${HERO_NAMES[hero]} · ${HERO_PROFILES[hero].weapon}`;
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
const portraits: Partial<Record<Hero, string>> = { chrom: 'chromPortrait1.png', lucina: 'lucinaPortrait1.png', frederick: 'frederickPortrait1.png' };
const roster = document.querySelector('.heroes')!;
for (const character of HEROES) {
  const button = document.createElement('button'); button.className = `hero${character === hero ? ' selected' : ''}`;
  button.dataset.character = character; button.setAttribute('aria-pressed', String(character === hero));
  const portrait = document.createElement('img'); portrait.src = `${import.meta.env.BASE_URL}assets/${portraits[character] ?? `${character}Portrait.png`}`; portrait.alt = '';
  button.append(portrait, document.createTextNode(HERO_NAMES[character])); roster.append(button);
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
  const weapon = HERO_PROFILES[button.dataset.character as Hero].weapon;
  const icon = document.createElement('img'); icon.src = `${import.meta.env.BASE_URL}assets/weapon-${weapon}.png`;
  icon.alt = ''; icon.setAttribute('aria-hidden', 'true'); icon.className = 'weapon-icon'; button.append(icon);
  button.addEventListener('click', () => {
    const value = button.dataset.character;
    if (!HEROES.includes(value as Hero)) return;
    hero = value as Hero;
    element('hero-description').textContent = HERO_PROFILES[hero].description;
    for (const option of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
      const selected = option === button;
      option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected));
    }
  });
}
startButton.addEventListener('click', start);
element('restart').addEventListener('click', start);
function showMenu(): void {
  if (!element('menu').hidden) return;
  game.scene.stop('Arena'); game.scene.start('Boot');
  playing = false; paused = false; pauseButton.disabled = true; pauseButton.textContent = 'Pause';
  music?.resume();
  element('end').hidden = true; element('menu').hidden = false;
  notice('Choose a hero, then begin.');
}
element('choose').addEventListener('click', showMenu);
element('main-menu').addEventListener('click', showMenu);
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
