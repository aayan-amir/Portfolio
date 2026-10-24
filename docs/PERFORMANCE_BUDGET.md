# Performance release budget

Measure a production build using Chrome Lighthouse mobile defaults, three sequential cold runs, and report medians. Also measure representative physical phones; headless/software WebGL results do not establish GPU frame rate.

| Metric | Budget | Workshop median | Text edition median |
| --- | ---: | ---: | ---: |
| Lighthouse performance | >=90 | 58 FAIL | 100 PASS |
| LCP | <=2500 ms | 3620 ms FAIL | 1215 ms PASS |
| TBT (lab responsiveness proxy) | <=200 ms | 1988 ms FAIL | 0 ms PASS |
| CLS | <=0.1 | 0.00092 PASS | 0.01332 PASS |

Current workshop startup is not mobile-release-ready under this budget. Lab TBT is not field INP. Keep the direct text edition available. Do not delay the initial 3D experience solely to make Lighthouse miss its cost.

The resting desktop composition has a separate target <=320 draw calls and <=160k triangles; input may request faster frames than the ambient 30Hz wake-up. These workload targets do not guarantee FPS on any physical device.

Next optimization work should profile cold construction and shader compilation, then compare prebuilt/shared geometry, staged scene preparation and asynchronous shader warm-up where supported. Verify visual equivalence, retained interactions and repeated destination cache stability. Re-run the same budget after changing the startup path.

Workshop medians reflect the latest prebuilt-cabin follow-up; text-edition values are from the prior audit. See PREBUILT_CABIN_OPTIMIZATION.md for the matched comparison and retained limitations.
