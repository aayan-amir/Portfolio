# Colorful inhabited workshop review

24 October 2026. This implements the inhabited-room plan with the user's additional direction to replace all three project models and make the room colorful.

## Current composition

All three projects, career notebook, resume folio and contact radio remain mounted in one scene. A connected crescent workbench replaces the single exhibit podium and project tabs. The camera remains anchored and the visitor can look toward either side. The planet is much closer and occupies a substantial part of the exterior glazing.

After visual feedback, the sterile palette and abstract project sculptures were replaced:

- NoClash is an original painted timetable loom, with wooden rollers, teal supports, threads, and colorful schedule strips.
- Student Portal is an original small lending library with coral framing, colored books, a stamp, and an open resource.
- NoTerm is an original teal command press with a paper output, cream/ochre/coral keys, and a side crank.

The room now uses warm timber-colored floor/work surfaces, terracotta storage, teal painted joinery, mustard seating, a woven mat, paper, a warm task lamp, mug and plant. Labels use warm cream and dark green text. No continuous decorative project animation or glowing sculpture outlines.

## Interaction

Six ordinary HTML buttons are projected to the corresponding physical objects. They remain one semantic control registry, not separate per-object React roots. Labels outside the viewport are hidden and removed from the tab sequence. Objects also have generous 3D hit targets; a canvas drag does not activate them.

Header shortcuts provide Work, About, Request resume, and Contact. A real current PDF is still unavailable, so resume access is explicitly a request rather than a fabricated or broken download. The career notebook opens factual experience/approach content. Existing source/demo links, native dialog focus management, URL state and history remain.

Look left/right buttons supplement drag and canvas arrow keys on phones. They steer the same room; no project is replaced or unloaded.

## Destination treatments

Every destination has a defined room response in PlanetTreatment.tsx, including a subtle accent light and an inexpensive localized floor/window treatment:
Earth cloud-like blue patches; Mercury sharp warm slats; Venus soft gold haze; Mars rust dust pattern; Jupiter cloud bands; Saturn ring light; Uranus tilted cyan bands; Neptune edge frost/cool floor response; Sun warm amber reflections.

These are a restrained static baseline in this room-first pass. Richer moving clouds, mist, heat distortion, arrival transitions and particle motion remain later art/effects work. Reduced effects retains the destination accent light and removes patterned overlays. Room readability is prioritized for Sun exposure.

## Verification

- Type check passes with zero errors/warnings/hints.
- Eleven existing camera/navigation tests pass. The camera tests use actual Three.js projected landmarks to verify look direction.
- Production build passes, with the existing large Three.js chunk advisory.
- All six native object actions opened the expected project/career/contact panels in the real browser.
- A direct click on the new NoClash loom opened its case study.
- Every destination selected successfully while retaining all six room controls. Sun room view and contrast inspected.
- Actual desktop 1440x900 and phone-sized 390x844 browser views inspected; phone look controls revealed neighboring projects. This is viewport emulation, not a physical phone GPU test.
- No error-level browser logs were observed during these checks.

## Rendering limits

All-object scene cost is higher than the earlier one-exhibit build; those figures are not comparable evidence of an optimization. Diagnostics now reset counters before a frame and record them after rendering, including relevant shadow work. Renderer counters and idle frame counts are partial evidence, not isolated GPU timing or exact memory measurements. Small decorative details do not cast shadows, and the renderer returns to demand/idle rendering after input settles.

Physical-phone performance, long-run memory profiling, approved project screenshots, current resume PDF and production hosting remain unverified release work.

UX choices: proximity groups the real projects along one work surface; consistent label styling makes selection recognizable; generous hit targets support Fitts's Law; the Work shortcut gives a quick recruiter route. Visual quality is checked in browser independently of the passing build.

## Final render note

The final camera controller updates its world matrix before the native labels project their anchors. This fixes label drift/overlap after viewport changes. Final portrait inspection places the Student Portal label below the books rather than across them. Settled 390x844 browser sample: 246 draw calls, 113,990 triangles, 197 geometries, 7 textures and no idle frame advance after settling. These are complete-frame renderer counters from the browser, not a physical-phone timing result.
