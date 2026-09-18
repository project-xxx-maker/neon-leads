"use client";

import React from "react";
import { Users, PhoneCall, Mail, Globe, Sparkles, Flame } from "lucide-react";
import { Lead } from "@/lib/extractor/types";

interface StatsCardsProps {
  leads: Lead[];
  onFilterNoWebsite?: () => void;
  isOnlyNoWebsiteActive?: boolean;
}

export function StatsCards({
  leads,
  onFilterNoWebsite,
  isOnlyNoWebsiteActive,
}: StatsCardsProps) {
  const total = leads.length;
  const withPhone = leads.filter((l) => !!l.phone).length;
  const withWhatsapp = leads.filter((l) => l.isWhatsapp).length;
  const withEmail = leads.filter((l) => l.emails && l.emails.length > 0).length;
  const withWebsite = leads.filter((l) => !!l.website).length;
  const withoutWebsite = leads.filter((l) => !l.website).length;
  const totalEmails = leads.reduce((acc, curr) => acc + (curr.emails?.length || 0), 0);

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* Total Leads */}
      <div className="glass-panel rounded-2xl p-4 transition-all hover:border-cyan-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Leads</span>
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-xs text-slate-500">capturados</span>
        </div>
      </div>

      {/* MINA DE OURO: Sem Website */}
      <div
        onClick={onFilterNoWebsite}
        className={`glass-panel cursor-pointer rounded-2xl p-4 transition-all border ${
          isOnlyNoWebsiteActive
            ? "border-amber-400 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-400"
            : "border-amber-500/30 bg-amber-950/10 hover:border-amber-400 hover:shadow-neon-cyan"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300">Sem Website 🔥</span>
          <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-300">{withoutWebsite}</span>
          <span className="text-[11px] text-amber-400/90 font-medium">
            {isOnlyNoWebsiteActive ? "Filtro ativo" : "Clique p/ filtrar"}
          </span>
        </div>
      </div>

      {/* WhatsApp Ativo */}
      <div className="glass-panel rounded-2xl p-4 transition-all hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Com WhatsApp</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <PhoneCall className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-400">{withWhatsapp}</span>
          <span className="text-xs text-emerald-500/80">
            {total > 0 ? Math.round((withWhatsapp / total) * 100) : 0}% válidos
          </span>
        </div>
      </div>

      {/* E-mails Encontrados */}
      <div className="glass-panel rounded-2xl p-4 transition-all hover:border-cyan-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">E-mails Web</span>
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
            <Mail className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-cyan-400">{totalEmails}</span>
          <span className="text-xs text-cyan-500/80">em {withEmail} sites</span>
        </div>
      </div>

      {/* Com Website */}
      <div className="glass-panel rounded-2xl p-4 transition-all hover:border-purple-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Com Website</span>
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
            <Globe className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{withWebsite}</span>
          <span className="text-xs text-purple-400/80">
            {total > 0 ? Math.round((withWebsite / total) * 100) : 0}% online
          </span>
        </div>
      </div>

      {/* Clientes Fechados / CRM */}
      <div className="glass-panel rounded-2xl p-4 transition-all hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">CRM Fechados</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-400">
            {leads.filter((l) => l.status === "fechado").length}
          </span>
          <span className="text-xs text-slate-400">clientes</span>
        </div>
      </div>
    </div>
  );
}
