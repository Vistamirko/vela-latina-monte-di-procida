"use client";

import { useState, useMemo } from "react";
import { SocioItem } from "@/lib/db/types";
import {
  Users,
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  X,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  Award,
} from "lucide-react";

interface LibroSociManagerProps {
  soci: SocioItem[];
  onReload: () => void;
  showToast: (type: "success" | "error", message: string) => void;
}

export default function LibroSociManager({
  soci,
  onReload,
  showToast,
}: LibroSociManagerProps) {
  const [selectedYear, setSelectedYear] = useState<number | "tutti">("tutti");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSocio, setCurrentSocio] = useState<Partial<SocioItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Anni disponibili
  const availableYears = useMemo(() => {
    const set = new Set<number>([2026, 2024, 2023]);
    soci.forEach((s) => {
      if (s.anno) set.add(s.anno);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [soci]);

  // Filtra soci
  const filteredSoci = useMemo(() => {
    return soci.filter((s) => {
      if (selectedYear !== "tutti" && s.anno !== selectedYear) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.nome?.toLowerCase().includes(q);
        const matchPlace = s.dataLuogoNascita?.toLowerCase().includes(q);
        const matchTessera = String(s.numeroTessera || "").toLowerCase().includes(q);
        const matchCf = s.codiceFiscale?.toLowerCase().includes(q);
        const matchEmail = s.email?.toLowerCase().includes(q);
        if (!matchName && !matchPlace && !matchTessera && !matchCf && !matchEmail) {
          return false;
        }
      }
      return true;
    });
  }, [soci, selectedYear, search]);

  // Statistiche
  const stats = useMemo(() => {
    const total = soci.length;
    const y2026 = soci.filter((s) => s.anno === 2026).length;
    const y2024 = soci.filter((s) => s.anno === 2024).length;
    const y2023 = soci.filter((s) => s.anno === 2023).length;
    return { total, y2026, y2024, y2023 };
  }, [soci]);

  // Salvataggio / Modifica Socio
  const handleSaveSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSocio?.nome) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/soci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSocio),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante il salvataggio");
      }

      showToast("success", currentSocio.id ? "Socio aggiornato con successo" : "Nuovo socio registrato");
      setModalOpen(false);
      setCurrentSocio(null);
      onReload();
    } catch (err: any) {
      showToast("error", err.message || "Errore");
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminazione
  const handleDeleteSocio = async (id: string, nome: string) => {
    if (!confirm(`Sei sicuro di voler eliminare dal Libro Soci: "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/soci?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Socio rimosso dal Libro");
      onReload();
    } catch {
      showToast("error", "Impossibile rimuovere il socio");
    }
  };

  // Download export CSV Excel
  const handleDownloadExcel = () => {
    const url = `/api/soci/export${selectedYear !== "tutti" ? `?anno=${selectedYear}` : ""}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#b8860b] uppercase font-bold tracking-widest mb-1">
            <Award className="w-4 h-4" />
            <span>Registro Ufficiale Associazione APS</span>
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
            Libro Soci & Registro Iscritti
          </h2>
          <p className="text-xs text-slate-700 font-light mt-1">
            Gestione anagrafica soci, quote e tessere (storico 2023-2024 importato da Excel e nuove registrazioni 2026).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 border border-slate-300 hover:border-emerald-700 hover:text-emerald-800 text-xs font-mono text-slate-800 flex items-center gap-2 transition-colors cursor-pointer bg-white shadow-2xs"
            title="Scarica foglio Excel (.csv formattato)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Esporta Excel (.csv)</span>
          </button>

          <button
            onClick={() => {
              setCurrentSocio({
                anno: selectedYear !== "tutti" ? selectedYear : 2026,
                tipologia: "Socio Ordinario",
                dataIscrizione: new Date().toISOString().split("T")[0],
                socioOnorario: false,
              });
              setModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi Socio</span>
          </button>
        </div>
      </div>

      {/* Schede di Riepilogo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Totale Soci</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-[#0a1c2a] mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">Tutti gli anni archiviati</div>
        </div>

        <div className="p-4 bg-white border border-emerald-300 bg-emerald-50/20">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">Anno 2026 (Attivi)</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-emerald-900 mt-1">
            {stats.y2026}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Iscritti stagione corrente</div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Anno 2024</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-[#0a1c2a] mt-1">
            {stats.y2024}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">Registro storico 2024</div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Anno 2023</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-[#0a1c2a] mt-1">
            {stats.y2023}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">Registro storico 2023</div>
        </div>
      </div>

      {/* Barra Filtri Anno e Ricerca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-200 pt-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedYear("tutti")}
            className={`px-3 py-1.5 border cursor-pointer transition-colors ${
              selectedYear === "tutti"
                ? "bg-[#0a1c2a] text-white border-[#0a1c2a] font-bold"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
            }`}
          >
            Tutti ({soci.length})
          </button>

          {availableYears.map((yr) => {
            const count = soci.filter((s) => s.anno === yr).length;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                  selectedYear === yr
                    ? yr === 2026
                      ? "bg-emerald-700 text-white border-emerald-700 font-bold"
                      : "bg-[#0a1c2a] text-white border-[#0a1c2a] font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                {yr} ({count})
              </button>
            );
          })}
        </div>

        {/* Ricerca istantanea */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, nascita, tessera..."
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabella Soci */}
      {filteredSoci.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a]">
            Nessun socio trovato
          </h3>
          <p className="text-xs text-slate-700 max-w-sm mx-auto font-light">
            Nessun record corrisponde ai filtri selezionati (Anno: {selectedYear}, Ricerca: &quot;{search}&quot;).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vista Mobile Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredSoci.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-slate-300 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">
                        #{item.progressivo || idx + 1}
                      </span>
                      {item.numeroTessera && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px] font-mono">
                          Tessera #{item.numeroTessera}
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                          item.anno === 2026
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.anno}
                      </span>
                      {item.socioOnorario && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 text-[9px] font-bold font-mono">
                          S.O.
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#0a1c2a] mt-1 font-sans">
                      {item.nome}
                    </h4>
                    {item.tipologia && item.tipologia !== "Socio Ordinario" && (
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {item.tipologia}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setCurrentSocio(item);
                        setModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                      title="Modifica socio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSocio(item.id, item.nome)}
                      className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-700 border border-slate-300 transition-colors cursor-pointer"
                      title="Elimina socio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dati Anagrafici & Quote */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {item.dataLuogoNascita && (
                    <div className="col-span-2 text-slate-600 text-[11px]">
                      <span className="text-slate-400 block text-[9px] uppercase">Nascita</span>
                      {item.dataLuogoNascita}
                    </div>
                  )}
                  {item.codiceFiscale && (
                    <div className="col-span-2 text-slate-700 text-[11px]">
                      <span className="text-slate-400 block text-[9px] uppercase">Codice Fiscale</span>
                      <span className="font-bold">{item.codiceFiscale}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Quota Contanti</span>
                    <span className="font-semibold text-slate-800">
                      {item.quotaContanti ? `${item.quotaContanti} €` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Quota Bonifico</span>
                    <span className="font-semibold text-slate-800">
                      {item.quotaBonifico ? `${item.quotaBonifico} €` : "—"}
                    </span>
                  </div>
                </div>

                {/* Contatti Rapidi */}
                {(item.telefono || item.email) && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono">
                    {item.telefono && (
                      <a
                        href={`tel:${item.telefono}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] flex items-center gap-1 font-semibold border border-slate-200"
                      >
                        📞 {item.telefono}
                      </a>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] flex items-center gap-1 border border-slate-200 truncate max-w-[220px]"
                      >
                        ✉️ {item.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista Tabella Desktop (>= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fbfaf6] border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-3 w-12 text-center">Nr.</th>
                  <th className="py-3 px-3 w-20 text-center">Tessera</th>
                  <th className="py-3 px-4">Cognome e Nome</th>
                  <th className="py-3 px-4">Data & Luogo di Nascita</th>
                  <th className="py-3 px-3 text-center">Anno</th>
                  <th className="py-3 px-3 text-right">Quota Cont. (€)</th>
                  <th className="py-3 px-3 text-right">Bonifico (Bon)</th>
                  <th className="py-3 px-3 text-center">S.O.</th>
                  <th className="py-3 px-4">Contatti</th>
                  <th className="py-3 px-3 text-center w-20">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredSoci.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                      {item.progressivo || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.numeroTessera ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-xs inline-block">
                          #{item.numeroTessera}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-medium text-[#0a1c2a]">
                      <div className="font-semibold">{item.nome}</div>
                      {item.tipologia && item.tipologia !== "Socio Ordinario" && (
                        <div className="text-[10px] text-slate-500 font-mono">{item.tipologia}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 text-[11px]">
                      {item.dataLuogoNascita || <span className="text-slate-300">—</span>}
                      {item.codiceFiscale && (
                        <div className="text-[10px] text-slate-500 font-mono">CF: {item.codiceFiscale}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded-xs font-bold ${
                          item.anno === 2026
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.anno}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 font-semibold">
                      {item.quotaContanti ? `${item.quotaContanti} €` : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 font-semibold">
                      {item.quotaBonifico ? `${item.quotaBonifico} €` : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.socioOnorario ? (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 text-[9px] font-bold rounded-xs">
                          S.O.
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-600">
                      {item.email && <div className="truncate max-w-[150px]">{item.email}</div>}
                      {item.telefono && <div className="text-slate-500">{item.telefono}</div>}
                      {!item.email && !item.telefono && <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setCurrentSocio(item);
                            setModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-[#0a1c2a] transition-colors cursor-pointer"
                          title="Modifica socio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSocio(item.id, item.nome)}
                          className="p-1 text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                          title="Elimina socio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Aggiungi / Modifica Socio */}
      {modalOpen && currentSocio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setModalOpen(false);
                setCurrentSocio(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a] mb-1">
              {currentSocio.id ? "Modifica Dati Socio" : "Nuova Iscrizione Libro Soci"}
            </h3>
            <p className="text-xs text-slate-600 font-light mb-6">
              Inserisci i dati anagrafici e la quota registrata nel registro soci.
            </p>

            <form onSubmit={handleSaveSocio} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Cognome e Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSocio.nome || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, nome: e.target.value })}
                    placeholder="es. Mario Rossi"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Anno Sociale *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentSocio.anno || 2026}
                    onChange={(e) =>
                      setCurrentSocio({ ...currentSocio, anno: parseInt(e.target.value, 10) || 2026 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Data & Luogo di Nascita
                  </label>
                  <input
                    type="text"
                    value={currentSocio.dataLuogoNascita || ""}
                    onChange={(e) =>
                      setCurrentSocio({ ...currentSocio, dataLuogoNascita: e.target.value })
                    }
                    placeholder="es. 15.7.1984 Napoli"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={currentSocio.codiceFiscale || ""}
                    onChange={(e) =>
                      setCurrentSocio({ ...currentSocio, codiceFiscale: e.target.value.toUpperCase() })
                    }
                    placeholder="RSSMRA84L15F839X"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Nr. Tessera
                  </label>
                  <input
                    type="text"
                    value={currentSocio.numeroTessera || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, numeroTessera: e.target.value })}
                    placeholder="es. 94"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Quota Contanti (€)
                  </label>
                  <input
                    type="text"
                    value={currentSocio.quotaContanti || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, quotaContanti: e.target.value })}
                    placeholder="es. 50"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Quota Bonifico (Bon)
                  </label>
                  <input
                    type="text"
                    value={currentSocio.quotaBonifico || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, quotaBonifico: e.target.value })}
                    placeholder="es. 50"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentSocio.email || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, email: e.target.value })}
                    placeholder="socio@esempio.it"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={currentSocio.telefono || ""}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, telefono: e.target.value })}
                    placeholder="+39 333 1234567"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Tipologia Socio
                  </label>
                  <input
                    type="text"
                    value={currentSocio.tipologia || "Socio Ordinario"}
                    onChange={(e) => setCurrentSocio({ ...currentSocio, tipologia: e.target.value })}
                    placeholder="Socio Ordinario / Praticante"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={Boolean(currentSocio.socioOnorario)}
                      onChange={(e) =>
                        setCurrentSocio({ ...currentSocio, socioOnorario: e.target.checked })
                      }
                      className="h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a]"
                    />
                    <span>Socio Onorario (S.O.)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={currentSocio.note || ""}
                  onChange={(e) => setCurrentSocio({ ...currentSocio, note: e.target.value })}
                  placeholder="Note varie..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setCurrentSocio(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Salvataggio..." : "Salva Socio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
