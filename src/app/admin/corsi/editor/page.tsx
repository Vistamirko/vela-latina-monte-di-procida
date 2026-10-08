"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CourseSession } from "@/lib/db/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

function CourseEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(courseId));
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [courseData, setCourseData] = useState<Partial<CourseSession>>({
    courseKey: "voga",
    courseTitle: "Scuola di Voga Tradizionale Flegrea",
    startDate: new Date().toISOString().split("T")[0],
    schedule: "Sabato mattina ore 09:30 – 12:30",
    totalSeats: 12,
    availableSeats: 6,
    status: "aperte",
    instructor: "Maestri Vogatori Montesi",
    notes: "Porticciolo di Acquamorta",
    price: "Incluso con tesseramento socio",
    published: true,
  });

  useEffect(() => {
    if (courseId) {
      fetch("/api/corsi-calendar?all=true")
        .then((res) => res.json())
        .then((d) => {
          const found = (d.data || []).find((c: CourseSession) => c.id === courseId);
          if (found) {
            setCourseData(found);
          } else {
            setNotification({ type: "error", message: "Sessione di corso non trovata" });
          }
        })
        .catch(() => setNotification({ type: "error", message: "Errore caricamento corso" }))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!courseData.courseTitle || !courseData.startDate || !courseData.schedule) {
      setNotification({ type: "error", message: "Compila tutti i campi obbligatori (Titolo, Data inizio, Orari)" });
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(courseId);
      const url = "/api/corsi-calendar";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...courseData, id: courseId } : courseData),
      });

      if (!res.ok) throw new Error("Errore durante il salvataggio");

      setNotification({ type: "success", message: "Sessione corso salvata! Reindirizzamento..." });
      setTimeout(() => {
        router.push("/admin?tab=corsi");
      }, 700);
    } catch {
      setNotification({ type: "error", message: "Impossibile salvare la sessione di corso" });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento sessione formativa...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={courseId ? `Modifica: ${courseData.courseTitle}` : "Nuova Sessione di Formazione"}
        subtitle="Configurazione date, orari, maestri istruttori e capienza posti per i percorsi in mare"
        backHref="/admin?tab=corsi"
        backLabel="Torna a Calendario Corsi"
        onSave={() => handleSubmit()}
        isSaving={saving}
        saveLabel="Salva Sessione"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Tipo di Corso
              </label>
              <select
                value={courseData.courseKey || "voga"}
                onChange={(e) => {
                  const key = e.target.value as CourseSession["courseKey"];
                  const titles: Record<CourseSession["courseKey"], string> = {
                    voga: "Scuola di Voga Tradizionale Flegrea",
                    vela: "Corso Armo & Conduzione Vela Latina",
                    rosa: "Progetto ROSA — Donne al Remo",
                    inclusione: "Arte Marinaresca & Inclusione Mare",
                  };
                  setCourseData({
                    ...courseData,
                    courseKey: key,
                    courseTitle: titles[key] || courseData.courseTitle,
                  });
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
              >
                <option value="voga">Voga in Piedi Tradizionale</option>
                <option value="vela">Vela Latina</option>
                <option value="rosa">Progetto ROSA — Donne al Remo</option>
                <option value="inclusione">Arte Marinaresca & Inclusione</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Nome del Corso Visualizzato *
              </label>
              <input
                type="text"
                required
                value={courseData.courseTitle || ""}
                onChange={(e) => setCourseData({ ...courseData, courseTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-[#fbfaf6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Data di Inizio della Sessione *
              </label>
              <input
                type="text"
                required
                value={courseData.startDate || ""}
                onChange={(e) => setCourseData({ ...courseData, startDate: e.target.value })}
                placeholder="Es. 9 Maggio 2026 oppure Sabato 16 Maggio"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Orari e Giorni *
              </label>
              <input
                type="text"
                required
                value={courseData.schedule || ""}
                onChange={(e) => setCourseData({ ...courseData, schedule: e.target.value })}
                placeholder="Es. Sabato mattina ore 09:30 – 12:30"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Posti Totali
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={courseData.totalSeats || 12}
                onChange={(e) => setCourseData({ ...courseData, totalSeats: parseInt(e.target.value, 10) || 12 })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Posti Disponibili Rimanenti
              </label>
              <input
                type="number"
                min={0}
                max={courseData.totalSeats || 50}
                required
                value={courseData.availableSeats || 0}
                onChange={(e) => setCourseData({ ...courseData, availableSeats: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Stato Iscrizioni
              </label>
              <select
                value={courseData.status || "aperte"}
                onChange={(e) => setCourseData({ ...courseData, status: e.target.value as CourseSession["status"] })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
              >
                <option value="aperte">Aperte</option>
                <option value="in-esaurimento">In Esaurimento</option>
                <option value="chiuse">Chiuse / Sold Out</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Maestro Istruttore / Tutor
              </label>
              <input
                type="text"
                value={courseData.instructor || ""}
                onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                placeholder="Es. Maestri Vogatori Montesi"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Quota di Partecipazione / Note Costo
              </label>
              <input
                type="text"
                value={courseData.price || ""}
                onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                placeholder="Es. Incluso con tesseramento socio"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Punto di Ritrovo & Note Operative
            </label>
            <textarea
              rows={3}
              value={courseData.notes || ""}
              onChange={(e) => setCourseData({ ...courseData, notes: e.target.value })}
              placeholder="Es. Ritrovo al Molo di Acquamorta, abbigliamento comodo e scarpe da scoglio..."
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=corsi")}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-xs font-mono font-semibold hover:bg-slate-100 transition-colors"
            >
              Annulla e Torna a Corsi
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {saving ? "Salvataggio..." : "Salva Sessione"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CourseEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center text-xs font-mono">Caricamento editor corso...</div>}>
      <CourseEditorContent />
    </Suspense>
  );
}
