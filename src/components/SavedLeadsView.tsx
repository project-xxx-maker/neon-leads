"use client";

import React, { useState } from "react";
import {
  Bookmark,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Flame,
  Sparkles,
  Trash2,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Calendar,
  Instagram,
  MapPin,
} from "lucide-react";
import { Lead, LeadStatus } from "@/lib/extractor/types";

interface SavedLeadsViewProps {
  savedLeads: Lead[];
  onOpenAiAdvisor: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdateDealValue: (leadId: string, value: number) => void;
  onRemoveSavedLead: (leadId: string) => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onClearSavedLeads: () => void;
}

export function SavedLeadsView({
  savedLeads,
  onOpenAiAdvisor,
  onSelectLead,
  onUpdateStatus,
  onUpdateDealValue,
  onRemoveSavedLead,
  onExportExcel,
  onExportCsv,
  onClearSavedLeads,
}: SavedLeadsViewProps) {
  const [filterTerm, setFilterTerm] = useState("");
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [tempDealValue, setTempDealValue] = useState<string>("");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const filtered = savedLeads.filter((lead) => {
    if (onlyNoWebsite && lead.website) return false;
    if (statusFilter !== "all" && (lead.status || "novo") !== statusFilter) return false;
    if (!filterTerm) return true;
    const term = filterTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.address.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      (lead.category || "").toLowerCase().includes(term)
    );
  });

  const totalEstimatedValue = savedLeads.reduce(
    (acc, curr) => acc + (curr.dealValue || 1500),
    0
  );

  const handleCopyPhones = () => {
    const phones = filtered.map((l) => l.phone).filter(Boolean).join("\n");
    navigator.clipboard.writeText(phones);
    setCopiedType("phones");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSaveDealValue = (leadId: string) => {
    const parsed = parseFloat(tempDealValue.replace(/\D/g, ""));
    if (!isNaN(parsed)) {
      onUpdateDealValue(leadId, parsed);
    }
    setEditingDealId(null);
  };

  if (savedLeads.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-white/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 shadow-neon-cyan">
          <Bookmark className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Sua Carteira de Leads está Vazia</h3>
        <p className="max-w-md text-xs text-slate-400 leading-relaxed">
          Vá até o <strong>Extrator Google Maps</strong>, faça uma pesquisa e clique no botão{" "}
          <strong className="text-cyan-300">"💾 Salvar na Carteira"</strong> para guardar os clientes com os quais deseja fechar negócio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Resumo Financeiro da Carteira */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total na Carteira</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{savedLeads.length}</span>
            <span className="text-xs text-slate-500">empresas salvas</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-950/10">
          <span className="text-xs text-amber-300 font-bold">Mina de Ouro (Sem Site)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">
              {savedLeads.filter((l) => !l.website).length}
            </span>
            <span className="text-xs text-amber-400/80">prontas para Landing Page</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-xs text-emerald-300 font-bold">Potencial da Carteira (R$)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              R$ {totalEstimatedValue.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-emerald-500/80">em oportunidades</span>
          </div>
        </div>
      </div>

      {/* Tabela da Carteira */}
      <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/5 bg-slate-950/40 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  placeholder="Filtrar carteira..."
                  className="w-full sm:w-56 rounded-xl border border-white/10 bg-slate-900/90 py-2 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Toggle Sem Site */}
              <button
                onClick={() => setOnlyNoWebsite(!onlyNoWebsite)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                  onlyNoWebsite
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "bg-amber-950/30 text-amber-300 border-amber-500/40 hover:bg-amber-900/40"
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Apenas SEM SITE ({savedLeads.filter((l) => !l.website).length})</span>
              </button>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 text-xs">
                {[
                  { key: "all", label: "Todos" },
                  { key: "novo", label: "Novos" },
                  { key: "contatado", label: "Contatados" },
                  { key: "negociando", label: "Negociando" },
                  { key: "proposta", label: "Propostas" },
                  { key: "fechado", label: "Fechados" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key)}
                    className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                      statusFilter === st.key
                        ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                        : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações da Carteira */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyPhones}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white"
              >
                {copiedType === "phones" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span>Copiar Fones</span>
              </button>

              <button
                onClick={onExportExcel}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-neon-cyan hover:brightness-110"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar Carteira (.xlsx)</span>
              </button>

              <button
                onClick={onExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={onClearSavedLeads}
                className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                title="Limpar Carteira"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Leads Salvos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 bg-slate-900/60 uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Empresa</th>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Origem / Link</th>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Oportunidade & Oferta IA 💡</th>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Valor Estimado (R$)</th>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Status no Funil</th>
                <th className="px-4 py-3.5 font-semibold text-slate-300">Contato WhatsApp</th>
                <th className="px-4 py-3.5 text-right font-semibold text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((lead) => {
                const audit = lead.audit;
                const hasNoWebsite = !lead.website;
                const dealVal = lead.dealValue || 1500;
                const isInstagram = lead.source === "instagram";

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      hasNoWebsite ? "bg-amber-950/5" : ""
                    }`}
                  >
                    {/* Nome & Cidade */}
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="font-bold text-white flex items-center gap-1.5 group">
                        <a
                          href={lead.sourceUrl || lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
                          title="Clique para abrir a ficha oficial no Google Maps / Instagram em nova aba"
                        >
                          <span className="truncate">{lead.name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-cyan-400" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                          {lead.category}
                        </span>
                        <span className="truncate text-slate-500">{lead.city}</span>
                      </div>
                    </td>

                    {/* Origem / Link */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isInstagram ? (
                        <a
                          href={lead.sourceUrl || lead.socials?.instagram || `https://instagram.com/${(lead.instagramHandle || "").replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 px-3 py-1.5 text-xs font-bold text-pink-300 border border-pink-500/40 transition-all hover:bg-pink-500/30 hover:scale-105 shadow-md"
                          title="Abrir perfil original no Instagram"
                        >
                          <Instagram className="h-4 w-4 text-pink-400" />
                          <span>Ver no Instagram</span>
                          <ExternalLink className="h-3 w-3 text-pink-400/80" />
                        </a>
                      ) : (
                        <a
                          href={lead.sourceUrl || lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 border border-cyan-500/40 transition-all hover:bg-cyan-500/30 hover:scale-105 shadow-md"
                          title="Abrir ficha oficial no Google Maps"
                        >
                          <MapPin className="h-4 w-4 text-cyan-400" />
                          <span>Ver no Google Maps</span>
                          <ExternalLink className="h-3 w-3 text-cyan-400/80" />
                        </a>
                      )}
                    </td>

                    {/* Oportunidade IA */}
                    <td className="px-4 py-3.5 max-w-[280px]">
                      {hasNoWebsite ? (
                        <button
                          onClick={() => onOpenAiAdvisor(lead)}
                          className="flex flex-col text-left rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/5 border border-amber-500/30 p-2 hover:border-amber-400"
                        >
                          <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                            <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                            <span>SEM SITE: Landing Page + Sistema</span>
                          </div>
                          <span className="text-[10px] text-slate-300 truncate mt-0.5">
                            {audit?.recommendedOffer || "Sistema de Agendamento 24h"}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenAiAdvisor(lead)}
                          className="flex flex-col text-left rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-2 hover:border-cyan-400"
                        >
                          <div className="flex items-center gap-1 text-cyan-300 font-semibold text-[11px]">
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            <span>{audit?.primaryOpportunity || "Automação Web"}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 truncate mt-0.5">
                            {audit?.suggestedPrice}
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Valor Estimado / Negociado */}
                    <td className="px-4 py-3.5">
                      {editingDealId === lead.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempDealValue}
                            onChange={(e) => setTempDealValue(e.target.value)}
                            className="w-24 rounded border border-cyan-400 bg-slate-950 px-1.5 py-0.5 text-xs text-white font-mono"
                            placeholder="R$ 1500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveDealValue(lead.id);
                              if (e.key === "Escape") setEditingDealId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveDealValue(lead.id)}
                            className="rounded bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingDealId(lead.id);
                            setTempDealValue(String(dealVal));
                          }}
                          className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-300 hover:text-emerald-200"
                          title="Clique para editar valor da proposta"
                        >
                          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                          <span>R$ {dealVal.toLocaleString("pt-BR")}</span>
                        </button>
                      )}
                    </td>

                    {/* Status CRM */}
                    <td className="px-4 py-3.5">
                      <select
                        value={lead.status || "novo"}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="novo">🔵 Novo Lead</option>
                        <option value="contatado">🟡 Contatado</option>
                        <option value="negociando">🟣 Negociando</option>
                        <option value="proposta">📄 Proposta Enviada</option>
                        <option value="fechado">🟢 Fechado!</option>
                        <option value="perdido">⚪ Sem Interesse</option>
                      </select>
                    </td>

                    {/* Contato & WhatsApp */}
                    <td className="px-4 py-3.5">
                      {lead.phone ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 text-xs">
                            {lead.formattedPhone || lead.phone}
                          </span>
                          {lead.isWhatsapp && (
                            <a
                              href={audit?.pitchWhatsappUrl || lead.whatsappUrl || `https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onUpdateStatus(lead.id, "contatado")}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-neon-emerald"
                              title="Chamar com script da IA"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Chamar</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">Sem fone</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAiAdvisor(lead)}
                          className="rounded-lg bg-gradient-to-r from-amber-500/20 to-cyan-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-white border border-amber-500/30"
                        >
                          💡 Pitch IA
                        </button>
                        <button
                          onClick={() => onRemoveSavedLead(lead.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                          title="Remover da carteira"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
