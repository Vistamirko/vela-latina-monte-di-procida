import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { buildPageMetadata, STATIC_PAGES_SEO } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(STATIC_PAGES_SEO["/diventa-socio"]);

const DIVENTA_SOCIO_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/diventa-socio#webpage`,
      url: `${SITE_URL}/diventa-socio`,
      name: "Diventa Socio · Tesseramento 2026",
      description: STATIC_PAGES_SEO["/diventa-socio"].description,
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
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Diventa Socio",
            item: `${SITE_URL}/diventa-socio`,
          },
        ],
      },
    },
  ],
};

export default function DiventaSocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DIVENTA_SOCIO_SCHEMA) }}
      />
      {children}
    </>
  );
}
