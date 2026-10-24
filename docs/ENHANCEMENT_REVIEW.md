# Enhancement implementation review

Date: 2026-10-24. Implemented locally; this review does not claim a production deployment.

## Delivered

- Interruptible planet arrivals: window dimming, instanced travel streaks and a gentle destination glide. Camera remains anchored. Texture failures retain a readable fallback and retry option.
- Explicitly enabled procedural audio: quiet cabin hum, short interaction/arrival cues, separate volume and mute. No audio downloads. Starts muted on every visit; visibility and reading state control playback.
- Lazy project workflow illustrations: NoClash overlap planning, Student Portal approval/publication, and NoTerm command review with sample output. Live/source links precede the examples. All examples are labelled sample data.
- Physical navigation chart plus a native modal star map, all nine destinations, local visited markers and a reset control. The main dropdown remains immediately available.
- Inspection-drone docking, launch and attention responses, with a native control equivalent and reduced-motion behavior.
- Outcome-focused contribution log in About, Approach and the text route. Includes only confirmed employment dates and metrics.
- Working/evening cabin lighting, a wall switch and optional local preference. Destination treatments compose with the cabin mode.
- Two optional discoveries: the lunar personal note and a short original radio signal. No discovery gates portfolio information.
- Bounded resource use, lazy nonessential interfaces, still/reduced-effects controls, native dialogs and the existing text fallback/resume download.

## Verification

- Astro check: 35 files, zero errors, warnings or hints. All 15 unit tests pass. Production static build succeeds (three routes).
- Desktop 1440 x 900 and phone viewport 390 x 844 reviewed. Phone star map, settings and case-study controls fit; no document horizontal overflow.
- All nine destination textures reached ready/settled states. Repeated visits held the observed texture count at 19 after cache warm-up. Rapid Sun-to-Earth switching settled on Earth.
- All nine destinations also settled in evening mode with reduced effects. These are state/load checks; physical-device visual/FPS verification remains separate.
- Fixed a still-view arrival bug caused by the destination marker being written after the arrival frame. Still view now settles new destinations, and ambient cabin time remains unchanged between observations.
- NoClash example distinguishes overlapping and boundary-touching classes. Student Portal approve/reject/reset updates publication. NoTerm requires review, shows sample output and clears confirmation when the task changes.
- Map selection/focus restoration, direct full case access, lighting, drone docking, audio enable/mute and lunar note checked in-browser. Final browser error log empty.
- Text route HTTP 200. Resume HTTP 200, 101443 bytes, SHA256 f3a38fd9240b0ad3f731f9f33cd66ed1cef35798beb0d01d18af26b93f6fabcc, matching the supplied resume.

## Workload observations

| Default Neptune composition | Before | After |
| --- | ---: | ---: |
| Draw calls | 277 | 287 |
| Triangles | 118336 | 122350 |
| Geometries | 312 | 326 |
| Textures, cold / warm cache | 17 | 17 / 19 |

Measurements are local renderer observations, not physical-phone performance guarantees. Transition/shadow-refresh frames can temporarily report roughly double resting draw calls. The final frame-interval sample reported median 30.7 ms and p95 46.5 ms; this includes demand/input scheduling and is not GPU execution time. Ambient wake-up targets 30 Hz.

Largest final scene chunk: 1028905 bytes minified, 275597 bytes using local gzip. React client: 183991 / 57173 bytes. Workshop: 23639 / 8321 bytes. Project demo loads separately: 3844 / 1432 bytes. The existing greater-than-500-kB chunk warning remains visible in the build.

## Remaining release checks / content

- Test real mobile hardware, slow-network texture loading, background-tab audio behavior, WebGL loss/recovery and blocked-storage behavior under device/browser constraints. No full accessibility-conformance claim is made.
- Listen to and tune the procedural audio on speakers/headphones; browser enable/mute checks do not establish subjective audio quality.
- Replace or supplement clearly labelled workflow illustrations with genuine approved project screenshots when supplied. Do not present synthetic images as shipped product evidence.
- Validate deployed compression/cache headers and hosting asset paths when deployment is requested.

Captures: enhancements-before.png, enhancements-after.png and enhancements-phone.png in the task visualization artifact directory.

## Camera drag follow-up

User reported jitter during camera movement. Inspection found recursive R3F hover raycasts across project meshes on every pointer move, even while the camera owned the drag, plus damping of 6 that left a long trailing response. The camera now handles active drags in the window capture phase and skips scene pointer-move picking once the six-pixel drag threshold is crossed. Ordinary clicks, pointer-up handling and native labels remain available. Damping is 22 during dragging and 14 for the short release/key ease. No rendering-quality reduction was introduced.

Verified real browser drags in both directions, return to approximately zero yaw/pitch, no case study opening on drag, and normal NoClash case access afterward. Browser error log empty. Type checks and all 15 existing tests pass. This confirms gesture behavior; no hardware FPS improvement is claimed from the ambient cadence counter.

## Evening-mode removal follow-up — 24 October 2026

Removed the evening mode, its native control and interactive wall switch, preference reads/writes, conditional environment/hull-light branches and per-frame cabin-light interpolation. The single working-light setup remains static; destination-specific treatments remain independent. Previous lighting-mode checks and Lighthouse figures above describe the earlier build.

Verification: Astro check (40 files, zero diagnostics), all15 unit tests and production build pass. Browser settings contain no lighting-mode button; fixed working lighting and Sun/Neptune arrivals work, with no browser errors. Room chunk is1028307bytes raw/275458local-gzip, Workshop30143/10592. Combined compressed reduction versus the audited build is363bytes. This removal simplifies runtime work but is not evidence that the mobile startup budget now passes; Lighthouse was not rerun for this small removal.
