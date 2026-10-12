export const CONTROL_PREFERENCES_KEY='feadventures.controls.v1';
export const DEFAULT_BINDINGS={up:'KeyW',left:'KeyA',down:'KeyS',right:'KeyD',attack:'Space',previous:'KeyQ',next:'KeyE',weapon:'KeyF',rally:'KeyR',pause:'KeyP',guard:'ControlLeft',selfHeal:'ShiftLeft'} as const;
export type ControlAction=keyof typeof DEFAULT_BINDINGS;
export interface ControlPreferences {bindings:Record<ControlAction,string>;reducedMotion:boolean;}
export const CONTROL_LABELS:Record<ControlAction,string>={up:'Move up',left:'Move left',down:'Move down',right:'Move right',attack:'Attack / cast',previous:'Previous hero',next:'Next hero',weapon:'Switch weapon',rally:'Rally companions',pause:'Pause',guard:'Guard',selfHeal:'Self-heal modifier'};
export function validBinding(code:string):boolean{return /^(Key[A-Z]|Digit[0-9]|Space|ShiftLeft|ControlLeft|AltLeft)$/.test(code)&&!['KeyI','AltLeft'].includes(code);}
export function decodeControlPreferences(raw:string|null,systemReduced=false):ControlPreferences {const fallback={bindings:{...DEFAULT_BINDINGS},reducedMotion:systemReduced};try{const data=JSON.parse(raw??'null');if(!data||typeof data.reducedMotion!=='boolean')return fallback;const values=Object.keys(DEFAULT_BINDINGS).map(k=>data.bindings?.[k]);if(values.some(v=>typeof v!=='string'||!validBinding(v))||new Set(values).size!==values.length)return fallback;return {bindings:{...data.bindings},reducedMotion:data.reducedMotion};}catch{return fallback;}}
export function readControlPreferences():ControlPreferences {try{return decodeControlPreferences(localStorage.getItem(CONTROL_PREFERENCES_KEY),typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch{return decodeControlPreferences(null);}}
export function saveControlPreferences(value:ControlPreferences):void{try{localStorage.setItem(CONTROL_PREFERENCES_KEY,JSON.stringify(value));}catch{/* Session preferences still apply when storage is unavailable. */} current=value;}
let current:ControlPreferences|undefined;
export function keyFor(action:ControlAction):string{return (current??=readControlPreferences()).bindings[action];}
export function reducedMotion():boolean{return (current??=readControlPreferences()).reducedMotion;}
export function keyLabel(code:string):string{return code.replace(/^Key|^Digit/,'').replace('Left','');}
export function phaserKeyCode(code:string):number {if(code.startsWith('Key'))return code.charCodeAt(3);if(code.startsWith('Digit'))return code.charCodeAt(5);return ({Space:32,ShiftLeft:16,ControlLeft:17} as Record<string,number>)[code];}
