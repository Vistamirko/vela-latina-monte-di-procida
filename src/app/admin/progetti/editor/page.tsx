"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ImageUploader from "@/components/ImageUploader";
import { ProjectItem } from "@/lib/db/types";
import { CheckCircle2, AlertCircle, Building2, User } from "lucide-react";

function ProjectEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [projectData, setProjectData] = useState<Partial<ProjectItem>>({
    number: "01",
    title: "",
    highlight: "",
    category: "Regata Internazionale",
    badge: "",
    partner: "Campi Flegrei · Rete Partner",
    status: "In Corso",
    timeline: "2026 – 2027",
    location: "Acquamorta & Saint-Tropez",
    description: "",
    content: "",
    imageUrl: "/images/janara-crew.jpeg",
    published: true,
    referente: {
      nome: "",
      ruolo: "Coordinatore di Progetto",
      telefono: "+39 333 000 0000",
      email: "progetto@velalatinamontediprocida.it",
      note: "",
    },
    anagrafica: {
      codiceProgetto: "PRJ-2027-01",
      referente: {
        nome: "",
        ruolo: "Coordinatore di Progetto",
        telefono: "+39 333 000 0000",
        email: "progetto@velalatinamontediprocida.it",
        note: "",
      },
      entePromotore: "Associazione Vela Latina Monte di Procida APS",
      statoAvanzamento: 20,
      budgetStimato: "Da definire",
    },
  });

  useEffect(() => {
    if (projectId) {
      fetch("/api/progetti?all=true")
        .then((res) => res.json())
        .then((d) => {
          const found = (d.data || []).find((p: ProjectItem) => p.id === projectId);
          if (found) {
            setProjectData(found);
          } else {
            setNotification({ type: "error", message: "Progetto non trovato" });
          }
        })
        .catch(() => setNotification({ type: "error", message: "Errore caricamento progetto" }))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectData.title || !projectData.highlight || !projectData.description) {
      setNotification({ type: "error", message: "Compila tutti i campi obbligatori (Titolo, Sottotitolo, Sintesi)" });
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(projectId);
      const url = "/api/progetti";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...projectData, id: projectId } : projectData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante il salvataggio");

      setNotification({ type: "success", message: "Progetto salvato con successo! Reindirizzamento..." });
      setTimeout(() => {
        router.push("/admin?tab=progetti");
      }, 700);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Impossibile salvare il progetto",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento dati progetto strategico...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={projectId ? `Cantiere #${projectData.number}: ${projectData.title}` : "Nuovo Progetto Strategico"}
        subtitle="Configurazione completa scheda pubblica, anagrafica referente, cantiere e percentuali di avanzamento"
        backHref="/admin?tab=progetti"
        backLabel="Torna a Progetti & Cantieri"
        onSave={() => handleSubmit()}
        isSaving={saving}
        saveLabel="Salva Progetto"
      />

      {notification && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={`p-3 text-xs font-mono font-semibold flex items-center gap-2 border ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-red-50 text-red-900 border-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEZIONE 1: Dati Principali Progetto */}
          <div className="bg-white border border-slate-300 p-5 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-['Cinzel'] font-bold text-sm sm:text-base text-[#0a1c2a] uppercase tracking-wide">
                1. Scheda Cantiere & Posizionamento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <div className="sm:col-span-1">
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Numero Scheda *
                </label>
                <input
                  type="text"
                  required
                  value={projectData.number || "01"}
                  onChange={(e) => setProjectData({ ...projectData, number: e.target.value })}
                  placeholder="01"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Titolo Ufficiale del Progetto *
                </label>
                <input
                  type="text"
                  required
                  value={projectData.title || ""}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  placeholder="Es. Spedizione Saint-Tropez 2026: La Flotta Flegrea in Costa Azzurra"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-[#fbfaf6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Highlight / Sottotitolo Evocativo *
              </label>
              <input
                type="text"
                required
                value={projectData.highlight || ""}
                onChange={(e) => setProjectData({ ...projectData, highlight: e.target.value })}
                placeholder="Es. Quattro gozzi tradizionali a vela latina rappresentano i Campi Flegrei"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Categoria
                </label>
                <select
                  value={projectData.category || "Regata Internazionale"}
                  onChange={(e) => setProjectData({ ...projectData, category: e.target.value as ProjectItem["category"] })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
                >
                  <option value="Regata Internazionale">Regata Internazionale</option>
                  <option value="Cultura & Scienza">Cultura & Scienza</option>
                  <option value="Inclusione">Inclusione</option>
                  <option value="Rotte Storiche">Rotte Storiche</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Badge in Evidenza
                </label>
                <input
                  type="text"
                  value={projectData.badge || ""}
                  onChange={(e) => setProjectData({ ...projectData, badge: e.target.value })}
                  placeholder="Es. 25° Anniversario"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Stato Avanzamento Operativo
                </label>
                <select
                  value={projectData.status || "In Corso"}
                  onChange={(e) => setProjectData({ ...projectData, status: e.target.value as ProjectItem["status"] })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
                >
                  <option value="In Corso">In Corso</option>
                  <option value="In Programmazione">In Programmazione</option>
                  <option value="Completato">Completato</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Orizzonte Temporale / Anno
                </label>
                <input
                  type="text"
                  value={projectData.timeline || ""}
                  onChange={(e) => setProjectData({ ...projectData, timeline: e.target.value })}
                  placeholder="Es. 2026 – 2027"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                  Teatro Operativo / Bacino
                </label>
                <input
                  type="text"
                  value={projectData.location || ""}
                  onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
                  placeholder="Es. Acquamorta & Saint-Tropez"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>

            <ImageUploader
              label="Fotografia Principale del Progetto"
              value={projectData.imageUrl || ""}
              onChange={(url) => setProjectData({ ...projectData, imageUrl: url })}
              placeholder="/images/janara-crew.jpeg"
            />

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Sintesi Breve (Visualizzata nelle Card) *
              </label>
              <textarea
                required
                rows={3}
                value={projectData.description || ""}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Spiega in breve gli obiettivi del cantiere..."
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Relazione Approfondita per la Pagina Dedicata (/progetti/[slug])
              </label>
              <textarea
                rows={10}
                value={projectData.content || ""}
                onChange={(e) => setProjectData({ ...projectData, content: e.target.value })}
                placeholder="Inserisci la relazione completa di cantiere: storia, percorso tecnico, imbarcazioni, partner..."
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* SEZIONE 2: Anagrafica Referente & Dati Amministrativi */}
          <div className="bg-white border border-slate-300 p-5 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#c99a45]" />
                <h2 className="font-['Cinzel'] font-bold text-sm sm:text-base text-[#0a1c2a] uppercase tracking-wide">
                  2. Anagrafica del Referente di Progetto
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#0a1c2a] text-[#c99a45] px-2 py-0.5">
                {projectData.anagrafica?.codiceProgetto || `PRJ-2027-${projectData.number || "01"}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Nome e Cognome Referente *
                </label>
                <input
                  type="text"
                  placeholder="Es. C.te Antonio Schiano"
                  value={projectData.referente?.nome || ""}
                  onChange={(e) => {
                    const newRef = {
                      ...(projectData.referente || { ruolo: "", telefono: "", email: "" }),
                      nome: e.target.value,
                    };
                    setProjectData({
                      ...projectData,
                      referente: newRef,
                      anagrafica: {
                        ...(projectData.anagrafica || {
                          codiceProgetto: `PRJ-2027-${projectData.number || "01"}`,
                          entePromotore: "Associazione Vela Latina Monte di Procida APS",
                          statoAvanzamento: 20,
                        }),
                        referente: newRef,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-[#fbfaf6]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Ruolo / Incarico nel Progetto
                </label>
                <input
                  type="text"
                  placeholder="Es. Responsabile Logistica & Skipper Capo-Spedizione"
                  value={projectData.referente?.ruolo || ""}
                  onChange={(e) => {
                    const newRef = {
                      ...(projectData.referente || { nome: "", telefono: "", email: "" }),
                      ruolo: e.target.value,
                    };
                    setProjectData({
                      ...projectData,
                      referente: newRef,
                      anagrafica: {
                        ...(projectData.anagrafica || {
                          codiceProgetto: `PRJ-2027-${projectData.number || "01"}`,
                          entePromotore: "Associazione Vela Latina Monte di Procida APS",
                          statoAvanzamento: 20,
                        }),
                        referente: newRef,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Recapito Telefonico Diretto
                </label>
                <input
                  type="text"
                  placeholder="+39 340 000 0000"
                  value={projectData.referente?.telefono || ""}
                  onChange={(e) => {
                    const newRef = {
                      ...(projectData.referente || { nome: "", ruolo: "", email: "" }),
                      telefono: e.target.value,
                    };
                    setProjectData({
                      ...projectData,
                      referente: newRef,
                      anagrafica: {
                        ...(projectData.anagrafica || {
                          codiceProgetto: `PRJ-2027-${projectData.number || "01"}`,
                          entePromotore: "Associazione Vela Latina Monte di Procida APS",
                          statoAvanzamento: 20,
                        }),
                        referente: newRef,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Email Referente Ufficiale
                </label>
                <input
                  type="email"
                  placeholder="referente@velalatinamontediprocida.it"
                  value={projectData.referente?.email || ""}
                  onChange={(e) => {
                    const newRef = {
                      ...(projectData.referente || { nome: "", ruolo: "", telefono: "" }),
                      email: e.target.value,
                    };
                    setProjectData({
                      ...projectData,
                      referente: newRef,
                      anagrafica: {
                        ...(projectData.anagrafica || {
                          codiceProgetto: `PRJ-2027-${projectData.number || "01"}`,
                          entePromotore: "Associazione Vela Latina Monte di Procida APS",
                          statoAvanzamento: 20,
                        }),
                        referente: newRef,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-200">
              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Percentuale Avanzamento Cantiere ({projectData.anagrafica?.statoAvanzamento || 0}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={projectData.anagrafica?.statoAvanzamento || 0}
                  onChange={(e) => {
                    const fallbackRef = projectData.referente || {
                      nome: "",
                      ruolo: "Coordinatore di Progetto",
                      telefono: "+39 333 000 0000",
                      email: "progetto@velalatinamontediprocida.it",
                    };
                    setProjectData({
                      ...projectData,
                      anagrafica: {
                        codiceProgetto: projectData.anagrafica?.codiceProgetto || `PRJ-2027-${projectData.number || "01"}`,
                        entePromotore: projectData.anagrafica?.entePromotore || "Associazione Vela Latina Monte di Procida APS",
                        ...projectData.anagrafica,
                        referente: projectData.anagrafica?.referente || fallbackRef,
                        statoAvanzamento: parseInt(e.target.value, 10),
                      },
                    });
                  }}
                  className="w-full accent-[#0a1c2a] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Ente / Soggetto Promotore
                </label>
                <input
                  type="text"
                  value={projectData.anagrafica?.entePromotore || "Associazione Vela Latina Monte di Procida APS"}
                  onChange={(e) => {
                    const fallbackRef = projectData.referente || {
                      nome: "",
                      ruolo: "Coordinatore di Progetto",
                      telefono: "+39 333 000 0000",
                      email: "progetto@velalatinamontediprocida.it",
                    };
                    setProjectData({
                      ...projectData,
                      anagrafica: {
                        codiceProgetto: projectData.anagrafica?.codiceProgetto || `PRJ-2027-${projectData.number || "01"}`,
                        statoAvanzamento: 20,
                        ...projectData.anagrafica,
                        referente: projectData.anagrafica?.referente || fallbackRef,
                        entePromotore: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-300 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#0a1c2a] block">
                Pubblicazione Pagina Cantiere
              </span>
              <span className="text-[11px] text-slate-500 font-light block">
                {projectData.published !== false ? "Il cantiere è pubblico e consultabile sul portale" : "Il cantiere è archiviato come bozza"}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={projectData.published !== false}
                onChange={(e) => setProjectData({ ...projectData, published: e.target.checked })}
                className="w-4 h-4 text-[#0a1c2a]"
              />
              <span className="text-xs font-mono font-bold">Pubblicato Online</span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=progetti")}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-xs font-mono font-semibold hover:bg-slate-100 transition-colors"
            >
              Annulla e Torna a Progetti
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {saving ? "Salvataggio..." : "Salva Progetto"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function ProjectEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center text-xs font-mono">Caricamento editor progetto...</div>}>
      <ProjectEditorContent />
    </Suspense>
  );
}
