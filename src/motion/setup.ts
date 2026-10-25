import { gsap } from "gsap";
import { setLoaderFormat, setLoaderExit, setTransition, ease } from "@/engine";

export function setupMotion() {
  if (typeof window === "undefined") return;

  setLoaderFormat((p) => {
    return `${String(Math.round(p)).padStart(3, "0")}%`;
  });

  setLoaderExit((root) => {
    return gsap
      .timeline()
      .to(root.querySelectorAll("[data-loader-out]"), {
        yPercent: -100,
        opacity: 0,
        duration: 0.45,
        ease: ease.inOut,
        stagger: 0.03,
      })
      .to(
        root,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.65,
          ease: ease.inOut,
        },
        "-=0.2"
      );
  });

  setTransition({
    leave: (c) => {
      const panel = c.querySelector(".curtain__panel");
      return gsap
        .timeline()
        .set(c, { autoAlpha: 1 })
        .fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: ease.inOut });
    },
    enter: (c) => {
      const panel = c.querySelector(".curtain__panel");
      return gsap
        .timeline()
        .to(panel, { yPercent: -100, duration: 0.5, ease: ease.inOut })
        .set(c, { autoAlpha: 0 });
    },
  });
}
