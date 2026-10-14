# Centered command row — independent review

Final **GO**. Root visually approved the normal three-command layout. No production edits/push by reviewer.

Cause of prior awkward spacing: bottom layout reserved four fixed positions even when staff-only self-heal was hidden, leaving a vacant slot and an off-center Guard. An overflow translation could also shift the lower group independently of the wheel. This repair computes positions from the visible three/four-command list and centers that list directly on the attack wheel.

Six phone cases667×375,844×390,932×430, normal page and actual native fullscreen. Actual hero/weapon controls switch Chrom→Frederick→Lissa staff, then Lissa staff→axe. Every case measures ordinary3, staff4, and returned ordinary3: row mean equals wheel center within1.2e−13logical floating error; visible neighbors have equal spacing; all targets stay within canvas,≥44CSSpx and≥10logical clear of the circle. Previous/next remain symmetric at wheel sides. Both larger wheel sizes, header Pause/fullscreen and cooldown positions are unchanged.

When switching to the axe, the self-heal child becomes invisible and its Rectangle input is disabled. The remaining controls move through their container transforms; hit geometry follows the new centers. There is no retained self-heal hit object in the hidden slot. Equipment texture updates to axe. The staff full-health + is dim intentionally, still participating in four-slot centering; it becomes active only when healing is available. Availability/guard/clickthrough behavior remains the previously reviewed radial implementation.

No page errors in any case. Builder typecheck and two focused native touch tests passed20.7s; their geometry assertion now checks the visible lower-row mean against the attack-wheel center. These are short native-input/layout fixtures, not physical phone ergonomics or natural balance trials.

- [Measurements and actual weapon transitions](playtests/centered-commands-1.1.10/measurements.json)
- [Normal three-command row](playtests/centered-commands-1.1.10/844-page-three.png)
- [Staff four-command row](playtests/centered-commands-1.1.10/844-page-staff-four.png)
- [Small phone three-command fullscreen](playtests/centered-commands-1.1.10/667-full-three.png)

Images show an opening Siege fixture with full-health heroes; healing control is dim in staff images. Badge reflects dev-server define, not a separately claimed release version.
