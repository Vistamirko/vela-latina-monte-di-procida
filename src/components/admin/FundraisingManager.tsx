"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import { FundraisingItem } from "@/lib/db/types";

export default function FundraisingManager() {
  const [items, setItems] = useState<FundraisingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState("tutti");

  // Modal
  const [modalItem, setModalItem] = useState<Partial<FundraisingItem> | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    // loading
    try {
      const res = await fetch("/api/fundraising");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data || []);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei dati fundraising");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/fundraising")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setItems(json.data || []);
        }
      })
      .catch(() => {
        if (!ignore) showToast("error", "Errore caricamento fundraising");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem || !modalItem.progetto) return;

    try {
      const res = await fetch("/api/fundraising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalItem),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio");
      showToast("success", "Iniziativa salvata con successo");
      setModalItem(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa iniziativa di raccolta fondi?")) return;
    try {
      const res = await fetch(`/api/fundraising?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Iniziativa eliminata");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare l'iniziativa");
    }
  };

  const filteredItems = items.filter((i) => {
    if (search && !i.progetto.toLowerCase().includes(search.toLowerCase()) && !i.categoria.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statoFilter !== "tutti" && i.stato !== statoFilter) {
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#c99a45]" />
            <span>Fundraising, Sponsor & Bandi Pubblici</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Monitoraggio campagna 5×1000, erogazioni liberali, sponsorizzazioni e contributi enti
          </p>
        </div>

        <button
          onClick={() =>
            setModalItem({
              progetto: "",
              categoria: "Raccolta fondi",
              descrizione: "",
              responsabile: "Consiglio Direttivo",
              stato: "Pianificato",
              priorita: "Alta",
              periodo: "Annuale",
              obiettivoEuro: 0,
              raccoltoEuro: 0,
            })
          }
          className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Campagna</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca campagna, sponsor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#c99a45]"
            />
          </div>

          <select
            value={statoFilter}
            onChange={(e) => setStatoFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
          >
            <option value="tutti">Tutti gli stati</option>
            <option value="Pianificato">Pianificato</option>
            <option value="In corso">In corso</option>
            <option value="Da fare">Da fare</option>
            <option value="Idea">Idea</option>
            <option value="Completato">Completato</option>
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Campagne: <strong>{filteredItems.length}</strong> su {items.length}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const pct =
            item.obiettivoEuro > 0
              ? Math.min(100, Math.round((item.raccoltoEuro / item.obiettivoEuro) * 100))
              : 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                  <span className="text-xs font-bold text-[#c99a45] bg-[#c99a45]/10 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.priorita === "Alta"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.priorita}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-slate-900 mb-1">
                  {item.progetto}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                    {item.categoria}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Periodo: <strong>{item.periodo}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-sans">
                  {item.descrizione}
                </p>

                {item.obiettivoEuro > 0 && (
                  <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Obiettivo:</span>
                      <span className="font-bold text-slate-900">€ {item.obiettivoEuro.toLocaleString("it-IT")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Raccolto:</span>
                      <span className="font-bold text-emerald-700">€ {item.raccoltoEuro.toLocaleString("it-IT")}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.stato === "In corso"
                      ? "bg-blue-100 text-blue-800"
                      : item.stato === "Pianificato"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.stato === "Idea"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.stato}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModalItem(item)}
                    className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-100 rounded"
                    title="Modifica"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#c99a45]" />
                <span>{modalItem.id ? "Modifica Iniziativa Fundraising" : "Nuova Iniziativa Fundraising"}</span>
              </h3>
              <button onClick={() => setModalItem(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Titolo Iniziativa / Progetto *</label>
                <input
                  type="text"
                  required
                  value={modalItem.progetto || ""}
                  onChange={(e) => setModalItem({ ...modalItem, progetto: e.target.value })}
                  placeholder="Es. Campagna 5×1000, Ricerca Sponsor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={modalItem.categoria || "Raccolta fondi"}
                    onChange={(e) => setModalItem({ ...modalItem, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Periodo</label>
                  <input
                    type="text"
                    value={modalItem.periodo || "Annuale"}
                    onChange={(e) => setModalItem({ ...modalItem, periodo: e.target.value })}
                    placeholder="Es. Aprile - Giugno"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Descrizione</label>
                <textarea
                  rows={2}
                  value={modalItem.descrizione || ""}
                  onChange={(e) => setModalItem({ ...modalItem, descrizione: e.target.value })}
                  placeholder="Descrizione degli obiettivi e delle attività..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Responsabile</label>
                  <input
                    type="text"
                    value={modalItem.responsabile || ""}
                    onChange={(e) => setModalItem({ ...modalItem, responsabile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Priorità</label>
                  <select
                    value={modalItem.priorita || "Alta"}
                    onChange={(e) => setModalItem({ ...modalItem, priorita: e.target.value as FundraisingItem["priorita"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Bassa">Bassa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Stato</label>
                  <select
                    value={modalItem.stato || "Pianificato"}
                    onChange={(e) => setModalItem({ ...modalItem, stato: e.target.value as FundraisingItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  >
                    <option value="Pianificato">Pianificato</option>
                    <option value="In corso">In corso</option>
                    <option value="Da fare">Da fare</option>
                    <option value="Idea">Idea</option>
                    <option value="Completato">Completato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Obiettivo (€)</label>
                  <input
                    type="number"
                    value={modalItem.obiettivoEuro || 0}
                    onChange={(e) => setModalItem({ ...modalItem, obiettivoEuro: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Raccolto (€)</label>
                  <input
                    type="number"
                    value={modalItem.raccoltoEuro || 0}
                    onChange={(e) => setModalItem({ ...modalItem, raccoltoEuro: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded"
                >
                  Salva Iniziativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
