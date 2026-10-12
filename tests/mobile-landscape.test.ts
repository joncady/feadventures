import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requiresLandscape,lockLandscape} from '../src/game/platform/mobile-landscape';

test('portrait gate applies to touch phones, not narrow desktop windows or landscape',()=>{
  assert.equal(requiresLandscape(true,390,844),true);
  assert.equal(requiresLandscape(true,844,390),false);
  assert.equal(requiresLandscape(false,390,844),false);
  assert.equal(requiresLandscape(true,800,800),false);
});
test('fullscreen orientation locking tolerates unsupported and rejected browser APIs',async()=>{
  const priorScreen=Object.getOwnPropertyDescriptor(globalThis,'screen');
  const priorDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  try {
    Object.defineProperty(globalThis,'document',{configurable:true,value:{fullscreenElement:{}}});
    Object.defineProperty(globalThis,'screen',{configurable:true,value:{orientation:{}}});
    await lockLandscape();
    let calls=0;
    Object.defineProperty(globalThis,'screen',{configurable:true,value:{orientation:{lock:async(mode:string)=>{assert.equal(mode,'landscape');calls++;throw new Error('NotSupportedError');}}}});
    await lockLandscape();assert.equal(calls,1);
    Object.defineProperty(globalThis,'document',{configurable:true,value:{fullscreenElement:null}});
    await lockLandscape();assert.equal(calls,1);
  }finally {
    if(priorScreen)Object.defineProperty(globalThis,'screen',priorScreen);else delete (globalThis as any).screen;
    if(priorDocument)Object.defineProperty(globalThis,'document',priorDocument);else delete (globalThis as any).document;
  }
});
