# ValenGateway proof — for William

## The problem (Milestone 1)

Public Core today: cinematic spatial UI + local work-object cards — but **only humans** click Keep / Dismiss / Approve. There is no standard **agent orchestration** layer in the public tree yet.

## The improvement (Milestone 2 — this demo)

**ValenGateway**: HTTP hooks so an **AI agent runtime** can move work objects **foreground ↔ orbit** without someone driving the UI. Same hook URL shape as production (`/api/hooks/execute/{spaceId}/{hook}`), running on localhost.

**What William should recognize:** cards change on the right **with no clicks** — that is his spatial product model, now driven by hooks instead of manual play. Not a faster model; not hosted scale — **programmable spatial agent desk**.

## Run

```bash
npm run demo:william
```

**http://localhost:9252/william-proof.html** — read the M1 vs M2 banner first, then watch the right panel during the ~8s run.

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