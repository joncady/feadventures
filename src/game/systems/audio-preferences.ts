export const AUDIO_PREFERENCES_KEY='feadventures.audio.v1';
export interface AudioPreferences {muted:boolean;music:number;effects:number;voices:number;characterVoices:boolean;spellEffect:string;}
const spells=['fire-cast','archive-effect-1','archive-effect-2','archive-effect-3'];
export function decodeAudioPreferences(raw:string|null):AudioPreferences|undefined {
 try{const value=JSON.parse(raw??'null');if(!value||typeof value.muted!=='boolean'||typeof value.characterVoices!=='boolean'||!spells.includes(value.spellEffect)||['music','effects','voices'].some(key=>typeof value[key]!=='number'||!Number.isFinite(value[key])||value[key]<0||value[key]>1))return;return {muted:value.muted,music:value.music,effects:value.effects,voices:value.voices,characterVoices:value.characterVoices,spellEffect:value.spellEffect};}catch{return;}
}
