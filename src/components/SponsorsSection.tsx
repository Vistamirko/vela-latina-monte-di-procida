import React from "react";
import Link from "next/link";
import { ArrowUpRight, Award, Compass, ShieldCheck, Ship, Wind, Anchor } from "lucide-react";

interface Sponsor {
  name: string;
  category: "Main Partner" | "Sponsor Tecnico" | "Partner Istituzionale";
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SPONSORS_DATA: Sponsor[] = [
  {
    name: "Cantieri Navali Tirreno",
    category: "Main Partner",
    tagline: "Restauro e ingegneria navale classica",
    badge: "Official Shipyard",
    icon: Ship,
  },
  {
    name: "Veleria Partenope 1948",
    category: "Sponsor Tecnico",
    tagline: "Vele latine tradizionali e tessiture classiche",
    badge: "Sailmaker",
    icon: Wind,
  },
  {
    name: "Corderia & Canapo Flegreo",
    category: "Sponsor Tecnico",
    tagline: "Sartie, drizze e cime marinare naturali",
    badge: "Rigging Supply",
    icon: Anchor,
  },
  {
    name: "Banca Popolare Campi Flegrei",
    category: "Partner Istituzionale",
    tagline: "Sostegno al patrimonio immateriale regionale",
    badge: "Heritage Fund",
    icon: ShieldCheck,
  },
  {
    name: "Officine Marittime Partenopee",
    category: "Sponsor Tecnico",
    tagline: "Ferramenta di coperta e fusioni in bronzo",
    badge: "Hardware & Bronze",
    icon: Compass,
  },
  {
    name: "Flegrea Marine Supplies",
    category: "Main Partner",
    tagline: "Forniture e logistica regate d'epoca",
    badge: "Logistics Partner",
    icon: Award,
  },
];

export default function SponsorsSection() {
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
              <span>Sostenitori & Cantiere 2026–2027</span>
            </div>
            <h2
              id="sponsor-heading"
              className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl lg:text-7xl font-light text-[#0a1c2a] leading-tight"
            >
              Partner & Sostenitori.
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-light max-w-2xl leading-relaxed">
              Le imprese, i cantieri e le istituzioni che navigano al nostro fianco per salvaguardare
              l’arte della vela latina flegrea e portare la nostra flotta sui campi di regata internazionali.
            </p>
          </div>

          <div>
            <a
              href="mailto:vistamirko@gmail.com?subject=Richiesta%20Dossier%20Sponsorizzazione"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#fbfaf6] hover:bg-[#0a1c2a] text-[#0a1c2a] hover:text-white border border-slate-300 hover:border-[#0a1c2a] text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 shadow-2xs font-mono"
            >
              <span>Diventa Sponsor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Griglia Loghi Sponsor Fittizi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {SPONSORS_DATA.map((sponsor, index) => {
            const Icon = sponsor.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between p-5 sm:p-6 bg-[#fbfaf6]/80 hover:bg-white border border-slate-200 hover:border-slate-400 transition-all duration-300 hover:shadow-xs min-h-[190px]"
              >
                {/* Badge Categoria */}
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-600 font-semibold group-hover:text-[#b8860b] transition-colors">
                    {sponsor.badge}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#b8860b] transition-colors" />
                </div>

                {/* Stemma / Logo Vettoriale Fittizio */}
                <div className="my-auto py-3 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 mb-2.5 rounded-full border border-slate-300 group-hover:border-[#0a1c2a] flex items-center justify-center text-[#0a1c2a] bg-white transition-all duration-300 group-hover:scale-105 shadow-2xs">
                    <Icon className="w-4 h-4 text-[#0a1c2a] group-hover:text-[#b8860b] transition-colors" />
                  </div>
                  <h3 className="font-['Cinzel'] text-xs sm:text-[13px] font-semibold tracking-wider text-[#0a1c2a] leading-tight group-hover:text-[#1b5b80] transition-colors">
                    {sponsor.name}
                  </h3>
                  <p className="mt-1 text-[9px] font-mono text-slate-600 line-clamp-1 leading-snug">
                    {sponsor.tagline}
                  </p>
                </div>

                {/* Dettaglio Tipologia */}
                <div className="pt-2 border-t border-slate-200/70 text-center">
                  <span className="text-[8.5px] uppercase tracking-wider text-slate-600 font-mono">
                    {sponsor.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

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
