import type Phaser from 'phaser';

export function requiresLandscape(coarse:boolean,width:number,height:number):boolean {
  return coarse && width < height;
}

/** Browser orientation locking is optional; the game still gates portrait on iOS. */
export async function lockLandscape():Promise<void> {
  const orientation=screen.orientation as ScreenOrientation & {lock?:(mode:string)=>Promise<void>};
  if(!document.fullscreenElement || !orientation?.lock)return;
  try {await orientation.lock('landscape');} catch { /* Safari / OS may refuse. The rotate gate remains available. */ }
}

export function installMobileLandscape(game:Phaser.Game,onBlock:()=>void):void {
  const shell=document.querySelector<HTMLElement>('.game-shell')!;
  const overlay=document.createElement('section');
  overlay.id='landscape-required';overlay.hidden=true;overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','false');overlay.setAttribute('aria-labelledby','landscape-title');
  overlay.innerHTML='<div class="rotate-device" aria-hidden="true">↻</div><h2 id="landscape-title">Rotate your phone</h2><p>Play in landscape for a clear battlefield and room for both controls.</p><button type="button">Fullscreen</button>';
  shell.append(overlay);
  overlay.querySelector('button')!.addEventListener('click',()=>document.getElementById('fullscreen')!.click());
  let blocked=false,priorInput=true;
  const heldScenes=new Set<string>();
  let heldSounds:Phaser.Sound.BaseSound[]=[];
  const inertNodes=new Map<HTMLElement,boolean>();
  const isolateFocus=()=>{let branch:HTMLElement=overlay;while(branch.parentElement&&branch!==shell){for(const sibling of branch.parentElement.children){if(sibling!==branch&&sibling instanceof HTMLElement&&!inertNodes.has(sibling)){inertNodes.set(sibling,sibling.inert);sibling.inert=true;}}branch=branch.parentElement;}};
  const capture=()=>{
    for(const sound of game.sound.getAllPlaying()){if(!heldSounds.includes(sound))heldSounds.push(sound);sound.pause();}
    // Include scenes opened asynchronously during boot or a queued transition.
    for(const scene of game.scene.getScenes(true)) {
      const key=scene.sys.settings.key;
      if(!heldScenes.has(key)){heldScenes.add(key);scene.input?.keyboard?.resetKeys();game.scene.pause(key);}
    }
  };
  const update=()=>{
    const viewport=window.visualViewport;
    const next=requiresLandscape(window.matchMedia('(pointer: coarse)').matches,viewport?.width??innerWidth,viewport?.height??innerHeight);
    if(next===blocked){if(blocked)capture();return;}
    blocked=next;shell.classList.toggle('portrait-blocked',blocked);game.registry.set('landscape-required',blocked);overlay.hidden=!blocked;
    if(blocked){
      isolateFocus();priorInput=game.input.enabled;game.input.enabled=false;
      game.events.emit('orientation-blocked');onBlock();
      heldSounds=game.sound.getAllPlaying();for(const sound of heldSounds)sound.pause();
      capture();overlay.querySelector('button')!.focus({preventScroll:true});
    }else{
      for(const [node,prior] of inertNodes)node.inert=prior;inertNodes.clear();
      game.input.enabled=priorInput;
      for(const key of heldScenes){const scene=game.scene.getScene(key);scene.input?.keyboard?.resetKeys();if(game.scene.isPaused(key))game.scene.resume(key);}
      heldScenes.clear();for(const sound of heldSounds)if(sound.isPaused)sound.resume();heldSounds=[];
      game.events.emit('orientation-restored');game.scale.refresh();
    }
  };
  // Keyboard events bypass the pointer manager. Do not allow hidden menu actions.
  window.addEventListener('keydown',event=>{if(blocked&&event.key==='Tab'){event.preventDefault();event.stopImmediatePropagation();overlay.querySelector('button')!.focus({preventScroll:true});return;}if(blocked){event.stopImmediatePropagation();if(!(event.target===overlay.querySelector('button')&&(event.code==='Enter'||event.code==='Space')))event.preventDefault();}},true);
  window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);
  document.addEventListener('fullscreenchange',()=>{
    overlay.querySelector('button')!.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';
    if(document.fullscreenElement)void lockLandscape();else screen.orientation?.unlock?.();update();
  });
  game.events.on('poststep',()=>{if(blocked)capture();});
  if(game.isBooted)update();else game.events.once('ready',update);
}

