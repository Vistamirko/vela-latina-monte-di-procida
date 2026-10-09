import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";
import { initDb, BlogRepo } from "@/lib/db";
import { SITE_URL } from "@/lib/config";

export const revalidate = 60; // rigenera ogni minuto

export const metadata: Metadata = {
  title: "Il Giornale di Bordo & la Memoria Flegrea",
  description:
    "Articoli, memorie orali e saggi di marineria: i segreti costruttivi dei maestri d'ascia montesi, la conduzione all'antenna e la lettura del vento nel Canale di Procida.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Il Giornale di Bordo & la Memoria Flegrea | Vela Latina Monte di Procida",
    description:
      "Racconti di mare, calafateria navale e storie di regata dall'Associazione Vela Latina Monte di Procida.",
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: "/images/janara-crew.jpeg",
        width: 1200,
        height: 800,
        alt: "Il Giornale di Bordo di Vela Latina Monte di Procida",
      },
    ],
  },
};

export default async function BlogPage() {
  await initDb();
  const posts = await BlogRepo.getAll(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        url: `${SITE_URL}/blog`,
        name: "Il Giornale di Bordo & la Memoria Flegrea",
        description: "Articoli, memorie e approfondimenti sulla marineria tradizionale flegrea.",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
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
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
          ],
        },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.publishedAt || p.createdAt,
          author: {
            "@type": "Person",
            name: p.author,
          },
        })),
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
        {/* Hero Blog */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-200 bg-[#fbfaf6]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-slate-700 font-semibold font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5 text-[#0a1c2a]" />
            <span>Racconti di Mare · Maestri d&apos;Ascia · Diari di Bordo</span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] text-6xl sm:text-8xl md:text-9xl font-light text-[#0a1c2a] leading-[0.9] max-w-5xl">
            Il Giornale di Bordo & <br />
            <span className="italic text-slate-700">la Memoria Flegrea.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-700 font-light leading-relaxed max-w-3xl">
            Storie di calafateria, cronache di regata da Saint-Tropez a Trieste,
            analisi delle brezze del canale e approfondimenti sulla conservazione
            del patrimonio marittimo campano.
          </p>
        </div>
      </section>

      {/* Griglia Articoli */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[#fbfaf6] border border-slate-200 flex flex-col justify-between overflow-hidden group hover:border-[#0a1c2a] transition-all"
              >
                <div>
                  {post.coverImage && (
                    <div className="relative w-full h-56 overflow-hidden border-b border-slate-200">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-103"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 bg-white/95 border border-slate-300 text-[#0a1c2a] text-[9px] uppercase tracking-widest font-mono font-bold">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-700 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1b5b80]" />
                        <span>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#1b5b80]" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a] leading-snug group-hover:text-[#b8860b] transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#0a1c2a] font-bold group-hover:text-[#b8860b] transition-colors"
                  >
                    <span>Leggi l&apos;articolo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16 text-slate-600 font-mono text-xs">
              Nessun articolo pubblicato al momento.
            </div>
          )}
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
