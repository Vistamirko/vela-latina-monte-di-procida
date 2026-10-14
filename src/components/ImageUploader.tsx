"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Loader2, Check, Sparkles, Camera } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const GALLERY_PRESETS = [
  { label: "Janara in Regata", url: "/images/janara-regatta.jpeg" },
  { label: "Equipaggio Janara", url: "/images/janara-crew.jpeg" },
  { label: "Vela Latina Flegrea", url: "/images/hero-sailing.webp" },
  { label: "Flotta Storica", url: "/images/fleet-sailing.webp" },
  { label: "Stemma Storico", url: "/images/stemma-vela-latina.jpg" },
  { label: "Logo Ufficiale", url: "/images/logo-vela-latina.webp" },
];

/**
 * Ridimensiona e ottimizza automaticamente le foto scattate con smartphone (spesso 12-48MP / 10MB+)
 * convertendole in JPEG ottimizzato max 1920px per un caricamento veloce e senza errori da cellulare.
 */
async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const maxDimension = 1920;
        let width = img.width;
        let height = img.height;

        if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
          resolve(file);
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
              const optimizedFile = new File([blob], cleanFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = "/images/janara-regatta.jpeg",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFile = async (rawFile: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Ottimizza per dispositivi mobili prima dell'invio
      const file = await optimizeImageForUpload(rawFile);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore durante il caricamento");
      }

      onChange(data.url);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'upload dell'immagine"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    // reset input per permettere di ricaricare lo stesso file
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUploadFile(file);
    } else {
      setError("Trascina solo file immagine (JPG, PNG, WEBP, SVG).");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[10px] font-mono uppercase tracking-wider text-[#1b5b80] hover:text-[#0a1c2a] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showPresets ? "Nascondi archivio" : "Scegli dall&apos;archivio"}</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-[#0a1c2a] transition-colors cursor-pointer"
          >
            {showManualInput ? "URL compatto" : "Incolla URL"}
          </button>
        </div>
      </div>

      {/* Box Principale di Caricamento o Anteprima */}
      {value ? (
        <div className="relative border border-slate-300 bg-slate-50 p-2 rounded-xs flex items-center gap-4">
          <div className="relative w-28 h-20 bg-slate-200 border border-slate-300 shrink-0 overflow-hidden rounded-xs">
            {/* Immagine con anteprima */}
            <Image
              src={value}
              alt="Anteprima copertina"
              fill
              className="object-cover"
              unoptimized={value.startsWith("data:") || value.startsWith("http")}
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#0a1c2a] truncate">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{value}</span>
            </div>
            <p className="text-[10px] text-slate-700 font-mono mt-0.5">
              Immagine caricata correttamente e pronta per la pubblicazione
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="text-[10px] font-mono uppercase tracking-wider text-[#0a1c2a] hover:text-[#b8860b] font-bold cursor-pointer inline-flex items-center gap-1 bg-white px-2 py-0.5 border border-slate-300"
              >
                <Camera className="w-3 h-3 text-[#1b5b80]" />
                <span>Riscatta foto</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono uppercase tracking-wider text-[#1b5b80] hover:underline font-bold cursor-pointer"
              >
                Scegli dalla galleria
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[10px] font-mono uppercase tracking-wider text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Rimuovi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-slate-300 bg-[#fbfaf6] p-3 sm:p-5 rounded-xs space-y-3">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#1b5b80]" />
              <span className="text-xs font-mono font-semibold text-[#0a1c2a]">
                Caricamento & ottimizzazione foto da cellulare in corso...
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Ridimensionamento automatico ad alta qualità in corso
              </span>
            </div>
          ) : (
            <>
              {/* Due azioni rapide per smartphone e desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-3 bg-[#0a1c2a] hover:bg-[#152e42] text-white text-xs font-mono font-bold rounded-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Camera className="w-4 h-4 text-[#c99a45]" />
                  <span>Scatta Foto con Fotocamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-mono font-bold rounded-xs border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Upload className="w-4 h-4 text-[#1b5b80]" />
                  <span>Scegli da Galleria / File</span>
                </button>
              </div>

              {/* Area Drag & Drop alternativa da Desktop */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`hidden sm:block border-2 border-dashed rounded-xs p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#1b5b80] bg-[#1b5b80]/5"
                    : "border-slate-300/80 hover:border-[#0a1c2a] bg-white"
                }`}
              >
                <p className="text-[11px] text-slate-600 font-mono">
                  Oppure trascina qui il file dal computer (JPG, PNG, WEBP, HEIC fino a 25MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Input File Nascosto: Galleria / File Generico */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input Fotocamera Nascosto: Apre Direttamente la Fotocamera del Telefono */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Errore eventuale */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Galleria Immagini Esistenti della Flotta */}
      {showPresets && (
        <div className="p-3 bg-[#fbfaf6] border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3 text-[#0a1c2a]" />
              Fototeca Vela Latina (Archivio)
            </span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-800"
            >
              Chiudi
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {GALLERY_PRESETS.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => {
                  onChange(item.url);
                  setShowPresets(false);
                }}
                className={`flex items-center gap-2 p-1.5 border text-left cursor-pointer transition-all ${
                  value === item.url
                    ? "border-[#0a1c2a] bg-white ring-1 ring-[#0a1c2a]"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="relative w-8 h-8 shrink-0 bg-slate-100 overflow-hidden">
                  <Image src={item.url} alt={item.label} fill className="object-cover" />
                </div>
                <span className="text-[11px] font-mono text-[#0a1c2a] font-medium truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Manuale URL (se si preferisce un link esterno o CDN) */}
      {showManualInput && (
        <div className="pt-1">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono bg-white"
          />
          <span className="block text-[10px] font-mono text-slate-700 mt-1">
            Puoi digitare un percorso locale (/images/...) oppure incollare un URL web (https://...)
          </span>
        </div>
      )}
    </div>
  );
}
