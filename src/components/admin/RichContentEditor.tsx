"use client";

import React, { useState, useRef, useId } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
  HelpCircle,
  FileText,
} from "lucide-react";

interface RichContentEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  helperText?: string;
}

export default function RichContentEditor({
  label = "Contenuto del Testo",
  value,
  onChange,
  placeholder = "Scrivi qui il tuo articolo o racconto...",
  rows = 14,
  required = false,
  helperText,
}: RichContentEditorProps) {
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write");
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorId = useId();

  // Statistiche del testo
  const cleanText = value.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = value.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  /**
   * Inserisce o circonda il testo selezionato con i tag markdown
   */
  const insertFormatting = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = `${before}${replacement}${after}`;

    onChange(newValue);

    // Ripristina il focus e la selezione
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 10);
  };

  /**
   * Inserisce un link tramite prompt
   */
  const handleInsertLink = () => {
    const textarea = textareaRef.current;
    const selectedText = textarea ? value.substring(textarea.selectionStart, textarea.selectionEnd) : "";
    const url = window.prompt("Inserisci l'indirizzo URL del link (es. https://...):", "https://");
    if (!url) return;
    const label = selectedText || window.prompt("Testo del link da visualizzare:", "Clicca qui") || "link";
    insertFormatting(`[${label}](`, ")", url);
  };

  /**
   * Inserisce un'immagine tramite prompt
   */
  const handleInsertImage = () => {
    const url = window.prompt("Inserisci l'URL dell'immagine (es. /images/janara-crew.jpeg o https://...):", "/images/");
    if (!url) return;
    const alt = window.prompt("Descrizione didascalia dell'immagine:", "Gozzo a vela latina") || "Immagine";
    insertFormatting(`\n\n![${alt}](`, ")\n\n", url);
  };

  /**
   * Gestione scorciatoie da tastiera
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        insertFormatting("**", "**", "testo in grassetto");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        insertFormatting("*", "*", "testo in corsivo");
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Intestazione del Campo con Controlli */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={editorId} className="block text-xs uppercase font-mono tracking-widest text-[#0a1c2a] font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Modalità Editor (Scrivi / Anteprima / Affiancato) */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 border border-slate-300 rounded-xs text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setViewMode("write")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
              viewMode === "write"
                ? "bg-[#0a1c2a] text-white font-bold"
                : "text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Scrivi</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
              viewMode === "preview"
                ? "bg-[#0a1c2a] text-white font-bold"
                : "text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Anteprima</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
              viewMode === "split"
                ? "bg-[#0a1c2a] text-white font-bold"
                : "text-slate-600 hover:text-[#0a1c2a]"
            }`}
            title="Schermo Diviso (Editor + Anteprima)"
          >
            <Columns className="w-3 h-3" />
            <span>Affiancato</span>
          </button>
        </div>
      </div>

      {/* Barra degli Strumenti (Toolbar) */}
      <div className="border border-slate-300 bg-[#f8f9fa] border-b-0 p-1.5 flex flex-wrap items-center justify-between gap-1 select-none">
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            onClick={() => insertFormatting("## ", "", "Titolo di Sezione")}
            title="Intestazione 2 (Sezione principale)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("### ", "", "Sottosezione")}
            title="Intestazione 3 (Sottotitolo)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "grassetto")}
            title="Grassetto (Cmd/Ctrl + B)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "corsivo")}
            title="Corsivo (Cmd/Ctrl + I)"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting("\n- ", "", "Punto elenco")}
            title="Elenco puntato"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n1. ", "", "Punto numerato")}
            title="Elenco numerato"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n> ", "", "Citazione in risalto")}
            title="Citazione marinara"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            title="Inserisci Link web"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            title="Inserisci Immagine nel testo"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n\n---\n\n", "")}
            title="Linea orizzontale separatrice"
            className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-[#0a1c2a] px-2 py-1 rounded-xs hover:bg-slate-200 transition-colors"
          title="Guida formattazione"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guida Formattazione</span>
        </button>
      </div>

      {/* Scheda di Guida a Scomparsa */}
      {showHelp && (
        <div className="p-3 bg-[#fbfaf6] border border-slate-300 text-xs text-slate-700 space-y-2 animate-fadeIn font-mono">
          <div className="font-bold text-[#0a1c2a] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1b5b80]" />
            <span>Scorciatoie e Formattazione Rapida</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">## Titolo</code>
              <span className="text-slate-600 ml-1.5">&rarr; Titolo H2</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">### Sottotitolo</code>
              <span className="text-slate-600 ml-1.5">&rarr; Titolo H3</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">**testo**</code>
              <span className="text-slate-600 ml-1.5">&rarr; <strong>Grassetto</strong></span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">*testo*</code>
              <span className="text-slate-600 ml-1.5">&rarr; <em>Corsivo</em></span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">&gt; Citazione</code>
              <span className="text-slate-600 ml-1.5">&rarr; Box citazione</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">- elemento</code>
              <span className="text-slate-600 ml-1.5">&rarr; Elenco puntato</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">[Titolo](https://...)</code>
              <span className="text-slate-600 ml-1.5">&rarr; Collegamento ipertestuale</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">![Foto](/images/...)</code>
              <span className="text-slate-600 ml-1.5">&rarr; Immagine integrata</span>
            </div>
            <div>
              <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-bold">---</code>
              <span className="text-slate-600 ml-1.5">&rarr; Linea divisoria</span>
            </div>
          </div>
        </div>
      )}

      {/* Area Contenuto: Scrittura, Anteprima o Schermo Diviso */}
      <div className="border border-slate-300 bg-white">
        {viewMode === "write" && (
          <textarea
            ref={textareaRef}
            id={editorId}
            required={required}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-4 text-sm text-[#0a1c2a] outline-none font-mono leading-relaxed bg-white resize-y"
          />
        )}

        {viewMode === "preview" && (
          <div className="p-6 bg-white min-h-[320px] max-h-[600px] overflow-y-auto">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-slate-400 italic text-sm text-center py-12">
                Nessun contenuto da visualizzare in anteprima. Inizia a scrivere nella scheda &ldquo;Scrivi&rdquo;.
              </p>
            )}
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
            <div>
              <div className="px-3 py-1 bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-mono font-bold text-slate-600">
                Sorgente Markdown
              </div>
              <textarea
                ref={textareaRef}
                id={editorId}
                required={required}
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full p-4 text-sm text-[#0a1c2a] outline-none font-mono leading-relaxed bg-white resize-y"
              />
            </div>
            <div>
              <div className="px-3 py-1 bg-[#fbfaf6] border-b border-slate-200 text-[10px] uppercase font-mono font-bold text-[#0a1c2a]">
                Resa Visuale sul Sito
              </div>
              <div className="p-5 bg-white max-h-[500px] overflow-y-auto">
                {value.trim() ? (
                  <MarkdownRenderer content={value} />
                ) : (
                  <p className="text-slate-400 italic text-xs py-8 text-center">
                    L&apos;anteprima comparirà qui in tempo reale mentre scrivi.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra di Stato: Conteggio Parole, Caratteri e Tempo di Lettura */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1 px-1">
        <div className="flex items-center gap-4">
          <span><strong>{wordCount}</strong> parole</span>
          <span>·</span>
          <span><strong>{charCount}</strong> caratteri</span>
          <span>·</span>
          <span>~<strong>{readTimeMin}</strong> min di lettura</span>
        </div>
        {helperText && <span className="text-slate-400 italic">{helperText}</span>}
      </div>
    </div>
  );
}
