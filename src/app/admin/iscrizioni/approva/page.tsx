"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { BookingRequest } from "@/lib/db/types";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Send,
} from "lucide-react";

function ApprovaIscrizioneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [anno, setAnno] = useState<number>(2026);
  const [metodoPagamento, setMetodoPagamento] = useState<"bonifico" | "contanti">("bonifico");
  const [importo, setImporto] = useState<number>(50);
  const [numeroTessera, setNumeroTessera] = useState<string>("");
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setNotification({ type: "error", message: "ID richiesta non specificato" });
      return;
    }

    // Carica richiesta iscrizione
    fetch("/api/iscrizioni")
      .then((res) => res.json())
      .then((d) => {
        const list: BookingRequest[] = d.data || [];
        const found = list.find((b) => b.id === bookingId);
        if (found) {
          setBooking(found);
          if (found.message) {
            setNote(`Da richiesta online: ${found.message}`);
          }
        } else {
          setNotification({ type: "error", message: "Richiesta non trovata" });
        }
      })
      .catch(() => setNotification({ type: "error", message: "Errore nel caricamento della richiesta" }))
      .finally(() => setLoading(false));

    // Suggerimento prossimo numero tessera
    fetch(`/api/soci?anno=${anno}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.nextInfo?.nextTessera) {
          setNumeroTessera(String(data.nextInfo.nextTessera));
        }
      })
      .catch(() => {});
  }, [bookingId, anno]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/soci/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          anno,
          metodoPagamento,
          importo,
          numeroTessera,
          sendEmail,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante l'approvazione del socio");
      }

      setNotification({
        type: "success",
        message: `Pagamento registrato! ${booking.name} è stato inserito nel Libro Soci #${numeroTessera}.`,
      });

      setTimeout(() => {
        router.push("/admin?tab=richieste");
      }, 800);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Errore durante l'operazione" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento dettagli richiesta...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="text-sm font-mono text-rose-700">Richiesta non trovata o parametro non valido.</div>
        <button
          onClick={() => router.push("/admin?tab=richieste")}
          className="px-4 py-2 bg-[#0a1c2a] text-white text-xs font-mono font-bold"
        >
          Torna alle Richieste
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={`Conferma & Registra: ${booking.name}`}
        subtitle="Verifica il pagamento della quota e registra formalmente il richiedente nel Libro Soci"
        backHref="/admin?tab=richieste"
        backLabel="Torna alle Richieste"
        onSave={handleSubmit}
        isSaving={submitting}
        saveLabel="Conferma & Iscrivi nel Libro Soci"
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

        {/* SCHEDA DATI ASPIRANTE SOCIO */}
        <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#b8860b]">
              <ShieldCheck className="w-4 h-4" />
              <span>Dati Candidato Socio Ricevuti</span>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-[#0a1c2a] font-bold">
              {booking.itemTitle}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Nome e Cognome</span>
              <strong className="text-sm text-[#0a1c2a] block">{booking.name}</strong>
            </div>

            <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Indirizzo Email</span>
              <span className="text-[#0a1c2a] font-medium break-all block">{booking.email}</span>
            </div>

            <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Telefono</span>
              <span className="text-[#0a1c2a] block">{booking.phone || "Non indicato"}</span>
            </div>

            {booking.dataLuogoNascita && (
              <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Nascita</span>
                <span className="text-[#0a1c2a] block">{booking.dataLuogoNascita}</span>
              </div>
            )}

            {booking.codiceFiscale && (
              <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Codice Fiscale</span>
                <strong className="text-[#0a1c2a] tracking-wider block">{booking.codiceFiscale}</strong>
              </div>
            )}

            {booking.experience && (
              <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Livello / Esperienza</span>
                <span className="text-[#0a1c2a] block">{booking.experience}</span>
              </div>
            )}
          </div>

          {booking.message && (
            <div className="p-3 bg-[#fbfaf6] border border-slate-200 text-xs font-mono space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Messaggio allegato alla richiesta:</span>
              <p className="text-slate-700 italic font-sans">{booking.message}</p>
            </div>
          )}
        </div>

        {/* FORM REGISTRAZIONE NEL LIBRO SOCI */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                Parametri Iscrizione & Quota
              </h2>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Specifica l&apos;importo incassato, la modalità di pagamento e il numero tessera ufficiale.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Anno Sociale *
                </label>
                <input
                  type="number"
                  required
                  value={anno}
                  onChange={(e) => setAnno(parseInt(e.target.value, 10) || 2026)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Quota Incassata (€) *
                </label>
                <input
                  type="number"
                  required
                  value={importo}
                  onChange={(e) => setImporto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:border-[#0a1c2a] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Nr. Tessera Assegnato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. 94"
                  value={numeroTessera}
                  onChange={(e) => setNumeroTessera(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-amber-300 bg-amber-50/40 text-sm font-mono font-bold focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-2">
                Metodo di Pagamento Ricevuto
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-colors text-xs font-mono ${
                    metodoPagamento === "bonifico"
                      ? "border-[#0a1c2a] bg-[#fbfaf6] font-bold text-[#0a1c2a] shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value="bonifico"
                    checked={metodoPagamento === "bonifico"}
                    onChange={() => setMetodoPagamento("bonifico")}
                    className="sr-only"
                  />
                  <CreditCard className="w-4 h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="block font-bold">Bonifico Bancario</span>
                    <span className="text-[11px] text-slate-500 font-normal">Accreditato su conto associazione</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-colors text-xs font-mono ${
                    metodoPagamento === "contanti"
                      ? "border-[#0a1c2a] bg-[#fbfaf6] font-bold text-[#0a1c2a] shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value="contanti"
                    checked={metodoPagamento === "contanti"}
                    onChange={() => setMetodoPagamento("contanti")}
                    className="sr-only"
                  />
                  <div className="w-4 h-4 font-bold text-slate-700 flex items-center justify-center shrink-0">€</div>
                  <div>
                    <span className="block font-bold">Pagamento Contanti</span>
                    <span className="text-[11px] text-slate-500 font-normal">Quietanzato presso la sede</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Note Interne (facoltative)
              </label>
              <input
                type="text"
                placeholder="es. Bonifico verificato pervenuto da banca X..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 bg-[#fbfaf6] hover:border-slate-400 transition-colors">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a]"
                />
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0a1c2a] block">
                      Invia Email di Benvenuto e Conferma Tesseramento
                    </span>
                    <span className="text-[11px] text-slate-500 font-light">
                      Invia una notifica con benvenuto e conferma del numero di tessera assegnato a {booking.email}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=richieste")}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-xs font-mono font-semibold transition-colors text-center cursor-pointer"
            >
              Annulla Operazione
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Registrazione in corso..." : "Conferma & Iscrivi nel Libro Soci"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApprovaIscrizionePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
          Caricamento...
        </div>
      }
    >
      <ApprovaIscrizioneContent />
    </Suspense>
  );
}
