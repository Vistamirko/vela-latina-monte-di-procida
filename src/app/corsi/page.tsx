"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GraduationCap, CheckCircle2, Calendar, Clock } from "lucide-react";
import { CourseSession } from "@/lib/db/types";

export default function CorsiPage() {
  const [calendarSessions, setCalendarSessions] = useState<CourseSession[]>([]);
  const [courseSubmitted, setCourseSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefono: "",
    corso: "voga",
    esperienza: "principiante",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const courseLabels: Record<string, string> = {
      voga: "Voga Tradizionale Flegrea",
      vela: "Corso di Vela Latina",
      rosa: "Progetto ROSA (Equipaggio Femminile)",
      inclusione: "Inclusione Mare (Centro Serapide)",
    };

    try {
      const res = await fetch("/api/iscrizioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "corso",
          name: formData.nome,
          email: formData.email,
          phone: formData.telefono,
          itemTitle: courseLabels[formData.corso] || formData.corso,
          experience: formData.esperienza,
          message: formData.note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Si è verificato un errore durante l'invio della richiesta.");
      }

      setCourseSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Errore di connessione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetch("/api/corsi-calendar")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCalendarSessions(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      <main id="main-content">
        {/* Hero Corsi */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Scuola di Mare · Voga Tradizionale · Vela Latina</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl font-light text-[#0a1c2a] leading-[0.9] max-w-5xl">
            Corsi di Vela & <br />
            <span className="italic text-slate-700">Voga Tradizionale.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Imparare il mare significa viverlo sul legno. I nostri corsi non si
            fermano alla teoria: formiamo marinai in grado di leggere il vento,
            governare l&apos;antenna e vogare ritti sui paglioli guardando la rotta
            davanti a sé.
          </p>
        </div>
      </section>

      {/* I 4 Percorsi Formativi */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* 01 · Voga in Piedi */}
            <div className="group border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:border-[#0a1c2a] transition-all">
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200">
                  <Image
                    src="/images/museo/museo-3.jpeg"
                    alt="Voga Tradizionale Flegrea"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2a]/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#0a1c2a]/90 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-widest font-semibold">
                    01 · SCUOLA DI VOGA
                  </span>
                </div>
                <div className="p-8 sm:p-10">
                  <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                    Voga Tradizionale Flegrea
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                    L’antica tecnica montese della voga in piedi con lo sguardo
                    rivolto in direzione di marcia. Dedicata a ragazzi delle
                    scuole, giovani allievi marittimi e aspiranti al libretto di
                    navigazione.
                  </p>
                  <ul className="text-xs text-slate-700 font-mono space-y-2 mb-2">
                    <li>• Postura, equilibrio sui paglioli e coordinazione</li>
                    <li>• Uso dello stroppo di canapa e dello scalmo in legno</li>
                    <li>• Addestramento su San Michele Arcangelo e Quandel</li>
                  </ul>
                </div>
              </div>
              <div className="mx-8 sm:mx-10 pb-8 text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                Aperto a tutti · Livello base e avanzato
              </div>
            </div>

            {/* 02 · Vela Latina */}
            <div className="group border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:border-[#0a1c2a] transition-all">
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200">
                  <Image
                    src="/images/janara-regatta.jpeg"
                    alt="Corso di Vela Latina"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2a]/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#0a1c2a]/90 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-widest font-semibold">
                    02 · CONDUZIONE TRADIZIONALE
                  </span>
                </div>
                <div className="p-8 sm:p-10">
                  <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                    Corso di Vela Latina
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                    Apprendimento delle manovre classiche della vela triangolare:
                    armo dell’antenna di pino, tensionamento del carnao e del pizzo,
                    regolazione della scotta, virata in prua e in poppa.
                  </p>
                  <ul className="text-xs text-slate-700 font-mono space-y-2 mb-2">
                    <li>• Lettura delle brezze del canale di Procida e Ischia</li>
                    <li>• Conduzione al timone e bordeggio di sicurezza</li>
                    <li>• Preparazione per uscite costiere e d&apos;altura</li>
                  </ul>
                </div>
              </div>
              <div className="mx-8 sm:mx-10 pb-8 text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                A bordo di Janara e gozzi della flotta
              </div>
            </div>

            {/* 03 · Progetto ROSA */}
            <div className="group border border-[#0a1c2a] bg-white flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:border-[#b8860b] transition-all">
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200">
                  <Image
                    src="/images/janara-crew.jpeg"
                    alt="Progetto ROSA Equipaggio Femminile"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2a]/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#b8860b] text-white text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs">
                    03 · PROGETTO ROSA
                  </span>
                </div>
                <div className="p-8 sm:p-10">
                  <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                    Equipaggio Femminile 2027
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                    Un percorso formativo dedicato interamente alle donne: voga,
                    manovre a vela latina, sicurezza in navigazione e leadership.
                    Obiettivo: formare l’equipaggio per Les Voiles Latines di
                    Saint-Tropez nel 2027.
                  </p>
                  <ul className="text-xs text-slate-700 font-mono space-y-2 mb-2">
                    <li>• Allenamento atletico e tecnico continuativo</li>
                    <li>• Preparazione alle regate d&apos;altura internazionali</li>
                    <li>• Modello di parità e leadership nel mare</li>
                  </ul>
                </div>
              </div>
              <div className="mx-8 sm:mx-10 pb-8 text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                Selezioni e candidature aperte
              </div>
            </div>

            {/* 04 · Inclusione Mare */}
            <div className="group border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:border-[#0a1c2a] transition-all">
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200">
                  <Image
                    src="/images/museo/museo-6.jpeg"
                    alt="Inclusione Mare Centro Serapide"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2a]/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#0a1c2a]/90 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-widest font-semibold">
                    04 · SOLIDARIETÀ & BENESSERE
                  </span>
                </div>
                <div className="p-8 sm:p-10">
                  <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                    Inclusione Mare
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                    In collaborazione con il <strong>Centro Serapide</strong> di
                    Monte di Procida, avviciniamo alla voga e alla navigazione
                    bambini e ragazzi con bisogni speciali o disabilità.
                  </p>
                  <ul className="text-xs text-slate-700 font-mono space-y-2 mb-2">
                    <li>• Esperienze sensoriali e motorie a bordo</li>
                    <li>• Educatori dedicati e imbarcazione accessibile</li>
                    <li>• Il mare come terapia, relazione e libertà</li>
                  </ul>
                </div>
              </div>
              <div className="mx-8 sm:mx-10 pb-8 text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                A bordo di San Michele Arcangelo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendario Date & Posti Disponibili (Aggiornato da API) */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#0a1c2a] font-bold block mb-3">
                Disponibilità in Tempo Reale
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light">
                Calendario Sessioni & Posti 2026–2027.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-light max-w-md">
              Le uscite in mare e le lezioni pratiche si svolgono con gruppi a numero chiuso per garantire la massima sicurezza e padronanza dell&apos;armo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {calendarSessions.map((session) => {
              const defaultPhotos: Record<string, string> = {
                voga: "/images/museo/museo-3.jpeg",
                vela: "/images/janara-regatta.jpeg",
                rosa: "/images/janara-crew.jpeg",
                inclusione: "/images/museo/museo-6.jpeg",
              };
              const photo = session.imageUrl || defaultPhotos[session.courseKey] || "/images/janara-regatta.jpeg";

              return (
                <div
                  key={session.id}
                  className="bg-[#fbfaf6] border border-slate-200 flex flex-col justify-between hover:border-[#0a1c2a] transition-all overflow-hidden group shadow-2xs hover:shadow-md"
                >
                  <div>
                    {/* Header Image della sessione */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200">
                      <Image
                        src={photo}
                        alt={session.courseTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-bold border backdrop-blur-xs ${
                            session.status === "aperte"
                              ? "bg-emerald-900/85 text-emerald-100 border-emerald-500"
                              : session.status === "in-esaurimento"
                              ? "bg-amber-900/85 text-amber-100 border-amber-500"
                              : "bg-red-900/85 text-red-100 border-red-500"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="px-2 py-0.5 bg-[#0a1c2a]/85 text-white text-[9px] font-mono font-semibold backdrop-blur-xs">
                          {session.availableSeats} posti liberi
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-light mb-2">
                        {session.courseTitle}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-700 font-mono mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1b5b80]" />
                          <span className="font-bold text-[#0a1c2a]">Dal {session.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1b5b80]" />
                          <span>{session.schedule}</span>
                        </div>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-slate-600 font-light mb-4">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-700 line-clamp-1 max-w-[120px]">
                      {session.instructor}
                    </span>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          corso: session.courseKey,
                          note: `Candidatura per sessione: ${session.courseTitle} (inizio ${session.startDate})`,
                        }));
                        const formElement = document.getElementById("iscrizione-form");
                        if (formElement) {
                          formElement.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="px-3 py-1.5 bg-[#0a1c2a] text-white text-[10px] uppercase font-mono tracking-wider font-semibold hover:bg-[#b8860b] transition-colors cursor-pointer"
                    >
                      Iscriviti
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form di Iscrizione / Richiesta Info */}
      <section id="form-iscrizione" className="py-24 px-6 sm:px-12 lg:px-24 bg-[#fbfaf6] border-b border-slate-200">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center space-y-4 mb-10">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-700 font-semibold block">
              Prenota una Uscita di Prova
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light">
              Sali a bordo con noi.
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-light max-w-md mx-auto">
              Compila il modulo per concordare la tua prima uscita di prova al
              porticciolo di Monte di Procida. Ti contatterà direttamente il
              responsabile corsi.
            </p>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-slate-200 shadow-xs">
            {courseSubmitted ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#1b5b80] mx-auto" />
                <h4 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a]">
                  Richiesta Iscrizione Inviata
                </h4>
                <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed">
                  Grazie {formData.nome}. Ti ricontatteremo telefonicamente o via
                  email per fissare la data della tua prima lezione o uscita in
                  mare.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="corso-nome"
                      className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                    >
                      Nome e Cognome
                    </label>
                    <input
                      id="corso-nome"
                      name="nome"
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="corso-telefono"
                      className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                    >
                      Telefono
                    </label>
                    <input
                      id="corso-telefono"
                      name="telefono"
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      placeholder="+39 333 1234567"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="corso-email"
                    className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="corso-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="latuamail@esempio.it"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="corso-interesse"
                      className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                    >
                      Corso d&apos;Interesse
                    </label>
                    <select
                      id="corso-interesse"
                      name="corso"
                      value={formData.corso}
                      onChange={(e) =>
                        setFormData({ ...formData, corso: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    >
                      <option value="voga">Voga Tradizionale Flegrea</option>
                      <option value="vela">Corso di Vela Latina</option>
                      <option value="rosa">Progetto ROSA (Equipaggio Femminile)</option>
                      <option value="inclusione">Inclusione Mare (Centro Serapide)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="corso-esperienza"
                      className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                    >
                      Esperienza Marinaresca
                    </label>
                    <select
                      id="corso-esperienza"
                      name="esperienza"
                      value={formData.esperienza}
                      onChange={(e) =>
                        setFormData({ ...formData, esperienza: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    >
                      <option value="principiante">Principiante (Nessuna)</option>
                      <option value="intermedio">Qualche esperienza a vela/voga</option>
                      <option value="esperto">Esperto / Marittimo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="corso-note"
                    className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1"
                  >
                    Messaggio o Disponibilità
                  </label>
                  <textarea
                    id="corso-note"
                    name="note"
                    rows={3}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Dicci giorni o orari in cui sei più disponibile..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Invio in corso..." : "Invia Domanda di Partecipazione"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
