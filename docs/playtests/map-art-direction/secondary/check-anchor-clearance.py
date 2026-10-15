import json,math,collections
from pathlib import Path
O=Path('Main Game/src/game/data/map-art/chapters');out=[]
for p in O.glob('*.json'):
 if p.stem in ['valm-landing','grimleal-approach']:continue
 d=json.loads(p.read_text());w,h=d['width'],d['height'];sol=d['solids']
 def free(pt):
  x,y=pt
  return 16<=x<=w-16 and 16<=y<=h-16 and all(math.hypot(x-max(rx,min(x,rx+rw)),y-max(ry,min(y,ry+rh)))>=16 for rx,ry,rw,rh in sol)
 def snap(p):return (round(p[0]/16)*16,round(p[1]/16)*16)
 start=snap(d['anchors']['heroCamp']);q=collections.deque([start]);seen={start}
 while q:
  x,y=q.popleft()
  for v in [(x+16,y),(x-16,y),(x,y+16),(x,y-16)]:
   if v not in seen and free(v):seen.add(v);q.append(v)
 targets=[('heroCamp',d['anchors']['heroCamp']),('objective',d['anchors']['objective'])]+[(f'camp{i}',p) for i,p in enumerate(d['anchors']['camps'])]+[(f'entry{i}',p) for i,p in enumerate(d['anchors']['spawnEntries'])]
 records=[dict(anchor=k,point=p,free=free(p),connected=snap(p) in seen) for k,p in targets];bad=[r for r in records if not(r['free'] and r['connected'])];print(d['id'],bad)
 out.append(dict(id=d['id'],heroRadius=16,gridStep=16,records=records))
Path('Main Game/docs/playtests/map-art-direction/secondary/anchor-clearance.json').write_text(json.dumps(out,indent=2)+'\n')
