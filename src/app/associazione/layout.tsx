import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "L'Associazione & la Memoria Flegrea",
  description:
    "Fondata nel 2008 ad Acquamorta, l'Associazione Vela Latina Monte di Procida custodisce i saperi della marineria storica, il restauro dei gozzi e lance, e la scuola di voga.",
  alternates: {
    canonical: `${SITE_URL}/associazione`,
  },
  openGraph: {
    title: "L'Associazione & la Memoria Flegrea | Vela Latina Monte di Procida",
    description:
      "Fondata nel 2008 ad Acquamorta, l'Associazione Vela Latina Monte di Procida custodisce i saperi della marineria storica e il restauro dei gozzi tradizionali.",
    url: `${SITE_URL}/associazione`,
    images: [
      {
        url: "/images/janara-crew.jpeg",
        width: 1200,
        height: 800,
        alt: "Equipaggio Associazione Vela Latina Monte di Procida",
      },
    ],
  },
};

const ASSOCIAZIONE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/associazione#webpage`,
      url: `${SITE_URL}/associazione`,
      name: "L'Associazione & la Memoria Flegrea",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
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
            name: "Associazione",
            item: `${SITE_URL}/associazione`,
          },
        ],
      },
    },
  ],
};

export default function AssociazioneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ASSOCIAZIONE_SCHEMA) }}
      />
      {children}
    </>
  );
}
