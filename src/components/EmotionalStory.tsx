"use client";

import { useState } from "react";
import Image from "next/image";
import { FLEET_DATA, Boat } from "@/data/associationData";
import {
  Compass,
  ArrowRight,
  Anchor,
  Wind,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
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
    <div className="relative text-[#f4efe6] overflow-hidden">
      {/* ============================================================== */}
      {/* CAPITOLO 01 — L'ORIGINE & IL PUNTO COSPICUO */}
      {/* ============================================================== */}
      <section
        id="origine"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-24 sm:py-32"
      >
        {/* Immagine di Sfondo con Atmosfera Notturna / Marina Profonda */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/janara-crew.jpeg"
            alt="Janara vela latina Monte di Procida"
            fill
            priority
            className="object-cover object-[center_30%] opacity-35 filter brightness-90 contrast-125 scale-100 transition-transform duration-[10000ms] ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061118] via-[#061118]/70 to-[#061118]/80" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#061118]/40 to-[#061118]" />
        </div>

        {/* Tagline di Navigazione */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#c99f5a]/20 pb-4">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#e0be82] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#c99f5a]" />
            <span>40° 47′ 42″ N · 14° 03′ 05″ E · MONTE DI PROCIDA</span>
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 hidden sm:inline">
            CAPITOLO 01 / 06
          </span>
        </div>

        {/* Titolo Gigante con Grazie & Payoff Emozionale */}
        <div className="relative z-10 max-w-6xl mx-auto w-full my-auto py-12">
          <span className="font-['Cinzel'] text-xs sm:text-sm tracking-[0.4em] text-[#e0be82]/80 uppercase block mb-4">
            Associazione Culturale Marinara
          </span>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-light leading-[0.88] text-white tracking-tight">
            Vela Latina <br />
            <span className="italic font-normal text-[#e0be82]">
              Monte di Procida
            </span>
          </h1>

          {/* Payoff */}
          <div className="mt-8 sm:mt-12 max-w-3xl border-l-2 border-[#c99f5a] pl-6 sm:pl-8">
            <p className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl italic font-light text-white leading-tight">
              “Un punto cospicuo sul Mediterraneo.”
            </p>
            <p className="mt-4 text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-xl">
              La rocca di tufo che apre le porte al canale di Procida e a Ischia.
              Qui il mare non è solo paesaggio: è il respiro vivo della marineria
              flegrea.
            </p>
          </div>
        </div>

        {/* Fondo capitolo con scorrimento */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex items-end justify-between border-t border-white/10 pt-6">
          <div className="text-[10px] tracking-[0.25em] uppercase text-white/40">
            Fondata nel 2008 · Circa 150 Soci · 5 Imbarcazioni Storiche
          </div>
          <a
            href="#patrimonio"
            className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-[#e0be82] hover:text-white transition-colors"
          >
            <span>Inizia il viaggio</span>
            <span className="animate-bounce">↓</span>
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 02 — LA MEMORIA & IL PATRIMONIO IMMATERIALE */}
      {/* ============================================================== */}
      <section
        id="patrimonio"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-28 sm:py-36 bg-[#040d13]"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] mb-6">
            <Anchor className="w-3.5 h-3.5" />
            <span>Capitolo 02 · Memoria e Riconoscimento</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light leading-[0.95] text-white max-w-5xl">
            Non conserviamo oggetti. <br />
            <span className="italic text-[#e0be82]">
              Rimettiamo in rotta storie.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-16 mt-12 sm:mt-16 items-start">
            <div className="md:col-span-7 space-y-6 text-base sm:text-lg text-white/80 font-light leading-relaxed">
              <p>
                Il sapere della marineria flegrea inerente alla costruzione,
                manutenzione e conduzione del gozzo napoletano-flegreo a remi e a
                vela latina è riconosciuto dalla{" "}
                <span className="text-[#e0be82] font-normal">
                  Regione Campania (D.D. n. 239/2020) come Patrimonio Culturale
                  Immateriale
                </span>
                .
              </p>
              <p className="text-white/60 text-sm sm:text-base">
                Non si tratta di musealizzazione statica. Per noi custodire
                significa stringere la scotta, piegare il fasciame col vapore,
                issare l’antenna di pino e insegnare ai ragazzi a leggere il
                vento.
              </p>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 gap-6 border-l border-[#c99f5a]/25 pl-6 sm:pl-10">
              <div>
                <span className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#e0be82] block">
                  D.D. 239
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  Patrimonio Immateriale
                </span>
              </div>
              <div>
                <span className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-white block">
                  1° Posto
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  Saint-Tropez 2024
                </span>
              </div>
              <div>
                <span className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-white block">
                  150
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  Soci Attivi
                </span>
              </div>
              <div>
                <span className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#e0be82] block">
                  25
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  Maestri & Volontari
                </span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs italic text-white/50 font-serif">
              “Ogni barca restaurata è un ponte tra passato e futuro.”
            </span>
            <a
              href="#flotta"
              className="text-[10px] tracking-[0.25em] uppercase text-[#e0be82] hover:text-white"
            >
              Scopri gli Scafi ↓
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 03 — LA FLOTTA STORICA (SHOWCASE EMOZIONALE) */}
      {/* ============================================================== */}
      <section
        id="flotta"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-24 sm:py-32 bg-[#061118]"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Header capitolo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] mb-3">
                <Wind className="w-3.5 h-3.5" />
                <span>Capitolo 03 · Gli Scafi della Flotta</span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-white leading-none">
                Cinque anime. <br />
                <span className="italic text-[#e0be82]">
                  Un solo mare da navigare.
                </span>
              </h2>
            </div>

            {/* Navigatore numerico barche */}
            <div className="flex items-center gap-2">
              {FLEET_DATA.map((boat, idx) => (
                <button
                  key={boat.id}
                  onClick={() => setSelectedBoatIndex(idx)}
                  className={`px-3 py-2 text-[10px] font-mono tracking-widest border transition-all ${
                    idx === selectedBoatIndex
                      ? "border-[#c99f5a] bg-[#c99f5a] text-[#061118] font-bold"
                      : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Scheda Imbarcazione Grande & Scenografica */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#091b26]/60 border border-[#c99f5a]/25 p-6 sm:p-10 lg:p-14 backdrop-blur-md rounded-sm">
            {/* Immagine con badge */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 md:h-[480px] w-full rounded-sm overflow-hidden border border-white/10 group">
              <Image
                src={activeBoat.image}
                alt={activeBoat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061118] via-transparent to-transparent" />
              {activeBoat.badge && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#061118]/80 backdrop-blur-md border border-[#c99f5a]/40 text-[#e0be82] text-[10px] uppercase tracking-[0.2em] font-medium">
                  <Award className="w-3 h-3 text-[#c99f5a]" />
                  <span>{activeBoat.badge}</span>
                </div>
              )}
            </div>

            {/* Testi descrittivi ed essenziali */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] block font-mono mb-2">
                  {activeBoat.category} · {activeBoat.length}
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl text-white font-light leading-none">
                  {activeBoat.name}
                </h3>
                <p className="font-['Cormorant_Garamond'] text-lg sm:text-xl italic text-[#e0be82] mt-2">
                  {activeBoat.subtitle}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-white/75 font-light leading-relaxed">
                <p>{activeBoat.description}</p>
                <div className="p-4 bg-[#061118]/60 border-l-2 border-[#c99f5a] text-xs italic text-white/90">
                  {activeBoat.curiosity}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider text-white/60 font-mono">
                <div>
                  <span className="text-white/40 block">Cantiere</span>
                  <span className="text-white font-sans text-xs">
                    {activeBoat.shipyard}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Armamento</span>
                  <span className="text-white font-sans text-xs">
                    {activeBoat.rig}
                  </span>
                </div>
              </div>

              {/* Bottoni avanti/indietro */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevBoat}
                    className="p-2 border border-white/20 hover:border-[#c99f5a] text-white/80 hover:text-white transition-colors"
                    aria-label="Imbarcazione precedente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextBoat}
                    className="p-2 border border-white/20 hover:border-[#c99f5a] text-white/80 hover:text-white transition-colors"
                    aria-label="Imbarcazione successiva"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] tracking-widest text-[#e0be82] font-mono">
                  {selectedBoatIndex + 1} / {FLEET_DATA.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 04 — IL GESTO & I SAPERI TRADIZIONALI */}
      {/* ============================================================== */}
      <section
        id="saperi"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-28 sm:py-36 bg-[#040d13]"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capitolo 04 · Il Gesto e la Tecnica</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-white max-w-5xl">
            Vogare in piedi. <br />
            <span className="italic text-[#e0be82]">
              Con gli occhi rivolti alla rotta.
            </span>
          </h2>

          <p className="mt-8 text-base sm:text-xl text-white/70 font-light max-w-2xl leading-relaxed">
            La voga tradizionale flegrea non volta le spalle al cammino. Si rema
            in piedi, affacciati sulla prua, sentendo ogni singola onda sotto la
            pianta dei piedi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16">
            <div className="p-6 sm:p-8 bg-[#071722]/50 border-t border-[#c99f5a]/30">
              <span className="font-mono text-[10px] text-[#c99f5a] tracking-widest block mb-3">
                01 · IL VENTO
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-white uppercase mb-2">
                La Vela Latina
              </h4>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Antenna arcuata, carnao e pizzo. Una vela triangolare che risale
                il vento con un’eleganza geometrica immutata da oltre mille
                anni.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#071722]/50 border-t border-[#c99f5a]/30">
              <span className="font-mono text-[10px] text-[#c99f5a] tracking-widest block mb-3">
                02 · LA FORZA
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-white uppercase mb-2">
                Voga in Piedi
              </h4>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Equilibrio del corpo e cadenza ritmica. La tecnica storica con
                cui i marinai montesi manovravano tra gli scogli e nelle cale
                anguste.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#071722]/50 border-t border-[#c99f5a]/30">
              <span className="font-mono text-[10px] text-[#c99f5a] tracking-widest block mb-3">
                03 · L'ARTE
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-white uppercase mb-2">
                Maestri d’Ascia
              </h4>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Legno di quercia, pino e mogano. Calafatura a stoppa viva e
                pece naturale per restituire integrità e respiro a scafi d’epoca.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#071722]/50 border-t border-[#c99f5a]/30">
              <span className="font-mono text-[10px] text-[#c99f5a] tracking-widest block mb-3">
                04 · IL CUORE
              </span>
              <h4 className="font-['Cinzel'] text-sm tracking-wider text-white uppercase mb-2">
                Inclusione Mare
              </h4>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Con il Centro Serapide, portiamo in barca ragazzi e bambini con
                bisogni speciali. Il mare è libertà pura senza alcuna barriera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 05 — CANTIERI & ROTTE 2027 */}
      {/* ============================================================== */}
      <section
        id="futuro"
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-28 sm:py-36 bg-[#061118]"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] mb-6">
            <Compass className="w-3.5 h-3.5" />
            <span>Capitolo 05 · La Rotta Verso il Futuro</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-white max-w-5xl">
            Il mare flegreo <br />
            <span className="italic text-[#e0be82]">
              davanti al mondo intero.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mt-16">
            {/* Progetto ROSA */}
            <div className="p-8 sm:p-10 border border-[#c99f5a]/30 bg-[#081926]/70 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#e0be82]">
                  Saint-Tropez 2027
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-[#e0be82]/40 text-[#e0be82] uppercase tracking-wider text-[9px]">
                  Priorità Assoluta
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-light mb-3">
                Progetto ROSA
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                La nascita del primo equipaggio interamente femminile di vela
                latina. Formazione atletica, marinaresca e tattica per sfidare i
                migliori equipaggi internazionali a Les Voiles Latines 2027 in
                Francia.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-[#e0be82] font-semibold flex items-center gap-2">
                <span>Tradizione, Leadership, Parità</span>
                <span>→</span>
              </div>
            </div>

            {/* America's Cup Napoli */}
            <div className="p-8 sm:p-10 border border-white/10 bg-[#081926]/50 hover:border-[#c99f5a]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                  Golfo di Napoli
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">
                  Vetrina Globale
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-light mb-3">
                Janara all’America’s Cup
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                Partecipazione ufficiale programmata alla cerimonia d’apertura
                della più prestigiosa competizione velica al mondo, portando le
                vele dei maestri d’ascia flegrei a sfilare accanto agli scafi più
                tecnologici del pianeta.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-white/60 font-mono">
                Ammiraglia Janara · Napoli
              </div>
            </div>

            {/* Barcolana Trieste */}
            <div className="p-8 sm:p-10 border border-white/10 bg-[#081926]/50 hover:border-[#c99f5a]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                  Golfo di Trieste
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">
                  Regata dei Record
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-light mb-3">
                Quandel alla Barcolana
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                La lancia storica Ludovico Quandel, un tempo custode delle acque
                sull’Amerigo Vespucci, sulla linea di partenza insieme a migliaia
                di vele nel mar Adriatico.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-white/60 font-mono">
                Lancia Storica 1968
              </div>
            </div>

            {/* Quandel Lab & Breccia Museo */}
            <div className="p-8 sm:p-10 border border-white/10 bg-[#081926]/50 hover:border-[#c99f5a]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                  Scienza & Territorio
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">
                  Federico II & Suor Orsola
                </span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-light mb-3">
                Quandel Lab & Breccia Museo
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                Sperimentazioni idrodinamiche in mare con le università
                partenopee e percorsi culturali navigabili sotto le falesie
                vulcaniche della Breccia Museo di Monte di Procida.
              </p>
              <div className="text-[10px] tracking-widest uppercase text-white/60 font-mono">
                Archeologia Navale & Geologia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CAPITOLO 06 — SALI A BORDO & INCONTRIAMOCI AL PORTICCIOLO */}
      {/* ============================================================== */}
      <section
        id="porto"
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-28 sm:py-36 bg-[#040d13]"
      >
        <div className="max-w-6xl mx-auto w-full my-auto">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#c99f5a] mb-6">
            <Anchor className="w-3.5 h-3.5" />
            <span>Capitolo 06 · Sali a Bordo</span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light leading-[0.92] text-white max-w-5xl">
            Il mare ti aspetta <br />
            <span className="italic text-[#e0be82]">al porticciolo.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 items-start">
            <div className="lg:col-span-6 space-y-6 text-sm sm:text-base text-white/80 font-light leading-relaxed">
              <p>
                Non serve aver navigato per iniziare. L’Associazione accoglie
                chiunque voglia imparare a vogare, sostenere i restauri degli
                scafi o semplicemente far parte di una comunità che custodisce
                il respiro marinaro dei Campi Flegrei.
              </p>

              <div className="p-6 bg-[#061118] border border-[#c99f5a]/30 space-y-3 font-mono text-xs">
                <div className="text-[#e0be82] font-semibold text-sm font-sans">
                  Sede dell’Associazione:
                </div>
                <div className="text-white/70">
                  Via Guglielmo Marconi snc, Porticciolo di Monte di Procida
                  (NA)
                </div>
                <div className="text-white/70">
                  Presidente:{" "}
                  <span className="text-white">Antonio Pugliese</span>
                </div>
                <div className="text-white/70">
                  Telefono:{" "}
                  <a
                    href="tel:+393387633350"
                    className="text-[#e0be82] hover:underline"
                  >
                    +39 338 763 3350
                  </a>
                </div>
                <div className="text-white/70">
                  Email:{" "}
                  <a
                    href="mailto:velalatinamontediprocida@gmail.com"
                    className="text-[#e0be82] hover:underline"
                  >
                    velalatinamontediprocida@gmail.com
                  </a>
                </div>
                <div className="text-white/50 text-[10px] pt-2 border-t border-white/10">
                  APS iscritta al RUNTS · Riconoscimento Patrimonio Culturale
                  Immateriale
                </div>
              </div>
            </div>

            {/* Modulo di contatto essenziale e sobrio */}
            <div className="lg:col-span-6 p-8 bg-[#071722]/60 border border-[#c99f5a]/25 backdrop-blur-md">
              {contactSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#38b2ac] mx-auto animate-bounce" />
                  <h4 className="font-['Cormorant_Garamond'] text-3xl text-white">
                    Messaggio Trasmesso
                  </h4>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                    Grazie. Il presidente o il responsabile equipaggi ti
                    risponderà al più presto per concordare il tuo primo incontro
                    al porticciolo.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="text-[10px] uppercase tracking-widest text-[#e0be82] underline pt-4 cursor-pointer"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#e0be82] font-semibold block mb-2">
                    Scrivi all'Associazione
                  </span>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">
                      Nome & Cognome
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.nome}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, nome: e.target.value })
                      }
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2.5 bg-[#061118]/80 border border-white/15 focus:border-[#c99f5a] text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="latuamail@dominio.it"
                      className="w-full px-4 py-2.5 bg-[#061118]/80 border border-white/15 focus:border-[#c99f5a] text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">
                      Cosa desideri fare?
                    </label>
                    <select
                      value={contactForm.ruolo}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          ruolo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-[#061118] border border-white/15 focus:border-[#c99f5a] text-xs text-white focus:outline-none"
                    >
                      <option value="socio">
                        Diventare Socio Praticante (Voga & Vela)
                      </option>
                      <option value="rosa">
                        Candidatura per il Progetto ROSA (Equipaggio Femminile)
                      </option>
                      <option value="volontario">
                        Volontariato nel Cantiere & Restauro
                      </option>
                      <option value="partner">
                        Sostegno Istituzionale o Sponsorizzazione
                      </option>
                      <option value="info">Altre Informazioni</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">
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
                      placeholder="Raccontaci la tua passione o le tue richieste..."
                      className="w-full px-4 py-2.5 bg-[#061118]/80 border border-white/15 focus:border-[#c99f5a] text-xs text-white placeholder-white/30 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#c99f5a] hover:bg-white text-[#061118] text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5 text-[#061118]" />
                    <span>Invia Richiesta</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Storico Editoriale */}
        <div className="max-w-6xl mx-auto w-full pt-16 mt-16 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] tracking-widest uppercase text-white/40">
          <div>
            © 2008–{new Date().getFullYear()} Associazione Vela Latina Monte di
            Procida (APS)
          </div>
          <div className="font-serif italic text-sm text-[#e0be82]/80 normal-case tracking-normal">
            “Un punto cospicuo sul Mediterraneo.”
          </div>
          <div className="font-mono">40°47′N · 14°03′E</div>
        </div>
      </section>
    </div>
  );
}
