"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Wind,
  Anchor,
  ArrowRight,
  Award,
  Sparkles,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";

export default function EmotionalStory() {
  return (
    <div className="relative bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      {/* ============================================================== */}
      {/* PROLOGO — LA ROTTA & IL PUNTO COSPICUO */}
      {/* ============================================================== */}
      <section
        id="prologo"
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
            Hub Marinaro dei Campi Flegrei
          </span>
        </div>

        {/* Titolo Monumentale con Grazie & Payoff */}
        <div className="max-w-7xl mx-auto w-full my-auto py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-slate-300 bg-white text-[10px] sm:text-xs tracking-[0.3em] text-[#0a1c2a] uppercase mb-8 font-medium">
            <Wind className="w-3.5 h-3.5 text-[#1b5b80]" />
            <span>Patrimonio Culturale Immateriale della Campania</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-light leading-[0.88] text-[#0a1c2a] tracking-tight">
            Vela Latina <br />
            <span className="italic font-normal text-slate-700">
              Monte di Procida
            </span>
          </h1>

          {/* Il Payoff Ufficiale */}
          <div className="mt-8 sm:mt-12 max-w-3xl border-l-2 border-[#0a1c2a] pl-6 sm:pl-8">
            <p className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl italic font-light text-[#0a1c2a] leading-tight">
              “Un punto cospicuo sul Mediterraneo.”
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl">
              Dalla scogliera di tufo affacciata sulle isole al mare aperto del
              Tirreno. Custodiamo l'anima del gozzo napoletano-flegreo,
              rimettiamo all'onda imbarcazioni storiche e insegniamo l'arte del
              vento alle nuove generazioni.
            </p>
          </div>
        </div>

        {/* Grande Immagine Fotografica Sotto Vele Bianche */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative w-full h-80 sm:h-[480px] md:h-[560px] rounded-xs overflow-hidden border border-slate-200 shadow-sm group">
            <Image
              src="/images/janara-regatta.jpeg"
              alt="Janara in regata sotto vela latina piena"
              fill
              priority
              className="object-cover object-[center_38%] transition-transform duration-1000 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white pointer-events-none">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-80 block">
                  Ammiraglia Janara
                </span>
                <span className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl italic">
                  Vele latine nel vento flegreo
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest hidden sm:inline bg-black/50 backdrop-blur-sm px-3 py-1 border border-white/20">
                Numero Velico 098 · Saint-Tropez Champion
              </span>
            </div>
          </div>
        </div>

        {/* Indice Veloce delle 4 Sezioni Hub */}
        <div className="max-w-7xl mx-auto w-full pt-8 mt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase tracking-[0.25em] text-slate-600 font-mono">
          <Link href="/progetti" className="hover:text-[#0a1c2a] flex items-center gap-1.5 transition-colors">
            <span>01 · Progetti</span>
            <span>→</span>
          </Link>
          <Link href="/associazione" className="hover:text-[#0a1c2a] flex items-center gap-1.5 transition-colors">
            <span>02 · Associazione</span>
            <span>→</span>
          </Link>
          <Link href="/eventi" className="hover:text-[#0a1c2a] flex items-center gap-1.5 transition-colors">
            <span>03 · Eventi</span>
            <span>→</span>
          </Link>
          <Link href="/corsi" className="hover:text-[#0a1c2a] flex items-center gap-1.5 transition-colors">
            <span>04 · Corsi</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ATTO I — L'ASSOCIAZIONE & LA FLOTTA (HUB CAPITOLO 01) */}
      {/* ============================================================== */}
      <section
        id="associazione-hub"
        className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-[#fbfaf6] border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Users className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>01 · Identità & Flotta Storica</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
            <div className="lg:col-span-7">
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-[0.92]">
                Non conserviamo relitti. <br />
                <span className="italic text-slate-700">
                  Rimettiamo in rotta le anime di legno.
                </span>
              </h2>

              <p className="mt-8 text-base sm:text-lg text-slate-700 font-light leading-relaxed max-w-2xl">
                Nata nel 2008, l'Associazione Vela Latina Monte di Procida riunisce
                circa 150 soci e maestri d'ascia. Custodisce una flotta di cinque
                imbarcazioni storiche restaurate e riconosciute dalla Regione
                Campania come Patrimonio Culturale Immateriale.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link
                  href="/associazione"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all rounded-xs shadow-xs"
                >
                  <span>Scopri l'Associazione e la Flotta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs font-mono text-slate-500">
                  Janara · Quandel · San Giuda · San Michele · Torpediniera
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-72 sm:h-96 w-full rounded-xs overflow-hidden border border-slate-200 group">
              <Image
                src="/images/janara-crew.jpeg"
                alt="Equipaggio a bordo di Janara"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono">
                Porticciolo di Monte di Procida · Via Marconi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ATTO II — I PROGETTI (HUB CAPITOLO 02) */}
      {/* ============================================================== */}
      <section
        id="progetti-hub"
        className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>02 · I Grandi Orizzonti 2027</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-[0.92] max-w-4xl">
              Il mare flegreo come <br />
              <span className="italic text-slate-700">cantiere aperto al mondo.</span>
            </h2>

            <Link
              href="/progetti"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] font-semibold text-[#0a1c2a] hover:text-[#b8860b] transition-colors py-2 border-b border-[#0a1c2a]"
            >
              <span>Tutti i Cantieri 2027</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-8 bg-[#fbfaf6] border border-slate-200 relative group">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-2">
                Saint-Tropez 2027
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mb-3">
                Progetto ROSA
              </h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                La formazione del primo equipaggio stabile interamente femminile
                di vela latina verso Les Voiles Latines in Costa Azzurra.
              </p>
              <Link
                href="/progetti"
                className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-semibold flex items-center gap-1 group-hover:text-[#b8860b]"
              >
                <span>Approfondisci</span>
                <span>→</span>
              </Link>
            </div>

            <div className="p-8 bg-[#fbfaf6] border border-slate-200 relative group">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-2">
                Golfo di Napoli
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mb-3">
                America’s Cup Napoli
              </h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                Janara presente alla cerimonia inaugurale: le vele storiche dei
                maestri d’ascia a confronto con i foil più avanzati del pianeta.
              </p>
              <Link
                href="/progetti"
                className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-semibold flex items-center gap-1 group-hover:text-[#b8860b]"
              >
                <span>Approfondisci</span>
                <span>→</span>
              </Link>
            </div>

            <div className="p-8 bg-[#fbfaf6] border border-slate-200 relative group">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-2">
                Golfo di Trieste
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mb-3">
                Quandel alla Barcolana
              </h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                La maestosa lancia del 1968, ex Amerigo Vespucci, pronta a
                schierarsi sulla linea di partenza della regata più partecipata al
                mondo.
              </p>
              <Link
                href="/progetti"
                className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-semibold flex items-center gap-1 group-hover:text-[#b8860b]"
              >
                <span>Approfondisci</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ATTO III — GLI EVENTI (HUB CAPITOLO 03) */}
      {/* ============================================================== */}
      <section
        id="eventi-hub"
        className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-[#fbfaf6] border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <Calendar className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>03 · Palmarès & Manifestazioni</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative h-80 sm:h-[420px] w-full rounded-xs overflow-hidden border border-slate-200">
              <Image
                src="/images/hero-sailing.webp"
                alt="Regata vele latine"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-slate-300">
                1° Saint-Tropez 2024
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-[0.92]">
                Dove il vento si fa <br />
                <span className="italic text-slate-700">
                  sfida, rito e vittoria.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-700 font-light leading-relaxed">
                Dalla vittoria assoluta di Janara a Les Voiles Latines di
                Saint-Tropez nel 2024 al trionfo alla Procida Cup 2025, fino alle
                tradizioni popolari della Festa del Porto di Ischia e del Palio
                Marinaro.
              </p>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Link
                  href="/eventi"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all rounded-xs shadow-xs"
                >
                  <span>Consulta il Calendario & Palmarès</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs font-mono text-slate-500">
                  Procida Cup · Ischia · Taranto · Saint-Tropez
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ATTO IV — I CORSI & LA FORMAZIONE (HUB CAPITOLO 04) */}
      {/* ============================================================== */}
      <section
        id="corsi-hub"
        className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-28 sm:py-36 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>04 · Scuola di Mare & Inclusione</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
            <div className="lg:col-span-7">
              <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-[0.92]">
                Vogare in piedi. <br />
                <span className="italic text-slate-700">
                  Imparare il mare con le mani.
                </span>
              </h2>

              <p className="mt-8 text-base sm:text-lg text-slate-700 font-light leading-relaxed max-w-2xl">
                I nostri corsi non si tengono tra quattro mura: si vive la rotta
                sul legno. Voga tradizionale flegrea, manovre di vela latina,
                addestramento per allievi marittimi e il programma speciale
                Inclusione Mare con il Centro Serapide.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link
                  href="/corsi"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all rounded-xs shadow-xs"
                >
                  <span>Iscriviti ai Corsi di Voga e Vela</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs font-mono text-slate-500">
                  Aperto a giovani, scuole e aspiranti marinai
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-72 sm:h-96 w-full rounded-xs overflow-hidden border border-slate-200 group">
              <Image
                src="/images/fleet-sailing.webp"
                alt="Voga tradizionale e scuola di mare"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono">
                Scuola di Voga Tradizionale Flegrea · San Michele Arcangelo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* EPILOGO — IL PORTICCIOLO (SALI A BORDO) */}
      {/* ============================================================== */}
      <section
        id="porto"
        className="relative min-h-[70vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-24 sm:py-32 bg-[#fbfaf6]"
      >
        <div className="max-w-7xl mx-auto w-full text-center space-y-6">
          <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-mono block">
            Il Nostro Approdo
          </span>

          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl font-light text-[#0a1c2a] leading-none">
            La rotta comincia al porticciolo.
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-light leading-relaxed">
            Via Guglielmo Marconi snc, Porticciolo di Monte di Procida (NA).
            <br />
            Presidente: Antonio Pugliese · Tel: +39 338 763 3350 · Email:
            velalatinamontediprocida@gmail.com
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/associazione"
              className="px-6 py-3 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-colors"
            >
              Diventa Socio
            </Link>
            <Link
              href="/corsi"
              className="px-6 py-3 border border-slate-300 text-[#0a1c2a] text-[10px] uppercase tracking-[0.25em] font-semibold hover:border-slate-800 transition-colors bg-white"
            >
              Partecipa ai Corsi
            </Link>
          </div>
        </div>

        {/* Footer Minimalista */}
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
