# Runtime Source

`runtime.js` stays intentionally tiny. It imports `bootRuntimeApp()` and bundles
the extracted source lanes into one local `dist/runtime.js`.

Start with [../../docs/module-buckets.md](../../docs/module-buckets.md) to find
the smallest owner for a change. Use
[../../docs/runtime-call-order.md](../../docs/runtime-call-order.md) when you
need the larger call graph. The local-only replacement edges are:

- `bind-local-workspace/`
- `call-valen-gateway/`
- `describe-runtime-scenes/`
- `configure-runtime/`

The visual renderer lanes remain extracted from the private upstream runtime so
interface improvements can translate back cleanly.
