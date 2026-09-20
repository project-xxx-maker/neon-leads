"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Navbar } from "@/components/Navbar";
import { AppTabs, TabType } from "@/components/AppTabs";
import { SearchHeader } from "@/components/SearchHeader";
import { LiveProgress } from "@/components/LiveProgress";
import { StatsCards } from "@/components/StatsCards";
import { LeadsTable } from "@/components/LeadsTable";
import { SavedLeadsView } from "@/components/SavedLeadsView";
import { PipelineKanban } from "@/components/PipelineKanban";
import { DashboardView } from "@/components/DashboardView";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { AiSalesModal } from "@/components/AiSalesModal";
import { SettingsModal } from "@/components/SettingsModal";
import { HistoryDrawer, SearchHistoryItem } from "@/components/HistoryDrawer";
import { Lead, LeadStatus, SearchFilterParams } from "@/lib/extractor/types";
import { Bot, Sparkles, Flame } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("extractor");

  // Extrator State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAiLead, setSelectedAiLead] = useState<Lead | null>(null);
  const [onlyNoWebsiteFilter, setOnlyNoWebsiteFilter] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  // CRM & Carteira Permanente
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);

  // Modais e Gavetas
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Armazenamento Local
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Carregar dados na montagem
  useEffect(() => {
    try {
      const savedHist = localStorage.getItem("neon_leads_history");
      const savedWallet = localStorage.getItem("neon_leads_wallet");

      if (savedHist) setHistory(JSON.parse(savedHist));
      if (savedWallet) setSavedLeads(JSON.parse(savedWallet));
    } catch (e) {
      console.warn("Erro ao carregar do localStorage:", e);
    }
  }, []);

  const handleSaveHistory = (query: string, location: string, newLeads: Lead[]) => {
    if (newLeads.length === 0) return;
    const item: SearchHistoryItem = {
      id: `hist_${Date.now()}`,
      query,
      location,
      timestamp: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      leads: newLeads,
    };
    const updated = [item, ...history.slice(0, 19)];
    setHistory(updated);
    localStorage.setItem("neon_leads_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("neon_leads_history");
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setCurrentQuery(item.query);
    setCurrentLocation(item.location);
    setLeads(item.leads);
    setActiveTab("extractor");
  };

  // Salvar leads selecionados na Carteira Permanente
  const handleSaveToWallet = (leadIds: string[]) => {
    const existingIds = new Set(savedLeads.map((l) => l.id));
    const newItems: Lead[] = [];

    leads.forEach((l) => {
      if (leadIds.includes(l.id) && !existingIds.has(l.id)) {
        newItems.push({
          ...l,
          status: l.status || "novo",
          dealValue: l.dealValue || 1500,
          savedAt: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...savedLeads];
      setSavedLeads(updated);
      localStorage.setItem("neon_leads_wallet", JSON.stringify(updated));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#00f0ff", "#3b82f6", "#10b981"],
      });
    }
  };

  // BOTÃO SALVAR TODOS SEM SITE NA CARTEIRA
  const handleSaveAllNoWebsite = () => {
    const noWebLeads = leads.filter((l) => !l.website);
    if (noWebLeads.length === 0) {
      alert("Nenhum cliente sem site encontrado nesta busca.");
      return;
    }

    const existingIds = new Set(savedLeads.map((l) => l.id));
    const toAdd: Lead[] = [];

    noWebLeads.forEach((l) => {
      if (!existingIds.has(l.id)) {
        toAdd.push({
          ...l,
          status: l.status || "novo",
          dealValue: l.dealValue || 1500,
          savedAt: new Date().toISOString(),
        });
      }
    });

    if (toAdd.length > 0) {
      const updated = [...toAdd, ...savedLeads];
      setSavedLeads(updated);
      localStorage.setItem("neon_leads_wallet", JSON.stringify(updated));

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.8 },
        colors: ["#f59e0b", "#f97316", "#00f0ff"],
      });
    } else {
      alert("Todos os clientes sem site desta busca já estão na sua carteira!");
    }
  };

  const handleRemoveSavedLead = (leadId: string) => {
    const updated = savedLeads.filter((l) => l.id !== leadId);
    setSavedLeads(updated);
    localStorage.setItem("neon_leads_wallet", JSON.stringify(updated));
  };

  const handleClearSavedLeads = () => {
    if (confirm("Deseja realmente limpar toda a sua carteira de leads salvos?")) {
      setSavedLeads([]);
      localStorage.removeItem("neon_leads_wallet");
    }
  };

  const handleUpdateDealValue = (leadId: string, value: number) => {
    const updated = savedLeads.map((l) =>
      l.id === leadId ? { ...l, dealValue: value } : l
    );
    setSavedLeads(updated);
    localStorage.setItem("neon_leads_wallet", JSON.stringify(updated));
  };

  // Atualizar Status do CRM em ambos os estados
  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );

    setSavedLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status } : l));
      localStorage.setItem("neon_leads_wallet", JSON.stringify(updated));
      return updated;
    });

    if (selectedAiLead && selectedAiLead.id === leadId) {
      setSelectedAiLead((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Disparo da Busca com Streaming em Tempo Real
  const handleSearch = async (params: SearchFilterParams) => {
    setIsLoading(true);
    setCurrentQuery(params.query);
    setCurrentLocation(params.location);
    setLiveMessage(`Iniciando radar para "${params.query}" em "${params.location}"...`);
    setLeads([]);

    try {
      const collectorUrl = process.env.NEXT_PUBLIC_COLLECTOR_URL || "http://localhost:3210";
      const payload = params;

      const res = await fetch(`${collectorUrl}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) throw new Error("Coletor local indisponível");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const streamLeads: Lead[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = "message";
          let dataText = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataText = line.slice(6).trim();
            }
          }

          if (!dataText) continue;

          try {
            const parsed = JSON.parse(dataText);

            if (eventName === "status") {
              setLiveMessage(parsed.message || "");
            } else if (eventName === "lead") {
              const newLead = parsed as Lead;
              const exists = streamLeads.some(
                (l) => l.id === newLead.id || (l.name.toLowerCase() === newLead.name.toLowerCase() && l.phone === newLead.phone)
              );

              if (!exists) {
                streamLeads.push(newLead);
                // REGRA OBRIGATÓRIA: Sem site sempre no topo!
                const sorted = [...streamLeads].sort((a, b) => {
                  const aNo = !a.website ? 1 : 0;
                  const bNo = !b.website ? 1 : 0;
                  return bNo - aNo;
                });
                setLeads(sorted);
              }
            } else if (eventName === "lead_update") {
              const updated = parsed as Lead;
              const idx = streamLeads.findIndex((l) => l.id === updated.id);
              if (idx !== -1) {
                streamLeads[idx] = updated;
                const sorted = [...streamLeads].sort((a, b) => {
                  const aNo = !a.website ? 1 : 0;
                  const bNo = !b.website ? 1 : 0;
                  return bNo - aNo;
                });
                setLeads(sorted);
              }
            } else if (eventName === "done") {
              if (streamLeads.length > 0) {
                handleSaveHistory(params.query, params.location, streamLeads);
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.8 },
                  colors: ["#00f0ff", "#f59e0b", "#10b981"],
                });
              }
            }
          } catch (jsonErr) {}
        }
      }

      if (streamLeads.length > 0) {
        handleSaveHistory(params.query, params.location, streamLeads);
      }
    } catch (err: any) {
      console.error("[Neon Leads] Erro no stream:", err);
      alert("Não foi possível conectar ao Coletor Local. Inicie-o com: npm run collector");
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar Excel
  const handleExportExcel = async (customLeads?: Lead[]) => {
    const targets = customLeads || (leads.length > 0 ? leads : savedLeads);
    if (targets.length === 0) return;

    try {
      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: targets,
          campaignName: `NeonLeads_${currentQuery || "Carteira"}_${currentLocation || "Geral"}`,
        }),
      });

      if (!response.ok) throw new Error("Erro na geração do arquivo.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NeonLeads_${(currentQuery || "Carteira").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Falha ao baixar arquivo Excel.");
    }
  };

  // Exportar CSV
  const handleExportCsv = (customLeads?: Lead[]) => {
    const targets = customLeads || (leads.length > 0 ? leads : savedLeads);
    if (targets.length === 0) return;

    const headers = [
      "Nome",
      "Categoria",
      "Cidade",
      "Status CRM",
      "Valor Proposta (R$)",
      "Telefone",
      "WhatsApp",
      "Tem Site?",
      "Oportunidade IA",
      "Emails",
      "Endereco",
    ];

    const rows = targets.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.category || "").replace(/"/g, '""')}"`,
      `"${l.city || ""}"`,
      `"${l.status || "novo"}"`,
      `"${l.dealValue || 1500}"`,
      `"${l.formattedPhone || l.phone || ""}"`,
      `"${l.isWhatsapp ? "SIM" : "NAO"}"`,
      `"${l.website ? "SIM" : "NAO"}"`,
      `"${(l.audit?.recommendedOffer || "").replace(/"/g, '""')}"`,
      `"${(l.emails || []).join("; ")}"`,
      `"${(l.address || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NeonLeads_${(currentQuery || "Carteira").replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const savedLeadIds = new Set(savedLeads.map((l) => l.id));
  const activeCrmLeads = savedLeads.length > 0 ? savedLeads : leads;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Barra de Abas do Sistema */}
      <AppTabs
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        savedCount={savedLeads.length}
        pipelineCount={activeCrmLeads.length}
        noWebsiteSavedCount={savedLeads.filter((l) => !l.website).length}
      />

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* ABA 1: EXTRATOR AO VIVO */}
        {activeTab === "extractor" && (
          <div className="space-y-8">
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Bot className="h-3.5 w-3.5 text-amber-400" />
                <span>Extrator Google Maps & Instagram • Consultor de Vendas IA</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Minere Empresas e Venda{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Landing Pages & Sistemas
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400">
                A IA prioriza clientes <strong className="text-amber-300 font-bold">sem site</strong>, calcula o ticket sugerido e gera a copy pronta para fechar contratos no WhatsApp.
              </p>
            </div>

            <SearchHeader onSearch={handleSearch} isLoading={isLoading} />

            <LiveProgress
              isLoading={isLoading}
              query={currentQuery}
              location={currentLocation}
              liveMessage={liveMessage}
              leadsCount={leads.length}
            />

            <StatsCards
              leads={leads}
              onFilterNoWebsite={() => setOnlyNoWebsiteFilter(!onlyNoWebsiteFilter)}
              isOnlyNoWebsiteActive={onlyNoWebsiteFilter}
            />

            {leads.length > 0 ? (
              <LeadsTable
                leads={leads}
                onSelectLead={(lead) => setSelectedLead(lead)}
                onOpenAiAdvisor={(lead) => setSelectedAiLead(lead)}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onSaveToWallet={handleSaveToWallet}
                onSaveAllNoWebsite={handleSaveAllNoWebsite}
                savedLeadIds={savedLeadIds}
                onExportExcel={() => handleExportExcel(leads)}
                onExportCsv={() => handleExportCsv(leads)}
                onClearLeads={() => setLeads([])}
                onlyNoWebsiteFilter={onlyNoWebsiteFilter}
                onToggleOnlyNoWebsite={() => setOnlyNoWebsiteFilter(!onlyNoWebsiteFilter)}
              />
            ) : (
              !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="glass-panel rounded-3xl p-6 border border-amber-500/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
                      <Flame className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">Mina de Ouro: Clientes Sem Site</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Empresas com faturamento ativo que ainda não possuem site no Google ou na bio do Instagram. É o público mais fácil de vender!
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                      <Bot className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">Sistemas Sob Medida</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      A IA analisa o nicho e sugere Agendamento 24h, Cardápio sem taxa ou Chatbot, informando o preço para cobrar.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">Pipeline & Carteira Salva</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Guarde os leads na Carteira Permanente e acompanhe as propostas no quadro Kanban de vendas.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ABA 2: LEADS SALVOS / CARTEIRA */}
        {activeTab === "saved" && (
          <SavedLeadsView
            savedLeads={savedLeads}
            onOpenAiAdvisor={(lead) => setSelectedAiLead(lead)}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onUpdateStatus={handleUpdateLeadStatus}
            onUpdateDealValue={handleUpdateDealValue}
            onRemoveSavedLead={handleRemoveSavedLead}
            onExportExcel={() => handleExportExcel(savedLeads)}
            onExportCsv={() => handleExportCsv(savedLeads)}
            onClearSavedLeads={handleClearSavedLeads}
          />
        )}

        {/* ABA 3: PIPELINE KANBAN */}
        {activeTab === "pipeline" && (
          <PipelineKanban
            leads={activeCrmLeads}
            onOpenAiAdvisor={(lead) => setSelectedAiLead(lead)}
            onUpdateStatus={handleUpdateLeadStatus}
          />
        )}

        {/* ABA 4: DASHBOARD DE PERFORMANCE */}
        {activeTab === "dashboard" && (
          <DashboardView
            leads={activeCrmLeads}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Modais Globais */}
      <AiSalesModal
        lead={selectedAiLead}
        onClose={() => setSelectedAiLead(null)}
        onUpdateStatus={handleUpdateLeadStatus}
      />

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      <footer className="mt-16 border-t border-white/5 bg-[#05080e] py-6 text-center text-xs text-slate-500">
        <p>Neon Leads Pro • Centro Inteligente de Leads, Pipeline & Fechamento B2B</p>
      </footer>
    </div>
  );
}
