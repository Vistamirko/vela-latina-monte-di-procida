"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Upload,
  Check,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export interface MediaItem {
  url: string;
  name: string;
  title: string;
  category: string;
  sizeBytes?: number;
  updatedAt?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, title?: string) => void;
  initialSelectedUrl?: string;
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  initialSelectedUrl = "",
  title = "Archivio Fotografico & Immagini",
}: MediaLibraryModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tutte");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Caricamento dei media da /api/media
  const fetchMedia = () => {
    setLoading(true);
    fetch("/api/media")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setMediaList(json.data);
          if (initialSelectedUrl) {
            const found = json.data.find((m: MediaItem) => m.url === initialSelectedUrl);
            if (found) setSelectedItem(found);
          }
        }
      })
      .catch((err) => console.error("Errore recupero archivio immagini:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  // Categorie dinamiche
  const categories = useMemo(() => {
    const set = new Set<string>(["Tutte"]);
    mediaList.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [mediaList]);

  // Filtro in tempo reale (Search + Categoria)
  const filteredMedia = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mediaList.filter((item) => {
      const matchesCategory =
        activeCategory === "Tutte" || item.category === activeCategory;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [mediaList, searchQuery, activeCategory]);

  // Gestione caricamento nuovo file dal computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante il caricamento");
      }

      const newMedia: MediaItem = {
        url: data.url,
        name: data.fileName || file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: "Caricamenti Recenti",
        sizeBytes: file.size,
        updatedAt: new Date().toISOString(),
      };

      setMediaList((prev) => [newMedia, ...prev]);
      setSelectedItem(newMedia);
    } catch (err: any) {
      setUploadError(err.message || "Impossibile caricare il file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect(selectedItem.url, selectedItem.title);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-300 w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden rounded-xs animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="bg-[#0a1c2a] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#c99a45] shrink-0">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-[#c99a45]" />
            <div>
              <h2 className="font-['Cinzel'] text-sm sm:text-base font-bold tracking-wider uppercase text-white">
                {title}
              </h2>
              <p className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">
                {mediaList.length} fotografie disponibili nel catalogo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra di Ricerca & Filtri Categoria */}
        <div className="p-3 sm:p-4 bg-[#fbfaf6] border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Campo di Ricerca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per nome, soggetto o cartella (es. Janara, Regata, Museo, Voga)..."
                className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pulsante Carica Nuova Foto */}
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0a1c2a] text-white hover:bg-[#1b5b80] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 rounded-xs">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c99a45]" />
                  <span>Caricamento...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#c99a45]" />
                  <span>Carica Foto</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* Ricarica */}
            <button
              type="button"
              onClick={fetchMedia}
              title="Aggiorna elenco immagini"
              className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-xs transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Categorie a Pillole */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-[#0a1c2a] text-white font-bold"
                    : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {uploadError && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
              {uploadError}
            </div>
          )}
        </div>

        {/* Griglia Immagini + Anteprima Dettagliata */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Griglia Foto */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-xs font-mono text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#1b5b80]" />
                <span>Caricamento galleria immagini in corso...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-500 gap-2 font-mono text-center p-6">
                <FolderOpen className="w-10 h-10 text-slate-300" />
                <p className="font-bold text-[#0a1c2a]">Nessuna immagine trovata per &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-slate-400 text-[11px]">
                  Prova con un termine diverso oppure usa il pulsante &ldquo;Carica Foto&rdquo; per aggiungerne una dal computer.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredMedia.map((item) => {
                  const isSelected = selectedItem?.url === item.url;
                  return (
                    <div
                      key={item.url}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => {
                        setSelectedItem(item);
                        onSelect(item.url, item.title);
                        onClose();
                      }}
                      className={`group relative bg-white border cursor-pointer transition-all overflow-hidden rounded-xs flex flex-col ${
                        isSelected
                          ? "border-[#c99a45] ring-2 ring-[#c99a45]/40 shadow-md"
                          : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                      }`}
                    >
                      {/* Box Immagine */}
                      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                        <Image
                          src={item.url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={item.url.endsWith(".svg")}
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#c99a45] text-white p-1 rounded-full shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-xs backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Didascalia */}
                      <div className="p-2 bg-white flex-1 flex flex-col justify-between">
                        <p className="text-[11px] font-medium text-[#0a1c2a] line-clamp-1 group-hover:text-[#1b5b80]">
                          {item.title}
                        </p>
                        <p className="text-[9px] font-mono text-slate-600 truncate mt-0.5" title={item.name}>
                          {item.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pannello Laterale Dettagli Foto Selezionata */}
          {selectedItem && (
            <div className="w-full md:w-72 bg-white p-4 shrink-0 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 border-b pb-1">
                  Dettagli Foto Selezionata
                </div>

                <div className="relative aspect-4/3 w-full bg-slate-100 border border-slate-200 overflow-hidden rounded-xs">
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                    unoptimized={selectedItem.url.endsWith(".svg")}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#0a1c2a] break-words">
                    {selectedItem.title}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 break-all mt-0.5">
                    {selectedItem.url}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Categoria:</span>
                    <span className="font-bold">{selectedItem.category}</span>
                  </div>
                  {selectedItem.sizeBytes ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dimensione:</span>
                      <span>{(selectedItem.sizeBytes / 1024).toFixed(0)} KB</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="w-full py-2.5 px-4 bg-[#0a1c2a] hover:bg-[#1b5b80] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-xs"
                >
                  <Check className="w-4 h-4 text-[#c99a45]" />
                  <span>Usa questa immagine</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Barra di Selezione */}
        <div className="px-5 py-3 bg-[#fbfaf6] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-slate-500">
            {selectedItem ? (
              <span>
                Selezionata: <strong className="text-[#0a1c2a]">{selectedItem.name}</strong>
              </span>
            ) : (
              <span>Seleziona una foto dall&apos;elenco con un clic</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-xs font-mono text-slate-700 rounded-xs transition-colors"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirmSelection}
              className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-xs flex items-center gap-1.5 ${
                selectedItem
                  ? "bg-[#0a1c2a] hover:bg-[#1b5b80] text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Conferma Selezione</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
