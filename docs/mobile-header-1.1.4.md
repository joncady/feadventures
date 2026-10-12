# Mobile page context

Normal mobile pages now retain the title, tagline, and version before the game. The concise header uses 20px title type and a visible version badge. Landscape FIT sizing reserves the measured header height and safe areas; normal pages can scroll. Desktop presentation remains unchanged.

The portrait rotation gate belongs to the game shell rather than the viewport. It pauses scenes, audio, and game input, but leaves page context readable. Fullscreen remains an explicit action. Native fullscreen and the user-selected iOS fitted viewport fallback hide the page header; exiting returns normal page context.

Implementation check: 69 unit tests, typecheck, and production build passed. Independent phone/browser layout review is required before release.
