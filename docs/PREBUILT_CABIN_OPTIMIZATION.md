# Prebuilt cabin performance follow-up

24 October 2026. Local production build; not deployed.

## Result

Matched three-cold-run medians reduced TBT **33.9%**, from **3008ms to1987.5ms**. Speed Index improved from4193ms to3618ms. Lighthouse performance moved57 to58. LCP regressed slightly from3468ms to3620ms; the mobile release budget remains open. These headless Windows results are lab measurements, not physical-phone FPS or field INP.

| Metric | Previous startup | Prebuilt cabin |
| --- | ---: | ---: |
| Performance | 57 | 58 |
| FCP | 2418ms | 2495ms |
| LCP | 3468ms | 3620ms |
| TBT | 3008ms | 1988ms |
| Speed Index | 4193ms | 3618ms |
| CLS | 0.00092 | 0.00092 |

Every run scored100 for automated accessibility, best practices and SEO. Every trace includes a baked environment and completed first render; every after trace also includes cabin-static-ready. No late-start or missing-room run was counted. Raw reports/traces and numeric summary are in ignored output/audit/prebuilt-{before,after}-{1,2,3} and prebuilt-summary.json.

## Changes retained

- Exported the original cabin and three project instruments to a **346422-byte** self-contained package. Merged fixed surfaces by material and source zone; kept moving mechanism nodes separate. Normalized16-bit geometry, Meshopt compression and embedded WebP screens/posters reduce decode and construction work. The original editable source remains the asset-failure fallback.
- Runtime contains77 mesh definitions/87 nodes. The same458x668 Neptune resting view fell from216 to101 draw calls. Triangles increased from72386 to88810 because merged bounds cull less finely; this remains below the160k workload target. These are workload counters, not FPS claims.
- Named planner arm, archive drawer and terminal lever retain their existing animation behavior through PreparedProject. Destination-specific decor and the interactive lunar print remain live scene components.
- After asynchronous compilation, warm program metadata and texture uploads in separate tasks before declaring the first fully rendered room ready. Scene mount uses a React transition; native HTML information controls stay available.
- Asset loads have cancellation/stale-result guards and explicit ownership of detached project models, geometries, materials, textures and bitmap resources. A failed package invokes the editable procedural room and project models.

The new package adds346KB of compressed transfer plus GLTF loading/decoding code. It trades some network cost for less runtime construction and fewer draw calls. LCP is still the name/header and regressed about152ms in these runs; do not present this as an across-the-board loading win.

## Method and rejected experiments

Same Chrome154/Lighthouse mobile defaults,412x823/DPR1.75, simulated mobile network and4xCPU; six sequential runs on the same local production-preview URL with pause-after-load-ms=5000. The comparison restored the four prior scene modules for the before build, then restored and rebuilt retained source in a finally block. The development server was stopped and the separate native preview paused. Before TBT:2689.5,3031.5,3008ms. After:1987.5,1937.5,2591ms.

This session's before median differs from the earlier3984ms baseline because host conditions vary. Use the matched3008ms comparison for this change; do not combine best numbers across sessions.

An extra vertex-buffer batching pass produced no meaningful benefit (single trial1940ms vs1930ms) and was removed. A worker-renderer migration was investigated but not implemented; it requires a separate compatibility and interaction migration rather than an unverified startup patch.

## Validation

22 tests pass, including shipped-asset structure, all named project mechanisms, complete Meshopt decode/index bounds and corrupt/external-resource rejection. Astro check:56 files,0 diagnostics. Production build passes; the large scene-chunk warning remains. Production npm audit reports0 vulnerabilities. Browser checks confirmed ready prebuilt scene, all three case-study selections, and simultaneous cabin/environment/planet download failure reaching a ready procedural fallback. Physical-phone performance and context-loss recovery were not revalidated in this follow-up.

## Rebuild after scene/model changes

1. Start development server and open /?bakeCabin=1. Wait for the full room; select Bake static cabin.
2. Save the resulting static-cabin.croom export outside src/assets.
3. Run node scripts/compress-static-cabin.mjs <exported.croom>. This writes src/assets/static-cabin.croom using the build-time Meshopt encoder. The encoder is not shipped to browsers.
4. Run npm test, npm run check and npm run build; verify the three project mechanisms, lunar print and Sun/Neptune decor in the actual browser. Bake UI/exporter are development-only.
