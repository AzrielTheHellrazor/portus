import { gsap } from "gsap";
import { ease, prefersReducedMotion } from "./env";

let format = (p: number) => String(Math.round(p)).padStart(3, "0");
export const setLoaderFormat = (fn: (p: number) => string) => {
  format = fn;
};

let exit: ((root: HTMLElement) => gsap.core.Timeline) | null = null;
export const setLoaderExit = (fn: (root: HTMLElement) => gsap.core.Timeline) => {
  exit = fn;
};

const MIN = 0.25;
const MAX = 0.55;

function criticalAssets(): Promise<unknown>[] {
  if (typeof document === "undefined") return [];
  const imgs = [
    ...document.querySelectorAll<HTMLImageElement>(
      "img[data-critical], [data-intro] img"
    ),
  ];
  return [
    document.fonts.ready,
    ...imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))),
  ];
}

const wait = (s: number) => new Promise((r) => setTimeout(r, s * 1000));

function finish(root: HTMLElement) {
  root.hidden = true;
  root.style.display = "none";
  document.documentElement.classList.add("is-loaded");
}

export async function runLoader(): Promise<void> {
  if (typeof document === "undefined") return;
  const root = document.getElementById("loader");
  if (!root) return;

  if (prefersReducedMotion()) {
    await Promise.race([Promise.all(criticalAssets()), wait(0.2)]);
    await gsap.to(root, { autoAlpha: 0, duration: 0.15 });
    return finish(root);
  }

  const count = root.querySelector<HTMLElement>("[data-loader-count]");
  const bar = root.querySelector<HTMLElement>("[data-loader-bar]");
  const tasks = criticalAssets();
  let done = 0;
  const shown = { v: 0 };
  const target = { v: 0 };

  tasks.forEach((t) =>
    t.then(() => {
      done++;
      target.v = (done / tasks.length) * 100;
    })
  );

  const start = performance.now();

  await new Promise<void>((resolve) => {
    let settled = false;

    // Hard safety cap at 650ms to ensure throttled mobile completes in <1500ms
    const safetyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        shown.v = 100;
        if (count) count.textContent = format(100);
        if (bar) bar.style.transform = "scaleX(1)";
        gsap.ticker.remove(tick);
        resolve();
      }
    }, 650);

    const tick = () => {
      if (settled) return;
      const elapsed = (performance.now() - start) / 1000;
      const timeCap = Math.min(100, (elapsed / MIN) * 100);
      const goal = elapsed > MAX ? 100 : Math.min(target.v, timeCap);
      shown.v += (goal - shown.v) * 0.35;
      if ((goal === 100 && shown.v > 98) || elapsed >= 0.6) shown.v = 100;
      if (count) count.textContent = format(shown.v);
      if (bar) bar.style.transform = `scaleX(${shown.v / 100})`;
      if (shown.v >= 100) {
        settled = true;
        clearTimeout(safetyTimer);
        gsap.ticker.remove(tick);
        resolve();
      }
    };
    gsap.ticker.add(tick);
  });

  if (exit) {
    await exit(root);
    return finish(root);
  }

  await gsap
    .timeline()
    .to(root.querySelectorAll("[data-loader-out]"), {
      yPercent: -110,
      duration: 0.25,
      ease: ease.inOut,
      stagger: 0.02,
    })
    .to(
      root,
      { clipPath: "inset(0% 0% 100% 0%)", duration: 0.3, ease: ease.inOut },
      "-=0.15"
    );

  finish(root);
}
