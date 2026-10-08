"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ImageUploader from "@/components/ImageUploader";
import { EventItem, BlogPost } from "@/lib/db/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

function EventEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [eventData, setEventData] = useState<Partial<EventItem>>({
    title: "",
    date: "",
    location: "Canale di Procida",
    category: "regata",
    description: "",
    badge: "",
    result: "",
    imageUrl: "/images/hero-sailing.webp",
    articleSlug: "",
    published: true,
  });

  useEffect(() => {
    // Carica lista blog per il dropdown di collegamento
    fetch("/api/blog?all=true")
      .then((res) => res.json())
      .then((d) => setBlogPosts(d.data || []))
      .catch(() => {});

    // Se stiamo modificando un evento esistente, carica i dettagli
    if (eventId) {
      fetch("/api/eventi?all=true")
        .then((res) => res.json())
        .then((d) => {
          const found = (d.data || []).find((e: EventItem) => e.id === eventId);
          if (found) {
            setEventData(found);
          } else {
            setNotification({ type: "error", message: "Evento non trovato" });
          }
        })
        .catch(() => setNotification({ type: "error", message: "Errore caricamento evento" }))
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!eventData.title || !eventData.date || !eventData.location || !eventData.description) {
      setNotification({ type: "error", message: "Compila tutti i campi obbligatori (Titolo, Data, Luogo, Descrizione)" });
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(eventId);
      const url = "/api/eventi";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...eventData, id: eventId } : eventData),
      });

      if (!res.ok) throw new Error("Errore durante il salvataggio");

      setNotification({ type: "success", message: "Evento salvato con successo! Reindirizzamento..." });
      setTimeout(() => {
        router.push("/admin?tab=eventi");
      }, 700);
    } catch {
      setNotification({ type: "error", message: "Impossibile salvare l'evento" });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento dati evento in corso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={eventId ? `Modifica: ${eventData.title}` : "Nuovo Evento o Regata"}
        subtitle="Gestione completa scheda evento, palmarès e collegamento al diario di bordo"
        backHref="/admin?tab=eventi"
        backLabel="Torna a Eventi & Palmarès"
        onSave={() => handleSubmit()}
        isSaving={saving}
        saveLabel="Salva Evento"
      />

      {notification && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 p-5 sm:p-8 shadow-xs space-y-6">
          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Titolo dell&apos;Evento *
            </label>
            <input
              type="text"
              required
              value={eventData.title || ""}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="Es. Les Voiles Latines de Saint-Tropez 2026"
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-[#fbfaf6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Data o Periodo di Svolgimento *
              </label>
              <input
                type="text"
                required
                value={eventData.date || ""}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                placeholder="Es. 14 – 17 Maggio 2026"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Luogo / Bacino di Navigazione *
              </label>
              <input
                type="text"
                required
                value={eventData.location || ""}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                placeholder="Es. Saint-Tropez, Francia"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Categoria
              </label>
              <select
                value={eventData.category || "regata"}
                onChange={(e) => setEventData({ ...eventData, category: e.target.value as EventItem["category"] })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
              >
                <option value="regata">Regata Storica</option>
                <option value="manifestazione">Manifestazione Tradizionale</option>
                <option value="raduno">Raduno Velico</option>
                <option value="cultura">Cultura & TV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Badge / Traguardo
              </label>
              <input
                type="text"
                value={eventData.badge || ""}
                onChange={(e) => setEventData({ ...eventData, badge: e.target.value })}
                placeholder="Es. 1° Posto Assoluto"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Risultato / Podio
              </label>
              <input
                type="text"
                value={eventData.result || ""}
                onChange={(e) => setEventData({ ...eventData, result: e.target.value })}
                placeholder="Es. Vincitore Trofeo dei Campi Flegrei"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>
          </div>

          <ImageUploader
            label="Fotografia Ufficiale dell'Evento"
            value={eventData.imageUrl || ""}
            onChange={(url) => setEventData({ ...eventData, imageUrl: url })}
            placeholder="/images/hero-sailing.webp"
          />

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Descrizione Dettagliata dell&apos;Evento *
            </label>
            <textarea
              required
              rows={5}
              value={eventData.description || ""}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Racconto e dettagli della partecipazione della flotta di Monte di Procida..."
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Articolo Collegato nel Blog (Slug URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={eventData.articleSlug || ""}
                onChange={(e) => setEventData({ ...eventData, articleSlug: e.target.value })}
                placeholder="Es. diario-di-bordo-saint-tropez-2026"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono"
              />
              {blogPosts.length > 0 && (
                <select
                  value={eventData.articleSlug || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setEventData({ ...eventData, articleSlug: e.target.value });
                    }
                  }}
                  className="px-3 py-2.5 border border-slate-300 text-xs text-slate-700 bg-white outline-none shrink-0"
                >
                  <option value="">Seleziona da articoli...</option>
                  {blogPosts.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Inserendo uno slug valido, comparirà il pulsante &quot;Leggi il Racconto dell&apos;Evento&quot; nella pagina pubblica.
            </span>
          </div>

          <div className="p-4 bg-[#fbfaf6] border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#0a1c2a] block">
                Stato di Pubblicazione
              </span>
              <span className="text-[11px] text-slate-500 font-light block">
                {eventData.published !== false ? "L'evento è visibile a tutti i visitatori del sito" : "L'evento è salvato come bozza interna"}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={eventData.published !== false}
                onChange={(e) => setEventData({ ...eventData, published: e.target.checked })}
                className="w-4 h-4 text-[#0a1c2a]"
              />
              <span className="text-xs font-mono font-bold">Pubblicato Online</span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=eventi")}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-xs font-mono font-semibold hover:bg-slate-100 transition-colors"
            >
              Annulla e Torna a Eventi
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {saving ? "Salvataggio..." : "Salva Evento"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function EventEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center text-xs font-mono">Caricamento editor...</div>}>
      <EventEditorContent />
    </Suspense>
  );
}
