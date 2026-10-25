import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./env";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

let lenis: Lenis | null = null;
export type ScrollState = { y: number; velocity: number; progress: number };
const listeners = new Set<(s: ScrollState) => void>();
const state: ScrollState = { y: 0, velocity: 0, progress: 0 };

function nativeTick() {
  if (typeof window === "undefined") return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  state.velocity = window.scrollY - state.y;
  state.y = window.scrollY;
  state.progress = max > 0 ? window.scrollY / max : 0;
  listeners.forEach((fn) => fn(state));
}

export function initScroll() {
  if (typeof window === "undefined") return;
  if (lenis || prefersReducedMotion()) {
    if (!lenis) {
      window.addEventListener("scroll", nativeTick, { passive: true });
    }
    return;
  }

  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1.1,
    autoRaf: false,
  });

  lenis.on("scroll", (l: Lenis) => {
    state.y = l.scroll;
    state.velocity = l.velocity;
    state.progress = l.limit > 0 ? l.scroll / l.limit : 0;
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(state));
  });

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Ensure keyboard focus targets immediately jump into view without animation lag
  window.addEventListener("focusin", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.getBoundingClientRect !== "function") return;
    const rect = target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      if (lenis) {
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        target.scrollIntoView({ block: "nearest", behavior: "auto" });
      }
    }
  });
}

export const onScroll = (fn: (s: ScrollState) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const scrollState = () => state;
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

export function resetScroll() {
  if (typeof window === "undefined") return;
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo(0, 0);
  }
  state.y = 0;
  state.velocity = 0;
}

export function scrollToTarget(target: string | HTMLElement | number) {
  if (typeof window === "undefined") return;
  if (lenis) {
    lenis.scrollTo(target, {
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}
