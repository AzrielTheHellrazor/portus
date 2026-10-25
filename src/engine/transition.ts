import { gsap } from "gsap";
import { ease, prefersReducedMotion } from "./env";

export type Transition = {
  leave: (curtain: HTMLElement) => Promise<unknown> | gsap.core.Animation;
  enter: (curtain: HTMLElement) => Promise<unknown> | gsap.core.Animation;
};

let current: Transition = {
  leave: (c) => {
    const panel = c.querySelector(".curtain__panel");
    return gsap
      .timeline()
      .set(c, { autoAlpha: 1 })
      .fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: ease.inOut });
  },
  enter: (c) => {
    const panel = c.querySelector(".curtain__panel");
    return gsap
      .timeline()
      .to(panel, { yPercent: -100, duration: 0.6, ease: ease.inOut })
      .set(c, { autoAlpha: 0 });
  },
};

const reduced: Transition = {
  leave: (c) =>
    gsap.timeline().set(c, { autoAlpha: 1 }).fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.15 }),
  enter: (c) => gsap.to(c, { autoAlpha: 0, duration: 0.15 }),
};

export const setTransition = (t: Transition) => {
  current = t;
};

const pick = () => (prefersReducedMotion() ? reduced : current);
const curtain = () => (typeof document !== "undefined" ? document.getElementById("curtain") as HTMLElement : null);

export const playLeave = () => {
  const el = curtain();
  return el ? Promise.resolve(pick().leave(el)) : Promise.resolve();
};

export const playEnter = () => {
  const el = curtain();
  return el ? Promise.resolve(pick().enter(el)) : Promise.resolve();
};
