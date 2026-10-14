"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Boxes,
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import { InventarioItem, AcquistoItem } from "@/lib/db/types";

export default function InventarioManager() {
  const [activeTab, setActiveTab] = useState<"inventario" | "acquisti">("inventario");
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [acquisti, setAcquisti] = useState<AcquistoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("tutte");
  const [statoFilter, setStatoFilter] = useState("tutti");

  // Modals
  const [modalInv, setModalInv] = useState<Partial<InventarioItem> | null>(null);
  const [modalAcq, setModalAcq] = useState<Partial<AcquistoItem> | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    // loading
    try {
      const res = await fetch("/api/inventario");
      const json = await res.json();
      if (json.success && json.data) {
        setInventario(json.data.inventario || []);
        setAcquisti(json.data.acquisti || []);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei dati inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/inventario")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setInventario(json.data.inventario || []);
          setAcquisti(json.data.acquisti || []);
        }
      })
      .catch(() => {
        if (!ignore) showToast("error", "Errore caricamento inventario");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Inventario Actions
  const handleSaveInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInv || !modalInv.oggetto) return;

    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "inventario", ...modalInv }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore");
      showToast("success", "Articolo inventario salvato");
      setModalInv(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteInventario = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo articolo dall'inventario?")) return;
    try {
      const res = await fetch(`/api/inventario?type=inventario&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Articolo eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare l'articolo");
    }
  };

  // Acquisti Actions
  const handleSaveAcquisto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAcq || !modalAcq.oggetto) return;

    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "acquisto", ...modalAcq }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore");
      showToast("success", "Voce piano acquisti salvata");
      setModalAcq(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteAcquisto = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa voce di acquisto?")) return;
    try {
      const res = await fetch(`/api/inventario?type=acquisto&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Voce acquisto eliminata");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare la voce");
    }
  };

  // Filtered
  const filteredInventario = inventario.filter((i) => {
    if (search && !i.oggetto.toLowerCase().includes(search.toLowerCase()) && !i.categoria.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoriaFilter !== "tutte" && i.categoria !== categoriaFilter) {
      return false;
    }
    if (statoFilter !== "tutti" && i.stato !== statoFilter) {
      return false;
    }
    return true;
  });

  const filteredAcquisti = acquisti.filter((a) => {
    if (search && !a.oggetto.toLowerCase().includes(search.toLowerCase()) && !a.categoria.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statoFilter !== "tutti" && a.stato !== statoFilter) {
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

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("inventario")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "inventario" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventario Attrezzature ({inventario.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("acquisti")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "acquisti" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Piano Acquisti & Fornitori ({acquisti.length})</span>
          </button>
        </div>

        <div>
          {activeTab === "inventario" ? (
            <button
              onClick={() =>
                setModalInv({
                  oggetto: "",
                  categoria: "Informatica",
                  quantita: "1",
                  unita: "pz",
                  posizione: "Sede Sociale",
                  responsabile: "Staff Vela Latina",
                  stato: "In uso",
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Articolo</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setModalAcq({
                  oggetto: "",
                  categoria: "Audio",
                  quantita: "1",
                  priorita: "Alta",
                  stato: "Da acquistare",
                  richiedente: "Consiglio Direttivo",
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Acquisto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca per nome o categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#c99a45]"
            />
          </div>

          {activeTab === "inventario" && (
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="tutte">Tutte le categorie</option>
              {Array.from(new Set(inventario.map((i) => i.categoria))).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <select
            value={statoFilter}
            onChange={(e) => setStatoFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
          >
            <option value="tutti">Tutti gli stati</option>
            {activeTab === "inventario" ? (
              <>
                <option value="In uso">In uso</option>
                <option value="Da acquistare">Da acquistare</option>
                <option value="Da revisionare">Da revisionare</option>
                <option value="Dismesso">Dismesso</option>
              </>
            ) : (
              <>
                <option value="Da acquistare">Da acquistare</option>
                <option value="Da valutare">Da valutare</option>
                <option value="Ordinato">Ordinato</option>
                <option value="Ricevuto">Ricevuto</option>
              </>
            )}
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Record: <strong>{activeTab === "inventario" ? filteredInventario.length : filteredAcquisti.length}</strong>
        </div>
      </div>

      {/* TAB 1: INVENTARIO */}
      {activeTab === "inventario" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Codice</th>
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4 font-sans">Oggetto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Quantità</th>
                <th className="py-3 px-4">Posizione</th>
                <th className="py-3 px-4">Responsabile</th>
                <th className="py-3 px-4">Stato</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventario.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{item.id}</td>
                  <td className="py-3 px-4">
                    {item.fotoLink ? (
                      <img src={item.fotoLink} alt={item.oggetto} className="w-9 h-9 object-cover rounded border border-slate-200" />
                    ) : (
                      <PhotoPlaceholder compact title={item.oggetto} className="w-fit" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">{item.oggetto}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0a1c2a]">
                    {item.quantita} {item.unita}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.posizione || "Sede"}</td>
                  <td className="py-3 px-4 text-slate-600">{item.responsabile || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.stato === "In uso"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.stato === "Da acquistare"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.stato}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModalInv(item)}
                        className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInventario(item.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
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
      )}

      {/* TAB 2: ACQUISTI */}
      {activeTab === "acquisti" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4 font-sans">Oggetto da Acquistare</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Q.tà</th>
                <th className="py-3 px-4">Priorità</th>
                <th className="py-3 px-4">Stato</th>
                <th className="py-3 px-4">Costo Previsto</th>
                <th className="py-3 px-4">Note / Fornitore</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAcquisti.map((acq) => (
                <tr key={acq.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{acq.id}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">{acq.oggetto}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                      {acq.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-4">{acq.quantita}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acq.priorita === "Alta" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {acq.priorita}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                      {acq.stato}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{acq.costoPrevisto ? `€ ${acq.costoPrevisto}` : "-"}</td>
                  <td className="py-3 px-4 text-slate-500 font-sans text-xs truncate max-w-xs">
                    {acq.note || acq.fornitore || "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModalAcq(acq)}
                        className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAcquisto(acq.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
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
      )}

      {/* MODAL INVENTARIO */}
      {modalInv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#c99a45]" />
                <span>{modalInv.id ? "Modifica Articolo Inventario" : "Nuovo Articolo Inventario"}</span>
              </h3>
              <button onClick={() => setModalInv(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventario} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Oggetto / Attrezzatura *</label>
                <input
                  type="text"
                  required
                  value={modalInv.oggetto || ""}
                  onChange={(e) => setModalInv({ ...modalInv, oggetto: e.target.value })}
                  placeholder="Es. Megafono, Router Wi-Fi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={modalInv.categoria || ""}
                    onChange={(e) => setModalInv({ ...modalInv, categoria: e.target.value })}
                    placeholder="Es. Audio, Video..."
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Quantità</label>
                  <input
                    type="text"
                    value={modalInv.quantita || "1"}
                    onChange={(e) => setModalInv({ ...modalInv, quantita: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Stato</label>
                  <select
                    value={modalInv.stato || "In uso"}
                    onChange={(e) => setModalInv({ ...modalInv, stato: e.target.value as InventarioItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  >
                    <option value="In uso">In uso</option>
                    <option value="Da acquistare">Da acquistare</option>
                    <option value="Da revisionare">Da revisionare</option>
                    <option value="Dismesso">Dismesso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Posizione / Ubicazione</label>
                  <input
                    type="text"
                    value={modalInv.posizione || ""}
                    onChange={(e) => setModalInv({ ...modalInv, posizione: e.target.value })}
                    placeholder="Es. Sede Sociale / Darsena"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Responsabile</label>
                  <input
                    type="text"
                    value={modalInv.responsabile || ""}
                    onChange={(e) => setModalInv({ ...modalInv, responsabile: e.target.value })}
                    placeholder="Es. Susy / Staff"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Foto / Link Immagine (Vuoto se mancante)</label>
                <input
                  type="text"
                  value={modalInv.fotoLink || ""}
                  onChange={(e) => setModalInv({ ...modalInv, fotoLink: e.target.value })}
                  placeholder="Es. /images/inventario/megafono.jpg (o lascia vuoto)"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalInv(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded"
                >
                  Salva Articolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ACQUISTI */}
      {modalAcq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#c99a45]" />
                <span>{modalAcq.id ? "Modifica Voce Acquisto" : "Nuova Voce Piano Acquisti"}</span>
              </h3>
              <button onClick={() => setModalAcq(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcquisto} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Oggetto da Acquistare *</label>
                <input
                  type="text"
                  required
                  value={modalAcq.oggetto || ""}
                  onChange={(e) => setModalAcq({ ...modalAcq, oggetto: e.target.value })}
                  placeholder="Es. Router per rete Internet"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={modalAcq.categoria || ""}
                    onChange={(e) => setModalAcq({ ...modalAcq, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Priorità</label>
                  <select
                    value={modalAcq.priorita || "Alta"}
                    onChange={(e) => setModalAcq({ ...modalAcq, priorita: e.target.value as AcquistoItem["priorita"] })}
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
                    value={modalAcq.stato || "Da acquistare"}
                    onChange={(e) => setModalAcq({ ...modalAcq, stato: e.target.value as AcquistoItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  >
                    <option value="Da acquistare">Da acquistare</option>
                    <option value="Da valutare">Da valutare</option>
                    <option value="Ordinato">Ordinato</option>
                    <option value="Ricevuto">Ricevuto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Costo Previsto (€)</label>
                  <input
                    type="text"
                    value={modalAcq.costoPrevisto || ""}
                    onChange={(e) => setModalAcq({ ...modalAcq, costoPrevisto: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Fornitore</label>
                  <input
                    type="text"
                    value={modalAcq.fornitore || ""}
                    onChange={(e) => setModalAcq({ ...modalAcq, fornitore: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Note / Modello</label>
                <input
                  type="text"
                  value={modalAcq.note || ""}
                  onChange={(e) => setModalAcq({ ...modalAcq, note: e.target.value })}
                  placeholder="Es. Valutato acquisto Monacor TM-45..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAcq(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded"
                >
                  Salva Acquisto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
