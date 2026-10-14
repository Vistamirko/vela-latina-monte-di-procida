"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  ListTodo,
  Check,
} from "lucide-react";
import { AttivitaPortfolioItem, TaskOperativoItem } from "@/lib/db/types";

export default function AttivitaManager() {
  const [activeTab, setActiveTab] = useState<"tasks" | "portfolio">("tasks");
  const [tasks, setTasks] = useState<TaskOperativoItem[]>([]);
  const [portfolio, setPortfolio] = useState<AttivitaPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("tutte");
  const [statoFilter, setStatoFilter] = useState("tutti");
  const [prioritaFilter, setPrioritaFilter] = useState("tutte");

  // Modals
  const [modalTask, setModalTask] = useState<Partial<TaskOperativoItem> | null>(null);
  const [modalPortfolio, setModalPortfolio] = useState<Partial<AttivitaPortfolioItem> | null>(null);
  const [newChecklistText, setNewChecklistText] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    // loading
    try {
      const res = await fetch("/api/attivita");
      const json = await res.json();
      if (json.success && json.data) {
        setTasks(json.data.tasks || []);
        setPortfolio(json.data.portfolio || []);
      }
    } catch {
      showToast("error", "Errore nel caricamento delle attività");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/attivita")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setTasks(json.data.tasks || []);
          setPortfolio(json.data.portfolio || []);
        }
      })
      .catch(() => {
        if (!ignore) showToast("error", "Errore caricamento attività");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Task Actions
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTask || !modalTask.attivita) return;

    try {
      const res = await fetch("/api/attivita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "task", ...modalTask }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio task");
      showToast("success", "Task salvato con successo");
      setModalTask(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo task?")) return;
    try {
      const res = await fetch(`/api/attivita?type=task&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Task eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare il task");
    }
  };

  const handleUpdateProgress = async (task: TaskOperativoItem, newProgress: number) => {
    const nextStato: TaskOperativoItem["stato"] =
      newProgress === 100 ? "Completata" : newProgress > 0 ? "In corso" : "Da fare";

    try {
      const res = await fetch("/api/attivita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "task",
          ...task,
          avanzamento: newProgress,
          stato: nextStato,
        }),
      });
      if (!res.ok) throw new Error();
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, avanzamento: newProgress, stato: nextStato } : t))
      );
    } catch {
      showToast("error", "Errore aggiornamento avanzamento");
    }
  };

  // Portfolio Actions
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPortfolio || !modalPortfolio.titolo) return;

    try {
      const res = await fetch("/api/attivita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio", ...modalPortfolio }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio progetto");
      showToast("success", "Progetto salvato con successo");
      setModalPortfolio(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo progetto?")) return;
    try {
      const res = await fetch(`/api/attivita?type=portfolio&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Progetto eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare il progetto");
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (search && !t.attivita.toLowerCase().includes(search.toLowerCase()) && !t.categoria.toLowerCase().includes(search.toLowerCase()) && !t.owner.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoriaFilter !== "tutte" && t.categoria !== categoriaFilter) {
      return false;
    }
    if (statoFilter !== "tutti" && t.stato !== statoFilter) {
      return false;
    }
    if (prioritaFilter !== "tutte" && t.priorita !== prioritaFilter) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(tasks.map((t) => t.categoria)));

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
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tasks" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Matrice Task Operativi ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "portfolio" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Portfolio Progetti PRJ ({portfolio.length})</span>
          </button>
        </div>

        <div>
          {activeTab === "tasks" ? (
            <button
              onClick={() =>
                setModalTask({
                  attivita: "",
                  progettoId: "PRJ001",
                  categoria: "Operativa",
                  owner: "Staff Vela Latina",
                  stato: "Da fare",
                  priorita: "Media",
                  avanzamento: 0,
                  checklist: [],
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Task</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setModalPortfolio({
                  titolo: "",
                  area: "Attività Istituzionale",
                  tipoAttivita: "Iniziativa",
                  owner: "Consiglio Direttivo",
                  stato: "Da fare",
                  priorita: "Media",
                  ricorrenza: "Annuale",
                  avanzamento: 0,
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Progetto PRJ</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca attività, owner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#c99a45]"
                />
              </div>

              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              >
                <option value="tutte">Tutte le categorie</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                <option value="Pianificata">Pianificata</option>
                <option value="Proposta">Proposta</option>
                <option value="Completata">Completata</option>
              </select>

              <select
                value={prioritaFilter}
                onChange={(e) => setPrioritaFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              >
                <option value="tutte">Tutte le priorità</option>
                <option value="Critica">Critica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Bassa">Bassa</option>
              </select>
            </div>

            <div className="text-slate-500 text-[11px]">
              Task: <strong>{filteredTasks.length}</strong> / {tasks.length}
            </div>
          </div>

          {/* Task Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span className="text-xs font-bold text-[#c99a45] bg-[#c99a45]/10 px-2 py-0.5 rounded">
                      {t.id} • {t.progettoId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.priorita === "Alta" || t.priorita === "Critica"
                          ? "bg-red-100 text-red-800"
                          : t.priorita === "Media"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.priorita}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 mb-1 leading-snug">
                    {t.attivita}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {t.categoria}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Owner: <strong>{t.owner}</strong>
                    </span>
                  </div>

                  {/* Checklist Items */}
                  {t.checklist && t.checklist.length > 0 && (
                    <div className="mb-3 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                        Sottoattività / Checklist:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.checklist.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {t.note && (
                    <p className="text-[11px] text-slate-500 italic mb-3">
                      Note: {t.note}
                    </p>
                  )}
                </div>

                {/* Progress bar & Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Avanzamento:</span>
                    <span className="font-bold text-slate-800">{t.avanzamento}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        t.avanzamento === 100
                          ? "bg-emerald-500"
                          : t.avanzamento > 0
                          ? "bg-blue-600"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${t.avanzamento}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateProgress(t, 0)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer ${
                          t.avanzamento === 0 ? "bg-slate-800 text-white font-bold" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        0%
                      </button>
                      <button
                        onClick={() => handleUpdateProgress(t, 50)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer ${
                          t.avanzamento === 50 ? "bg-blue-800 text-white font-bold" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleUpdateProgress(t, 100)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer ${
                          t.avanzamento === 100 ? "bg-emerald-800 text-white font-bold" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        100%
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setModalTask(t)}
                        className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-100 rounded"
                        title="Modifica task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Elimina task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO PROGETTI */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span className="text-xs font-bold text-[#0a1c2a] bg-slate-100 px-2 py-0.5 rounded">
                      {p.id} • {p.area}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.stato === "Completata"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.stato === "In corso"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.stato}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-slate-900 mb-1">
                    {p.titolo}
                  </h3>

                  <div className="text-xs text-slate-500 font-mono mb-3">
                    Tipo: <span className="font-semibold text-slate-700">{p.tipoAttivita}</span> • Ricorrenza:{" "}
                    <span className="text-[#0a1c2a] font-semibold">{p.ricorrenza || "Annuale"}</span>
                  </div>

                  {p.descrizione && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 whitespace-pre-line leading-relaxed">
                      {p.descrizione}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Resp: {p.owner}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModalPortfolio(p)}
                      className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-100 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePortfolio(p.id)}
                      className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
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

      {/* MODAL TASK */}
      {modalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#c99a45]" />
                <span>{modalTask.id ? "Modifica Task Operativo" : "Nuovo Task Operativo"}</span>
              </h3>
              <button
                onClick={() => setModalTask(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Progetto Collegato</label>
                  <select
                    value={modalTask.progettoId || "PRJ001"}
                    onChange={(e) => setModalTask({ ...modalTask, progettoId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    {portfolio.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.titolo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={modalTask.categoria || "Operativa"}
                    onChange={(e) => setModalTask({ ...modalTask, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Titolo Attività *</label>
                <input
                  type="text"
                  required
                  value={modalTask.attivita || ""}
                  onChange={(e) => setModalTask({ ...modalTask, attivita: e.target.value })}
                  placeholder="Es. Richiesta ormeggio darsena Janara"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Owner / Resp.</label>
                  <input
                    type="text"
                    value={modalTask.owner || ""}
                    onChange={(e) => setModalTask({ ...modalTask, owner: e.target.value })}
                    placeholder="Es. Susy"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Priorità</label>
                  <select
                    value={modalTask.priorita || "Media"}
                    onChange={(e) => setModalTask({ ...modalTask, priorita: e.target.value as TaskOperativoItem["priorita"] })}
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
                    value={modalTask.stato || "Da fare"}
                    onChange={(e) => setModalTask({ ...modalTask, stato: e.target.value as TaskOperativoItem["stato"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Da fare">Da fare</option>
                    <option value="In corso">In corso</option>
                    <option value="Pianificata">Pianificata</option>
                    <option value="Proposta">Proposta</option>
                    <option value="Completata">Completata</option>
                  </select>
                </div>
              </div>

              {/* Checklist editor */}
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Checklist / Sottoattività</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Aggiungi punto checklist..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newChecklistText.trim()) {
                          setModalTask({
                            ...modalTask,
                            checklist: [...(modalTask.checklist || []), newChecklistText.trim()],
                          });
                          setNewChecklistText("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistText.trim()) {
                        setModalTask({
                          ...modalTask,
                          checklist: [...(modalTask.checklist || []), newChecklistText.trim()],
                        });
                        setNewChecklistText("");
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-white font-mono rounded cursor-pointer"
                  >
                    Aggiungi
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(modalTask.checklist || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[11px] rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setModalTask({
                            ...modalTask,
                            checklist: modalTask.checklist?.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Note / Link</label>
                <input
                  type="text"
                  value={modalTask.note || ""}
                  onChange={(e) => setModalTask({ ...modalTask, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalTask(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded cursor-pointer"
                >
                  Salva Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PORTFOLIO */}
      {modalPortfolio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c99a45]" />
                <span>{modalPortfolio.id ? "Modifica Progetto" : "Nuovo Progetto Portfolio"}</span>
              </h3>
              <button
                onClick={() => setModalPortfolio(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Area</label>
                  <input
                    type="text"
                    required
                    value={modalPortfolio.area || ""}
                    onChange={(e) => setModalPortfolio({ ...modalPortfolio, area: e.target.value })}
                    placeholder="Es. Barche, Eventi, UNESCO..."
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Tipo Attività</label>
                  <input
                    type="text"
                    value={modalPortfolio.tipoAttivita || ""}
                    onChange={(e) => setModalPortfolio({ ...modalPortfolio, tipoAttivita: e.target.value })}
                    placeholder="Es. Manutenzione, Regata..."
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Titolo Progetto *</label>
                <input
                  type="text"
                  required
                  value={modalPortfolio.titolo || ""}
                  onChange={(e) => setModalPortfolio({ ...modalPortfolio, titolo: e.target.value })}
                  placeholder="Es. Gestione Janara"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Owner</label>
                  <input
                    type="text"
                    value={modalPortfolio.owner || ""}
                    onChange={(e) => setModalPortfolio({ ...modalPortfolio, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Priorità</label>
                  <select
                    value={modalPortfolio.priorita || "Media"}
                    onChange={(e) => setModalPortfolio({ ...modalPortfolio, priorita: e.target.value as AttivitaPortfolioItem["priorita"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  >
                    <option value="Critica">Critica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Bassa">Bassa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Ricorrenza</label>
                  <input
                    type="text"
                    value={modalPortfolio.ricorrenza || "Annuale"}
                    onChange={(e) => setModalPortfolio({ ...modalPortfolio, ricorrenza: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Descrizione</label>
                <textarea
                  rows={3}
                  value={modalPortfolio.descrizione || ""}
                  onChange={(e) => setModalPortfolio({ ...modalPortfolio, descrizione: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPortfolio(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded cursor-pointer"
                >
                  Salva Progetto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
