"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
  Star,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Lead } from "@/lib/extractor/types";

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!lead) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0a0f1d] p-6 shadow-2xl sm:p-8">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-neon-cyan">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{lead.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                  {lead.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{lead.rating?.toFixed(1) || "4.5"}</span>
                  <span className="text-slate-500">({lead.reviewsCount} avaliações)</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-4">
          {/* Telefone & WhatsApp */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Telefone Comercial</span>
                <p className="font-mono text-sm font-bold text-white">
                  {lead.formattedPhone || lead.phone || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lead.phone && (
                <button
                  onClick={() => handleCopy(lead.phone, "phone")}
                  className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  {copiedField === "phone" ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedField === "phone" ? "Copiado" : "Copiar"}</span>
                </button>
              )}

              {lead.isWhatsapp && lead.whatsappUrl && (
                <a
                  href={lead.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-neon-emerald hover:brightness-110"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Abrir WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* E-mails Enriquecidos */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">
                E-mails Encontrados via Web Crawler
              </span>
            </div>
            {lead.emails && lead.emails.length > 0 ? (
              <div className="space-y-2">
                {lead.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2 text-xs font-mono text-cyan-300 border border-white/5"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleCopy(email, `email_${idx}`)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === `email_${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-cyan-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum e-mail público localizado na página inicial ou contatos deste site.
              </p>
            )}
          </div>

          {/* Redes Sociais & Website */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-300 block mb-3">
              Canais Digitais & Redes Sociais
            </span>
            <div className="flex flex-wrap gap-2">
              {lead.website && (
                <a
                  href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/40 hover:bg-slate-750 hover:text-white border border-white/5"
                >
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Website Oficial</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}

              {lead.socials?.instagram && (
                <a
                  href={lead.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-medium text-pink-300 hover:bg-pink-950/30 border border-pink-500/20"
                >
                  <Instagram className="h-3.5 w-3.5 text-pink-400" />
                  <span>Instagram</span>
                  <ExternalLink className="h-3 w-3 text-pink-400" />
                </a>
              )}

              {lead.socials?.facebook && (
                <a
                  href={lead.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-950/30 border border-blue-500/20"
                >
                  <Facebook className="h-3.5 w-3.5 text-blue-400" />
                  <span>Facebook</span>
                  <ExternalLink className="h-3 w-3 text-blue-400" />
                </a>
              )}

              {lead.socials?.linkedin && (
                <a
                  href={lead.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-950/30 border border-cyan-500/20"
                >
                  <Linkedin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </a>
              )}

              {!lead.website && !lead.socials?.instagram && (
                <p className="text-xs text-slate-500">Nenhum canal online identificado.</p>
              )}
            </div>
          </div>

          {/* Origem do Lead (Link de Onde Encontramos) */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center gap-3">
              {lead.source === "instagram" ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-pink-300 font-semibold">Fonte: Instagram Business</span>
                    <p className="text-xs text-slate-300">{lead.instagramHandle || "Perfil Comercial"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-300 font-semibold">Fonte: Google Maps</span>
                    <p className="text-xs text-slate-300">Ficha comercial verificada</p>
                  </div>
                </>
              )}
            </div>

            <a
              href={lead.sourceUrl || (lead.source === "instagram" ? lead.socials?.instagram : lead.googleMapsUrl) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md ${
                lead.source === "instagram"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 hover:brightness-110"
              }`}
            >
              <span>{lead.source === "instagram" ? "Abrir Instagram" : "Abrir Google Maps"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Endereço Completo */}
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-400">Endereço & Localização</span>
                <p className="text-xs text-slate-200 mt-0.5">{lead.address}</p>
              </div>
            </div>

            <a
              href={lead.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <span>Ver no Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
