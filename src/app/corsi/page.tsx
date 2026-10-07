"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GraduationCap, Wind, Compass, Users, CheckCircle2, Send, ArrowRight, Calendar, Clock } from "lucide-react";
import { CourseSession } from "@/lib/db/types";

export default function CorsiPage() {
  const [calendarSessions, setCalendarSessions] = useState<CourseSession[]>([]);
  const [courseSubmitted, setCourseSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefono: "",
    corso: "voga",
    esperienza: "principiante",
    note: "",
  });

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
            governare l'antenna e vogare ritti sui paglioli guardando la rotta
            davanti a sé.
          </p>
        </div>
      </section>

      {/* I 4 Percorsi Formativi */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* 01 · Voga in Piedi */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#0a1c2a] font-semibold block mb-2">
                  01 · SCUOLA DI VOGA
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                  Voga Tradizionale Flegrea
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                  L’antica tecnica montese della voga in piedi con lo sguardo
                  rivolto in direzione di marcia. Dedicata a ragazzi delle
                  scuole, giovani allievi marittimi e aspiranti al libretto di
                  navigazione.
                </p>
                <ul className="text-xs text-slate-700 font-mono space-y-2 mb-6">
                  <li>• Postura, equilibrio sui paglioli e coordinazione</li>
                  <li>• Uso dello stroppo di canapa e dello scalmo in legno</li>
                  <li>• Addestramento su San Michele Arcangelo e Quandel</li>
                </ul>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                Aperto a tutti · Livello base e avanzato
              </div>
            </div>

            {/* 02 · Vela Latina */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#0a1c2a] font-semibold block mb-2">
                  02 · CONDUZIONE TRADIZIONALE
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                  Corso di Vela Latina
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                  Apprendimento delle manovre classiche della vela triangolare:
                  armo dell’antenna di pino, tensionamento del carnao e del pizzo,
                  regolazione della scotta, virata in prua e in poppa.
                </p>
                <ul className="text-xs text-slate-700 font-mono space-y-2 mb-6">
                  <li>• Lettura delle brezze del canale di Procida e Ischia</li>
                  <li>• Conduzione al timone e bordeggio di sicurezza</li>
                  <li>• Preparazione per uscite costiere e d'altura</li>
                </ul>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                A bordo di Janara e gozzi della flotta
              </div>
            </div>

            {/* 03 · Progetto ROSA */}
            <div className="p-8 sm:p-10 border border-[#0a1c2a] bg-white flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#0a1c2a] font-bold block mb-2">
                  03 · PROGETTO ROSA
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                  Equipaggio Femminile 2027
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                  Un percorso formativo dedicato interamente alle donne: voga,
                  manovre a vela latina, sicurezza in navigazione e leadership.
                  Obiettivo: formare l’equipaggio per Les Voiles Latines di
                  Saint-Tropez nel 2027.
                </p>
                <ul className="text-xs text-slate-700 font-mono space-y-2 mb-6">
                  <li>• Allenamento atletico e tecnico continuativo</li>
                  <li>• Preparazione alle regate d'altura internazionali</li>
                  <li>• Modello di parità e leadership nel mare</li>
                </ul>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
                Selezioni e candidature aperte
              </div>
            </div>

            {/* 04 · Inclusione Mare */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-[#fbfaf6] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#0a1c2a] font-semibold block mb-2">
                  04 · SOLIDARIETÀ & BENESSERE
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                  Inclusione Mare
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                  In collaborazione con il <strong>Centro Serapide</strong> di
                  Monte di Procida, avviciniamo alla voga e alla navigazione
                  bambini e ragazzi con bisogni speciali o disabilità.
                </p>
                <ul className="text-xs text-slate-700 font-mono space-y-2 mb-6">
                  <li>• Esperienze sensoriali e motorie a bordo</li>
                  <li>• Educatori dedicati e imbarcazione accessibile</li>
                  <li>• Il mare come terapia, relazione e libertà</li>
                </ul>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold pt-4 border-t border-slate-300">
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
              Le uscite in mare e le lezioni pratiche si svolgono con gruppi a numero chiuso per garantire la massima sicurezza e padronanza dell'armo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {calendarSessions.map((session) => (
              <div
                key={session.id}
                className="p-6 bg-[#fbfaf6] border border-slate-200 flex flex-col justify-between hover:border-[#0a1c2a] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-bold border ${
                        session.status === "aperte"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : session.status === "in-esaurimento"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-700 font-bold">
                      {session.availableSeats} posti liberi
                    </span>
                  </div>

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

                <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-700">
                    {session.instructor}
                  </span>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        corso: session.courseKey,
                        note: `Richiesta per sessione: ${session.courseTitle} (${session.startDate})`,
                      }));
                      const formEl = document.getElementById("form-iscrizione");
                      if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold hover:text-[#b8860b] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Seleziona</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCourseSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                      Nome e Cognome
                    </label>
                    <input
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
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                      Telefono
                    </label>
                    <input
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
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                    Email
                  </label>
                  <input
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
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                      Corso d'Interesse
                    </label>
                    <select
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
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                      Esperienza Marinaresca
                    </label>
                    <select
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
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-semibold mb-1">
                    Messaggio o Disponibilità
                  </label>
                  <textarea
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
                  className="w-full py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all cursor-pointer shadow-xs"
                >
                  Invia Domanda di Partecipazione
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
