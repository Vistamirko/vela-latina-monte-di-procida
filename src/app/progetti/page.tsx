import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initDb, ProjectsRepo } from "@/lib/db";
import { Compass, ArrowUpRight, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "I Grandi Progetti & Cantieri 2027",
  description:
    "Otto cantieri attivi dell'Associazione Vela Latina Monte di Procida: Progetto ROSA (equipaggio femminile verso Saint-Tropez), America's Cup Napoli, Barcolana, Quandel Lab e Breccia Museo.",
  alternates: {
    canonical: `${SITE_URL}/progetti`,
  },
  openGraph: {
    title: "I Grandi Progetti & Cantieri 2027 | Vela Latina Monte di Procida",
    description:
      "Dalla formazione per Saint-Tropez alla presenza all'America's Cup, Barcolana e ricerca scientifica. Scopri i cantieri della marineria flegrea.",
    url: `${SITE_URL}/progetti`,
    images: [
      {
        url: "/images/janara-crew.jpeg",
        width: 1200,
        height: 800,
        alt: "Progetti e Cantieri Vela Latina Monte di Procida",
      },
    ],
  },
};

export default async function ProgettiPage() {
  await initDb();
  const projects = await ProjectsRepo.getAll(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/progetti#webpage`,
        url: `${SITE_URL}/progetti`,
        name: "I Grandi Progetti & Cantieri 2027",
        description:
          "Cantieri strategici e rotte della marineria flegrea: regate internazionali, inclusione sociale e ricerca scientifica.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_URL}`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Progetti",
              item: `${SITE_URL}/progetti`,
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: projects.length,
          itemListElement: projects.map((p, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/progetti/${p.slug}`,
            name: `${p.number} · ${p.title} (${p.highlight})`,
          })),
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] sail-grid selection:bg-[#0a1c2a] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main id="main-content">
        {/* Hero Progetti */}
      <section className="pt-28 sm:pt-44 pb-16 sm:pb-20 px-4 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono mb-4">
            <Compass className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Cantieri Strategici · Roadmap 2026–2027</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-7xl md:text-9xl font-light text-[#0a1c2a] leading-[0.92] max-w-5xl">
            I Grandi Progetti & <br />
            <span className="italic text-slate-700">Cantieri 2027.</span>
          </h1>

          <p className="mt-6 sm:mt-8 text-sm sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Otto cantieri attivi trasformano la memoria marinara flegrea in
            azione concreta. Dalla formazione del primo equipaggio femminile per
            Saint-Tropez alla presenza all’America’s Cup e alla Barcolana, fino
            alle sperimentazioni idrodinamiche universitarie. Clicca su ciascun cantiere
            per esplorare la scheda tecnica e la spiegazione dettagliata.
          </p>
        </div>
      </section>

      {/* Griglia dei Progetti Ufficiali dal Backend */}
      <section className="py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group p-6 sm:p-10 border border-slate-200 bg-[#fbfaf6] hover:border-[#0a1c2a] hover:shadow-md transition-all flex flex-col justify-between"
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

                  <Link href={`/progetti/${proj.slug}`}>
                    <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light mb-2 group-hover:text-[#1b5b80] transition-colors">
                      {proj.title}
                    </h3>
                  </Link>

                  <div className="font-serif italic text-base text-slate-800 mb-4">
                    {proj.highlight}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={`/progetti/${proj.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0a1c2a] group-hover:text-[#1b5b80] uppercase tracking-wider transition-colors"
                    >
                      <span>Leggi la Spiegazione Completa</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-300 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold">
                  <span className="truncate pr-2">{proj.partner || "Campi Flegrei · Rete Partner"}</span>
                  <span className="text-[#1b5b80] shrink-0">{proj.status}</span>
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
              href="mailto:vistamirko@gmail.com?subject=Richiesta%20Partnership%20Progetti"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0a1c2a] text-white text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all"
            >
              <span>Contatta l&apos;Associazione per Partnership</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
