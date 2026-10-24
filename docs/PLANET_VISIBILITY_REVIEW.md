# Planet visibility correction

24 October 2026.

## Corrected

The old custom material lit object-space normals even though the globe was rotated. This could leave the visible hemisphere at the minimum brightness, producing the nearly black Saturn and other dark planets. The new material transforms normals through normalMatrix and uses a controlled view-space key/fill. Surface texture orientation and lighting are now independent.

All eight planets and the Sun use locally hosted planetary maps. Earth retains its existing day map. Mercury, Venus atmosphere, Mars, Jupiter, Saturn, Uranus, Neptune and Sun use unmodified 2K Solar System Scope maps under CC BY 4.0, retrieved from a provenance-documented mirror. Mercury's SHA256 matches the published source hash. Runtime lighting is artist-directed for clear visibility; this is not an astronomical illumination simulation.

Custom shaders now apply tone mapping and output color conversion consistently. Mercury has real crater detail, Mars has recognizable landforms, and Jupiter has natural cloud bands. Earth's patchy procedural white clouds were removed. Atmosphere uses the view direction for a restrained rim; Mercury has no atmosphere shell. The Sun retains a warm surface/corona without turning the room white.

Saturn now has one continuous graded ring plane, a narrow division and correct depth occlusion in front of/behind the sphere. Its size and tilt are framed separately so the rings remain legible. Uranus has a restrained, steeper ring treatment.

Maps load only when selected, with a three-entry LRU cache. Stale or unmounted load completions dispose their textures. Errors retain a readable procedural fallback. Failure handling was inspected in code, not fault-injected in this pass.

## Verified

- Inspected all nine destinations individually in the real desktop browser after texture loading completed.
- Inspected Saturn and Neptune at 390x844; this is viewport emulation, not a physical phone GPU test.
- Cycled through all nine destinations twice. Renderer texture count plateaued at 9 after warmup; destination-specific geometry counts repeated without upward growth. These partial counters are not exact GPU memory measurements.
- No error-level browser logs observed during the review.
- Type checking: zero errors/warnings/hints. Eleven camera/navigation tests and production build pass. The existing large Three.js bundle advisory remains.

Planet appearance screenshot review is the evidence for the visual correction; the camera/navigation unit tests alone do not validate shaders. Existing room geometry, project actions and per-destination room treatments are retained.

Credits: public/planets/ATTRIBUTION.txt and the text portfolio Scene credits section.
