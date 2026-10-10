import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { InterfaceScene, type InterfaceState } from './game/scenes/InterfaceScene';
import { ArenaScene, type Hud } from './game/scenes/ArenaScene';
import { AUDIO_ASSETS } from './game/data/audio-assets';
import { HEROES, HERO_PROFILES, HERO_NAMES, WORLD, type Hero } from './game/data/config';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: WORLD.width, height: WORLD.height,
  pixelArt: true, backgroundColor: '#1d3026',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, ArenaScene, InterfaceScene],
});
let hero: Hero = 'chrom';
let companions: Hero[] = [];
let selectionMode: 'player'|'companions' = 'player';
let playing = false;
let paused = false;
let music: Phaser.Sound.BaseSound | undefined;
let muted = false;
let settingsOpen = false;
let result = '';
export const audioSettings = { music: 0.18, effects: 1, voices: 0.6, characterVoices: true, spellEffect: 'fire-cast' };
let lastVoiceAt = -Infinity;
function stopVoices(): void {
  for (const clip of AUDIO_ASSETS) if (clip.key.startsWith('voice-')) game.sound.stopByKey(clip.key);
}
function characterVoice(character: Hero, event: string): void {
  if (muted || !audioSettings.characterVoices || audioSettings.voices === 0 || !game.cache.audio.exists(`voice-${character}-${event}`)) return;
  if (event === 'attack' && performance.now() - lastVoiceAt < 1200) return;
  stopVoices(); lastVoiceAt = performance.now();
  game.sound.play(`voice-${character}-${event}`, { volume: audioSettings.voices });
}
game.events.on('effect', (key: string, options: { volume: number }) => {
  if (audioSettings.effects > 0) game.sound.play(key, { volume: options.volume * audioSettings.effects });
});
game.events.on('hero-attack', ({ hero: character }: { hero: Hero }) => characterVoice(character, 'attack'));
game.events.on('hero-voice', ({ hero: character, event }: { hero: Hero; event: string }) => characterVoice(character, event));
let loadingFailed = false;
const startButton = element<HTMLButtonElement>('start');
const pauseButton = element<HTMLButtonElement>('pause');
const notice = (text: string) => { element('notice').textContent = text; game.registry.set('interface-notice', text); game.events.emit('ui-notice', text); };
function publishInterface(): void {
  for (const option of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
    const key = option.dataset.character as Hero;
    const selected = selectionMode === 'companions' ? companions.includes(key) : key === hero;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  }
  element('leader-mode')?.setAttribute('aria-pressed', String(selectionMode === 'player'));
  element('party-mode')?.setAttribute('aria-pressed', String(selectionMode === 'companions'));
  const state: InterfaceState = { hero, companions:[...companions], selectionMode, ready: !startButton.disabled, playing, paused, muted, settingsOpen, result, audio: { ...audioSettings } };
  game.registry.set('interface-state', state); game.events.emit('ui-state', state);
}
function ensureMusic(): void {
  if (muted || !game.cache.audio.exists('music')) return;
  const key = playing || result ? 'music' : 'music-menu';
  if (music && music.key !== key) { music.stop(); music.destroy(); music = undefined; }
  if (!music) music = game.sound.add(key, { loop: true, volume: audioSettings.music });
  if (!music.isPlaying && !music.isPaused) music.play();
  if (music.isPaused && !paused) music.resume();
  if (paused) music.pause();
}
publishInterface();

game.events.on('asset-error', (key: string) => {
  loadingFailed = true; notice(`Could not load ${key}. Reload to retry.`);
});
game.events.on('assets-ready', () => {
  game.sound.mute = muted;
  game.sound.once('unlocked', () => { game.sound.mute = muted; ensureMusic(); });
  ensureMusic();
  if (loadingFailed) return;
  startButton.disabled = false; startButton.textContent = 'Begin battle';
  element<HTMLButtonElement>('music').disabled = false;
  notice('Choose a hero, then begin.'); publishInterface();
});
game.events.on('notice', notice);
game.events.on('hud', (hud: Hud) => {
  element('health').textContent = `HP ${hud.health} / ${hud.maxHealth}`;
  element('wave').textContent = `Wave ${hud.wave}`;
  element('kills').textContent = `Defeated ${hud.kills}`;
  element('game').dataset.enemies = String(hud.enemies);
});
game.events.on('game-over', (battleResult: { wave: number; kills: number }) => {
  playing = false; pauseButton.disabled = true;
  element('end').hidden = false;
  element('result').textContent = `Reached wave ${battleResult.wave} · Defeated ${battleResult.kills} enemies`;
  result = element('result').textContent ?? '';
  notice('Choose Try again for a fresh battle.'); publishInterface();
});
function start(): void {
  if (startButton.disabled) return;
  ensureMusic();
  game.events.emit('effect', 'battle-start', { volume: .45 });
  result = ''; settingsOpen = false; audioDialog.close();
  game.scene.stop('Boot'); game.scene.stop('Arena');
  element('menu').hidden = true; element('end').hidden = true;
  playing = true; paused = false; pauseButton.disabled = false; pauseButton.textContent = 'Pause';
  element('hero-name').textContent = `${HERO_NAMES[hero]} · ${HERO_PROFILES[hero].weapon}`;
  game.scene.start('Arena', { hero, companions });
  ensureMusic();
  game.scene.bringToTop('Interface'); publishInterface();
  element('game').focus();
}
function togglePause(): void {
  if (!playing || settingsOpen) return;
  paused = !paused;
  if (paused) { stopVoices(); game.scene.pause('Arena'); music?.pause(); }
  else { game.scene.getScene('Arena').input.keyboard?.resetKeys(); game.scene.resume('Arena'); music?.resume(); }
  if (!paused) element('game').focus();
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
  notice(paused ? 'Paused — press P or Resume to continue.' : 'Back to battle. Space to strike.'); publishInterface();
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
    const selected = value as Hero;
    if(selectionMode === 'companions') {
      if(selected===hero)return;
      if(companions.includes(selected))companions=companions.filter(h=>h!==selected);
      else if(companions.length<3){companions.push(selected);characterVoice(selected,'select');}
      publishInterface();return;
    }
    hero = selected;companions=companions.filter(h=>h!==hero);characterVoice(hero,'select');
    element('hero-description').textContent = HERO_PROFILES[hero].description;
    for (const option of document.querySelectorAll<HTMLButtonElement>('[data-character]')) {
      const selected = option === button;
      option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected));
    }
    publishInterface();
  });
}
startButton.addEventListener('click', start);
element('restart').addEventListener('click', start);
function showMenu(): void {
  if (!element('menu').hidden) return;
  result = ''; settingsOpen = false; audioDialog.close();
  stopVoices(); game.sound.stopAll();
  game.scene.stop('Arena'); game.scene.start('Boot');
  playing = false; paused = false; pauseButton.disabled = true; pauseButton.textContent = 'Pause';
  ensureMusic();
  element('end').hidden = true; element('menu').hidden = false;
  notice('Choose a hero, then begin.');
  game.scene.bringToTop('Interface'); publishInterface();
}
element('choose').addEventListener('click', showMenu);
element('main-menu').addEventListener('click', showMenu);
pauseButton.addEventListener('click', togglePause);
window.addEventListener('keydown', event => {
  if (event.code === 'Escape' && settingsOpen) element('audio-close').click();
  else if (event.code === 'KeyP' && !event.repeat) togglePause();
});
window.addEventListener('blur', () => {
  if (playing && !paused) togglePause();
});
element('music').addEventListener('click', () => {
  muted = !muted;
  game.sound.mute = muted;
  if (muted) stopVoices();
  ensureMusic();
  element<HTMLInputElement>('audio-enabled').checked = !muted;
  const label = muted ? 'Unmute audio' : 'Mute audio';
  element('music').setAttribute('aria-label', label);
  element('music').setAttribute('title', label);
  element('music').setAttribute('aria-pressed', String(!muted)); publishInterface();
  if (playing) element('game').focus();
});
element('fullscreen').addEventListener('click', () => {
  const action = document.fullscreenElement ? document.exitFullscreen() : document.querySelector('.game-shell')!.requestFullscreen();
  void action.catch(() => notice('Fullscreen is unavailable in this browser.'));
});

const audioDialog = element<HTMLDialogElement>('audio-settings');
element('audio-options').addEventListener('click', () => {
  if (playing && !paused) togglePause();
  settingsOpen = true; audioDialog.show(); publishInterface();
});
element<HTMLInputElement>('audio-enabled').addEventListener('change', () => element('music').click());
element('audio-close').addEventListener('click', () => { settingsOpen = false; audioDialog.close(); publishInterface(); if(playing) element('game').focus(); });
for (const category of ['music', 'effects', 'voices'] as const) {
  element<HTMLInputElement>(`${category}-volume`).addEventListener('input', event => {
    audioSettings[category] = Number((event.target as HTMLInputElement).value) / 100;
    if (category === 'music') (music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | undefined)?.setVolume(audioSettings.music);
    if (category === 'voices') stopVoices();
    if (category === 'effects') {
      for (const key of ['attack', 'damage', 'arrow-fire', 'death', 'archive-effect-1', 'archive-effect-2', 'archive-effect-3', 'axe-impact', 'lance-thrust', 'fire-cast','xp-tick','level-up','battle-start']) game.sound.stopByKey(key);
    }
    publishInterface();
  });
}
element<HTMLInputElement>('character-voices').addEventListener('change', event => { audioSettings.characterVoices = (event.target as HTMLInputElement).checked; stopVoices(); publishInterface(); });
element<HTMLSelectElement>('spell-effect').addEventListener('change', event => { audioSettings.spellEffect = (event.target as HTMLSelectElement).value; publishInterface(); });
game.events.on('spell-effect', () => game.events.emit('effect', audioSettings.spellEffect, { volume: 0.25 }));
element('audio-preview').addEventListener('click', () => {
  if (muted) { notice('Unmute audio with the speaker button to preview.'); return; }
  game.events.emit('effect', audioSettings.spellEffect, { volume: 0.25 });
  characterVoice(hero, 'attack');
});

// Native controls and keyboard-accessible DOM mirrors share exactly the same handlers.
game.events.on('ui-action', (id: string) => element<HTMLButtonElement>(id).click());
game.events.on('ui-volume', (category: string, value: number) => {
  const input = element<HTMLInputElement>(`${category}-volume`); input.value = String(value); input.dispatchEvent(new Event('input'));
});
game.events.on('ui-voices', () => element<HTMLInputElement>('character-voices').click());
game.events.on('ui-spell', () => {
  const select = element<HTMLSelectElement>('spell-effect'); select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
  select.dispatchEvent(new Event('change'));
});

for(const [id,mode] of [['leader-mode','player'],['party-mode','companions']] as const){
  element(id).addEventListener('click',()=>{selectionMode=mode;publishInterface();});
}
game.events.on('ui-character',(character:Hero)=>document.querySelector<HTMLButtonElement>(`[data-character="${character}"]`)?.click());
