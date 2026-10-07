"use client";

import Image from "next/image";
import { ArrowDown, Compass, Waves } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#061118]">
      {/* Background Imagery with Deep Maritime Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/janara-crew.jpeg"
          alt="Janara in navigazione - Associazione Vela Latina Monte di Procida"
          fill
          priority
          className="object-cover object-[center_35%] scale-105 animate-[pulse_10s_ease-in-out_infinite] opacity-40 brightness-75 contrast-110"
        />
        {/* Layered luxury editorial gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061118] via-[#061118]/70 to-[#061118]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061118]/90 via-[#061118]/50 to-transparent" />
        <div className="absolute inset-0 vintage-grain pointer-events-none opacity-40" />
      </div>

      {/* Top Floating Coordinates & Historical Heritage Tag */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-4 sm:pt-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#c99f5a]/15 pb-4">
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#e0be82]/80 font-mono">
          <Compass className="w-3.5 h-3.5 text-[#c99f5a]" />
          <span>40° 47′ 42″ N · 14° 03′ 05″ E · MONTE DI PROCIDA</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#f4efe6]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38b2ac] animate-ping" />
          <span>Patrimonio Culturale Immateriale della Campania</span>
        </div>
      </div>

      {/* Center Grand Editorial Title & Payoff */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-12 sm:py-20 flex flex-col items-start justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c99f5a]/30 bg-[#081926]/60 backdrop-blur-sm text-[10px] sm:text-xs tracking-[0.28em] text-[#e0be82] uppercase mb-6 sm:mb-8 font-medium">
          <Waves className="w-3.5 h-3.5 text-[#38b2ac]" />
          <span>APS Marineria Flegrea · Dal 2008</span>
        </div>

        {/* Very Large Serif Headline with Historical Nobility */}
        <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
          <h2 className="font-['Cinzel'] text-xs sm:text-sm md:text-base tracking-[0.35em] text-[#f4efe6]/75 uppercase font-light">
            Associazione
          </h2>
          <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white leading-[0.92] max-w-5xl">
            Vela Latina <br />
            <span className="italic font-normal text-[#e0be82]">
              Monte di Procida
            </span>
          </h1>
        </div>

        {/* The Exact User Payoff with Historical Resonance */}
        <div className="relative pl-5 sm:pl-7 border-l-2 border-[#c99f5a] my-4 max-w-3xl">
          <p className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl md:text-4xl italic text-[#f4efe6] font-light leading-snug">
            “Un punto cospicuo sul Mediterraneo.”
          </p>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-[#f4efe6]/75 font-light leading-relaxed max-w-2xl font-sans">
            La salvaguardia del gozzo flegreo a remi e a vela latina. Custodiamo
            il sapere dei maestri d’ascia, rimettiamo in rotta scafi storici
            destinati alla memoria e formiamo le nuove generazioni nel cuore dei
            Campi Flegrei.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10">
          <a
            href="#flotta"
            className="group px-7 py-3.5 sm:px-8 sm:py-4 bg-[#c99f5a] text-[#061118] text-xs uppercase tracking-[0.25em] font-semibold hover:bg-white transition-all duration-300 rounded-sm shadow-xl flex items-center gap-3"
          >
            <span>Esplora la Flotta Storica</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>

          <a
            href="#manifesto"
            className="px-6 py-3.5 sm:px-7 sm:py-4 border border-[#f4efe6]/25 hover:border-[#c99f5a] text-[#f4efe6] hover:text-[#e0be82] text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 rounded-sm backdrop-blur-sm"
          >
            Il Nostro Manifesto
          </a>
        </div>
      </div>

      {/* Bottom Key Metric Strip - Editorial Style */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-8 border-t border-[#c99f5a]/15">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-start">
          <div className="flex flex-col">
            <span className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#e0be82] font-normal">
              2008
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#f4efe6]/60 mt-0.5">
              Anno di Fondazione
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-normal">
              ≈ 150
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#f4efe6]/60 mt-0.5">
              Soci & Custodi
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#e0be82] font-normal">
              5 Scafi
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#f4efe6]/60 mt-0.5">
              Flotta Storica Salvata
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-white font-normal">
                1° Assoluto
              </span>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#f4efe6]/60 mt-0.5">
              Saint-Tropez 2024 (Janara)
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col justify-end">
            <a
              href="#flotta"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#e0be82] hover:text-white transition-colors"
            >
              <span>Scorri e naviga</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
