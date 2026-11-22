"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Anchor,
  RefreshCw,
  CheckCircle2,
  Building2,
  Banknote,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  Hash,
  ArrowRight,
  MapPin,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageCircle,
} from "lucide-react";

interface BankInfo {
  iban: string;
  intestatario: string;
  istituto: string;
  filiale: string;
  bicSwift: string;
  telefonoSegreteria: string;
  emailSegreteria: string;
  approdo: string;
  codiceFiscaleEnte: string;
}

function RinnovoFormContent({ bankInfo }: { bankInfo: BankInfo }) {
  const searchParams = useSearchParams();
  const defaultYear =
    new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear();

  const [paymentMethod, setPaymentMethod] = useState<"bonifico" | "contanti">("bonifico");
  const [formData, setFormData] = useState({
    annoRinnovo: defaultYear,
    nome: "",
    email: "",
    telefono: "",
    numeroTessera: "",
    codiceFiscale: "",
    riferimentoBonifico: "",
    preferenzaIncontro: "",
    note: "",
  });

  const [copiedField, setCopiedField] = useState<"iban" | "causale" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Precompila i campi se il socio arriva dal link personalizzato della mail di invito al rinnovo
  useEffect(() => {
    const qAnno = searchParams.get("anno");
    const qNome = searchParams.get("nome");
    const qEmail = searchParams.get("email");
    const qTessera = searchParams.get("tessera");
    const qMetodo = searchParams.get("metodo");

    if (qMetodo === "contanti" || qMetodo === "bonifico") {
      setPaymentMethod(qMetodo);
    }

    if (qAnno || qNome || qEmail || qTessera) {
      setFormData((prev) => ({
        ...prev,
        annoRinnovo: qAnno && !isNaN(parseInt(qAnno, 10)) ? parseInt(qAnno, 10) : prev.annoRinnovo,
        nome: qNome || prev.nome,
        email: qEmail || prev.email,
        numeroTessera: qTessera || prev.numeroTessera,
      }));
    }
  }, [searchParams]);

  const causale = `Rinnovo Quota Sociale ${formData.annoRinnovo} - ${
    formData.nome.trim() || "[Cognome e Nome]"
  }${formData.numeroTessera.trim() ? ` (Tessera #${formData.numeroTessera.trim()})` : ""}`;

  const copyText = async (text: string, field: "iban" | "causale") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore clipboard errors on unsupported contexts
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const paymentLabel =
      paymentMethod === "bonifico" ? "Bonifico Bancario" : "Contanti in Sede (Acquamorta)";

    const messageParts: string[] = [
      `Modalità scelta: ${paymentLabel}`,
      `Anno rinnovo: ${formData.annoRinnovo}`,
    ];
    if (formData.numeroTessera.trim()) {
      messageParts.push(`Tessera precedente: #${formData.numeroTessera.trim()}`);
    }
    if (paymentMethod === "bonifico" && formData.riferimentoBonifico.trim()) {
      messageParts.push(`Riferimento/CRO bonifico: ${formData.riferimentoBonifico.trim()}`);
    }
    if (paymentMethod === "contanti" && formData.preferenzaIncontro.trim()) {
      messageParts.push(`Disponibilità consegna in sede: ${formData.preferenzaIncontro.trim()}`);
    }
    if (formData.note.trim()) {
      messageParts.push(`Note: ${formData.note.trim()}`);
    }

    try {
      const res = await fetch("/api/iscrizioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tesseramento",
          isRenewal: true,
          paymentMethod,
          annoRinnovo: formData.annoRinnovo,
          numeroTessera: formData.numeroTessera.trim() || undefined,
          name: formData.nome.trim(),
          email: formData.email.trim(),
          phone: formData.telefono.trim(),
          codiceFiscale: formData.codiceFiscale.trim().toUpperCase() || undefined,
          itemTitle: `Rinnovo Tessera ${formData.annoRinnovo} — ${paymentLabel}`,
          message: messageParts.join(" | "),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Si è verificato un errore durante l'invio del rinnovo.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 220, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore di connessione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWaNumber = bankInfo.telefonoSegreteria.replace(/[^0-9]/g, "");
  const waConfirmHref = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `Buongiorno, ho appena inviato online la richiesta di rinnovo tessera ${formData.annoRinnovo} per ${formData.nome} con pagamento ${
      paymentMethod === "bonifico" ? "tramite bonifico bancario" : "in contanti in sede ad Acquamorta"
    }.`
  )}`;

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      <main id="main-content">
        {/* HERO SECTION */}
        <section className="relative pt-32 sm:pt-40 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 bg-[#fbfaf6] border-b border-slate-200 overflow-hidden">
          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c99f5a]/40 bg-white text-[10px] sm:text-xs tracking-[0.25em] text-[#85580a] uppercase font-mono font-semibold shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 text-[#1b5b80]" />
              <span>Area Soci · Rinnovo Tesseramento Online</span>
            </div>

            <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-[#0a1c2a] leading-[0.95]">
              Rinnova la tua Tessera. <br />
              <span className="italic text-[#b8860b]">Continua la rotta.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-700 font-light leading-relaxed">
              Sei già socio dell&apos;<strong>Associazione Vela Latina Monte di Procida APS</strong>?
              Conferma il rinnovo della quota annuale (<strong>€ 50,00</strong>) scegliendo comodamente
              tra <strong>Bonifico Bancario</strong> o <strong>Contanti in sede</strong> al Porticciolo di Acquamorta.
            </p>

            {/* Switcher Nuovo Socio / Rinnovo */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              <span className="px-4 py-2 bg-[#0a1c2a] text-white font-bold uppercase tracking-wider border border-[#0a1c2a]">
                Rinnovo Socio Esistente
              </span>
              <Link
                href="/diventa-socio"
                className="px-4 py-2 bg-white text-slate-700 hover:text-[#0a1c2a] hover:border-[#0a1c2a] border border-slate-300 uppercase tracking-wider transition-colors"
              >
                Prima Iscrizione? Diventa Socio →
              </Link>
            </div>
          </div>
        </section>

        {/* CONTENUTO PRINCIPALE */}
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
          {submitted ? (
            /* SCHERMATA CONFERMA RINNOVO */
            <div className="max-w-2xl mx-auto bg-white border-2 border-emerald-500/40 p-8 sm:p-12 shadow-xl space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-700 font-bold block">
                  Richiesta di Rinnovo Registrata
                </span>
                <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#0a1c2a] font-semibold leading-tight">
                  Grazie, {formData.nome}!
                </h2>
                <p className="text-sm text-slate-700 font-light leading-relaxed">
                  Abbiamo registrato la tua richiesta di rinnovo per l&apos;anno{" "}
                  <strong>{formData.annoRinnovo}</strong> e inviato il riepilogo all&apos;indirizzo{" "}
                  <strong>{formData.email}</strong>.
                </p>
              </div>

              {paymentMethod === "bonifico" ? (
                <div className="bg-amber-50/70 border border-amber-300 p-6 space-y-4 text-xs font-mono">
                  <div className="flex items-center gap-2 text-amber-950 font-bold border-b border-amber-200 pb-2 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-[#b8860b]" />
                    <span>Coordinate per completare il Bonifico (€ 50,00)</span>
                  </div>

                  <div className="space-y-3 text-slate-800">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Intestatario</span>
                      <span className="font-bold text-[#0a1c2a]">{bankInfo.intestatario}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">IBAN</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <code className="px-3 py-1.5 bg-white border border-dashed border-amber-500 text-sm font-bold text-[#0a1c2a] tracking-wider">
                          {bankInfo.iban}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyText(bankInfo.iban, "iban")}
                          className="px-2.5 py-1.5 bg-[#0a1c2a] text-white hover:bg-[#b8860b] text-[10px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === "iban" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === "iban" ? "Copiato" : "Copia IBAN"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Causale</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1.5 bg-white border border-amber-200 text-xs font-semibold text-[#0a1c2a]">
                          {causale}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(causale, "causale")}
                          className="px-2.5 py-1.5 border border-slate-300 bg-white hover:border-[#0a1c2a] text-[#0a1c2a] text-[10px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === "causale" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === "causale" ? "Copiata" : "Copia"}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-900 pt-1 leading-relaxed">
                      Una volta effettuato il bonifico, rispondi all&apos;email di riepilogo allegando la contabile (oppure inviala su WhatsApp) per ricevere la conferma ufficiale della tessera {formData.annoRinnovo}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-300 p-6 space-y-3 text-xs font-mono text-emerald-950">
                  <div className="flex items-center gap-2 font-bold border-b border-emerald-200 pb-2 uppercase tracking-wider">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Pagamento in Contanti in Sede (€ 50,00)</span>
                  </div>
                  <p className="leading-relaxed">
                    La tua intenzione di rinnovo in contanti è stata segnalata alla segreteria.
                    Potrai versare la quota direttamente presso il{" "}
                    <strong>{bankInfo.approdo}</strong> ritirando la ricevuta del tesoriere.
                  </p>
                  {formData.preferenzaIncontro && (
                    <p className="text-[11px] text-emerald-800">
                      <strong>Disponibilità indicata:</strong> {formData.preferenzaIncontro}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={waConfirmHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs uppercase tracking-widest font-mono font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Avvisa su WhatsApp</span>
                </a>
                <Link
                  href="/"
                  className="px-5 py-3 bg-[#0a1c2a] text-white text-xs uppercase tracking-widest font-mono font-semibold hover:bg-[#b8860b] transition-colors"
                >
                  Torna alla Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* COLONNA SINISTRA: SCELTA PAGAMENTO + COORDINATE */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b8860b] font-bold block">
                    Passo 1 · Scegli come rinnovare
                  </span>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-normal leading-tight">
                    Due modalità semplici e trasparenti.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                    Quota associativa annuale invariata a <strong>€ 50,00</strong>. Scegli l&apos;opzione che preferisci qui sotto e conferma i tuoi dati nel modulo accanto.
                  </p>
                </div>

                {/* CARD SCELTA METODO DI PAGAMENTO */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bonifico")}
                    className={`w-full text-left p-5 border-2 transition-all cursor-pointer ${
                      paymentMethod === "bonifico"
                        ? "bg-white border-[#0a1c2a] shadow-md"
                        : "bg-white/70 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xs ${
                            paymentMethod === "bonifico"
                              ? "bg-[#0a1c2a] text-[#c99a45]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0a1c2a]">
                              Bonifico Bancario
                            </span>
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-mono font-bold uppercase">
                              Consigliato
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-light leading-relaxed">
                            Paga comodamente da home banking con IBAN ufficiale e causale precompilata.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                          paymentMethod === "bonifico" ? "border-[#0a1c2a]" : "border-slate-300"
                        }`}
                      >
                        {paymentMethod === "bonifico" && (
                          <span className="w-2 h-2 rounded-full bg-[#b8860b]" />
                        )}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("contanti")}
                    className={`w-full text-left p-5 border-2 transition-all cursor-pointer ${
                      paymentMethod === "contanti"
                        ? "bg-white border-[#0a1c2a] shadow-md"
                        : "bg-white/70 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xs ${
                            paymentMethod === "contanti"
                              ? "bg-[#0a1c2a] text-[#c99a45]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0a1c2a]">
                            Contanti in Sede (Acquamorta)
                          </span>
                          <p className="text-xs text-slate-600 mt-1 font-light leading-relaxed">
                            Prenota il rinnovo online e consegna la quota di persona in banchina al tesoriere.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                          paymentMethod === "contanti" ? "border-[#0a1c2a]" : "border-slate-300"
                        }`}
                      >
                        {paymentMethod === "contanti" && (
                          <span className="w-2 h-2 rounded-full bg-[#b8860b]" />
                        )}
                      </span>
                    </div>
                  </button>
                </div>

                {/* DETTAGLI DINAMICI DEL METODO SCELTO */}
                {paymentMethod === "bonifico" ? (
                  <div className="p-5 bg-amber-50/80 border border-amber-300 space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-2 text-amber-950 font-bold uppercase tracking-wider border-b border-amber-200 pb-2">
                      <CreditCard className="w-4 h-4 text-[#b8860b]" />
                      <span>Dati per il Bonifico Bancario</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Intestatario</span>
                        <span className="font-bold text-[#0a1c2a]">{bankInfo.intestatario}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Banca</span>
                        <span className="text-slate-700">{bankInfo.istituto}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">IBAN</span>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <code className="px-2.5 py-1 bg-white border border-dashed border-amber-500 font-bold text-[#0a1c2a] text-xs tracking-wider">
                            {bankInfo.iban}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyText(bankInfo.iban, "iban")}
                            className="px-2 py-1 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-[10px] uppercase inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === "iban" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === "iban" ? "Copiato" : "Copia"}</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Causale Consigliata</span>
                        <div className="mt-1 flex items-start gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-white border border-amber-200 text-[#0a1c2a] text-[11px] leading-snug">
                            {causale}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(causale, "causale")}
                            className="px-2 py-1 border border-slate-300 bg-white hover:border-[#0a1c2a] text-[#0a1c2a] text-[10px] uppercase inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === "causale" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === "causale" ? "Copiata" : "Copia"}</span>
                          </button>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-amber-200/80 flex items-center justify-between text-[#0a1c2a]">
                        <span>Importo Quota Annuale</span>
                        <strong className="text-sm">€ 50,00</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-white border border-slate-300 space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#0a1c2a] font-bold uppercase tracking-wider border-b border-slate-200 pb-2">
                      <MapPin className="w-4 h-4 text-[#1b5b80]" />
                      <span>Consegna Contanti in Sede</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans text-xs">
                      Puoi consegnare la quota di <strong>€ 50,00</strong> in contanti al tesoriere o a un consigliere presso la nostra base nautica al{" "}
                      <strong>{bankInfo.approdo}</strong> (Via Guglielmo Marconi snc, Monte di Procida).
                    </p>
                    <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                      <div>
                        <strong>Segreteria:</strong> {bankInfo.telefonoSegreteria}
                      </div>
                      <div>
                        <strong>Email:</strong> {bankInfo.emailSegreteria}
                      </div>
                      <div className="text-emerald-700 font-semibold pt-1">
                        ✓ Rilascio immediato ricevuta & aggiornamento Libro Soci
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-light">
                    APS iscritta al RUNTS (C.F. <strong>{bankInfo.codiceFiscaleEnte}</strong>). Il rinnovo mantiene attivo il tuo numero di tessera nel Libro Soci e la copertura assicurativa durante tutte le uscite in mare.
                  </p>
                </div>
              </div>

              {/* COLONNA DESTRA: MODULO DI CONFERMA RINNOVO */}
              <div className="lg:col-span-7 bg-white border-2 border-[#0a1c2a]/20 p-6 sm:p-10 shadow-lg">
                <div className="border-b border-slate-200 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500 font-bold block">
                      Passo 2 · Conferma Dati Socio
                    </span>
                    <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl text-[#0a1c2a] font-semibold">
                      Modulo Rinnovo Tessera {formData.annoRinnovo}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      paymentMethod === "bonifico"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-emerald-50 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    {paymentMethod === "bonifico" ? "Bonifico Bancario" : "Contanti in Sede"}
                  </span>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-900 text-xs font-mono">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="rinnovo-nome"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Cognome e Nome *
                      </label>
                      <div className="relative">
                        <input
                          id="rinnovo-nome"
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="es. Mario Rossi"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="rinnovo-anno"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Anno Rinnovo *
                      </label>
                      <select
                        id="rinnovo-anno"
                        value={formData.annoRinnovo}
                        onChange={(e) =>
                          setFormData({ ...formData, annoRinnovo: parseInt(e.target.value, 10) })
                        }
                        className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs font-mono font-bold text-[#0a1c2a] focus:border-[#0a1c2a] outline-none cursor-pointer"
                      >
                        <option value={2027}>2027</option>
                        <option value={2026}>2026</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rinnovo-email"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Indirizzo Email *
                      </label>
                      <div className="relative">
                        <input
                          id="rinnovo-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="es. mario.rossi@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="rinnovo-telefono"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Cellulare / WhatsApp *
                      </label>
                      <div className="relative">
                        <input
                          id="rinnovo-telefono"
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="es. 333 1234567"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs font-mono text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rinnovo-tessera"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Nr. Tessera (se lo ricordi)
                      </label>
                      <div className="relative">
                        <input
                          id="rinnovo-tessera"
                          type="text"
                          value={formData.numeroTessera}
                          onChange={(e) => setFormData({ ...formData, numeroTessera: e.target.value })}
                          placeholder="es. 55 (opzionale)"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs font-mono text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="rinnovo-cf"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Codice Fiscale (opzionale)
                      </label>
                      <input
                        id="rinnovo-cf"
                        type="text"
                        maxLength={16}
                        value={formData.codiceFiscale}
                        onChange={(e) =>
                          setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })
                        }
                        placeholder="Utile se non ancora registrato"
                        className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs font-mono text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                      />
                    </div>
                  </div>

                  {/* Campo contestuale in base al metodo di pagamento scelto */}
                  {paymentMethod === "bonifico" ? (
                    <div>
                      <label
                        htmlFor="rinnovo-cro"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        CRO / Data Bonifico (opzionale — se già eseguito)
                      </label>
                      <div className="relative">
                        <input
                          id="rinnovo-cro"
                          type="text"
                          value={formData.riferimentoBonifico}
                          onChange={(e) =>
                            setFormData({ ...formData, riferimentoBonifico: e.target.value })
                          }
                          placeholder="es. Bonifico effettuato il 22/11 oppure 'Lo eseguirò a breve'"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="rinnovo-incontro"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Quando preferisci passare in sede? (opzionale)
                      </label>
                      <input
                        id="rinnovo-incontro"
                        type="text"
                        value={formData.preferenzaIncontro}
                        onChange={(e) =>
                          setFormData({ ...formData, preferenzaIncontro: e.target.value })
                        }
                        placeholder="es. Sabato mattina ad Acquamorta, o il prossimo weekend"
                        className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="rinnovo-note"
                      className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                    >
                      Aggiornamenti Anagrafici o Note (opzionale)
                    </label>
                    <textarea
                      id="rinnovo-note"
                      rows={2}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Indica qui eventuali cambi di residenza, documento o preferenze per le uscite in mare..."
                      className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                    <Anchor className="w-4 h-4 text-[#1b5b80] shrink-0 mt-0.5" />
                    <span>
                      {paymentMethod === "bonifico"
                        ? "Riceverai subito un'email di riepilogo con IBAN e causale. A bonifico riscontrato, la segreteria aggiornerà la tua tessera nel Libro Soci."
                        : "La segreteria riceverà la tua prenotazione di rinnovo in contanti e ti confermerà la disponibilità in sede ad Acquamorta."}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0a1c2a] text-white text-xs uppercase tracking-[0.25em] font-bold hover:bg-[#b8860b] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Registrazione rinnovo in corso...</span>
                    ) : (
                      <>
                        <span>
                          Conferma Rinnovo {formData.annoRinnovo} (
                          {paymentMethod === "bonifico" ? "Bonifico" : "Contanti in Sede"})
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function RinnovoClient({ bankInfo }: { bankInfo: BankInfo }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center text-xs font-mono text-slate-500">
          Caricamento sezione rinnovo tessera...
        </div>
      }
    >
      <RinnovoFormContent bankInfo={bankInfo} />
    </Suspense>
  );
}
