"""Enumerate every checked-in runtime, reference and legacy asset with provenance status."""
from pathlib import Path
import json,hashlib,zipfile,re
from PIL import Image
root=Path(__file__).resolve().parent.parent
sources=json.loads((root/'docs/asset-sources.json').read_text())
for f in ('audio-sources.json','ui-audio-sources.json'):
 for item in json.loads((root/'docs'/f).read_text()):sources[item['file']]=item
for item in json.loads((root/'asset-library/map-candidates/compact/sources.json').read_text()):sources['asset-library/map-candidates/compact/'+item['file']]=item
mapcredits={'east-road.png':{'source':'https://github.com/Klokinator/FE-Repo/tree/main/Tilesets/Plains','creator':'WAve; trees ZoramineFae / Flasuban'},'village.png':{'source':'https://feuniverse.us/t/updated-fort-tileset/9288','creator':'ZoramineFae / Flasuban; plains WAve'},'castle-defense.png':sources['battlefield.png'],'dark-castle.png':{'source':'https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39','creator':'RandomWizard; tiles N426'},'camp-building.png':{'source':'https://feuniverse.us/t/updated-fort-tileset/9288','creator':'ZoramineFae / Flasuban'},'gold-icon.png':sources['weapon-icons.png'],'fire-bolt.png':{'source':'https://feuniverse.us/t/updated-stronghold-tileset/6134','creator':'ZoramineFae / N426 / Flasuban / Wan'}}
for name,item in mapcredits.items():sources['maps/'+name]=item
for part in ('west','center','east'):sources['maps/east-road-'+part+'.png']=mapcredits['east-road.png']
for weapon in ('sword','axe','lance','bow','tome'):sources['weapon-'+weapon+'.png']={**sources['weapon-icons.png'],'processing':'16px icon crop from standard System Icons sheet.'}
for name in ('menu-theme.wav','xp-tick.wav','heal.wav','axe-impact.wav','lance-thrust.wav','fire-cast.wav'):sources['audio/'+name]={'source':'scripts/legacy-generated-placeholder','processing':'Unused generated placeholder retained for inventory; not registered in active game.'}
audio_catalog={item['file']:item for item in json.loads((root/'audio-review/catalog.json').read_text())} if (root/'audio-review/catalog.json').exists() else {}
source_code='\n'.join(p.read_text() for p in (root/'src').rglob('*') if p.suffix in ('.ts','.css'))
heroes=re.findall(r"'([^']+)'",(root/'src/game/data/config.ts').read_text().split('export const HEROES = [')[1].split(']')[0])
active={h+('-animated' if h in ('chrom','lucina','frederick') else '')+'.png' for h in heroes}
active.update((h+'Portrait1' if h in ('chrom','lucina','frederick') else h+'Portrait')+'.png' for h in heroes)
active.update(re.findall(r"file: '([^']+)'",(root/'src/game/data/config.ts').read_text()))
active.update(n.replace('.png','-animated.png') for n in list(active) if n.startswith('enemy'))
active.update('weapon-'+w+'.png' for w in ('sword','axe','lance','bow','tome','staff'))
active.update(re.findall(r'"file": "([^"]+)"',(root/'src/game/data/audio-assets.ts').read_text()))
active.update(('audio/ui-move.wav','audio/battle-start.wav','audio/level-up.wav'))
entries=[]
for folder in ('public/assets','asset-library','v1/assets','audio-review'):
 for path in sorted((root/folder).rglob('*')):
  if not path.is_file():continue
  rel=path.relative_to(root).as_posix();suffix=path.suffix.lower();key=path.relative_to(root/'public/assets').as_posix() if rel.startswith('public/assets/') else rel
  meta=sources.get(key,sources.get(path.name,{}));source=meta.get('source');status='documented' if source and str(source).startswith('http') else 'generated-placeholder' if source and str(source).startswith('scripts/') else 'unverified'
  if rel.startswith('asset-library/awakening/') and path.stem.isdigit():source=f'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{path.stem}/';status='catalog-id'
  if folder=='audio-review' and path.suffix=='.wav':
   akey=path.relative_to(root/'audio-review').as_posix();meta=audio_catalog.get(akey,{});source='https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/'+akey.split('/')[0]+'/';status='catalog-id'
  item={'path':rel,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'kind':'image' if suffix in ('.png','.jpg','.jpeg','.gif') else 'audio' if suffix in ('.wav','.mp3','.ogg','.m4a') else 'font' if suffix in ('.ttf','.otf') else 'archive' if suffix=='.zip' else 'metadata','registered':(key in active or path.name in source_code) if folder=='public/assets' else False,'scope':'runtime' if folder=='public/assets' else 'legacy' if folder=='v1/assets' else 'reference','source':source,'provenance':status,'metadata':meta}
  if item['kind']=='image':
   with Image.open(path) as im:item['dimensions']=list(im.size)
  if suffix=='.zip':
   with zipfile.ZipFile(path) as z:item['members']=z.namelist()
  entries.append(item)
report={'schemaVersion':1,'updated':'2026-10-10','catalogReference':'https://www.spriters-resource.com/3ds/fireemblemawakening/','coverage':'Every file in public/assets, asset-library, v1/assets and the local audio-review audition library; excludes node_modules/build output. Catalog references identify available local sheets, not a claim to own/download the entire remote catalog.','totalFiles':len(entries),'entries':entries}
(root/'docs/asset-index.json').write_text(json.dumps(report,indent=2)+'\n')
from collections import Counter
counts=Counter(e['kind'] for e in entries);states=Counter(e['provenance'] for e in entries)
unknown_active=[e['path'] for e in entries if e['registered'] and e['provenance']=='unverified']
lines=['# Local asset inventory','',report['coverage'],'',f'Indexed **{len(entries)} files**. Types: '+', '.join(f'{k}: {v}' for k,v in counts.items())+'.','', 'Provenance: '+', '.join(f'{k}: {v}' for k,v in states.items())+'.','', 'Machine-readable inventory: `asset-index.json`; reproduce with `scripts/index-assets.py`. Each entry records file size, SHA-256, image dimensions, runtime/reference/legacy scope and exact known source metadata.','', '## Active source gaps','',f'{len(unknown_active)} registered files have unverified provenance: '+', '.join('`'+p+'`' for p in unknown_active)+'.','', '## Source gaps','', 'Legacy original sprites, maps, music and font without existing provenance remain unverified. A matching filename is not evidence of permission. Generated menu music, healing/XP cues and three combat sounds are flagged as placeholders; active loaders use sourced substitutes after integration. Asset sheet IDs map to the Spriters Resource catalog; actor roles/palettes/crops remain documented in `asset-sources.json`.','', '## Campaign map kit','', 'Maps are sourced-pixel compositions, not AI or locally painted artwork. Four source-preserving backgrounds, camp, flame and gold bag are reproduced with `scripts/compose-campaign-maps.py`. Individual layouts and gameplay terrain live in `src/game/data/maps.ts`. The high-level `MapChunk` interface specifies source crop, placement, scale, local terrain and connection sockets. Validate bounds and duplicate IDs before assembling; procedural random generation remains deferred.','', '| Mission | Source/design | Goal |','|---|---|---|','| East road | WAve plains + Fort trees, authored broad east-west lane | Clear low-level ambushes, reach east |','| Village | WAve plains + Fort houses, open crossroads | Protect village |','| Castle defense | Existing N426/WAve castle courtyard | Hold gates and commander |','| Black keep | RandomWizard Royal Great Hall, N426 tiles | Advance and defeat boss |','', 'All missions target roughly three minutes; actual completion time requires playtesting. Four missions plus short intermissions aim below twenty minutes. Collision masks are authored separately from screenshots.']
(root/'docs/asset-index.md').write_text('\n'.join(lines)+'\n')
print(report['totalFiles'],dict(counts),dict(states))
