import type { Metadata } from "next";
import Header from "@/components/Header";
import EmotionalStory from "@/components/EmotionalStory";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
  description:
    "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, flotta storica (Janara, Quandel, San Giuda Taddeo), scuola di voga e grandi regate internazionali.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Associazione Vela Latina Monte di Procida — Un punto cospicuo sul Mediterraneo",
    description:
      "Presidio culturale per la marineria flegrea. Restauro navale, navigazione tradizionale, flotta storica e scuola di mare.",
    url: SITE_URL,
    images: [
      {
        url: "/images/janara-regatta.jpeg",
        width: 1600,
        height: 874,
        alt: "Vela Latina Monte di Procida in regata",
      },
    ],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a1c2a] selection:bg-[#0a1c2a] selection:text-white">
      <Header />
      <main id="main-content">
        <EmotionalStory />
      </main>
    </div>
  );
}
