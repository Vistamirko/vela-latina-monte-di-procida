"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FLEET_DATA, Boat } from "@/data/associationData";
import {
  Anchor,
  Compass,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function AssociazionePage() {
  const [selectedBoatIndex, setSelectedBoatIndex] = useState(0);
  const [membershipSubmitted, setMembershipSubmitted] = useState(false);
  const activeBoat: Boat = FLEET_DATA[selectedBoatIndex];

  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      {/* Hero Sezione Associazione */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Anchor className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Associazione di Promozione Sociale · Fondata nel 2008</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl font-light text-[#0a1c2a] leading-[0.9] max-w-5xl">
            L’Associazione & <br />
            <span className="italic text-slate-700">la Memoria Flegrea.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Un presidio culturale permanente per la marineria flegrea. Custodiamo
            e rinnoviamo l’arte del gozzo napoletano a vela latina e a remi,
            restituendo all’acqua forme navali tradizionali e trasmettendo il
            sapere artigianale dei maestri d’ascia.
          </p>
        </div>
      </section>

      {/* Il Riconoscimento Regionale & Numeri Chiave */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400 block">
              D.D. n. 239 del 7 Luglio 2020
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light leading-tight">
              Patrimonio Culturale Immateriale della Campania.
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-light leading-relaxed">
              Grazie all’azione continua dell’Associazione, la Regione Campania ha
              riconosciuto il sapere e le abilità della marineria flegrea inerenti
              la costruzione, la manutenzione e l’utilizzo del gozzo tradizionale
              come Patrimonio Culturale Immateriale.
            </p>
            <p className="text-sm sm:text-base text-slate-700 font-light leading-relaxed">
              La nostra comunità riunisce appassionati montesi e marinai
              provenienti da Spagna, Francia, Tunisia, Croazia e Madagascar. La
              sede è radicata al porticciolo di Monte di Procida sotto la
              presidenza di <strong>Antonio Pugliese</strong>, tecnico
              costruttore navale.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-6 bg-[#fbfaf6] p-8 sm:p-10 border border-slate-200">
            <div>
              <span className="font-['Cormorant_Garamond'] text-5xl text-[#0a1c2a] block">
                2008
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Anno Fondazione
              </span>
            </div>
            <div>
              <span className="font-['Cormorant_Garamond'] text-5xl text-[#0a1c2a] block">
                ≈150
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Soci Attivi
              </span>
            </div>
            <div>
              <span className="font-['Cormorant_Garamond'] text-5xl text-[#0a1c2a] block">
                5
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Scafi nella Flotta
              </span>
            </div>
            <div>
              <span className="font-['Cormorant_Garamond'] text-5xl text-[#0a1c2a] block">
                25
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Volontari & Tecnici
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* La Flotta Storica Completa */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-500 block mb-2">
                Restauro & Navigazione
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl font-light text-[#0a1c2a]">
                La Flotta Storica.
              </h2>
            </div>

            {/* Selettore Barca */}
            <div className="flex items-center gap-2">
              {FLEET_DATA.map((boat, idx) => (
                <button
                  key={boat.id}
                  onClick={() => setSelectedBoatIndex(idx)}
                  className={`px-3 py-2 text-[10px] font-mono tracking-widest border transition-all cursor-pointer ${
                    idx === selectedBoatIndex
                      ? "border-[#0a1c2a] bg-[#0a1c2a] text-white font-bold"
                      : "border-slate-300 text-slate-600 hover:border-slate-800 bg-white"
                  }`}
                >
                  0{idx + 1} · {boat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Scheda Imbarcazione Selezionata */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-white border border-slate-200 p-6 sm:p-10 lg:p-14 shadow-xs">
            <div className="lg:col-span-7 relative h-72 sm:h-96 md:h-[480px] w-full rounded-xs overflow-hidden border border-slate-200">
              <Image
                src={activeBoat.image}
                alt={activeBoat.name}
                fill
                className="object-cover"
              />
              {activeBoat.badge && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 border border-slate-300 text-[#0a1c2a] text-[10px] uppercase tracking-[0.2em] font-mono shadow-xs">
                  <Award className="w-3 h-3 text-[#b8860b]" />
                  <span>{activeBoat.badge}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 block font-mono mb-2">
                  {activeBoat.category} · {activeBoat.length}
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#0a1c2a] font-light leading-none">
                  {activeBoat.name}
                </h3>
                <p className="font-['Cormorant_Garamond'] text-xl italic text-slate-700 mt-2">
                  {activeBoat.subtitle}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-light leading-relaxed">
                <p>{activeBoat.description}</p>
                <div className="p-4 bg-[#fbfaf6] border-l-2 border-[#0a1c2a] text-xs italic text-slate-800">
                  {activeBoat.curiosity}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider text-slate-600 font-mono">
                <div>
                  <span className="text-slate-400 block">Cantiere</span>
                  <span className="text-[#0a1c2a] font-sans text-xs">
                    {activeBoat.shipyard}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Armamento</span>
                  <span className="text-[#0a1c2a] font-sans text-xs">
                    {activeBoat.rig}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setSelectedBoatIndex(
                        (prev) => (prev - 1 + FLEET_DATA.length) % FLEET_DATA.length
                      )
                    }
                    className="p-2 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedBoatIndex((prev) => (prev + 1) % FLEET_DATA.length)
                    }
                    className="p-2 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] tracking-widest text-slate-500 font-mono">
                  {selectedBoatIndex + 1} / {FLEET_DATA.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diventa Socio / Modulo Adesione */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto w-full text-center space-y-6">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-500 block">
            Adesione
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl font-light text-[#0a1c2a]">
            Entra a far parte della comunità.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light max-w-xl mx-auto leading-relaxed">
            Come socio praticante (voga e vela) o socio sostenitore, contribuisci
            direttamente alla salvaguardia del patrimonio marinaro flegreo.
          </p>

          <div className="p-8 bg-[#fbfaf6] border border-slate-200 text-left mt-8">
            {membershipSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#1b5b80] mx-auto" />
                <h4 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a]">
                  Richiesta di Tesseramento Inviata
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  La segreteria dell'Associazione ti contatterà per completare la
                  domanda d'iscrizione e accoglierti al porticciolo.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMembershipSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">
                      Nome e Cognome
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mario Rossi"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="mario@esempio.it"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">
                    Tipologia di Socio
                  </label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none">
                    <option>Socio Praticante (Voga & Vela Latina)</option>
                    <option>Socio Sostenitore Culturale</option>
                    <option>Volontario Cantiere & Restauro</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all cursor-pointer"
                >
                  Richiedi Tesseramento
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
