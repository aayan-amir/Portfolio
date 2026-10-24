# Prototype review — 24 October 2026

## Implemented

- Minimal official Astro starter, strict TypeScript, compatible locked React/Fiber/Three stack.
- A full-viewport orbital workshop, anchored drag-to-look camera, reset, original procedural objects, and warm/cool lighting.
- Rocket lift/hover, monitor project access, notebook/approach, radio/contact, scanner/inventory, and records/outreach selection.
- One semantic HTML dialog system, immediate information access, focus restoration, Escape dismissal, internal scrolling, direct project links, and browser history.
- Distinct phone framing, rendered loading posters, static-view toggle, and a static text edition.
- Reduced-motion preference handling, scene error boundary, context-loss fallback, idle demand rendering, and hidden-tab suspension.

## Verification performed

- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm test`: 5 navigation/URL tests pass (valid links, invalid input, cross-section state isolation, clearing, round trips).
- `npm run build`: static homepage, `/read`, and 404 generated successfully. Build reports a >500 KB minified 3D chunk; it is dynamically loaded separately from the interface.
- Browser: actual WebGL room rendered in the in-app browser. Desktop framing at 1440x900 and phone layout at 390x844 inspected. These are desktop-browser viewport checks, not physical phone tests.
- Selected the model rocket directly and verified About opens.
- Verified Work -> NoClash, in-panel section navigation, Escape dismissal, return of focus to the triggering About button, and heading focus when panel content changes.
- Verified browser Back/Forward and refresh on a direct NoClash link.
- Drag/reset exercised without opening an unintended panel.
- Compared 48-degree desk-focused and 56-degree room-focused desktop framing. Kept 48 degrees: objects are more legible and the room feels less like a distant cutaway. Portrait uses a wider field of view and an upward-biased orientation to separate text and objects.

## Observations and remaining work

- Initial renderer diagnostics were 250 calls / 198,236 triangles. Instanced floor/key geometry and lower rounded-box subdivision reduced the later startup sample to 218 calls / 123,612 triangles. These are renderer counters from the tested frame, including renderer/shadow work, not a frame-rate benchmark. Both remain above the initial approximate budgets; profiling and further batching/shadow optimization remain Stage 3 work.
- Build success and viewport checks do not establish Core Web Vitals, mobile GPU performance, screen-reader compatibility, or complete accessibility conformance.
- A Three.js Clock deprecation warning originates in the current rendering-library integration. An initial removed-shadow-mode warning was addressed by explicitly choosing PCFShadowMap. Recheck dependency compatibility as versions evolve.
- Astro scanner finds missing production site/canonical/sitemap/robots configuration. Those belong to release preparation after hosting/domain choice. The above-the-fold React island intentionally uses `client:load`; the larger 3D module is lazy-loaded.
- No production domain, hosting deployment, DNS change, or analytics was configured.
- NoClash copy is based on its README, not a completed live/source feature audit. Schedule graphics are explicitly labeled illustrations.
- Current public email/location derive from the supplied older portfolio and need release confirmation. Company details, current resume, measured results, and approved screenshots remain pending. No new employer, performance metric, or testimonial was invented.
- Unsupported WebGL, forced context loss, JavaScript-disabled browsing, reduced-motion execution, repeated remount/resource-leak checks, a physical touch device, other browser engines, and screen readers have not yet been exercised. Their handling is implemented but not claimed verified.

## Next build pass

Continue Stage 3: profile frame time, reduce rendering overhead, refine the physical materials and prop details, then review the actual room with the user before deeper content production. Split model components into focused modules as the asset set stabilizes.

## Build-size sample

The measured 3D JavaScript chunk is 948,667 bytes minified / 251,531 bytes gzip. React client is 182,191 bytes / 56,632 bytes gzip. Posters are 34,314 bytes desktop and 11,348 bytes portrait. These are local build/compression sizes, not measured network timings or a Core Web Vitals result.
