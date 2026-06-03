/**
 * Live Agent Desk — client orchestrator (Milestone 2 preview).
 * Drives spatial cards + sculpture pulse via local ValenGateway hooks.
 */

const TICK_MS = 2200;

export function attachLiveAgentDesk({ state, audio, valenWorkspace, refreshWorkspaceCards }) {
  let timer = null;
  let running = false;

  const setAgentUi = (report = {}) => {
    const pulse = Number(report.sculpturePulse || 0);
    const phase = String(report.agentPhase || "idle");
    document.body.classList.toggle("agent-desk-live", Boolean(report.agentDeskActive));
    document.body.dataset.valenAgentPhase = phase;
    document.body.dataset.valenAgentPulse = pulse.toFixed(3);
    const statusEl = document.getElementById("agent-desk-status");
    if (statusEl) {
      statusEl.textContent = report.message || report.label || phase;
    }
    const phaseEl = document.getElementById("agent-desk-phase");
    if (phaseEl) phaseEl.textContent = phase;
    const stepEl = document.getElementById("agent-desk-step");
    if (stepEl && report.step && report.stepsTotal) {
      stepEl.textContent = `${report.step} / ${report.stepsTotal}`;
    }
    if (audio && pulse > 0.2) {
      audio.energy = Math.max(audio.energy, pulse * 0.85);
    }
    state?.set("runtimeLastAction", `agent-desk:${phase}:${pulse.toFixed(2)}`);
  };

  const stop = () => {
    running = false;
    if (timer) window.clearInterval(timer);
    timer = null;
    document.body.classList.remove("agent-desk-live");
    document.body.dataset.valenAgentPhase = "idle";
    document.body.dataset.valenAgentPulse = "0";
  };

  const tick = async () => {
    if (!running) return;
    try {
      const result = await valenWorkspace.callHook("tick-live-agent-desk", {
        method: "POST",
        body: { sessionId: valenWorkspace.getHookSessionId() }
      });
      setAgentUi(result.latestRuntimeReport || result);
      await refreshWorkspaceCards(`agent-desk:${result.label || "tick"}`);
      if (result.done) {
        stop();
        const statusEl = document.getElementById("agent-desk-status");
        if (statusEl) statusEl.textContent = "Complete — Eric is on the line.";
      }
    } catch (error) {
      stop();
      state?.set("runtimeLastAction", `agent-desk:error:${error.message}`);
      const statusEl = document.getElementById("agent-desk-status");
      if (statusEl) statusEl.textContent = String(error.message || error);
    }
  };

  const start = async () => {
    stop();
    running = true;
    try {
      if (audio && !audio.enabled) await audio.toggle();
      const result = await valenWorkspace.callHook("start-live-agent-desk", {
        method: "POST",
        body: {
          sessionId: valenWorkspace.getHookSessionId(),
          operatorName: "William",
          builderName: "Eric",
          companyName: "eRock"
        }
      });
      setAgentUi(result.latestRuntimeReport || result);
      await refreshWorkspaceCards("agent-desk-start");
      timer = window.setInterval(() => {
        tick();
      }, TICK_MS);
      await tick();
    } catch (error) {
      stop();
      throw error;
    }
  };

  return { start, stop, tick };
}