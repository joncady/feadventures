import json,math
from pathlib import Path
O=Path('Main Game/src/game/data/map-art/chapters');counts={'east-road':0,'village-watch':4,'plegian-gate':2,'village':4,'castle-defense':4,'chonsin-pass':0,'conqueror-hall':4,'dark-castle':4}
proof=[]
for id,count in counts.items():
 p=O/f'{id}.json';d=json.loads(p.read_text());a=d['anchors'];sol=d['solids'];w,h=d['width'],d['height']
 # Read actual current deployment; never rewrite author profiles.
 l,t,r,b=a['deployment']
 def free(pt):
  x,y=pt[0],pt[1]+4.5
  return all(math.hypot(x-max(rx,min(x,rx+rw)),y-max(ry,min(y,ry+rh)))>=16 for rx,ry,rw,rh in sol)
 def legal(pt,placed):return free(pt) and all(math.dist(pt,v)>=64 for v in placed) and all(math.dist(pt,v)>=150 for v in a['camps']) and math.dist(pt,a['heroCamp'])>=64
 positions=[]
 for y in range(t+32,b-19,32):
  for x in range(l+32,r-19,32):
   if legal([x,y],positions):positions.append([x,y])
 # Keep lower positions for stationary soldiers when available, then verify native greedy auto heroes.
 assert len(positions)>=count+4,(id,positions)
 guards=a.get('soldiers',[]);assert len(guards)==count,(id,'guard count');placed=guards.copy();heroes=[]
 for i in range(4):
  found=None
  for y in range(t+32,b-19,32):
   for x in range(l+32,r-19,32):
    if legal([x,y],placed):found=[x,y];break
   if found:break
  assert found,(id,'autoplace',i)
  heroes.append(found);placed.append(found)
 print(id,guards,heroes)
 proof.append(dict(id=id,soldierCount=count,soldiers=guards,simulatedFourHeroAutoPlace=heroes,deployment=a['deployment'],method='Static radius16 +4.5px body offset, inside courtyard20 margins,64spacing,camps150,heroCamp64. Actual Arena test remains required.'))
Path('Main Game/docs/playtests/map-art-direction/secondary/deployment-clearance.json').write_text(json.dumps(proof,indent=2)+'\n')
