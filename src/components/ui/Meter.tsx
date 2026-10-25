"use client";

import React from "react";

interface MeterProps {
  value: number; // 0 to 100
  label: string;
  valueText?: string;
  variant?: "emerald" | "brass" | "breach";
  className?: string;
}

export function Meter({
  value,
  label,
  valueText,
  variant = "emerald",
  className = "",
}: MeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const variantColors = {
    emerald: "bg-[#10B981]",
    brass: "bg-[#D4A24C]",
    breach: "bg-[#EF4444]",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <span className="text-white/75">{label}</span>
        {valueText && (
          <span className="text-[#EDEDF3] font-semibold tabular-nums">
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
        className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${variantColors[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
