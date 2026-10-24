# Aayan Amir — Orbital Workshop

A room-based interactive portfolio built with Astro 7, React 19, TypeScript, and React Three Fiber / Three.js.

## Run locally

Use Node.js 22.23.4 or newer (developed on Node 24).

```sh
npm ci
npm run dev
```

Open the local address printed by Astro. Drag empty room space to look around. Select the rocket, monitor, notebook, radio, scanner, or records terminal to open their stories. Navigation buttons reach the same destinations. Escape closes a panel; Reset view restores the camera.

## Checks

```sh
npm run check
npm test
npm run build
npm run preview
```

The `/read` route is a static text edition. Direct links such as `/?section=work&project=noclash` open the matching in-room story. Still view replaces the WebGL scene with a rendered image while preserving navigation.

## Current milestone

Foundation and first interactive room prototype implemented. The art and performance are still being refined. Company case studies are initial factual drafts pending approved screenshots and additional detail. Resume access currently requests an updated resume by email.

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
