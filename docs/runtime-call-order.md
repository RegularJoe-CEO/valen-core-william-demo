# Public Runtime Call Order

This is a navigation guide, not a promise that the browser executes every file
in one straight line. Core branches after boot. Use the numbered module buckets
to find the smallest owner for a feature or bug.

## Local Playground Path

```mermaid
flowchart TD
  Host["runtime/public/index.html<br/>local playground host"]
  Dist["runtime/dist/runtime.js<br/>generated local bundle"]
  Source["runtime/src/runtime.js<br/>editable bundle entry"]
  Build["runtime build"]
  Boot["01 bootRuntimeApp() and local state"]
  Scenes["02 neutral scene composition"]
  Assets["03 asset loading and Three.js setup"]
  Supporting["04 sculpture, effects,<br/>audio, and boot signal"]
  Panels["05 card panels"]
  Interaction["06 input and interaction"]
  Loop["07 motion, camera, scroll,<br/>and render loop"]
  Cards["08 local workspace"]
  Gateway["09 local ValenGateway bridge<br/>and contracts"]
  Store["persistent local JSON card loop"]

  Host --> Dist
  Source -. "bundles to" .-> Build
  Build -. "produces" .-> Dist
  Dist --> Boot
  Source --> Boot
  Boot --> Scenes
  Boot --> Assets
  Boot --> Interaction
  Boot --> Loop
  Loop --> Supporting
  Loop --> Panels
  Interaction --> Cards
  Interaction --> Gateway
  Gateway --> Store
```

## First Files To Read

1. `../runtime/public/index.html`
2. `../runtime/src/runtime.js`
3. `../runtime/src/boot-runtime-app/boot-runtime-app.js`
4. `../runtime/src/boot-runtime-app/start-runtime-renderer.js`
5. `../runtime/src/boot-runtime-app/install-valen-runtime-global.js`

After those five, follow the numbered bucket that owns the change. Do not read
the generated `../runtime/dist/runtime.js` top to bottom first.
