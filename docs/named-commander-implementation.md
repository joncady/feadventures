# Named commander implementation — local 1.1.0

Four missions remain. Road is unchanged. Village now schedules two 44-second assaults, an 8-second commander warning, then Gangrel. Its victory condition explicitly requires Gangrel defeated and a living village. Castle introduces Walhart after its three assaults; Black Keep introduces Validar after three assaults. Their 700 / 900 / 1400 HP values are initial tuning targets, not measured human clear-time guarantees.

Original briefings identify Gangrel as the Plegian king, Walhart as a separate Valmese invasion, and Validar as the Grimleal leader. Walhart is not portrayed as Validar's subordinate. Current live saves retain version-1 storage and the four-mission completion boundary. A completed legacy Village result remains a legitimate checkpoint; it is not rolled back to force a new boss encounter. Existing preparation checkpoints resume the updated mission from its beginning, as before. There is no mid-battle combat checkpoint.

The native boss summary sits between party and minimap: exact source portrait, name/current HP, HP bar and attack phase. Windup reads “Preparing attack,” recovery reads “Opening,” and Validar's lower-health phase reads “Dark magic intensifies.” Transient action feedback moves below that summary. No new interactive panel covers pointer attacks.

## Local review

Open Settings → Developer mission jump to select Village, Castle Siege or Black Keep. Use Auto-place if desired, then begin. These shortcuts enter normal missions; they do not auto-defeat enemies or alter rewards. Boss arrival follows the ordinary wave schedule. Review mobile and desktop attacks, phase tells, ranged dodge windows, health display, camp pressure and companion survival. After victory, verify the results name the defeated commander and Continue advances exactly one of the existing four stages.

Developer test fixtures that jump phase or destroy foes only verify conditions/layout; they do not establish natural boss balance or a full-route clear time.

## Verification

- Unit suite passed 64 tests when this slice was integrated; typecheck passed after the shared combat profiles and native summary were connected.
- Added checks for explicit defense + commander victory and legacy/pending save reward idempotency across every mission index.
- Existing Village browser fixture now verifies two waves do not finish the mission, Gangrel appears before results, and continuation rewards apply once. Commander cap fixtures continue retaining earlier attackers. Independent browser and window-size review is delegated separately.
