"use client";

import { useEffect, type ReactNode } from "react";
import { initScroll, resetScroll } from "./scroll";
import { prefersReducedMotion } from "./env";

interface SmoothScrollProps {
  children?: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    initScroll();

    return () => {
      // scroll cleanup
    };
  }, []);

  return <>{children}</>;
}
