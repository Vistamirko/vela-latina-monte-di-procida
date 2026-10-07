import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scuola di Mare & Corsi di Voga e Vela Tradizionale",
  description:
    "Impara l'arte della vela latina e la voga tradizionale flegrea (in piedi). Corsi aperti ad Acquamorta per principianti, equipaggi d'altura e progetti speciali.",
  alternates: {
    canonical: "https://velalatinamontediprocida.it/corsi",
  },
  openGraph: {
    title: "Scuola di Mare & Corsi | Vela Latina Monte di Procida",
    description:
      "Corsi di vela latina, scuola di voga tradizionale in piedi e masterclass di marineria storica flegrea ad Acquamorta.",
    url: "https://velalatinamontediprocida.it/corsi",
    images: [
      {
        url: "/images/hero-sailing.webp",
        width: 1200,
        height: 800,
        alt: "Scuola di Vela Latina e Voga Monte di Procida",
      },
    ],
  },
};

const CORSI_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "@id": "https://velalatinamontediprocida.it/corsi#scuola-vela",
      name: "Corso di Conduzione e Manovre a Vela Latina",
      description:
        "Corso pratico di conduzione del gozzo a vela latina: armo antenna a calcese, regolazione carnao e scotta, bordeggio nel Canale di Procida e ormeggio tradizionale.",
      provider: {
        "@id": "https://velalatinamontediprocida.it/#organization",
      },
      educationalCredentialAwarded: "Attestato di Marinaio Tradizionale Vela Latina",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "In-Person",
        location: {
          "@type": "Place",
          name: "Porto di Acquamorta",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Monte di Procida",
            addressRegion: "Campania",
            addressCountry: "IT",
          },
        },
      },
    },
    {
      "@type": "Course",
      "@id": "https://velalatinamontediprocida.it/corsi#scuola-voga",
      name: "Scuola di Voga Tradizionale Flegrea (In Piedi)",
      description:
        "Apprendimento della voga flegrea in piedi con remi lunghi di faggio a bordo delle lance storiche San Michele Arcangelo e Quandel ad Acquamorta.",
      provider: {
        "@id": "https://velalatinamontediprocida.it/#organization",
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
          name: "Corsi",
          item: "https://velalatinamontediprocida.it/corsi",
        },
      ],
    },
  ],
};

export default function CorsiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CORSI_SCHEMA) }}
      />
      {children}
    </>
  );
}
