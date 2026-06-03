/**
 * Cinematic agent-desk script for the public Core playground.
 * No external APIs — proves ValenGateway-shaped hooks + spatial cards in motion.
 */

export const LIVE_AGENT_DESK_VERSION = "1.0.0";

export function emptyAgentDeskState() {
  return {
    version: LIVE_AGENT_DESK_VERSION,
    running: false,
    stepIndex: 0,
    startedAt: null,
    completedAt: null,
    label: "idle",
    sculpturePulse: 0,
    agentPhase: "idle"
  };
}

/** @returns {{ cards: object[], report: object, done: boolean, label: string }} */
export function liveAgentDeskStep(state = {}, profile = {}) {
  const step = Number(state.stepIndex || 0);
  const name = profile.operatorName || "Operator";
  const builder = profile.builderName || "Eric";
  const company = profile.companyName || "eRock";

  const steps = [
    {
      label: "agent_online",
      agentPhase: "boot",
      sculpturePulse: 0.35,
      cards: [
        {
          id: "agent-desk-ping",
          card_type: "work_object",
          status: "focused",
          priority: 100,
          title: "Agent desk online",
          spatial_state: { space: "foreground", cluster: "agent-desk" },
          card_data: {
            title: "Agent desk online",
            body: `${company} gateway attached to Core. William — this is Milestone 2 running locally.`,
            next_action: "Watch",
            meta: "VALENGATEWAY · LIVE"
          }
        }
      ],
      report: {
        phase: "WorkspaceMode",
        scene: "card13",
        agentDeskActive: true,
        agentPhase: "boot",
        sculpturePulse: 0.35,
        message: "Gateway connected. Spatial loop armed."
      }
    },
    {
      label: "scanning_workspace",
      agentPhase: "thinking",
      sculpturePulse: 0.55,
      cards: [
        {
          id: "agent-desk-ping",
          status: "kept",
          spatial_state: { space: "orbit", cluster: "agent-desk" },
          card_data: {
            title: "Agent desk online",
            body: "Session scoped. Reading local card topology…",
            next_action: "Orbit"
          }
        },
        {
          id: "agent-desk-scan",
          card_type: "work_object",
          status: "focused",
          priority: 90,
          title: "Scanning workspace",
          spatial_state: { space: "foreground", cluster: "agent-desk" },
          card_data: {
            title: "Scanning workspace",
            body: "Mapping foreground slots (card13–16), orbit capacity, and hook latency.",
            next_action: "Observe",
            metrics: { hooks_ms: 4, cards_visible: 2 }
          }
        }
      ],
      report: {
        agentPhase: "thinking",
        sculpturePulse: 0.55,
        message: "Analyzing spatial layout…"
      }
    },
    {
      label: "running_capability",
      agentPhase: "acting",
      sculpturePulse: 0.82,
      cards: [
        {
          id: "agent-desk-scan",
          status: "kept",
          spatial_state: { space: "orbit", cluster: "agent-desk" }
        },
        {
          id: "agent-desk-task",
          card_type: "work_object",
          status: "focused",
          priority: 95,
          title: "Running: manage_valen_hooks",
          spatial_state: { space: "foreground", cluster: "agent-desk" },
          card_data: {
            title: "Running: manage_valen_hooks",
            body: [
              `Operator ${name} queued capability work.`,
              "Register tool wrapper → bodyMapping → queue-and-poll.",
              "Bridge: localhost hooks only (no hosted token)."
            ].join("\n"),
            next_action: "Stream",
            stream: [
              "▸ register_hook(agent_desk)",
              "▸ map_tool(run_local_capability)",
              "▸ poll_card_loop()"
            ]
          }
        }
      ],
      report: {
        agentPhase: "acting",
        sculpturePulse: 0.82,
        message: "Executing capability on local gateway…"
      }
    },
    {
      label: "awaiting_approval",
      agentPhase: "waiting_approval",
      sculpturePulse: 0.65,
      cards: [
        {
          id: "agent-desk-task",
          status: "kept",
          spatial_state: { space: "orbit", cluster: "agent-desk" }
        },
        {
          id: "agent-desk-approve",
          card_type: "approval",
          status: "focused",
          priority: 98,
          title: "Approve gateway publish?",
          spatial_state: { space: "foreground", cluster: "agent-desk" },
          card_data: {
            title: "Approve gateway publish?",
            body: `${builder} proposes upstreaming Live Agent Desk as ValenGateway proof. Private IP stays outside the repo.`,
            next_action: "Approve",
            actions: ["Approve", "Keep orbiting", "Dismiss"]
          }
        }
      ],
      report: {
        agentPhase: "waiting_approval",
        sculpturePulse: 0.65,
        message: "Waiting for human approval on card surface…"
      }
    },
    {
      label: "complete",
      agentPhase: "complete",
      sculpturePulse: 0.4,
      cards: [
        {
          id: "agent-desk-approve",
          status: "approved",
          spatial_state: { space: "orbit", cluster: "agent-desk" },
          card_data: {
            title: "Approved",
            body: "Gateway path verified. Cards orbit; sculpture returns to idle breathe.",
            approval_state: "approved"
          }
        },
        {
          id: "agent-desk-summary",
          card_type: "work_object",
          status: "focused",
          priority: 88,
          title: "Desk run complete",
          spatial_state: { space: "foreground", cluster: "agent-desk" },
          card_data: {
            title: "Desk run complete",
            body: [
              "✓ Hooks: start-live-agent-desk, tick-live-agent-desk",
              "✓ Cards: create → orbit → approve",
              "✓ Spatial UI reacted frame-to-frame",
              "",
              `${name} — ${builder} shipped Milestone 2 on public Core ahead of roadmap.`,
              `Call ${builder} when you want this on the private tree.`
            ].join("\n"),
            next_action: `Call ${builder}`
          }
        }
      ],
      report: {
        agentPhase: "complete",
        sculpturePulse: 0.4,
        message: "Live Agent Desk finished. Ready for upstream PR."
      }
    }
  ];

  if (step >= steps.length) {
    return {
      cards: [],
      report: {
        agentDeskActive: false,
        agentPhase: "idle",
        sculpturePulse: 0,
        message: "Desk idle"
      },
      done: true,
      label: "done"
    };
  }

  const current = steps[step];
  return {
    cards: current.cards,
    report: {
      phase: "WorkspaceMode",
      scene: "card13",
      agentDeskActive: true,
      agentPhase: current.agentPhase,
      sculpturePulse: current.sculpturePulse,
      step: step + 1,
      stepsTotal: steps.length,
      label: current.label,
      message: current.report.message
    },
    done: false,
    label: current.label
  };
}

export function advanceAgentDeskState(state = {}) {
  const next = {
    ...emptyAgentDeskState(),
    ...state,
    stepIndex: Number(state.stepIndex || 0) + 1
  };
  if (state.running && !state.startedAt) next.startedAt = new Date().toISOString();
  return next;
}