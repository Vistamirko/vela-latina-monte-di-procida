"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ImageUploader from "@/components/ImageUploader";
import { BlogPost } from "@/lib/db/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

function BlogEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [blogData, setBlogData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Cultura & Mare",
    author: "Vela Latina Redazione",
    coverImage: "/images/janara-crew.jpeg",
    published: true,
  });

  useEffect(() => {
    if (postId) {
      fetch("/api/blog?all=true")
        .then((res) => res.json())
        .then((d) => {
          const found = (d.data || []).find((p: BlogPost) => p.id === postId);
          if (found) {
            setBlogData(found);
          } else {
            setNotification({ type: "error", message: "Articolo non trovato" });
          }
        })
        .catch(() => setNotification({ type: "error", message: "Errore caricamento articolo" }))
        .finally(() => setLoading(false));
    }
  }, [postId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!blogData.title || !blogData.slug || !blogData.excerpt || !blogData.content) {
      setNotification({ type: "error", message: "Compila tutti i campi obbligatori (Titolo, Slug, Estratto, Contenuto)" });
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(postId);
      const url = "/api/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...blogData, id: postId } : blogData),
      });

      if (!res.ok) throw new Error("Errore durante il salvataggio");

      setNotification({ type: "success", message: "Articolo salvato con successo! Reindirizzamento..." });
      setTimeout(() => {
        router.push("/admin?tab=blog");
      }, 700);
    } catch {
      setNotification({ type: "error", message: "Impossibile salvare l'articolo" });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
        Caricamento articolo in corso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title={postId ? `Modifica: ${blogData.title}` : "Nuovo Articolo Blog"}
        subtitle="Redazione diari di bordo, rassegna stampa e storie marinaresche dei Campi Flegrei"
        backHref="/admin?tab=blog"
        backLabel="Torna a Blog & Racconti"
        onSave={() => handleSubmit()}
        isSaving={saving}
        saveLabel="Salva Articolo"
      />

      {notification && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={`p-3 text-xs font-mono font-semibold flex items-center gap-2 border ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-red-50 text-red-900 border-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 p-5 sm:p-8 shadow-xs space-y-6">
          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Titolo dell&apos;Articolo *
            </label>
            <input
              type="text"
              required
              value={blogData.title || ""}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)+/g, "");
                setBlogData({
                  ...blogData,
                  title,
                  slug: postId ? blogData.slug : slug,
                });
              }}
              placeholder="Es. Il segreto del taglio latino nei Campi Flegrei"
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-[#fbfaf6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Slug URL Univoco *
              </label>
              <input
                type="text"
                required
                value={blogData.slug || ""}
                onChange={(e) => setBlogData({ ...blogData, slug: e.target.value })}
                placeholder="il-segreto-del-taglio-latino"
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-mono text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                /blog/{blogData.slug || "slug"}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Categoria
              </label>
              <select
                value={blogData.category || "Cultura & Mare"}
                onChange={(e) => setBlogData({ ...blogData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] bg-white cursor-pointer"
              >
                <option value="Cultura & Mare">Cultura & Mare</option>
                <option value="Reportage Regata">Reportage Regata</option>
                <option value="Restauro Tradizionale">Restauro Tradizionale</option>
                <option value="Rassegna Stampa">Rassegna Stampa</option>
                <option value="Vita Associativa">Vita Associativa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
                Autore
              </label>
              <input
                type="text"
                value={blogData.author || "Vela Latina Redazione"}
                onChange={(e) => setBlogData({ ...blogData, author: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
              />
            </div>
          </div>

          <ImageUploader
            label="Fotografia di Copertina dell'Articolo"
            value={blogData.coverImage || ""}
            onChange={(url) => setBlogData({ ...blogData, coverImage: url })}
            placeholder="/images/janara-crew.jpeg"
          />

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Estratto Breve (Sommario in Anteprima) *
            </label>
            <textarea
              required
              rows={3}
              value={blogData.excerpt || ""}
              onChange={(e) => setBlogData({ ...blogData, excerpt: e.target.value })}
              placeholder="Sintesi accattivante del racconto per le card e Google..."
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1.5">
              Contenuto Completo del Racconto *
            </label>
            <textarea
              required
              rows={14}
              value={blogData.content || ""}
              onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
              placeholder="Scrivi qui il testo completo. Puoi andare a capo tra i paragrafi o usare formattazione Markdown..."
              className="w-full px-3.5 py-2.5 border border-slate-300 text-sm text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono leading-relaxed"
            />
          </div>

          <div className="p-4 bg-[#fbfaf6] border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#0a1c2a] block">
                Pubblicazione Articolo
              </span>
              <span className="text-[11px] text-slate-500 font-light block">
                {blogData.published !== false ? "L'articolo è online sul sito nella sezione /blog" : "L'articolo è salvato in bozza"}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blogData.published !== false}
                onChange={(e) => setBlogData({ ...blogData, published: e.target.checked })}
                className="w-4 h-4 text-[#0a1c2a]"
              />
              <span className="text-xs font-mono font-bold">Pubblicato Online</span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=blog")}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-xs font-mono font-semibold hover:bg-slate-100 transition-colors"
            >
              Annulla e Torna a Blog
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {saving ? "Salvataggio..." : "Salva Articolo"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function BlogEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center text-xs font-mono">Caricamento editor blog...</div>}>
      <BlogEditorContent />
    </Suspense>
  );
}
