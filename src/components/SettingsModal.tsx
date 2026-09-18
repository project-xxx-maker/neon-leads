"use client";

import React, { useState, useEffect } from "react";
import { X, Key, ShieldCheck, Save, Sparkles, AlertCircle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}: SettingsModalProps) {
  const [currentKey, setCurrentKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(currentKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0a0f1d] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Configurações do Motor</h3>
              <p className="text-xs text-slate-400">Personalize os provedores de extração</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chave Google Places API (Opcional)
            </label>
            <input
              type="password"
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Se deixar em branco, o sistema usa o <strong>Modo Scraper Nativo Gratuito</strong> automaticamente.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-cyan-200">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Enriquecimento de Websites</strong>
                <p className="text-slate-400 text-[11px]">
                  O Neon Leads vasculha os domínios encontrados automaticamente atrás de e-mails de contato e links sociais sem custo adicional.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-neon-cyan hover:brightness-110"
            >
              <Save className="h-4 w-4" />
              <span>{isSaved ? "Salvo com Sucesso!" : "Salvar Alterações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
