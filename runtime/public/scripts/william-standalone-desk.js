/**
 * William demo — spatial visual stage + hook storyboard (no WebGL).
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") !== "william" && params.get("agentDesk") !== "1") return;

  document.documentElement.dataset.valenDemoWilliam = "1";
  document.body.classList.add("william-dom-only", "no-webgl", "agent-desk-showcase-open");
  document.body.classList.remove("runtime-booting", "desk-run-complete");

  const HOOK_BASE = "/api/hooks/execute/local-core/";
  const STEP_MS = 1400;
  const HOOK_TIMEOUT_MS = 2500;
  const STREAM_LINES = [
    "▸ register_hook(agent_desk)",
    "▸ map_tool(run_local_capability)",
    "▸ poll_card_loop()"
  ];

  const ACTS = {
    agent_online: { title: "ValenGateway connected", body: "Gateway attached — cards can enter the spatial workspace." },
    scanning_workspace: { title: "Agent is thinking", body: "Watch the first card leave center and orbit." },
    running_capability: { title: "Running manage_valen_hooks", body: "Hook executes; foreground card updates in real time." },
    awaiting_approval: { title: "Approval on card surface", body: "Human-in-the-loop before anything publishes upstream." },
    complete: { title: "Desk run complete", body: "Five gateway steps, cards moved foreground ↔ orbit." }
  };

  const DEMO_STEPS = [
    {
      label: "agent_online",
      hook: "start-live-agent-desk",
      report: {
        step: 1,
        stepsTotal: 5,
        agentPhase: "boot",
        agentDeskActive: true,
        label: "agent_online",
        message: "Gateway connected. Spatial loop armed."
      },
      cards: [
        {
          id: "agent-desk-ping",
          title: "Agent desk online",
          status: "focused",
          spatial_state: { space: "foreground" }
        }
      ]
    },
    {
      label: "scanning_workspace",
      hook: "tick-live-agent-desk",
      report: {
        step: 2,
        stepsTotal: 5,
        agentPhase: "thinking",
        agentDeskActive: true,
        label: "scanning_workspace",
        message: "Analyzing spatial layout…"
      },
      cards: [
        {
          id: "agent-desk-ping",
          title: "Agent desk online",
          status: "kept",
          spatial_state: { space: "orbit" }
        },
        {
          id: "agent-desk-scan",
          title: "Scanning workspace",
          status: "focused",
          spatial_state: { space: "foreground" }
        }
      ]
    },
    {
      label: "running_capability",
      hook: "tick-live-agent-desk",
      report: {
        step: 3,
        stepsTotal: 5,
        agentPhase: "acting",
        agentDeskActive: true,
        label: "running_capability",
        message: "Executing manage_valen_hooks…"
      },
      cards: [
        {
          id: "agent-desk-scan",
          title: "Scanning workspace",
          status: "kept",
          spatial_state: { space: "orbit" }
        },
        {
          id: "agent-desk-task",
          title: "manage_valen_hooks",
          status: "focused",
          spatial_state: { space: "foreground" },
          card_data: { title: "manage_valen_hooks", body: "Streaming…" }
        }
      ],
      animateStream: true
    },
    {
      label: "awaiting_approval",
      hook: "tick-live-agent-desk",
      report: {
        step: 4,
        stepsTotal: 5,
        agentPhase: "waiting_approval",
        agentDeskActive: true,
        label: "awaiting_approval",
        message: "Waiting for approval on card surface…"
      },
      cards: [
        {
          id: "agent-desk-task",
          title: "manage_valen_hooks",
          status: "kept",
          spatial_state: { space: "orbit" }
        },
        {
          id: "agent-desk-approve",
          title: "Approve publish?",
          status: "focused",
          spatial_state: { space: "foreground" }
        }
      ]
    },
    {
      label: "complete",
      hook: "tick-live-agent-desk",
      report: {
        step: 5,
        stepsTotal: 5,
        agentPhase: "complete",
        agentDeskActive: true,
        label: "complete",
        message: "Live Agent Desk finished.",
        done: true
      },
      cards: [
        {
          id: "agent-desk-approve",
          title: "Approved",
          status: "kept",
          spatial_state: { space: "orbit" }
        },
        {
          id: "agent-desk-summary",
          title: "Desk complete",
          status: "focused",
          spatial_state: { space: "foreground" }
        }
      ]
    }
  ];

  let sessionId = "";
  let deskRun = 0;
  let activeRun = 0;
  const cardNodes = new Map();

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

  function orbitRadius() {
    return Math.min(168, Math.max(120, window.innerWidth * 0.22));
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

  function flashHook(hookName) {
    const el = document.getElementById("spatial-hook-flash");
    if (!el) return;
    el.hidden = false;
    el.textContent = "POST …/" + hookName;
    window.clearTimeout(flashHook._hideTimer);
    flashHook._hideTimer = window.setTimeout(() => {
      el.hidden = true;
    }, 1100);
  }

  function updateStepDots(step) {
    document.querySelectorAll("#spatial-step-dots span").forEach((dot, index) => {
      const n = index + 1;
      dot.classList.toggle("is-active", n === step);
      dot.classList.toggle("is-done", n < step);
    });
  }

  function updateSpatialStage(cards, phase) {
    const container = document.getElementById("spatial-cards");
    const sculpture = document.getElementById("spatial-sculpture");
    if (!container) return;
    if (sculpture) sculpture.dataset.phase = phase || "boot";

    const orbitCards = cards.filter((c) => (c.spatial_state && c.spatial_state.space) === "orbit");
    const seen = new Set();

    cards.forEach((card) => {
      const id = card.id || card.title;
      seen.add(id);
      let node = cardNodes.get(id);
      if (!node) {
        node = document.createElement("div");
        node.className = "spatial-card";
        node.dataset.cardId = id;
        container.appendChild(node);
        cardNodes.set(id, node);
        requestAnimationFrame(() => node.classList.add("is-visible"));
      }

      const space = (card.spatial_state && card.spatial_state.space) || "foreground";
      const isFocused = card.status === "focused" || card.status === "pending";
      node.textContent = card.title || id;
      node.className =
        "spatial-card is-visible spatial-card--" +
        space +
        (isFocused ? " spatial-card--focused" : "");

      if (space === "foreground") {
        node.style.left = "50%";
        node.style.top = "46%";
      } else {
        const orbitIndex = orbitCards.findIndex((c) => (c.id || c.title) === id);
        const angle = (orbitIndex / Math.max(1, orbitCards.length)) * Math.PI * 2 - Math.PI / 2;
        const r = orbitRadius();
        node.style.left = "calc(50% + " + Math.cos(angle) * r + "px)";
        node.style.top = "calc(46% + " + Math.sin(angle) * r + "px)";
      }
    });

    cardNodes.forEach((node, id) => {
      if (seen.has(id)) return;
      node.classList.add("spatial-card--exit");
      cardNodes.delete(id);
      window.setTimeout(() => node.remove(), 500);
    });
  }

  function updatePanel(report, cards) {
    const label = String(report.label || report.agentPhase || "idle");
    const act = ACTS[label] || ACTS[report.agentPhase];
    const step = Number(report.step || 0);
    const total = Number(report.stepsTotal || 5);
    const pct = total > 0 ? Math.min(100, Math.round((step / total) * 100)) : 0;

    updateSpatialStage(cards, report.agentPhase);
    updateStepDots(step);

    const titleEl = document.getElementById("showcase-title");
    const bodyEl = document.getElementById("showcase-body");
    const metaEl = document.getElementById("showcase-meta");
    const barEl = document.getElementById("showcase-progress-bar");
    const timingEl = document.getElementById("showcase-timing");
    const footEl = document.getElementById("showcase-foot");
    const phaseEl = document.getElementById("agent-desk-phase");
    const stepEl = document.getElementById("agent-desk-step");
    const statusEl = document.getElementById("agent-desk-status");

    if (titleEl) titleEl.textContent = act?.title || report.message || label;
    if (bodyEl) bodyEl.textContent = act?.body || report.message || "";
    if (metaEl) {
      metaEl.textContent =
        step && total ? "Step " + step + " / " + total + " · " + label.replace(/_/g, " ") : "";
    }
    if (barEl) barEl.style.width = Math.max(12, pct) + "%";
    if (timingEl) {
      if (step >= total) {
        timingEl.textContent = "Wrapping up…";
      } else {
        const stepsLeft = Math.max(1, total - step);
        timingEl.textContent = "~" + Math.ceil((stepsLeft * STEP_MS) / 1000) + "s left in run";
      }
    }
    if (phaseEl) phaseEl.textContent = report.agentPhase || "idle";
    if (stepEl && step && total) stepEl.textContent = step + " / " + total;
    if (statusEl) statusEl.textContent = report.message || label;

    const feed = document.getElementById("showcase-feed");
    if (feed) {
      feed.innerHTML = cards
        .map((c) => {
          const space = (c.spatial_state && c.spatial_state.space) || "?";
          const arrow = space === "orbit" ? "↗ orbit" : "● foreground";
          return "<li><strong>" + (c.title || c.id) + "</strong> <em>" + arrow + "</em></li>";
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
      await sleep(360);
    }
  }

  async function runDesk() {
    const runId = ++deskRun;
    activeRun = runId;
    sessionId = readSessionId();
    document.body.dataset.valenDeskStarted = "1";
    document.body.classList.remove("desk-run-complete");
    cardNodes.clear();
    const container = document.getElementById("spatial-cards");
    if (container) container.replaceChildren();

    const bootHint = document.getElementById("boot-hint");
    if (bootHint) bootHint.style.display = "none";

    try {
      for (const frame of DEMO_STEPS) {
        if (activeRun !== runId) return;

        flashHook(frame.hook || "tick-live-agent-desk");
        updatePanel(frame.report, frame.cards);
        void callHook(frame.hook || "tick-live-agent-desk", {
          operatorName: "William",
          builderName: "Eric",
          companyName: "eRock"
        });

        if (frame.animateStream) {
          await animateStreamLines(document.getElementById("showcase-body"));
        }
        await sleep(STEP_MS);
      }

      if (activeRun !== runId) return;

      document.body.classList.add("desk-run-complete");
      updateStepDots(6);

      const titleEl = document.getElementById("showcase-title");
      const statusEl = document.getElementById("agent-desk-status");
      const timingEl = document.getElementById("showcase-timing");
      const barEl = document.getElementById("showcase-progress-bar");
      if (titleEl) titleEl.textContent = "Live Agent Desk complete ✓";
      if (statusEl) statusEl.textContent = "Complete — Eric is on the line.";
      if (timingEl) timingEl.textContent = "Finished — replay below to show William again.";
      if (barEl) barEl.style.width = "100%";

      void callHook("tick-live-agent-desk", {});
    } catch (error) {
      console.error("[William desk]", error);
      const statusEl = document.getElementById("agent-desk-status");
      if (statusEl) statusEl.textContent = "Error: " + error.message;
    }
  }

  document.getElementById("launch-agent-desk")?.addEventListener("click", () => runDesk());
  document.getElementById("replay-agent-desk")?.addEventListener("click", () => runDesk());
  window.valenWilliamDesk = { run: runDesk };

  window.addEventListener("load", () => {
    window.setTimeout(runDesk, 400);
  });
})();