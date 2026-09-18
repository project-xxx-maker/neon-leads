"use client";

import React from "react";
import { X, History, MapPin, Search, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { Lead } from "@/lib/extractor/types";

export interface SearchHistoryItem {
  id: string;
  query: string;
  location: string;
  timestamp: string;
  leads: Lead[];
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0f1d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Histórico de Extrações</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-xs text-slate-400">Nenhuma busca recente encontrada.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Suas extrações realizadas ficarão salvas aqui.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="group relative cursor-pointer rounded-2xl border border-white/5 bg-slate-900/60 p-4 transition-all hover:border-cyan-500/40 hover:bg-slate-850 hover:shadow-neon-cyan"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {item.query}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
                    {item.leads.length} leads
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.timestamp}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    Restaurar <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-white/5 pt-4">
            <button
              onClick={onClearHistory}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpar Histórico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
