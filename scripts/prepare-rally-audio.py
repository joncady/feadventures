"""Copy user-selected character cut-ins from the existing local inventory, unchanged."""
from pathlib import Path
import json,hashlib,shutil,wave
root=Path(__file__).resolve().parent.parent
index=json.loads((root/'docs/asset-index.json').read_text())
ids=dict(zip(['chrom','lucina','frederick','virion','sumia','morgan','cordelia','lissa','lonqu','miriel','ricken','stahl','sully','tharja','vaike','robin','robin-female'],['CHROM','MARTH','FREDERIK','VIAUR','SMIA','MARC_M','TIAMO','LIZ','RONKUU','MYRIEL','LICHT','SORT','SOIREE','SALLYA','WYCK','PLAYER_M1','PLAYER_F1']))
manifest={};sources=[]
for hero,internal in ids.items():
 entries=sorted((e for e in index['entries'] if e['scope']=='reference' and ('SE_VOICE_'+internal+'_CUTIN') in e['path']),key=lambda e:e['path'])
 manifest[hero]=[]
 for e in entries:
  original=root/e['path'];digest=hashlib.sha256(original.read_bytes()).hexdigest()
  if digest!=e['sha256']:raise ValueError('Indexed recording changed: '+e['path'])
  suffix=e['metadata']['name'].split('_CUTIN')[1].removesuffix('.wav').lower().replace('_','-')
  key='voice-'+hero+'-rally-'+suffix;file='audio/'+hero+'-rally-'+suffix+'.wav'
  target=root/'public/assets'/file;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original,target)
  with wave.open(str(original)) as audio:duration=audio.getnframes()/audio.getframerate()*1000
  clip=dict(key=key,file=file,indexedPath=e['path'],durationMs=round(duration))
  manifest[hero].append(clip)
  sources.append(dict(**clip,hero=hero,event='rally',member=e['metadata']['name'],source=e['source'],sha256=digest,selection='User requested randomized character-specific cut-ins for rally. Agent has not listened to/transcribed the dialogue.'))
(root/'docs/rally-audio-sources.json').write_text(json.dumps(sources,indent=2)+'\n')
(root/'src/game/data/rally-voices.ts').write_text("import type {Hero} from './config';\nexport type RallyVoice={key:string;file:string;indexedPath:string;durationMs:number};\n// User-selected cut-ins; exact dialogue has not been transcribed by this agent.\nexport const RALLY_VOICES:Partial<Record<Hero,readonly RallyVoice[]>> = "+json.dumps(manifest,indent=2)+';\n')
print('Copied',len(sources),'indexed recordings for',len(manifest),'characters, unchanged.')

# Extend the existing inventory without reclassifying unrelated assets.
runtime_paths={'public/assets/'+line['file'] for line in sources}
index['entries']=[e for e in index['entries'] if e['path'] not in runtime_paths]
for line in sources:
 path=root/'public/assets'/line['file']
 index['entries'].append(dict(path='public/assets/'+line['file'],bytes=path.stat().st_size,sha256=line['sha256'],kind='audio',registered=True,scope='runtime',source=line['source'],provenance='catalog-id',metadata=line))
index['totalFiles']=len(index['entries'])
index['updated']='2026-10-11'
(root/'docs/asset-index.json').write_text(json.dumps(index,indent=2)+'\n')
from collections import Counter
import re
kinds=Counter(e['kind'] for e in index['entries']);states=Counter(e['provenance'] for e in index['entries'])
md=root/'docs/asset-index.md';text=md.read_text()
text=re.sub(r'Indexed \*\*\d+ files\*\*\. Types: [^\n]+',f"Indexed **{index['totalFiles']} files**. Types: "+', '.join(f'{k}: {v}' for k,v in kinds.items())+'.',text)
text=re.sub(r'Provenance: [^\n]+','Provenance: '+', '.join(f'{k}: {v}' for k,v in states.items())+'.',text)
md.write_text(text)
