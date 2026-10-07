import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, User, Compass } from "lucide-react";
import { initDb, BlogRepo } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await initDb();
  const { slug } = await params;
  const post = await BlogRepo.getBySlug(slug);

  if (!post) {
    return {
      title: "Articolo non trovato · Vela Latina Monte di Procida",
    };
  }

  const canonicalUrl = `https://velalatinamontediprocida.it/blog/${post.slug}`;

  return {
    title: `${post.title} | Il Giornale di Bordo`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} | Vela Latina Monte di Procida`,
      description: post.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.author],
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 800,
              alt: post.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await initDb();
  const { slug } = await params;
  const post = await BlogRepo.getBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const postUrl = `https://velalatinamontediprocida.it/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        url: postUrl,
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: {
          "@type": "Person",
          name: post.author,
        },
        publisher: {
          "@id": "https://velalatinamontediprocida.it/#organization",
        },
        image: post.coverImage ? `https://velalatinamontediprocida.it${post.coverImage}` : undefined,
        inLanguage: "it-IT",
        isPartOf: {
          "@id": "https://velalatinamontediprocida.it/blog#blog",
        },
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
            name: "Blog",
            item: "https://velalatinamontediprocida.it/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
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
        <article className="pt-36 sm:pt-44 pb-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto w-full">
          {/* Breadcrumb Back */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-[#0a1c2a] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Torna al Giornale di Bordo</span>
            </Link>
          </div>

          {/* Intestazione */}
          <div className="space-y-4 border-b border-slate-200 pb-8 mb-10">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider">
              <span className="px-2.5 py-1 bg-[#fbfaf6] border border-slate-300 text-[#0a1c2a] font-bold">
                {post.category}
              </span>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1b5b80]" />
                <span>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1b5b80]" />
                <span>{post.author}</span>
              </div>
            </div>

            <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-6xl md:text-7xl font-light text-[#0a1c2a] leading-[0.95]">
              {post.title}
            </h1>

            <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl italic text-slate-800 font-light leading-relaxed pt-2">
              “{post.excerpt}”
            </p>
          </div>

          {/* Immagine Copertina se presente */}
          {post.coverImage && (
            <div className="relative w-full h-72 sm:h-96 md:h-[480px] mb-12 border border-slate-200 overflow-hidden shadow-xs">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Testo dell'articolo */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed font-light space-y-6">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Box Autore & Condivisione */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-700">
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-[#1b5b80]" />
              <span>
                Archivio Storico · Associazione Vela Latina Monte di Procida
              </span>
            </div>
            <Link
              href="/blog"
              className="text-[#0a1c2a] font-bold hover:text-[#b8860b] transition-colors"
            >
              Leggi altri racconti →
            </Link>
          </div>
        </div>
      </article>
      </main>

      <Footer />
    </div>
  );
}
