"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { VolumeX, Menu, X, Wind, UserPlus } from "lucide-react";

const NAV_PAGES = [
  { href: "/progetti", label: "Progetti" },
  { href: "/associazione", label: "Associazione" },
  { href: "/eventi", label: "Eventi" },
  { href: "/corsi", label: "Corsi" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSound = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      lfo.start();

      setAudioCtx(ctx);
      setGainNode(gain);
      setSoundPlaying(true);
    } else {
      if (soundPlaying) {
        gainNode?.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
        setSoundPlaying(false);
      } else {
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        gainNode?.gain.setTargetAtTime(0.035, audioCtx.currentTime, 0.2);
        setSoundPlaying(true);
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 sm:py-4 shadow-xs"
            : "bg-white/80 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none py-3.5 sm:py-6 border-b border-slate-200/50 sm:border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo Ufficiale con Stemma Tradizionale & Tipografia Classica */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma Vela Latina Monte di Procida"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-['Cinzel'] text-xs sm:text-sm tracking-[0.25em] text-[#0a1c2a] uppercase font-semibold group-hover:text-[#b8860b] transition-colors leading-tight">
                Vela Latina
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.32em] text-slate-700 uppercase font-medium">
                Monte di Procida
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Esattamente le 4 voci richieste: Progetti, Associazione, Eventi, Corsi */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-11">
            {NAV_PAGES.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[10px] uppercase tracking-[0.28em] font-medium transition-colors duration-200 relative py-1 ${
                    isActive
                      ? "text-[#0a1c2a] after:w-full font-semibold"
                      : "text-slate-700 hover:text-[#0a1c2a] after:w-0 hover:after:w-full"
                  } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#0a1c2a] after:transition-all`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Destra: Bottone DIVENTA SOCIO + Brezza + Toggle mobile */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* CTA DIVENTA SOCIO SUBITO VISIBILE - DESKTOP E MOBILE */}
            <Link
              href="/diventa-socio"
              className="relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.16em] sm:tracking-[0.22em] transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer border border-[#c99f5a]/40 rounded-xs"
              title="Diventa Socio di Vela Latina Monte di Procida"
            >
              <UserPlus className="w-3 h-3 text-[#e0be82] shrink-0" />
              <span>Diventa Socio</span>
            </Link>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundPlaying ? "Disattiva brezza marina" : "Attiva suono brezza marina"}
              title={soundPlaying ? "Disattiva brezza marina" : "Attiva suono brezza marina"}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-slate-800 bg-white/70 backdrop-blur-sm text-[9px] uppercase tracking-[0.2em] text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs font-medium"
            >
              {soundPlaying ? (
                <>
                  <Wind className="w-3 h-3 text-[#1b5b80] animate-spin" />
                  <span className="hidden sm:inline text-[#1b5b80] font-semibold">Brezza</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-slate-700" />
                  <span className="hidden sm:inline text-slate-700">Brezza</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-800 hover:text-[#0a1c2a]"
              aria-label={mobileMenuOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Pulito a tutto schermo */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 pt-24 sm:pt-28 border-b border-slate-200 overflow-y-auto">
          <div className="space-y-6">
            {/* Box In Evidenza: Diventa Socio Subito */}
            <Link
              href="/diventa-socio"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-4 bg-[#0a1c2a] text-white border border-[#c99f5a]/50 hover:bg-[#b8860b] transition-all shadow-md"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e0be82] font-bold">
                  Adesione Online 2026
                </span>
                <span className="text-xs font-mono font-bold bg-[#c99f5a]/20 text-[#e0be82] px-2 py-0.5 border border-[#c99f5a]/30">
                  € 50 / anno
                </span>
              </div>
              <span className="font-['Cormorant_Garamond'] text-2xl font-semibold block leading-tight text-white">
                Diventa Socio Subito →
              </span>
              <span className="text-[11px] text-slate-300 font-sans mt-1 block">
                Iscriviti online in 1 minuto ed entra nell&apos;equipaggio
              </span>
            </Link>

            <span className="text-[11px] tracking-[0.3em] uppercase text-[#0a1c2a] font-mono font-bold block pt-2">
              Menu Principale
            </span>
            <div className="flex flex-col space-y-4">
              {NAV_PAGES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-['Cormorant_Garamond'] text-3xl tracking-wider transition-colors ${
                    pathname === item.href
                      ? "text-[#0a1c2a] italic font-normal"
                      : "text-slate-800 hover:text-[#0a1c2a]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-300 text-xs text-slate-700 space-y-2 font-mono">
            <p>40° 47′ N · 14° 03′ E · Porticciolo di Monte di Procida</p>
            <p className="italic font-serif text-[#0a1c2a] text-sm">
              “Un punto cospicuo sul Mediterraneo.”
            </p>
          </div>
        </div>
      )}
    </>
  );
}
