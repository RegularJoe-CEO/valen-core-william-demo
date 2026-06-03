/**
 * Live Agent Desk — client orchestrator (Milestone 2 preview).
 * Drives spatial cards + sculpture pulse via local ValenGateway hooks.
 */

import { attachAgentDeskShowcase } from "./agent-desk-showcase.js";

const TICK_MS = 1100;
const REFRESH_TIMEOUT_MS = 2500;
const isWilliamDemo = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "william";

function mergeHookCards(result = {}) {
  return [
    ...(Array.isArray(result.foreground) ? result.foreground : []),
    ...(Array.isArray(result.orbit) ? result.orbit : []),
    ...(Array.isArray(result.cards) ? result.cards : []),
    ...(Array.isArray(result.visibleCards) ? result.visibleCards : [])
  ];
}

async function refreshWithTimeout(refreshWorkspaceCards, reason) {
  await Promise.race([
    refreshWorkspaceCards(reason),
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("refresh timeout")), REFRESH_TIMEOUT_MS);
    })
  ]);
}

export function attachLiveAgentDesk({ state, audio, valenWorkspace, refreshWorkspaceCards }) {
  let timer = null;
  let running = false;
  let ticking = false;
  const showcase = attachAgentDeskShowcase();
  let lastCards = [];

  const setAgentUi = (report = {}, cards = lastCards) => {
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
    if (isWilliamDemo()) {
      showcase.update(report, cards);
    }
  };

  const stop = () => {
    running = false;
    ticking = false;
    if (timer) window.clearTimeout(timer);
    timer = null;
    document.body.classList.remove("agent-desk-live");
    document.body.dataset.valenAgentPhase = "idle";
    document.body.dataset.valenAgentPulse = "0";
  };

  const scheduleTick = () => {
    if (!running) return;
    timer = window.setTimeout(() => {
      void runTick();
    }, TICK_MS);
  };

  const runTick = async () => {
    if (!running || ticking) return;
    ticking = true;
    try {
      const result = await valenWorkspace.callHook("tick-live-agent-desk", {
        method: "POST",
        body: { sessionId: valenWorkspace.getHookSessionId() }
      });
      const merged = mergeHookCards(result);
      if (merged.length) lastCards = merged;
      const report = result.latestRuntimeReport || result;
      setAgentUi(report, lastCards);
      if (result.done) {
        stop();
        const statusEl = document.getElementById("agent-desk-status");
        if (statusEl) statusEl.textContent = "Complete — Eric is on the line.";
        if (isWilliamDemo()) {
          try {
            await refreshWithTimeout(refreshWorkspaceCards, "agent-desk:complete");
          } catch {
            /* UI storyboard already shown */
          }
        }
        return;
      }
      const refreshPromise = isWilliamDemo()
        ? refreshWithTimeout(refreshWorkspaceCards, `agent-desk:${result.label || "tick"}`).catch((error) => {
            console.warn("[Live Agent Desk] 3D refresh skipped:", error.message);
          })
        : refreshWorkspaceCards(`agent-desk:${result.label || "tick"}`);
      await refreshPromise;
      scheduleTick();
    } catch (error) {
      stop();
      state?.set("runtimeLastAction", `agent-desk:error:${error.message}`);
      const statusEl = document.getElementById("agent-desk-status");
      if (statusEl) statusEl.textContent = String(error.message || error);
      if (isWilliamDemo()) {
        showcase.update({ agentPhase: "error", message: error.message, label: "error" }, lastCards);
      }
    } finally {
      ticking = false;
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
      lastCards = mergeHookCards(result);
      if (isWilliamDemo()) showcase.show();
      setAgentUi(result.latestRuntimeReport || result, lastCards);
      if (isWilliamDemo()) {
        void refreshWorkspaceCards("agent-desk-start").catch(() => {});
      } else {
        await refreshWorkspaceCards("agent-desk-start");
      }
      await runTick();
    } catch (error) {
      stop();
      throw error;
    }
  };

  return { start, stop, tick: runTick };
}