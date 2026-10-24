# Glass observatory implementation review

24 October 2026. Local production preview at http://127.0.0.1:4321/.

## Implemented

- Open glass walls and roof with a slim structural frame; large exterior celestial body and surrounding stars. Warm interior retained.
- Earth, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Sun. All generated locally with procedural geometry/materials; no planet asset requests or asynchronous loading race.
- Solar plasma surface and corona, Saturn/Uranus rings, exterior particles, Neptune edge frost. These are stylized illustrations, not scientifically accurate planetary maps.
- Native labeled destination selector in the room and information panels. Desk orrery focuses/opens the same selector. Unsupported native showPicker retains keyboard focus.
- Validated destination + section + project URLs, history, and preserved reading-panel identity across environment selections.
- Featured NoClash, Student Portal, and NoTerm, with repository links. Generic business software remains supporting experience only. Case-study descriptions are README-derived, not independently audited functionality claims.
- Anchored camera extracted into its own controller. Both axes follow scene-drag semantics; bounded rotation, pointer capture, drag suppression, reset, and paused camera during reading.
- Reduced effects lowers DPR and removes particles/flares; Still view freezes scene motion and camera while preserving navigation. System reduced motion and hidden tabs stop decorative motion.
- Cheap glass transparency instead of multi-layer refraction; selective cast shadows and removed redundant contact-shadow pass. One active planet/effect tree. Fallback is a lightweight destination-colored illustration and accessible text edition.

## Verification

- Astro check: 0 errors, 0 warnings, 0 hints.
- Nine tests pass: navigation validation/round-trips, planet+project sharing, invalid planet fallback, camera signs and bounds.
- Production build passes. Existing large Three.js chunk warning remains.
- Real in-app WebGL browser checked at 1440 x 900 and 390 x 844. Phone dimensions are viewport emulation, not a physical phone GPU test.
- Dragged right/down and inspected the actual scene; rocket opens About; reset returns measured yaw/pitch to zero.
- Switched every destination twice; final selection and URL agree. Geometry counts return to the same destination-specific values: Earth 126, ordinary planets 127, ring/Sun destinations 131 in this sample; textures remain 5. These partial renderer counters do not prove total GPU memory absence of leaks.
- Student Portal and NoTerm panels work. Changing destination preserves the current case study. Reloading Saturn + Student Portal reopens both. Still/reduced effects keep Work reachable.
- No browser error-level console messages observed during initial render and final interaction checks.

## Performance sample

Desktop browser, production build, 1440 x 900, DPR capped at 1.5. Same scene and fixed camera; renderer totals include shadow work.

| Destination                                | Draw calls | Triangles |
| ------------------------------------------ | ---------: | --------: |
| Earth                                      |        162 |    56,050 |
| Mercury / Venus / Mars / Jupiter / Neptune |        163 |    56,050 |
| Saturn / Uranus                            |        171 |    58,098 |
| Sun                                        |        167 |    59,508 |

Earlier solid-room sample: 218 calls / 123,612 triangles. Sun steady-state sample: 16.7 ms mean over 120 render callbacks, 17.8 ms max. This is frame cadence, not isolated GPU execution time. Rapid-switch samples reuse the most recent cadence window; they are not independent per-planet benchmarks.

## Remaining refinement and release work

- Current switches are immediate, interruptible procedural updates. The planned cinematic crossfade/star-travel treatment and thumbnail selector have not been added; native selection is the functional baseline.
- Further art pass: geographically accurate Earth texture if desired, richer individual rock/cloud detail, glass highlights and more organic exterior ice.
- Physical phone, integrated GPU, Lighthouse cold-load and long-run memory profiling remain. Initial draw-call target of 100 is not yet met.
- Current styles/resources are split into camera and observatory modules; room props remain in Room.tsx.
- No separate per-destination asset failure test applies to the request-free procedural planets. Existing WebGL-error fallback is retained, not fault-injected in this pass.
- Resume file, approved real screenshots, final content confirmation, production domain/metadata, and hosting remain release tasks.
