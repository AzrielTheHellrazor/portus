"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { boot, cleanup, enter, leave, onPage, type PageFn } from "./index";

export function Engine({ setup }: { setup?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useRef<"idle" | "push" | "pop">("idle");
  const first = useRef(true);

  useEffect(() => {
    boot(setup);
  }, [setup]);

  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const a = (e.target as Element).closest("a");
      if (
        !a ||
        (a.target && a.target !== "_self") ||
        a.hasAttribute("download") ||
        a.hasAttribute("data-no-transition")
      )
        return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname)
        return; // External or hash link on same page

      e.preventDefault();
      if (mode.current !== "idle") return;
      mode.current = "push";
      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      await leave();
      cleanup();
      router.push(href, { scroll: false });
    };

    const onPop = () => {
      mode.current = "pop";
      cleanup();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [router]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const pop = mode.current === "pop";
    mode.current = "idle";
    enter({ transition: !pop, scrollTop: !pop });
  }, [pathname]);

  return null;
}

export function usePage(fn: PageFn) {
  useEffect(() => {
    return onPage(fn);
  }, [fn]);
}
