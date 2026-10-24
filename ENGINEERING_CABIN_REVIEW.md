# Engineering cabin redesign

The glass observatory and craft-workshop objects were replaced with a solid spacecraft cabin. A recessed viewport, enclosed ceiling, fitted work surfaces, lower-hull storage, service seams, vents and fasteners establish a common construction language. Materials use ivory hull panels, petrol equipment housings, muted orange handles and blue-green upholstery.

Project instruments:

- NoClash: navigation plotting instrument with timetable display and a moving route pointer.
- Student Portal: resource archive with an extracting data cartridge.
- NoTerm: docked maintenance terminal with an illustrative command preview and lever response.

The existing project case studies, direct navigation, anchored camera, native dialogs, keyboard controls and text portfolio remain available. The display contents are illustrations; they are not screenshots or functioning copies of the projects. Resume access remains a request until a real PDF is supplied.

Destinations retain texture-based planets and per-body room treatments. Sun adds protective viewport slats; Neptune adds cold window-edge highlights. The floor treatment was raised above the new floor to remain visible. Rendering stays demand-driven, with bounded interaction animation and texture disposal.

Validation:

- Astro check: zero errors, warnings and hints.
- Camera/navigation unit tests: all 11 pass.
- Production build passes; existing large Three.js bundle warning remains.
- Browser checked at 1440 x 900 and 390 x 844.
- All eight planets and Sun load their selected surface textures.
- Project previews, direct case-study access, heading focus and mobile project switching verified.
- Desktop workload observed at roughly 103k triangles and 230-240 draw calls. These are workload readings, not an FPS benchmark.

Remaining limits: procedural/code-authored geometry, no Blender asset pipeline introduced; physical phone GPU, screen-reader testing and cold-load Lighthouse profiling have not been performed. Art direction should be assessed in the live scene before adding more decorative objects.

## Direct case studies and continuous motion

Project objects and their accessible labels now open the full case study immediately. The intermediate preview card, preview state, replay buttons and preview styles were removed. The planet selector is always visible in the room; a second selector remains available within the modal case study.

Ambient animation now includes a hovering inspection drone with rotating hardware, a slowly passing satellite, planet rotation and a continuous navigation-pointer sweep. A single visibility-aware interval wakes the demand renderer at 30 Hz; pointer/camera interactions may render faster. Decorative motion pauses for still view, reduced motion/effects, hidden tabs and open information dialogs. Timing uses clamped frame deltas, and the interval and visibility listener are cleaned up on unmount.

Verified in the production preview: all three labels open their full case studies with heading focus and no preview card; clicking the actual NoClash 3D instrument also opens its case. Escape restores the room. The always-visible selector changes the destination. Motion timestamps advance in the room and stop while reading. Phone-sized and desktop layouts were inspected. Physical-device FPS remains unmeasured.

## Object click responses

Project selection now plays a distinct 480 ms mechanism response, then opens the case study automatically after 650 ms. NoClash makes one full eased planner sweep, Student Portal extends its cartridge, and NoTerm pulls its lever and lifts/tilts the chassis. There is no intermediary panel or second click. Still view and reduced motion/effects open the case immediately.

Pending openings are cancelled by another selection, regular section navigation, destination changes, browser history or Escape. The timer is cleared on unmount, and a screen-reader-only status announces the pending case study.
