"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DocumentoIstituzionale } from "@/lib/db/types";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  ShieldCheck,
  Building2,
  Lock,
  Paperclip,
} from "lucide-react";

function CaricaDocumentoContent() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [docData, setDocData] = useState<Partial<DocumentoIstituzionale>>({
    titolo: "",
    categoria: "runts",
    descrizione: "",
    riservato: false,
    formato: "PDF",
    fileUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!docData.titolo?.trim()) {
      setNotification({ type: "error", message: "Inserisci il titolo del documento" });
      return;
    }
    if (!selectedFile && !docData.fileUrl?.trim()) {
      setNotification({ type: "error", message: "Seleziona un file da caricare oppure specifica un link URL" });
      return;
    }

    setSaving(true);
    try {
      let finalUrl = docData.fileUrl || "";
      let finalName = selectedFile?.name || "documento.pdf";
      let finalSize = "1.0 MB";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error || "Errore durante il caricamento del file");
        }
        finalUrl = uploadJson.url;
        finalName = uploadJson.fileName || selectedFile.name;
        finalSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const docToSave: DocumentoIstituzionale = {
        id: `doc-${Date.now()}`,
        titolo: docData.titolo.trim(),
        categoria: (docData.categoria as any) || "altro",
        descrizione: docData.descrizione?.trim() || "Documento ufficiale dell'archivio",
        fileName: finalName,
        fileUrl: finalUrl,
        formato: finalName.endsWith(".pdf") ? "PDF" : finalName.split(".").pop()?.toUpperCase() || "DOC",
        dimensione: finalSize,
        dataAggiornamento: new Date().toISOString().split("T")[0],
        riservato: Boolean(docData.riservato),
      };

      const res = await fetch("/api/anagrafica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_document", document: docToSave }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Errore durante il salvataggio");
      }

      setNotification({
        type: "success",
        message: "Documento aggiunto con successo all'archivio istituzionale!",
      });

      setTimeout(() => {
        router.push("/admin?tab=anagrafica");
      }, 700);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Impossibile salvare il documento" });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] pb-16">
      <AdminPageHeader
        title="Nuovo Documento Archivio RUNTS"
        subtitle="Carica e cataloga un documento ufficiale, statuto o certificato per l'archivio dell'associazione"
        backHref="/admin?tab=anagrafica"
        backLabel="Torna all'Anagrafica"
        onSave={handleSubmit}
        isSaving={saving}
        saveLabel="Salva Documento"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {notification && (
          <div
            className={`p-4 border text-xs font-mono flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                  Dati & Classificazione Documento
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Organizza e cataloga il documento nell&apos;archivio RUNTS / Direttivo.
                </p>
              </div>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Titolo Documento *
              </label>
              <input
                type="text"
                required
                placeholder="es. Ricevuta Iscrizione RUNTS 2026, Documento Identità Presidente..."
                value={docData.titolo || ""}
                onChange={(e) => setDocData({ ...docData, titolo: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Categoria Archivio
                </label>
                <select
                  value={docData.categoria}
                  onChange={(e) => setDocData({ ...docData, categoria: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                >
                  <option value="runts">🏛️ RUNTS & Istituzionali</option>
                  <option value="presidente">👤 Personali Presidente & Direttivo</option>
                  <option value="fiscale_bancario">💳 Fiscali & Coordinate Bancarie</option>
                  <option value="dossier">⛵ Dossier & Master Progetti</option>
                  <option value="altro">📁 Altro / Allegato Generico</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Livello di Riservatezza
                </label>
                <select
                  value={docData.riservato ? "true" : "false"}
                  onChange={(e) => setDocData({ ...docData, riservato: e.target.value === "true" })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
                >
                  <option value="false">Documento Pubblico / Scaricabile</option>
                  <option value="true">🔒 Riservato Amministrazione</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Descrizione o Estremi di Protocollo
              </label>
              <textarea
                rows={3}
                placeholder="Specificare note, validità temporale, scadenza o estremi di repertorio notarile/RUNTS..."
                value={docData.descrizione || ""}
                onChange={(e) => setDocData({ ...docData, descrizione: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0a1c2a] bg-white"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-300 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-semibold text-[#0a1c2a]">
                  File Allegato
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Carica un file (PDF, scansione, documento) oppure indica una risorsa esterna.
                </p>
              </div>
              <Paperclip className="w-5 h-5 text-slate-400" />
            </div>

            <div className="p-4 sm:p-6 border-2 border-dashed border-slate-300 bg-[#fbfaf6] text-center space-y-3">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-mono text-slate-600">
                Seleziona file da archiviare (PDF, DOCX, scansioni max 25MB)
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
                className="block mx-auto text-xs font-mono file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#0a1c2a] file:text-white hover:file:bg-[#b8860b] cursor-pointer"
              />
              {selectedFile && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 font-medium">
                  File selezionato: <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                Oppure URL Diretto del File
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={docData.fileUrl || ""}
                onChange={(e) => setDocData({ ...docData, fileUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0a1c2a] bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin?tab=anagrafica")}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-xs font-mono font-semibold transition-colors text-center cursor-pointer"
            >
              Annulla e Torna Indietro
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Caricamento in corso..." : "Salva Documento nell'Archivio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CaricaDocumentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">
          Caricamento...
        </div>
      }
    >
      <CaricaDocumentoContent />
    </Suspense>
  );
}
