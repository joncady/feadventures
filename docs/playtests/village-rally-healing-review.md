# Village, rally and urgent healing — 2026-10-11

Village defense now uses a1024×704 map with central village, four fixed NPC guard posts and converging ground entrances. Its authored enemy counts/wave times/cap14 are unchanged. Concealed entry candidates and24px camera margin allow releases outside the compact camera view.

R calls living companions near the controlled hero for10seconds with a20second cooldown; fixed soldiers keep their posts. Expiry restores placed home anchors. Planning R still begins battle. Native status/feedback and ordinary R screenshots were verified.

Inactive companions carrying a staff temporarily equip it when an eligible nearby ally falls below50%HP, keep urgent support until no eligible patient is below75%, then restore their prior weapon with a4second retrigger cooldown. This mode never changes the controlled hero's weapon. Taking control restores the prior weapon; manually equipped or staff-only healers retain their normal automatic support. Temporary staff choices are restored before mission progression is saved.

The first compact-map natural run won in152.447seconds but was comfortable, so village enemy damage alone rose0.85→1.25. The second ordinary-control run won in152.407seconds. Near141seconds Sumia was81HP and Virion53HP, one NPC had fallen, and village health was897/900. Healing countered earlier damage; all companions survived. A cohesive support party remains comfortable, so this is measurable attrition evidence rather than proof of severe pressure. The controlled character used unmodified Fire; Thunder+1 was purchased by ordinary shop input but not equipped.

Verification:43unit tests, TypeScript and production build;8 relevant campaign/deployment/rally browser checks plus2 affected damage/rally reruns passed. Native R active/cooldown screenshots and ordinary village logs are attached here. The complete campaign was not replayed after this local change. No push or deployment.
