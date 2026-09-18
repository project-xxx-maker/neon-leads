"use client";

import React from "react";
import { Search, Bookmark, Kanban, LayoutDashboard, Flame } from "lucide-react";

export type TabType = "extractor" | "saved" | "pipeline" | "dashboard";

interface AppTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  savedCount: number;
  pipelineCount: number;
  noWebsiteSavedCount: number;
}

export function AppTabs({
  activeTab,
  onChangeTab,
  savedCount,
  pipelineCount,
  noWebsiteSavedCount,
}: AppTabsProps) {
  const tabs = [
    {
      id: "extractor" as TabType,
      label: "Extrator Google Maps",
      icon: Search,
      badge: null,
    },
    {
      id: "saved" as TabType,
      label: "Leads Salvos / Carteira",
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
      subBadge: noWebsiteSavedCount > 0 ? `${noWebsiteSavedCount} sem site` : null,
    },
    {
      id: "pipeline" as TabType,
      label: "Pipeline de Vendas (Kanban)",
      icon: Kanban,
      badge: pipelineCount > 0 ? pipelineCount : null,
    },
    {
      id: "dashboard" as TabType,
      label: "Dashboard de Performance",
      icon: LayoutDashboard,
      badge: null,
    },
  ];

  return (
    <div className="border-b border-white/5 bg-[#080c14]/90 backdrop-blur-md sticky top-[69px] z-30">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>

              {tab.badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive
                      ? "bg-cyan-400 text-slate-950 shadow-sm"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {tab.subBadge && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  <Flame className="h-2.5 w-2.5 text-amber-400" />
                  <span>{tab.subBadge}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
