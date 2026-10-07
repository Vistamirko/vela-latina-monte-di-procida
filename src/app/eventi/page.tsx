"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TIMELINE_DATA, TimelineItem } from "@/data/associationData";
import { Calendar, Award, Film, Tv, MapPin } from "lucide-react";
import Image from "next/image";

export default function EventiPage() {
  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      {/* Hero Eventi */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono mb-4">
            <Calendar className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Palmarès · Regate Storiche · Cinema & Media</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl font-light text-[#0a1c2a] leading-[0.9] max-w-5xl">
            Eventi, Regate & <br />
            <span className="italic text-slate-700">la Cronistoria.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Dal debutto sulle acque della Costa Azzurra al trionfo assoluto a
            Saint-Tropez nel 2024, fino alle apparizioni nel cinema
            internazionale e nei programmi della televisione pubblica. Le nostre
            barche sono testimoni viaggianti del territorio flegreo.
          </p>
        </div>
      </section>

      {/* Riconoscimenti & Palmarès di Spicco */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#0a1c2a] font-bold block mb-3">
            I Risultati Sportivi
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light mb-12">
            Il Palmarès della Vela Latina Montese.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#fbfaf6] border border-slate-200">
              <Award className="w-8 h-8 text-[#b8860b] mb-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-bold block">
                Saint-Tropez · 2024
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mt-1 mb-3">
                Vittoria Assoluta
              </h3>
              <p className="text-xs text-slate-700 font-light leading-relaxed">
                Janara conquista il primo gradino del podio assoluto a Les Voiles
                Latines di Saint-Tropez, battendo i migliori equipaggi
                provenienti da tutto il Mediterraneo.
              </p>
            </div>

            <div className="p-8 bg-[#fbfaf6] border border-slate-200">
              <Award className="w-8 h-8 text-[#0a1c2a] mb-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-bold block">
                Procida · 2025
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mt-1 mb-3">
                1° Posto Procida Cup
              </h3>
              <p className="text-xs text-slate-700 font-light leading-relaxed">
                Trionfo nelle acque del canale di Procida, ribadendo la padronanza
                dell'equipaggio flegreo nelle correnti e nei salti di vento di
                casa.
              </p>
            </div>

            <div className="p-8 bg-[#fbfaf6] border border-slate-200">
              <Award className="w-8 h-8 text-[#1b5b80] mb-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-bold block">
                Marina di Pisciotta · 2026
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mt-1 mb-3">
                Premio Fair Play & Podio
              </h3>
              <p className="text-xs text-slate-700 font-light leading-relaxed">
                Trofeo Tre Torri nel Cilento: 3° di classe, 8° assoluto e il
                prestigioso Premio Fair Play assegnato per l'etica marinara e lo
                spirito di collaborazione.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cinema e Televisione */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-[#fbfaf6] border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#0a1c2a] font-bold block">
              Cultura & Audiovisivo
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light leading-tight">
              Nel cinema e nei racconti della TV.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-light leading-relaxed">
              <div className="flex items-start gap-3">
                <Film className="w-4 h-4 text-[#0a1c2a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#0a1c2a]">
                    “The Happy Prince - L'ultimo ritratto di Oscar Wilde” (2018)
                  </strong>
                  : Il nostro gozzo San Giuda Taddeo è stato scelto dal regista
                  Rupert Everett per le scene marittime d'epoca del film.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tv className="w-4 h-4 text-[#0a1c2a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#0a1c2a]">Rai 1 · “Linea Blu”</strong>
                  : Ampio servizio condotto da Donatella Bianchi dedicato alla
                  tradizione del gozzo flegreo e alla rinascita della vela latina
                  a Monte di Procida.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tv className="w-4 h-4 text-[#0a1c2a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#0a1c2a]">Rai 1 · “Camper”</strong>:
                  Approfondimento con Giuseppe Calabrese sulle tecniche
                  artigianali dei maestri d'ascia montesi.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-80 sm:h-96 w-full rounded-xs overflow-hidden border border-slate-200">
            <Image
              src="/images/janara-crew.jpeg"
              alt="Janara vela latina"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Cronistoria Vent'Anni di Mare (2006–2027) */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto w-full">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#0a1c2a] font-bold block mb-3 text-center">
            Cronologia Ufficiale
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light mb-16 text-center">
            Vent’anni di mare e relazioni.
          </h2>

          <div className="relative border-l border-slate-300 pl-6 sm:pl-10 space-y-12">
            {TIMELINE_DATA.map((item: TimelineItem, index: number) => (
              <div key={index} className="relative group">
                <div
                  className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-3 h-3 rounded-full border-2 ${
                    item.highlight
                      ? "bg-[#0a1c2a] border-[#0a1c2a]"
                      : "bg-white border-slate-700"
                  }`}
                />
                <span className="font-mono text-xs text-[#0a1c2a] font-bold block mb-1">
                  {item.year}
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl text-[#0a1c2a] font-light">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-light mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
