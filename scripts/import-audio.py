import zipfile,json,wave,io,subprocess,sys
from pathlib import Path
source=Path(sys.argv[1]) # Directory containing 399888.zip, 406669.zip and 401959.zip.
mapping={'chrom':'CHROM','lucina':'MARTH','frederick':'FREDERIK','virion':'VIAUR','sumia':'SMIA','morgan':'MARC_M','cordelia':'TIAMO','lissa':'LIZ','lonqu':'RONKUU','miriel':'MYRIEL','ricken':'LICHT','stahl':'SORT','sully':'SOIREE','tharja':'SALLYA','vaike':'WYCK','robin':'PLAYER_M1','robin-female':'PLAYER_F1'}
out=Path('public/assets/audio');out.mkdir(parents=True,exist_ok=True);data=[]
for hero,internal in mapping.items():
 archive='406669' if hero in ('robin','robin-female') else '399888';z=zipfile.ZipFile(source/(archive+'.zip'))
 for event,suffix in [('attack','ATTACK_L_1'),('damage','DAMAGE_1'),('death','DEAD_1')]:
  match=next(n for n in z.namelist() if n.endswith('SE_VOICE_'+internal+'_'+suffix+'.wav'))
  filename=hero+'-'+event+'.wav';out.joinpath(filename).write_bytes(z.read(match));data.append(dict(key='voice-'+hero+'-'+event,file='audio/'+filename,hero=hero,event=event,member=match,source='https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/'+archive+'/',uploader='robotortoise'))
z=zipfile.ZipFile(str(source/'401959.zip'));candidates=[]
for member in z.namelist():
 if '/WARC_EFFECT_' not in member or not member.endswith('.wav'):continue
 b=subprocess.check_output(['unzip','-p',str(source/'401959.zip'),member]);w=wave.open(io.BytesIO(b));duration=w.getnframes()/w.getframerate()
 if .1<=duration<=2:
  filename='effect-'+member.split('/')[-1];out.joinpath(filename).write_bytes(b);candidates.append(dict(key='archive-effect-'+str(len(candidates)+1),file='audio/'+filename,member=member,duration=duration,source='https://sounds.spriters-resource.com/3ds/fireemblemawakening/asset/401959/',uploader='robotortoise',status='Unidentified effect; audition before assignment'))
 if len(candidates)==3:break
Path('docs/audio-sources.json').write_text(json.dumps(data+candidates,indent=2)+'\n')
Path('src/game/data/audio-assets.ts').write_text('export const AUDIO_ASSETS = '+json.dumps([{k:e[k] for k in ['key','file']} for e in data+candidates],indent=2)+' as const;\n')
print(len(data),'voice clips;',len(candidates),'effect candidates;',sum(p.stat().st_size for p in out.glob('*')),'bytes')
