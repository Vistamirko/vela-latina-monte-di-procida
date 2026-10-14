"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  X,
  Check,
  Loader2,
  Copy,
  Ship,
  ExternalLink,
} from "lucide-react";

interface QuickPhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded?: (url: string) => void;
}

/**
 * Ridimensiona e comprime le foto scattate con smartphone per un upload veloce e senza errori da mobile
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

function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number, loadedBytes: number, totalBytes: number) => void
): Promise<{ url: string; fileName?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent, event.loaded, event.total);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error("Risposta del server non valida"));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Errore HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Errore di caricamento (HTTP ${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Errore di rete durante il caricamento"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Caricamento interrotto"));
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

export default function QuickPhotoUploaderModal({
  isOpen,
  onClose,
  onPhotoUploaded,
}: QuickPhotoUploaderModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadBytesInfo, setUploadBytesInfo] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetBoat, setTargetBoat] = useState<string>("janara");
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleUploadFile = async (rawFile: File) => {
    setError(null);
    setAssignSuccess(null);
    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatus("Lettura foto da cellulare...");
    setUploadBytesInfo("");

    try {
      setUploadProgress(20);
      setUploadStatus("Compressione e ottimizzazione per cellulare...");
      const file = await optimizeImageForUpload(rawFile);

      setUploadProgress(30);
      setUploadStatus("Inizio trasferimento al server...");

      const data = await uploadFileWithProgress(file, (percent, loaded, total) => {
        const mappedPercent = Math.min(95, 30 + Math.round((percent / 100) * 65));
        setUploadProgress(mappedPercent);

        const loadedFormatted =
          loaded > 1024 * 1024
            ? `${(loaded / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(loaded / 1024)} KB`;
        const totalFormatted =
          total > 1024 * 1024
            ? `${(total / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(total / 1024)} KB`;

        setUploadBytesInfo(`${loadedFormatted} di ${totalFormatted}`);
        setUploadStatus(`Invio al server (${percent}%)...`);
      });

      setUploadProgress(100);
      setUploadStatus("Foto caricata con successo!");

      setTimeout(() => {
        setUploadedUrl(data.url);
        if (onPhotoUploaded) {
          onPhotoUploaded(data.url);
        }
        setIsUploading(false);
      }, 350);
      return;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'upload da cellulare"
      );
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    e.target.value = "";
  };

  const handleCopyLink = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAssignToBoat = async () => {
    if (!uploadedUrl || !targetBoat) return;
    setAssigning(true);
    setAssignSuccess(null);
    try {
      const res = await fetch("/api/barche", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcaId: targetBoat,
          foto: uploadedUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAssignSuccess(`Foto assegnata con successo a ${targetBoat.toUpperCase()}!`);
      } else {
        throw new Error(json.error || "Errore durante l'aggiornamento della barca");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore assegnazione barca");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-4 py-3 bg-[#0a1c2a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#c99a45]/20 flex items-center justify-center text-[#c99a45]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-white">Carica Foto da Cellulare</h3>
              <p className="text-[10px] font-mono text-slate-300">Fotocamera & Galleria Smartphone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Sezione di Scatto / Selezione */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="p-4 bg-[#0a1c2a] hover:bg-[#152e42] text-white rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#c99a45]">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs">Scatta con Fotocamera</span>
              <span className="text-[10px] text-slate-300 font-sans">Apre la camera del telefono</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[#1b5b80]">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs">Scegli dalla Galleria</span>
              <span className="text-[10px] text-slate-500 font-sans">Foto recenti e file</span>
            </button>
          </div>

          {/* Box Avanzamento Caricamento */}
          {isUploading && (
            <div className="p-4 sm:p-5 bg-white border border-slate-300 rounded-lg space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1b5b80]" />
                  <span className="font-bold text-[#0a1c2a] text-xs">
                    {uploadStatus || "Caricamento in corso..."}
                  </span>
                </div>
                <span className="font-bold text-[#1b5b80] text-xs font-mono">
                  {uploadProgress}%
                </span>
              </div>

              {/* Barra di avanzamento con gradiente fluido */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-[#1b5b80] via-[#0a1c2a] to-[#c99a45] h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                  style={{ width: `${Math.max(6, uploadProgress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {uploadBytesInfo ||
                    (uploadProgress < 30
                      ? "Compressione HD per cellulare..."
                      : "Invio dati al server...")}
                </span>
                <span className="text-[#0a1c2a] font-semibold">
                  {uploadProgress === 100 ? "Salvataggio completato!" : "Attendere prego..."}
                </span>
              </div>
            </div>
          )}

          {/* Errore eventuale */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-md text-xs">
              {error}
            </div>
          )}

          {/* Risultato dell'Upload */}
          {uploadedUrl && !isUploading && (
            <div className="bg-[#fbfaf6] border border-slate-200 p-3.5 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-20 rounded-md overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                  <Image
                    src={uploadedUrl}
                    alt="Foto caricata"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Foto caricata con successo!</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                    {uploadedUrl}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-800 text-[#0a1c2a] rounded text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-[#1b5b80]" />
                      <span>{copied ? "Link Copiato!" : "Copia Link"}</span>
                    </button>
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 rounded text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Vedi</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Assegnazione Rapida alla Barca */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                  <Ship className="w-3 h-3 text-[#1b5b80]" />
                  <span>Assegna subito come foto ufficiale a:</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={targetBoat}
                    onChange={(e) => setTargetBoat(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                  >
                    <option value="janara">Janara (Gozzo a Vela Latina)</option>
                    <option value="san_michele">San Michele Arcangelo</option>
                    <option value="quandel">Quandel (Lancia)</option>
                    <option value="spigola">Spigola (Gozzo da Voga)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignToBoat}
                    disabled={assigning}
                    className="px-3 py-1.5 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] font-bold rounded text-xs cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {assigning ? "Salvataggio..." : "Salva su Barca"}
                  </button>
                </div>
                {assignSuccess && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{assignSuccess}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <span>Compressione automatica HD (max 1920px)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-800 hover:bg-slate-100 font-bold cursor-pointer"
          >
            Chiudi
          </button>
        </div>

        {/* Input Fotocamera Nascosto con capture="environment" */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Input Galleria Nascosto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
