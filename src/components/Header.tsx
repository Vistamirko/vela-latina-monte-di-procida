"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Volume2, VolumeX, Menu, X, Compass, Wind } from "lucide-react";

const CHAPTERS_NAV = [
  { id: "rotta", label: "01 · La Rotta" },
  { id: "vento", label: "02 · L'Armo" },
  { id: "flotta", label: "03 · Le Vele" },
  { id: "gesto", label: "04 · Il Gesto" },
  { id: "orizzonti", label: "05 · 2027" },
  { id: "porto", label: "06 · Sali a Bordo" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-xs"
            : "bg-transparent py-6 sm:py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Logo / Monogram */}
          <a
            href="#rotta"
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-300 p-0.5 bg-white shadow-xs group-hover:border-[#0a1c2a] transition-all">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma Vela Latina Monte di Procida"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-['Cinzel'] text-xs sm:text-sm tracking-[0.28em] text-[#0a1c2a] uppercase font-semibold group-hover:text-[#b8860b] transition-colors">
                Vela Latina
              </span>
              <span className="text-[9px] tracking-[0.32em] text-slate-500 uppercase font-normal">
                Monte di Procida
              </span>
            </div>
          </a>

          {/* Desktop Nav - Piccoli testi eleganti e distanziati */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {CHAPTERS_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-[10px] uppercase tracking-[0.26em] font-medium text-slate-600 hover:text-[#0a1c2a] transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#0a1c2a] hover:after:w-full after:transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls: Ambient Ocean Breeze & Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={toggleSound}
              title={soundPlaying ? "Disattiva brezza marina" : "Attiva suono brezza marina"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 hover:border-slate-800 bg-white/70 backdrop-blur-sm text-[9px] uppercase tracking-[0.2em] text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              {soundPlaying ? (
                <>
                  <Wind className="w-3.5 h-3.5 text-[#1b5b80] animate-spin" />
                  <span className="hidden sm:inline text-[#1b5b80] font-medium">Brezza Attiva</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Suono Mare</span>
                </>
              )}
            </button>

            <a
              href="#porto"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-semibold text-white bg-[#0a1c2a] hover:bg-[#b8860b] transition-all rounded-xs shadow-xs"
            >
              <span>A Bordo</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#0a1c2a]"
              aria-label="Apri menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Clean White */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white/98 backdrop-blur-xl flex flex-col justify-between p-8 pt-28 border-b border-slate-200">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-mono">
              La Rotta Emozionale
            </span>
            <div className="flex flex-col space-y-4">
              {CHAPTERS_NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-['Cormorant_Garamond'] text-3xl tracking-wider text-[#0a1c2a] hover:text-[#b8860b] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2 font-mono">
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
