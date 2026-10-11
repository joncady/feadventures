# Release 1.0.8 verification

October 11, 2026. Includes reviewed changes from local1.0.1–1.0.7: portrait/facing/range fixes, pause controls, recorded Rally/death voices, gold feedback/expiry, chunk-built Black Keep, clearer deployment/Auto-place, and directional retreating sword attacks.

Issue #67: deployment cursor and planning-grid Graphics now clear and become invisible on successful launch. New all-four-map assertions exercise native Auto-place and R at809px and1440px. Scene shutdown still disposes prior visuals; failed deployment retains the guide.

- 47 unit tests pass.
- Strict TypeScript and production build pass.
- Full 77 browser tests pass (2.8 minutes), including audio settings/death/Rally, save/restore, four missions, deployment, attacks and collision.
- Fresh local5173 runs1.0.8.
- Existing bundle-size warning remains nonblocking.
- Full natural campaign pacing was not replayed in this release; automated progression and affected final-map path checks passed.

GitHub issues remain the bug source of truth. No generated local audio-review catalog included.
