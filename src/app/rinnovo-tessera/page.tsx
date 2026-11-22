import type { Metadata } from "next";
import { AnagraficaRepo } from "@/lib/db";
import { SITE_URL } from "@/lib/config";
import { buildPageMetadata, STATIC_PAGES_SEO } from "@/lib/seo";
import RinnovoClient from "./RinnovoClient";

export const metadata: Metadata = buildPageMetadata(STATIC_PAGES_SEO["/rinnovo-tessera"]);

const RINNOVO_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/rinnovo-tessera#webpage`,
      url: `${SITE_URL}/rinnovo-tessera`,
      name: "Rinnovo Tessera Online · Bonifico o Contanti in Sede",
      description: STATIC_PAGES_SEO["/rinnovo-tessera"].description,
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
            name: "Rinnovo Tessera",
            item: `${SITE_URL}/rinnovo-tessera`,
          },
        ],
      },
    },
  ],
};

export default async function RinnovoTesseraPage() {
  const anagrafica = await AnagraficaRepo.get();

  const bankInfo = {
    iban:
      anagrafica?.banca?.iban ||
      process.env.ASSOCIATION_IBAN ||
      "IT61P0306909606100000405783",
    intestatario:
      anagrafica?.banca?.intestatario ||
      anagrafica?.ragioneSociale ||
      "APS VELA LATINA Monte di Procida",
    istituto:
      anagrafica?.banca?.istituto || "Banca Nazionale del Lavoro - Gruppo BNP Paribas",
    filiale: anagrafica?.banca?.filiale || "Filiale Bacoli / Pozzuoli",
    bicSwift: anagrafica?.banca?.bicSwift || "BNLIITRRXXX",
    telefonoSegreteria: anagrafica?.telefono || "+39 338 633 4406",
    emailSegreteria: anagrafica?.email || "velalatinamontediprocida@gmail.com",
    approdo:
      anagrafica?.approdoNautico || "Porticciolo di Acquamorta (Monte di Procida)",
    codiceFiscaleEnte: anagrafica?.codiceFiscale || "96035970639",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(RINNOVO_SCHEMA) }}
      />
      <RinnovoClient bankInfo={bankInfo} />
    </>
  );
}
