"""Build a local-only audition library from the downloaded source ZIPs."""
import json, shutil, subprocess, sys, zipfile
from pathlib import Path
source = Path(sys.argv[1])
root = Path('audio-review'); root.mkdir(exist_ok=True)
aliases = {'CHROM':'Chrom','MARTH':'Lucina','FREDERIK':'Frederick','VIAUR':'Virion','SMIA':'Sumia','MARC_M':'Morgan','TIAMO':'Cordelia','LIZ':'Lissa','RONKUU':'Lonqu','MYRIEL':'Miriel','LICHT':'Ricken','SORT':'Stahl','SOIREE':'Sully','SALLYA':'Tharja','WYCK':'Vaike','PLAYER_M1':'Robin'}
clips=[]
for archive, group in [('399888','Character voices'),('406669','Robin voices'),('401959','Effects')]:
    folder=root/archive; folder.mkdir(exist_ok=True)
    with zipfile.ZipFile(source/(archive+'.zip')) as z:
        for i, info in enumerate(z.infolist()):
            if not info.filename.lower().endswith('.wav'): continue
            name=Path(info.filename).name
            file=f'{archive}/{i}-{name}'
            target=root/file
            if not target.exists():
                data=subprocess.check_output(['unzip','-p',str(source/(archive+'.zip')),info.filename]) if info.compress_type==9 else z.read(info)
                target.write_bytes(data)
            character=next((hero for key,hero in aliases.items() if f'SE_VOICE_{key}_' in name),'')
            clips.append(dict(name=name,character=character,group=group,file=file))
(root/'catalog.json').write_text(json.dumps(clips))
shutil.copyfile('scripts/audio-review.html',root/'index.html')
print(f'{len(clips)} clips ready at http://127.0.0.1:5173/audio-review/index.html')
