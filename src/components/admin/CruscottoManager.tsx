"use client";

import { useState, useEffect } from "react";
import {
  Ship,
  Wrench,
  CheckSquare,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  Users2,
  Calendar,
  Sparkles,
  ArrowRight,
  Layers,
  GraduationCap,
  BookOpen,
  Compass,
  Inbox,
  Users,
} from "lucide-react";
import { CruscottoKPI } from "@/lib/db/types";

interface CruscottoManagerProps {
  onNavigateTab: (tab: string) => void;
}

export default function CruscottoManager({ onNavigateTab }: CruscottoManagerProps) {
  const [data, setData] = useState<{
    kpi: CruscottoKPI;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cruscotto")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error("Errore cruscotto:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c99a45] border-t-transparent rounded-full animate-spin"></div>
        <span>Caricamento Cruscotto Operativo dell&apos;Associazione...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totaleProgetti: 20,
    attivitaAperte: 23,
    manutenzioniTotali: 7,
    manutenzioniDaFare: 7,
    eventiProgrammati: 8,
    acquistiDaFare: 4,
    inventarioTotale: 5,
    accountDaVerificare: 6,
    prioritaImmediate: [],
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-fadeIn">
      {/* Hero Banner Cruscotto */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0a1c2a] via-[#102a3e] to-[#0a1c2a] text-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#c99a45]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c99a45]/20 text-[#e6b763] text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Associazione Vela Latina MdP</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Cruscotto Operativo & Piano Strategico 2026
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-2 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
              Quadro sinottico integrato per la gestione della flotta storica, coordinamento delle manutenzioni, portafoglio progetti, inventario, canali digitali e fundraising.
            </p>
          </div>

          <div className="hidden md:flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab("corsi")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#c99a45]" />
              <span>Corsi</span>
            </button>
            <button
              onClick={() => onNavigateTab("blog")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#c99a45]" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => onNavigateTab("eventi")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Calendar className="w-3.5 h-3.5 text-[#c99a45]" />
              <span>Eventi</span>
            </button>
            <button
              onClick={() => onNavigateTab("progetti")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Compass className="w-3.5 h-3.5 text-[#c99a45]" />
              <span>Progetti</span>
            </button>
            <button
              onClick={() => onNavigateTab("barche")}
              className="px-3.5 py-1.5 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Flotta</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
        {/* Progetti */}
        <div
          onClick={() => onNavigateTab("attivita")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-[#c99a45] transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Progetti</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0a1c2a] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#0a1c2a]">{kpi.totaleProgetti}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span>Portfolio 2026</span>
          </div>
        </div>

        {/* Attività Aperte */}
        <div
          onClick={() => onNavigateTab("attivita")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-amber-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Attività</span>
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-amber-700">{kpi.attivitaAperte}</div>
          <div className="text-[10px] sm:text-[11px] text-amber-600 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono font-semibold">
            <span>In lavorazione</span>
          </div>
        </div>

        {/* Manutenzioni */}
        <div
          onClick={() => onNavigateTab("barche")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-red-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Manutenzioni</span>
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-red-700">{kpi.manutenzioniTotali}</div>
          <div className="text-[10px] sm:text-[11px] text-red-600 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono font-semibold">
            <span>{kpi.manutenzioniDaFare} da eseguire</span>
          </div>
        </div>

        {/* Eventi */}
        <div
          onClick={() => onNavigateTab("eventi")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-blue-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Eventi</span>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-blue-900">{kpi.eventiProgrammati}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span>Regate e raduni</span>
          </div>
        </div>

        {/* Acquisti */}
        <div
          onClick={() => onNavigateTab("inventario")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-purple-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Acquisti</span>
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-purple-900">{kpi.acquistiDaFare}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span>Da ordinare</span>
          </div>
        </div>

        {/* Inventario */}
        <div
          onClick={() => onNavigateTab("inventario")}
          className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-emerald-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Inventario</span>
            <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-900">{kpi.inventarioTotale}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span>Beni censiti</span>
          </div>
        </div>

        {/* Account da rivedere */}
        <div
          onClick={() => onNavigateTab("account")}
          className="col-span-2 sm:col-span-1 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 hover:border-rose-400 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold">Account</span>
            <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-rose-700">{kpi.accountDaVerificare}</div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 mt-0.5 sm:mt-1 flex items-center gap-1 font-mono font-semibold">
            <span>Da revisionare</span>
          </div>
        </div>
      </div>

      {/* Priorità Immediate dal Foglio Excel Dashboard */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
              Priorità Immediate (Foglio Dashboard Excel)
            </h2>
          </div>
          <span className="text-[11px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
            Priorità Alta / Bloccanti
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {kpi.prioritaImmediate.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                  {item.id}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.titolo}</h3>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span className="text-[#0a1c2a] font-medium">{item.area}</span>
                    <span>•</span>
                    <span>Owner: {item.owner}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-100 text-red-800 rounded">
                  {item.priorita}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  {item.stato}
                </span>
                <button
                  onClick={() => onNavigateTab("attivita")}
                  className="text-xs text-[#0a1c2a] hover:text-[#c99a45] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Dettaglio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
