"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  MessageCircle,
  Bookmark,
  Check,
  Search,
  Flame,
  Trash2,
  Instagram,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Lead, LeadStatus } from "@/lib/extractor/types";

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAiAdvisor: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onSaveToWallet: (leadIds: string[]) => void;
  onSaveAllNoWebsite: () => void;
  savedLeadIds: Set<string>;
  onExportExcel: (selectedOnly: boolean) => void;
  onExportCsv: (selectedOnly: boolean) => void;
  onClearLeads: () => void;
  onlyNoWebsiteFilter: boolean;
  onToggleOnlyNoWebsite: () => void;
}

export function LeadsTable({
  leads,
  onSelectLead,
  onOpenAiAdvisor,
  onUpdateLeadStatus,
  onSaveToWallet,
  onSaveAllNoWebsite,
  savedLeadIds,
  onExportExcel,
  onExportCsv,
  onClearLeads,
  onlyNoWebsiteFilter,
  onToggleOnlyNoWebsite,
}: LeadsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterTerm, setFilterTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Filtragem local
  const filtered = leads.filter((lead) => {
    if (onlyNoWebsiteFilter && lead.website) return false;
    if (statusFilter !== "all" && (lead.status || "novo") !== statusFilter) return false;
    if (!filterTerm) return true;
    const term = filterTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.city.toLowerCase().includes(term) ||
      lead.category.toLowerCase().includes(term) ||
      lead.address.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      (lead.instagramHandle || "").toLowerCase().includes(term) ||
      lead.emails.some((e) => e.toLowerCase().includes(term)) ||
      (lead.audit?.primaryOpportunity || "").toLowerCase().includes(term)
    );
  });

  const noWebsiteLeads = leads.filter((l) => !l.website);
  const unsavedNoWebsiteCount = noWebsiteLeads.filter((l) => !savedLeadIds.has(l.id)).length;

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

  const handleCopyPhones = () => {
    const targets = selectedIds.size > 0
      ? leads.filter((l) => selectedIds.has(l.id))
      : filtered;
    const phones = targets
      .map((l) => l.phone)
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(phones);
    setCopiedType("phones");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSaveSelection = () => {
    const ids = selectedIds.size > 0
      ? Array.from(selectedIds)
      : filtered.map((l) => l.id);
    onSaveToWallet(ids);
  };

  return (
    <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 border-b border-white/5 bg-slate-950/40 p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Campo de Busca Rápida */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Filtrar por nome, cidade, nicho, @insta..."
                className="w-full sm:w-60 rounded-xl border border-white/10 bg-slate-900/90 py-2 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* BOTÃO EM DESTAQUE: MINA DE OURO (SEM SITE) */}
            <button
              onClick={onToggleOnlyNoWebsite}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                onlyNoWebsiteFilter
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-300 font-black"
                  : "bg-amber-950/30 text-amber-300 border-amber-500/40 hover:bg-amber-900/40"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>🔥 Apenas SEM SITE ({noWebsiteLeads.length})</span>
            </button>

            {/* Filtros de CRM por Status */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { key: "all", label: "Todos" },
                { key: "novo", label: "Novos" },
                { key: "contatado", label: "Contatados" },
                { key: "negociando", label: "Negociando" },
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* BOTÃO SALVAR TODOS SEM SITE NA CARTEIRA (EM DESTAQUE MÁXIMO) */}
            <button
              onClick={onSaveAllNoWebsite}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition-all"
              title="Salvar instantaneamente todos os clientes sem site na carteira"
            >
              <Flame className="h-4 w-4 fill-slate-950 text-slate-950 animate-pulse" />
              <span>
                🔥 Salvar ({noWebsiteLeads.length}) SEM SITE na Carteira
              </span>
            </button>

            {/* Salvar Selecionados */}
            <button
              onClick={handleSaveSelection}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-xs font-bold text-white shadow-neon-cyan hover:brightness-110 active:scale-95 transition-all"
              title="Salvar leads na sua carteira permanente"
            >
              <Bookmark className="h-3.5 w-3.5 fill-white/20" />
              <span>
                {selectedIds.size > 0
                  ? `Salvar (${selectedIds.size})`
                  : "Salvar Todos"}
              </span>
            </button>

            {/* Copiar Telefones */}
            <button
              onClick={handleCopyPhones}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
            >
              {copiedType === "phones" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copiar Fones</span>
                </>
              )}
            </button>

            {/* Exportar Excel */}
            <button
              onClick={() => onExportExcel(selectedIds.size > 0)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-neon-cyan transition-all hover:brightness-110 active:scale-95"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={() => onExportCsv(selectedIds.size > 0)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>

            {/* Limpar */}
            <button
              onClick={onClearLeads}
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              title="Limpar resultados"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/5 bg-slate-900/60 uppercase tracking-wider text-slate-400">
            <tr>
              <th className="w-10 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
              </th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Empresa / Perfil</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Nicho & Cidade</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Origem / Link</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Oportunidade & Oferta IA 💡</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Contato & WhatsApp</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Status CRM</th>
              <th className="px-4 py-3.5 font-semibold text-slate-300">Presença Web</th>
              <th className="px-4 py-3.5 text-right font-semibold text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              const isSaved = savedLeadIds.has(lead.id);
              const audit = lead.audit;
              const hasNoWebsite = !lead.website;
              const isInstagram = lead.source === "instagram";

              return (
                <tr
                  key={lead.id}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isSelected ? "bg-cyan-950/20" : ""
                  } ${hasNoWebsite ? "bg-amber-950/10" : ""}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(lead.id)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                  </td>

                  {/* Nome da Empresa / Link Direto de Onde Foi Retirado */}
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
                      {isSaved && (
                        <span className="shrink-0 rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                          Salvo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      {isInstagram ? (
                        <a
                          href={lead.sourceUrl || lead.socials?.instagram || `https://instagram.com/${(lead.instagramHandle || "").replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 text-[10px] font-bold text-pink-300 hover:bg-pink-500/30 transition-all"
                        >
                          <Instagram className="h-2.5 w-2.5" />
                          <span>Ver Perfil: {lead.instagramHandle || "@perfil"} ↗</span>
                        </a>
                      ) : (
                        <a
                          href={lead.sourceUrl || lead.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300 hover:bg-blue-500/30 transition-all"
                        >
                          <MapPin className="h-2.5 w-2.5 text-blue-400" />
                          <span>Ver no Maps ↗</span>
                          <span className="text-slate-400 font-normal">({lead.reviewsCount} avaliações)</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Nicho & Cidade Ajustados pelo Painel */}
                  <td className="px-4 py-3.5 max-w-[180px]">
                    <div className="font-semibold text-slate-200 truncate">
                      {lead.category || "Comércio"}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 truncate mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lead.city}</span>
                    </div>
                  </td>

                  {/* Origem / Link de Onde Achamos o Lead */}
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
                  <td className="px-4 py-3.5 max-w-[270px]">
                    {hasNoWebsite ? (
                      <button
                        onClick={() => onOpenAiAdvisor(lead)}
                        className="group flex flex-col text-left rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 p-2 transition-all hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                      >
                        <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                          <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                          <span>{isInstagram ? "SEM SITE: Página p/ Bio" : "SEM SITE: Criar Site + Sistema"}</span>
                        </div>
                        <span className="text-[10px] text-slate-300 truncate mt-0.5 font-medium group-hover:text-white">
                          {audit?.recommendedOffer || "Landing Page + Agendamento"}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold mt-0.5">
                          Sugerido: {audit?.suggestedPrice.split("+")[0] || "R$ 1.500"}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenAiAdvisor(lead)}
                        className="group flex flex-col text-left rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-2 transition-all hover:border-cyan-400"
                      >
                        <div className="flex items-center gap-1 text-cyan-300 font-semibold text-[11px]">
                          <Bookmark className="h-3 w-3 text-cyan-400" />
                          <span>{audit?.primaryOpportunity || "Automação Web"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5 group-hover:text-slate-200">
                          {audit?.suggestedPrice || "R$ 1.200"}
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Telefone & WhatsApp */}
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
                            onClick={() => onUpdateLeadStatus(lead.id, "contatado")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 transition-all hover:bg-emerald-500/30 hover:scale-105 shadow-neon-emerald"
                            title="Abrir WhatsApp com mensagem da IA pronta!"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Chamar</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600">Sem telefone</span>
                    )}
                  </td>

                  {/* Status CRM */}
                  <td className="px-4 py-3.5">
                    <select
                      value={lead.status || "novo"}
                      onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="novo">🔵 Novo Lead</option>
                      <option value="contatado">🟡 Contatado</option>
                      <option value="negociando">🟣 Negociando</option>
                      <option value="proposta">📄 Proposta</option>
                      <option value="fechado">🟢 Fechado!</option>
                      <option value="perdido">⚪ Sem Interesse</option>
                    </select>
                  </td>

                  {/* Presença Web */}
                  <td className="px-4 py-3.5">
                    {lead.website ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-slate-800 px-2 py-1 text-[10px] text-cyan-300 hover:text-white flex items-center gap-1"
                        >
                          <span>Tem Site</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        <Flame className="h-2.5 w-2.5 text-amber-400" />
                        <span>NÃO TEM SITE</span>
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenAiAdvisor(lead)}
                        className="rounded-lg bg-gradient-to-r from-amber-500/20 to-cyan-500/20 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:text-white border border-amber-500/30 hover:border-cyan-400 transition-colors"
                        title="Ver proposta e script da IA"
                      >
                        💡 Ver Pitch IA
                      </button>
                      <button
                        onClick={() => onSaveToWallet([lead.id])}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isSaved
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                        }`}
                        title={isSaved ? "Já está na carteira" : "Salvar na carteira"}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-cyan-400 text-cyan-400" : ""}`} />
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
  );
}
