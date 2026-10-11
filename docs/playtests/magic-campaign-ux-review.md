# Independent normal-speed campaign playtest

Party: Morgan, Miriel (Heal equipped as companion), Sumia, Virion. Morgan Fire forged +1 through ordinary shop controls. Default difficulty. No enemy, HP, clock, or campaign mutations; no accelerated time; no retries in the successful fresh run.

Fresh party selection: 2026-10-10 23:38:11.558 UTC. Final boss victory: 23:50:52.318 UTC. Total: 12 minutes 40.760 seconds. Road 2:46.85; village 2:32.98; castle approximately 3:05 (last sample 2:51.24, transition before 23:47:39.228); final keep 2:59.01. Final party HP: Morgan105, Miriel104, Sumia104, Virion104.

Completion evidence: magic-campaign-complete-evidence.json records campaign.complete=true, missionIndex4, final active-battle sample, party HP and boss combat. Raw append-only play log: magic-playtest-final.log. Screenshot named magic-campaign-victory.png was mistimed: three Space presses advanced the final dialogue/victory back to party selection before capture. It is NOT a victory-screen screenshot. No state reinjection was used to reproduce it.

Liked: compact maps, short waves and rests, Q/E control swaps, meaningful healer support, and commander death ending a mission without hunting leftover archers. The stationary ranged-reach fix changed companion contribution dramatically: all four heroes survived castle after earlier versions lost the party.

Remaining UX issues: road should explicitly say advance east through ambushes because killing surviving archers is optional; healer must have Heal equipped and this needs prominent feedback; mouse aiming and selecting the boss over nearby minions need a short tutorial. Boss combat lasted roughly35-37 seconds, slightly shorter than intended45-75; acceptable initial tuning. Final mission preserved navigable routes and no blocking terrain issue occurred.

Driver limitation: earlier unsuccessful attempts used long queued input segments and delayed switching an automatically selected healer from Heal to Fire. Successful run used short segments and ordinary F input immediately on automatic healer takeover. Earlier failures remain documented and are not attributed solely to game balance.
