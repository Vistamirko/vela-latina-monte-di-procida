"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Award,
  ExternalLink,
  ShieldCheck,
  Building2,
  Ship,
  Sparkles,
} from "lucide-react";
import { PartnerItem } from "@/lib/db/types";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

const DEFAULT_DEMO_PARTNERS: PartnerItem[] = [
  {
    id: "partner-comune-mdp",
    name: "Comune di Monte di Procida",
    category: "Partner Istituzionale",
    tagline: "Patrocinio morale e valorizzazione della tradizione marinara flegrea e della vela latina",
    badge: "Istituzionale",
    logoUrl: "/images/logo-vela-latina.webp",
    websiteUrl: "https://www.comune.montediprocida.na.it",
    order: 1,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function SponsorsSection() {
  const [partners, setPartners] = useState<PartnerItem[]>(DEFAULT_DEMO_PARTNERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetch("/api/partner")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPartners(json.data);
        }
      })
      .catch(() => {
        // Fallback su DEFAULT_DEMO_PARTNERS
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section
      id="sponsor"
      aria-labelledby="sponsor-heading"
      className="py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-white border-b border-slate-200 sail-grid"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Testata della Sezione */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono">
              <Award className="w-3.5 h-3.5 text-[#b8860b]" />
              <span>Sostenitori & Rete Istituzionale 2026–2027</span>
            </div>
            <h2
              id="sponsor-heading"
              className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl lg:text-7xl font-light text-[#0a1c2a] leading-tight"
            >
              Partner & Sostenitori.
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-light max-w-2xl leading-relaxed">
              Le istituzioni civiche, le fondazioni culturali e i partner tecnici che navigano
              al nostro fianco per salvaguardare l’arte della vela latina flegrea e portare
              la marineria montese sui palcoscenici del Mediterraneo.
            </p>
          </div>

          <div>
            <a
              href="mailto:vistamirko@gmail.com?subject=Richiesta%20Dossier%20Sponsorizzazione"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#fbfaf6] hover:bg-[#0a1c2a] text-[#0a1c2a] hover:text-white border border-slate-300 hover:border-[#0a1c2a] text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 shadow-2xs font-mono"
            >
              <span>Diventa Partner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Visualizzazione Partner Connessi al Backend */}
        {partners.length === 1 ? (
          /* Layout Singolo Partner Demo (Comune di Monte di Procida) in evidenza elegante */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Scheda Partner Ufficiale */}
            <div className="lg:col-span-7 bg-[#fbfaf6] border border-slate-300 p-8 sm:p-10 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-bold shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#b8860b]" />
                    <span>{partners[0].category}</span>
                  </div>
                  {partners[0].badge && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                      {partners[0].badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                  <div className="w-20 h-20 relative shrink-0 border border-slate-200 bg-white rounded-xs p-2 flex items-center justify-center shadow-2xs">
                    {partners[0].logoUrl ? (
                      <Image
                        src={partners[0].logoUrl}
                        alt={partners[0].name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#0a1c2a]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-light text-[#0a1c2a] leading-tight">
                      {partners[0].name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Ente Civico & Custode del Patrimonio Culturale Immateriale
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 font-light leading-relaxed">
                  {partners[0].tagline}
                </p>
              </div>

              {partners[0].websiteUrl && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                    Sito Istituzionale
                  </span>
                  <a
                    href={partners[0].websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0a1c2a] hover:text-[#b8860b] transition-colors"
                  >
                    <span>{partners[0].websiteUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Box Invito ad Altri Partner & Cantiere */}
            <div className="lg:col-span-5 bg-white border border-dashed border-slate-300 p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#1b5b80] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nuove Partnership Aperte</span>
                </div>
                <h4 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a]">
                  Unisciti alla Rete di Sostegno della Marineria Tradizionale
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                  Stiamo accogliendo imprese, cantieri navali e mecenati privati interessati
                  a sostenere il restauro delle imbarcazioni storiche, i progetti educativi
                  con le scuole e le regate della stagione 2026–2027.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-slate-500">
                  Visibilità su vele, eventi e rassegna stampa
                </span>
                <a
                  href="mailto:vistamirko@gmail.com?subject=Richiesta%20Informazioni%20Partnership"
                  className="text-xs font-mono font-bold text-[#0a1c2a] hover:text-[#b8860b] underline underline-offset-4"
                >
                  Contattaci →
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Se sono presenti 2 o più partner configurati da backend */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="group relative flex flex-col justify-between p-6 sm:p-8 bg-[#fbfaf6] hover:bg-white border border-slate-200 hover:border-slate-400 transition-all duration-300 shadow-2xs hover:shadow-xs min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 font-semibold group-hover:text-[#b8860b] transition-colors">
                      {partner.badge || partner.category}
                    </span>
                    <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono">
                      {partner.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                    <div className="w-12 h-12 relative shrink-0 border border-slate-200 bg-white rounded-xs p-1 flex items-center justify-center">
                      {partner.logoUrl ? (
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <Ship className="w-5 h-5 text-[#0a1c2a]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#0a1c2a] leading-tight group-hover:text-[#1b5b80] transition-colors">
                        {partner.name}
                      </h3>
                      {partner.websiteUrl && (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#1b5b80] hover:underline mt-0.5"
                        >
                          <span>Visita sito</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-700 font-light line-clamp-2 leading-relaxed">
                    {partner.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Box Informativo / Callout Sponsorizzazione */}
        <div className="mt-10 sm:mt-12 p-6 sm:p-8 bg-[#fbfaf6] border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold block">
              Opportunità di Partnership & Visibilità Internazionale
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-light max-w-2xl leading-relaxed">
              Associa il tuo marchio alla rinascita dei gozzi d’epoca e alla partecipazione a Saint-Tropez,
              alla Barcolana di Trieste e all’America’s Cup Napoli. Sono disponibili opzioni di branding su vele storiche,
              materiali tecnici e rassegne stampa.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/progetti"
              className="text-xs font-mono text-[#0a1c2a] font-bold hover:text-[#b8860b] underline decoration-slate-300 underline-offset-4 transition-colors"
            >
              Scopri i Progetti 2027 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
