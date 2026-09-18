"use client";

import React from "react";
import { Sparkles, MapPin, Settings, History, ShieldCheck, Zap } from "lucide-react";

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function Navbar({ onOpenSettings, onOpenHistory, historyCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080c14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 shadow-neon-cyan">
            <MapPin className="h-5 w-5 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#080c14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                NEON<span className="text-cyan-400">LEADS</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                PRO 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Inteligência de Leads B2B & Google Maps</p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Crawler Ativo</span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
          >
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Histórico</span>
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
