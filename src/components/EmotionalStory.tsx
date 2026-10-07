"use client";

import { useState } from "react";
import Image from "next/image";
import { FLEET_DATA, Boat } from "@/data/associationData";
import {
  Compass,
  Wind,
  Anchor,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Award,
  ArrowUpRight,
  Shield,
  Layers,
} from "lucide-react";

export default function EmotionalStory() {
  const [selectedBoatIndex, setSelectedBoatIndex] = useState(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    nome: "",
    email: "",
    ruolo: "socio",
    messaggio: "",
  });

  const activeBoat: Boat = FLEET_DATA[selectedBoatIndex];

  const handleNextBoat = () => {
    setSelectedBoatIndex((prev) => (prev + 1) % FLEET_DATA.length);
  };

  const handlePrevBoat = () => {
    setSelectedBoatIndex(
      (prev) => (prev - 1 + FLEET_DATA.length) % FLEET_DATA.length
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="relative bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      {/* ============================================================== */}
      {/* CAPITOLO 01 — LA ROTTA (HERO PULITO, BIANCO, PURA VELA) */}
      {/* ============================================================== */}
      <section
        id="rotta"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 sm:pt-36 pb-12 sm:pb-16 border-b border-slate-200"
      >
        {/* Metadati di prua & Coordinate Nautiche */}
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-mono text-slate-500">
          <div className="flex items-center gap-2.5">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>40° 47′ 42″ N · 14° 03′ 05″ E</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1b5b80]" />
            <span>Canale di Procida · Vento da Maestro</span>
          </div>
          <span className="hidden md:inline text-slate-400">
            Capitolo 01 / 06
          </span>
        </div>

        {/* Titolo Monumentale con Grazie & Payoff */}
        <div className="max-w-7xl mx-auto w-full my-auto py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white text-[10px] sm:text-xs tracking-[0.3em] text-[#0a1c2a] uppercase mb-8 font-medium">
            <Wind className="w-3.5 h-3.5 text-[#1b5b80]" />
            <span>Patrimonio Culturale Immateriale della Campania</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-light leading-[0.88] text-[#0a1c2a] tracking-tight">
            Vela Latina <br />
            <span className="italic font-normal text-slate-700">
              Monte di Procida
            </span>
          </h1>

          {/* Il Payoff Richiesto con Eleganza Editoriale */}
          <div className="mt-8 sm:mt-12 max-w-3xl border-l-2 border-[#0a1c2a] pl-6 sm:pl-8">
            <p className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl italic font-light text-[#0a1c2a] leading-tight">
              “Un punto cospicuo sul Mediterraneo.”
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl">
              La scogliera tufacea che domina il canale verso Procida e Ischia.
              Dove le tele bianche catturano il vento tirrenico e i maestri d’ascia
              tramandano l’anima della marineria flegrea.
            </p>
          </div>
        </div>

        {/* Grande Immagine Fotografica Sotto Vela (Full Regatta) */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative w-full h-80 sm:h-[460px] md:h-[540px] rounded-xs overflow-hidden border border-slate-200 shadow-sm group">
            <Image
              src="/images/janara-regatta.jpeg"
              alt="Gozzo a vela latina in regata a Monte di Procida"
              fill
              priority
              className="object-cover object-[center_38%] transition-transform duration-1000 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white pointer-events-none">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-80 block">
                  Regata di Classe
                </span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl italic">
                  Janara in bordeggio con le isole flegree
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest hidden sm:inline bg-black/50 backdrop-blur-sm px-3 py-1 border border-white/20">
                Numero Velico 098
              </span>
            </div>
          </div>
        </div>

        {/* Barra di Registro Nautico in Fondo */}
        <div className="max-w-7xl mx-auto w-full pt-8 mt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-mono">
          <div>Fondata nel 2008 · Circa 150 Soci · 5 Scafi Restaurati</div>
          <a
            href="#vento"
            className="flex items-center gap-2 text-[#0a1c2a] hover:text-[#b8860b] transition-colors font-sans font-semibold"
          >
            <span>L’Armo e il Vento</span>
            <span className="text-base">↓</span>
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 02 — L'ARMO & LA VELA TRADIZIONALE (PIÙ VELA) */}
      {/* ============================================================== */}
      <section
        id="vento"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-[#fbfaf6] border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Wind className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Capitolo 02 · Anatomia della Vela Tradizionale</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-[#0a1c2a] max-w-5xl">
            L’antenna arcuata. <br />
            <span className="italic text-slate-700">
              La geometria pura del vento.
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 mt-16 items-start">
            {/* Testo narrativo poetico */}
            <div className="lg:col-span-5 space-y-6 text-base sm:text-lg text-slate-700 font-light leading-relaxed">
              <p>
                La vela latina è la madre di tutte le manovre nel Mediterraneo.
                Un triangolo di tela che si piega al maestrale senza l’ausilio di
                armi meccanici: solo legno, cime, forza dell’equipaggio e
                sensibilità alle correnti.
              </p>
              <p className="text-sm text-slate-500">
                Sul gozzo flegreo non esistono verricelli moderni. Ogni centimetro
                di vela si guadagna a braccia sul carnao e sul pizzo, sentendo il
                legno flettersi e la prora fendere il canale tra Monte di Procida
                e Vivara.
              </p>
            </div>

            {/* Dettagli tecnici dell'armo marinaro (PURA VELA) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-slate-200 shadow-2xs">
                <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-2">
                  01 · L'ANTENNA
                </span>
                <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                  Il Pennone di Pino
                </h4>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  Lunga più del doppio dello scafo, unisce due legni rastremati
                  (carnaia e penna) che conferiscono flessibilità alla curvatura
                  della vela.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 shadow-2xs">
                <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-2">
                  02 · IL PIZZO
                </span>
                <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                  Angolo di Scotta
                </h4>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  Il punto estremo dove la tensione della scotta governa
                  l’angolo d’incidenza dell’aria per stringere il vento fino a 40
                  gradi.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 shadow-2xs">
                <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-2">
                  03 · IL BORDEGGIO
                </span>
                <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                  Virata & Carica
                </h4>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  La manovra d'altri tempi che richiede la perfetta coordinazione
                  dei marinai per passare la tela davanti all’albero e prendere il
                  nuovo bordo.
                </p>
              </div>
            </div>
          </div>

          {/* Dettaglio a fondo capitolo */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div>Livrea originale a strisce bianche e nere · Nave Scuola Amerigo Vespucci</div>
            <a
              href="#flotta"
              className="text-[10px] tracking-widest uppercase text-[#0a1c2a] hover:text-[#b8860b] font-bold"
            >
              Le Cinque Imbarcazioni Storiche ↓
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 03 — LA FLOTTA SOTTO VELA (SHOWCASE EDITORIALE PULITO) */}
      {/* ============================================================== */}
      <section
        id="flotta"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Testata Capitolo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-3">
                <Anchor className="w-3.5 h-3.5 text-[#0a1c2a]" />
                <span>Capitolo 03 · Gli Scafi Restaurati</span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-none">
                Cinque legni. <br />
                <span className="italic text-slate-700">
                  Cinque storie all’orizzonte.
                </span>
              </h2>
            </div>

            {/* Selettore Barca Minimo ed Elegante */}
            <div className="flex items-center gap-2">
              {FLEET_DATA.map((boat, idx) => (
                <button
                  key={boat.id}
                  onClick={() => setSelectedBoatIndex(idx)}
                  className={`px-3 py-2 text-[10px] font-mono tracking-widest border transition-all cursor-pointer ${
                    idx === selectedBoatIndex
                      ? "border-[#0a1c2a] bg-[#0a1c2a] text-white font-bold"
                      : "border-slate-300 text-slate-600 hover:border-slate-800 hover:text-[#0a1c2a] bg-white"
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Scheda Imbarcazione Bianca & Pulita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#fbfaf6] border border-slate-200 p-6 sm:p-10 lg:p-14 shadow-xs">
            {/* Fotografia Nautica Grande */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 md:h-[480px] w-full rounded-xs overflow-hidden border border-slate-200 group">
              <Image
                src={activeBoat.image}
                alt={activeBoat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {activeBoat.badge && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 border border-slate-300 text-[#0a1c2a] text-[10px] uppercase tracking-[0.2em] font-mono shadow-xs">
                  <Award className="w-3 h-3 text-[#b8860b]" />
                  <span>{activeBoat.badge}</span>
                </div>
              )}
            </div>

            {/* Testi Narrativi & Specifiche della Barca */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 block font-mono mb-2">
                  {activeBoat.category} · {activeBoat.length}
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl text-[#0a1c2a] font-light leading-none">
                  {activeBoat.name}
                </h3>
                <p className="font-['Cormorant_Garamond'] text-xl italic text-slate-700 mt-2">
                  {activeBoat.subtitle}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-light leading-relaxed">
                <p>{activeBoat.description}</p>
                <div className="p-4 bg-white border-l-2 border-[#0a1c2a] text-xs italic text-slate-800">
                  {activeBoat.curiosity}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider text-slate-600 font-mono">
                <div>
                  <span className="text-slate-400 block">Cantiere d'Origine</span>
                  <span className="text-[#0a1c2a] font-sans text-xs">
                    {activeBoat.shipyard}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Piano Velico</span>
                  <span className="text-[#0a1c2a] font-sans text-xs">
                    {activeBoat.rig}
                  </span>
                </div>
              </div>

              {/* Bottoni Navigazione */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevBoat}
                    className="p-2 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] transition-colors cursor-pointer bg-white"
                    aria-label="Imbarcazione precedente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextBoat}
                    className="p-2 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] transition-colors cursor-pointer bg-white"
                    aria-label="Imbarcazione successiva"
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

      {/* ============================================================== */}
      {/* CAPITOLO 04 — IL GESTO & LA VOGA IN PIEDI */}
      {/* ============================================================== */}
      <section
        id="gesto"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-[#fbfaf6] border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Capitolo 04 · Il Gesto e la Tradizione Marinara</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-[#0a1c2a] max-w-5xl">
            Vogare in piedi. <br />
            <span className="italic text-slate-700">
              Con lo sguardo puntato sulla rotta.
            </span>
          </h2>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light max-w-2xl leading-relaxed">
            I marinai dei Campi Flegrei non vogano dando la schiena al mare. Si
            rema ritti sui paglioli, guardando dritto l’onda e le scogliere,
            trasmettendo con le gambe la spinta all’intero scafo in legno.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16">
            <div className="p-6 sm:p-8 bg-white border border-slate-200">
              <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-3">
                01 · LA ROTTA
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                Conduzione Visiva
              </h4>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Leggere i salti di vento sulla superficie del mare prima che
                tocchino la tela. L’intuito che precede la manovra.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-white border border-slate-200">
              <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-3">
                02 · IL REMO
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                Lo Scalmo di Legno
              </h4>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Remi lunghi e pesanti equilibrati sullo stroppo di canapa. Una
                cadenza corale che trasforma quattro vogatori in un sol motore.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-white border border-slate-200">
              <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-3">
                03 · IL CANTIERE
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                Maestri d’Ascia
              </h4>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Rovere per la chiglia, pino per il fasciame, stoppa naturale e
                pece cotta sul fuoco per sigillare ogni fessura.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-white border border-slate-200">
              <span className="font-mono text-[10px] text-slate-400 tracking-widest block mb-3">
                04 · SOLIDARIETÀ
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-[#0a1c2a] uppercase mb-2">
                Centro Serapide
              </h4>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Il mare aperto a tutti: laboratori di voga e uscite per ragazzi
                con bisogni speciali sul San Michele Arcangelo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 05 — ORIZZONTI & CANTIERI 2027 (VERSO IL FUTURO) */}
      {/* ============================================================== */}
      <section
        id="orizzonti"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Capitolo 05 · I Grandi Orizzonti 2027</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-[#0a1c2a] max-w-5xl">
            Dal porticciolo montese <br />
            <span className="italic text-slate-700">ai campi di regata mondiali.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mt-16">
            {/* Progetto ROSA */}
            <div className="p-8 sm:p-10 border border-[#0a1c2a] bg-[#fbfaf6] relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                  Saint-Tropez 2027
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 bg-[#0a1c2a] text-white">
                  Equipaggio Femminile
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                Progetto ROSA
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                Costruzione e addestramento del primo equipaggio stabile interamente
                femminile per rappresentare la vela latina dei Campi Flegrei a Les
                Voiles Latines di Saint-Tropez nel 2027.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-[#0a1c2a] font-semibold flex items-center gap-2">
                <span>Voga, Conduzione, Sicurezza</span>
                <span>→</span>
              </div>
            </div>

            {/* America's Cup Napoli */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-white hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                  Golfo di Napoli
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                  Evento Mondiale
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                Janara all’America’s Cup
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                Partecipazione alla cerimonia inaugurale con l'ammiraglia Janara,
                esibendo l'armo a vela latina tradizionale di fianco alle barche
                volanti a foil del trofeo più antico al mondo.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Ammiraglia Janara · Napoli
              </div>
            </div>

            {/* Barcolana Trieste */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-white hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                  Golfo di Trieste
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                  La Lancia Storica
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                Quandel alla Barcolana
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                La lancia storica ex Amerigo Vespucci (1968) armata a filucone
                partenopeo schierata sulla linea di partenza insieme a migliaia di
                vele in Adriatico.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Lancia Storica Ludovico Quandel
              </div>
            </div>

            {/* Ricerca Scientifica & Breccia Museo */}
            <div className="p-8 sm:p-10 border border-slate-200 bg-white hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                  Università & Territorio
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                  Federico II & Suor Orsola
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-3">
                Quandel Lab & Breccia Museo
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed mb-6">
                Sperimentazioni idrodinamiche in mare e percorsi didattici e
                vulcanologici ammirabili dal mare lungo le imponenti falesie della
                Breccia Museo.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-mono">
                Archeologia Navale & Geologia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 06 — SALI A BORDO AL PORTICCIOLO */}
      {/* ============================================================== */}
      <section
        id="porto"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-[#fbfaf6]"
      >
        <div className="max-w-7xl mx-auto w-full my-auto">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Anchor className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Capitolo 06 · Il Porticciolo e la Comunità</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-[#0a1c2a] max-w-5xl">
            Il mare ti aspetta. <br />
            <span className="italic text-slate-700">Prendi il tuo remo.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 items-start">
            <div className="lg:col-span-6 space-y-6 text-sm sm:text-base text-slate-700 font-light leading-relaxed">
              <p>
                Non è richiesta esperienza precedente. L’Associazione è aperta a
                tutti coloro che vogliono imparare l'arte della vela latina,
                partecipare alle uscite di voga all’alba, dare una mano nei
                restauri del legno o sostenere i nostri progetti.
              </p>

              <div className="p-6 bg-white border border-slate-200 space-y-3 font-mono text-xs">
                <div className="text-[#0a1c2a] font-semibold text-sm font-sans">
                  Sede dell’Associazione:
                </div>
                <div className="text-slate-600">
                  Via Guglielmo Marconi snc, Porticciolo di Monte di Procida (NA)
                </div>
                <div className="text-slate-600">
                  Presidente:{" "}
                  <span className="text-[#0a1c2a] font-semibold">
                    Antonio Pugliese
                  </span>{" "}
                  (Tecnico costruttore navale)
                </div>
                <div className="text-slate-600">
                  Telefono:{" "}
                  <a
                    href="tel:+393387633350"
                    className="text-[#0a1c2a] underline font-medium"
                  >
                    +39 338 763 3350
                  </a>
                </div>
                <div className="text-slate-600">
                  Email:{" "}
                  <a
                    href="mailto:velalatinamontediprocida@gmail.com"
                    className="text-[#0a1c2a] underline font-medium"
                  >
                    velalatinamontediprocida@gmail.com
                  </a>
                </div>
                <div className="text-slate-400 text-[10px] pt-2 border-t border-slate-200">
                  APS iscritta al RUNTS · Riconoscimento Patrimonio Culturale
                  Immateriale
                </div>
              </div>
            </div>

            {/* Modulo di contatto pulito a sfondo bianco */}
            <div className="lg:col-span-6 p-8 bg-white border border-slate-200 shadow-xs">
              {contactSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#1b5b80] mx-auto animate-bounce" />
                  <h4 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a]">
                    Richiesta Ricevuta
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Grazie. Ti contatteremo direttamente per darti il benvenuto al
                    porticciolo e organizzare la tua prima uscita in mare.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="text-[10px] uppercase tracking-widest text-[#0a1c2a] underline pt-4 cursor-pointer font-mono"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#0a1c2a] font-semibold block mb-2">
                    Scrivi all'Associazione
                  </span>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-mono">
                      Nome e Cognome
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.nome}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, nome: e.target.value })
                      }
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0a1c2a] text-xs text-[#0a1c2a] placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-mono">
                      Indirizzo Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      placeholder="latuamail@esempio.it"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0a1c2a] text-xs text-[#0a1c2a] placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-mono">
                      Cosa desideri fare?
                    </label>
                    <select
                      value={contactForm.ruolo}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, ruolo: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0a1c2a] text-xs text-[#0a1c2a] focus:outline-none"
                    >
                      <option value="socio">
                        Diventare Socio Praticante (Voga & Vela)
                      </option>
                      <option value="rosa">
                        Candidatura Progetto ROSA (Equipaggio Femminile)
                      </option>
                      <option value="volontario">
                        Volontariato nel Cantiere & Restauro Scafi
                      </option>
                      <option value="partner">
                        Sostegno Istituzionale / Sponsorizzazione
                      </option>
                      <option value="info">Altre Informazioni</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-mono">
                      Messaggio
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.messaggio}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          messaggio: e.target.value,
                        })
                      }
                      placeholder="Raccontaci la tua passione o poni una domanda..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0a1c2a] text-xs text-[#0a1c2a] placeholder-slate-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>Invia Richiesta</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Editoriale Pulito */}
        <div className="max-w-7xl mx-auto w-full pt-16 mt-16 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] tracking-widest uppercase text-slate-500 font-mono">
          <div>
            © 2008–{new Date().getFullYear()} Associazione Vela Latina Monte di
            Procida (APS)
          </div>
          <div className="font-serif italic text-sm text-[#0a1c2a] normal-case tracking-normal">
            “Un punto cospicuo sul Mediterraneo.”
          </div>
          <div>40°47′N · 14°03′E · Campi Flegrei</div>
        </div>
      </section>
    </div>
  );
}
