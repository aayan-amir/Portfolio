# Asset register

- Workshop geometry: original procedural geometry in `src/scene/Room.tsx`.
- Celestial bodies, corona, atmosphere, rings, stars, and exterior particles: original procedural geometry and GLSL in src/scene/Observatory.tsx. Stylized, not satellite imagery or geographically accurate maps.
- Monitor timetable: original illustrative canvas drawing; not an actual NoClash screenshot.
- Desk wood grain: original procedural canvas texture.
- Current loading/error fallback: CSS destination-colored illustration. Legacy WebP room captures remain in public but are not used by the new preview.
- Favicon: original SVG mark.
- Fonts: Manrope and DM Sans, distributed through their Fontsource packages; retain their upstream font licenses with any redistribution.
- No third-party model, commercial music, HDRI, or company screenshot is bundled in this milestone.

## Quiet spaceship revision

Hull and installation geometry in Room.tsx replace the previous office scene. Earth now uses public/earth-day.jpg: Solar System Scope (https://www.solarsystemscope.com/textures/), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), resized version from https://github.com/mrdoob/three.js/blob/dev/examples/textures/planets/earth_day_4096.jpg. No additional image modifications. Runtime and text-view credits are provided. Other planet materials remain procedural.

## Planet visibility revision

This supersedes earlier notes saying the non-Earth planets are procedural-only. All nine bodies now use local Solar System Scope maps (Earth's existing map plus eight original 2K files in public/planets/). Files are unmodified; runtime light/color treatment is artistic. CC BY 4.0 creator/source/license and mirror provenance are retained in public/planets/ATTRIBUTION.txt and linked from the readable portfolio. Surface, atmosphere and ring shaders are original code in src/scene/planetShaders.ts.
