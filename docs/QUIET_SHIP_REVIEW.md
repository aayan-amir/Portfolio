# Quiet spaceship redesign

24 October 2026. This direction supersedes the three-simultaneous-exhibits composition in SPACESHIP_REDESIGN_PLAN.md, following the user's feedback that everything demanded attention.

## Delivered

- Removed the wooden desk, office chair, shelves, generic project screens and small prop clutter.
- Curved ceramic/titanium hull profiles, panoramic glazing, integrated sill, restrained guide lighting, single central plinth, and a smaller off-axis planet.
- One selected project at a time: NoClash schedule tracks, Student Portal document archive, or NoTerm action sequencer. All are original procedural geometry with different silhouettes.
- Simple named project choices and direct case-study actions. Project switches use a short settling motion; no continual orbit, drifting dust, or automatic planet movement. Reduced motion settles immediately.
- Compact identity and navigation. Destinations, reset, still/reduced settings and text edition are grouped in an optional details control.
- Existing readable project panels, source/demo links, history, deep links and contact remain.
- Camera now implements drag-to-look rather than drag-the-room. Right drag reveals the right side; up drag reveals the ceiling. Arrow keys work when the canvas has focus. Pointer ownership/cancel/blur cleanup retained.
- Earth uses a locally hosted, credited Solar System Scope day map from the Three.js examples. Other planets remain stylized procedural materials. Credits available in settings and text portfolio.

## Verification

- Camera tests project a stationary 3D landmark through the actual Three.js camera matrix. They verify visible movement for right/up/down gestures instead of asserting arbitrary angle signs.
- Eleven automated tests pass. Astro check and production build pass; the existing large Three.js chunk warning remains.
- Desktop 1440x900 and phone-sized 390x844 browser views inspected. This is not physical phone GPU validation.
- Browser drag right/up visibly moved the stationary installation left/down, revealing right hull/ceiling. Reset and project changes return the framing.
- Project choices replace the active geometry and update the reading action. Student Portal case study and Saturn destination URL verified together. Readable HTML remains accessible independently of 3D.
- Settled NoClash/Earth sample: 89 draw calls, 71,648 triangles, 61 geometries and 7 textures. Frame counter stayed at 55 across separate idle observations: no continuous render loop at rest. These are renderer counters, not isolated GPU timings or a universal performance guarantee.

## Scope limits

This is a rendered real-time redesign, not the earlier offline concept image. It intentionally uses much less detail, glow, and simultaneous content. Planet transitions remain immediate; installation changes have brief settling motion. Project-specific illustrative approval/command sequences are not full simulated apps. Physical-phone profiling, final resume, approved screenshots, deployment and final release metadata remain separate work.
