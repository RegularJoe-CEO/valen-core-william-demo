import { createValenWorkspaceBridge } from "../call-valen-gateway/create-valen-workspace-bridge.js";
import { ensureRuntimeStateMirror, updateRuntimeStateMirror } from "../own-runtime-state-and-dom/own-runtime-dom-and-state-mirror.js";
import { bindWorkspaceModeCardActions } from "./bind-local-workspace-card-actions.js";
import { attachLiveAgentDesk } from "./run-live-agent-desk.js";

export function bindUI(state, audio, stageDirector) {
  const valenWorkspace = createValenWorkspaceBridge();
  window.ValenWorkspace = valenWorkspace;
  valenWorkspace.init();
  ensureRuntimeStateMirror();

  const workspaceActions = bindWorkspaceModeCardActions({ state, stageDirector, valenWorkspace });
  const liveAgentDesk = attachLiveAgentDesk({
    state,
    audio,
    valenWorkspace,
    refreshWorkspaceCards: workspaceActions.refreshWorkspaceCards
  });
  window.valenRuntimeActions = {
    refreshWorkspaceCards: workspaceActions.refreshWorkspaceCards,
    handleWorkspaceCardAction: workspaceActions.handleWorkspaceCardAction,
    submitChat: async (message = "") => {
      const text = String(message || "").trim();
      if (!text) return null;
      const result = await valenWorkspace.callHook("queue-capability-work-object", {
        method: "POST",
        body: { sessionId: valenWorkspace.getHookSessionId(), capability: text, title: text }
      });
      await workspaceActions.refreshWorkspaceCards("local-input");
      return result;
    },
    createLocalStarterCards: async (payload = {}) => {
      const result = await valenWorkspace.createBusinessStarterCards(payload);
      await workspaceActions.refreshWorkspaceCards("manual-starter");
      return result;
    },
    startLiveAgentDesk: () => liveAgentDesk.start(),
    stopLiveAgentDesk: () => liveAgentDesk.stop()
  };

  document.getElementById("audio-toggle")?.addEventListener("click", () => audio.toggle());
  document.getElementById("launch-agent-desk")?.addEventListener("click", () => {
    liveAgentDesk.start().catch((error) => {
      state.set("runtimeLastAction", `agent-desk:launch-failed:${error.message}`);
    });
  });
  document.getElementById("refresh-workspace")?.addEventListener("click", () => workspaceActions.refreshWorkspaceCards("button"));
  document.getElementById("reset-workspace")?.addEventListener("click", async () => {
    await valenWorkspace.callHook("reset-local-workspace", { method: "POST", body: { sessionId: valenWorkspace.getHookSessionId() } });
    await bootstrapLocalWorkspace();
  });

  updateRuntimeStateMirror({ phaseId: "WorkspaceMode", activeCard: "card10", activeObjectId: "card10", reason: "local-bind", cards: [] });
  window.setTimeout(bootstrapLocalWorkspace, 0);

  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "william" || params.get("agentDesk") === "1") {
    const autoStartDesk = async () => {
      for (let attempt = 0; attempt < 48; attempt += 1) {
        if (window.ValenWorkspace?.callHook) {
          await liveAgentDesk.start();
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      throw new Error("ValenWorkspace bridge not ready");
    };
    window.setTimeout(() => {
      autoStartDesk().catch((error) => {
        console.error("[Live Agent Desk] auto-start failed:", error);
        state.set("runtimeLastAction", `agent-desk:auto-start-failed:${error.message}`);
        const statusEl = document.getElementById("agent-desk-status");
        if (statusEl) statusEl.textContent = `Auto-start failed: ${error.message}`;
      });
    }, 1200);
    window.setTimeout(() => {
      if (document.body.classList.contains("runtime-booting")) {
        document.body.classList.add("boot-hint-slow");
      }
    }, 12000);
  }

  async function bootstrapLocalWorkspace() {
    const existing = await valenWorkspace.loadCards();
    if (!existing.visibleCards?.length) {
      await valenWorkspace.createBusinessStarterCards({
        source: "public-playground",
        businessType: "studio",
        market: "local",
        goal: "Improve a local spatial interface for AI agents."
      });
    }
    await workspaceActions.refreshWorkspaceCards("bootstrap");
  }
}
