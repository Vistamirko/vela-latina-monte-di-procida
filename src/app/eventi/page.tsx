import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TIMELINE_DATA, TimelineItem } from "@/data/associationData";
import { Calendar, Award, Film, Tv, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { initDb, EventsRepo } from "@/lib/db";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Palmarès, Regate Storiche & Cinema",
  description:
    "Vittorie storiche e appuntamenti della flotta: 1° posto assoluto a Saint-Tropez 2024, Procida Cup, Barcolana 2026, presenza al cinema d'autore e all'America's Cup.",
  alternates: {
    canonical: "https://velalatinamontediprocida.it/eventi",
  },
  openGraph: {
    title: "Palmarès & Regate Storiche | Vela Latina Monte di Procida",
    description:
      "Scopri i trionfi velici dell'ammiraglia Janara, le regate storiche nel Mediterraneo e la presenza nel cinema.",
    url: "https://velalatinamontediprocida.it/eventi",
    images: [
      {
        url: "/images/janara-regatta.jpeg",
        width: 1600,
        height: 874,
        alt: "Janara vincitrice a Saint-Tropez",
      },
    ],
  },
};

export default async function EventiPage() {
  await initDb();
  const events = await EventsRepo.getAll(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://velalatinamontediprocida.it/eventi#webpage",
        url: "https://velalatinamontediprocida.it/eventi",
        name: "Palmarès, Regate Storiche & Cinema",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://velalatinamontediprocida.it",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Eventi",
              item: "https://velalatinamontediprocida.it/eventi",
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: events.map((e, index) => ({
            "@type": "SportsEvent",
            position: index + 1,
            name: e.title,
            description: e.description,
            location: {
              "@type": "Place",
              name: e.location,
            },
            organizer: {
              "@id": "https://velalatinamontediprocida.it/#organization",
            },
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

      {/* Riconoscimenti & Palmarès Dinamico da API/Database */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#0a1c2a] font-bold block mb-3">
            I Risultati Sportivi & Manifestazioni
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl text-[#0a1c2a] font-light mb-12">
            Il Palmarès della Vela Latina Montese.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((evt) => (
              <div key={evt.id} className="p-8 bg-[#fbfaf6] border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-[#b8860b]" />
                    {evt.badge && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 bg-white border border-slate-300 text-[#0a1c2a] font-bold">
                        {evt.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#0a1c2a] font-bold block">
                    {evt.location} · {evt.date}
                  </span>

                  <h3 className="font-['Cormorant_Garamond'] text-3xl text-[#0a1c2a] font-light mt-1 mb-3">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-700 font-light leading-relaxed mb-4">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2">
                  {evt.result ? (
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold">
                      {evt.result}
                    </span>
                  ) : (
                    <span />
                  )}

                  {evt.articleSlug && (
                    <Link
                      href={`/blog/${evt.articleSlug}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#1b5b80] hover:text-[#0a1c2a] font-bold transition-colors ml-auto"
                    >
                      <span>Leggi il Racconto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
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
                    “The Happy Prince - L&apos;ultimo ritratto di Oscar Wilde” (2018)
                  </strong>
                  : Il nostro gozzo San Giuda Taddeo è stato scelto dal regista
                  Rupert Everett per le scene marittime d&apos;epoca del film.
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
                  artigianali dei maestri d&apos;ascia montesi.
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
      </main>

      <Footer />
    </div>
  );
}
