"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  isConsole?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  isConsole = false,
  className = "",
}: TabsProps) {
  const containerStyle = isConsole
    ? "bg-console-surface border-console-hairline"
    : "bg-surface-soft border-hairline";

  return (
    <div
      role="tablist"
      aria-label="Selection tabs"
      className={`inline-flex max-w-full overflow-x-auto items-center gap-1 p-1 rounded-pill border scrollbar-none ${containerStyle} ${className}`}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;

        const buttonStyle = isConsole
          ? isSelected
            ? "bg-console-text text-console-bg font-medium"
            : "text-console-text-2 hover:text-console-text hover:bg-console-surface-2"
          : isSelected
          ? "bg-action text-action-text font-medium"
          : "text-text-2 hover:text-text hover:bg-surface";

        const badgeStyle = isConsole
          ? isSelected
            ? "bg-console-bg text-console-text"
            : "bg-console-surface-2 text-console-text-2"
          : isSelected
          ? "bg-surface-soft text-text"
          : "bg-surface text-text-2";

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-mono transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonStyle}`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-pill text-[10px] font-medium ${badgeStyle}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
