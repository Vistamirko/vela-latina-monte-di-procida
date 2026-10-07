import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://velalatinamontediprocida.it"),
  title: {
    default: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
    template: "%s | Vela Latina Monte di Procida",
  },
  description:
    "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, la flotta storica di gozzi e lance, scuola di voga e progetti internazionali verso Saint-Tropez e l'America's Cup.",
  keywords: [
    "Vela Latina",
    "Monte di Procida",
    "Campi Flegrei",
    "Gozzo Napoletano",
    "Janara",
    "Ludovico Quandel",
    "San Michele Arcangelo",
    "San Giuda Taddeo",
    "Voga Tradizionale",
    "Patrimonio Immateriale Campania",
    "Les Voiles Latines Saint Tropez",
    "America's Cup Napoli 2027",
    "Barcolana",
    "Acquamorta",
  ],
  authors: [{ name: "Associazione Vela Latina Monte di Procida APS" }],
  alternates: {
    canonical: "https://velalatinamontediprocida.it",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
    description:
      "Custodire il passato, progettare il futuro del mare flegreo. Scopri la flotta storica, la scuola di voga e le nostre rotte.",
    url: "https://velalatinamontediprocida.it",
    siteName: "Vela Latina Monte di Procida",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/images/janara-regatta.jpeg",
        width: 1600,
        height: 874,
        alt: "Vele latine in regata - Vela Latina Monte di Procida",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Associazione Vela Latina Monte di Procida",
    description: "Un punto cospicuo sul Mediterraneo. Tradizione, restauro e mare flegreo.",
    images: ["/images/janara-regatta.jpeg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico" },
      { url: "/images/stemma-vela-latina.jpg" },
    ],
    apple: [
      { url: "/icon.png" },
      { url: "/images/stemma-vela-latina.jpg" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1c2a",
  width: "device-width",
  initialScale: 1,
};

const GLOBAL_SCHEMA_JSON = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SportsClub", "NGO"],
      "@id": "https://velalatinamontediprocida.it/#organization",
      name: "Associazione Vela Latina Monte di Procida",
      alternateName: "Vela Latina Monte di Procida",
      legalName: "Associazione di Promozione Sociale Vela Latina Monte di Procida",
      url: "https://velalatinamontediprocida.it",
      logo: {
        "@type": "ImageObject",
        "@id": "https://velalatinamontediprocida.it/#logo",
        url: "https://velalatinamontediprocida.it/images/stemma-vela-latina.jpg",
        caption: "Stemma Ufficiale Vela Latina Monte di Procida",
      },
      image: "https://velalatinamontediprocida.it/images/janara-regatta.jpeg",
      description:
        "Presidio culturale permanente per la marineria flegrea. Custodia del gozzo napoletano a vela latina e a remi, scuola di voga tradizionale, restauro navale e partecipazione a regate storiche internazionali.",
      foundingDate: "2008",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Porto di Acquamorta",
        addressLocality: "Monte di Procida",
        addressRegion: "Campania",
        postalCode: "80070",
        addressCountry: "IT",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 40.795,
        longitude: 14.051,
      },
      knowsAbout: [
        "Vela Latina",
        "Gozzo Napoletano",
        "Voga Tradizionale Flegrea",
        "Carpenteria Navale",
        "Patrimonio Culturale Immateriale della Campania (D.D. 239/2020)",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "velalatinamontediprocida@gmail.com",
        contactType: "Segreteria & Relazioni Esterne",
        availableLanguage: ["Italian", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://velalatinamontediprocida.it/#website",
      url: "https://velalatinamontediprocida.it",
      name: "Vela Latina Monte di Procida",
      publisher: {
        "@id": "https://velalatinamontediprocida.it/#organization",
      },
      inLanguage: "it-IT",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${cormorant.variable} ${cinzel.variable} ${plusJakarta.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_SCHEMA_JSON) }}
        />
      </head>
      <body className="min-h-screen bg-white text-[#0a1c2a] font-sans antialiased selection:bg-[#0a1c2a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
