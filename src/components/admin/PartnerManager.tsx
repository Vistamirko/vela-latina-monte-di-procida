"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Tag,
} from "lucide-react";
import { PartnerItem } from "@/lib/db/types";
import ImageUploader from "@/components/ImageUploader";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

export default function PartnerManager() {
  const [items, setItems] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("tutti");

  // Modal State
  const [modalItem, setModalItem] = useState<Partial<PartnerItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner?all=true");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei partner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem?.name?.trim()) {
      showToast("error", "Inserisci il nome del partner");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalItem),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Partner salvato con successo");
        setModalItem(null);
        await loadData();
      } else {
        showToast("error", json.error || "Errore nel salvataggio");
      }
    } catch {
      showToast("error", "Errore di connessione al server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il partner "${name}"?`)) return;

    try {
      const res = await fetch(`/api/partner?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Partner rimosso");
        setItems((prev) => prev.filter((p) => p.id !== id));
      } else {
        showToast("error", json.error || "Errore nella rimozione");
      }
    } catch {
      showToast("error", "Errore durante la cancellazione");
    }
  };

  const handleTogglePublish = async (item: PartnerItem) => {
    try {
      const updated = { ...item, published: !item.published };
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
        showToast("success", updated.published ? "Partner pubblicato" : "Partner nascosto");
      }
    } catch {
      showToast("error", "Errore nell'aggiornamento visibilità");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.tagline || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.badge || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoriaFilter === "tutti" || item.category === categoriaFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded shadow-lg text-xs font-mono font-bold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Intestazione Sezione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold mb-1">
            <Award className="w-4 h-4 text-[#b8860b]" />
            <span>Gestione Sponsor & Sostenitori</span>
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#0a1c2a]">
            Partner & Sostenitori della Flotta
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-light">
            Gestisci le istituzioni, i cantieri e le aziende partner che compaiono nella sezione &quot;Partner &amp; Sostenitori&quot; dell&apos;home page e delle sezioni pubbliche.
          </p>
        </div>

        <button
          onClick={() =>
            setModalItem({
              name: "",
              category: "Partner Istituzionale",
              tagline: "",
              badge: "Istituzionale",
              logoUrl: "",
              websiteUrl: "",
              order: items.length + 1,
              published: true,
              notes: "",
            })
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a1c2a] hover:bg-[#1b5b80] text-white text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Partner</span>
        </button>
      </div>

      {/* Barra Filtri e Ricerca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 sm:p-4 border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per nome, motto o badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded bg-white text-[#0a1c2a] placeholder-slate-400 focus:outline-none focus:border-[#0a1c2a]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-mono uppercase text-slate-600 font-semibold shrink-0">
            Categoria:
          </label>
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
          >
            <option value="tutti">Tutte le categorie</option>
            <option value="Partner Istituzionale">Partner Istituzionale</option>
            <option value="Main Partner">Main Partner</option>
            <option value="Sponsor Tecnico">Sponsor Tecnico</option>
            <option value="Sostenitore">Sostenitore</option>
          </select>
        </div>
      </div>

      {/* Lista / Card Partner */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-700 bg-white border border-slate-200">
          Caricamento partner in corso...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200">
          <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-700 font-medium">Nessun partner trovato</p>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Modifica i filtri o clicca &quot;Nuovo Partner&quot; per aggiungere una voce.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded p-5 flex flex-col justify-between transition-all ${
                item.published ? "border-slate-200 shadow-2xs hover:border-slate-400" : "border-amber-200 bg-amber-50/20 opacity-80"
              }`}
            >
              <div>
                {/* Header Card: Badge Categoria + Visibilità */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-[#0a1c2a] font-bold rounded">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#fbfaf6] text-[#b8860b] font-semibold border border-[#b8860b]/30 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
                      item.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.published ? "Visibile" : "Bozza"}
                  </span>
                </div>

                {/* Logo & Titolo */}
                <div className="flex items-center gap-4 my-3">
                  <div className="w-14 h-14 relative shrink-0 border border-slate-200 bg-slate-50 rounded flex items-center justify-center overflow-hidden">
                    {item.logoUrl ? (
                      <Image
                        src={item.logoUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <PhotoPlaceholder compact title={item.name} className="w-full h-full border-0 bg-transparent text-[8px]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#0a1c2a] leading-tight truncate">
                      {item.name}
                    </h3>
                    {item.websiteUrl && (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-[#1b5b80] hover:underline mt-0.5 truncate max-w-full"
                      >
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{item.websiteUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Tagline / Descrizione */}
                <p className="text-xs text-slate-700 font-light line-clamp-2 mt-2 leading-relaxed">
                  {item.tagline || "Nessun testo descrittivo configurato."}
                </p>

                {item.notes && (
                  <p className="text-[10px] text-slate-600 italic mt-2 pt-2 border-t border-slate-100 line-clamp-1">
                    Nota interna: {item.notes}
                  </p>
                )}
              </div>

              {/* Azioni Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-slate-600 font-medium">
                  Ordine: #{item.order || 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    title={item.published ? "Nascondi da sito pubblico" : "Mostra su sito pubblico"}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-[#0a1c2a] transition-colors cursor-pointer"
                  >
                    {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => setModalItem({ ...item })}
                    title="Modifica partner"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-[#0a1c2a] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    title="Elimina partner"
                    className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AGGIUNGI / MODIFICA PARTNER */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl rounded p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#b8860b]" />
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#0a1c2a]">
                  {modalItem.id ? "Modifica Partner" : "Nuovo Partner o Sostenitore"}
                </h3>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="p-1 text-slate-400 hover:text-[#0a1c2a] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Nome Partner */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                  Nome Partner / Sostenitore *
                </label>
                <input
                  type="text"
                  required
                  value={modalItem.name || ""}
                  onChange={(e) => setModalItem({ ...modalItem, name: e.target.value })}
                  placeholder="Es. Comune di Monte di Procida"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-medium text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              {/* Categoria & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                    Categoria *
                  </label>
                  <select
                    value={modalItem.category || "Partner Istituzionale"}
                    onChange={(e) =>
                      setModalItem({
                        ...modalItem,
                        category: e.target.value as PartnerItem["category"],
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="Partner Istituzionale">Partner Istituzionale</option>
                    <option value="Main Partner">Main Partner</option>
                    <option value="Sponsor Tecnico">Sponsor Tecnico</option>
                    <option value="Sostenitore">Sostenitore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                    Badge Breve (opzionale)
                  </label>
                  <input
                    type="text"
                    value={modalItem.badge || ""}
                    onChange={(e) => setModalItem({ ...modalItem, badge: e.target.value })}
                    placeholder="Es. Istituzionale, Heritage, Sailmaker"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              {/* Logo / Immagine con Uploader */}
              <div>
                <ImageUploader
                  label="Logo Ufficiale / Stemma Partner"
                  value={modalItem.logoUrl || ""}
                  onChange={(url) => setModalItem({ ...modalItem, logoUrl: url })}
                  placeholder="/images/logo-vela-latina.webp"
                />
              </div>

              {/* Tagline / Motto / Ruolo */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                  Motto / Descrizione Breve
                </label>
                <textarea
                  rows={2}
                  value={modalItem.tagline || ""}
                  onChange={(e) => setModalItem({ ...modalItem, tagline: e.target.value })}
                  placeholder="Es. Patrocinio morale e valorizzazione della tradizione marinara flegrea"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              {/* Sito Web & Ordine di visualizzazione */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                    Sito Web Ufficiale
                  </label>
                  <input
                    type="url"
                    value={modalItem.websiteUrl || ""}
                    onChange={(e) => setModalItem({ ...modalItem, websiteUrl: e.target.value })}
                    placeholder="https://www.comune.montediprocida.na.it"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                    Ordine Visualiz.
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modalItem.order ?? 1}
                    onChange={(e) =>
                      setModalItem({ ...modalItem, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              {/* Note interne */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                  Note Interne (non visibili al pubblico)
                </label>
                <input
                  type="text"
                  value={modalItem.notes || ""}
                  onChange={(e) => setModalItem({ ...modalItem, notes: e.target.value })}
                  placeholder="Es. Contatto ufficio protocollo / referente del patrocinio"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-[#0a1c2a] focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              {/* Visibilità Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="partner-published"
                  checked={modalItem.published ?? true}
                  onChange={(e) => setModalItem({ ...modalItem, published: e.target.checked })}
                  className="w-4 h-4 text-[#0a1c2a] border-slate-300 rounded focus:ring-[#0a1c2a]"
                />
                <label htmlFor="partner-published" className="text-xs font-mono text-slate-800 font-medium">
                  Pubblica immediatamente sul sito web (visibile nel front-end)
                </label>
              </div>

              {/* Bottoni submit */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0a1c2a] hover:bg-[#1b5b80] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Salvataggio..." : "Salva Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
