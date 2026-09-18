"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  Flame,
  Users,
  CheckCircle2,
  PieChart,
  BarChart3,
  Award,
  Sparkles,
} from "lucide-react";
import { Lead } from "@/lib/extractor/types";

interface DashboardViewProps {
  leads: Lead[];
  onNavigateToTab: (tab: "extractor" | "saved" | "pipeline") => void;
}

export function DashboardView({ leads, onNavigateToTab }: DashboardViewProps) {
  const total = leads.length;
  const noWebsiteCount = leads.filter((l) => !l.website).length;
  const noWebsitePercentage = total > 0 ? Math.round((noWebsiteCount / total) * 100) : 0;

  // Cálculos Financeiros
  const closedLeads = leads.filter((l) => l.status === "fechado");
  const closedRevenue = closedLeads.reduce((acc, curr) => acc + (curr.dealValue || 1500), 0);

  const activePipelineLeads = leads.filter(
    (l) => l.status === "contatado" || l.status === "negociando" || l.status === "proposta"
  );
  const activePipelineValue = activePipelineLeads.reduce(
    (acc, curr) => acc + (curr.dealValue || 1500),
    0
  );

  const totalPotencial = leads.reduce((acc, curr) => acc + (curr.dealValue || 1500), 0);

  const contactedCount = leads.filter((l) => l.status !== "novo").length;
  const conversionRate = contactedCount > 0 ? Math.round((closedLeads.length / contactedCount) * 100) : 0;

  // Distribuição por Nichos
  const nicheCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const cat = l.category || "Geral";
    nicheCounts[cat] = (nicheCounts[cat] || 0) + 1;
  });

  const sortedNiches = Object.entries(nicheCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Contagem por Estágio
  const stagesCount = {
    novos: leads.filter((l) => (l.status || "novo") === "novo").length,
    contatados: leads.filter((l) => l.status === "contatado").length,
    negociando: leads.filter((l) => l.status === "negociando").length,
    proposta: leads.filter((l) => l.status === "proposta").length,
    fechados: closedLeads.length,
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards Principais de Indicadores Financeiros */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Fechado */}
        <div className="glass-panel-glow rounded-3xl p-5 border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-[#090e1a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-300">Faturamento Fechado</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-300">
              R$ {closedRevenue.toLocaleString("pt-BR")}
            </span>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              {closedLeads.length} contratos assinados
            </p>
          </div>
        </div>

        {/* Pipeline Ativo em Negociação */}
        <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-[#090e1a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-cyan-300">Pipeline em Negociação</span>
            <div className="rounded-xl bg-cyan-500/20 p-2.5 text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">
              R$ {activePipelineValue.toLocaleString("pt-BR")}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {activePipelineLeads.length} propostas em andamento
            </p>
          </div>
        </div>

        {/* Mina de Ouro: Empresas Sem Site */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-[#090e1a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-300">Mina de Ouro (Sem Site)</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-300">{noWebsiteCount}</span>
            <p className="text-xs text-amber-400/80 mt-0.5">
              {noWebsitePercentage}% da base pronta p/ Site + Sistema
            </p>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-[#090e1a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-purple-300">Conversão de Vendas</span>
            <div className="rounded-xl bg-purple-500/20 p-2.5 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{conversionRate}%</span>
            <p className="text-xs text-slate-400 mt-0.5">dos contatados viram clientes</p>
          </div>
        </div>
      </div>

      {/* Funil Visual de Vendas */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Funil de Vendas Visual (Conversão do Pipeline)</h4>
          </div>
          <button
            onClick={() => onNavigateToTab("pipeline")}
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Abrir Quadro Kanban →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { label: "1. Novos Leads", count: stagesCount.novos, color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
            { label: "2. Contatados", count: stagesCount.contatados, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
            { label: "3. Negociação", count: stagesCount.negociando, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
            { label: "4. Propostas", count: stagesCount.proposta, color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
            { label: "5. Fechados 🎉", count: stagesCount.fechados, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-black" },
          ].map((st, idx) => (
            <div key={idx} className={`rounded-2xl border p-4 text-center ${st.color}`}>
              <span className="text-xs font-semibold block mb-1">{st.label}</span>
              <span className="text-2xl font-black">{st.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nichos com Mais Oportunidades & Dicas de Fechamento */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Nichos */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Nichos com Mais Leads na sua Base</h4>
          </div>

          <div className="space-y-3">
            {sortedNiches.map(([niche, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={niche} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{niche}</span>
                    <span className="text-slate-400 font-mono">
                      {count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playbook / Estratégia de Fechamento */}
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-br from-amber-950/15 to-[#090e1a]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h4 className="text-sm font-bold text-amber-300">Playbook: Como Fechar Contratos Rápido</h4>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">1</span>
              <span>
                Filtre por <strong>"🔥 Apenas SEM SITE"</strong>: Essas empresas são 3x mais propensas a comprar porque não têm presença web alguma.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">2</span>
              <span>
                Use o botão <strong>"💡 Pitch IA"</strong>: A copy já cita o nome do dono/clínica e elogia a nota deles no Google antes de oferecer a solução.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">3</span>
              <span>
                Cobrança recorrente: Feche a <strong>Landing Page (R$ 1.500)</strong> + uma mensalidade de <strong>R$ 190 a R$ 290/mês</strong> pelo sistema de agendamento/hospedagem para criar renda passiva.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
