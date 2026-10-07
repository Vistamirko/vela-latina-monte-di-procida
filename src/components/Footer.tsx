import Link from "next/link";
import { Compass, Anchor, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-[#0a1c2a] py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-200">
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-['Cinzel'] text-sm tracking-[0.28em] uppercase font-semibold text-[#0a1c2a]">
              Vela Latina Monte di Procida
            </span>
            <span className="block text-[9px] tracking-[0.32em] text-slate-500 uppercase mt-0.5 font-mono">
              Associazione di Promozione Sociale · RUNTS
            </span>
          </Link>
          <p className="font-['Cormorant_Garamond'] text-2xl italic text-slate-700 leading-snug max-w-sm">
            “Un punto cospicuo sul Mediterraneo.”
          </p>
          <p className="text-xs text-slate-600 font-light leading-relaxed max-w-md">
            Tutela e trasmissione dei saperi della marineria flegrea. Costruzione,
            manutenzione e conduzione del gozzo a remi e a vela latina riconosciuti
            come Patrimonio Culturale Immateriale della Campania (D.D. n. 239/2020).
          </p>
        </div>

        <div className="md:col-span-3 space-y-3 font-mono text-xs">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-sans font-semibold">
            Navigazione
          </span>
          <div>
            <Link href="/progetti" className="text-slate-600 hover:text-[#0a1c2a] transition-colors">
              Progetti & Cantieri 2027
            </Link>
          </div>
          <div>
            <Link href="/associazione" className="text-slate-600 hover:text-[#0a1c2a] transition-colors">
              L'Associazione & La Flotta
            </Link>
          </div>
          <div>
            <Link href="/eventi" className="text-slate-600 hover:text-[#0a1c2a] transition-colors">
              Eventi & Palmarès
            </Link>
          </div>
          <div>
            <Link href="/corsi" className="text-slate-600 hover:text-[#0a1c2a] transition-colors">
              Scuola di Voga & Vela
            </Link>
          </div>
        </div>

        <div className="md:col-span-4 space-y-3 font-mono text-xs text-slate-600">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-sans font-semibold">
            Approdo & Contatti
          </span>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>Via Guglielmo Marconi snc, Porticciolo di Monte di Procida (NA)</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href="tel:+393387633350" className="hover:text-[#0a1c2a] transition-colors">
              +39 338 763 3350 (Pres. Antonio Pugliese)
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href="mailto:velalatinamontediprocida@gmail.com" className="hover:text-[#0a1c2a] transition-colors">
              velalatinamontediprocida@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
        <div>© 2008–{new Date().getFullYear()} APS Vela Latina Monte di Procida</div>
        <div>40° 47′ 42″ N · 14° 03′ 05″ E · Campi Flegrei</div>
      </div>
    </footer>
  );
}
