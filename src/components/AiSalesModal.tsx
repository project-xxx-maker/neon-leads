"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  DollarSign,
  TrendingUp,
  Mail,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Lead, LeadStatus } from "@/lib/extractor/types";

interface AiSalesModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
}

export function AiSalesModal({ lead, onClose, onUpdateStatus }: AiSalesModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!lead || !lead.audit) return null;

  const audit = lead.audit;
  const isGoldOpportunity = !audit.hasWebsite;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    onUpdateStatus(lead.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#090e1a] p-5 sm:p-7 shadow-2xl">
        {/* Glow decoration */}
        <div
          className={`absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl pointer-events-none ${
            isGoldOpportunity ? "bg-amber-500/20" : "bg-cyan-500/20"
          }`}
        />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isGoldOpportunity ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 text-xs font-black text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>OPORTUNIDADE DE OURO: CLIENTE SEM SITE</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>OPORTUNIDADE: SISTEMA & AUTOMAÇÃO WEB</span>
                </span>
              )}

              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                {lead.city}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">{lead.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Nicho: <span className="text-slate-200">{lead.category}</span> • Nota Google:{" "}
              <span className="text-amber-400 font-bold">★ {lead.rating ? lead.rating.toFixed(1) : "4.8"}</span> ({lead.reviewsCount} avaliações)
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status do Mini-CRM */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Status no Pipeline de Vendas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "novo", label: "🔵 Novo Lead", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
                { key: "contatado", label: "🟡 Mensagem Enviada", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
                { key: "negociando", label: "🟣 Em Negociação", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
                { key: "fechado", label: "🟢 Cliente Fechado!", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold" },
                { key: "perdido", label: "⚪ Sem Interesse", color: "bg-slate-800 text-slate-400 border-slate-700" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => handleStatusChange(st.key as LeadStatus)}
                  className={`rounded-xl px-3 py-1.5 text-xs transition-all border ${
                    (lead.status || "novo") === st.key
                      ? `${st.color} ring-2 ring-cyan-400 font-bold`
                      : "bg-slate-900/60 text-slate-400 border-white/5 hover:bg-slate-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* O que Ofertar & Preço Recomendado */}
          <div className={`rounded-2xl border p-4.5 ${isGoldOpportunity ? "border-amber-500/30 bg-amber-950/15" : "border-cyan-500/30 bg-cyan-950/15"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`h-4 w-4 ${isGoldOpportunity ? "text-amber-400" : "text-cyan-400"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                O que você deve ofertar para esse cliente:
              </span>
            </div>

            <h4 className="text-lg font-black text-white">{audit.recommendedOffer}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{audit.offerDescription}</p>

            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 rounded-xl bg-slate-950/70 p-2.5">
                <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Preço Recomendado</span>
                  <p className="text-xs font-bold text-emerald-300">{audit.suggestedPrice}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-950/70 p-2.5">
                <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Retorno para o Cliente</span>
                  <p className="text-xs font-bold text-cyan-300">{audit.estimatedROI}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gargalos do Cliente */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Pontos Fracos Identificados (Gargalos):
            </span>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {audit.painPoints.map((pain, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Script de Abordagem para WhatsApp */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  Script de Vendas Pronto para WhatsApp
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(audit.pitchWhatsapp, "whatsapp")}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-white"
              >
                {copiedType === "whatsapp" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedType === "whatsapp" ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 text-xs text-slate-200 whitespace-pre-line font-sans border border-emerald-500/10 select-all leading-relaxed">
              {audit.pitchWhatsapp}
            </div>

            {/* Botão de Disparo Direto */}
            {audit.pitchWhatsappUrl ? (
              <a
                href={audit.pitchWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleStatusChange("contatado")}
                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-neon-emerald transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>🚀 Disparar no WhatsApp (Abrir com essa Mensagem)</span>
              </a>
            ) : (
              <p className="mt-2 text-center text-xs text-slate-500">
                Telefone não informado ou inválido para link direto.
              </p>
            )}
          </div>

          {/* Script de E-mail (Opcional) */}
          {lead.emails && lead.emails.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Proposta Formal para E-mail ({lead.emails[0]})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(audit.pitchEmail, "email")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-white"
                >
                  {copiedType === "email" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedType === "email" ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300 whitespace-pre-line font-mono text-[11px] border border-white/5 max-h-36 overflow-y-auto">
                {audit.pitchEmail}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
