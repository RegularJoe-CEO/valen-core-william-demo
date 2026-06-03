# Live Agent Desk — for William

**William** (@willrob-valensdad) — this fork ships **Milestone 2 early**: a real local **ValenGateway** hook loop that drives your spatial cards while Core runs.

## 60-second demo

From repo root:

```bash
npm run demo:william
# or: bash scripts/william-demo.sh
```

Open: **http://localhost:9252/?demo=william**

Or click **Launch Live Agent Desk** in the top bar.

## What you'll see

1. Cards appear and **move foreground → orbit** as an agent script runs (no cloud, no token).
2. Diagnostics show **agent phase** (boot → thinking → acting → approval → complete).
3. **Audio** ramps with desk pulse (toggle speaker icon).
4. Final card says: gateway verified, ready for private tree.

## Hooks implemented (public local harness)

| Hook | Purpose |
|------|---------|
| `manage-valen-hooks` | Lists gateway surface (M2 preview) |
| `start-live-agent-desk` | Starts scripted agent run |
| `tick-live-agent-desk` | Advances script + upserts cards |
| `get-live-agent-desk-status` | Desk state + runtime truth |

Same URL shape as production: `/api/hooks/execute/{spaceId}/{hook}`

## IP boundary

- **In this repo:** gateway orchestration, card choreography, UI, proofs.
- **Not in this repo:** proprietary engines, patents, hosted backend.

Built by **Eric** (eRock) as a contribution path toward Valen Systems — happy to upstream PRs or discuss private repo access.

## Proof

```bash
npm run proof:agent-desk
```