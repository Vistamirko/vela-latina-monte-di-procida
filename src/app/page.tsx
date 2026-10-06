import Header from "@/components/Header";
import EmotionalStory from "@/components/EmotionalStory";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#061118] text-[#f4efe6] selection:bg-[#c99f5a] selection:text-[#061118]">
      <Header />
      <EmotionalStory />
    </main>
  );
}
