## Summary

Early **Milestone 2 preview**: local ValenGateway-shaped hooks that drive **foreground ↔ orbit** card choreography without manual clicks.

This PR stays inside the public Core boundary — scripted local harness, proof script, and a standalone DOM proof page (no WebGL boot required).

## Hooks

| Hook | Role |
|------|------|
| `start-live-agent-desk` | Begin a scripted agent-desk session |
| `tick-live-agent-desk` | Advance the run and upsert cards |
| `get-live-agent-desk-status` | Read desk + runtime truth |
| `stop-live-agent-desk` | Stop the run |

Same URL shape as production: `/api/hooks/execute/{spaceId}/{hook}`

## How to try it

```bash
npm install --prefix runtime
npm run check
npm --prefix runtime run proof:agent-desk
npm run demo:gateway
```

Open http://localhost:9252/gateway-proof.html — left panel explains steps; right panel shows cards moving with no clicks (~8s).

## Test plan

- [x] `npm run check`
- [x] `npm --prefix runtime run proof:agent-desk`
- [x] Manual: `npm run demo:gateway` → open `/gateway-proof.html`, confirm scripted motion

## Scope

**In:** local harness hooks, scripted desk steps, `proof:agent-desk`, `gateway-proof.html`, docs.

**Out:** hosted backend, private product logic, external inference engines.

## Context (M1 → M2)

Public Core today is a strong **manual spatial UI** (M1). This preview shows how an **agent runtime** could call gateway hooks and let cards move themselves (M2 direction) using the existing local hook loop.