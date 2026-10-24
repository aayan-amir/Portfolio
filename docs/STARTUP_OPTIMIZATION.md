# Cold-start bottleneck investigation

24 October 2026. Current source/build retains the changes below. Nothing was deployed.

## Result

The matched three-run comparison reduced simulated mobile Total Blocking Time by **59.4%**, from **9810ms to 3984ms**. This is a meaningful responsiveness improvement, but the workshop still fails the mobile startup budget. The Lighthouse performance score only moved from50 to52. Do not call this fully solved or physically measured phone performance.

| Median, three cold runs | Original startup | Retained optimizations |
| --- | ---: | ---: |
| Lighthouse performance | 50 | 52 |
| FCP | 2444ms | 2475ms |
| LCP | 3518ms | 3555ms |
| TBT | 9810ms | 3984ms |
| Speed Index | 7367ms | 6187ms |
| CLS | 0.00092 | 0.01337 |

All three retained runs scored100 for automated accessibility, best practices and SEO. Lab TBT is not field INP; LCP here measures the name/header, not the WebGL canvas. Keeping a responsive header alone would not prove a completed room: every retained trace was separately checked for a successful baked environment and completed first-render marker.

## What the trace showed

- The original sampled first-frame trace spent about6.5seconds in Three.js shader first-use/link/uniform setup. About1.5seconds of a major sampled path was under PMREM reflection filtering. These are trace observations on the headless host, not portable device timings.
- Simply turning off shader debug checks did not remove the stall; uniform setup still had to wait. This experiment was reverted.
- compileAsync helps prepare programs while the browser can service HTML controls, but runtime reflection filtering inside preparation remained costly.
- Repeated rounded cabin parts were allocating separate geometries and materials even when their dimensions/colors matched.

## Retained changes

1. **Baked reflection lighting.** Exported the original two lightformers and their filtered HDR roughness levels once. The70190-byte hashed `.cenv` asset expands to a384x512 HalfFloat CubeUV texture. The room uses the same lighting data directly instead of generating/filtering a cubemap on every visit. The asset adds about70KB of initial transfer; it saves runtime CPU/GPU filtering and render targets. Missing, invalid or unsupported data falls back to the original lightformers.
2. **Asynchronous shader preparation.** `usePreparedRenderer` compiles against the installed environment before owning the first visible main render. Readiness now means an actual render has completed; scene labels stay hidden while preparing. Foreground animation waits for preparation. Camera and normal HTML information controls remain available. Unmount/failure guards prevent late callbacks.
3. **Room-owned shared resources.** Identical rounded geometries and standard materials share one pool for a Canvas lifetime. The pool owns cleanup, and per-instance hooks do not dispose shared resources. Geometry count in the same458x668 Neptune view fell from319 to167, about48%. Animated transforms stay per object; mesh geometry is immutable/shared.

Interior point lights, planet treatments, textures, models, case studies, native controls and current working-light appearance remain. Evening mode stays removed as requested.

## Experiments and rejected changes

| Experiment | Observation | Decision |
| --- | --- | --- |
| Disable production shader diagnostics | Single run49 / TBT13640ms vs original48 /13300ms | Reverted: no material improvement |
| Async preparation alone | Single run62 /12780ms; visually sooner but substantial synchronous work remained | Keep only with the baked environment; not a complete fix alone |
| First `.gz` lighting package | Chrome's download-manager integration returned204 with no body, forcing realtime fallback | Exclude these runs as baked-path evidence; use `.cenv` packaging and verify200/nonempty |
| Dedicated `.cenv` package | Successful70KB response, baked marker and completed render; single run56 /3550ms | Retained |
| Shared geometry/materials | Single run58 /2350ms; much lower geometry count | Retained, then checked with matched medians |
| Remove two point lights | Negligible gain in the then-fallback path and visibly darker ceiling | Reverted; original lights restored |
| Font preloads / inline CSS | No reliable LCP improvement; larger repeated HTML with inlining | Reverted |

Exploratory results varied. One later run ended before the first optimized render; it was not accepted as proof. An earlier three-run group had median2650ms, but the final matched measurement is3984ms; do not select the best number.

## Controlled measurement method

- Restored the exact original Room/Primitives source from an ignored experiment backup, built and measured three times; then automatically restored the optimized source, rebuilt and measured three times.
- Same installed Chrome154, Windows host, Lighthouse mobile defaults (412x823, DPR1.75, simulated mobile network,4xCPU), same local production-preview URL.
- Paused the agent's other animated preview and stopped the development/fault servers. Ran audits sequentially. Added `--pause-after-load-ms=5000` on BOTH sides so asynchronous GPU preparation had time to finish.
- Every optimized report returned200 and70190bytes for the reflection asset. Each trace contains `cabin-environment-baked`, `cabin-compile-ready` and `cabin-first-render-end`, with no environment fallback marker.
- Before individual TBT:9810,12710,8850ms. After individual TBT:3860,3984,6420ms (rounded display values can differ). Medians are from the numeric JSON values.
- Chrome/OS/GPU background activity is still variable. These are lab comparisons, not a real Android/iOS GPU certification. No FPS guarantee follows from these results.

Command (CHROME_PATH points to installed GoogleChrome):

```powershell
npx --yes lighthouse http://127.0.0.1:4321/ --chrome-flags="--headless=new --disable-dev-shm-usage" --pause-after-load-ms=5000 --only-categories=performance,accessibility,best-practices,seo --save-assets --output=json --output=html --output-path=output/audit/controlled-after-1 --quiet
```

Before runs used the performance category only, with identical timing and mobile settings. Raw reports and traces are under ignored `output/audit/controlled-before-*` and `controlled-after-*`; numeric summary is `output/audit/bottleneck-summary.json`.

## Verification

- Astro check:49files, zero errors/warnings/hints. All19 tests pass; production build passes with the existing large scene-chunk warning.
- HDR asset tests check dimensions/mapping, finite data, corrupt/truncated input rejection. Resource-pool tests check identity sharing, separate room lifetimes and exactly-once disposal.
- Actual browser: baked working-light appearance inspected at1440x900 and390x844 with no phone document overflow; all three case studies, camera drag, star-map travel and all nine destination textures checked. Browser error log empty. The missing-asset fixture reached `realtime-fallback` with a ready room and usable project navigation.
- Repeated Earth/Saturn/Neptune/Sun cycles stabilized: same per-body geometry counts repeated (Sun168, Earth167, Saturn168, Neptune171) and17 textures after warm-up. Extra Sun-only pooled parts are retained within the bounded room lifetime, not recreated each visit.
- Reflection HTTP200, compressed/decompressed sizes, Git trackability and the exact supplied resume hash verified.
- The exporter is development-only and its UI text is absent from the production chunk. No application framework, browser settings or download-manager settings were changed.

## Rebuilding the asset

Run `npm run dev -- --port 4323`, visit `http://localhost:4323/?bakeLighting=1` and select Bake cabin reflections. That development-only mode uses the original lightformers; save its generated `.cenv` data to `src/assets/cabin-reflections.cenv`. Rebuild, run the HDR asset tests and visually compare. Regenerate after changing the lightformer rig or upgrading a Three.js version whose PMREM layout changes. The format is a gzip-compressed little-endian CABN/version1 header followed by RGBA Float16 texels with all roughness levels.

## Remaining work

The budget is still performance>=90, LCP<=2500ms and TBT<=200ms. The dominant shader/filter stall is reduced, but initial React/R3F scene construction, context/buffer initialization and first draw still produce long tasks. The next substantial experiment should move more static room construction into a prebuilt/merged asset and profile the remaining main-thread tasks. Keep the readable edition and native controls available. Validate the final startup and camera path on real phones before claiming production readiness.
