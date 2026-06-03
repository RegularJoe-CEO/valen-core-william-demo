/**
 * DOM-first Live Agent Desk storyboard for ?demo=william.
 * William should read the narrative without parsing 3D cards.
 */

const ACTS = {
  agent_online: {
    title: "ValenGateway connected",
    body: "Local hooks are live. Same URL shape as production: /api/hooks/execute/{spaceId}/{hook}."
  },
  scanning_workspace: {
    title: "Agent is thinking",
    body: "Reading your spatial card layout — foreground vs orbit slots."
  },
  running_capability: {
    title: "Agent is acting",
    body: "Executing a capability on the gateway. Cards will move in 3D behind this panel."
  },
  awaiting_approval: {
    title: "Approval on the card surface",
    body: "Human-in-the-loop — approve before anything publishes upstream."
  },
  complete: {
    title: "Desk run complete",
    body: "Milestone 2 proof finished. Private IP stays outside this repo."
  }
};

function ensureShowcase() {
  let root = document.getElementById("agent-desk-showcase");
  if (root) return root;

  root = document.createElement("section");
  root.id = "agent-desk-showcase";
  root.className = "agent-desk-showcase";
  root.setAttribute("aria-live", "polite");
  root.innerHTML = `
    <p class="showcase-kicker">Live Agent Desk · ValenGateway M2 preview</p>
    <h2 class="showcase-title" id="showcase-title">Starting…</h2>
    <p class="showcase-body" id="showcase-body"></p>
    <p class="showcase-card" id="showcase-card"></p>
    <div class="showcase-progress" aria-hidden="true"><div class="showcase-progress-bar" id="showcase-progress-bar"></div></div>
    <p class="showcase-meta" id="showcase-meta">Step —</p>
    <p class="showcase-foot" id="showcase-foot">Built by Eric · eRock — for William @willrob-valensdad</p>
  `;
  document.body.appendChild(root);
  return root;
}

function foregroundCardLine(cards = []) {
  const list = Array.isArray(cards) ? cards : [];
  const focused = list.find((c) => c.status === "focused" || c.status === "pending") || list[0];
  if (!focused) return "";
  const data = focused.card_data || focused.cardData || {};
  const title = data.title || focused.title || "Work object";
  const body = data.body || "";
  return body ? `${title} — ${String(body).split("\n")[0]}` : title;
}

export function attachAgentDeskShowcase() {
  const root = ensureShowcase();

  const show = () => {
    root.hidden = false;
    document.body.classList.add("agent-desk-showcase-open");
    const hint = document.getElementById("boot-hint");
    if (hint) hint.style.display = "none";
  };

  const hide = () => {
    root.hidden = true;
    document.body.classList.remove("agent-desk-showcase-open");
  };

  const update = (report = {}, cards = []) => {
    const label = String(report.label || report.agentPhase || "idle");
    const act = ACTS[label] || ACTS[report.agentPhase] || null;
    const step = Number(report.step || 0);
    const total = Number(report.stepsTotal || 5);
    const pct = total > 0 ? Math.round((step / total) * 100) : 0;

    if (report.agentDeskActive || (report.agentPhase && report.agentPhase !== "idle")) {
      show();
    }

    const titleEl = document.getElementById("showcase-title");
    const bodyEl = document.getElementById("showcase-body");
    const cardEl = document.getElementById("showcase-card");
    const metaEl = document.getElementById("showcase-meta");
    const barEl = document.getElementById("showcase-progress-bar");
    const footEl = document.getElementById("showcase-foot");

    if (titleEl) {
      titleEl.textContent = act?.title || report.message || label;
    }
    if (bodyEl) {
      bodyEl.textContent = act?.body || report.message || "";
    }
    if (cardEl) {
      const line = foregroundCardLine(cards);
      cardEl.textContent = line ? `Foreground card: ${line}` : "";
      cardEl.hidden = !line;
    }
    if (metaEl) {
      metaEl.textContent = step && total ? `Step ${step} / ${total} · ${label.replace(/_/g, " ")}` : report.message || "";
    }
    if (barEl) {
      barEl.style.width = `${Math.max(8, pct)}%`;
    }
    if (footEl && label === "complete") {
      footEl.textContent = "William — call Eric when you want this on the private tree.";
    }

    if (report.agentPhase === "complete" || report.done) {
      if (titleEl) titleEl.textContent = "Live Agent Desk complete";
      if (bodyEl) {
        bodyEl.textContent =
          "You just watched gateway hooks drive real spatial cards — no cloud, no token. Ready for upstream.";
      }
      if (barEl) barEl.style.width = "100%";
      window.setTimeout(hide, 14000);
    }
  };

  return { show, hide, update };
}