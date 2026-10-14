"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ship,
  Wrench,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Anchor,
  Shield,
  X,
  Search,
} from "lucide-react";
import Image from "next/image";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import ImageUploader from "@/components/ImageUploader";
import { BarcaItem, ManutenzioneItem } from "@/lib/db/types";

export default function BarcheManager() {
  const [activeSubTab, setActiveSubTab] = useState<"barche" | "manutenzioni">("barche");
  const [barche, setBarche] = useState<BarcaItem[]>([]);
  const [manutenzioni, setManutenzioni] = useState<ManutenzioneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [barcaFilter, setBarcaFilter] = useState("tutte");
  const [statoFilter, setStatoFilter] = useState("tutti");
  const [prioritaFilter, setPrioritaFilter] = useState("tutte");

  // Modals
  const [modalBarca, setModalBarca] = useState<Partial<BarcaItem> | null>(null);
  const [modalManutenzione, setModalManutenzione] = useState<Partial<ManutenzioneItem> | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/barche");
      const json = await res.json();
      if (json.success && json.data) {
        setBarche(json.data.barche || []);
        setManutenzioni(json.data.manutenzioni || []);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei dati della flotta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/barche")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setBarche(json.data.barche || []);
          setManutenzioni(json.data.manutenzioni || []);
        }
      })
      .catch(() => {
        if (!ignore) showToast("error", "Errore caricamento flotta");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Barca actions
  const handleSaveBarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBarca || !modalBarca.nome) return;

    try {
      const res = await fetch("/api/barche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "barca", ...modalBarca }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio barca");
      showToast("success", `Imbarcazione ${modalBarca.nome} salvata con successo`);
      setModalBarca(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteBarca = async (id: string, nome: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la scheda di "${nome}"?`)) return;
    try {
      const res = await fetch(`/api/barche?type=barca&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Imbarcazione eliminata");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare l'imbarcazione");
    }
  };

  // Manutenzione actions
  const handleSaveManutenzione = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalManutenzione || !modalManutenzione.barcaAttrezzatura || !modalManutenzione.intervento) return;

    try {
      const res = await fetch("/api/barche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "manutenzione", ...modalManutenzione }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio manutenzione");
      showToast("success", "Intervento salvato con successo");
      setModalManutenzione(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteManutenzione = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo intervento?")) return;
    try {
      const res = await fetch(`/api/barche?type=manutenzione&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Intervento eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare l'intervento");
    }
  };

  const handleToggleManutenzioneStato = async (item: ManutenzioneItem) => {
    const nextStato: ManutenzioneItem["stato"] =
      item.stato === "Da fare"
        ? "In corso"
        : item.stato === "In corso"
        ? "Completata"
        : "Da fare";

    try {
      const res = await fetch("/api/barche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "manutenzione",
          ...item,
          stato: nextStato,
          dataCompletamento: nextStato === "Completata" ? new Date().toISOString().split("T")[0] : "",
        }),
      });
      if (!res.ok) throw new Error();
      showToast("success", `Stato intervento aggiornato a: ${nextStato}`);
      loadData();
    } catch {
      showToast("error", "Errore aggiornamento stato");
    }
  };

  // Filtered lists
  const filteredBarche = barche.filter((b) => {
    if (searchFilter && !b.nome.toLowerCase().includes(searchFilter.toLowerCase()) && !b.tipologia.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredManutenzioni = manutenzioni.filter((m) => {
    if (searchFilter && !m.intervento.toLowerCase().includes(searchFilter.toLowerCase()) && !m.barcaAttrezzatura.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (barcaFilter !== "tutte" && m.barcaAttrezzatura !== barcaFilter) {
      return false;
    }
    if (statoFilter !== "tutti" && m.stato !== statoFilter) {
      return false;
    }
    if (prioritaFilter !== "tutte" && m.priorita !== prioritaFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c99a45] border-t-transparent rounded-full animate-spin"></div>
        <span>Caricamento dati in corso...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-mono font-semibold shadow-lg border rounded flex items-center gap-2 ${
            toast.type === "success" ? "bg-[#0a1c2a] text-white border-slate-700" : "bg-red-700 text-white border-red-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-white" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Sub Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("barche")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "barche"
                ? "bg-[#0a1c2a] text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Flotta Imbarcazioni ({barche.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("manutenzioni")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "manutenzioni"
                ? "bg-[#0a1c2a] text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Piano Manutenzioni ({manutenzioni.length})</span>
            {manutenzioni.filter((m) => m.stato === "Da fare").length > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] bg-red-600 text-white rounded-full font-bold">
                {manutenzioni.filter((m) => m.stato === "Da fare").length}
              </span>
            )}
          </button>
        </div>

        <div>
          {activeSubTab === "barche" ? (
            <button
              onClick={() =>
                setModalBarca({
                  nome: "",
                  tipologia: "Barca a vela Latina",
                  ormeggio: "Darsena comunale di Monte di Procida",
                  stato: "Operativa",
                  responsabili: "Team Vela Latina",
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuova Barca</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setModalManutenzione({
                  barcaAttrezzatura: "Janara",
                  tipo: "Ordinaria",
                  intervento: "",
                  owner: "Susy",
                  priorita: "Alta",
                  stato: "Da fare",
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Intervento</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: BARCHE */}
      {activeSubTab === "barche" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBarche.map((barca) => (
              <div
                key={barca.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Immagine / Placeholder Foto Mancante */}
                <div className="relative h-40 w-full bg-slate-50 border-b border-slate-200 overflow-hidden flex items-center justify-center">
                  {barca.foto ? (
                    <Image
                      src={barca.foto}
                      alt={barca.nome}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <PhotoPlaceholder title={`Barca: ${barca.nome}`} className="border-0 bg-transparent min-h-0" />
                  )}
                  {barca.foto && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-bold rounded">
                      Foto attiva
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#c99a45] font-bold tracking-wider">
                        {barca.id}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-slate-900">{barca.nome}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                        barca.stato === "Operativa"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {barca.stato}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 font-medium leading-snug">
                    {barca.tipologia}
                  </p>

                  <div className="space-y-2 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                      <Anchor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{barca.ormeggio}</span>
                    </div>
                    {barca.responsabili && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold shrink-0">Resp:</span>
                        <span className="text-slate-700 truncate">{barca.responsabili}</span>
                      </div>
                    )}
                    {barca.assicurazione && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-700 truncate">{barca.assicurazione}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    {manutenzioni.filter((m) => m.barcaAttrezzatura.toLowerCase() === barca.nome.toLowerCase()).length} interventi
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalBarca(barca)}
                      className="p-1.5 text-slate-600 hover:text-[#0a1c2a] hover:bg-slate-200 rounded transition-colors"
                      title="Modifica barca"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBarca(barca.id, barca.nome)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Elimina barca"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MANUTENZIONI */}
      {activeSubTab === "manutenzioni" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca intervento..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#c99a45]"
                />
              </div>

              <select
                value={barcaFilter}
                onChange={(e) => setBarcaFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              >
                <option value="tutte">Tutte le barche</option>
                {Array.from(new Set(manutenzioni.map((m) => m.barcaAttrezzatura))).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={statoFilter}
                onChange={(e) => setStatoFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="Da fare">Da fare</option>
                <option value="In corso">In corso</option>
                <option value="Completata">Completata</option>
              </select>

              <select
                value={prioritaFilter}
                onChange={(e) => setPrioritaFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              >
                <option value="tutte">Tutte le priorità</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Bassa">Bassa</option>
              </select>
            </div>

            <div className="text-slate-500 text-[11px]">
              Visualizzati: <strong>{filteredManutenzioni.length}</strong> su {manutenzioni.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Codice</th>
                  <th className="py-3 px-4">Barca / Oggetto</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Intervento</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Priorità</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredManutenzioni.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{m.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#0a1c2a] flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-[#c99a45]" />
                      <span>{m.barcaAttrezzatura}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {m.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 max-w-xs truncate">
                      {m.intervento}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.owner || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.priorita === "Alta"
                            ? "bg-red-100 text-red-800"
                            : m.priorita === "Media"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.priorita}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleManutenzioneStato(m)}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          m.stato === "Completata"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : m.stato === "In corso"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                        title="Clicca per avanzare lo stato"
                      >
                        {m.stato === "Completata" && <CheckCircle2 className="w-3 h-3" />}
                        {m.stato === "In corso" && <Clock className="w-3 h-3" />}
                        {m.stato === "Da fare" && <AlertCircle className="w-3 h-3" />}
                        <span>{m.stato}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModalManutenzione(m)}
                          className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-200 rounded"
                          title="Modifica"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteManutenzione(m.id)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Elimina"
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

      {/* MODAL BARCA */}
      {modalBarca && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#c99a45]" />
                <span>{modalBarca.id ? "Modifica Barca" : "Aggiungi Imbarcazione"}</span>
              </h3>
              <button
                onClick={() => setModalBarca(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBarca} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Nome Barca *</label>
                <input
                  type="text"
                  required
                  value={modalBarca.nome || ""}
                  onChange={(e) => setModalBarca({ ...modalBarca, nome: e.target.value })}
                  placeholder="Es. Janara"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <ImageUploader
                  label="Fotografia Ufficiale Imbarcazione"
                  value={modalBarca.foto || ""}
                  onChange={(url) => setModalBarca({ ...modalBarca, foto: url })}
                  placeholder="/images/janara-regatta.jpeg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Tipologia</label>
                  <input
                    type="text"
                    value={modalBarca.tipologia || ""}
                    onChange={(e) => setModalBarca({ ...modalBarca, tipologia: e.target.value })}
                    placeholder="Es. Barca a vela Latina"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Stato Operativo</label>
                  <select
                    value={modalBarca.stato || "Operativa"}
                    onChange={(e) => setModalBarca({ ...modalBarca, stato: e.target.value as BarcaItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Operativa">Operativa</option>
                    <option value="In restauro">In restauro</option>
                    <option value="In manutenzione">In manutenzione</option>
                    <option value="Disarmata">Disarmata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Ormeggio / Ubicazione</label>
                <input
                  type="text"
                  value={modalBarca.ormeggio || ""}
                  onChange={(e) => setModalBarca({ ...modalBarca, ormeggio: e.target.value })}
                  placeholder="Es. Darsena comunale di Monte di Procida"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Responsabili / Owner</label>
                  <input
                    type="text"
                    value={modalBarca.responsabili || ""}
                    onChange={(e) => setModalBarca({ ...modalBarca, responsabili: e.target.value })}
                    placeholder="Es. Susy / Antonio Pugliese"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Polizza Assicurativa</label>
                  <input
                    type="text"
                    value={modalBarca.assicurazione || ""}
                    onChange={(e) => setModalBarca({ ...modalBarca, assicurazione: e.target.value })}
                    placeholder="Es. Polizza RC Terzi 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Dotazioni di bordo</label>
                <textarea
                  rows={2}
                  value={modalBarca.dotazioni || ""}
                  onChange={(e) => setModalBarca({ ...modalBarca, dotazioni: e.target.value })}
                  placeholder="Vele tradizionali, timone, antenna, remi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBarca(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] hover:bg-[#142838] text-white font-mono font-bold rounded cursor-pointer"
                >
                  Salva Scheda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MANUTENZIONE */}
      {modalManutenzione && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#c99a45]" />
                <span>{modalManutenzione.id ? "Modifica Intervento" : "Nuovo Intervento Manutenzione"}</span>
              </h3>
              <button
                onClick={() => setModalManutenzione(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManutenzione} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Barca / Attrezzatura *</label>
                  <input
                    type="text"
                    required
                    value={modalManutenzione.barcaAttrezzatura || ""}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, barcaAttrezzatura: e.target.value })}
                    placeholder="Es. Janara, San Michele, Carrello..."
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Tipo Intervento</label>
                  <select
                    value={modalManutenzione.tipo || "Ordinaria"}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, tipo: e.target.value as ManutenzioneItem["tipo"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Ordinaria">Ordinaria</option>
                    <option value="Straordinaria">Straordinaria</option>
                    <option value="Revisione">Revisione</option>
                    <option value="Miglioria">Miglioria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Intervento da Eseguire *</label>
                <input
                  type="text"
                  required
                  value={modalManutenzione.intervento || ""}
                  onChange={(e) => setModalManutenzione({ ...modalManutenzione, intervento: e.target.value })}
                  placeholder="Es. Albero nuovo, Antenna nuova, Revisione completa..."
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Owner / Resp.</label>
                  <input
                    type="text"
                    value={modalManutenzione.owner || ""}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, owner: e.target.value })}
                    placeholder="Es. Susy"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Priorità</label>
                  <select
                    value={modalManutenzione.priorita || "Alta"}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, priorita: e.target.value as ManutenzioneItem["priorita"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Critica">Critica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Bassa">Bassa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Stato</label>
                  <select
                    value={modalManutenzione.stato || "Da fare"}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, stato: e.target.value as ManutenzioneItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Da fare">Da fare</option>
                    <option value="In corso">In corso</option>
                    <option value="Pianificata">Pianificata</option>
                    <option value="Completata">Completata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Data Prevista</label>
                  <input
                    type="date"
                    value={modalManutenzione.dataPrevista || ""}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, dataPrevista: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Costo Stimato (€)</label>
                  <input
                    type="text"
                    value={modalManutenzione.costo || ""}
                    onChange={(e) => setModalManutenzione({ ...modalManutenzione, costo: e.target.value })}
                    placeholder="Es. 350"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalManutenzione(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] hover:bg-[#142838] text-white font-mono font-bold rounded cursor-pointer"
                >
                  Salva Intervento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
