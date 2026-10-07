import Header from "@/components/Header";
import EmotionalStory from "@/components/EmotionalStory";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0a1c2a] selection:bg-[#0a1c2a] selection:text-white">
      <Header />
      <EmotionalStory />
    </main>
  );
}
