import type {Hero} from '../data/config';
import {RALLY_VOICES,type RallyVoice} from '../data/rally-voices';
export class RallyVoiceSelection {
 private last=new Map<Hero,string>();
 pick(hero:Hero,loaded:(key:string)=>boolean,random= Math.random):RallyVoice|undefined {
  const available=RALLY_VOICES[hero]?.filter(clip=>loaded(clip.key))??[];
  const alternatives=available.filter(clip=>clip.key!==this.last.get(hero));
  const pool=alternatives.length?alternatives:available;
  return pool[Math.floor(random()*pool.length)];
 }
 played(hero:Hero,clip:RallyVoice):void {this.last.set(hero,clip.key);}
}
