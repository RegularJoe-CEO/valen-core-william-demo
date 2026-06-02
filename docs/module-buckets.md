# Public Runtime Module Buckets

These buckets group public runtime code by ownership. The numbers are an
approximate reading order for feature work and bug hunting, not a rigid
execution sequence.

Onboarding categories are separate. They explain how contributors learn,
prove, publish, and collaborate. These buckets answer a narrower question:
which runtime owner should change?

| Bucket | Purpose | Main Paths |
| --- | --- | --- |
| `01` Local host entry, boot, and state | Load the playground, enter the runtime bundle, create the local app, and own observable state. | `runtime/public/index.html`, `runtime/src/runtime.js`, `runtime/src/boot-runtime-app`, `runtime/src/configure-runtime`, `runtime/src/own-runtime-state-and-dom` |
| `02` Neutral scene composition | Describe `WorkspaceMode`, spatial objects, active scenes, and local choreography. | `runtime/src/describe-runtime-scenes`, `runtime/src/choreograph-stage-state`, `runtime/src/select-runtime-scene` |
| `03` Asset loading and Three.js setup | Resolve assets, parse GLBs, install authored materials, and own the Three.js environment. | `runtime/src/load-runtime-assets`, `runtime/src/render-three-assets`, `runtime/assets` |
| `04` Sculpture, effects, audio, and boot signal | Own the center object, loading experience, reactive audio, and supporting visual effects. | `runtime/src/render-center-sculpture`, `runtime/src/draw-runtime-effects`, `runtime/src/play-runtime-audio`, `runtime/src/show-boot-signal`, `runtime/src/render-dom-overlay` |
| `05` Card panels | Render GLB-backed panels, copy regions, chat surfaces, controls, and hit zones. | `runtime/src/render-card-panels` |
| `06` Input and interaction | Translate pointer, touch, gyro, wheel, and card actions into runtime behavior. | `runtime/src/read-runtime-inputs`, `runtime/src/bind-local-workspace` |
| `07` Motion, camera, scroll, and render loop | Own frame scheduling, layer ordering, transitions, projection, and scroll-to-scene progress. | `runtime/src/animate-runtime-motion`, `runtime/src/fit-runtime-camera`, `runtime/src/calculate-runtime-values`, `runtime/src/convert-scroll-progress`, `runtime/src/run-render-loop` |
| `08` Local workspace | Parse local work objects, normalize lifecycle state, map foreground and orbit cards, and provide persistent fixtures. | `runtime/src/shape-runtime-cards`, `runtime/src/bind-local-workspace`, `runtime/scripts/local-valen-card-harness.mjs` |
| `09` Local ValenGateway bridge and contracts | Keep the local gateway boundary narrow and prove it with schemas, fixtures, and browser checks. | `runtime/src/call-valen-gateway`, `runtime/contracts`, `runtime/proof`, `runtime/scripts` |

Start with the smallest owning bucket. Follow
[runtime-call-order.md](runtime-call-order.md) when you need to understand how
that owner participates in the larger runtime.
