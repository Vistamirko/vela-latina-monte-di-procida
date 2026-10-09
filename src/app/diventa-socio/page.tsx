"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Anchor,
  Compass,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  User,
  Calendar,
  Waves,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react";

export default function DiventaSocioPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefono: "",
    dataLuogoNascita: "",
    codiceFiscale: "",
    tipologia: "Socio Praticante (Voga in Piedi & Vela Latina)",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/iscrizioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tesseramento",
          name: formData.nome,
          email: formData.email,
          phone: formData.telefono,
          dataLuogoNascita: formData.dataLuogoNascita,
          codiceFiscale: formData.codiceFiscale,
          itemTitle: formData.tipologia,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Si è verificato un errore durante l'invio.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore di connessione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      <main>
        {/* HERO SECTION - ELEGANTE & LUMINOSA STILE EDITORIALE */}
        <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-8 lg:px-12 bg-[#fbfaf6] border-b border-slate-200 overflow-hidden">
          {/* Filigrana Nautica Sottile */}
          <div className="absolute top-10 right-0 sm:right-12 pointer-events-none opacity-20 select-none overflow-hidden">
            <Compass className="w-64 h-64 sm:w-96 sm:h-96 text-[#c99f5a]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c99f5a]/40 bg-white text-[10px] sm:text-xs tracking-[0.25em] text-[#85580a] uppercase font-mono font-semibold shadow-2xs">
              <Anchor className="w-3.5 h-3.5 text-[#1b5b80]" />
              <span>Adesione Ufficiale · Anno 2026</span>
            </div>

            <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-[#0a1c2a] leading-[0.95]">
              Sali a bordo dell&apos;equipaggio. <br />
              <span className="italic text-[#b8860b]">Diventa Socio oggi.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-700 font-light leading-relaxed">
              Unisciti all&apos;<strong>Associazione Vela Latina Monte di Procida (APS)</strong>.
              Che tu voglia imparare a vogare in piedi, timonare un gozzo storico o semplicemente supportare
              la salvaguardia della marineria flegrea, qui trovi una comunità viva e accogliente.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-200 text-left">
              <div className="p-3.5 bg-white border border-slate-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-700 font-medium">Quota Annuale</span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-semibold text-[#0a1c2a]">€ 50</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-700 font-medium">Attività</span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-semibold text-[#0a1c2a]">Tutto l&apos;anno</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-700 font-medium">Registro</span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-semibold text-[#0a1c2a]">Libro Soci APS</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 shadow-2xs">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-700 font-medium">Tempo Iscrizione</span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-semibold text-[#0a1c2a]">1 Minuto</span>
              </div>
            </div>
          </div>
        </section>

        {/* MODULO E PERCORSO DI ADESIONE */}
        <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
          {submitted ? (
            /* CONFERMA AVVENUTA REGISTRAZIONE */
            <div className="max-w-2xl mx-auto bg-white border-2 border-emerald-500/40 p-8 sm:p-12 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-700 font-bold block">
                  Richiesta Ricevuta con Successo
                </span>
                <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#0a1c2a] font-semibold leading-tight">
                  Benvenuto a Bordo, {formData.nome}!
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                La tua domanda di ammissione a socio è stata registrata nel sistema della segreteria.
                Abbiamo inviato un&apos;email di conferma all&apos;indirizzo <strong>{formData.email}</strong> con tutti i dettagli e il riepilogo.
              </p>

              {/* Istruzioni pratiche di pagamento */}
              <div className="bg-[#fbfaf6] border border-slate-300 p-6 text-left space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-[#0a1c2a] font-bold">
                  <CreditCard className="w-4 h-4 text-[#b8860b]" />
                  <span className="uppercase tracking-wider">Come completare il tesseramento:</span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#0a1c2a]">1.</span>
                    <span>Versa la quota sociale annuale di <strong>€ 50,00</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#0a1c2a]">2.</span>
                    <span>
                      Puoi pagare comodamente con <strong>Bonifico Bancario</strong> (trovi l&apos;IBAN nella tua casella email)
                      oppure <strong>in contanti</strong> direttamente presso la nostra sede al Molo di Acquamorta.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#0a1c2a]">3.</span>
                    <span>
                      La segreteria convaliderà il pagamento e riceverai la formale attestazione di iscrizione
                      con il tuo <strong>Numero Ufficiale di Tessera del Libro Soci</strong>.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-[#0a1c2a] text-white text-xs uppercase tracking-widest font-mono font-semibold hover:bg-[#b8860b] transition-colors"
                >
                  Torna alla Home
                </Link>
                <Link
                  href="/associazione"
                  className="px-6 py-3 border border-slate-300 text-[#0a1c2a] text-xs uppercase tracking-widest font-mono font-semibold hover:border-slate-800 transition-colors"
                >
                  Scopri la Storia dell&apos;Associazione
                </Link>
              </div>
            </div>
          ) : (
            /* LAYOUT A DUE COLONNE: VANTAGGI + FORM IMMEDIATO */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* COLONNA SINISTRA: COSA SIGNIFICA ESSERE SOCIO */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b8860b] font-bold block">
                    Perché Associarsi
                  </span>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-normal leading-tight">
                    Una comunità unita dalla passione per il mare e la tradizione.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    Essere socio di Vela Latina Monte di Procida significa non essere un semplice spettatore,
                    ma protagonista attivo della tutela marinara e culturale dei Campi Flegrei.
                  </p>
                </div>

                {/* Vantaggi chiave */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0a1c2a]">
                      <Waves className="w-4 h-4 text-[#1b5b80]" />
                      <span className="uppercase tracking-wider">Uscite in Mare & Pratica</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-6 font-light">
                      Possibilità di partecipare alle uscite didattiche in mare, agli allenamenti di voga in piedi e alle veleggiata d&apos;armo tradizionale.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0a1c2a]">
                      <Heart className="w-4 h-4 text-[#b8860b]" />
                      <span className="uppercase tracking-wider">Cantiere e Restauro Storico</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-6 font-light">
                      Accesso alle attività di recupero dei gozzi d&apos;epoca insieme ai maestri d&apos;ascia montesi, per imparare i segreti della lavorazione del legno.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0a1c2a]">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span className="uppercase tracking-wider">Tessera Ufficiale & Libro Soci</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-6 font-light">
                      Iscrizione ufficiale al Libro Soci APS, convenzioni dedicate e copertura assicurativa durante le attività associative.
                    </p>
                  </div>
                </div>

                {/* Box trasparenza quota */}
                <div className="p-5 bg-amber-50/70 border border-amber-200/90 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold font-mono">
                    <Sparkles className="w-4 h-4 text-[#b8860b]" />
                    <span>QUOTA ASSOCIATIVA 2026: € 50</span>
                  </div>
                  <p className="leading-relaxed">
                    La quota sociale è valida per l&apos;intero anno solare e viene impiegata al 100% per la manutenzione delle imbarcazioni,
                    le attrezzature di bordo, la sicurezza in mare e i progetti culturali per i giovani.
                  </p>
                </div>
              </div>

              {/* COLONNA DESTRA: MODULO DIRETTO IMMEDIATO */}
              <div className="lg:col-span-7 bg-white border-2 border-[#0a1c2a]/20 p-6 sm:p-10 shadow-lg relative">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500 font-bold block">
                    Compilazione Online
                  </span>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl text-[#0a1c2a] font-semibold">
                    Modulo di Richiesta Tesseramento
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    I campi con l&apos;asterisco (*) sono obbligatori per l&apos;iscrizione a norma di legge nel Libro Soci.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-900 text-xs font-mono">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="socio-nome"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Cognome e Nome *
                      </label>
                      <div className="relative">
                        <input
                          id="socio-nome"
                          name="nome"
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="es. Gaetano Scotto"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="socio-email"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Indirizzo Email *
                      </label>
                      <div className="relative">
                        <input
                          id="socio-email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="es. gaetano@esempio.it"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="socio-telefono"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Recapito Telefonico / Cellulare *
                      </label>
                      <div className="relative">
                        <input
                          id="socio-telefono"
                          name="telefono"
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="es. +39 333 1234567"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="socio-nascita"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Data & Luogo di Nascita *
                      </label>
                      <div className="relative">
                        <input
                          id="socio-nascita"
                          name="dataLuogoNascita"
                          type="text"
                          required
                          value={formData.dataLuogoNascita}
                          onChange={(e) => setFormData({ ...formData, dataLuogoNascita: e.target.value })}
                          placeholder="es. 15.07.1984 Monte di Procida"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                        />
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="socio-tipologia"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Tipologia di Tesseramento
                      </label>
                      <select
                        id="socio-tipologia"
                        name="tipologia"
                        value={formData.tipologia}
                        onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none cursor-pointer"
                      >
                        <option>Socio Praticante (Voga in Piedi & Vela Latina)</option>
                        <option>Socio Ordinario Sostenitore</option>
                        <option>Volontario Cantiere & Restauro Gozzi</option>
                        <option>Progetto ROSA (Attività Femminile)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="socio-cf"
                        className="block text-[11px] uppercase font-mono tracking-wider text-[#0a1c2a] font-bold mb-1.5"
                      >
                        Codice Fiscale (opzionale)
                      </label>
                      <input
                        id="socio-cf"
                        name="codiceFiscale"
                        type="text"
                        value={formData.codiceFiscale}
                        onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })}
                        placeholder="SCTGTN84L15F839X"
                        className="w-full px-3 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
                    <p className="font-semibold text-[#0a1c2a]">
                      ✓ Conferma immediata via email
                    </p>
                    <p>
                      Inviando la domanda riceverai all&apos;istante le coordinate bancarie per il versamento della quota (€50).
                      La segreteria dell&apos;Associazione convaliderà la richiesta emettendo la tua tessera socio ufficiale.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0a1c2a] text-white text-xs uppercase tracking-[0.25em] font-bold hover:bg-[#b8860b] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Invio domanda in corso...</span>
                    ) : (
                      <>
                        <span>Invia Domanda di Tesseramento</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* DOMANDE FREQUENTI */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 font-bold block">
                F.A.Q.
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a]">
                Domande Frequenti sul Tesseramento
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
              <div className="p-5 bg-[#fbfaf6] border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-[#0a1c2a] text-sm">Devo avere già esperienza di vela o voga?</h4>
                <p>
                  Assolutamente no! Molti soci salgono a bordo per la prima volta. I nostri soci esperti e maestri d&apos;ascia
                  guidano ogni neofita nei primi passi in mare con la massima sicurezza e spirito di condivisione.
                </p>
              </div>

              <div className="p-5 bg-[#fbfaf6] border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-[#0a1c2a] text-sm">Dove e quando si tengono le uscite?</h4>
                <p>
                  La base operativa è al Porticciolo di Acquamorta a Monte di Procida. Le uscite si svolgono durante i weekend
                  e nei pomeriggi feriali, meteo permettendo, con avvisi dedicati nel gruppo soci.
                </p>
              </div>

              <div className="p-5 bg-[#fbfaf6] border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-[#0a1c2a] text-sm">Come ricevo la mia tessera ufficiale?</h4>
                <p>
                  Non appena confermato il pagamento della quota annuale, la segreteria assegna il progressivo nel Libro Soci
                  e ti rilascia la tessera socio con attestato di benvenuto.
                </p>
              </div>

              <div className="p-5 bg-[#fbfaf6] border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-[#0a1c2a] text-sm">Posso tesserarmi solo per supportare l&apos;APS?</h4>
                <p>
                  Certamente! Scegliendo la tipologia <em>Socio Ordinario Sostenitore</em>, contribuisci concretamente alle spese
                  di conservazione dei gozzi storici e puoi partecipare a tutti gli eventi conviviali e culturali.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
