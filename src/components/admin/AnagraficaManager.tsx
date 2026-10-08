"use client";

import { useState, useMemo } from "react";
import { AnagraficaAssociazione, DocumentoIstituzionale } from "@/lib/db/types";
import {
  FileText,
  Download,
  Upload,
  ShieldCheck,
  Building2,
  CreditCard,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  FileCheck,
  Award,
  Sparkles,
  Info,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";

interface AnagraficaManagerProps {
  initialData: AnagraficaAssociazione;
  onReload: () => void;
  showToast: (type: "success" | "error", message: string) => void;
}

export default function AnagraficaManager({
  initialData,
  onReload,
  showToast,
}: AnagraficaManagerProps) {
  const [data, setData] = useState<AnagraficaAssociazione>(initialData);
  const [subTab, setSubTab] = useState<"documenti" | "ente" | "runts" | "presidente" | "banca">("documenti");
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("tutti");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal caricamento nuovo documento
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<DocumentoIstituzionale>>({
    titolo: "",
    categoria: "runts",
    descrizione: "",
    riservato: false,
    formato: "PDF",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Edit Mode per le varie sezioni
  const [isEditingEnte, setIsEditingEnte] = useState(false);
  const [isEditingRunts, setIsEditingRunts] = useState(false);
  const [isEditingPres, setIsEditingPres] = useState(false);
  const [isEditingBanca, setIsEditingBanca] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  // Copia negli appunti con feedback visivo
  const copyToClipboard = (text: string, labelKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(labelKey);
    showToast("success", `Copiato: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtro Documenti
  const filteredDocs = useMemo(() => {
    if (!data.documenti) return [];
    if (docCategoryFilter === "tutti") return data.documenti;
    return data.documenti.filter((d) => d.categoria === docCategoryFilter);
  }, [data.documenti, docCategoryFilter]);

  // Conteggi per categorie documenti
  const docCounts = useMemo(() => {
    const docs = data.documenti || [];
    return {
      tutti: docs.length,
      presidente: docs.filter((d) => d.categoria === "presidente").length,
      runts: docs.filter((d) => d.categoria === "runts").length,
      fiscale_bancario: docs.filter((d) => d.categoria === "fiscale_bancario").length,
      dossier: docs.filter((d) => d.categoria === "dossier").length,
      altro: docs.filter((d) => d.categoria === "altro").length,
    };
  }, [data.documenti]);

  // Gestione Upload Nuovo Documento
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.titolo?.trim()) {
      showToast("error", "Inserisci il titolo del documento");
      return;
    }
    if (!selectedFile && !newDoc.fileUrl) {
      showToast("error", "Seleziona un file da caricare o indica una URL");
      return;
    }

    setUploading(true);
    try {
      let finalUrl = newDoc.fileUrl || "";
      let finalName = newDoc.fileName || selectedFile?.name || "documento.pdf";
      let finalSize = newDoc.dimensione || "1.0 MB";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error || "Errore nel caricamento del file");
        }
        finalUrl = uploadJson.url;
        finalName = uploadJson.fileName || selectedFile.name;
        finalSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const docToSave: DocumentoIstituzionale = {
        id: `doc-${Date.now()}`,
        titolo: newDoc.titolo.trim(),
        categoria: (newDoc.categoria as any) || "altro",
        descrizione: newDoc.descrizione?.trim() || "Documento ufficiale dell'archivio",
        fileName: finalName,
        fileUrl: finalUrl,
        formato: finalName.endsWith(".pdf") ? "PDF" : finalName.split(".").pop()?.toUpperCase() || "DOC",
        dimensione: finalSize,
        dataAggiornamento: new Date().toISOString().split("T")[0],
        riservato: Boolean(newDoc.riservato),
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

      showToast("success", "Documento inserito con successo nell'archivio");
      setData(resJson.data);
      setUploadModalOpen(false);
      setNewDoc({ titolo: "", categoria: "runts", descrizione: "", riservato: false, formato: "PDF" });
      setSelectedFile(null);
      onReload();
    } catch (err: any) {
      showToast("error", err.message || "Errore durante l'operazione");
    } finally {
      setUploading(false);
    }
  };

  // Eliminazione Documento
  const handleDeleteDoc = async (docId: string, docTitolo: string) => {
    if (!confirm(`Sei sicuro di voler rimuovere dall'archivio il documento "${docTitolo}"?`)) return;

    try {
      const res = await fetch("/api/anagrafica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_document", id: docId }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Errore eliminazione");
      }
      showToast("success", "Documento rimosso");
      setData(resJson.data);
      onReload();
    } catch (err: any) {
      showToast("error", err.message || "Errore");
    }
  };

  // Salvataggio Sezione Modificata
  const handleSaveSection = async (sectionKey: "ente" | "runts" | "presidente" | "banca") => {
    setSavingSection(true);
    try {
      const res = await fetch("/api/anagrafica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Errore durante il salvataggio");
      }
      showToast("success", "Dati salvati con successo");
      setData(resJson.data);
      if (sectionKey === "ente") setIsEditingEnte(false);
      if (sectionKey === "runts") setIsEditingRunts(false);
      if (sectionKey === "presidente") setIsEditingPres(false);
      if (sectionKey === "banca") setIsEditingBanca(false);
      onReload();
    } catch (err: any) {
      showToast("error", err.message || "Errore salvataggio");
    } finally {
      setSavingSection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Barra Istituzionale e Dati Rapidi con 1-Click Copy */}
      <div className="bg-white border border-slate-300 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold bg-[#0a1c2a] text-white">
                Archivio Anagrafico & RUNTS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {data.runts?.statoIscrizione || "Iscritta al RUNTS"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold bg-amber-50 text-amber-800 border border-amber-300">
                D.D. Campania 239/2020
              </span>
            </div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-[#0a1c2a] uppercase tracking-wide">
              {data.ragioneSociale}
            </h1>
            <p className="text-xs text-slate-600 font-mono mt-1">
              {data.formaGiuridica} · Fondata nel {data.annoFondazione} · Monte di Procida (NA)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-[#0a1c2a] hover:bg-[#142838] text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carica Documento</span>
            </button>
            <a
              href="/api/anagrafica/download?doc=runts-iscrizione"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Scheda RUNTS</span>
            </a>
          </div>
        </div>

        {/* 1-Click Copy Chips Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Codice Fiscale Ente */}
          <div
            onClick={() => copyToClipboard(data.codiceFiscale, "cf_ente")}
            className="p-3 bg-[#fbfaf6] border border-slate-200 hover:border-[#0a1c2a] cursor-pointer transition-colors group relative"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
              Codice Fiscale Ente
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs font-bold text-[#0a1c2a]">
                {data.codiceFiscale}
              </span>
              {copiedKey === "cf_ente" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0a1c2a]" />
              )}
            </div>
          </div>

          {/* Repertorio RUNTS */}
          <div
            onClick={() => copyToClipboard(data.runts?.numeroRepertorio || "RUNTS-108429/2022", "runts_rep")}
            className="p-3 bg-[#fbfaf6] border border-slate-200 hover:border-[#0a1c2a] cursor-pointer transition-colors group"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
              Repertorio RUNTS
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs font-bold text-[#0a1c2a]">
                {data.runts?.numeroRepertorio}
              </span>
              {copiedKey === "runts_rep" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0a1c2a]" />
              )}
            </div>
          </div>

          {/* IBAN Ufficiale */}
          <div
            onClick={() => copyToClipboard(data.banca?.iban, "iban")}
            className="p-3 bg-[#fbfaf6] border border-slate-200 hover:border-[#0a1c2a] cursor-pointer transition-colors group"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
              IBAN Accrediti BNL
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs font-bold text-[#0a1c2a] truncate max-w-[130px]">
                {data.banca?.iban}
              </span>
              {copiedKey === "iban" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0a1c2a]" />
              )}
            </div>
          </div>

          {/* PEC Ufficiale */}
          <div
            onClick={() => copyToClipboard(data.pec, "pec")}
            className="p-3 bg-[#fbfaf6] border border-slate-200 hover:border-[#0a1c2a] cursor-pointer transition-colors group"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
              PEC Istituzionale
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs font-bold text-[#0a1c2a] truncate max-w-[130px]">
                {data.pec}
              </span>
              {copiedKey === "pec" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0a1c2a]" />
              )}
            </div>
          </div>

          {/* Presidente & Legale Rappresentante */}
          <div
            onClick={() => copyToClipboard(data.presidente?.codiceFiscale, "cf_pres")}
            className="p-3 bg-[#fbfaf6] border border-slate-200 hover:border-[#0a1c2a] cursor-pointer transition-colors group"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
              Presidente: {data.presidente?.nomeCompleto?.split(" ")[0]}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs font-bold text-[#0a1c2a] truncate max-w-[130px]">
                {data.presidente?.codiceFiscale}
              </span>
              {copiedKey === "cf_pres" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0a1c2a]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sotto-Navigazione Modulo Anagrafica */}
      <div className="flex items-center gap-1 border-b border-slate-300 pb-0 overflow-x-auto">
        <button
          onClick={() => setSubTab("documenti")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            subTab === "documenti"
              ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
              : "border-transparent text-slate-500 hover:text-[#0a1c2a]"
          }`}
        >
          <FolderDownIcon className="w-4 h-4 text-[#c99a45]" />
          <span>Archivio Documenti ({data.documenti?.length || 0})</span>
        </button>

        <button
          onClick={() => setSubTab("presidente")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            subTab === "presidente"
              ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
              : "border-transparent text-slate-500 hover:text-[#0a1c2a]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Presidente & Direttivo</span>
        </button>

        <button
          onClick={() => setSubTab("runts")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            subTab === "runts"
              ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
              : "border-transparent text-slate-500 hover:text-[#0a1c2a]"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RUNTS & Riconoscimenti</span>
        </button>

        <button
          onClick={() => setSubTab("ente")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            subTab === "ente"
              ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
              : "border-transparent text-slate-500 hover:text-[#0a1c2a]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dati Ente & Sede</span>
        </button>

        <button
          onClick={() => setSubTab("banca")}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
            subTab === "banca"
              ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
              : "border-transparent text-slate-500 hover:text-[#0a1c2a]"
          }`}
        >
          <CreditCard className="w-4 h-4 text-sky-700" />
          <span>Coordinate Bancarie</span>
        </button>
      </div>

      {/* ==============================================================
          SEZIONE 1: ARCHIVIO DOCUMENTALE SCARICABILE
      ============================================================== */}
      {subTab === "documenti" && (
        <div className="space-y-6">
          {/* Filtro per categoria documenti e pulsante Aggiungi */}
          <div className="bg-white border border-slate-300 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setDocCategoryFilter("tutti")}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-colors cursor-pointer border ${
                  docCategoryFilter === "tutti"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a]"
                    : "bg-[#fbfaf6] text-slate-600 hover:text-[#0a1c2a] border-slate-300"
                }`}
              >
                Tutti ({docCounts.tutti})
              </button>

              <button
                onClick={() => setDocCategoryFilter("presidente")}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  docCategoryFilter === "presidente"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a]"
                    : "bg-[#fbfaf6] text-slate-600 hover:text-[#0a1c2a] border-slate-300"
                }`}
              >
                <span>👤 Personali Presidente</span>
                <span className="text-[10px] opacity-75">({docCounts.presidente})</span>
              </button>

              <button
                onClick={() => setDocCategoryFilter("runts")}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  docCategoryFilter === "runts"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a]"
                    : "bg-[#fbfaf6] text-slate-600 hover:text-[#0a1c2a] border-slate-300"
                }`}
              >
                <span>🏛️ RUNTS & Statuto</span>
                <span className="text-[10px] opacity-75">({docCounts.runts})</span>
              </button>

              <button
                onClick={() => setDocCategoryFilter("fiscale_bancario")}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  docCategoryFilter === "fiscale_bancario"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a]"
                    : "bg-[#fbfaf6] text-slate-600 hover:text-[#0a1c2a] border-slate-300"
                }`}
              >
                <span>💳 Fiscali & Bancari</span>
                <span className="text-[10px] opacity-75">({docCounts.fiscale_bancario})</span>
              </button>

              <button
                onClick={() => setDocCategoryFilter("dossier")}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  docCategoryFilter === "dossier"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a]"
                    : "bg-[#fbfaf6] text-slate-600 hover:text-[#0a1c2a] border-slate-300"
                }`}
              >
                <span>⛵ Dossier & Master</span>
                <span className="text-[10px] opacity-75">({docCounts.dossier})</span>
              </button>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-[#0a1c2a] hover:bg-[#152e42] text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuovo Documento</span>
            </button>
          </div>

          {/* Griglia Documenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const isPres = doc.categoria === "presidente";
              const isRunts = doc.categoria === "runts";
              const isFisc = doc.categoria === "fiscale_bancario";
              const isDoss = doc.categoria === "dossier";

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-300 p-5 flex flex-col justify-between hover:border-[#0a1c2a] transition-all shadow-sm group"
                >
                  <div>
                    {/* Header card documento */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 flex items-center justify-center text-xs font-mono font-bold ${
                            isPres
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : isRunts
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isFisc
                              ? "bg-sky-100 text-sky-900 border border-sky-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {doc.formato || "PDF"}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
                          {isPres && "Personale Presidente"}
                          {isRunts && "Istituzionale RUNTS"}
                          {isFisc && "Fiscale / Banca"}
                          {isDoss && "Dossier Ufficiale"}
                          {doc.categoria === "altro" && "Allegato"}
                        </span>
                      </div>

                      {doc.riservato && (
                        <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Riservato
                        </span>
                      )}
                    </div>

                    {/* Titolo e descrizione */}
                    <h3 className="font-bold text-sm text-[#0a1c2a] mb-2 leading-snug group-hover:text-[#c99a45] transition-colors">
                      {doc.titolo}
                    </h3>
                    <p className="text-xs text-slate-600 font-light leading-relaxed mb-4">
                      {doc.descrizione}
                    </p>
                  </div>

                  {/* Footer card con metadati e azioni */}
                  <div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400 mb-3">
                      <span>Aggiornato: {doc.dataAggiornamento}</span>
                      <span>{doc.dimensione || "PDF Ufficiale"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-[#0a1c2a] hover:bg-[#173045] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#c99a45]" />
                        <span>Scarica / Apri</span>
                      </a>

                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}${doc.fileUrl}`, doc.id)}
                        title="Copia link documento"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#0a1c2a] border border-slate-300 transition-colors cursor-pointer"
                      >
                        {copiedKey === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.titolo)}
                        title="Rimuovi dall'archivio"
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-700 border border-slate-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDocs.length === 0 && (
            <div className="bg-white border border-slate-300 p-12 text-center text-slate-500 font-mono text-xs">
              Nessun documento trovato in questa categoria.
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          SEZIONE 2: DATI PRESIDENTE & CONSIGLIO DIRETTIVO
      ============================================================== */}
      {subTab === "presidente" && (
        <div className="space-y-6">
          {/* Card Presidente Legale Rappresentante */}
          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0a1c2a] text-[#c99a45] flex items-center justify-center font-bold font-['Cinzel'] text-lg">
                  AP
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Legale Rappresentante Ufficiale
                  </span>
                  <h2 className="text-lg font-bold text-[#0a1c2a]">
                    {data.presidente.nomeCompleto}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/anagrafica/download?doc=presidente-ci"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#0a1c2a] text-white hover:bg-[#142838] text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#c99a45]" />
                  <span>Scarica Scheda CIE</span>
                </a>
                <button
                  onClick={() => setIsEditingPres(!isEditingPres)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingPres ? "Annulla" : "Modifica Dati"}</span>
                </button>
              </div>
            </div>

            {/* Dati o Form Modifica Presidente */}
            {isEditingPres ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Nome e Cognome
                    </label>
                    <input
                      type="text"
                      value={data.presidente.nomeCompleto}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, nomeCompleto: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Codice Fiscale
                    </label>
                    <input
                      type="text"
                      value={data.presidente.codiceFiscale}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, codiceFiscale: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Qualifica / Professione
                    </label>
                    <input
                      type="text"
                      value={data.presidente.qualificaProfessionale}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, qualificaProfessionale: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Data di Nascita
                    </label>
                    <input
                      type="date"
                      value={data.presidente.dataNascita}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, dataNascita: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Luogo di Nascita
                    </label>
                    <input
                      type="text"
                      value={data.presidente.luogoNascita}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, luogoNascita: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Telefono
                    </label>
                    <input
                      type="text"
                      value={data.presidente.telefono}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, telefono: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={data.presidente.email}
                      onChange={(e) =>
                        setData({
                          ...data,
                          presidente: { ...data.presidente, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-[#0a1c2a] uppercase font-mono mb-2">
                    Dati Documento d&apos;Identità (CIE)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                        Numero Documento
                      </label>
                      <input
                        type="text"
                        value={data.presidente.documentoIdentita.numero}
                        onChange={(e) =>
                          setData({
                            ...data,
                            presidente: {
                              ...data.presidente,
                              documentoIdentita: {
                                ...data.presidente.documentoIdentita,
                                numero: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                        Ente Rilascio
                      </label>
                      <input
                        type="text"
                        value={data.presidente.documentoIdentita.rilasciatoDa}
                        onChange={(e) =>
                          setData({
                            ...data,
                            presidente: {
                              ...data.presidente,
                              documentoIdentita: {
                                ...data.presidente.documentoIdentita,
                                rilasciatoDa: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                        Data Scadenza
                      </label>
                      <input
                        type="date"
                        value={data.presidente.documentoIdentita.dataScadenza}
                        onChange={(e) =>
                          setData({
                            ...data,
                            presidente: {
                              ...data.presidente,
                              documentoIdentita: {
                                ...data.presidente.documentoIdentita,
                                dataScadenza: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                        Scadenza Mandato
                      </label>
                      <input
                        type="date"
                        value={data.presidente.scadenzaMandato}
                        onChange={(e) =>
                          setData({
                            ...data,
                            presidente: { ...data.presidente, scadenzaMandato: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => handleSaveSection("presidente")}
                    disabled={savingSection}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSection ? "Salvataggio..." : "Salva Dati Presidente"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Dati Anagrafici & Contatti
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Codice Fiscale</span>
                    <span className="font-mono font-bold text-sm text-[#0a1c2a]">{data.presidente.codiceFiscale}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Nascita</span>
                    <span>{data.presidente.dataNascita} · {data.presidente.luogoNascita}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Residenza</span>
                    <span>{data.presidente.residenza}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Telefono Diretto</span>
                    <span className="font-mono">{data.presidente.telefono}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Documento d&apos;Identità Ufficiale (CIE)
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Tipo Documento</span>
                    <span>{data.presidente.documentoIdentita.tipo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Numero CIE</span>
                    <span className="font-mono font-bold text-sm text-[#0a1c2a]">{data.presidente.documentoIdentita.numero}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Rilascio & Scadenza</span>
                    <span>{data.presidente.documentoIdentita.dataRilascio} → <strong>{data.presidente.documentoIdentita.dataScadenza}</strong></span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Rilasciato da</span>
                    <span>{data.presidente.documentoIdentita.rilasciatoDa}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Mandato & Rappresentanza
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Qualifica Istituzionale</span>
                    <span className="font-semibold">{data.presidente.qualificaProfessionale}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Data Nomina Ufficiale</span>
                    <span className="font-mono">{data.presidente.dataNomina}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Scadenza Mandato Attuale</span>
                    <span className="font-mono font-bold text-emerald-800">{data.presidente.scadenzaMandato}</span>
                  </div>
                  <div className="pt-2">
                    <a
                      href="/api/anagrafica/download?doc=verbale-nomina"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-[#0a1c2a] hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Vedi Estratto Verbale Nomina</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consiglio Direttivo */}
          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-[#0a1c2a] text-sm uppercase font-mono">
                  Consiglio Direttivo in Carica ({data.consiglioDirettivo?.length || 0} Membri)
                </h3>
                <span className="text-xs text-slate-500">
                  Organo esecutivo e di amministrazione dell&apos;Associazione ex D.Lgs. 117/2017
                </span>
              </div>
              <a
                href="/api/anagrafica/download?doc=verbale-nomina"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Scarica Verbale Organigramma</span>
              </a>
            </div>

            <div className="mt-4 divide-y divide-slate-200">
              {data.consiglioDirettivo?.map((membro) => (
                <div key={membro.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#0a1c2a] block text-sm">{membro.nome}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{membro.ruolo}</span>
                    {membro.note && (
                      <span className="text-slate-400 block text-[11px] italic mt-0.5">{membro.note}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                    {membro.telefono && <span>{membro.telefono}</span>}
                    {membro.email && <span>{membro.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          SEZIONE 3: RUNTS & RICONOSCIMENTI REGIONALI
      ============================================================== */}
      {subTab === "runts" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold block">
                  Ministero del Lavoro e delle Politiche Sociali
                </span>
                <h2 className="text-lg font-bold text-[#0a1c2a]">
                  Registro Unico Nazionale del Terzo Settore (RUNTS)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/anagrafica/download?doc=runts-iscrizione"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#0a1c2a] hover:bg-[#152e42] text-white text-xs font-mono font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#c99a45]" />
                  <span>Certificato RUNTS</span>
                </a>
                <button
                  onClick={() => setIsEditingRunts(!isEditingRunts)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingRunts ? "Annulla" : "Modifica"}</span>
                </button>
              </div>
            </div>

            {isEditingRunts ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Numero Repertorio RUNTS
                    </label>
                    <input
                      type="text"
                      value={data.runts.numeroRepertorio}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, numeroRepertorio: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Sezione Registro
                    </label>
                    <input
                      type="text"
                      value={data.runts.sezione}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, sezione: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Data Provvedimento Iscrizione
                    </label>
                    <input
                      type="date"
                      value={data.runts.dataIscrizione}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, dataIscrizione: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Ente Competente / Regione
                    </label>
                    <input
                      type="text"
                      value={data.runts.enteCompetente}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, enteCompetente: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Decreto Riconoscimento Patrimonio Immateriale
                    </label>
                    <input
                      type="text"
                      value={data.runts.decretoRegionaleCampania}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, decretoRegionaleCampania: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Polizza Assicurativa RC
                    </label>
                    <input
                      type="text"
                      value={data.runts.polizzaAssicurativa}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, polizzaAssicurativa: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Compagnia Assicurativa
                    </label>
                    <input
                      type="text"
                      value={data.runts.compagniaAssicurativa}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, compagniaAssicurativa: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                      Scadenza Copertura RC
                    </label>
                    <input
                      type="date"
                      value={data.runts.scadenzaPolizza}
                      onChange={(e) =>
                        setData({
                          ...data,
                          runts: { ...data.runts, scadenzaPolizza: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => handleSaveSection("runts")}
                    disabled={savingSection}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSection ? "Salvataggio..." : "Salva Dati RUNTS"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4 bg-[#fbfaf6] p-5 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      Iscrizione RUNTS
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {data.runts.statoIscrizione}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Numero di Repertorio</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-base text-[#0a1c2a]">
                        {data.runts.numeroRepertorio}
                      </span>
                      <button
                        onClick={() => copyToClipboard(data.runts.numeroRepertorio, "runts_rep")}
                        className="text-slate-400 hover:text-[#0a1c2a]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Sezione</span>
                    <span className="font-semibold text-[#0a1c2a]">{data.runts.sezione}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Data Iscrizione & Ufficio</span>
                    <span>{data.runts.dataIscrizione} · {data.runts.enteCompetente}</span>
                  </div>
                </div>

                <div className="space-y-4 bg-[#fbfaf6] p-5 border border-slate-200">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Patrimonio Immateriale & Polizze
                  </span>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Riconoscimento Regionale IPIC
                    </span>
                    <span className="font-bold text-amber-900 block mt-0.5">
                      {data.runts.decretoRegionaleCampania}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {data.runts.patrimonioImmaterialeDettaglio}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Polizza Assicurativa RC</span>
                    <span className="font-mono font-semibold">{data.runts.polizzaAssicurativa} ({data.runts.compagniaAssicurativa})</span>
                    <span className="block text-[11px] text-slate-500 font-mono mt-0.5">
                      Valida fino al: {data.runts.scadenzaPolizza}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
          SEZIONE 4: DATI ENTE & SEDE LEGALE
      ============================================================== */}
      {subTab === "ente" && (
        <div className="bg-white border border-slate-300 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                Anagrafica Fiscale & Recapiti Istituzionali
              </span>
              <h2 className="text-lg font-bold text-[#0a1c2a]">
                Dati Societari & Sede
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/anagrafica/download?doc=fiscale-cf"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#0a1c2a] text-white text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#c99a45]" />
                <span>Certificato CF Agenzia Entrate</span>
              </a>
              <button
                onClick={() => setIsEditingEnte(!isEditingEnte)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingEnte ? "Annulla" : "Modifica Dati"}</span>
              </button>
            </div>
          </div>

          {isEditingEnte ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Ragione Sociale Completa
                  </label>
                  <input
                    type="text"
                    value={data.ragioneSociale}
                    onChange={(e) => setData({ ...data, ragioneSociale: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Forma Giuridica
                  </label>
                  <input
                    type="text"
                    value={data.formaGiuridica}
                    onChange={(e) => setData({ ...data, formaGiuridica: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={data.codiceFiscale}
                    onChange={(e) => setData({ ...data, codiceFiscale: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Partita IVA
                  </label>
                  <input
                    type="text"
                    value={data.partitaIva || ""}
                    onChange={(e) => setData({ ...data, partitaIva: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Codice Destinatario SDI
                  </label>
                  <input
                    type="text"
                    value={data.codiceDestinatarioSdi}
                    onChange={(e) => setData({ ...data, codiceDestinatarioSdi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Anno di Fondazione
                  </label>
                  <input
                    type="number"
                    value={data.annoFondazione}
                    onChange={(e) => setData({ ...data, annoFondazione: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Indirizzo Sede
                  </label>
                  <input
                    type="text"
                    value={data.indirizzo}
                    onChange={(e) => setData({ ...data, indirizzo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Comune & CAP
                  </label>
                  <input
                    type="text"
                    value={`${data.comune} (${data.provincia}), ${data.cap}`}
                    onChange={(e) => setData({ ...data, comune: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Approdo Nautico Operativo
                  </label>
                  <input
                    type="text"
                    value={data.approdoNautico}
                    onChange={(e) => setData({ ...data, approdoNautico: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    PEC Ufficiale
                  </label>
                  <input
                    type="text"
                    value={data.pec}
                    onChange={(e) => setData({ ...data, pec: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Email di Contatto
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Recapito Telefonico
                  </label>
                  <input
                    type="text"
                    value={data.telefono}
                    onChange={(e) => setData({ ...data, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSaveSection("ente")}
                  disabled={savingSection}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSection ? "Salvataggio..." : "Salva Dati Ente"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Identificazione Fiscale
                </span>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Codice Fiscale</span>
                  <span className="font-mono font-bold text-sm text-[#0a1c2a]">{data.codiceFiscale}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Partita IVA</span>
                  <span className="font-mono">{data.partitaIva || "Non presente"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Codice SDI Fatturazione</span>
                  <span className="font-mono font-bold">{data.codiceDestinatarioSdi}</span>
                </div>
              </div>

              <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Sede & Posizione Demaniale
                </span>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Sede Legale</span>
                  <span>{data.indirizzo}, {data.cap} {data.comune} ({data.provincia})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Approdo Operativo</span>
                  <span>{data.approdoNautico}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Coordinate GPS</span>
                  <span className="font-mono">{data.coordinateGeografiche}</span>
                </div>
              </div>

              <div className="space-y-3 bg-[#fbfaf6] p-4 border border-slate-200">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Canali di Comunicazione
                </span>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">PEC Ufficiale</span>
                  <span className="font-mono font-bold text-[#0a1c2a]">{data.pec}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Email Istituzionale</span>
                  <span className="font-mono">{data.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Telefono</span>
                  <span className="font-mono">{data.telefono}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          SEZIONE 5: DATI BANCARI & TESORERIA
      ============================================================== */}
      {subTab === "banca" && (
        <div className="bg-white border border-slate-300 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                Tesoreria, Quote Associative & Bandi Pubblici
              </span>
              <h2 className="text-lg font-bold text-[#0a1c2a]">
                Coordinate Bancarie Ufficiali
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/anagrafica/download?doc=banca-iban"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#0a1c2a] text-white text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#c99a45]" />
                <span>Scarica Scheda IBAN Stampabile</span>
              </a>
              <button
                onClick={() => setIsEditingBanca(!isEditingBanca)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a1c2a] border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingBanca ? "Annulla" : "Modifica"}</span>
              </button>
            </div>
          </div>

          {isEditingBanca ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Istituto Bancario
                  </label>
                  <input
                    type="text"
                    value={data.banca.istituto}
                    onChange={(e) =>
                      setData({
                        ...data,
                        banca: { ...data.banca, istituto: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Filiale / Agenzia
                  </label>
                  <input
                    type="text"
                    value={data.banca.filiale}
                    onChange={(e) =>
                      setData({
                        ...data,
                        banca: { ...data.banca, filiale: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                  Codice IBAN
                </label>
                <input
                  type="text"
                  value={data.banca.iban}
                  onChange={(e) =>
                    setData({
                      ...data,
                      banca: { ...data.banca, iban: e.target.value.replace(/\s+/g, "").toUpperCase() },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Codice BIC / SWIFT
                  </label>
                  <input
                    type="text"
                    value={data.banca.bicSwift}
                    onChange={(e) =>
                      setData({
                        ...data,
                        banca: { ...data.banca, bicSwift: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                    Intestatario del Conto
                  </label>
                  <input
                    type="text"
                    value={data.banca.intestatario}
                    onChange={(e) =>
                      setData({
                        ...data,
                        banca: { ...data.banca, intestatario: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleSaveSection("banca")}
                  disabled={savingSection}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSection ? "Salvataggio..." : "Salva Coordinate"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="bg-[#fbfaf6] p-6 border border-slate-200">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-2">
                  Codice IBAN Principale
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-300">
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-[#0a1c2a]">
                    {data.banca.iban}
                  </span>
                  <button
                    onClick={() => copyToClipboard(data.banca.iban, "iban_main")}
                    className="px-4 py-2 bg-[#0a1c2a] hover:bg-[#142838] text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedKey === "iban_main" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "iban_main" ? "Copiato!" : "Copia IBAN"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Istituto Bancario</span>
                    <span className="font-semibold text-sm text-[#0a1c2a]">{data.banca.istituto}</span>
                    <span className="block text-slate-500 text-[11px] mt-0.5">{data.banca.filiale}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Codice BIC / SWIFT</span>
                    <span className="font-mono font-bold text-sm text-[#0a1c2a]">{data.banca.bicSwift}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Intestazione Conto</span>
                    <span className="font-semibold text-sm text-[#0a1c2a]">{data.banca.intestatario}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-[#fbfaf6] border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Causale Bonifico Iscrizione Soci
                  </span>
                  <p className="text-slate-700 bg-white p-2.5 border border-slate-200 text-[11px]">
                    {data.banca.causaleIscrizione}
                  </p>
                </div>
                <div className="p-4 bg-[#fbfaf6] border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Causale Donazioni & Progetti
                  </span>
                  <p className="text-slate-700 bg-white p-2.5 border border-slate-200 text-[11px]">
                    {data.banca.causaleDonazione}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          MODALE CARICAMENTO NUOVO DOCUMENTO
      ============================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-t sm:border border-slate-300 max-w-lg w-full h-[96vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-none shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Sticky Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#c99a45]" />
                <h3 className="font-['Cinzel'] font-bold text-sm text-[#0a1c2a] uppercase">
                  Aggiungi Documento all&apos;Archivio
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block mb-1">
                  Titolo Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Ricevuta Iscrizione RUNTS 2026, Documento Identità..."
                  value={newDoc.titolo || ""}
                  onChange={(e) => setNewDoc({ ...newDoc, titolo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={newDoc.categoria}
                    onChange={(e) => setNewDoc({ ...newDoc, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="presidente">👤 Personali Presidente</option>
                    <option value="runts">🏛️ RUNTS & Istituzionali</option>
                    <option value="fiscale_bancario">💳 Fiscali & Bancari</option>
                    <option value="dossier">⛵ Dossier & Master</option>
                    <option value="altro">📁 Altro / Allegato</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block mb-1">
                    Livello Riservatezza
                  </label>
                  <select
                    value={newDoc.riservato ? "true" : "false"}
                    onChange={(e) => setNewDoc({ ...newDoc, riservato: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="false">Documento Pubblico / Condivisibile</option>
                    <option value="true">🔒 Riservato Amministrazione</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block mb-1">
                  Descrizione o Note di Utilizzo
                </label>
                <textarea
                  rows={2}
                  placeholder="Note, estremi protocollo, validità temporale o istruzioni d'uso..."
                  value={newDoc.descrizione || ""}
                  onChange={(e) => setNewDoc({ ...newDoc, descrizione: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block mb-1">
                  Carica File (PDF, DOC, DOCX, Scansione max 25MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                  className="w-full text-xs font-mono file:mr-4 file:py-2 file:px-3 file:border-0 file:text-xs file:font-mono file:font-semibold file:bg-[#0a1c2a] file:text-white hover:file:bg-[#152e42] cursor-pointer"
                />
                {selectedFile && (
                  <span className="text-[11px] font-mono text-emerald-700 block mt-1">
                    File selezionato: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>

              </div>

              {/* Sticky Bottom Footer */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs font-mono text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0a1c2a] hover:bg-[#152e42] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#c99a45]" />
                  <span>{uploading ? "Caricamento in corso..." : "Salva nell'Archivio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M12 10v6" />
      <path d="m9 13 3 3 3-3" />
    </svg>
  );
}
