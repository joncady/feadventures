import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path('Main Game');O=R/'src/game/data/map-art/chapters';P=R/'docs/playtests/map-art-direction/secondary'
C={
'fort-tileset.png':('https://feuniverse.us/t/updated-fort-tileset/9288','ZoramineFae / Flasuban; original game graphics and edits'),
'stronghold-tileset.png':('https://feuniverse.us/t/updated-stronghold-tileset/6134','ZoramineFae / N426 / Flasuban / Wan'),
'castle-moat.png':('https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39','RandomWizard; N426 improved castle kit; F2U/F2E'),
'barons-castle.png':('https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39','RandomWizard; N426 improved castle kit; F2U/F2E'),
'royal-great-hall.png':('https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/39','RandomWizard; N426 improved castle kit; F2U/F2E'),
'castle-palette.png':('https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/9','N426 improved castle tileset; local castle-credits.txt'),
'randomwizard-wilderness.png':('https://feuniverse.us/t/1-screen-mapping-blitz-challenge/9639/9','RandomWizard map; N426 / Zoramine / Vennobennu tileset; explicitly free to edit with credit'),
'plains-preview-map.png':('https://feuniverse.us/','WAve; local plains-credits.txt')}
ids=['east-road','village-watch','plegian-gate','village','castle-defense','chonsin-pass','conqueror-hall','dark-castle']
for id in ids:
 p=O/f'{id}.json';d=json.loads(p.read_text());sources=sorted(set(l['source'] for l in d['layers']));d['credits']=[dict(source=s,url=C[Path(s).name][0],credit=C[Path(s).name][1]) for s in sources];None # Preview is read-only; source credits are already embedded in the profile.
 # Default scale proof at deployment/central combat. Clearly composition rather than runtime capture.
 im=Image.open(P/f'{id}.png').convert('RGBA');hx,hy=d['anchors']['heroCamp']
 if id in ['village-watch','village','castle-defense']:coords=[(hx,hy),(hx-48,hy+48),(hx+48,hy+48),(hx,hy+96)]
 elif id in ['conqueror-hall','dark-castle']:coords=[(512,384),(464,432),(560,432),(512,480)]
 elif id=='chonsin-pass':coords=[(416,208),(384,240),(448,240),(480,208)]
 elif id=='plegian-gate':coords=[(448,496),(400,544),(496,544),(448,576)]
 else:coords=[(544,256),(496,304),(592,304),(544,336)]
 for key,(x,y) in zip(['chrom','frederick','lissa','ricken'],coords):
  p=R/f'public/assets/{key}-animated.png';s=Image.open(p if p.exists() else R/f'public/assets/{key}.png').convert('RGBA');im.alpha_composite(s.crop((0,0,50,50)),(x-25,y-40))
 for key,x,y in [('axeman',coords[0][0]+112,coords[0][1]-40),('mage',coords[0][0]+160,coords[0][1]+16)]:
  p=R/f'public/assets/{key}-animated.png';s=Image.open(p if p.exists() else R/f'public/assets/{key}.png').convert('RGBA');im.alpha_composite(s.crop((0,0,50,50)),(x-25,y-40))
 cx=max(0,min(im.width-896,coords[0][0]-448));cy=max(0,min(im.height-544,coords[0][1]-272));cy=0 if id=='conqueror-hall' else 64 if id=='dark-castle' else cy;im.crop((cx,cy,cx+896,cy+544)).save(P/f'{id}-actors-camera.png')
font=ImageFont.truetype(str(R/'public/assets/FE.otf'),19)
for name,batch in [('batch-1-2-4',['east-road','village-watch','village']),('batch-6-8-10',['castle-defense','conqueror-hall','dark-castle']),('all-eight',ids)]:
 board=Image.new('RGB',(920,((len(batch)+1)//2)*338),'#172d32');dr=ImageDraw.Draw(board)
 for i,id in enumerate(batch):
  x=(i%2)*460;y=(i//2)*338;dr.text((x+8,y+8),id,fill='#f0e3bd',font=font);im=Image.open(P/f'{id}-actors-camera.png').resize((448,272),Image.Resampling.NEAREST);board.paste(im,(x+6,y+36))
 board.save(P/f'{name}-contact.png')
