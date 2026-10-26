"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className = "",
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? "bg-status-error border-status-error"
          : "bg-surface-soft border-hairline hover:border-hairline-strong"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-pill transition-transform duration-200 ease-out ${
          checked ? "translate-x-5 bg-canvas" : "translate-x-1 bg-text"
        }`}
      />
    </button>
  );
}
