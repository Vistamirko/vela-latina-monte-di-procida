import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ShieldCheck,
  Sailboat,
  Mail,
} from "lucide-react";
import {
  NauticalBorderRuler,
  NauticalCrosshair,
} from "@/components/NauticalChartElements";
import { initDb, ProjectsRepo } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await initDb();
  const { slug } = await params;
  const project = await ProjectsRepo.getBySlug(slug);

  if (!project) {
    return {
      title: "Progetto non trovato · Vela Latina Monte di Procida",
    };
  }

  const canonicalUrl = `https://velalatinamontediprocida.it/progetti/${project.slug}`;

  return {
    title: `${project.title} · ${project.highlight}`,
    description: project.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${project.title} · ${project.highlight} | Vela Latina Monte di Procida`,
      description: project.description,
      url: canonicalUrl,
      images: project.imageUrl
        ? [
            {
              url: project.imageUrl,
              width: 1200,
              height: 800,
              alt: `${project.title} - Vela Latina Monte di Procida`,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await initDb();
  const { slug } = await params;
  const project = await ProjectsRepo.getBySlug(slug);

  if (!project || !project.published) {
    notFound();
  }

  // Recupera tutti i progetti per navigazione correlati
  const allProjects = await ProjectsRepo.getAll(true);
  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug || p.id === project.id);
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : allProjects[0] && allProjects[0].slug !== project.slug
      ? allProjects[0]
      : null;

  const projectUrl = `https://velalatinamontediprocida.it/progetti/${project.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#project`,
        name: project.title,
        headline: `${project.title} · ${project.highlight}`,
        description: project.description,
        url: projectUrl,
        image: project.imageUrl ? `https://velalatinamontediprocida.it${project.imageUrl}` : undefined,
        creator: {
          "@id": "https://velalatinamontediprocida.it/#organization",
        },
        temporalCoverage: project.timeline || "2026/2027",
        spatialCoverage: project.location || "Monte di Procida, Italia",
        inLanguage: "it-IT",
      },
      {
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
            name: "Progetti",
            item: "https://velalatinamontediprocida.it/progetti",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: projectUrl,
          },
        ],
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
        {/* Hero Progetto */}
        <article className="pt-28 sm:pt-36 md:pt-44 pb-20 px-4 sm:px-8 lg:px-24">
        <div className="max-w-5xl mx-auto w-full">
          {/* Breadcrumb Back */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/progetti"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-[#0a1c2a] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Torna a Tutti i Progetti & Cantieri</span>
            </Link>
          </div>

          {/* Intestazione Cantiere */}
          <div className="space-y-4 sm:space-y-6 border-b border-slate-200 pb-8 sm:pb-12 mb-8 sm:mb-12">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider">
              <span className="px-2.5 py-1 bg-[#0a1c2a] text-white font-bold">
                Cantiere {project.number}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-[#0a1c2a] font-semibold">
                {project.category}
              </span>
              {project.badge && (
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                  {project.badge}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{project.status}</span>
              </span>
            </div>

            <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#0a1c2a] leading-[0.95] tracking-tight">
              {project.title}
            </h1>

            <p className="font-serif italic text-xl sm:text-3xl text-slate-800 font-normal leading-snug">
              {project.highlight}
            </p>

            {/* Coordinate e scala millimetrata */}
            <div className="pt-2">
              <NauticalBorderRuler coordinate="ROTTA CANTIERE · CANALE DI PROCIDA" />
            </div>

            {/* Scheda Sintetica Dati Chiave */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 text-xs font-mono">
              <div className="p-3 sm:p-4 rounded-xs bg-[#fbfaf6] border border-slate-200/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-700 block mb-1">
                  Orizzonte Temporale
                </span>
                <div className="flex items-center gap-1.5 text-[#0a1c2a] font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#1b5b80] shrink-0" />
                  <span>{project.timeline || "In Corso"}</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xs bg-[#fbfaf6] border border-slate-200/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-700 block mb-1">
                  Teatro Operativo
                </span>
                <div className="flex items-center gap-1.5 text-[#0a1c2a] font-bold truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#1b5b80] shrink-0" />
                  <span className="truncate">{project.location || "Monte di Procida"}</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xs bg-[#fbfaf6] border border-slate-200/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-700 block mb-1">
                  Partner & Rete
                </span>
                <div className="flex items-center gap-1.5 text-[#0a1c2a] font-bold truncate">
                  <Users className="w-3.5 h-3.5 text-[#1b5b80] shrink-0" />
                  <span className="truncate">{project.partner || "Campi Flegrei"}</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xs bg-[#fbfaf6] border border-slate-200/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-700 block mb-1">
                  Patrimonio
                </span>
                <div className="flex items-center gap-1.5 text-[#0a1c2a] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1b5b80] shrink-0" />
                  <span>D.D. 239/2020</span>
                </div>
              </div>
            </div>
          </div>

          {/* Immagine di Copertina del Progetto */}
          {project.imageUrl && (
            <div className="relative w-full h-64 sm:h-96 md:h-[480px] mb-10 sm:mb-14 rounded-xs overflow-hidden border border-slate-200 shadow-sm group">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white pointer-events-none">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-80 block">
                    Cantiere Operativo · {project.number}
                  </span>
                  <span className="font-['Cormorant_Garamond'] text-lg sm:text-2xl italic">
                    {project.title} · {project.highlight}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sintesi Introduttiva in Risalto */}
          <div className="p-6 sm:p-8 rounded-xs bg-[#fbfaf6] border-l-4 border-[#0a1c2a] mb-12 shadow-2xs">
            <div className="mb-2">
              <NauticalCrosshair coords="40°47′42″N · 14°03′05″E" label="Relazione di Cantiere" />
            </div>
            <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl italic text-[#0a1c2a] leading-relaxed">
              “{project.description}”
            </p>
          </div>

          {/* Spiegazione Approfondita del Progetto */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed font-light space-y-6">
            {project.content ? (
              project.content.split("\n\n").map((block, idx) => {
                // Header livello 3
                if (block.startsWith("### ")) {
                  return (
                    <h3
                      key={idx}
                      className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a] pt-6 pb-1 border-b border-slate-200"
                    >
                      {block.replace("### ", "")}
                    </h3>
                  );
                }
                // Elenco puntato
                if (block.includes("\n- ") || block.startsWith("- ")) {
                  const lines = block.split("\n");
                  return (
                    <ul key={idx} className="space-y-2 my-4 pl-4 font-normal text-sm sm:text-base text-slate-700">
                      {lines.map((l, li) => (
                        <li key={li} className="flex items-start gap-2.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1b5b80] mt-2 shrink-0" />
                          <span>{l.replace(/^-\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Paragrafo standard
                return (
                  <p key={idx} className="leading-relaxed">
                    {block}
                  </p>
                );
              })
            ) : (
              <p className="leading-relaxed">{project.description}</p>
            )}
          </div>

          {/* Box Partnership / Sostegno al Cantiere */}
          <div className="mt-16 p-8 sm:p-10 rounded-xs bg-[#0a1c2a] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#b8860b] uppercase tracking-widest font-bold">
                <Sailboat className="w-4 h-4" />
                <span>Partecipa al Cantiere</span>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-light">
                Vuoi sostenere o candidarti a questo progetto?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                L’Associazione accoglie candidature per equipaggi, partner scientifici,
                sponsor tecnici ed enti del Terzo Settore.
              </p>
            </div>

            <a
              href={`mailto:velalatinamontediprocida@gmail.com?subject=Adesione%20al%20Progetto%20${encodeURIComponent(
                project.title
              )}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#0a1c2a] text-xs font-mono uppercase tracking-[0.2em] font-bold hover:bg-[#b8860b] hover:text-white transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Contatta l&apos;Associazione</span>
            </a>
          </div>

          {/* Navigazione Prossimo Cantiere */}
          {nextProject && (
            <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
              <Link
                href="/progetti"
                className="text-xs font-mono text-slate-700 hover:text-[#0a1c2a] font-bold transition-colors"
              >
                ← Indice Cantieri
              </Link>
              <Link
                href={`/progetti/${nextProject.slug}`}
                className="group flex items-center gap-2 text-xs font-mono text-[#0a1c2a] font-bold hover:text-[#1b5b80] transition-colors"
              >
                <span>
                  Prossimo Progetto ({nextProject.number}): {nextProject.title}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </article>
      </main>

      <Footer />
    </div>
  );
}
