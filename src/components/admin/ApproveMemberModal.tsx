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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a]">
              Conferma Pagamento & Ammissione Socio
            </h3>
            <p className="text-xs text-slate-600 font-light">
              Registra l&apos;incasso della quota e inserisci ufficialmente il richiedente nel Libro Soci.
            </p>
          </div>
        </div>

        {/* Scheda dati richiedente */}
        <div className="p-4 bg-[#fbfaf6] border border-slate-200 text-xs mb-6 space-y-1.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500">Aspirante Socio</span>
            <span className="font-mono text-[10px] uppercase font-bold text-[#1b5b80]">{booking.itemTitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
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
                <span className="text-slate-800">{booking.codiceFiscale}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors text-xs font-mono ${
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
                <CreditCard className="w-4 h-4 text-slate-700" />
                <span>Bonifico Bancario</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors text-xs font-mono ${
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
                <span className="font-bold text-slate-700">€</span>
                <span>Contanti in Sede</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
              Note interne di segreteria (opzionale)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="es. Bonifico accreditato il 08/10, consegnata tessera fisica"
              className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="send-approval-email"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a] cursor-pointer"
            />
            <label htmlFor="send-approval-email" className="text-xs font-mono text-slate-700 cursor-pointer">
              Invia subito email ufficiale di benvenuto con numero di tessera a <strong>{booking.email}</strong>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#b8860b] hover:bg-[#996f08] text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Salvataggio..." : "Conferma & Registra nel Libro Soci"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
