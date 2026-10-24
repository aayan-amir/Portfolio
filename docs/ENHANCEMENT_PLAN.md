# Portfolio enhancement plan

Status: core stages 0-9 implemented and locally reviewed on 2026-10-24. See ENHANCEMENT_REVIEW.md for evidence and remaining release checks. This is the current plan for the next enhancement cycle; it supersedes older plans where they conflict. The existing engineering cabin remains the visual foundation.

## Goal and design boundaries

Make Aayan's spacecraft cabin rewarding to explore while giving recruiters quick access to evidence of his backend and full-stack work. The visual language remains ivory hull panels, petrol equipment housings, muted orange touch points and blue-green upholstery.

- Keep the anchored camera, correct drag direction and visible look controls. No walking or required game controls.
- Keep projects, About, Contact and the attached resume accessible through normal HTML controls.
- A project click retains its brief physical response followed by the full case study. Do not restore the rejected preview card or require a second click.
- Keep the planet selector visible in the main room even after adding a star map.
- Add interactions to existing equipment before adding new furniture. Keep the window and project instruments visually dominant.
- The room's resting motion stays gentle. Large motion is a short response to an explicit action.
- New features must respect still view, reduced motion, reduced effects, hidden tabs and reading dialogs.
- Primary discovery lenses: Hick's Law for a small number of initial choices, Fitts's Law for usable controls, Law of Common Region for grouping related equipment, and the Peak-End Rule for satisfying arrivals and interaction endings.

## Current foundation

Already implemented: enclosed cabin; three project instruments; continuous inspection drone, satellite and planet motion; project click responses; native case-study dialogs; visible planet dropdown; per-destination lighting/patterns; Sun window slats; Neptune window highlights; wall prints; a text portfolio; and the exact user-supplied resume PDF.

The scene currently uses a demand renderer, a visibility-aware 30 Hz ambient wake-up and separate finite mechanism animations. Shader, material and animation ownership must be made explicit before adding more effects. Current workload readings and previous build checks are observations, not proof of physical-phone FPS or accessibility conformance.

## Build order and dependencies

| Stage | Deliverable | Depends on | Completion evidence |
| --- | --- | --- | --- |
| 0 | Baseline and shared environment state | Existing cabin | Reproducible captures and measured baseline |
| 1 | Planet arrivals | Stage 0 | All nine destinations, interruption and reduced-motion checks |
| 2 | Optional soundscape | Stages 0–1 | Muted start, explicit enable, independent volume and pause behavior |
| 3 | Useful project demonstrations | Stage 0 | Real project facts, working examples and immediate case access |
| 4 | Physical star map | Stage 1 | Same destination state as the dropdown, keyboard equivalent |
| 5 | Responsive inspection drone | Stages 0–2 | Hover attention, docking and non-interference checks |
| 6 | Contribution work log | Stage 3 content pattern | Outcome-focused, user-approved evidence and readable fallback |
| 7 | Cabin light switch | Stages 0–1 | Working/evening modes composed with all destinations |
| 8 | Personal discoveries | Stages 2, 5 and 7 | Two optional, unobtrusive discoveries |
| 9 | Integration and release readiness | All stages | Visual, interaction, accessibility and performance review |

This ordering keeps the first visible improvements as arrivals, sound and richer case studies. Each stage must work and be reviewed in the browser before the next one expands it.

## Stage 0 — Establish the shared controls and baseline

Implementation:
- Capture desktop 1440 x 900 and phone-sized 390 x 844 views of the resting cabin, a case study and extreme permitted camera angles.
- Measure initial transferred assets, compressed JavaScript, renderer draw calls/triangles, frame-time distribution during ambient motion and planet switching, and geometry/texture counts after repeated destination cycles.
- Define shared environment inputs: selected destination, arrival phase, cabin lighting mode, motion policy, audio preference, document visibility and whether an information dialog is open.
- Use one owner for each animated transform/material property. Keep frame updates in refs and shader uniforms; avoid React state updates per frame.
- Keep destination selection and reading/navigation state independent. Use a clear arrival lifecycle: idle, preparing, travelling, arriving, settled.
- Decide which assets require initial loading and which can load on first use. Keep the current small texture cache and stale-load disposal behavior.

Acceptance:
- Existing camera behavior, project click responses, direct case links, resume downloads and native dialog focus still work.
- Proposed performance budgets are recorded against the measured baseline before expensive work begins. A useful initial ceiling is 320 draw calls and 160k triangles for the default desktop composition, subject to revision based on actual frame timings. This is a target, not a measured guarantee.
- Ambient updates target 30 Hz; control input can request additional frames. The renderer returns to demand-only behavior when decorative motion is disabled.

## Stage 1 — Make planet selection feel like an arrival

Experience:
1. Selecting a destination immediately updates the control and shows a short preparing state if its texture is not ready.
2. A roughly 1.0–1.5 second travel response dims the window surround and stretches a small set of stars beyond the glass.
3. The destination comes into view and its light treatment settles. Keep the camera anchored.
4. Leave the room ready for interaction; visitors can open a case study at any point.

Destination treatments:
- Mercury: cratered view, directional highlights and shutter-like light bands.
- Venus: gold cloud cover, soft haze outside the window and warm reflected light.
- Earth: blue reflected light and cloud/ocean detail.
- Mars: rust-coloured exterior and restrained dust-like exterior accents.
- Jupiter: prominent atmospheric bands and cream/copper reflected light.
- Saturn: rings enter the window composition; a restrained band motif reaches the floor.
- Uranus: pale cyan light and a tilted orbital motif.
- Neptune: cool blue highlights and frost confined to the window edge.
- Sun: visible surface activity, a controlled corona and protective slats engaging. No flames inside the occupied cabin.

Implementation:
- Reuse the existing planet maps and lighting treatment data. Add a small reusable transition effect rather than unique particle systems for every planet.
- Use elapsed-time interpolation and avoid scaling the planet through the hull. Ensure Saturn's rings remain readable in the constrained window.
- Keep the latest requested destination authoritative. Cancel stale transitions and texture completions.
- Handle Back/Forward, rapid changes, texture failure, hidden-tab resume and opening a dialog mid-arrival.
- In still/reduced-motion modes, switch to the settled view without star streaks, travel motion or camera movement. Failed textures retain the readable fallback and offer retry.

Acceptance:
- All eight planets and the Sun remain identifiable and adequately lit on desktop and portrait layouts.
- Rapidly choosing A then B always ends at B, with the URL, selector, map and exterior agreeing.
- Resume/contact/project access remains available throughout. Arrival effects never cover reading content.

## Stage 2 — Add an optional cabin soundscape

Experience:
- Sound starts muted. One labelled sound control and the radio operate the same setting.
- Use a soft cabin hum, quiet tactile clicks, cartridge motion, the maintenance response and a short arrival tone.
- Keep sound levels restrained, with a volume control and a visible mute state.

Implementation:
- Prefer a small Web Audio layer for hum and simple effects; use licensed or original audio only. Music is optional and not a dependency for this stage.
- Create/resume the audio context only after an explicit sound-enable gesture. Remember preference locally, but respect autoplay restrictions on subsequent visits.
- Load audio assets only when sound is enabled. Keep any first-use sound download under a provisional 500 KB budget.
- Pause/suspend audio when the document is hidden; lower or stop ambience while reading. Smooth gain changes to avoid clicks and overlapping arrival sounds.
- Keep audio and visual motion preferences independent: a user may want still visuals with sound, or movement without sound.

Acceptance:
- First visit produces no unexpected audio. Mute works immediately and persists appropriately.
- No feature communicates essential information through sound alone.
- Disabling sound and repeatedly opening/closing views does not create extra audio contexts or listeners.

## Stage 3 — Put project evidence inside the case studies

Do not add a preview panel. Keep the existing object response and automatically open the case study, where an optional demonstration becomes part of the explanation.

NoClash:
- A small, labelled example lets visitors choose sections, reveal a specific overlap and select an alternative.
- Show the boundary between AI extraction, human correction and deterministic conflict checking.
- Use a local sample timetable; do not require file uploads or paid AI calls just to understand the project.
- Link directly to the live product and source.

Student Portal:
- A local example demonstrates a sample resource moving from Pending to Approved or Rejected, then shows the difference in the student-facing view.
- Clearly label it as a workflow demonstration. It is not a live administrator interface or evidence of server authorization enforcement.
- Explain the contribution: shared classrooms, moderation, Cloudinary file handling and approved-file delivery.

NoTerm:
- An illustrative task selection reveals a predefined command preview, confirmation step and sample output.
- Run no shell commands or privileged operations from the portfolio. Label sample output as illustrative.

Content and implementation:
- Inspect source behavior before reproducing any project algorithm. Reuse a small pure function when appropriate; otherwise implement a bounded sample with documented limits.
- Replace schematic illustrations with real screenshots or short recordings where available. Keep company-sensitive material out of public assets.
- Structure each case around problem, contribution, important decision, evidence and result. Do not invent users, adoption or performance metrics.
- Lazy-load demo code when its case opens. Provide clear reset controls and keyboard operation; preserve the full text explanation when JavaScript or 3D is unavailable.

Acceptance:
- NoClash examples correctly handle overlaps, adjacent non-overlapping times and section changes.
- Student Portal examples accurately distinguish pending, approved and rejected states.
- NoTerm examples cannot execute or imply execution on the visitor's machine.
- Every demo can be skipped; project source/live links remain immediately available.
- NoClash and Student Portal remain the principal CV-aligned evidence; NoTerm stays an additional selected project.

## Stage 4 — Add an optional physical star map

Experience:
- A small navigation chart on an existing rear work surface opens an interactive system map.
- It is clearly labelled Destinations and visually distinct from the NoClash project planner.
- The visible native dropdown remains the fastest way to select a planet.
- Visited destinations get a quiet local marker after successful arrival. No score, required completion or locked content.

Implementation:
- Use a lightweight SVG/HTML map for readable planet targets and keyboard focus, visually attached to the cabin instrument.
- The map and dropdown call the same destination-selection action; neither creates a second state system.
- Persist only destination IDs locally, handle unavailable storage and provide a reset option.
- Any scientific captions must be sourced and dated; illustrative orbital spacing must not be presented as scale-accurate.

Acceptance:
- Map, dropdown, Back/Forward and copied destination URLs agree.
- Targets remain usable on touch and keyboard, with an accessible list equivalent.
- Opening/closing the map preserves camera orientation and returns focus.

## Stage 5 — Give the inspection drone simple responses

Experience:
- When a project is hovered or focused, the drone gently turns its lens toward it.
- Clicking the drone sends it to a small charging dock on existing shelving; clicking its labelled control brings it back.
- During arrivals it briefly acknowledges the change. During reading it moves aside or stays parked.

Implementation:
- Replace the current independent position/rotation writes with a small state machine: idle, attending, docking, docked, yielding.
- Set priority explicitly: reading/navigation safety, docking request, user attention, ambient idle.
- Use frame-independent damping and bounded paths inside the room. Never move the drone over project labels, the selector or text.
- Add a native keyboard-accessible control without introducing a permanent extra floating panel.
- Reduced-motion mode uses static poses; docking remains understandable without a flight animation.

Acceptance:
- No snapping between conflicting motion owners and no obstruction of primary actions.
- Hover/focus works equally; rapid project changes do not accumulate motion or audio.
- Docking never opens an unrelated case study or captures camera dragging.

## Stage 6 — Show contributions in a work log

Experience:
- The existing career clipboard becomes an entry point to a concise contribution log within About/experience.
- Show the original workflow, Aayan's specific change, the outcome and relevant implementation detail.
- Keep a short overview before any optional deeper explanation.

Approved evidence from the supplied CV and user confirmation:
- Outreach records in fragmented Excel sheets became a CRM for 500+ active leads, with pipeline states and follow-up reminders.
- Inventory tooling covered 100+ stock items across 15 categories.
- The expense system processed 200+ monthly claims with receipts, budget checks and staged approvals.
- Automated PDF reporting reduced monthly reconciliation processing time by approximately 30%.
- KOGO Metal contract dates: January–September 2026. Do not describe it as current.

Implementation:
- Keep facts in a shared typed content module and reuse them in the text portfolio.
- Do not imply the 30% result applies to every internal tool; retain its reconciliation scope and approximate qualifier.
- Use authorized screenshots only, with actual sensitive records removed or replaced by clearly labelled sample data.
- Describe AI-assisted work as reviewed and validated output, not autonomous delivery.

Acceptance:
- A recruiter can identify contribution and result without decoding spacecraft terminology.
- Each claim has an internal source note; the public copy remains concise and readable.
- The log is accessible from both the room and normal navigation and does not gate the resume download.

## Stage 7 — Add a working/evening cabin light switch

Experience:
- A physical switch and a matching labelled HTML control select Working or Evening.
- Working is brighter and neutral; Evening is warmer and lower-lit while keeping the project instruments legible.
- Destination light still influences the window and selected room details.

Implementation:
- Compose base cabin mode with destination treatment in one environment controller instead of letting two systems overwrite the same lights/materials.
- Interpolate only a bounded set of light intensities and colours. Avoid new shadow-casting lights and expensive dynamic environment captures.
- Keep HTML reading surfaces and controls at stable contrast. Save preference locally with a safe default.
- Reduced-motion mode applies the settled lighting state immediately.

Acceptance:
- Inspect both lighting modes across all nine destinations, particularly Sun brightness and Neptune darkness.
- Controls, posters, project silhouettes and window detail stay readable.
- No flashing, abrupt exposure jumps or duplicate animation loops.

## Stage 8 — Add two personal discoveries

Choose a small pair, not a room full of hidden interactions:
1. A poster responds with an in-room reveal about Aayan's interest in astronomy, using personal wording he supplies or confirms.
2. The radio offers a short original/licensed sound experiment or a quiet drone acknowledgement when sound is enabled.

Implementation:
- Make interactive decorations subtly distinguishable on hover/focus. Keep noninteractive art visually quiet.
- Use an in-room reveal or a concise inline caption; do not add another generic popup card.
- Keep all professional information available elsewhere. No achievements, treasure hunt or mandatory discovery route.
- Load optional assets on interaction and retain keyboard/reduced-motion equivalents.

Acceptance:
- Visitors can ignore both discoveries and still reach every professional action.
- No invented personal anecdotes, unlicensed music or unexpected sound.
- The resting scene remains calmer than its interaction moments.

## Stage 9 — Verify the whole experience

Functional:
- Destination selection, map, URL/history, project clicks, cancellation, resume download, contact, camera reset and text fallback.
- Rapid destination changes, opening a case during travel, changing sound/light preferences mid-arrival and hiding/resuming the tab.
- Repeated cycles do not grow timers, listeners, textures, geometries or audio contexts without a bounded explanation.

Accessibility and device review:
- Keyboard-only navigation, native dialog focus/return, focus visibility, readable labels, touch targets and text equivalents.
- Reduced motion, still view and muted audio each remain independently useful.
- Desktop, narrow phone viewport and landscape; a physical phone when available. Automated checks do not establish full screen-reader or WCAG conformance.

Performance:
- Compare frame times and asset transfer against Stage 0 on the same device/settings; report GPU/browser/viewport and what was actually measured.
- Lazy-load case demos, map assets and optional audio. Prefer shader uniforms and instancing to more objects/lights.
- If a feature exceeds its budget, simplify it before proceeding. Do not use low triangle counts alone as proof of good performance.
- Keep the text portfolio and resume usable when WebGL fails.

Release evidence:
- Run type checks, the relevant meaningful tests and the production build after code changes.
- Save representative screenshots and a short capture of arrivals and click responses for visual review.
- Document remaining limitations and asset/audio credits. Resolve the existing bundle-size warning if profiling shows it materially harms loading.
- This plan does not itself publish, push or deploy anything. Release actions follow the user's requested workflow.

## Files and ownership

Likely existing touch points:
- `src/components/Workshop.tsx`: navigation, preferences, case content and native controls.
- `src/scene/Room.tsx`: scene composition and interaction wiring.
- `src/scene/CabinLife.tsx`: ambient scheduling and drone behavior, split as responsibility grows.
- `src/scene/Observatory.tsx`, `PlanetTreatment.tsx`, `CabinShell.tsx`: exterior and composed room treatment.
- `src/scene/ProjectObjects.tsx`: physical responses, separate from the case demonstrations.
- `src/data/celestial.ts`, `content.ts`, `resume.ts`: shared content and destination/download information.
- `src/pages/read.astro`: equivalent readable content and direct resume access.

Create focused modules only where needed: an arrival controller, sound controller, environment settings, star-map view and per-project demonstration components. Avoid adding another global state library before there is evidence it is necessary.

## Source references for the ideas

- Bruno Simon: https://bruno-simon.com/ — optional audio, discovery and interactive world controls.
- My Room Portfolio: https://github.com/AT010303/Room_Portfolio — creator-described lighting/theme/music/object interactions.
- Henry Heffernan: https://github.com/henryjeff/portfolio-website — spatial portfolio with a separately implemented 2D OS experience.
- Kamaboko's room: https://room.bokoko33.me/ — a personal room framing work and background.
- NASA interactives: https://www.nasa.gov/interactives/ — reference for optional destination exploration. Our map is an illustration, not a scientific simulator.
