# Live Agent Desk — Milestone 2 gateway preview

Early local proof of **ValenGateway-shaped hooks** that orchestrate spatial work objects (foreground vs orbit) without manual card clicks.

## Problem (M1)

Public Core ships the cinematic renderer and a persistent local card loop, but agents cannot yet drive the workspace through a standard gateway in this repository.

## Improvement (M2 preview)

| Hook | Role |
|------|------|
| `start-live-agent-desk` | Begin a scripted agent-desk session |
| `tick-live-agent-desk` | Advance the run and upsert cards |
| `get-live-agent-desk-status` | Read desk + runtime truth |
| `stop-live-agent-desk` | Stop the run |
| `manage-valen-hooks` | List gateway surface (preview) |

Same URL shape as production: `/api/hooks/execute/{spaceId}/{hook}`

## Run the proof UI

```bash
npm install --prefix runtime
npm run demo:gateway
```

Open [http://localhost:9252/gateway-proof.html](http://localhost:9252/gateway-proof.html)

**Left:** plain-English steps. **Right:** foreground card + orbit chips updating with no clicks (~8s).

## Run proofs only

```bash
npm --prefix runtime run proof:agent-desk
npm run check
```

## Scope / boundary

- **In this PR:** local harness hooks, scripted desk steps, proof script, standalone proof page.
- **Not in this PR:** hosted backend, private product logic, proprietary inference engines.