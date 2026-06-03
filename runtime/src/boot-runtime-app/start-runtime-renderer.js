import { RuntimeOverlayLayer } from "../render-dom-overlay/render-dom-parallax-overlay.js";
import { CinematicRenderer } from "../run-render-loop/orchestrate-cinematic-render-loop.js";
import { ScrollSequencer } from "../convert-scroll-progress/convert-scroll-to-runtime-progress.js";

export function setRuntimeDomOwnership(enhanced) {
  document.querySelectorAll(".scene-action-dock, .scene-action-dock *, #runtime-chat, #runtime-chat *").forEach((node) => {
    if (enhanced) {
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("tabindex", "-1");
      node.inert = true;
      return;
    }
    node.removeAttribute("aria-hidden");
    if (node.getAttribute("tabindex") === "-1") node.removeAttribute("tabindex");
    node.inert = false;
  });
}

export function startRuntimeScrollSequencer({ state, controller, manifest }) {
  const sequencer = new ScrollSequencer(state, controller, manifest);
  sequencer.start();
  return sequencer;
}

export function revealRuntimeShell(state) {
  if (typeof document === "undefined") return;
  document.body.classList.add("3dRuntime");
  document.body.classList.remove("runtime-booting");
  setRuntimeDomOwnership(true);
  state?.set("phase", "ready");
}

export function startRuntimeFallback({ state, controller, manifest, bodyClass = "no-webgl" }) {
  state.set("phase", "fallback");
  state.set("renderer", "fallback");
  state.set("meshLabel", "disabled");
  state.set("waveLabel", "disabled");
  state.set("activeLabel", "disabled");
  state.set("hoverLabel", "disabled");
  state.set("transitionPhaseLabel", "fallback");
  state.set("drawLabel", "disabled");
  document.body.classList.add(bodyClass);
  document.body.classList.remove("runtime-booting");
  setRuntimeDomOwnership(false);
  if (controller && manifest) startRuntimeScrollSequencer({ state, controller, manifest });
}

export function startRuntimeRenderer({
  state,
  audio,
  manifest,
  controller,
  capabilities,
  registry,
  interaction,
  stageDirector
}) {
  new RuntimeOverlayLayer(state, interaction).start();
  const renderer = new CinematicRenderer(
    document.getElementById("valen-stage"),
    document.getElementById("valen-pbr-stage"),
    state,
    audio,
    manifest,
    controller,
    capabilities,
    registry,
    interaction,
    stageDirector
  );
  const bootDone = renderer.start();
  return { renderer, bootDone };
}

export function finishRuntimeRendererBoot({ state, controller, manifest, capabilities, bootDone }) {
  state.set("phase", "sequencer");
  startRuntimeScrollSequencer({ state, controller, manifest });
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const williamDemo = params?.get("demo") === "william";
  const bootRevealMs = williamDemo ? 9000 : 18000;
  const revealWatchdog =
    typeof window !== "undefined"
      ? window.setTimeout(() => {
          if (!document.body.classList.contains("runtime-booting")) return;
          console.warn("[Valen runtime] Boot watchdog — revealing UI so the playground is not blank.");
          revealRuntimeShell(state);
        }, bootRevealMs)
      : null;
  void Promise.resolve(bootDone).then(() => {
    if (revealWatchdog) window.clearTimeout(revealWatchdog);
    if (state.get("phase") === "fallback") return;
    revealRuntimeShell(state);
  });
}
