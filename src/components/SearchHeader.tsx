"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  Instagram,
  Map,
  Zap,
} from "lucide-react";
import { SearchFilterParams } from "@/lib/extractor/types";

interface SearchHeaderProps {
  onSearch: (params: SearchFilterParams) => void;
  isLoading: boolean;
}

const POPULAR_NICHES = [
  "Dentistas",
  "Restaurantes",
  "Advogados",
  "Imobiliárias",
  "Barbearias",
  "Academias",
  "Clínicas de Estética",
  "Oficinas Mecânicas",
];

const POPULAR_LOCATIONS = [
  "Campinas, SP",
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Curitiba, PR",
  "Florianópolis, SC",
];

export function SearchHeader({ onSearch, isLoading }: SearchHeaderProps) {
  const [query, setQuery] = useState("Dentistas");
  const [location, setLocation] = useState("São Paulo, SP");
  const [limit, setLimit] = useState<number>(20); // 20 leads por padrão para resposta instantânea
  const [source, setSource] = useState<"maps" | "instagram" | "all">("all");
  const [deepScan, setDeepScan] = useState(false); // Foco em velocidade; pode ser ativado nas opções avançadas
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filtros
  const [onlyWithPhone, setOnlyWithPhone] = useState(false);
  const [onlyWithWhatsapp, setOnlyWithWhatsapp] = useState(false);
  const [onlyWithWebsite, setOnlyWithWebsite] = useState(false);
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [enrichSocialsAndEmail, setEnrichSocialsAndEmail] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !location.trim()) return;

    onSearch({
      query: query.trim(),
      location: location.trim(),
      limit,
      source,
      deepScan,
      onlyWithPhone,
      onlyWithWhatsapp,
      onlyWithWebsite,
      onlyWithoutWebsite,
      minRating,
      enrichSocialsAndEmail,
    });
  };

  return (
    <div className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-[#0a0f1d]/90 to-[#070b14]/95 p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
      {/* Glow decorativo */}
      <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        {/* SELETOR DE FONTE DE MINERAÇÃO: GOOGLE MAPS vs INSTAGRAM */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fonte de Mineração:
            </span>
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-950/80 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setSource("maps")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  source === "maps"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-neon-cyan"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span>Google Maps</span>
              </button>

              <button
                type="button"
                onClick={() => setSource("instagram")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  source === "instagram"
                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram Business 📸</span>
              </button>

              <button
                type="button"
                onClick={() => setSource("all")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  source === "all"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-neon-purple"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Ambos (Multi-Fonte)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>Sem Site Sempre Priorizado no Topo</span>
            </span>
          </div>
        </div>

        {/* Inputs de Nicho e Cidade */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Campo Palavra-chave / Nicho */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                source === "instagram"
                  ? "Nicho no Instagram (ex: Dentistas, Barbearias, Estética...)"
                  : "Nicho ou termo (ex: Dentistas, Restaurantes, Advogados...)"
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 shadow-inner transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              required
            />
          </div>

          {/* Campo Localização */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Cidade, Estado ou Bairro (ex: Campinas, SP)"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 shadow-inner transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Botão de Disparo */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-slate-950 shadow-neon-cyan transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 ${
              source === "instagram"
                ? "bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400"
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Minerando Máximo de Leads...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>
                  {source === "instagram"
                    ? "Minerar no Instagram"
                    : limit === 0
                    ? "Extrair Máximo de Leads (Alta Intenção)"
                    : `Buscar & Extrair (${limit} Leads)`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Quick Tag Recommendations & Deep Scan */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Sugestões:</span>
            {POPULAR_NICHES.slice(0, 5).map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setQuery(niche)}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  query === niche
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {niche}
              </button>
            ))}
            <span className="text-slate-600 mx-1">|</span>
            {POPULAR_LOCATIONS.slice(0, 3).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  location === loc
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {source !== "instagram" && (
            <button
              type="button"
              onClick={() => setDeepScan(!deepScan)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                deepScan
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 shadow-neon-emerald"
                  : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200"
              }`}
            >
              <Flame className={`h-3.5 w-3.5 ${deepScan ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
              <span>Varredura Máxima (Intenção + Bairros)</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] ${deepScan ? "bg-emerald-400 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>
                {deepScan ? "ATIVO" : "DESATIVADO"}
              </span>
            </button>
          )}
        </div>

        {/* Toggle Filtros Avançados */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showAdvanced ? "Ocultar Filtros & Limites" : "Configurar Limites & Filtros Avançados"}</span>
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Quantidade de Leads */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Limite de Extração
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value={0}>🚀 Sem Limite (Extrair Tudo / Máximo)</option>
                  <option value={30}>30 leads</option>
                  <option value={50}>50 leads</option>
                  <option value={100}>100 leads</option>
                  <option value={250}>250 leads</option>
                  <option value={500}>500 leads</option>
                </select>
              </div>

              {/* Avaliação Mínima */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nota Mínima
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value={0}>Qualquer avaliação</option>
                  <option value={4.0}>★ 4.0 ou superior</option>
                  <option value={4.5}>★ 4.5 ou superior</option>
                </select>
              </div>

              {/* Filtros de Contato */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Validação de Contato
                </label>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyWithPhone}
                      onChange={(e) => setOnlyWithPhone(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Apenas com telefone</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyWithWhatsapp}
                      onChange={(e) => setOnlyWithWhatsapp(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Apenas com WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Mina de Ouro (Apenas Sem Site) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-300">
                  Filtro Fixo "Mina de Ouro"
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-bold">
                  <input
                    type="checkbox"
                    checked={onlyWithoutWebsite}
                    onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                    className="rounded border-amber-500 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Retornar EXCLUSIVAMENTE quem não tem site</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Mesmo desmarcado, o sistema já ordena quem não tem site na primeira posição.
                </p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
