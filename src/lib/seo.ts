import type { Metadata } from "next";
import { SITE_URL, getAbsoluteUrl } from "@/lib/config";
import { initDb, BlogRepo, ProjectsRepo } from "@/lib/db";

export const SITE_NAME = "Vela Latina Monte di Procida";
export const DEFAULT_OG_IMAGE = "/images/janara-regatta.jpeg";

export interface BuildPageMetadataOptions {
  /** Titolo pagina (verrà inserito nel template `%s | Vela Latina Monte di Procida` salvo `absoluteTitle`) */
  title: string;
  /** Usa il titolo così com'è senza applicare il template del root layout (es. Home) */
  absoluteTitle?: boolean;
  /** Titolo specifico per social share (Open Graph / Twitter); di default usa `title | SITE_NAME` */
  socialTitle?: string;
  /** Descrizione SEO meta description */
  description: string;
  /** Descrizione per social share; di default usa `description` */
  socialDescription?: string;
  /** Percorso relativo canonico (es. "/progetti" o "/blog/mio-articolo") */
  path: string;
  /** Immagine di anteprima (percorso relativo in /public o URL assoluto https://...) */
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  /** Sovrascrive og:url (utile per la pagina /access per evitare loop di redirect con i crawler) */
  ogUrlOverride?: string;
  noIndex?: boolean;
}

export function buildPageMetadata(opts: BuildPageMetadataOptions): Metadata {
  const cleanPath = opts.path === "/" ? "" : opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const canonicalUrl = `${SITE_URL}${cleanPath}`;
  const ogUrl = opts.ogUrlOverride || canonicalUrl;
  const fullSocialTitle =
    opts.socialTitle || (opts.absoluteTitle ? opts.title : `${opts.title} | ${SITE_NAME}`);
  const socialDesc = opts.socialDescription || opts.description;
  const resolvedImage = getAbsoluteUrl(opts.image || DEFAULT_OG_IMAGE);
  const imageAlt = opts.imageAlt || fullSocialTitle;
  const width = opts.imageWidth || 1200;
  const height = opts.imageHeight || 630;

  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    ...(opts.noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {
          alternates: {
            canonical: canonicalUrl,
          },
        }),
    openGraph: {
      title: fullSocialTitle,
      description: socialDesc,
      url: ogUrl,
      siteName: SITE_NAME,
      locale: "it_IT",
      type: opts.type || "website",
      ...(opts.type === "article" && opts.publishedTime
        ? { publishedTime: opts.publishedTime }
        : {}),
      ...(opts.type === "article" && opts.authors?.length ? { authors: opts.authors } : {}),
      images: [
        {
          url: resolvedImage,
          width,
          height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullSocialTitle,
      description: socialDesc,
      images: [resolvedImage],
    },
  };
}

export const STATIC_PAGES_SEO: Record<string, BuildPageMetadataOptions> = {
  "/": {
    title: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
    absoluteTitle: true,
    description:
      "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, flotta storica (Janara, Quandel, San Giuda Taddeo), scuola di voga e grandi regate internazionali.",
    socialDescription:
      "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, flotta storica e scuola di mare.",
    path: "/",
    image: "/images/janara-regatta.jpeg",
    imageWidth: 1600,
    imageHeight: 874,
    imageAlt: "Vela Latina Monte di Procida in regata",
  },
  "/associazione": {
    title: "L'Associazione & la Memoria Flegrea",
    description:
      "Fondata nel 2008 ad Acquamorta, l'Associazione Vela Latina Monte di Procida custodisce i saperi della marineria storica, il restauro dei gozzi e lance, e la scuola di voga.",
    socialDescription:
      "Fondata nel 2008 ad Acquamorta, l'Associazione Vela Latina Monte di Procida custodisce i saperi della marineria storica e il restauro dei gozzi tradizionali.",
    path: "/associazione",
    image: "/images/janara-crew.jpeg",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Equipaggio Associazione Vela Latina Monte di Procida",
  },
  "/corsi": {
    title: "Scuola di Mare & Corsi di Voga e Vela Tradizionale",
    socialTitle: "Scuola di Mare & Corsi | Vela Latina Monte di Procida",
    description:
      "Impara l'arte della vela latina e la voga tradizionale flegrea (in piedi). Corsi aperti ad Acquamorta per principianti, equipaggi d'altura e progetti speciali.",
    socialDescription:
      "Corsi di vela latina, scuola di voga tradizionale in piedi e masterclass di marineria storica flegrea ad Acquamorta.",
    path: "/corsi",
    image: "/images/attivita/voga-in-piedi-tramonto.jpg",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Scuola di Vela Latina e Voga Monte di Procida",
  },
  "/progetti": {
    title: "I Grandi Progetti & Cantieri 2027",
    description:
      "Otto cantieri attivi dell'Associazione Vela Latina Monte di Procida: Progetto ROSA (equipaggio femminile verso Saint-Tropez), America's Cup Napoli, Barcolana, Quandel Lab e Breccia Museo.",
    socialDescription:
      "Dalla formazione per Saint-Tropez alla presenza all'America's Cup, Barcolana e ricerca scientifica. Scopri i cantieri della marineria flegrea.",
    path: "/progetti",
    image: "/images/attivita/equipaggio-rosa.jpeg",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Progetti e Cantieri Vela Latina Monte di Procida",
  },
  "/eventi": {
    title: "Palmarès, Regate Storiche & Cinema",
    socialTitle: "Palmarès & Regate Storiche | Vela Latina Monte di Procida",
    description:
      "Vittorie storiche e appuntamenti della flotta: 1° posto assoluto a Saint-Tropez 2024, Procida Cup, Barcolana 2026, presenza al cinema d'autore e all'America's Cup.",
    socialDescription:
      "Scopri i trionfi velici dell'ammiraglia Janara, le regate storiche nel Mediterraneo e la presenza nel cinema.",
    path: "/eventi",
    image: "/images/attivita/saint-tropez-regatta.jpeg",
    imageWidth: 1600,
    imageHeight: 874,
    imageAlt: "Janara vincitrice a Saint-Tropez",
  },
  "/blog": {
    title: "Il Giornale di Bordo & la Memoria Flegrea",
    description:
      "Articoli, memorie orali e saggi di marineria: i segreti costruttivi dei maestri d'ascia montesi, la conduzione all'antenna e la lettura del vento nel Canale di Procida.",
    socialDescription:
      "Racconti di mare, calafateria navale e storie di regata dall'Associazione Vela Latina Monte di Procida.",
    path: "/blog",
    image: "/images/janara-crew.jpeg",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Il Giornale di Bordo di Vela Latina Monte di Procida",
  },
  "/diventa-socio": {
    title: "Diventa Socio · Tesseramento 2026",
    socialTitle: "Diventa Socio 2026 | Vela Latina Monte di Procida",
    description:
      "Sali a bordo dell'equipaggio dell'Associazione Vela Latina Monte di Procida APS. Iscriviti come Socio Praticante o Sostenitore per la stagione 2026 ad Acquamorta.",
    socialDescription:
      "Unisciti all'Associazione Vela Latina Monte di Procida APS: voga tradizionale in piedi, vela latina e salvaguardia della marineria flegrea.",
    path: "/diventa-socio",
    image: "/images/attivita/equipaggio-selfie-janara.jpg",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Equipaggio Vela Latina Monte di Procida - Diventa Socio",
  },
};

/**
 * Risolve i metadati SEO/OpenGraph/Twitter per un percorso interno arbitrario.
 * Usato anche da `/access?returnUrl=...` così i crawler social mostrano l'anteprima
 * corretta della pagina condivisa anche quando la protezione anteprima è attiva.
 */
export async function resolveMetadataForPath(
  rawPath: string,
  options?: { ogUrlOverride?: string; noIndex?: boolean }
): Promise<Metadata> {
  // Normalizza e sanitizza il path (solo percorsi relativi interni)
  const cleanRaw = (rawPath || "/").split("?")[0].split("#")[0].trim();
  const pathname =
    cleanRaw.startsWith("/") && !cleanRaw.startsWith("//")
      ? cleanRaw.replace(/\/+$/, "") || "/"
      : "/";

  // 1. Pagine statiche note
  const staticDef = STATIC_PAGES_SEO[pathname];
  if (staticDef) {
    return buildPageMetadata({
      ...staticDef,
      ogUrlOverride: options?.ogUrlOverride,
      noIndex: options?.noIndex,
    });
  }

  // 2. Articolo Blog: /blog/[slug]
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    try {
      await initDb();
      const slug = decodeURIComponent(blogMatch[1]);
      const post = await BlogRepo.getBySlug(slug);
      if (post && post.published) {
        return buildPageMetadata({
          title: `${post.title} | Il Giornale di Bordo`,
          socialTitle: `${post.title} | ${SITE_NAME}`,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.coverImage || DEFAULT_OG_IMAGE,
          imageAlt: post.title,
          imageWidth: 1200,
          imageHeight: 800,
          type: "article",
          publishedTime: post.publishedAt || post.createdAt,
          authors: [post.author],
          ogUrlOverride: options?.ogUrlOverride,
          noIndex: options?.noIndex,
        });
      }
    } catch (err) {
      console.error("[SEO] Errore recupero metadata blog:", err);
    }
  }

  // 3. Scheda Progetto: /progetti/[slug]
  const projectMatch = pathname.match(/^\/progetti\/([^/]+)$/);
  if (projectMatch) {
    try {
      await initDb();
      const slug = decodeURIComponent(projectMatch[1]);
      const project = await ProjectsRepo.getBySlug(slug);
      if (project && project.published) {
        return buildPageMetadata({
          title: `${project.title} · ${project.highlight}`,
          socialTitle: `${project.title} · ${project.highlight} | ${SITE_NAME}`,
          description: project.description,
          path: `/progetti/${project.slug}`,
          image: project.imageUrl || DEFAULT_OG_IMAGE,
          imageAlt: `${project.title} - ${SITE_NAME}`,
          imageWidth: 1200,
          imageHeight: 800,
          ogUrlOverride: options?.ogUrlOverride,
          noIndex: options?.noIndex,
        });
      }
    } catch (err) {
      console.error("[SEO] Errore recupero metadata progetto:", err);
    }
  }

  // 4. Fallback Home
  return buildPageMetadata({
    ...STATIC_PAGES_SEO["/"],
    ogUrlOverride: options?.ogUrlOverride,
    noIndex: options?.noIndex,
  });
}
