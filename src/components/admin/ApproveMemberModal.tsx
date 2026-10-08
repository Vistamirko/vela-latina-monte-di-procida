"use client";

import { useState, useEffect } from "react";
import { BookingRequest } from "@/lib/db/types";
import { CheckCircle2, X, CreditCard, Mail, User, ShieldCheck } from "lucide-react";

interface ApproveMemberModalProps {
  isOpen: boolean;
  booking: BookingRequest | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (type: "success" | "error", message: string) => void;
}

export default function ApproveMemberModal({
  isOpen,
  booking,
  onClose,
  onSuccess,
  showToast,
}: ApproveMemberModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [anno, setAnno] = useState(2026);
  const [metodoPagamento, setMetodoPagamento] = useState<"bonifico" | "contanti">("bonifico");
  const [importo, setImporto] = useState<number>(50);
  const [numeroTessera, setNumeroTessera] = useState<string>("");
  const [sendEmail, setSendEmail] = useState(true);
  const [note, setNote] = useState("");

  // Recupera suggerimento automatico per il prossimo numero tessera
  useEffect(() => {
    if (isOpen && booking) {
      fetch(`/api/soci?anno=${anno}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.nextInfo?.nextTessera) {
            setNumeroTessera(String(data.nextInfo.nextTessera));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, booking, anno]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      showToast(
        "success",
        `Pagamento confermato! ${booking.name} è stato registrato nel Libro Soci #${numeroTessera}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast("error", err.message || "Errore durante l'operazione");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-slate-200 max-w-xl w-full h-[96vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-none shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Sticky Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a] leading-tight">
                Conferma Pagamento & Socio
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-light hidden sm:block">
                Registra la quota e inserisci il richiedente nel Libro Soci.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Scheda dati richiedente */}
            <div className="p-3 sm:p-4 bg-[#fbfaf6] border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500">Aspirante Socio</span>
                <span className="font-mono text-[10px] uppercase font-bold text-[#1b5b80]">{booking.itemTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-500">Nome: </span>
                  <strong className="text-[#0a1c2a]">{booking.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Email: </span>
                  <span className="text-slate-800">{booking.email}</span>
                </div>
                {booking.phone && (
                  <div>
                    <span className="text-slate-500">Telefono: </span>
                    <span className="text-slate-800">{booking.phone}</span>
                  </div>
                )}
                {booking.dataLuogoNascita && (
                  <div>
                    <span className="text-slate-500">Nascita: </span>
                    <span className="text-slate-800">{booking.dataLuogoNascita}</span>
                  </div>
                )}
                {booking.codiceFiscale && (
                  <div>
                    <span className="text-slate-500">C.F.: </span>
                    <span className="text-slate-800 font-bold">{booking.codiceFiscale}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Anno Sociale
                </label>
                <input
                  type="number"
                  required
                  value={anno}
                  onChange={(e) => setAnno(parseInt(e.target.value, 10) || 2026)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Quota Incassata (€)
                </label>
                <input
                  type="number"
                  required
                  value={importo}
                  onChange={(e) => setImporto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] font-mono outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Nr. Tessera Assegnato
                </label>
                <input
                  type="text"
                  required
                  value={numeroTessera}
                  onChange={(e) => setNumeroTessera(e.target.value)}
                  placeholder="es. 94"
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50/30 text-xs text-[#0a1c2a] font-bold font-mono outline-none focus:border-[#0a1c2a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Metodo di Pagamento Ricevuto
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <label
                  className={`flex items-center gap-2 p-2.5 sm:p-3 border cursor-pointer transition-colors text-xs font-mono ${
                    metodoPagamento === "bonifico"
                      ? "border-[#0a1c2a] bg-[#fbfaf6] font-bold text-[#0a1c2a]"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
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
                  <span className="truncate">Bonifico</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2.5 sm:p-3 border cursor-pointer transition-colors text-xs font-mono ${
                    metodoPagamento === "contanti"
                      ? "border-[#0a1c2a] bg-[#fbfaf6] font-bold text-[#0a1c2a]"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
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
                  <span className="font-bold text-slate-700 shrink-0">€</span>
                  <span className="truncate">Contanti</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Note interne (opzionale)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="es. Bonifico verificato, quota annuale versata"
                className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
              <input
                type="checkbox"
                id="send-approval-email"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a] cursor-pointer"
              />
              <label htmlFor="send-approval-email" className="text-[11px] sm:text-xs font-mono text-slate-700 cursor-pointer">
                Invia email ufficiale di benvenuto con numero di tessera a <strong>{booking.email}</strong>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#b8860b] hover:bg-[#996f08] text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submitting ? "Salvataggio..." : "Conferma Socio"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
