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
  title: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
  description:
    "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, la flotta storica di gozzi e lance, scuola di voga e progetti internazionali verso Saint-Tropez e l'America's Cup.",
  keywords: [
    "Vela Latina",
    "Monte di Procida",
    "Campi Flegrei",
    "Gozzo Napoletano",
    "Janara",
    "Ludovico Quandel",
    "Voga Tradizionale",
    "Patrimonio Immateriale Campania",
    "Les Voiles Latines Saint Tropez",
  ],
  authors: [{ name: "Associazione Vela Latina Monte di Procida APS" }],
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
        url: "/images/janara-crew.jpeg",
        width: 1600,
        height: 1064,
        alt: "Janara in navigazione - Vela Latina Monte di Procida",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Associazione Vela Latina Monte di Procida",
    description: "Un punto cospicuo sul Mediterraneo. Tradizione, restauro e mare flegreo.",
    images: ["/images/janara-crew.jpeg"],
  },
  icons: {
    icon: "/images/stemma-vela-latina.jpg",
    apple: "/images/stemma-vela-latina.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#061118",
  width: "device-width",
  initialScale: 1,
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
      <body className="min-h-screen bg-[#061118] text-[#f4efe6] font-sans antialiased selection:bg-[#c99f5a] selection:text-[#061118]">
        {children}
      </body>
    </html>
  );
}
