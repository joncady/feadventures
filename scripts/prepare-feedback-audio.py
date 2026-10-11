"""Copy recorded UI/dialogue cues from the local Awakening audition library.

No sound synthesis: heal currently reuses ui-move.wav provisionally in the registry.
"""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
output = root / 'public/assets/audio'
shutil.copyfile(root / 'audio-review/401959/21-WARC_14_3.wav', output / 'ui-move.wav')
shutil.copyfile(root / 'audio-review/401959/1-WARC_14_0.wav', output / 'dialogue-advance.wav')
