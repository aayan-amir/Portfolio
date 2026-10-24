# Exploration ship — complete visual redesign

24 October 2026. Planning only. Supersedes the visual design and camera contract in GLASS_OBSERVATORY_PLAN.md. Application code is unchanged in this planning pass.

## Diagnosis and accountability

The last build addressed feature presence, not the quality of the experience. A rectangular glass box, office desk, ordinary chair, and assorted small devices do not communicate a spaceship. Thin structural lines barely describe an enclosure. Similar matte surfaces and broad lighting flatten the geometry. The giant name and planet compete with the projects, which are tiny and visually interchangeable. A small monitor/tablet/terminal does not express the distinct engineering in the three projects.

The existing control tests encode the earlier assumption that the room should follow the pointer. The user's repeated report that controls are reversed overrides that assumption. Passing those tests did not establish that the controls matched the intended experience.

Do not reskin the existing desk or add more decorative particles to it. Replace the visual scene, layout, lighting, and project installations. Retain content data, validated URLs/history, semantic panels, focus handling, and accessible text routes as infrastructure.

## Chosen concept

Aayan's exploration ship: a compact, elegant observation bridge with three working exhibits built into its architecture. A place to think and make useful things while the universe moves outside. Calm, inhabited, precise; neither a military cockpit nor a neon arcade.

Considered alternatives:
- A dark fighter cockpit: recognizable spacecraft, but cramped, aggressive, and full of irrelevant controls.
- A huge sci-fi hangar: dramatic scale, but projects become distant props and recruiters must explore to find information.
- A compact observation bridge: recognizable architecture, close readable projects, panoramic space, and a comfortable stationary visitor position. Chosen.

Primary visual hierarchy: spaceship silhouette and three project installations; name and role remain immediately readable; planet provides atmosphere and scale. Destinations remain optional exploration.

## Art direction and spatial composition

Replace all wooden office furniture, office chair, floating shelves, scanner, desktop monitor, and small generic terminal. Keep at most one personal detail after the architecture and projects succeed.

Use an elliptical observation bay with a continuous curved sill and three integrated low plinths. A broad central floor opening creates depth and keeps the view from feeling like a table filling the screen. Sculpted structural ribs sweep from the floor into an overhead crown. Large panoramic glass segments span between them and continue over the viewer. The ribs must have convincing thickness, sockets, panel joints, and edge bevels, not thin wireframe lines.

Layer the space:
1. Foreground: a narrow curved floor lip, recessed warm guide light, partial peripheral console edges.
2. Midground: the three project objects, all recognizable in the initial desktop view, at human reach scale.
3. Background: curved hull ribs and glazing with restrained edge reflections.
4. Exterior: a large but subordinate celestial body, sparse stars, and controlled depth cues.

All permitted camera angles must show finished geometry, including side returns and rear ceiling sections. No free walking. Avoid cropping a major project at the default desktop position.

Initial desktop composition:

    Aayan Amir / Software developer                 Contact / resume
     curved structural crown / panoramic exterior / planet
       NoClash           Student Portal             NoTerm
     orbit scheduler     knowledge archive      action sequencer
        curved integrated plinths / open floor / warm guide lights
    Work  About  Approach  Contact          Destinations  View settings

Palette:
- Ceramic shell #D8DEDD
- Titanium #71818D
- Hull recesses #172832
- Exterior #030A13
- Warm guide light #E8B97B
- Interactive ice blue #93D9E5

Colors serve material and interaction roles, not arbitrary neon decoration. Small project accents may differ, but shape and labels distinguish them without color perception.

Typography: retain Manrope for name/headings and DM Sans for readable content initially. Move the name into a composed title area rather than a giant left overlay that obscures geometry. Keep important text in HTML; no tiny projected text required to understand a project.

Materials: distinguish ceramic, machined metal, rubber seams, glass, and light through roughness, edge response, and reflections. Use a small shared material library. Real bevel geometry on the visible primary silhouette; normal/roughness details for minor seams. Establish a controlled environment reflection before judging metal. Avoid flat unlit color for architectural surfaces.

Lighting: stable neutral-warm interior key, exterior rim light, and low-intensity practical strips. Deliberate shadows under each installation establish contact. Environment color should reach the room subtly without turning all materials orange/blue. Bloom only on selected luminous features, evaluated after the unprocessed scene already looks good. No expensive depth-of-field blur on interactive objects or text.

## Three projects, three identifiable experiences

The installations are illustrative metaphors, not simulated screenshots or claims that the real applications have spaceship interfaces. Labels explicitly identify the actual projects. Source/demo access is available immediately; animation never gates reading.

### NoClash — orbital scheduling instrument

Silhouette: an open, wide mechanical instrument with three curved schedule tracks and a few floating time-block tiles, supported by a compact physical base. It must read differently from Saturn and the destination globe: time blocks and an intersecting schedule structure are its defining feature, not simply concentric rings.

Idle: a stable arrangement with one clearly indicated sample overlap; minimal motion.
Hover/focus: highlight the sample blocks and show 'NoClash — timetable planning'.
Select: the illustrated selection changes, the overlapping blocks separate, and a conflict marker resolves in roughly 600–900 ms. The HTML case study opens immediately. No mandatory mini-game, no automatic conflict-resolution claim for the real app.
Case study: messy timetable input -> review extracted data -> choose sections and check clashes. Explain the AI/human/deterministic boundary. Primary evidence action is the real live demo; repository is secondary.

### Student Portal — knowledge archive

Silhouette: a vertical architectural archive with a solid asymmetric frame, a small stack of document cartridges, and three suspended resource plates. Avoid another spherical object or generic tablet.
Idle: resource plates sit in a coherent ordered cluster, not a cloud of unreadable text.
Hover/focus: one plate separates slightly; label 'Student Portal — shared classroom resources'.
Select: a sample contribution passes a visible review gate and joins the organized archive in roughly 700–1,000 ms. Approved and pending states have distinct shapes/positions as well as colors. Reading starts immediately.
Case study: classroom/resource relationships, pending -> approved/rejected moderation, uploads and approved-file access, backend data/auth choices. Link source; add approved screenshots later. Do not imply a public live deployment.

### NoTerm — physical action sequencer

Silhouette: a broad, angular instrument with a rotary selector, three connected recessed modules, and a guarded confirmation lever. Mechanical, low, and asymmetric; clearly different from the archive and orbit instrument. No conventional monitor as the defining object.
Idle: one suggested operation is represented by a simple labeled token.
Hover/focus: an illuminated path reveals the stages: choose -> preview -> confirm -> result.
Select: the guard lifts, a pulse travels through the modules, and the result indicator settles in roughly 700–1,000 ms. It is an illustration only; the portfolio executes no Linux commands and does not require a second confirmation to read the project.
Case study: predefined action catalog, parameter validation, previews, risk confirmations, stdout/stderr/exit status, optional database catalog fallback. Link source. Explain Linux/tool constraints without claiming guaranteed safety.

All three have equal evidence access and large selectable hit areas. NoClash may be the first suggested project because it has a live demo, not the only visually developed one.

## Camera and input contract

Default is LOOK direction, replacing the rejected room-drag convention:
- Drag right: turn to look right. A stationary central landmark travels left on screen; architecture previously to the right is revealed.
- Drag left: look left.
- Drag up: look up. A central landmark travels downward and more ceiling is revealed.
- Drag down: look down and reveal more floor.

Implement the contract in world/view behavior, then derive yaw/pitch signs from that. Replace the current sign-only assertion with projected-landmark tests as well as real browser drag verification. Keep translation fixed; initial bounds around yaw +/-35 degrees and pitch +/-18 degrees, tuned to the finished hull.

Separate pointer IDs, primary-button initiation, threshold, capture/lost-capture, cancel, blur, and release cleanup. Dragging across a project must not activate it. Clicking a project must work with negligible movement. Use one modest smoothing model; no long inertial drift. Reset returns both visible camera orientation and internal targets to the known framing.

Allow optional invert-horizontal/invert-vertical controls under View settings, persisted locally, but correct the default first. Desktop arrows can provide look controls when the scene has focus; they must not hijack text/select/dialog keyboard interaction. No pointer lock required.

When reading, pause look gestures and decorative movement. Preserve orientation on close. Destination changes do not relocate or rotate the camera.

## Recruiter path and interface

Landing must communicate name, role, three real projects, and contact without discovering hidden objects. Persistent Work opens a concise three-project index with one-line problem summaries. Each project is reachable directly through HTML and through its installation. Keep Contact and resume request obvious.

Case studies use a readable side panel on wide screens, leaving the relevant installation and exterior visible. On phones use a substantial readable sheet with proper internal scrolling. Preserve focus, Escape, return focus, URL sharing, history, and scroll state during destination changes. All animation is interruptible; opening another project cancels the previous sequence safely.

Labels are semantic HTML anchored near the installations, with reliable occlusion and viewport clamping. Never shrink them until unreadable to fit the scene. User sees real project names, not fictional mission IDs. First-visit guidance is one short 'Drag to look. Choose a project.' cue, dismissing after meaningful interaction.

## Destination experience

Keep eight planets plus Sun. Replace the plain select as the main art treatment with a compact labeled destination tray opened by a navigation globe and a persistent HTML control. Thumbnails, selected state, and keyboard navigation; do not leave nine large cards permanently over the scene.

The exterior changes while the ship stays anchored. Use a brief crossfade/lighting transition around 500–900 ms; no mandatory warp tunnel, shaking, or white flash. Latest choice wins. Maintain only active and, temporarily, incoming environment resources, with bounded ownership and cleanup.

Earth: recognizable texture/map rather than arbitrary noise continents; use a documented licensed source or clearly stylized authored map. Saturn: coherent ring plane, graded ring texture, correct front/back occlusion and restrained shadow treatment. Sun: layered surface/corona and slow flare motion, preserving readable interior exposure. Neptune: deep blue exterior, sparse ice motes and localized frost attached to glass edges, not a full-screen CSS wash. Other planets need individual surface structures, not only color changes.

All effects stay primarily outside the glass. Reduced effects keeps the same composition and distinctive silhouettes. Static mode has an attractive destination-matched frame with full content access.

## Phone composition

Do not cram the desktop camera into a portrait viewport with an extreme wide lens and text over every object. Use an independently composed portrait camera within the same ship. Show one installation prominently with visible previous/next project buttons and the three project names. Changing the selected project rotates the anchored view through a small controlled angle, only on explicit selection; reduced motion jumps to the settled framing. The viewport never needs device orientation permission or pinch navigation.

Identity stays compact at top; contact and Work remain available. Destination tray must not cover primary project controls. Test 390x844 and a narrow 360px viewport as layout checks, then report separately if physical-phone GPU tests are unavailable.

## Implementation and resource strategy

Keep Astro/React Three Fiber/Three.js; a framework change would not solve the design failure.

New visual modules:
- ShipScene / ShipHull: geometry, frame, glazing, floor, integrated bases.
- ShipLighting: stable interior rig and destination accent response.
- ProjectInstallation: common semantic/picking/state contract.
- NoClashInstrument, StudentArchive, NoTermSequencer: distinct geometry and short action sequences.
- LookController: corrected controls and reset contract.
- DestinationStage: active/incoming environment ownership and transition state.
- PortfolioInterface: typography, project labels, panels, navigation, accessibility.
- QualityController: measured quality tier, reduced effects, static mode, hidden-tab pause.

Use custom extruded profiles and curved geometry for important architecture, with instanced shared ribs/fasteners and merged static sections. Evaluate licensed glTF assets only if they improve the chosen art direction; do not assemble a mismatched asset pack. A generated concept frame guides composition, not proof that the real-time implementation looks like it.

Geometry detail follows silhouette. One coherent tone-mapping/color pipeline. Glass uses restrained tint/highlights first; pay for physical transmission only where a measured comparison demonstrates visible benefit. Light maps/AO for static structure where practical; restrict live shadow casters. Instance repeated blocks, archive elements and exterior particles. Pause invisible/settled sequences and background tabs. Avoid per-frame React state updates and allocation.

Provisional profiling targets, to be validated on named hardware: desktop active interaction p95 near or below 20ms; reduced-quality mobile target near or below 33ms. Initial guide <=140 draw calls for the settled composition, treated as diagnostic rather than a guarantee of speed. Report loading, frame-time percentiles, long tasks, resolution, memory trends, and visual tradeoffs. Do not claim real-device results from viewport emulation. Reduce costly effects before simplifying the defining ship/project silhouettes.

## Build sequence and visual gates

1. Concept and composition: one wide concept frame, geometry layout, silhouette sketches, and portrait arrangement. Review against this brief. Identify what the real-time build must reproduce and what is only illustration quality.
2. Camera proof: isolated labeled landmarks and a simple hull. Verify right/up/down/left, reset, cancel, drag suppression, touch, and keyboard. Fix direction before art work expands.
3. Ship vertical slice: complete hull, glass, interior lighting, Earth, and static versions of all THREE installation silhouettes. Judge actual desktop/portrait screenshots. Do not advance by adding eight environments to an unconvincing room.
4. Project installations: refine all three models and their meaningful interaction sequences; readable source-linked case studies; direct navigation. Assess equal visual care for each project.
5. Destination art: rebuild Sun/Saturn/Neptune treatments first, then the remaining planets, transitions, resource handling and reduced modes.
6. Verification: keyboard/reduced-motion, camera behavior, history/direct entry, panel scroll continuity, real browser rendering, performance comparisons, resource-cycle tests, production build and error fallback.

Gate 3 is critical: if the room still reads as office furniture with space wallpaper, or the projects look like small interchangeable boxes, revise the geometry/lighting/composition before implementing more features. A passing build and triangle reduction cannot substitute for this visual acceptance.

Acceptance checks:
- Recognizable spaceship from an unlabelled still image.
- Three recognizably different project installations in the opening desktop view.
- Name/role readable without covering the installations.
- A recruiter reaches project evidence/contact in one or two deliberate actions, never by solving a game.
- Directional camera behavior matches the contract, with visible landmarks and input cleanup.
- Quiet warm interior survives Earth, Sun, Saturn and Neptune lighting.
- All optional motion has a static/reduced equivalent and never gates text.
- Measured quality tier and device limitations reported honestly.

UX lenses applied: Hick's Law (three grouped project choices; destinations tucked away), Fitts's Law (large hit areas and visible HTML alternatives), Jakob's Law (predictable look controls and normal readable navigation), Aesthetic-Usability Effect (separate visual gate from functional tests), and Peak-End Rule (strong arrival and direct, calm contact ending).

## Scope of this turn

Planning and a preview-only concept image. No application code changes, deployment, or new claim that camera controls are fixed. Next implementation starts with the camera proof and ship vertical slice.

## Concept-frame review

Preview concept generated in this planning pass: C:\Users\AAYAN\.codex\generated_images\01a16b4f-82d1-7682-9e4c-9692672f021f\exec-bafbc1a9-fa25-45f0-ae2e-b252838492ea.png. Preview-only reference, not a runtime asset or implemented screenshot.

Keep: the curved structural hull, panoramic roof, open central floor, integrated exhibit bases, warm practical lighting, and three legible installation silhouettes. This is a substantially closer spatial composition than the existing rectangular room.

Revise during implementation: the concept is too gold/brass-heavy and drifts toward a luxury exhibit. Use the planned ceramic/titanium material hierarchy with amber confined to practical lights. Reduce the dense star field and excess polished trim. Replace the central NoClash globe with schedule tracks/blocks so it cannot be confused with destination navigation. The archive should gain an asymmetric solid spine, reducing repetition of circular forms. Keep actual HTML typography crisp and compact rather than copying the generated serif lettering. Do not reproduce the concept's tiny unreadable document text.

The image establishes composition and art direction, not a promise of identical offline-render detail or measured browser performance. The implementation must meet the same silhouette/material/lighting goals through real geometry and a tested rendering budget.
