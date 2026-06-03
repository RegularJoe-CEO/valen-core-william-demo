/**
 * William demo — DOM + hooks only. No WebGL, no Three.js, no VALEN boot noise.
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") !== "william" && params.get("agentDesk") !== "1") return;

  document.documentElement.dataset.valenDemoWilliam = "1";
  document.body.classList.add("william-dom-only", "no-webgl", "agent-desk-showcase-open");
  document.body.classList.remove("runtime-booting");

  const ACTS = {
    agent_online: {
      title: "ValenGateway connected",
      body: "Local hooks live at /api/hooks/execute/local-core/{hook}"
    },
    scanning_workspace: {
      title: "Agent is thinking",
      body: "Scanning foreground vs orbit card slots."
    },
    running_capability: {
      title: "Agent is acting",
      body: "Executing capability on the gateway."
    },
    awaiting_approval: {
      title: "Approval on card surface",
      body: "Human-in-the-loop before upstream publish."
    },
    complete: {
      title: "Desk run complete",
      body: "Milestone 2 proof done. Call Eric for the private tree."
    }
  };

  const HOOK_BASE = "/api/hooks/execute/local-core/";
  const TICK_MS = 1100;
  let sessionId = "";
  let running = false;

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

  async function callHook(hook, body) {
    const response = await fetch(HOOK_BASE + encodeURIComponent(hook), {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sessionId, ...body })
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      data = { error: text || "invalid_json" };
    }
    if (!response.ok) throw new Error(data.error || data.detail || response.statusText);
    return data;
  }

  function mergeCards(result) {
    return []
      .concat(result.foreground || [], result.orbit || [], result.cards || [], result.visibleCards || []);
  }

  function cardLine(cards) {
    const focused =
      cards.find((c) => c.status === "focused" || c.status === "pending") || cards[0];
    if (!focused) return "";
    const data = focused.card_data || focused.cardData || {};
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
      timingEl.textContent = "~" + Math.ceil(remaining * 1.1) + "s remaining";
    }
    if (phaseEl) phaseEl.textContent = report.agentPhase || "idle";
    if (stepEl && step && total) stepEl.textContent = step + " / " + total;
    if (statusEl) statusEl.textContent = report.message || label;
    if (footEl && (label === "complete" || report.agentPhase === "complete")) {
      footEl.textContent = "William — call Eric when you want this on the private tree.";
    }

    const feed = document.getElementById("showcase-feed");
    if (feed && cards.length) {
      feed.innerHTML = cards
        .slice(0, 4)
        .map((c) => {
          const d = c.card_data || c.cardData || {};
          const space = (c.spatial_state && c.spatial_state.space) || "?";
          return (
            '<li><strong>' +
            (d.title || c.title || c.id) +
            "</strong> <em>(" +
            space +
            ")</em></li>"
          );
        })
        .join("");
    }
  }

  async function runDesk() {
    if (running) return;
    running = true;
    document.body.dataset.valenDeskStarted = "1";
    sessionId = readSessionId();

    const bootHint = document.getElementById("boot-hint");
    if (bootHint) bootHint.style.display = "none";

    try {
      const start = await callHook("start-live-agent-desk", {
        operatorName: "William",
        builderName: "Eric",
        companyName: "eRock"
      });
      updatePanel(start.latestRuntimeReport || start, mergeCards(start));

      let done = false;
      let guard = 0;
      while (!done && guard < 8) {
        guard += 1;
        await new Promise((r) => window.setTimeout(r, TICK_MS));
        const tick = await callHook("tick-live-agent-desk", {});
        done = Boolean(tick.done);
        updatePanel(tick.latestRuntimeReport || tick, mergeCards(tick));
        if (done) {
          if (document.getElementById("showcase-title")) {
            document.getElementById("showcase-title").textContent = "Live Agent Desk complete";
          }
          if (document.getElementById("agent-desk-status")) {
            document.getElementById("agent-desk-status").textContent = "Complete — Eric is on the line.";
          }
        }
      }
    } catch (error) {
      console.error("[William standalone desk]", error);
      const statusEl = document.getElementById("agent-desk-status");
      if (statusEl) statusEl.textContent = "Error: " + error.message;
      const timingEl = document.getElementById("showcase-timing");
      if (timingEl) timingEl.textContent = "Desk failed — is the server running? (npm run demo:william)";
    } finally {
      running = false;
    }
  }

  function wireLaunch() {
    const btn = document.getElementById("launch-agent-desk");
    if (btn) btn.addEventListener("click", () => runDesk());
  }

  wireLaunch();
  window.valenWilliamDesk = { run: runDesk, callHook };

  window.addEventListener("load", () => {
    window.setTimeout(runDesk, 400);
  });
})();