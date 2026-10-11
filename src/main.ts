import {VoiceGate} from './game/systems/voice-gate';
import {RallyVoiceSelection} from './game/systems/rally-voice-selection';
import Phaser from 'phaser';
import { installSharpRendering } from './game/rendering/sharp-rendering';
import {DevScene} from './game/scenes/DevScene';
import {loadCampaign,saveCampaign} from './game/systems/campaign-save';
import './style.css';
import {ResultsScene} from './game/scenes/ResultsScene';
import {CampaignScene} from './game/scenes/CampaignScene';
import {completeMission,acceptMissionResult,newCampaign,cloneMembers,buyCampaignItem,upgradeCampaignItem,type CampaignState,type CampaignMember} from './game/systems/campaign';
import {getMap} from './game/data/maps';
import { BootScene } from './game/scenes/BootScene';
import { InterfaceScene, type InterfaceState } from './game/scenes/InterfaceScene';
import { ArenaScene, type Hud } from './game/scenes/ArenaScene';
import { AUDIO_ASSETS } from './game/data/audio-assets';
import { HEROES, HERO_PROFILES, HERO_NAMES, WORLD, type Hero } from './game/data/config';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: WORLD.width, height: WORLD.height,
  pixelArt: true, backgroundColor: '#1d3026',
  callbacks: { postBoot: installSharpRendering },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, ArenaScene, InterfaceScene, CampaignScene, ResultsScene, DevScene],
});
const tactical = new URLSearchParams(location.search).get('battle') !== 'legacy';
let phase: 'party'|'deployment'|'battle' = 'party';
let campaign:CampaignState|undefined;
let devRun=false;
let devOpen=false;
let devPausedScenes:string[]=[];
function readSave():ReturnType<typeof loadCampaign> {try{return loadCampaign(localStorage);}catch{return undefined;}}
function publishSave():void {const saved=readSave();const state={available:!!saved,missionName:saved?(saved.campaign.complete?'Campaign complete':saved.campaign.pendingResult?'Mission results':getMap(saved.campaign.missionIndex).name):'',complete:saved?.campaign.complete??false,savedAt:saved?.savedAt};game.registry.set('campaign-save-state',state);game.events.emit('campaign-save-state',state);}
function checkpointCampaign():void {if(campaign&&!devRun){let saved=false;try{saved=saveCampaign(localStorage,campaign);}catch{}if(!saved)notice('Saving unavailable in this browser. Keep this tab open.');publishSave();}}
let missionCheckpoint:CampaignMember[]=[];
let checkpointGold=0;
const campaignEnabled=tactical&&new URLSearchParams(location.search).get('mission')!=='siege';
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
const voiceGate=new VoiceGate();
const rallyVoices=new RallyVoiceSelection();
let deathVoice:Phaser.Sound.BaseSound|undefined;
let voiceGeneration=0;
const deathQueue:Hero[]=[];
function playDeathVoice():void {
  if(deathVoice||!deathQueue.length)return;
  const character=deathQueue.shift()!;
  if(muted||!audioSettings.characterVoices||audioSettings.voices===0){deathQueue.length=0;return;}
  for(const clip of AUDIO_ASSETS)if(clip.key.startsWith('voice-'))game.sound.stopByKey(clip.key);
  const generation=voiceGeneration,voice=game.sound.add(`voice-${character}-death`);deathVoice=voice;
  voice.once('complete',()=>{voice.destroy();if(generation!==voiceGeneration)return;deathVoice=undefined;playDeathVoice();});
  voice.play({volume:audioSettings.voices});
}
function stopVoices(): void {
  voiceGeneration++;deathQueue.length=0;if(deathVoice){deathVoice.destroy();deathVoice=undefined;}
  for (const clip of AUDIO_ASSETS) if (clip.key.startsWith('voice-')) game.sound.stopByKey(clip.key);
}
function characterVoice(character: Hero, event: string): void {
  if (muted || !audioSettings.characterVoices || audioSettings.voices === 0) return;
  const clip=event==='rally'?rallyVoices.pick(character,key=>game.cache.audio.exists(key)):undefined;
  const key=event==='rally'?clip?.key:`voice-${character}-${event}`;
  if (!key || !game.cache.audio.exists(key)) return;
  if(event==='death'){voiceGate.accept(character,event,performance.now());deathQueue.push(character);playDeathVoice();return;}
  if(deathVoice||deathQueue.length)return;
  if (!voiceGate.accept(character,event,performance.now(),(clip?.durationMs??0)+150)) return;
  stopVoices();
  if(game.sound.play(key,{volume:audioSettings.voices}) && clip)rallyVoices.played(character,clip);
}
game.events.on('effect', (key: string, options: { volume: number; rate?:number; position?:{x:number;y:number} }) => {
  const arena=game.scene.getScene('Arena') as ArenaScene;const proximity=options.position?(arena?.soundGain(options.position)??1):1;
  if (audioSettings.effects > 0&&proximity>0) game.sound.play(key, { volume: options.volume * audioSettings.effects * proximity, rate:options.rate??1 });
});
const feedbackAt=new Map<string,number>();
game.events.on('ux-feedback',({kind,message}:{kind:string;message?:string})=>{const now=performance.now(),last=feedbackAt.get(kind)??-Infinity;if(now-last<(kind==='reject'?450:kind==='cursor'?65:80)){if(kind==='confirm'&&message)game.events.emit('ux-feedback-visible',{kind,message});return;}feedbackAt.set(kind,now);const key=kind==='cursor'?'ui-cursor':kind==='reject'?'ui-reject':'ui-confirm';if(kind==='cursor')game.sound.stopByKey(key);if(game.cache.audio.exists(key))game.events.emit('effect',key,{volume:kind==='cursor'?.22:.3,rate:kind==='reject'?.65:kind==='confirm'?1.3:1});game.events.emit('ux-feedback-visible',{kind,message});});
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
  element<HTMLButtonElement>('launch-battle').disabled=phase!=='deployment';element('launch-battle').hidden=phase!=='deployment';
  const state: InterfaceState = { hero, companions:[...companions], selectionMode, phase, tactical, ready: !startButton.disabled, playing, paused, muted, settingsOpen, result, audio: { ...audioSettings } };
  game.registry.set('interface-state', state); game.events.emit('ui-state', state);
}
function ensureMusic(): void {
  if (muted || !game.cache.audio.exists('music')) return;
  const key = game.scene.isActive('Results')?'music-menu':(playing && phase==='battle') || result ? 'music' : 'music-menu';
  if (music && music.key !== key) { music.stop(); music.destroy(); music = undefined; }
  if (!music) music = game.sound.add(key, { loop: true, volume: audioSettings.music });
  if (!music.isPlaying && !music.isPaused) music.play();
  if (music.isPaused && !paused) music.resume();
  if (paused) music.pause();
}
publishInterface();
publishSave();

game.events.on('asset-error', (key: string) => {
  // Optional rally recordings fall back to ordinary confirmation feedback.
  if(AUDIO_ASSETS.some(clip=>clip.key===key&&clip.key.includes('-rally-')))return;
  loadingFailed = true; notice(`Could not load ${key}. Reload to retry.`);
});
game.events.on('assets-ready', () => {
  game.sound.mute = muted;
  game.sound.once('unlocked', () => { game.sound.mute = muted; ensureMusic(); });
  ensureMusic();
  if (loadingFailed) return;
  startButton.disabled = false; startButton.textContent = tactical?'Review battlefield':'Begin battle';
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
game.events.on('game-over', (battleResult: { wave: number; kills: number; victory?:boolean;reason?:string;missionIndex?:number;members?:CampaignMember[];gold?:number;elapsed?:number;heldKeys?:string[] }) => {
  if(campaign&&battleResult.victory&&battleResult.missionIndex!==undefined){
    const snapshot={missionIndex:battleResult.missionIndex,reason:battleResult.reason??'Objective complete.',kills:battleResult.kills,elapsed:battleResult.elapsed??0,gold:battleResult.gold??0,reward:100,progressBefore:missionCheckpoint.map(member=>({hero:member.hero,level:member.progress.level,xp:member.progress.xp}))};
    if(!completeMission(campaign,snapshot,battleResult.members??campaign.members))return;
    checkpointCampaign();playing=false;paused=false;pauseButton.disabled=true;game.scene.stop('Arena');game.scene.stop('Interface');showMissionResult(battleResult.heldKeys);return;
  }

  game.events.emit('ux-feedback',{kind:battleResult.victory?'confirm':'reject',message:battleResult.victory?'Victory!':'Battle lost'});playing = false; pauseButton.disabled = true;
  element('end').hidden = false;
  element('result').textContent = `${battleResult.victory?'Battle won! Outskirts Commander defeated.':tactical?(battleResult.reason??'Party defeated.'):`Reached wave ${battleResult.wave}`} · Defeated ${battleResult.kills} enemies`;
  result = element('result').textContent ?? '';
  notice('Choose Try again for a fresh battle.'); publishInterface();
});
function start(): void {
  if (startButton.disabled) return;
  if(campaignEnabled&&!campaign){devRun=false;campaign=newCampaign([hero,...companions]);checkpointCampaign();element('menu').hidden=true;element('end').hidden=true;result='';game.scene.stop('Boot');game.scene.stop('Interface');game.scene.start('Campaign',{...campaign,party:campaign.members.map(m=>m.hero)});ensureMusic();return;}
  if(campaign){campaign.members=cloneMembers(missionCheckpoint.length?missionCheckpoint:campaign.members);if(missionCheckpoint.length)campaign.gold=checkpointGold;}

  stopVoices();ensureMusic();
  if(!tactical)game.events.emit('effect', 'battle-start', { volume: .45 });
  result = ''; settingsOpen = false; audioDialog.close();
  game.scene.stop('Boot'); game.scene.stop('Arena');
  element('menu').hidden = true; element('end').hidden = true;
  phase=tactical?'deployment':'battle';
  playing = true; paused = false; pauseButton.disabled = tactical; pauseButton.textContent = 'Pause';
  element('hero-name').textContent = `${HERO_NAMES[hero]} · ${HERO_PROFILES[hero].weapon}`;
  game.scene.start('Arena', { hero, companions, tactical,missionIndex:campaign?.missionIndex,members:campaign?.members,gold:campaign?.gold });
  ensureMusic();
  game.scene.bringToTop('Interface'); publishInterface();
  element('game').focus();
}
function togglePause(): void {
  if (!playing || settingsOpen || devOpen || phase==='deployment') return;
  paused = !paused;game.events.emit('ux-feedback',{kind:'confirm',message:paused?'Paused':'Battle resumed'});
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
      if(selected===hero){game.events.emit('ux-feedback',{kind:'reject',message:'Your leader is already in the party.'});return;}
      if(companions.includes(selected))companions=companions.filter(h=>h!==selected);
      else if(companions.length<3){companions.push(selected);characterVoice(selected,'select');}
      else {game.events.emit('ux-feedback',{kind:'reject',message:'Party full — remove a companion first.'});return;}
      game.events.emit('ux-feedback',{kind:'confirm',message:companions.includes(selected)?`${HERO_NAMES[selected]} joined the party`:`${HERO_NAMES[selected]} removed`});publishInterface();return;
    }
    game.events.emit('ux-feedback',{kind:'confirm'});hero = selected;companions=companions.filter(h=>h!==hero);characterVoice(hero,'select');
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
function showMissionResult(heldKeys:string[]=[]):void {if(!campaign?.pendingResult)return;game.scene.start('Results',{result:campaign.pendingResult,members:cloneMembers(campaign.members),gold:campaign.gold,heldKeys});ensureMusic();}
game.events.on('results-continue',()=>{if(!campaign||!acceptMissionResult(campaign))return;checkpointCampaign();game.scene.stop('Results');game.scene.start('Campaign',{...campaign,party:campaign.members.map(member=>member.hero),victory:true});ensureMusic();});
function showMenu(): void {
  if (!element('menu').hidden) return;
  campaign=undefined;devRun=false;missionCheckpoint=[];checkpointGold=0;game.scene.stop('Campaign');game.scene.stop('Results');if(!game.scene.isActive('Interface'))game.scene.start('Interface');
  result = ''; settingsOpen = false; audioDialog.close();
  stopVoices(); game.sound.stopAll();
  game.scene.stop('Arena'); game.scene.start('Boot');
  phase='party';playing = false; paused = false; pauseButton.disabled = true; pauseButton.textContent = 'Pause';
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
      for (const key of ['attack', 'damage', 'arrow-fire', 'death', 'archive-effect-1', 'archive-effect-2', 'archive-effect-3', 'axe-impact', 'lance-thrust', 'fire-cast','xp-tick','level-up','battle-start','ui-cursor','ui-confirm','ui-reject','heal','dialogue-advance']) game.sound.stopByKey(key);
    }
    publishInterface();
  });
}
element<HTMLInputElement>('character-voices').addEventListener('change', event => { audioSettings.characterVoices = (event.target as HTMLInputElement).checked; stopVoices(); publishInterface(); });
element<HTMLSelectElement>('spell-effect').addEventListener('change', event => { audioSettings.spellEffect = (event.target as HTMLSelectElement).value; publishInterface(); });
game.events.on('spell-effect', (position?:{x:number;y:number}) => game.events.emit('effect', audioSettings.spellEffect, { volume: 0.25,position }));
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

game.events.on('ui-deploy-hero',(hero:Hero)=> (game.scene.getScene('Arena') as ArenaScene).selectDeployment(hero));
game.events.on('ui-launch',()=>{if(phase!=='deployment')return;if(!(game.scene.getScene('Arena') as ArenaScene).launchBattle())return;phase='battle';publishInterface();pauseButton.disabled=false;game.events.emit('effect','battle-start',{volume:.45});ensureMusic();publishInterface();element('game').focus();});
game.events.on('controlled-character',(hero:Hero)=>{element('hero-name').textContent=`${HERO_NAMES[hero]} · ${HERO_PROFILES[hero].weapon}`;});

element('launch-battle').addEventListener('click',()=>game.events.emit('ui-launch'));

game.events.on('ui-deploy-move',(dx:number,dy:number)=>(game.scene.getScene('Arena') as ArenaScene).nudgeDeployment(dx,dy));

game.events.on('ui-deploy-soldier',()=> (game.scene.getScene('Arena') as ArenaScene).selectSoldierDeployment());

game.events.on('ui-deploy-auto',()=>{if(phase==='deployment')(game.scene.getScene('Arena') as ArenaScene).autoPlaceDeployment();});

game.events.on('ui-deploy-confirm',()=> (game.scene.getScene('Arena') as ArenaScene).confirmDeployment());

function publishShop(message:string):void {if(!campaign)return;game.events.emit('campaign-shop-state',{gold:campaign.gold,members:campaign.members,message});}
game.events.on('campaign-shop-buy',({hero:target,itemId}:{hero:Hero;itemId:string})=>{if(!campaign)return;const ok=buyCampaignItem(campaign,target,itemId);if(ok)checkpointCampaign();game.events.emit('ux-feedback',{kind:ok?'confirm':'reject',message:ok?'Weapon purchased':'Cannot purchase: check gold and class'});publishShop(ok?'Weapon purchased. F switches equipment in battle.':'Not enough gold, already owned, or unavailable to this class.');});
game.events.on('campaign-shop-upgrade',({hero:target,slot}:{hero:Hero;slot:number})=>{if(!campaign)return;const ok=upgradeCampaignItem(campaign,target,slot);if(ok)checkpointCampaign();game.events.emit('ux-feedback',{kind:ok?'confirm':'reject'});publishShop(ok?'Equipment upgraded.':'Needs 100 gold. Each item can be forged three times.');});
game.events.on('campaign-continue',()=>{if(!campaign)return;game.scene.stop('Campaign');if(campaign.complete){showMenu();return;}hero=campaign.members[0].hero;companions=campaign.members.slice(1).map(m=>m.hero);missionCheckpoint=cloneMembers(campaign.members);checkpointGold=campaign.gold;checkpointCampaign();game.scene.start('Interface');start();notice(getMap(campaign.missionIndex).objective.label);});

function closeDev():void {
 if(!devOpen)return;devOpen=false;game.scene.stop('Dev');
 for(const key of devPausedScenes)if(game.scene.isPaused(key))game.scene.resume(key);
 devPausedScenes=[];game.scene.getScene('Arena').input.keyboard?.resetKeys();
}
function openCampaign(state:CampaignState,testRun=false):void {
 closeDev();for(const key of ['Boot','Arena','Interface','Campaign','Results'])game.scene.stop(key);
 campaign=structuredClone(state);devRun=testRun;missionCheckpoint=[];checkpointGold=0;
 hero=campaign.members[0].hero;companions=campaign.members.slice(1).map(m=>m.hero);
 phase='party';playing=false;paused=false;result='';settingsOpen=false;audioDialog.close();
 element('menu').hidden=true;element('end').hidden=true;
 if(campaign.pendingResult)showMissionResult();else {game.scene.start('Campaign',{...campaign,party:campaign.members.map(m=>m.hero)});ensureMusic();}
}
game.events.on('campaign-resume',()=>{const saved=readSave();if(!saved){game.events.emit('ux-feedback',{kind:'reject',message:'No valid saved campaign available.'});return;}openCampaign(saved.campaign);game.events.emit('ux-feedback',{kind:'confirm',message:saved.campaign.pendingResult?'Mission results restored.':'Campaign restored. Battles restart from deployment.'});});
game.events.on('dev-jump',(index:number)=>{if(!Number.isInteger(index)||index<0||index>=4)return;const test=newCampaign([hero,...companions]);test.missionIndex=index;openCampaign(test,true);game.events.emit('ux-feedback',{kind:'confirm',message:'Developer test mission — regular save preserved.'});});
game.events.on('dev-close',closeDev);
function openDev():void {if(devOpen||startButton.disabled)return;devOpen=true;devPausedScenes=['Boot','Arena','Interface','Campaign','Results'].filter(key=>game.scene.isActive(key));for(const key of devPausedScenes)game.scene.pause(key);game.scene.start('Dev');game.scene.bringToTop('Dev');}
game.events.on('dev-open',openDev);
window.addEventListener('keydown',event=>{if(event.defaultPrevented)return;if((event.code!=='F9'&&event.code!=='Backquote')||event.repeat)return;event.preventDefault();openDev();});
