import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initDb, ProjectsRepo } from "@/lib/db";
import { Compass, ArrowUpRight } from "lucide-react";

export const revalidate = 60;

export default async function ProgettiPage() {
  await initDb();
  const projects = await ProjectsRepo.getAll(true);

  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      <Header />

      {/* Hero Progetti */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Cantieri Strategici · Roadmap 2026–2027</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl font-light text-[#0a1c2a] leading-[0.9] max-w-5xl">
            I Grandi Progetti & <br />
            <span className="italic text-slate-700">Cantieri 2027.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Otto cantieri attivi trasformano la memoria marinara flegrea in
            azione concreta. Dalla formazione del primo equipaggio femminile per
            Saint-Tropez alla presenza all’America’s Cup e alla Barcolana, fino
            alle sperimentazioni idrodinamiche universitarie.
          </p>
        </div>
      </section>

      {/* Griglia dei Progetti Ufficiali dal Backend */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-8 sm:p-10 border border-slate-200 bg-[#fbfaf6] hover:border-[#0a1c2a] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-[#0a1c2a] font-bold">
                      {proj.number} · {proj.category}
                    </span>
                    {proj.badge && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 bg-white border border-slate-300 text-[#0a1c2a] font-semibold">
                        {proj.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-2">
                    {proj.title}
                  </h3>
                  <div className="font-serif italic text-base text-slate-800 mb-4">
                    {proj.highlight}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-300 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold">
                  <span>{proj.partner || "Campi Flegrei · Rete Partner"}</span>
                  <span className="text-[#1b5b80]">{proj.status}</span>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-16 text-slate-600 font-mono text-xs">
              Nessun progetto pubblicato al momento.
            </div>
          )}
        </div>
      </section>

      {/* Opportunità di Partnership & Sostegno */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-[#fbfaf6] border-b border-slate-200">
        <div className="max-w-4xl mx-auto w-full text-center space-y-6">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-700 font-semibold block">
            Collaborazione Istituzionale
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-5xl sm:text-7xl font-light text-[#0a1c2a]">
            Sostieni i progetti del mare.
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-light max-w-xl mx-auto leading-relaxed">
            L’Associazione ricerca partner e sponsor tecnici per il restauro
            della flotta, la trasferta del Progetto ROSA a Saint-Tropez, la
            ricerca scientifica e l’inclusione sociale.
          </p>

          <div className="pt-6">
            <a
              href="mailto:velalatinamontediprocida@gmail.com?subject=Richiesta%20Partnership%20Progetti"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all"
            >
              <span>Contatta l&apos;Associazione per Partnership</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
