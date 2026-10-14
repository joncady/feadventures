import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {COMMANDERS,commanderDefinition} from '../src/game/data/commanders';
import {CRITICAL_VOICES} from '../src/game/data/critical-voices';
import {HEROES} from '../src/game/data/config';
import {CriticalVoiceGate} from '../src/game/systems/critical-voice-gate';
const pngSize=(path:string)=>{const data=readFileSync(path);assert.equal(data.subarray(1,4).toString(),'PNG');return [data.readUInt32BE(16),data.readUInt32BE(20)];};
test('genuine commander sprites and portraits provide all40frames with verified source hashes',()=>{
 for(const id of ['yenfay','aversa'] as const){assert.deepEqual(pngSize(`public/assets/${id}-animated.png`),[200,500]);assert.deepEqual(pngSize(`public/assets/${id}Portrait.png`),[254,256]);}
 const sources=JSON.parse(readFileSync('asset-library/awakening/commanders/sources.json','utf8')) as {file:string;sha256:string}[];
 for(const id of ['63524','63397','63501','63358']){const row=sources.find(r=>r.file.endsWith(`${id}.png`))!;assert.ok(row);assert.equal(createHash('sha256').update(readFileSync(row.file)).digest('hex'),row.sha256);}
 assert.equal(COMMANDERS.aversa.flying,true);assert.equal(COMMANDERS.yenfay.flying,undefined);
 assert.equal(commanderDefinition('yenfay').attack.kind,'melee');assert.equal(commanderDefinition('aversa').attack.kind,'ranged');assert.ok(COMMANDERS.aversa.impactMaxTargets!<=3);
});
test('every hero receives a real sourced critical line registered for loading',()=>{
 for(const hero of HEROES){const clip=CRITICAL_VOICES[hero];assert.ok(clip);assert.ok(clip.durationMs>0&&clip.durationMs<6000);assert.equal(readFileSync(`public/assets/${clip.file}`).subarray(0,4).toString(),'RIFF');}
});
test('critical voices respect distance, speaking, mute and global/perhero pacing',()=>{
 const gate=new CriticalVoiceGate();const ready={controlled:true,distance:0,busy:false,muted:false};
 assert.equal(gate.accept('chrom',0,{...ready,muted:true}),false);assert.equal(gate.accept('chrom',0,{...ready,busy:true}),false);
 assert.equal(gate.accept('chrom',0,ready),true);assert.equal(gate.accept('lucina',3000,ready),false);assert.equal(gate.accept('chrom',5000,ready),false);assert.equal(gate.accept('lucina',5000,ready),true);
 assert.equal(gate.accept('chrom',10000,{...ready,controlled:false,distance:400}),false);assert.equal(gate.accept('chrom',10000,ready),true);
 gate.reset();assert.equal(gate.accept('chrom',0,ready),true);
});
