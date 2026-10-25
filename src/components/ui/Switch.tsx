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
      className={`group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A24C] disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? "bg-[#D4A24C] border-[#D4A24C]"
          : "bg-white/10 border-white/15 hover:bg-white/15"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition-transform duration-200 ease-out ${
          checked
            ? "translate-x-5 bg-[#0C0F14]"
            : "translate-x-0.5 bg-[#EDEDF3]"
        }`}
      />
    </button>
  );
}
