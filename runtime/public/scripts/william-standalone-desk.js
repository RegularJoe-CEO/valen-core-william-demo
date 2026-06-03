/**
 * William demo — DOM timeline + hooks (hooks are best-effort; UI never blocks on them).
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") !== "william" && params.get("agentDesk") !== "1") return;

  document.documentElement.dataset.valenDemoWilliam = "1";
  document.body.classList.add("william-dom-only", "no-webgl", "agent-desk-showcase-open");
  document.body.classList.remove("runtime-booting");

  const HOOK_BASE = "/api/hooks/execute/local-core/";
  const STEP_MS = 1000;
  const HOOK_TIMEOUT_MS = 2500;
  const STREAM_LINES = [
    "▸ register_hook(agent_desk)",
    "▸ map_tool(run_local_capability)",
    "▸ poll_card_loop()"
  ];

  const ACTS = {
    agent_online: { title: "ValenGateway connected", body: "Local hooks live — same paths as production." },
    scanning_workspace: { title: "Agent is thinking", body: "Scanning foreground vs orbit slots." },
    running_capability: { title: "Running manage_valen_hooks", body: "Registering tool wrapper → bodyMapping → queue-and-poll." },
    awaiting_approval: { title: "Approval on card surface", body: "Human-in-the-loop before upstream publish." },
    complete: { title: "Desk run complete", body: "Milestone 2 proof done. Call Eric for the private tree." }
  };

  /** Client-owned timeline — never blocks on server ticks */
  const DEMO_STEPS = [
    {
      label: "agent_online",
      report: {
        step: 1,
        stepsTotal: 5,
        agentPhase: "boot",
        agentDeskActive: true,
        label: "agent_online",
        message: "Gateway connected. Spatial loop armed."
      },
      cards: [{ title: "Agent desk online", status: "focused", spatial_state: { space: "foreground" } }]
    },
    {
      label: "scanning_workspace",
      report: {
        step: 2,
        stepsTotal: 5,
        agentPhase: "thinking",
        agentDeskActive: true,
        label: "scanning_workspace",
        message: "Analyzing spatial layout…"
      },
      cards: [
        { title: "Agent desk online", status: "kept", spatial_state: { space: "orbit" } },
        { title: "Scanning workspace", status: "focused", spatial_state: { space: "foreground" } }
      ]
    },
    {
      label: "running_capability",
      report: {
        step: 3,
        stepsTotal: 5,
        agentPhase: "acting",
        agentDeskActive: true,
        label: "running_capability",
        message: "Executing manage_valen_hooks on local gateway…"
      },
      cards: [
        { title: "Scanning workspace", status: "kept", spatial_state: { space: "orbit" } },
        {
          title: "Running: manage_valen_hooks",
          status: "focused",
          spatial_state: { space: "foreground" },
          card_data: { title: "Running: manage_valen_hooks", body: "Streaming hook registration…" }
        }
      ],
      animateStream: true
    },
    {
      label: "awaiting_approval",
      report: {
        step: 4,
        stepsTotal: 5,
        agentPhase: "waiting_approval",
        agentDeskActive: true,
        label: "awaiting_approval",
        message: "Waiting for human approval on card surface…"
      },
      cards: [
        { title: "Running: manage_valen_hooks", status: "kept", spatial_state: { space: "orbit" } },
        { title: "Approve gateway publish?", status: "focused", spatial_state: { space: "foreground" } }
      ]
    },
    {
      label: "complete",
      report: {
        step: 5,
        stepsTotal: 5,
        agentPhase: "complete",
        agentDeskActive: true,
        label: "complete",
        message: "Live Agent Desk finished. Ready for upstream PR.",
        done: true
      },
      cards: [
        { title: "Approved", status: "kept", spatial_state: { space: "orbit" } },
        { title: "Desk run complete", status: "focused", spatial_state: { space: "foreground" } }
      ]
    }
  ];

  let sessionId = "";
  let deskRun = 0;
  let activeRun = 0;

  function readSessionId() {
    try {
      const stored = window.localStorage.getItem("valen_runtime_session_id");
      if (stored && /^\d+$/.test(stored)) return stored;
    } catch (_) {}
    const next = String(100000 + Math.floor(Math.random() * 899999));
    try {
      window.localStorage.setItem("valen_runtime_session_id", next);
    } catch (_) {}
    return next;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function callHook(hook, body) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), HOOK_TIMEOUT_MS);
    return fetch(HOOK_BASE + encodeURIComponent(hook), {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sessionId, ...body }),
      signal: controller.signal
    })
      .then(async (response) => {
        window.clearTimeout(timer);
        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (_) {
          data = { error: text };
        }
        if (!response.ok) throw new Error(data.error || response.statusText);
        return data;
      })
      .catch((error) => {
        window.clearTimeout(timer);
        console.warn("[William desk] hook", hook, error.message || error);
        return null;
      });
  }

  function cardLine(cards) {
    const focused = cards.find((c) => c.status === "focused" || c.status === "pending") || cards[0];
    if (!focused) return "";
    const data = focused.card_data || {};
    const title = data.title || focused.title || "Work object";
    const body = String(data.body || "").split("\n")[0];
    return body ? title + " — " + body : title;
  }

  function updatePanel(report, cards) {
    const label = String(report.label || report.agentPhase || "idle");
    const act = ACTS[label] || ACTS[report.agentPhase];
    const step = Number(report.step || 0);
    const total = Number(report.stepsTotal || 5);
    const pct = total > 0 ? Math.round((step / total) * 100) : 0;

    const titleEl = document.getElementById("showcase-title");
    const bodyEl = document.getElementById("showcase-body");
    const cardEl = document.getElementById("showcase-card");
    const metaEl = document.getElementById("showcase-meta");
    const barEl = document.getElementById("showcase-progress-bar");
    const timingEl = document.getElementById("showcase-timing");
    const footEl = document.getElementById("showcase-foot");
    const phaseEl = document.getElementById("agent-desk-phase");
    const stepEl = document.getElementById("agent-desk-step");
    const statusEl = document.getElementById("agent-desk-status");

    if (titleEl) titleEl.textContent = act?.title || report.message || label;
    if (bodyEl) bodyEl.textContent = act?.body || report.message || "";
    if (cardEl) {
      const line = cardLine(cards);
      cardEl.textContent = line ? "Foreground card: " + line : "";
      cardEl.hidden = !line;
    }
    if (metaEl) {
      metaEl.textContent =
        step && total ? "Step " + step + " / " + total + " · " + label.replace(/_/g, " ") : "";
    }
    if (barEl) barEl.style.width = Math.max(8, pct) + "%";
    if (timingEl && step && total) {
      const remaining = Math.max(0, total - step);
      timingEl.textContent = remaining ? "~" + Math.ceil(remaining * (STEP_MS / 1000)) + "s remaining" : "Done.";
    }
    if (phaseEl) phaseEl.textContent = report.agentPhase || "idle";
    if (stepEl && step && total) stepEl.textContent = step + " / " + total;
    if (statusEl) statusEl.textContent = report.message || label;

    const feed = document.getElementById("showcase-feed");
    if (feed) {
      feed.innerHTML = cards
        .map((c) => {
          const d = c.card_data || {};
          const space = (c.spatial_state && c.spatial_state.space) || "?";
          return (
            "<li><strong>" +
            (d.title || c.title || "card") +
            "</strong> <em>(" +
            space +
            ")</em></li>"
          );
        })
        .join("");
    }

    if (footEl && label === "complete") {
      footEl.textContent = "William — call Eric when you want this on the private tree.";
    }
  }

  async function animateStreamLines(bodyEl) {
    if (!bodyEl) return;
    const base = ACTS.running_capability.body;
    for (let i = 0; i < STREAM_LINES.length; i += 1) {
      bodyEl.textContent = base + "\n" + STREAM_LINES.slice(0, i + 1).join("\n");
      await sleep(380);
    }
  }

  async function runDesk() {
    const runId = ++deskRun;
    activeRun = runId;
    sessionId = readSessionId();
    document.body.dataset.valenDeskStarted = "1";

    const bootHint = document.getElementById("boot-hint");
    if (bootHint) bootHint.style.display = "none";

    void callHook("start-live-agent-desk", {
      operatorName: "William",
      builderName: "Eric",
      companyName: "eRock"
    });

    try {
      for (const frame of DEMO_STEPS) {
        if (activeRun !== runId) return;
        updatePanel(frame.report, frame.cards);
        void callHook("tick-live-agent-desk", {});

        if (frame.animateStream) {
          await animateStreamLines(document.getElementById("showcase-body"));
        }
        await sleep(STEP_MS);
      }

      if (activeRun !== runId) return;
      const titleEl = document.getElementById("showcase-title");
      const statusEl = document.getElementById("agent-desk-status");
      const timingEl = document.getElementById("showcase-timing");
      if (titleEl) titleEl.textContent = "Live Agent Desk complete";
      if (statusEl) statusEl.textContent = "Complete — Eric is on the line.";
      if (timingEl) timingEl.textContent = "Done — full run took ~6s.";
      document.getElementById("showcase-progress-bar").style.width = "100%";

      void callHook("tick-live-agent-desk", {});
    } catch (error) {
      console.error("[William desk]", error);
      const statusEl = document.getElementById("agent-desk-status");
      if (statusEl) statusEl.textContent = "Error: " + error.message;
    }
  }

  document.getElementById("launch-agent-desk")?.addEventListener("click", () => runDesk());
  window.valenWilliamDesk = { run: runDesk };

  window.addEventListener("load", () => {
    window.setTimeout(runDesk, 300);
  });
})();