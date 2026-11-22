import type { Metadata } from "next";
import Header from "@/components/Header";
import EmotionalStory from "@/components/EmotionalStory";
import { buildPageMetadata, STATIC_PAGES_SEO } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(STATIC_PAGES_SEO["/"]);

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
