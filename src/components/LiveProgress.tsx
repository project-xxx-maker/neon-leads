"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Search, Globe, Mail, PhoneCall } from "lucide-react";

interface LiveProgressProps {
  isLoading: boolean;
  query: string;
  location: string;
  liveMessage?: string;
  leadsCount?: number;
}

export function LiveProgress({ isLoading, query, location, liveMessage, leadsCount = 0 }: LiveProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const steps = [
    { label: `Conectando aos servidores do Google Maps...`, icon: Search },
    { label: `Localizando estabelecimentos de "${query}" em ${location}...`, icon: Globe },
    { label: `Extraindo nomes, telefones, notas e avaliações...`, icon: PhoneCall },
    { label: `Vasculhando websites para capturar e-mails e Instagram...`, icon: Mail },
    { label: `Finalizando enriquecimento e estruturando dados...`, icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setStepIndex(4);
      return;
    }

    setProgress(20);
    setStepIndex(1);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + Math.floor(Math.random() * 8) + 2;
        return 94;
      });

      setStepIndex((prev) => {
        if (prev < steps.length - 2) return prev + 1;
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const CurrentIcon = steps[stepIndex]?.icon || Loader2;

  return (
    <div className="glass-panel-glow rounded-3xl p-6 transition-all animate-pulse-slow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <CurrentIcon className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Extração em Tempo Real
                </h4>
                {leadsCount > 0 && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-extrabold text-cyan-300 border border-cyan-500/30 animate-pulse">
                    {leadsCount} minerados ao vivo
                  </span>
                )}
              </div>
              <p className="text-xs text-cyan-400 font-medium">
                {liveMessage || steps[stepIndex]?.label}
              </p>
            </div>
          </div>
          <span className="text-lg font-black text-cyan-300">{progress}%</span>
        </div>

        {/* Barra de Progresso Neon */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 transition-all duration-500 shadow-neon-cyan"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mini Steps */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Google Maps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Filtro de Telefones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${progress > 50 ? "bg-cyan-400" : "bg-slate-700"}`} />
            <span>Crawler de E-mails</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${progress > 80 ? "bg-emerald-400" : "bg-slate-700"}`} />
            <span>Validador WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
