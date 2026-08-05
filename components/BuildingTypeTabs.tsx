"use client";

import { useState } from "react";

const TABS = ["오피스텔", "연립다세대", "단독다가구"];

export default function BuildingTypeTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="inline-flex items-center bg-white/50 backdrop-blur-md border border-border/60 rounded-full p-1.5 shadow-soft">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-500 ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 bg-primary rounded-full shadow-[0_4px_20px_-2px_rgba(93,112,82,0.15)] -z-10" />
            )}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
