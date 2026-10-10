// Requires Playwright Chromium. Uses only local originals; no network requests.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const encoded = fs.readFileSync(path.join(root, 'asset-library/awakening/level-up-reference.m4a')).toString('base64');
  const decoded = await page.evaluate(async data => {
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const context = new OfflineAudioContext(1, 44100, 44100);
    const buffer = await context.decodeAudioData(bytes.buffer);
    const mono = new Float32Array(buffer.length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const samples = buffer.getChannelData(channel);
      for (let i = 0; i < samples.length; i++) mono[i] += samples[i] / buffer.numberOfChannels;
    }
    return { rate: buffer.sampleRate, samples: Array.from(mono) };
  }, encoded);
  let start = decoded.samples.findIndex(v => Math.abs(v) > .005);
  let end = decoded.samples.length - 1;
  while (end > start && Math.abs(decoded.samples[end]) <= .005) end--;
  start = Math.max(0, start - Math.round(decoded.rate * .03));
  end = Math.min(decoded.samples.length, end + Math.round(decoded.rate * .08));
  const samples = decoded.samples.slice(start, end);
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(decoded.rate, 24); wav.writeUInt32LE(decoded.rate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(root, 'public/assets/audio/level-up.wav'), wav);
  console.log(`Prepared level-up clip: ${(samples.length / decoded.rate).toFixed(2)}s; trimmed only leading/trailing silence.`);
} finally { await browser.close(); }
