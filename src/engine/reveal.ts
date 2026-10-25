import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ease, prefersReducedMotion } from "./env";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const durations = { lines: 1.1, words: 0.95, chars: 0.85 } as const;
const staggers = { lines: 0.07, words: 0.03, chars: 0.015 } as const;

function splitTween(el: HTMLElement, isIntro: boolean) {
  const type = (el.dataset.split || "lines") as keyof typeof durations;
  const delay = parseFloat(el.dataset.delay || "0");
  const s = { tween: undefined as gsap.core.Tween | undefined, done: false, requested: false };

  try {
    SplitText.create(el, {
      type: type === "lines" ? "lines" : `lines,${type}`,
      mask: "lines",
      autoSplit: true,
      linesClass: "split-line",
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        if (s.done) return;
        const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
        s.tween = gsap.from(targets, {
          yPercent: 110,
          rotate: type === "chars" ? 0 : 1.5,
          duration: durations[type] || 1.0,
          stagger: staggers[type] || 0.03,
          ease: ease.out,
          delay,
          paused: isIntro && !s.requested,
          onComplete: () => {
            s.done = true;
          },
          scrollTrigger: isIntro ? undefined : { trigger: el, start: "top 88%", once: true },
        });
        return s.tween;
      },
    });
  } catch {
    gsap.set(el, { visibility: "visible" });
  }

  return () => {
    s.requested = true;
    s.tween?.play();
  };
}

function blockTween(el: HTMLElement, paused: boolean) {
  const kind = el.dataset.reveal || "up";
  const delay = parseFloat(el.dataset.delay || "0");
  const from: gsap.TweenVars =
    kind === "fade"
      ? { autoAlpha: 0 }
      : kind === "clip"
      ? { clipPath: "inset(100% 0% 0% 0%)", autoAlpha: 1 }
      : kind === "scale"
      ? { scale: 1.1, clipPath: "inset(10% 10% 10% 10%)", autoAlpha: 1 }
      : { y: 40, autoAlpha: 0 };
  const to: gsap.TweenVars =
    kind === "clip" || kind === "scale" ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 } : {};

  gsap.set(el, { visibility: "visible" });
  return gsap.fromTo(el, from, {
    ...to,
    y: 0,
    autoAlpha: 1,
    duration: kind === "fade" ? 0.9 : 1.2,
    ease: ease.out,
    delay,
    paused,
    scrollTrigger: paused ? undefined : { trigger: el, start: "top 90%", once: true },
  });
}

export function initReveals(root: ParentNode = document) {
  const intro = gsap.timeline({ paused: true });
  if (prefersReducedMotion() || typeof window === "undefined") {
    root.querySelectorAll<HTMLElement>("[data-split], [data-reveal]").forEach((el) => {
      gsap.set(el, { visibility: "visible", opacity: 1, y: 0 });
    });
    return intro;
  }

  root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    const isIntro = el.hasAttribute("data-intro");
    const play = splitTween(el, isIntro);
    if (isIntro) intro.add(play, 0);
  });

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const isIntro = el.hasAttribute("data-intro");
    const t = blockTween(el, isIntro);
    if (isIntro) intro.add(() => t.play(), 0);
  });

  root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || "0.15");
    gsap.fromTo(
      el,
      { yPercent: -amount * 100 },
      {
        yPercent: amount * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  return intro;
}
