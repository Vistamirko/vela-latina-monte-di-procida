import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { buildPageMetadata, STATIC_PAGES_SEO } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(STATIC_PAGES_SEO["/associazione"]);

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
