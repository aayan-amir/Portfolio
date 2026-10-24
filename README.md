# Aayan Amir — Orbital Workshop

A room-based interactive portfolio built with Astro 7, React 19, TypeScript, and React Three Fiber / Three.js.

## Run locally

Use Node.js 22.23.4 or newer (developed on Node 24).

```sh
npm ci
npm run dev
```

Open the local address printed by Astro. Drag empty room space to look around. Select a project instrument or its nameplate to open its case study. The chart opens the star map; the radio toggles optional cabin sound. Navigation buttons reach the same destinations. Escape closes a panel; Reset view restores the camera.

## Checks

```sh
npm run check
npm test
npm run build
npm run preview
```

The `/read` route is a static text edition. Direct links such as `/?section=work&project=noclash` open the matching in-room story. Still view freezes decorative movement while preserving the 3D scene and ordinary information navigation. The text edition also works without JavaScript.

## Current milestone

The engineering cabin, planet arrivals, star map, optional audio, project workflows and contribution log are implemented. The supplied resume downloads directly as a PDF. Featured case studies are based on the project READMEs; screenshots and adoption metrics are not invented.

- [Staged build plan](docs/BUILD_STAGES.md)
- [Design brief](docs/DESIGN_BRIEF.md)
- [Prototype verification and limitations](docs/PROTOTYPE_REVIEW.md)
- [Asset credits](docs/ASSETS.md)

## Source structure

- `src/components/Workshop.tsx`: navigation, dialogs, fallback modes, and browser history.
- `src/scene/Room.tsx`: procedural room, materials, object animations, and anchored camera.
- `src/data/`: shared profile, project content, and typed URL mapping.
- `src/pages/`: workshop, text edition, and error page.
- `src/styles/global.css`: responsive interface and design tokens.

In development, `?wide=1` compares the wider camera composition and `?capture=room` hides interface chrome for scene-poster capture. These options are excluded from production behavior.

## Production preparation

The confirmed production origin is https://www.aayanamir.tech. Override it only deliberately with SITE_URL (see .env.example). Builds emit canonical/social metadata, robots.txt and sitemap.xml. The 404 page remains noindex. CNAME and .nojekyll support the existing custom-domain GitHub Pages hosting; deploy the contents of dist, not the source directory. This repository does not automatically publish these changes.

GitHub Pages controls cache/security response headers. public/_headers is a Netlify/Cloudflare equivalent template and is not applied by GitHub Pages. Inspect the actual host after deployment. Canonical URLs do not include scene query states.

- [README source record](docs/PROJECT_SOURCES.md)
- [Enhancement implementation review](docs/ENHANCEMENT_REVIEW.md)
- [Production and performance audit](ASTRO-AUDIT.md)

Local audit reports are generated under output/audit and are ignored by Git. Use the production preview for measurements, not astro dev.

The cabin uses one fixed working-light setup. Evening mode and its wall/native switches have been removed; destination lighting effects remain.

- [Cold-start optimization results and asset regeneration](docs/STARTUP_OPTIMIZATION.md)

The cabin loads baked reflection lighting and prepares shaders before its first visible render. Repeated parts share room-owned geometry/materials. Missing reflection data uses the original lighting fallback. The mobile startup budget remains unmet; see the measured results above.
