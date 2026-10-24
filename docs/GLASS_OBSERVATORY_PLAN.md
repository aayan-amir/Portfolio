# Glass Observatory — revised build plan

24 October 2026. Current direction following review of the first working prototype. Planning only: no application behavior changed in this revision.

This supersedes earlier decisions about solid walls, the small circular window, featured business-tool projects, and camera drag direction. Retain the existing information panels, URL/history behavior, accessible alternatives, and verified interaction work.

## 1. What changes and why

The first room does not communicate space strongly enough: a small window reads as a room decoration. Replace it with a glass observatory suspended in space, where a large celestial body and its surroundings are visible across the room's walls and ceiling.

The user reports that camera controls feel reversed. Reopen that implementation task and correct it before building more movement.

Feature NoClash, Student Portal, and NoTerm. Inventory and outreach work can support the professional background, but no longer occupy the main project objects.

## 2. Creative direction

Keep a warm, human workspace within a much larger astronomical setting. Use a thin structural frame, clear glass wall/roof panels, a grounded circular or softly polygonal platform, a tactile desk, warm lamp, and a few personal objects. Space must be visible behind the desk, along the sides, and overhead; it must not look like a photograph pasted into another small window.

Glass is visible through edge reflections, subtle tint, panel seams, and structural fittings. Its optical effects must not distort the featured planet into an unreadable blur. Avoid extensive opaque wall panels or fog that hides the space backdrop.

Use a stable warm interior lighting layer and a restrained destination-dependent exterior layer. Keep text panels opaque enough to read in every environment. The visual contrast is a comfortable inhabited place surrounded by an immense quiet landscape.

Earth is the initial calm destination. The planet should occupy roughly a third to half of the clear exterior view in the main composition, tuned for framing rather than real astronomical scale. Compose the planet behind/to one side of the desk and keep it visible when an information panel opens. Reframe separately for portrait screens.

## 3. Camera contract

Implement direct manipulation: drag the scene to the right and the room follows right; drag it upward and the room follows upward. The camera's rotation responds accordingly, while its physical position remains anchored. Confirm both axes visually; do not change one sign and assume the problem is solved.

Retain bounded yaw/pitch and Reset view. Test a wider comfortable look range with the glass shell, initially around 35 degrees each side and 20 degrees vertically, then adjust to avoid revealing incomplete scene geometry. No unrestricted walking or flight controls are needed.

Use a drag threshold, pointer capture/cancellation cleanup, and no object activation after a drag. Reading a panel pauses look controls. Returning to the room restores the prior orientation. Destination changes do not reset the visitor's view arbitrarily. Reduced motion avoids easing/travel effects.

## 4. Destinations and environmental effects

Use the label Destinations because the Sun is included. Support the eight planets plus the Sun. Each selection changes the prominent exterior body, exterior effects, and subtle reflected room lighting. Artistic effects are cinematic motifs, not scientific simulations.

| Destination | Main exterior                                   | Signature treatment                                                                     |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Earth       | Large blue planet, clouds, atmospheric rim      | Gentle blue daylight and restrained star field                                          |
| Mercury     | Cratered rocky body                             | Harder light and faint warm dust near the exterior                                      |
| Venus       | Cloud-wrapped gold planet                       | Slow layered cloud bands and warm haze outside                                          |
| Mars        | Rust-colored surface                            | Fine red dust drift and warm side lighting                                              |
| Jupiter     | Banded giant                                    | Slow cloud-band movement and distant subtle storm glow                                  |
| Saturn      | Clearly tilted, broad rings crossing the view   | Ring particles/ice fragments beyond the glass and soft bands of light                   |
| Uranus      | Pale cyan body with an unusual ring orientation | Restrained cyan light and fine tilted orbital arcs                                      |
| Neptune     | Deep-blue body                                  | Icy particles outside, soft cold mist, and very subtle frost at the glass perimeter     |
| Sun         | Large emissive solar surface                    | Flowing plasma/corona, restrained flare ribbons, amber light, and sparse embers outside |

The Sun's fire effect stays outside the room. Neptune's frost stays at glass edges. Saturn's ring field remains predominantly beyond the glass. All three signatures should be recognizable without covering content or turning the interior into a particle storm.

Implement Earth, Sun, Saturn, and Neptune first as proof of the environment architecture. Then complete the other five destinations with the same data-driven pipeline. Do not leave nonfunctional selectable destinations in the shipped version.

## 5. How a visitor chooses a destination

Add a small physical navigation console or miniature orrery on the desk. Selecting it opens a compact HTML destination selector with labeled celestial thumbnails, the active destination, and a brief descriptive cue. Also provide an immediately accessible Destinations control in the persistent interface.

Selecting a destination keeps the workshop and viewer in place while the exterior transitions. It should feel like arriving in another orbit without requiring a spaceflight minigame or a long cutscene. A short star-drift/crossfade and change in reflected light is sufficient. The change can be interrupted by another selection.

The old environment remains visible while the next destination's assets load. Use newest-selection-wins behavior to prevent stale loads replacing the current choice. On failure, retain the existing environment and offer retry. The selector closes after an intentional choice and announces the resulting destination once, without narrating every frame.

Store a validated destination slug alongside existing section/project URL state. Sharing Saturn + NoTerm should reproduce both. Destination navigation must not break Back/Forward, close the current reading panel, or replay a long animation on a direct link. Use history for committed selections, not hover previews.

## 6. Revised project objects and story priorities

| Object                           | Story                   | Evidence to emphasize                                                                         |
| -------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| Timetable display                | NoClash                 | Reviewing extracted timetable data and deterministic clash checks                             |
| Content/archive device or tablet | Student Portal          | Submissions, moderation states, file delivery, authentication, and data relationships         |
| Compact Linux workstation        | NoTerm Command Center   | Discoverable system actions, parameter validation, confirmation, output, and catalog fallback |
| Model rocket                     | About                   | Personal introduction, curiosity, and career direction                                        |
| Notebook                         | Experience and approach | Practical professional work and reviewed AI-assisted development                              |
| Communications console           | Contact / resume        | Direct contact and current career availability                                                |

Remove the scanner and outreach terminal as featured case-study objects. Reuse suitable meshes as decoration or rebuild them into the archive device and Linux workstation; do not clutter the room with both versions.

Student Portal's current README states ASP.NET Core MVC on .NET 10, PostgreSQL/Supabase, EF Core, Cloudinary, cookie admin authentication, moderation, approved-file access, and an optional Capacitor Android wrapper. Treat these as repository-described capabilities pending source/runtime validation. Do not repeat the old portfolio's .NET 8 description.

NoTerm's README describes a Linux/Ubuntu-focused Avalonia/.NET 8 app, 66 predefined actions, validated parameters, confirmations for risky actions, pkexec elevation, stdout/stderr/exit status, and optional Postgres-backed catalog with built-in fallback. Describe the implemented safety approach; do not claim it is injection-proof or guarantees safe system administration without code review and tests.

NoClash remains the live demo. Source-linked case studies, recordings, and approved screenshots support the other projects. Do not invent public deployments or user numbers. In-house work belongs in a concise background section as evidence of practical experience.

## 7. Technical structure and rendering approach

Split the current monolithic room file before expanding it:

- ObservatoryShell: platform, frames, glass edges, roof, and interior fixtures.
- WorkshopProps: desk, project devices, rocket, notebook, personal objects.
- AnchoredCamera: gestures, bounds, return/reset, and cancellation.
- DestinationController: validated destination state, interruption, and history integration.
- CelestialBackdrop: stars, featured body, atmosphere/rings.
- DestinationEffects: Sun, Saturn, Neptune, and other per-destination motifs.
- QualityController: effect intensity/resolution and static fallback.
- Existing interface/controller: semantic panels, project registry, content, and navigation.

Use one coherent Three.js rendering/postprocessing pipeline. Begin with inexpensive glass treatment and selective edge reflections. Full-screen, multilayer physically transmissive glass is a performance risk: test the necessary panes rather than enabling heavy refraction everywhere. Three.js documents a higher per-pixel cost for physical material effects.

Reuse geometry/materials. Use instanced particles for dust, ring fragments, and ice. Keep particle counts and transparency overdraw bounded. Use selective bloom only where needed for the Sun; do not make the interface glow. Choose procedural shaders/textures or properly credited source textures after asset review. A poster is the fallback, not the primary planetary experience.

Load only the selected destination's heavier resources; keep a small bounded cache and release replaced resources safely. Compile/warm the next effect before presentation where practical. Avoid an unbounded accumulation of planet textures and GPU render targets.

## 8. Comfort, accessibility, and performance

Persistent About, Work, Approach, Contact, and resume access remain usable during destination changes. The planet selector is optional exploration; no destination unlocks required portfolio information. This preserves recruiter time.

Add effect settings with a clear Reduced effects/static option. Respect reduced motion: stable destinations, no star travel, no drifting particles or continuous plasma animation when disabled. Keep a low-power/static alternative with matching destination posters when feasible, while retaining all text and controls.

Maintain sufficient panel contrast on dark, fiery, and icy backgrounds. Use visible HTML labels, keyboard focus, destination announcements, and phone-sized targets. Avoid flashes, screen shake, automatic camera movement, and audio autoplay.

The previous sample was 218 calls / 123,612 triangles at startup, above initial approximate rendering budgets. Profile and reduce current overhead before adding multiple glass layers and particle effects. Record frame times and memory for Earth, Sun, Saturn, and Neptune at fixed viewport/DPR and known animation states; compare low/high effect settings. Do not use a desktop viewport resize as proof of phone GPU performance.

Do not keep every destination effect animating in the background. Pause hidden tabs. For animated environments, use a controlled render loop only while the view/effects need it; return to demand/static rendering when motion is disabled or settled. Stop decorative animation while a long case study is being read if it distracts or consumes unnecessary resources.

## 9. Revised execution stages

### A — Correct controls and refactor

Fix both drag axes and add a focused control contract test plus browser verification. Split camera, shell, objects, and environment ownership. Preserve existing panel/history behavior.

Exit: drag feels like grabbing the scene, reset is predictable, dragging never selects a prop, and navigation checks still pass.

### B — Glass observatory and Earth

Replace opaque walls and small window with a structural glass shell. Build a large exterior Earth/stars composition, warm interior lighting, and desktop/portrait framing. Recompose the identity so it no longer visually competes with the desk.

Exit: the first frame unmistakably reads as a workshop in space, including with panels open. Review actual rendered desktop and portrait images before adding decorative effects.

### C — Destination-system proof

Build a selectable environment registry, selector console + HTML controls, transition/cancellation state, URL integration, failure handling, and Earth/Sun/Saturn/Neptune prototypes.

Exit: each of the four destinations has a distinct body/effect, newest selection wins, direct links work, text remains readable, and no stale assets or leaked effects persist after switching.

### D — Project-story replacement

Feature NoClash, Student Portal, and NoTerm. Rebuild the two project devices and case studies. Move generic business tools into supporting professional background. Verify source claims before final copy.

Exit: each featured project demonstrates a different kind of judgment and is clearly linked to real evidence.

### E — Remaining destinations and art refinement

Complete Mercury, Venus, Mars, Jupiter, and Uranus. Refine glass, reflections, planet materials, environment transitions, and warm interior continuity. Add low-effect variants and matching fallbacks.

Exit: every selectable destination works; the workshop remains coherent across all environments; added detail improves the experience rather than obscuring it.

### F — Performance and release-quality verification

Measure destination-switch behavior, frame times, draw calls, resource growth, loading, reduced motion, keyboard use, direct-entry/history, production builds, and available browser/device combinations. Finish confirmed resume/content, metadata, deployment configuration, and asset attribution.

Exit: tested production preview, documented limits, and no known blocker in the recruiter journey. Hosting/domain changes remain separate release work.

## 10. Required checks

- Both drag axes, reset, drag ending over a prop, and pointer cancellation.
- Earth -> Sun -> Saturn -> Neptune -> Earth, including repeated rapid changes.
- Change destination while a project panel is open and preserve its reading state.
- Reload/share a destination + project URL; exercise Back/Forward.
- Force a destination asset failure; keep current environment and navigation usable.
- Toggle reduced effects and static view on each signature destination.
- Repeat destination changes while observing renderer resource counters and memory trends.
- Inspect actual rendered planet size, glass clarity, Sun brightness, Saturn ring visibility, Neptune effect restraint, and phone panel contrast.
- Re-run type checking, existing URL tests extended for destinations, meaningful control/state tests, and production build.

## Sources

- Student Portal: https://github.com/aayan-amir/StudentPortal/blob/master/README.md
- NoTerm: https://github.com/aayan-amir/NOtoTERMINAL/blob/main/README.md
- Physical-material cost and transparency: https://threejs.org/docs/pages/MeshPhysicalMaterial.html

Next action after this planning revision: Stage A. No application code or controls were changed during planning.
