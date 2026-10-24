# Astro Audit — Aayan Amir portfolio

Latest follow-up: the prebuilt cabin reduces matched median TBT from3008ms to1988ms (33.9%), with101 resting draw calls instead of216. Lighthouse performance58; LCP3620ms. See [Prebuilt cabin investigation](docs/PREBUILT_CABIN_OPTIMIZATION.md). Mobile startup still fails the release budget. Latest validation:22 tests pass and56 Astro files have zero diagnostics. The historical audit figures below predate this follow-up.

24 October 2026 · Astro 7.4.2 · static output · no server adapter · React 19.2.4 · Three.js 0.186.1 / R3F 9.8.2 / Drei 10.7.9. Astro check: 40 files, no diagnostics. All 15 unit tests pass. Static build passes with the existing >500kB scene-chunk warning.

**Release verdict: the 3D workshop fails the mobile startup performance budget.** The text edition passes. The current build is prepared for https://www.aayanamir.tech but has not been deployed.

## Score

Heuristic source-audit score: **92/100 (excellent under the skill rubric)**. This is 100 minus one open high-severity finding (8 points); it is not a Lighthouse performance score, accessibility certification or launch approval. Previous: n/a.

| Category | Score | Critical | High | Medium | Low |
| --- | ---: | ---: | ---: | ---: | ---: |
| Architecture | 100 | 0 | 0 | 0 | 0 |
| Performance | 92 | 0 | 1 | 0 | 0 |
| SEO | 100 | 0 | 0 | 0 | 0 |
| Accessibility | 100 | 0 | 0 | 0 | 0 |
| Security | 100 | 0 | 0 | 0 | 0 |

## Priority matrix

| Bucket | ID | Finding | Effort | Impact | Fix with |
| --- | --- | --- | --- | --- | --- |
| High | F1 | Mobile cold startup blocks the main thread; median performance 49 | L | High | threejs-performance, astro-perf |

Open counts: Critical 0, High 1, Medium 0, Quick win 0. Unrun hardware/deployment checks below are release gates, not silently counted as passes.

## Top 3 next steps

1. Profile and reduce cold 3D construction/shader work — F1; prioritize prebuilt/shared meshes and staged or asynchronous preparation. This resolves the remaining eight-point source penalty only after measurements pass, not merely after refactoring.
2. Re-run on representative Android/iOS hardware with camera movement, memory pressure, context loss/recovery, tab visibility and audio. Also perform screen-reader and text-zoom checks.
3. When publication is authorized, deploy dist to the confirmed domain and verify actual asset caching, TLS, canonical/social metadata and crawler endpoints. GitHub Pages controls response headers.

## Findings

### F1 · performance.mobile-startup-blocking · high · performance

- **Where:** src/scene/Room.tsx (scene construction/render initialization), src/scene/Primitives.tsx (procedural meshes); evidence output/audit/audited-home-{1,2,3}.report.json.
- **Evidence:** median mobile Lighthouse performance 49; LCP 3530ms; TBT 11765ms. Individual TBT observations 11764.5, 13662 and 10121.5ms. The 1,029,336-byte scene chunk (275,735 local-gzip bytes) contains the 3D runtime and scene code. The lab traces attribute major startup tasks to Room and React client work. A trace URL attribution is not a function-level CPU profile or measured GPU time.
- **Fix:** profile the cold frame, split/prepare geometry and shader work, and test shared/prebuilt assets and asynchronous warm-up without withholding 3D merely to hide it from the audit. Preserve native information access during preparation.
- **Effort / impact:** L / high.
- **How we would know this failed:** three cold mobile Lighthouse runs must meet the documented median budget (performance >=90, LCP <=2.5s, TBT <=200ms, CLS <=0.1). Then verify physical phones. Current results fail; do not claim mobile production readiness.

## Applied fixes and verification

| Root cause | Change | Evidence |
| --- | --- | --- |
| Shallow/generic case studies | Shared source-backed case studies with contributions, delivered capabilities, decisions and limits | All three current GitHub READMEs fetched; docs/PROJECT_SOURCES.md records blob SHAs. Dialog and static text edition share CaseStudy. No invented metrics/screenshots. |
| Repeated offscreen lighting/shadow passes | Memoized CabinEnvironment and GroundShadow | Installed Drei source confirms children/frame-counter rerender behavior. All nine arrivals observed about 282–290 calls rather than prior roughly doubled transient counts. Scene lighting retained by visual review. |
| Expensive extruded bevel construction | Three RoundedBoxGeometry with stable scalar memo keys and explicit disposal | Production build and scene visual review pass; rounded hull/equipment appearance retained. This alone did not meet startup budget. |
| Recursive instrument hover picking | Dedicated box interaction proxies | Physical clicks on NoClash, Student Portal and NoTerm opened the matching full case; drag did not open a case. |
| Oversized Earth texture | 2048x1024 derivative, 279867 bytes, original retained/credited | HTTP image/jpeg 200; all nine planet textures ready; three-entry cache plateau 19 textures. Estimated Earth RGBA+mip storage falls from about42.7MiB to10.7MiB; not a measured GPU allocation. |
| Optional chunk failures escaped root | Local error boundaries for star map and project examples | Isolated fault server returned503 for both lazy chunks. Map fallback retained selector; failed demo retained full case and source link. |
| Scene lacked retry control | Failed-scene boundary remount/reset path | Source checked and type/build verified. Actual WebGL context-loss injection was not run. |
| Work-log contrast | Dark result text on light info panels | Source pair corrected; About Lighthouse accessibility100. |
| Text-edition eyebrow contrast | Darker text on paper | Initial /read audit92 identified4.39:1; all final /read runs100. |
| Vertical drag lacked pointer equivalent | Native Look up/down buttons | Pointer clicks changed pitch; original left/right and keyboard/drag bounds retained. |
| Missing SEO/discovery metadata | Confirmed site origin, shared canonical/OG/Twitter,1200x630 preview, robots/sitemap | Built / and /read each contain one absolute canonical without scene queries. Sitemap includes only / and /read. 404 remains noindex. HTTP/mime checks pass. |
| Stale hosting/docs | README updated; CNAME/.nojekyll emitted | dist files checked, correct domain. Header template explicitly documented as ineffective on GitHub Pages. |

## Measured lab results

Chrome154 headless on Windows, Lighthouse mobile defaults (412x823, DPR1.75, simulated mobile network and4xCPU). Same local production-preview origin, no deployment CDN. Three sequential runs per final route. Ambient local browser/OS workload and headless WebGL vary; these are not real-phone GPU benchmarks.

| Route/run group | Performance | Accessibility | Best practices | SEO | LCP ms | TBT ms | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Workshop before, single baseline | 49 | 100 | 100 | 100 | 3514 | 14740 | 0.00092 |
| Workshop final, median3 | 49 | 100 | 100 | 100 | 3530 | 11765 | 0.00092 |
| Text edition final, median3 | 100 | 100 | 100 | 100 | 1215 | 0 | 0.01332 |

Startup blocking decreased in these observations, but baseline was one run and the score did not improve. No reliable aggregate performance gain or FPS claim follows. An intermediate three-run group scored50–52, reinforcing the need to report variability rather than selecting the best run.

All three case-study dialogs and About scored100 in separate Lighthouse accessibility runs. This automated result does not establish full WCAG conformance. The final tiny CSS change only wraps map badges below350px; Lighthouse's412px fixtures do not exercise that rule.

## Browser / delivery checks

- Checked production preview at desktop1440x900, phone390x844 and map320x740. Case/read access, scroll, map focus, Escape and focus restoration checked. No document horizontal overflow in checked phone/map states. The final320px map check confirmed wrap behavior for visited/current badges. Narrow map badges were adjusted to wrap.
- Physical model clicks opened all three matching cases; keyboard/dialog focus remained in the open dialog. Camera direction, vertical buttons, drag-versus-click behavior checked.
- All nine destinations reached ready/settled; repeated visits plateaued at19 textures. Still mode stops ambient time. Missing Neptune texture produced simplified scenery; switching to Mars recovered normally.
- HTTP200 and appropriate MIME for HTML, crawler endpoints, images and resume. Resume101443bytes SHA256 f3a38fd9240b0ad3f731f9f33cd66ed1cef35798beb0d01d18af26b93f6fabcc matches the supplied file. Built internal asset references exist. /read contains no hydrated island and serves full content without WebGL.
- npm audit reports0 vulnerabilities across411 reported dependencies. Installed React/Three versions are deduplicated. Source review found no credential usage, eval or raw-HTML sinks in this static app. This is not an exhaustive penetration test or secret scan.
- Actual https://www.aayanamir.tech/ returned200 overHTTPS, served byGitHub.com with Cache-Control:max-age=600 and old title Aayan Amir | .NET Systems Engineer. Live /robots.txt returned404. These observations concern the older deployed site, not this local build. No external site was modified.

## Rejected scanner findings

| Rule | Location | Decision |
| --- | --- | --- |
| islands.client-load | src/pages/index.astro | Reject blanket deferral: the single island is the above-fold interactive experience. Scene and optional map/examples are already lazy. Optimize measured work rather than delaying the product to evade an audit. |
| config.missing-site, config.no-sitemap, seo.no-canonical, seo.no-robots | Config/pages | Confirmed initially, now fixed and emitted build verified. |

## Method / artifacts / limits

One deterministic Astro scanner run, then five specialist roles reviewed across three parallel reviewers (architecture+security, performance, SEO+accessibility), fitting the available agent slots. Findings were deduplicated, then fixes applied and verified separately. Installed dependency source was used for version-specific rendering behavior.

Reports: output/audit/baseline-home.report.{json,html}; audited-home-{1,2,3}.report.{json,html}; audited-read-{1,2,3}.json; dialog-{about,work-noclash,work-student-portal,work-noterm}.json; astro-scan.json; http-checks.json; summary.json. Generated output remains ignored.

Commands: npm run check; npm test; npm run build; npm audit --json. Lighthouse command: npx --yes lighthouse http://127.0.0.1:4321/ --chrome-flags="--headless=new --disable-dev-shm-usage" --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=output/audit/audited-home-1 --quiet (CHROME_PATH points to installed GoogleChrome). Repeated with run suffixes and /read; dialog audits used their direct section/project query and accessibility category only.

Not run: physical Android/iOS/GPU testing; a screen-reader session; actual200%browser text zoom; subjective audio listening; hidden-tab audio recording; forced WebGL context loss/recovery; blocked-storage fault injection; deployed-new-build CDN headers and social-preview validator. None is marked passed from source or compilation. The source-audit score is not a substitute for these checks or the failed mobile budget.

## Evening-mode removal follow-up — 24 October 2026

Removed the evening mode, its native control and interactive wall switch, preference reads/writes, conditional environment/hull-light branches and per-frame cabin-light interpolation. The single working-light setup remains static; destination-specific treatments remain independent. Previous lighting-mode checks and Lighthouse figures above describe the earlier build.

Verification: Astro check (40 files, zero diagnostics), all15 unit tests and production build pass. Browser settings contain no lighting-mode button; fixed working lighting and Sun/Neptune arrivals work, with no browser errors. Room chunk is1028307bytes raw/275458local-gzip, Workshop30143/10592. Combined compressed reduction versus the audited build is363bytes. This removal simplifies runtime work but is not evidence that the mobile startup budget now passes; Lighthouse was not rerun for this small removal.
