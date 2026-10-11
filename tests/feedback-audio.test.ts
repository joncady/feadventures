import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { AUDIO_ASSETS } from '../src/game/data/audio-assets';

test('feedback keys resolve to shipped, nonempty WAV clips', () => {
  for (const key of ['ui-cursor', 'ui-confirm', 'ui-reject', 'heal', 'dialogue-advance']) {
    const asset = AUDIO_ASSETS.find(asset => asset.key === key);
    assert.ok(asset, `Missing ${key} loader entry`);
    const clip = readFileSync(new URL(`../public/assets/${asset.file}`, import.meta.url));
    assert.equal(clip.toString('ascii', 0, 4), 'RIFF');
    assert.equal(clip.toString('ascii', 8, 12), 'WAVE');
    assert.ok(clip.length > 44, `${key} contains audio frames`);
  }
});

test('cursor audio retains the user-selected original when audition source is available', () => {
  const original = new URL('../audio-review/401959/21-WARC_14_3.wav', import.meta.url);
  // Audition archives are intentionally excluded from Git and clean CI checkouts.
  if (!existsSync(original)) return;
  assert.deepEqual(readFileSync(new URL('../public/assets/audio/ui-move.wav', import.meta.url)), readFileSync(original));
});

test('dialogue cue is the unchanged recorded candidate and does not replace generic UI audio', () => {
  const dialogue = AUDIO_ASSETS.find(asset => asset.key === 'dialogue-advance');
  const cursor = AUDIO_ASSETS.find(asset => asset.key === 'ui-cursor');
  const confirmation = AUDIO_ASSETS.find(asset => asset.key === 'ui-confirm');
  assert.equal(dialogue?.file, 'audio/dialogue-advance.wav');
  assert.equal(cursor?.file, 'audio/ui-move.wav');
  assert.equal(confirmation?.file, 'audio/ui-move.wav');
  const original = new URL('../audio-review/401959/1-WARC_14_0.wav', import.meta.url);
  if (!existsSync(original)) return;
  assert.deepEqual(readFileSync(new URL('../public/assets/audio/dialogue-advance.wav', import.meta.url)), readFileSync(original));
});
