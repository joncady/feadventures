import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {VoiceGate} from '../src/game/systems/voice-gate';
import {RALLY_VOICES} from '../src/game/data/rally-voices';
import {RallyVoiceSelection} from '../src/game/systems/rally-voice-selection';
import {AUDIO_ASSETS} from '../src/game/data/audio-assets';
import {HEROES} from '../src/game/data/config';

test('rally cooldown protects recorded duration, permitting death priority',()=>{
 const g=new VoiceGate();assert.ok(g.accept('chrom','rally',0,1500));
 for(const now of [0,1,100,19999])assert.equal(g.accept('chrom','rally',now),false);
 for(const event of ['attack','damage','select'])assert.equal(g.accept('chrom',event,1499),false);
 assert.ok(g.accept('chrom','attack',1500));assert.equal(g.accept('chrom','attack',1501),false);
 assert.ok(g.accept('chrom','rally',20000,1500));assert.ok(g.accept('chrom','death',20001));
 assert.ok(g.accept('chrom','select',20002));
});
test('all17 character pools randomize without immediate repeats and tolerate missing recordings',()=>{
 for(const hero of HEROES){const clips=RALLY_VOICES[hero]!;assert.ok(clips.length>=4);const selection=new RallyVoiceSelection();
 const first=selection.pick(hero,()=>true,()=>0)!;selection.played(hero,first);
 const second=selection.pick(hero,()=>true,()=>0)!;assert.notEqual(second.key,first.key);
 const last=selection.pick(hero,()=>true,()=>.99999)!;assert.notEqual(last.key,second.key);
 assert.equal(selection.pick(hero,()=>false),undefined);
 assert.equal(selection.pick(hero,key=>key===first.key)?.key,first.key);
 assert.equal(selection.pick(hero,()=>true,()=>0)?.key,second.key); // failed/muted playback never advances
 }
});
test('all70 runtime recordings retain exact indexed hashes and their character-specific registrations',()=>{
 const sources=JSON.parse(readFileSync(new URL('../docs/rally-audio-sources.json',import.meta.url),'utf8'));
 assert.equal(sources.length,70);
 for(const line of sources){assert.ok(line.key.startsWith(`voice-${line.hero}-rally-`));assert.ok(line.durationMs>0);
 assert.ok(AUDIO_ASSETS.some(a=>a.key===line.key&&a.file===line.file));
 const bytes=readFileSync(new URL(`../public/assets/${line.file}`,import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(createHash('sha256').update(bytes).digest('hex'),line.sha256);
 }
});
