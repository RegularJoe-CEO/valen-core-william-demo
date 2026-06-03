# ValenGateway proof — for William

**William** (@willrob-valensdad) — one URL, one story. No Core boot noise.

## Run

```bash
npm run demo:william
```

Open: **http://localhost:9252/william-proof.html**

## What you'll see (~8 seconds)

**Left:** five plain-English steps (gateway → scan → run hooks → approve → done).

**Right:** one big **foreground** card (the active decision) and small **orbit** chips (context pushed back).

Real hooks still fire in the background (`start-live-agent-desk`, `tick-live-agent-desk`).

Ends with: **call Eric** for the private tree.

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