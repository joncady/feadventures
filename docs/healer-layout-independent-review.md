# Healing UI independent layout review — 1.0.11

Reviewed in one sequential Chromium browser at 809, 1039, and 1440 CSS px widths, height 1066, DPR 2. Each width exercised controlled Miriel with staff equipped on all four mission maps. Setup used direct scene fixtures; staff selection used native F presses. Companion actions were frozen to inspect layout consistently. This is a scoped layout review, not a full mission playthrough.

No new party-row overlap or text sharpness regression was found. The icons fit alongside HP/XP without increasing the panel footprint. A separate four-member road fixture included Robin (Female), Frederick, and Lissa: Robin's name line ended at logical x159, versus icon left edge x175, leaving 16px clearance. Initial-level text is readable at 809, with the expected smaller game scale. Text remains Phaser-native.

The range circle is subtle and does not cover units. It is easier to distinguish on the Keep's dark stone than on the road's grass. This is acceptable for a secondary guide; the stronger selected-patient marker is the primary cue when healing is available. Existing equipment-switch instructional notices still temporarily use a broad text panel; this review introduces no new panel or persistent instructions.

The main matrix used three valid members; the additional longest-name fixture corrected an invalid Robin key and exercised all four rows. Screenshots are scoped evidence, with artificial timing (Infinity deadline) visible; they are not release marketing captures.

Native heal rejection, actual selected patient, self-healing, F/Q/E equipment updates, and urgent-healing preservation are covered by the implementer's focused browser tests. The direct scene fixture bypasses main pause state, so this review does not claim a normal pause-path test.

Evidence: [road, 809](playtests/healer-ui-1.0.11/road-809-dpr2.png), [Keep, 809](playtests/healer-ui-1.0.11/keep-809-dpr2.png), [Keep, 1039](playtests/healer-ui-1.0.11/keep-1039-dpr2.png), [Keep, 1440](playtests/healer-ui-1.0.11/keep-1440-dpr2.png).
