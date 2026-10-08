"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { SocioItem } from "@/lib/db/types";
import { CheckCircle2, AlertCircle, Award, Users, CreditCard } from "lucide-react";

function SocioEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socioId = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(socioId));
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [socioData, setSocioData] = useState<Partial<SocioItem>>({
    anno: 2026,
    nome: "",
    dataLuogoNascita: "",
    codiceFiscale: "",
    numeroTessera: "",
    quotaContanti: "",
    quotaBonifico: "",
    socioOnorario: false,
    tipologia: "Socio Ordinario",
    email: "",
    telefono: "",
    dataIscrizione: new Date().toISOString().split("T")[0],
    note: "",
  });

  useEffect(() => {
    if (socioId) {
      fetch("/api/soci")
        .then((res) => res.json())
        .then((d) => {
          const list: SocioItem[] = d.data || [];
          const found = list.find((s) => s.id === socioId);
          if (found) {
            setSocioData(found);
          } else {
            setNotification({ type: "error", message: "Socio non trovato nel registro" });
          }
        })
        .catch(() => setNotification({ type: "error", message: "Errore durante il caricamento del socio" }))
        .finally(() => setLoading(false));
    } else {
      // Suggestione automatica numero tessera
      fetch(`/api/soci?anno=2026`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.nextInfo?.nextTessera) {
            setSocioData((prev) => ({
              ...prev,
              numeroTessera: prev.numeroTessera || String(data.nextInfo.nextTessera),
            }));
          }
        })
        .catch(() => {});
    }
  }, [socioId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!socioData.nome?.trim()) {
      setNotification({ type: "error", message: "Il cognome e nome del socio è obbligatorio" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/soci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socioId ? { ...socioData, id: socioId } : socioData),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Errore durante il salvataggio");
      }

      setNotification({
        type: "success",
        message: socioId ? "Dati socio aggiornati con successo!" : "Nuovo socio inserito nel Libro Soci!",
      });

      setTimeout(() => {
        router.push("/admin?tab=soci");
      }, 700);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Impossibile salvare i dati del socio" });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento scheda socio in corso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={socioId ? `Modifica: ${socioData.nome}` : "Nuova Iscrizione Libro Soci"}
        subtitle="Registro Ufficiale Associazione APS — Anagrafica socio, quote e tesseramento"
        backHref="/admin?tab=soci"
        backLabel="Torna al Libro Soci"
        onSave={handleSubmit}
        isSaving={saving}
        saveLabel={socioId ? "Aggiorna Socio" : "Salva Socio"}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {notification && (
          <div
            className={`p-4 border text-xs font-mono flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEZIONE 1: DATI ANAGRAFICI */}
          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                  Dati Anagrafici & Identificativi
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Informazioni obbligatorie per il Libro Soci e per la conformità RUNTS.
                </p>
              </div>
              <Users className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Cognome e Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Mario Rossi"
                  value={socioData.nome || ""}
                  onChange={(e) => setSocioData({ ...socioData, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Anno Sociale *
                </label>
                <input
                  type="number"
                  required
                  value={socioData.anno || 2026}
                  onChange={(e) =>
                    setSocioData({ ...socioData, anno: parseInt(e.target.value, 10) || 2026 })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
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
                  placeholder="es. 15.07.1984 Napoli"
                  value={socioData.dataLuogoNascita || ""}
                  onChange={(e) => setSocioData({ ...socioData, dataLuogoNascita: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Codice Fiscale
                </label>
                <input
                  type="text"
                  placeholder="RSSMRA84L15F839X"
                  value={socioData.codiceFiscale || ""}
                  onChange={(e) =>
                    setSocioData({ ...socioData, codiceFiscale: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
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
                  placeholder="socio@esempio.it"
                  value={socioData.email || ""}
                  onChange={(e) => setSocioData({ ...socioData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  placeholder="+39 333 1234567"
                  value={socioData.telefono || ""}
                  onChange={(e) => setSocioData({ ...socioData, telefono: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>
            </div>
          </div>

          {/* SEZIONE 2: INQUADRAMENTO & TESSERA */}
          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                  Tessera & Inquadramento Sociale
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Numero di tessera, qualifica e tipologia associativa.
                </p>
              </div>
              <Award className="w-5 h-5 text-[#b8860b]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Nr. Tessera Assegnato
                </label>
                <input
                  type="text"
                  placeholder="es. 94"
                  value={socioData.numeroTessera || ""}
                  onChange={(e) => setSocioData({ ...socioData, numeroTessera: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-amber-300 bg-amber-50/30 text-sm font-mono font-bold focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Data Iscrizione / Ammissione
                </label>
                <input
                  type="date"
                  value={socioData.dataIscrizione || ""}
                  onChange={(e) => setSocioData({ ...socioData, dataIscrizione: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Tipologia Socio
                </label>
                <input
                  type="text"
                  placeholder="Socio Ordinario"
                  value={socioData.tipologia || "Socio Ordinario"}
                  onChange={(e) => setSocioData({ ...socioData, tipologia: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-slate-200 bg-[#fbfaf6] hover:border-slate-400 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(socioData.socioOnorario)}
                  onChange={(e) =>
                    setSocioData({ ...socioData, socioOnorario: e.target.checked })
                  }
                  className="h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a]"
                />
                <div>
                  <span className="text-xs font-mono font-bold text-[#0a1c2a] block">
                    Socio Onorario (S.O.)
                  </span>
                  <span className="text-[11px] text-slate-500 font-light">
                    Membro onorario per meriti storici o culturali verso la Vela Latina.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SEZIONE 3: QUOTE SOCIALI & PAGAMENTO */}
          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                  Quote Sociali & Contabilità
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Registrazione delle quote incassate (bonifico o contanti).
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Quota Bonifico (€)
                </label>
                <input
                  type="text"
                  placeholder="es. 50"
                  value={socioData.quotaBonifico || ""}
                  onChange={(e) => setSocioData({ ...socioData, quotaBonifico: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Quota Contanti (€)
                </label>
                <input
                  type="text"
                  placeholder="es. 50"
                  value={socioData.quotaContanti || ""}
                  onChange={(e) => setSocioData({ ...socioData, quotaContanti: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Note Interne
              </label>
              <textarea
                rows={3}
                placeholder="Eventuali note su quietanze, ricevute, deleghe..."
                value={socioData.note || ""}
                onChange={(e) => setSocioData({ ...socioData, note: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
              />
            </div>
          </div>

          {/* PULSANTI BOTTOM */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=soci")}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-xs font-mono font-semibold transition-colors text-center cursor-pointer"
            >
              Annulla e Torna Indietro
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Salvataggio in corso..." : socioId ? "Aggiorna Socio" : "Salva Socio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SocioEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
          Caricamento...
        </div>
      }
    >
      <SocioEditorContent />
    </Suspense>
  );
}
