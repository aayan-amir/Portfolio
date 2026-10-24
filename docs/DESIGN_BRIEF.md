# Aayan Amir — Orbital Workshop, revised implementation plan

24 October 2026. Current plan. Supersedes `portfolio-build-plan.md`.

## Experience contract

The entire primary portfolio takes place in one comfortable 3D workshop inside a small orbital station. Visitors look around from a fixed position, select physical objects, and see those objects animate to introduce information. About, projects, experience, approach, and contact appear as readable panels within the room composition. No scrolling homepage follows the scene and no separate page is required to finish a project story.

The room is the portfolio interface. Information is semantic HTML layered over the room, rather than tiny text drawn onto a texture. A compact navigation strip offers direct access to the same interactions. The scene cannot be the only way to obtain hiring information.

Primary audience: recruiters and leads hiring backend/full-stack interns or junior developers. Secondary audience: freelance clients. Positioning: Aayan builds practical software that reduces repetitive work; language/framework names support the evidence. AI-assisted work is described through responsibility, review, and testing, with examples when verified.

## 1. Art direction and layout

Warm cream interior panels, a tactile workbench, softly rounded industrial objects, a desk lamp, and a curved window with a restrained Earth view. Charcoal text, muted sage/clay, and small amber accents. Contrast remains sufficient for reading. Avoid a cockpit full of tiny technical labels or flashing indicators.

The view should feel inhabited and at rest. Headphones, a controller, a model aircraft, and a star chart reference the user's interests. Decorative objects are not all navigation targets. Give interactive objects consistent labels and subtle focus treatments so people can tell the difference.

The workshop fills the viewport. Aayan's name and role remain legible in an HTML identity area during the overview; a nameplate integrated into the room can echo it decoratively. Initial copy is a draft: “Aayan Amir — Software developer. Building practical tools that make everyday work easier.” Availability copy names backend and full-stack internships and junior roles.

Persistent interface: About, Work, Experience, Contact, Resume; compact controls for Reset view and motion/static view. Use ordinary labels, not space jargon. The interface should not look like a dashboard laid over an unrelated background.

Produce two room compositions before detailed modeling. Both must show the rocket and main monitor clearly, leave space for readable panels, and adapt to portrait screens. Choose the stronger arrangement before expanding the asset set.

## 2. Object-to-story mapping

| Object                     | Animation                                                                              | Content                                                             |
| -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Model rocket               | Rises from its stand, traces a short bounded arc, then hovers beside its original area | About: identity, interests, ambitions, target roles                 |
| Main monitor               | Screen wakes and gently turns toward the viewer                                        | Work: project selection and complete case studies                   |
| Inventory scanner and tray | Scanner tilts; a brief light sweep crosses a sample item                               | Direct shortcut to inventory case study                             |
| Records terminal           | A small screen or organized drawer opens                                               | Direct shortcut to outreach records case study                      |
| Notebook                   | Opens to a marked spread                                                               | Experience and approach, including reviewed AI-assisted development |
| Communications console     | Receiver/display lights up                                                             | Contact, GitHub, resume, freelance inquiries                        |

Work opens a readable project index, initially NoClash plus verified professional work. The scanner/records objects are alternate direct links to the same project data, not duplicated stories. Limit the first release to this small set of meaningful interactions; reduce the number if composition becomes crowded.

Animations are stylized, deterministic sequences rather than physics simulations. The rocket never collides with UI, leaves the readable view, or flies into the camera. Labels remain attached to stable targets rather than chasing a moving object.

## 3. Camera design

The camera stays at an anchored position inside the workshop. Visitors rotate their view within bounded yaw and pitch; they do not walk, drive, orbit around the room, or zoom through geometry.

Starting limits to test: roughly 20–25 degrees left/right and 10–15 degrees up/down from the overview. Exact limits follow room composition and usability checks, not a fixed requirement. Keep all essential objects reachable and prevent views behind walls or below the desk.

Desktop: click-and-drag on empty room space to look around. Phone: a short drag within the room does the equivalent. Do not add automatic device-orientation control. Track pointer distance so a drag ending over an object is not treated as a click. Provide optional keyboard look controls only when the scene control is explicitly focused; do not capture arrow keys globally.

Selecting a story may smoothly turn the view toward an authored target from the same anchor. It does not teleport the visitor around the room. When a panel is open, camera input pauses. Closing restores the visitor's previous orientation. Reset view always returns to a known overview. Reduced-motion mode changes orientations immediately.

## 4. Reading inside the room

Information opens as a calm, high-contrast HTML panel composed into the room view. Keep enough of the workshop visible to preserve place. Background detail can dim subtly; avoid heavy blur effects and transparent body text.

Panel states:

- About: short introduction first, with optional personal details.
- Work index: project titles, purpose, status, and available live/source links.
- Project detail: problem, contribution, resulting workflow, screenshots, technical decision, verification, outcome, and lesson.
- Experience: confirmed professional history and working approach.
- Contact: email, copy-email control, GitHub, resume, and concise availability.

Project details expand within the same panel. Longer content scrolls inside the panel; the room does not scroll. One panel is active at a time, keeping nesting and dismissal predictable. A clear Back to projects action replaces stacked modal windows.

On phones, a panel can occupy most of the screen for comfortable reading while retaining a room header/visual cue. Handle dynamic viewport height, safe areas, browser chrome, large fonts, and the on-screen keyboard. Scrolling a panel must not rotate the room. Use contained panel scrolling and keep dismissal reachable.

If a panel behaves modally, implement its dialog semantics, focus containment, Escape dismissal, focus restoration, and background inertness. Keep equivalent direct navigation available within the active panel. Never let an invisible dialog or canvas capture focus.

## 5. Navigation, state, and interruptions

One controller owns active section, active project, orientation, animation phase, and accessibility preferences. Use a typed project/object registry instead of scattered IDs and hardcoded duplicate text.

Transitions: overview → activating object → reading → closing → overview. Switching directly to another section is supported. The content becomes available promptly; users do not have to wait for a rocket or notebook animation to finish.

If visitors choose another item during an animation, cancel or blend the previous sequence and honor the newest selection. Repeated clicks must not launch overlapping animations. Every close, reset, and URL navigation must settle objects into a known state. A load failure must not strand the controller in an activating state.

Use meaningful shareable URLs such as `?section=work&project=noclash`. Browser Back/Forward restores the correct section without replaying a long animation. A direct link opens readable content before the room is ready. Update history for deliberate navigation, not hover, drag, or animation frames.

The identity, resume, and navigation are immediately available. A recruiter selecting Work is taken straight to the project index; selecting Contact opens it directly. The navigation dispatches the same scene action as object selection and acts as an HTML fallback when the scene is unavailable.

## 6. Progressive loading and alternate presentation

First response: scene poster, identity, navigation, and semantic content. The poster matches the final camera composition, preserving a finished appearance during loading. No full-screen loading gate and no “enter experience” requirement for reading.

Load the room after critical content. Swap the poster only after a complete frame is rendered. Animate the selected object once ready only if that remains relevant; a slow scene load must not interrupt someone already reading.

Provide an accessible text view containing the same verified content and normal links, selectable at any time. It is an alternate presentation, not an extra section beneath the primary room. Direct case-study paths may serve readable static versions for sharing/search and progressively open the matching in-room panel when enhancement runs; decide exact routing during the prototype. Whichever route is chosen, maintain one content source and stable canonical URLs.

No WebGL, failed assets, disabled JavaScript, or context loss: retain the poster and readable HTML. Reduced motion disables flight paths and camera easing. A static-view control stops ambient movement. Data-saving preferences can defer scene activation. Measure performance after activation rather than assuming a small screen means weak hardware.

## 7. Content and evidence

NoClash's README describes timetable extraction, reviewable structured data, deterministic scheduling checks, and a client-side architecture. Verify actual live/source behavior before publishing detailed feature claims. Show what Aayan personally contributed. Do not characterize a client-side app as a backend project just to match the job target.

Confirmed themes from the user: inventory record keeping and records of outreach to clients. Features, company attribution, dates, architecture, and outcomes need confirmation. Draft descriptions can clarify these workflows; additional fictional projects, testimonials, metrics, or client results do not belong in the published portfolio.

Approved screenshots are preferred. Clearly labeled recreations use fictional data and depict only confirmed behavior. Missing company screenshots do not block development of the rocket, room, navigation, or content layouts. Reconfirm old employment/education facts and current resume/contact details before release.

## 8. Architecture and asset production

Keep Astro for static content generation and readable route/fallback output, TypeScript for shared models, and one React island owning room interactions and panels. Use React Three Fiber/Three.js, selected Drei helpers, CSS tokens, and a small animation utility if necessary. The richer state remains inside one island instead of coordinating many disconnected widgets.

Modules: room geometry/materials; camera controller; object animations; interaction state machine; panel renderer; content registry; routing/history; loading/fallback; quality preferences.

First build uses deliberate procedural geometry. Add custom glTF/Blender assets where they improve silhouettes or material quality, after checking tool availability. Prefer baked lighting contributions and restrained real-time shadows. Keep an asset/license register, source files or generation scripts, optimized runtime outputs, and a matching poster. Any image generation supports concept/poster work, never fabricated project evidence.

Destination: `C:\Users\AAYAN\Desktop\Portfolio`. Recheck existing files and local instructions before writes. Keep `personal` intact. Folder access must be handled through the available filesystem authorization mechanism when implementation starts. No publication or domain change is part of the planning phase.

## 9. Performance and accessibility requirements

Provisional budgets: approximately 500 KB transferred for critical page/style/fonts/poster; 3 MB for the first deferred interactive scene including JavaScript and assets; around 100 draw calls and 100,000 visible triangles. These are starting budgets to validate, not quality guarantees.

Aim for smooth laptop interaction; cap pixel ratio, reduce effects/shadows as needed, and retain static view for poor performance. Animate only while necessary, render on demand after settling, and pause while the tab is hidden. Avoid perpetual Earth rotation or floating particles that keep the GPU busy just to look alive.

Target good Core Web Vitals thresholds (LCP ≤2.5 seconds, INP ≤200 milliseconds, CLS ≤0.1). Lab checks do not establish real-user percentiles. Also measure first selection, animation frame-time spikes, and panel scrolling while the scene is present.

All meaningful actions have labeled HTML controls. Include visible focus, semantic landmarks/headings, contrast checks, generous touch targets, keyboard support, reduced motion, zoom/reflow, and selectable text. Object labels appear on focus as well as hover. No audio, color, motion, or mesh position is the sole carrier of information.

## 10. Psychology applied to this version

- Jakob's Law: normal navigation labels, browser history, familiar reading panels, and resume access within an unfamiliar visual setting.
- Hick's Law: a small set of destinations and one active story at a time.
- Fitts's Law: stable, generous targets and direct menu equivalents for small moving props.
- Cognitive Load: clear difference between decorative and interactive objects, restrained motion, and no need to remember where content lives.
- Aesthetic-Usability Effect: invest in finish but separately test whether visitors can obtain hiring information.
- Jobs to Be Done and before/after framing: explain the real task a project improved and Aayan's contribution.

These are design hypotheses. Success is whether people understand the candidate and can act comfortably, not simply dwell time or number of props clicked.

## 11. Implementation sequence and review gates

1. **Room blockout:** two compositions, name placement, light/material direction, camera anchor and limits, desktop/portrait layouts. Exit when the space feels inviting and destinations can be composed clearly.
2. **Vertical prototype:** rocket introduction, one NoClash interaction, bounded look controls, persistent navigation, one complete reading panel, history and fallback. Exit when selection, interruption, close, reset, and keyboard/touch work together.
3. **Art-quality pass:** refine surfaces, silhouettes, light, shadows, and rocket motion; produce matching poster. Evaluate the actual prototype with the user before making more props. If it lacks character, fix composition and materials first.
4. **Content system:** verify NoClash; draft confirmed company stories; create reusable project/index/experience/contact panels; confirm ownership and evidence. Keep incomplete content explicitly draft.
5. **Complete room:** scanner, records terminal, notebook, contact console, personal details, portrait layout, adaptive quality. Check that adding props does not reduce clarity.
6. **Hardening:** production build/type checks; focused tests of navigation/state cancellation/history and fallback; browser testing; accessibility and performance review; confirm resume and links; metadata, social preview, favicon, error handling, and asset attribution.
7. **Release preparation:** document setup and deployment, verify static routes, choose hosting/domain destination, preserve rollback, then publish only within the user's authorized release scope.

The first reviewable deliverable is a complete small experience: room, rocket, NoClash panel, and fixed-position camera. It must prove the concept beyond a static mockup, while staying small enough to change direction cheaply.

## 12. Test scenarios

- Recruiter reaches Work, identifies contribution, finds resume/contact without learning scene controls.
- Explorer selects rocket and project props, rotates view, closes a story, and returns to their prior view.
- Rapidly select two sections, close mid-animation, reset during movement, and use Back/Forward repeatedly.
- Open a direct project URL before the scene loads; refresh it; share it; disable JavaScript and read its fallback.
- Keyboard-only and reduced-motion navigation; 200% zoom; narrow portrait screen; landscape phone.
- Drag beginning/ending near a prop; pointer cancellation; scroll a long panel without scene movement; resize while reading.
- Fail a model load, lose WebGL context, hide/restore tab, use slow network, switch static view, and verify content persists.

Later optional work: original ambient audio, additional personal discoveries, and more detailed scene storytelling. No full movement system, physics world, or additional room is required for the first release.

## References

- https://docs.astro.build/en/concepts/islands/
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://web.dev/articles/vitals
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- https://github.com/aayan-amir/NoClash/blob/main/README.md
- Installed Laws of UX and Marketing Psychology skills; Sites presentation-led guidance.
