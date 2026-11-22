"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { SocioItem } from "@/lib/db/types";
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Award,
  Phone,
  Mail,
  Send,
  RefreshCw,
} from "lucide-react";

interface LibroSociManagerProps {
  soci: SocioItem[];
  onReload: () => void;
  showToast: (type: "success" | "error", message: string) => void;
}

interface RenewalResultItem {
  socioId?: string;
  nome: string;
  email: string;
  sent: boolean;
  provider?: string;
  error?: string;
}

export default function LibroSociManager({
  soci,
  onReload,
  showToast,
}: LibroSociManagerProps) {
  const [selectedYear, setSelectedYear] = useState<number | "tutti">("tutti");
  const [search, setSearch] = useState("");
  const [onlyWithEmail, setOnlyWithEmail] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Stato Modale Richiesta Rinnovo
  const defaultRenewalYear = new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [renewalTargets, setRenewalTargets] = useState<SocioItem[]>([]);
  const [renewalYear, setRenewalYear] = useState<number>(defaultRenewalYear);
  const [renewalQuota, setRenewalQuota] = useState("50,00");
  const [renewalScadenza, setRenewalScadenza] = useState(`31 Gennaio ${defaultRenewalYear}`);
  const [renewalSubject, setRenewalSubject] = useState(
    `Rinnovo Tesseramento ${defaultRenewalYear} | Associazione Vela Latina Monte di Procida`
  );
  const [renewalMessage, setRenewalMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingRenewal, setSendingRenewal] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [renewalReport, setRenewalReport] = useState<{
    sentCount: number;
    failedCount: number;
    skippedCount: number;
    message: string;
    results: RenewalResultItem[];
  } | null>(null);

  // Normalizza soci: se presenti soci con anno 2024, sono della stagione 2026
  const normalizedSoci = useMemo(() => {
    return (soci || []).map((s) => (s.anno === 2024 ? { ...s, anno: 2026 } : s));
  }, [soci]);

  // Anni disponibili (liste ufficiali: 2026 e 2023)
  const availableYears = useMemo(() => {
    const set = new Set<number>([2026, 2023]);
    normalizedSoci.forEach((s) => {
      if (s.anno && s.anno !== 2024) set.add(s.anno);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [normalizedSoci]);

  // Filtra soci
  const filteredSoci = useMemo(() => {
    return normalizedSoci.filter((s) => {
      if (selectedYear !== "tutti" && s.anno !== selectedYear) {
        return false;
      }
      if (onlyWithEmail && !s.email?.trim()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.nome?.toLowerCase().includes(q);
        const matchPlace = s.dataLuogoNascita?.toLowerCase().includes(q);
        const matchTessera = String(s.numeroTessera || "").toLowerCase().includes(q);
        const matchCf = s.codiceFiscale?.toLowerCase().includes(q);
        const matchEmail = s.email?.toLowerCase().includes(q);
        const matchTel = s.telefono?.toLowerCase().includes(q);
        const matchNote = s.note?.toLowerCase().includes(q);
        if (!matchName && !matchPlace && !matchTessera && !matchCf && !matchEmail && !matchTel && !matchNote) {
          return false;
        }
      }
      return true;
    });
  }, [normalizedSoci, selectedYear, onlyWithEmail, search]);

  const filteredWithEmail = useMemo(
    () => filteredSoci.filter((s) => Boolean(s.email?.trim())),
    [filteredSoci]
  );

  const selectedSociWithEmail = useMemo(() => {
    const idSet = new Set(selectedIds);
    return normalizedSoci.filter((s) => idSet.has(s.id) && Boolean(s.email?.trim()));
  }, [normalizedSoci, selectedIds]);

  const allFilteredWithEmailSelected =
    filteredWithEmail.length > 0 &&
    filteredWithEmail.every((s) => selectedIds.includes(s.id));

  // Statistiche
  const stats = useMemo(() => {
    const total = normalizedSoci.length;
    const y2026 = normalizedSoci.filter((s) => s.anno === 2026).length;
    const y2023 = normalizedSoci.filter((s) => s.anno === 2023).length;
    const withEmail = normalizedSoci.filter((s) => Boolean(s.email?.trim())).length;
    return { total, y2026, y2023, withEmail };
  }, [normalizedSoci]);

  const toggleSelectSocio = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFilteredWithEmail = () => {
    if (allFilteredWithEmailSelected) {
      const toRemove = new Set(filteredWithEmail.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !toRemove.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filteredWithEmail.map((s) => s.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const openRenewalModal = (targets: SocioItem[]) => {
    const validTargets = targets.filter((s) => Boolean(s.email?.trim()));
    if (validTargets.length === 0) {
      showToast("error", "Nessun socio con indirizzo email valido selezionato.");
      return;
    }
    setRenewalTargets(validTargets);
    setRenewalReport(null);
    setRenewalModalOpen(true);
  };

  const handleRenewalYearChange = (yr: number) => {
    const prevYr = renewalYear;
    setRenewalYear(yr);
    setRenewalSubject((curr) =>
      curr.includes(String(prevYr)) ? curr.replaceAll(String(prevYr), String(yr)) : curr
    );
    setRenewalScadenza((curr) =>
      curr.includes(String(prevYr)) ? curr.replaceAll(String(prevYr), String(yr)) : curr
    );
  };

  const handleSendTestRenewal = async () => {
    if (!testEmail.trim()) {
      showToast("error", "Inserisci un indirizzo email per la prova.");
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch("/api/soci/rinnovo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          annoRinnovo: renewalYear,
          quota: renewalQuota.trim() || "50,00",
          scadenza: renewalScadenza.trim() || undefined,
          oggetto: renewalSubject.trim() || undefined,
          messaggioPersonalizzato: renewalMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante l'invio dell'email di prova");
      }
      showToast("success", data.message || `Email di prova inviata a ${testEmail.trim()}`);
    } catch (err: any) {
      showToast("error", err.message || "Impossibile inviare l'email di prova");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendRenewal = async () => {
    if (renewalTargets.length === 0) return;

    if (
      renewalTargets.length > 1 &&
      !confirm(
        `Confermi l'invio della mail di richiesta rinnovo ${renewalYear} a ${renewalTargets.length} soci?`
      )
    ) {
      return;
    }

    setSendingRenewal(true);
    setRenewalReport(null);
    try {
      const res = await fetch("/api/soci/rinnovo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socioIds: renewalTargets.map((s) => s.id),
          annoRinnovo: renewalYear,
          quota: renewalQuota.trim() || "50,00",
          scadenza: renewalScadenza.trim() || undefined,
          oggetto: renewalSubject.trim() || undefined,
          messaggioPersonalizzato: renewalMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.results) {
          setRenewalReport({
            sentCount: data.sentCount || 0,
            failedCount: data.failedCount || 0,
            skippedCount: data.skippedCount || 0,
            message: data.error || "Invio non riuscito",
            results: data.results,
          });
        }
        throw new Error(data.error || "Errore durante l'invio delle email di rinnovo");
      }

      setRenewalReport({
        sentCount: data.sentCount || 0,
        failedCount: data.failedCount || 0,
        skippedCount: data.skippedCount || 0,
        message: data.message,
        results: data.results || [],
      });
      showToast("success", data.message || "Email di rinnovo inviate con successo!");
      setSelectedIds([]);
    } catch (err: any) {
      showToast("error", err.message || "Errore durante l'invio delle email");
    } finally {
      setSendingRenewal(false);
    }
  };

  // Eliminazione
  const handleDeleteSocio = async (id: string, nome: string) => {
    if (!confirm(`Sei sicuro di voler eliminare dal Libro Soci: "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/soci?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Socio rimosso dal Libro");
      setSelectedIds((prev) => prev.filter((item) => item !== id));
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
            Gestione anagrafica soci, quote, tessere e invio richieste di rinnovo via email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              openRenewalModal(
                selectedSociWithEmail.length > 0 ? selectedSociWithEmail : filteredWithEmail
              )
            }
            disabled={
              selectedSociWithEmail.length === 0 && filteredWithEmail.length === 0
            }
            className="px-3.5 py-2 bg-[#b8860b] hover:bg-[#996f08] disabled:opacity-40 text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title={
              selectedSociWithEmail.length > 0
                ? `Invia richiesta rinnovo ai ${selectedSociWithEmail.length} soci selezionati`
                : `Invia richiesta rinnovo ai ${filteredWithEmail.length} soci con email nella vista corrente`
            }
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {selectedSociWithEmail.length > 0
                ? `Rinnovo Selezionati (${selectedSociWithEmail.length})`
                : `Richiesta Rinnovo (${filteredWithEmail.length})`}
            </span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 border border-slate-300 hover:border-emerald-700 hover:text-emerald-800 text-xs font-mono text-slate-800 flex items-center gap-2 transition-colors cursor-pointer bg-white shadow-2xs"
            title="Scarica foglio Excel (.csv formattato)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Esporta Excel (.csv)</span>
          </button>

          <Link
            href="/admin/soci/editor"
            className="px-3.5 py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi Socio</span>
          </Link>
        </div>
      </div>

      {/* Schede di Riepilogo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Totale Soci Archiviati</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-[#0a1c2a] mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">Entrambi gli elenchi ufficiali</div>
        </div>

        <div className="p-4 bg-white border border-emerald-300 bg-emerald-50/20">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">Anno 2026 (Iscritti Attivi)</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-emerald-900 mt-1">
            {stats.y2026}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Stagione corrente</div>
        </div>

        <div className="p-4 bg-white border border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Anno 2023 (Archivio Storico)</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-[#0a1c2a] mt-1">
            {stats.y2023}
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-0.5">Storico archiviato</div>
        </div>

        <div className="p-4 bg-white border border-amber-300 bg-amber-50/20">
          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Contattabili via Mail</div>
          <div className="text-2xl sm:text-3xl font-light font-['Cormorant_Garamond'] text-amber-900 mt-1">
            {stats.withEmail}
          </div>
          <div className="text-[10px] text-amber-700 font-mono mt-0.5">Pronti per invio rinnovo</div>
        </div>
      </div>

      {/* Barra Filtri Anno, Solo Email e Ricerca */}
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
            Tutti ({normalizedSoci.length})
          </button>

          {availableYears.map((yr) => {
            const count = normalizedSoci.filter((s) => s.anno === yr).length;
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

          <button
            onClick={() => setOnlyWithEmail((prev) => !prev)}
            className={`px-3 py-1.5 border cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              onlyWithEmail
                ? "bg-amber-700 text-white border-amber-700 font-bold"
                : "bg-white text-slate-700 border-slate-300 hover:border-amber-700"
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>Solo con Email ({stats.withEmail})</span>
          </button>

          {filteredWithEmail.length > 0 && (
            <button
              onClick={toggleSelectAllFilteredWithEmail}
              className="px-3 py-1.5 border border-slate-300 bg-[#fbfaf6] hover:border-[#0a1c2a] text-slate-700 cursor-pointer transition-colors"
            >
              {allFilteredWithEmailSelected
                ? "Deseleziona tutti"
                : `Seleziona con email (${filteredWithEmail.length})`}
            </button>
          )}
        </div>

        {/* Ricerca istantanea */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, CF, email, telefono..."
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

      {/* Barra selezione attiva */}
      {selectedSociWithEmail.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="text-amber-950 font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700" />
            <span>
              {selectedSociWithEmail.length}{" "}
              {selectedSociWithEmail.length === 1 ? "socio selezionato" : "soci selezionati"} per la richiesta di rinnovo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Annulla selezione
            </button>
            <button
              onClick={() => openRenewalModal(selectedSociWithEmail)}
              className="px-3 py-1 bg-[#0a1c2a] hover:bg-[#b8860b] text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Invia Richiesta Rinnovo</span>
            </button>
          </div>
        </div>
      )}

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
            {filteredSoci.map((item, idx) => {
              const hasEmail = Boolean(item.email?.trim());
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white border p-4 space-y-3 shadow-xs ${
                    isSelected ? "border-amber-500 ring-1 ring-amber-300" : "border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      {hasEmail && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectSocio(item.id)}
                          className="mt-1 h-4 w-4 accent-[#b8860b] cursor-pointer"
                          aria-label={`Seleziona ${item.nome}`}
                        />
                      )}
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
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openRenewalModal([item])}
                        disabled={!hasEmail}
                        className={`p-2 border transition-colors inline-flex items-center justify-center ${
                          hasEmail
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer"
                            : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                        }`}
                        title={
                          hasEmail
                            ? "Invia mail richiesta rinnovo"
                            : "Email non presente: modifica il socio per aggiungerla"
                        }
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/admin/soci/editor?id=${item.id}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Modifica socio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
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
                  {(item.telefono || item.email || item.note) && (
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-mono">
                      {(item.telefono || item.email) && (
                        <div className="flex flex-wrap gap-2">
                          {item.telefono && (
                            <a
                              href={`tel:${item.telefono}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] inline-flex items-center gap-1.5 font-semibold border border-slate-200"
                            >
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{item.telefono}</span>
                            </a>
                          )}
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] inline-flex items-center gap-1.5 border border-slate-200 truncate max-w-[220px]"
                            >
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate">{item.email}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {item.note && (
                        <div className="text-[10px] text-slate-500 leading-relaxed">
                          {item.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vista Tabella Desktop (>= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fbfaf6] border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-2.5 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredWithEmailSelected}
                      onChange={toggleSelectAllFilteredWithEmail}
                      disabled={filteredWithEmail.length === 0}
                      className="h-3.5 w-3.5 accent-[#b8860b] cursor-pointer"
                      title="Seleziona tutti i soci con email"
                    />
                  </th>
                  <th className="py-3 px-3 w-12 text-center">Nr.</th>
                  <th className="py-3 px-3 w-20 text-center">Tessera</th>
                  <th className="py-3 px-4">Cognome e Nome</th>
                  <th className="py-3 px-4">Data & Luogo di Nascita</th>
                  <th className="py-3 px-3 text-center">Anno</th>
                  <th className="py-3 px-3 text-right">Quota Cont. (€)</th>
                  <th className="py-3 px-3 text-right">Bonifico (Bon)</th>
                  <th className="py-3 px-3 text-center">S.O.</th>
                  <th className="py-3 px-4">Contatti</th>
                  <th className="py-3 px-3 text-center w-28">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredSoci.map((item, idx) => {
                  const hasEmail = Boolean(item.email?.trim());
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? "bg-amber-50/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!hasEmail}
                          onChange={() => toggleSelectSocio(item.id)}
                          className={`h-3.5 w-3.5 accent-[#b8860b] ${
                            hasEmail ? "cursor-pointer" : "opacity-25 cursor-not-allowed"
                          }`}
                          title={
                            hasEmail
                              ? `Seleziona ${item.nome} per invio rinnovo`
                              : "Nessun indirizzo email registrato"
                          }
                        />
                      </td>
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
                        {item.email && <div className="truncate max-w-[180px]" title={item.email}>{item.email}</div>}
                        {item.telefono && <div className="text-slate-500">{item.telefono}</div>}
                        {item.note && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={item.note}>
                            {item.note}
                          </div>
                        )}
                        {!item.email && !item.telefono && !item.note && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openRenewalModal([item])}
                            disabled={!hasEmail}
                            className={`p-1 transition-colors inline-flex items-center justify-center ${
                              hasEmail
                                ? "text-amber-700 hover:text-amber-900 cursor-pointer"
                                : "text-slate-200 cursor-not-allowed"
                            }`}
                            title={
                              hasEmail
                                ? `Invia mail richiesta rinnovo a ${item.email}`
                                : "Email non presente su questa scheda"
                            }
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/soci/editor?id=${item.id}`}
                            className="p-1 text-slate-500 hover:text-[#0a1c2a] transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Modifica socio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALE INVIO EMAIL RICHIESTA RINNOVO */}
      {renewalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            {/* Header Modale */}
            <div className="bg-[#0a1c2a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#c99a45]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c99a45] font-bold">
                  Segreteria · Campagna Rinnovi
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-light mt-0.5">
                  Invia Richiesta di Rinnovo via Email
                </h3>
              </div>
              <button
                onClick={() => setRenewalModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Riepilogo Destinatari */}
              <div className="p-3.5 bg-[#fbfaf6] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="uppercase tracking-wider font-bold text-[#0a1c2a]">
                    Destinatari ({renewalTargets.length}{" "}
                    {renewalTargets.length === 1 ? "socio" : "soci"})
                  </span>
                  <span className="text-slate-500">
                    Ogni socio riceve una mail personalizzata con nome e causale
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {renewalTargets.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-[11px] font-mono text-slate-700"
                    >
                      <span className="font-semibold text-[#0a1c2a]">{s.nome}</span>
                      <span className="text-slate-400">({s.email})</span>
                      {renewalTargets.length > 1 && (
                        <button
                          onClick={() =>
                            setRenewalTargets((prev) => prev.filter((item) => item.id !== s.id))
                          }
                          className="text-slate-400 hover:text-red-600 ml-0.5 cursor-pointer"
                          title="Rimuovi destinatario"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Campi Parametri Rinnovo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Anno Rinnovo *
                  </label>
                  <input
                    type="number"
                    min={2025}
                    max={2035}
                    value={renewalYear}
                    onChange={(e) =>
                      handleRenewalYearChange(parseInt(e.target.value, 10) || defaultRenewalYear)
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Quota Annuale (€)
                  </label>
                  <input
                    type="text"
                    value={renewalQuota}
                    onChange={(e) => setRenewalQuota(e.target.value)}
                    placeholder="50,00"
                    className="w-full px-3 py-2 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Scadenza (opzionale)
                  </label>
                  <input
                    type="text"
                    value={renewalScadenza}
                    onChange={(e) => setRenewalScadenza(e.target.value)}
                    placeholder="es. 31 Gennaio 2027"
                    className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Oggetto Email
                </label>
                <input
                  type="text"
                  value={renewalSubject}
                  onChange={(e) => setRenewalSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Messaggio Personalizzato del Direttivo (opzionale)
                </label>
                <textarea
                  rows={3}
                  value={renewalMessage}
                  onChange={(e) => setRenewalMessage(e.target.value)}
                  placeholder="Es. Ti aspettiamo alla prossima assemblea soci al porticciolo di Acquamorta per presentare il calendario regate e il Progetto ROSA..."
                  className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a]"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-light">
                  La mail include già automaticamente saluto personalizzato, IBAN ufficiale dell&apos;Associazione, causale con nome socio e istruzioni per inviare la ricevuta.
                </p>
              </div>

              {/* Invio Mail di Prova */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-widest text-slate-600 font-bold">
                  Anteprima &amp; Invio di Prova (opzionale)
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Inserisci la tua email per ricevere una prova..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0a1c2a]"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestRenewal}
                    disabled={sendingTest || !testEmail.trim()}
                    className="px-3.5 py-1.5 border border-[#0a1c2a] bg-white hover:bg-[#0a1c2a] hover:text-white text-[#0a1c2a] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {sendingTest ? "Invio prova..." : "Invia Prova"}
                  </button>
                </div>
              </div>

              {/* Report Risultati Invio */}
              {renewalReport && (
                <div
                  className={`p-4 border text-xs font-mono space-y-2 ${
                    renewalReport.failedCount === 0
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {renewalReport.failedCount === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <span>{renewalReport.message}</span>
                  </div>
                  {renewalReport.results.length > 0 && (
                    <div className="max-h-36 overflow-y-auto divide-y divide-black/5 bg-white/80 border border-black/10 px-2.5 py-1">
                      {renewalReport.results.map((r, i) => (
                        <div key={`${r.email}-${i}`} className="py-1 flex items-center justify-between gap-2 text-[11px]">
                          <span className="truncate">
                            <strong>{r.nome}</strong> · {r.email}
                          </span>
                          {r.sent ? (
                            <span className="text-emerald-700 font-bold shrink-0">
                              ✓ Inviata ({r.provider || "ok"})
                            </span>
                          ) : (
                            <span className="text-red-700 shrink-0" title={r.error}>
                              ✗ {r.error || "Errore"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Azioni Modale */}
            <div className="px-6 py-4 bg-[#fbfaf6] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRenewalModalOpen(false)}
                disabled={sendingRenewal}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono font-semibold text-slate-700 cursor-pointer"
              >
                Chiudi
              </button>
              <button
                type="button"
                onClick={handleSendRenewal}
                disabled={sendingRenewal || renewalTargets.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {sendingRenewal ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Invio in corso ({renewalTargets.length})...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      Invia Richiesta Rinnovo ({renewalTargets.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
