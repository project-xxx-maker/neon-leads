"use client";

import React from "react";
import {
  MessageCircle,
  Sparkles,
  Flame,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Building2,
  ExternalLink,
  Instagram,
  MapPin,
} from "lucide-react";
import { Lead, LeadStatus } from "@/lib/extractor/types";

interface PipelineKanbanProps {
  leads: Lead[];
  onOpenAiAdvisor: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
}

const STAGES: { key: LeadStatus; label: string; color: string; border: string; bg: string }[] = [
  { key: "novo", label: "Novos Leads", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-950/20" },
  { key: "contatado", label: "Contatados (WhatsApp)", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/20" },
  { key: "negociando", label: "Em Negociação", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/20" },
  { key: "proposta", label: "Proposta Enviada", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-950/20" },
  { key: "fechado", label: "Fechado! 🎉", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-950/20" },
  { key: "perdido", label: "Perdido", color: "text-slate-400", border: "border-slate-700", bg: "bg-slate-900/40" },
];

export function PipelineKanban({ leads, onOpenAiAdvisor, onUpdateStatus }: PipelineKanbanProps) {
  const getStageLeads = (stageKey: LeadStatus) => {
    return leads.filter((l) => (l.status || "novo") === stageKey);
  };

  const getStageTotalValue = (stageKey: LeadStatus) => {
    const stageLeads = getStageLeads(stageKey);
    return stageLeads.reduce((acc, curr) => acc + (curr.dealValue || 1500), 0);
  };

  const moveLead = (leadId: string, currentStatus: LeadStatus, direction: "next" | "prev") => {
    const stageKeys = STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStatus || "novo");
    if (direction === "next" && currentIndex < stageKeys.length - 1) {
      onUpdateStatus(leadId, stageKeys[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      onUpdateStatus(leadId, stageKeys[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quadro Kanban Horizontal com Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {STAGES.map((stage) => {
          const stageLeads = getStageLeads(stage.key);
          const totalVal = getStageTotalValue(stage.key);

          return (
            <div
              key={stage.key}
              className="flex min-w-[310px] max-w-[310px] flex-col rounded-3xl border border-white/5 bg-[#090d16] p-3.5 shadow-xl shrink-0"
            >
              {/* Header da Coluna */}
              <div className={`flex items-center justify-between rounded-2xl border p-3 mb-3 ${stage.border} ${stage.bg}`}>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${stage.color}`}>
                    {stage.label}
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    R$ {totalVal.toLocaleString("pt-BR")}
                  </span>
                </div>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-black text-white border border-white/10">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards da Coluna */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[68vh] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 text-center p-4">
                    <p className="text-[11px] text-slate-600">Nenhum lead nesta etapa</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const audit = lead.audit;
                    const hasNoWebsite = !lead.website;
                    const dealVal = lead.dealValue || 1500;

                    return (
                      <div
                        key={lead.id}
                        className={`group relative rounded-2xl border p-4 transition-all shadow-md ${
                          hasNoWebsite
                            ? "border-amber-500/30 bg-gradient-to-b from-[#111726] to-[#0d121e] hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : "border-white/10 bg-[#0f172a]/80 hover:border-cyan-500/40"
                        }`}
                      >
                        {/* Tag de Oportunidade Sem Site */}
                        {hasNoWebsite && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 mb-2">
                            <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                            <span>SEM SITE: Oportunidade Quente</span>
                          </div>
                        )}

                        {/* Nome & Cidade */}
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-bold text-white text-xs leading-snug line-clamp-2">
                            {lead.name}
                          </h5>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0">
                            ★ {lead.rating?.toFixed(1) || "4.8"}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {lead.category} • {lead.city}
                        </p>

                        {/* Valor da Proposta & Oferta IA */}
                        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-950/70 px-2.5 py-1.5 border border-white/5">
                          <span className="text-[10px] text-slate-400">Proposta</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            R$ {dealVal.toLocaleString("pt-BR")}
                          </span>
                        </div>

                        {audit && (
                          <p className="text-[10px] text-slate-300 truncate mt-1.5">
                            Oferta: <strong className="text-cyan-300">{audit.primaryOpportunity}</strong>
                          </p>
                        )}

                        {/* Ações do Card */}
                        <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            {/* Link de Origem (Maps ou Instagram) */}
                            {lead.source === "instagram" ? (
                              <a
                                href={lead.sourceUrl || lead.socials?.instagram || `https://instagram.com/${(lead.instagramHandle || "").replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 rounded-lg bg-pink-500/15 px-1.5 py-1 text-[10px] font-bold text-pink-300 hover:bg-pink-500/25 border border-pink-500/20"
                                title="Abrir perfil no Instagram"
                              >
                                <Instagram className="h-3 w-3 text-pink-400" />
                                <span>Insta</span>
                              </a>
                            ) : (
                              <a
                                href={lead.sourceUrl || lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 rounded-lg bg-blue-500/15 px-1.5 py-1 text-[10px] font-bold text-blue-300 hover:bg-blue-500/25 border border-blue-500/20"
                                title="Abrir ficha no Google Maps"
                              >
                                <MapPin className="h-3 w-3 text-blue-400" />
                                <span>Maps</span>
                              </a>
                            )}

                            {/* Chamar WhatsApp com script IA */}
                            {lead.phone && (
                              <a
                                href={audit?.pitchWhatsappUrl || lead.whatsappUrl || `https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  if (stage.key === "novo") {
                                    onUpdateStatus(lead.id, "contatado");
                                  }
                                }}
                                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 shadow-neon-emerald"
                                title="Chamar no WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3 text-emerald-400" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {/* Abrir Modal de Pitch IA */}
                            <button
                              onClick={() => onOpenAiAdvisor(lead)}
                              className="rounded-lg bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20"
                            >
                              💡 Pitch
                            </button>
                          </div>

                          {/* Botões Mover Estágio */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveLead(lead.id, stage.key, "prev")}
                              disabled={stage.key === "novo"}
                              className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-20"
                              title="Voltar etapa"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveLead(lead.id, stage.key, "next")}
                              disabled={stage.key === "perdido"}
                              className="rounded p-1 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-300 disabled:opacity-20"
                              title="Avançar etapa"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
