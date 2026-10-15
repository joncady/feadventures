import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('shipped Wilderness terrain matches the primary creator image and retains edit-with-credit terms',()=>{
 const path='asset-library/map-candidates/compact/randomwizard-wilderness.png';
 const ledger=JSON.parse(readFileSync('asset-library/map-candidates/compact/sources.json','utf8'));
 const source=ledger.find((entry:{file:string})=>entry.file==='randomwizard-wilderness.png');
 assert.ok(source,'used Wilderness source requires a central provenance entry');
 assert.equal(source.creator,'RandomWizard');
 assert.equal(source.source,'https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/9');
 assert.equal(source.imageSource,'https://feuniverse.us/uploads/default/original/3X/1/8/1856c033a41df8bfb32bb641901e1998a2f843e6.png');
 assert.deepEqual(source.tilesetContributors,['N426','Zoramine','Vennobennu']);
 assert.match(source.permissionQuote,/give credit.*free to edit/);
 assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),source.sha256,'local source must match verified primary image bytes');
 const chapter=JSON.parse(readFileSync('src/game/data/map-art/chapters/east-road.json','utf8'));
 assert.ok(chapter.layers.some((layer:{source:string})=>layer.source===path),'provenance covers an actually used source');
 assert.ok(chapter.credits.some((credit:{source:string;url:string})=>credit.source===path&&credit.url===source.source));
});
