"use client";

import React from "react";

interface MeterProps {
  value: number; // 0 to 100
  label: string;
  valueText?: string;
  variant?: "action" | "mint" | "error" | "locked";
  isConsole?: boolean;
  className?: string;
}

export function Meter({
  value,
  label,
  valueText,
  variant = "action",
  isConsole = false,
  className = "",
}: MeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const variantColors = {
    action: isConsole ? "bg-console-text" : "bg-action",
    mint: "bg-action-mint",
    error: "bg-status-error",
    locked: isConsole ? "bg-console-text-3" : "bg-text-3",
  };

  const isLocked = variant === "locked";

  const labelColor = isConsole
    ? isLocked
      ? "text-console-text-3"
      : "text-console-text-2"
    : isLocked
    ? "text-text-3"
    : "text-text-2";

  const valueColor = isConsole
    ? isLocked
      ? "text-console-text-3"
      : "text-console-text"
    : isLocked
    ? "text-text-3"
    : "text-text";

  const trackBg = isConsole
    ? "bg-console-surface-2 border-console-hairline"
    : "bg-surface-soft border-hairline";

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <span className={labelColor}>{label}</span>
        {valueText && (
          <span className={`font-medium tabular-nums ${valueColor}`}>
            {valueText}
          </span>
        )}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueText || `${clamped}%`}
        className={`w-full h-1.5 rounded-pill border overflow-hidden ${trackBg} ${
          isLocked ? "opacity-60" : ""
        }`}
      >
        <div
          className={`h-full rounded-pill transition-all duration-300 ease-out ${variantColors[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
