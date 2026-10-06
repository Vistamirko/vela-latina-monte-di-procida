"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Volume2, VolumeX, Menu, X } from "lucide-react";

interface HeaderProps {
  currentChapter?: number;
  totalChapters?: number;
}

const CHAPTERS_NAV = [
  { id: "origine", label: "01 · Origine" },
  { id: "patrimonio", label: "02 · Memoria" },
  { id: "flotta", label: "03 · La Flotta" },
  { id: "saperi", label: "04 · Il Gesto" },
  { id: "futuro", label: "05 · Rotte 2027" },
  { id: "porto", label: "06 · Sali a Bordo" },
];

export default function Header({ currentChapter = 1, totalChapters = 6 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Web Audio ocean ambient sound synthesizer
  const toggleSound = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate ocean wind & waves
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      // Low frequency oscillator for wave swells
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave period
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
        gainNode?.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
        setSoundPlaying(false);
      } else {
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        gainNode?.gain.setTargetAtTime(0.04, audioCtx.currentTime, 0.3);
        setSoundPlaying(true);
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-700">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 sm:py-8 flex items-center justify-between">
          {/* Logo / Monogram */}
          <a
            href="#origine"
            className="pointer-events-auto flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#c99f5a]/40 bg-[#061118]/40 backdrop-blur-sm group-hover:border-[#c99f5a] transition-all">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma Vela Latina Monte di Procida"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-['Cinzel'] text-xs tracking-[0.28em] text-[#e0be82] uppercase group-hover:text-white transition-colors">
                Vela Latina
              </span>
              <span className="text-[9px] tracking-[0.32em] text-white/50 uppercase font-light">
                Monte di Procida
              </span>
            </div>
          </a>

          {/* Desktop Minimal Nav - Pochi testi piccoli distanziati */}
          <nav className="pointer-events-auto hidden md:flex items-center gap-7 lg:gap-9">
            {CHAPTERS_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-[10px] uppercase tracking-[0.28em] text-white/60 hover:text-[#e0be82] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#c99f5a] hover:after:w-full after:transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls: Ambient Sound & Mobile Toggle */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              title={soundPlaying ? "Disattiva atmosfera marina" : "Attiva atmosfera marina"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#c99f5a]/50 bg-[#061118]/30 backdrop-blur-md text-[9px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-all cursor-pointer"
            >
              {soundPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#38b2ac] animate-pulse" />
                  <span className="hidden sm:inline text-[#38b2ac]">Suono Attivo</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-white/50" />
                  <span className="hidden sm:inline">Atmosfera Mare</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white"
              aria-label="Apri menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#061118]/95 backdrop-blur-xl flex flex-col justify-between p-8 pt-28">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#c99f5a]/70">
              I Capitoli del Racconto
            </span>
            <div className="flex flex-col space-y-4">
              {CHAPTERS_NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-['Cormorant_Garamond'] text-2xl tracking-wider text-white hover:text-[#e0be82] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-white/50 space-y-2">
            <p>40° 47′ N · 14° 03′ E · Porticciolo di Monte di Procida</p>
            <p className="italic font-serif text-[#e0be82]">“Un punto cospicuo sul Mediterraneo”</p>
          </div>
        </div>
      )}
    </>
  );
}
