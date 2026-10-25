export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const isTouch = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
};

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
};

export const ease = {
  out: "expo.out",
  inOut: "expo.inOut",
  soft: "power3.out",
  spring: "back.out(1.5)",
} as const;
