# Portfolio implementation stages

Status: foundation, initial composition, and interaction proof implemented. Stage 3 visual/performance refinement in progress.
Updated: 24 October 2026.
Design authority: docs/DESIGN_BRIEF.md, plus subsequent direct user instructions.

## Working contract

Build in C:/Users/AAYAN/Desktop/Portfolio. Preserve the personal repo. The entire primary experience happens inside one warm orbital workshop. The viewer looks around from a fixed position. Objects animate to reveal information in readable HTML panels. Persistent navigation provides direct access to those same destinations.

Audience: backend/full-stack internship and junior-role recruiters first; freelance clients second. Prominent name, practical problem solving, and demonstrable work. No invented employment, project functionality, testimonials, or measured outcomes.

## Stage 0 — Foundation and execution setup

- [x] Recheck local instructions, Git status, and destination before editing.
- [x] Inspect Node/package-manager availability and compatible Astro/React/Fiber/Drei/Three versions.
- [x] Scaffold a minimal Astro static application with strict TypeScript and one interactive React island; preserve README and docs.
- [x] Add .gitignore, a dependency lockfile, setup commands, and focused verification scripts.
- [x] Set up profile/project schemas and a typed object-to-content registry.
- [x] Provide an initial static identity/navigation/content shell and fallback route structure.

Done when: dependency installation, type checking, and production build succeed; initial page serves locally. Record exact versions and any environmental limitations. Do not install a CMS, backend, or unrelated template features.

## Stage 1 — Visual direction and room blockout

- [x] Define 4–6 named palette tokens, font roles, text scale, spacing, and panel surfaces.
- [x] Compare room-focused and workbench-focused camera compositions using simple scene geometry.
- [x] Establish anchored camera position, bounded look range, window, desk, lamp, and clear rocket/monitor silhouettes.
- [x] Place Aayan's name and role in readable HTML within the composition.
- [x] Test desktop and portrait framing with space reserved for information panels.
- [x] Capture comparison images and document the chosen composition and why.

Done when: the room reads as a comfortable personal workshop; name and navigation remain clear; it is visually coherent at desktop and phone widths. Review against the brief before detailed modeling. Familiarity of colors alone is not sufficient visual identity.

## Stage 2 — Interaction proof

- [x] Build one controller for active destination/project, animation phase, camera orientation, and preferences.
- [x] Add bounded drag-to-look controls and Reset view; keep camera position fixed.
- [x] Distinguish dragging from clicking with pointer thresholds and cancellation handling.
- [x] Implement rocket selection and a short, interruptible lift/flight/hover sequence introducing About.
- [x] Implement monitor selection and one complete NoClash reading panel.
- [x] Connect About/Work controls to the exact same actions as object selection.
- [x] Implement close/Escape, focus handling, panel scrolling, and previous-view restoration.
- [x] Handle repeated clicks, selection changes mid-animation, and reset deterministically.
- [x] Establish direct-link and Back/Forward behavior with one canonical content source.

Done when: rocket -> About -> close -> monitor -> NoClash -> Back/Reset works with pointer, keyboard, and touch. Content appears promptly even if motion is unfinished. Test state transitions meaningfully; a renderer mock cannot verify appearance.

## Stage 3 — First polished prototype

- [ ] Refine selected composition, object shapes, materials, lamp/window lighting, shadows, and rocket timing.
- [ ] Create a matching still-image fallback and defer interactive loading until critical content is available.
- [ ] Swap to the scene only after a complete frame; handle load failure without losing content.
- [ ] Add reduced-motion and static-view behavior; settle rendering when idle and pause hidden tabs.
- [ ] Measure initial transferred bytes, scene payload, interaction frame time, and first-interaction delays.
- [ ] Show a locally viewable desktop/phone prototype for visual feedback.

Done when: the actual room feels inviting and distinctive, one interaction feels finished, and the prototype has a usable fallback. This is the main visual review checkpoint. If the art feels generic, revise composition/materials/lighting before adding props. If rendering is too expensive, simplify before expanding.

## Stage 4 — Content and complete reading system

- [ ] Verify NoClash live/source claims and clarify Aayan's individual contribution.
- [ ] Draft inventory and outreach stories using confirmed facts; track open questions separately.
- [ ] Implement Work index and complete project-detail panels, screenshot layouts, and live/source links.
- [ ] Implement About, Experience/Approach, and Contact panels using shared layouts.
- [ ] Explain AI assistance through review/testing/ownership examples where supported.
- [ ] Support accessible text presentation and direct entry without 3D readiness.
- [ ] Track every image as authentic, approved anonymized, or explicitly labeled recreation.

Done when: each published story explains problem, ownership, solution, technical judgment, checking, and outcome. Missing screenshots can use clearly marked development placeholders, but unfinished or unconfirmed stories stay out of the release.

## Stage 5 — Expand the workshop

- [ ] Add scanner/tray, records terminal, notebook, and communication console with distinct silhouettes.
- [ ] Wire every object to existing content rather than duplicating descriptions.
- [ ] Add a small number of personal details referencing music, aviation, games, and astronomy.
- [ ] Finish shared hover/focus labels, pointer propagation, selection feedback, and dismissal behavior.
- [ ] Adapt room framing and panel composition for phones, landscape, safe areas, and changing viewport height.
- [ ] Add quality scaling, resource ownership/cleanup, and context-loss recovery.

Done when: every essential destination is reachable through both navigation and the room; decorative props are distinguishable; additional objects do not make the room feel crowded.

## Stage 6 — Release quality

- [ ] Run production build/type checks and focused navigation/state/history tests.
- [ ] Capture deterministic visual checkpoints with known camera, viewport, and animation state.
- [ ] Check keyboard access, focus restoration, modal semantics, contrast, reduced motion, 200% zoom, and narrow-screen reflow.
- [ ] Exercise long-panel scrolling without camera movement, rapid section switching, resize while reading, failed models, unavailable WebGL, disabled JavaScript, and slow loads.
- [ ] Inspect browser console/network failures and production asset paths.
- [ ] Evaluate performance on available real hardware; report untested devices honestly.
- [ ] Add title/description, canonical URLs, social preview, favicon, sitemap, and meaningful error/fallback pages.
- [ ] Confirm resume, contacts, career facts, image permissions, and asset credits.
- [ ] Review whether a fresh visitor can identify role, strongest work, personal contribution, and contact route.

Done when: there are no known core-journey blockers; checks are recorded as passed/failed/not run; outstanding limits are explicit. Performance budgets are targets, not claims established by compilation or a single score.

## Stage 7 — Release preparation and deployment

- [ ] Confirm actual hosting and domain destination; preserve the existing portfolio until replacement is intended.
- [ ] Prepare deployment config for the chosen static host, asset caching, and direct-entry routes.
- [ ] Verify a preview build and resume/project links.
- [ ] Publish only within the user's authorized release scope and retain a rollback reference.
- [ ] Verify the returned deployment and document update instructions.

Done when: a verified deployment URL and tested source correspond to the same release. Installing deployment skills or publishing the GitHub repository does not itself select hosting or authorize changing DNS.

## Execution and review discipline

Run stages in order. Content clarification/screenshots may proceed alongside scene work, but missing company assets must not stop the rocket/NoClash prototype. Read only the specialist skills needed for the active stage, and resolve conflicts in favor of the user's brief and actual installed APIs. Use current official docs or installed types for version-sensitive details.

Maintain a short stage log below with decisions, changed files, checks/results, limitations, and the next concrete step. Make small reviewable changes and preserve a known working checkpoint. Do not silently expand scope into driving, physics, multiple rooms, autoplay audio, authentication, or backend services.

Provisional performance budgets: about 500 KB critical transfer, 3 MB first deferred scene payload, roughly 100 draw calls/100k visible triangles, and responsive interaction on available hardware. Verify and revise from measured evidence. Core content must remain usable when these targets are missed or rendering fails.

Psychology lenses: Jakob's Law for familiar navigation; Hick's Law for a small destination set; Fitts's Law for stable controls; cognitive load for restrained labels/motion; Jobs to Be Done for concrete project stories. Validate clarity rather than claiming these guarantee hiring or longer visits.

## Current next action

Continue Stage 3. A working room prototype is available; further art and performance refinement is needed before calling the polished prototype milestone complete. See PROTOTYPE_REVIEW.md for performed checks and limits.

## Stage log

- 24 October 2026: saved staged build plan and current design brief. App code not started; no deployment performed.

- 24 October 2026: implemented foundation, room composition, object/panel interactions, history, portrait framing, and fallback modes. Type check, 5 tests, and production build pass. Stage 3 performance/art refinement remains active; content/release confirmation remains pending.
