"use client";

import React from "react";
import { X, Monitor, Sparkles } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0a0f1d] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Configurações do Motor</h3>
              <p className="text-xs text-slate-400">Coleta local sem chave de API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-cyan-200">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Coletor Local</strong>
                <p className="text-slate-400 text-[11px]">
                  Para buscar no Google Maps e em perfis públicos, mantenha o computador ligado e execute <code className="text-cyan-300">npm run collector</code> na pasta do projeto. Nenhuma chave de API é necessária.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-neon-cyan hover:brightness-110"
            >
              <span>Entendi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
