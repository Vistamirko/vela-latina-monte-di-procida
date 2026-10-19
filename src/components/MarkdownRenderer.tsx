import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parser e renderer leggero e sicuro per contenuti formattati in Markdown:
 * Supporta:
 * - Titoli H2 (## ) e H3 (### )
 * - Grassetto (**testo**) e Corsivo (*testo* / _testo_)
 * - Citazioni (> citazione)
 * - Elenchi puntati (- o *) ed elenchi numerati (1. 2.)
 * - Separatori orizzontali (---)
 * - Link ([testo](url))
 * - Immagini (![alt](url))
 */
export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Suddivide il testo in blocchi separati da doppie righe vuote o righe singole per titoli/liste
  const rawBlocks = content.split(/\n\s*\n/);

  const renderInline = (text: string): React.ReactNode[] => {
    // Regex per link, immagini, grassetto, corsivo
    // Gestione a passaggi sicuri
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Pattern combinato per token inline:
    // 1. Immagine: !\[(.*?)\]\((.*?)\)
    // 2. Link: \[(.*?)\]\((.*?)\)
    // 3. Grassetto: \*\*(.*?)\*\*
    // 4. Corsivo: \*(.*?)\* o _(.*?)_
    const inlineRegex = /(!?\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/;

    while (remaining.length > 0) {
      const match = remaining.match(inlineRegex);
      if (!match || match.index === undefined) {
        parts.push(remaining);
        break;
      }

      if (match.index > 0) {
        parts.push(remaining.substring(0, match.index));
      }

      const fullMatch = match[0];

      if (fullMatch.startsWith("![")) {
        // Immagine
        const alt = match[2];
        const src = match[3];
        parts.push(
          <span key={key++} className="block my-6 overflow-hidden rounded-xs border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt || "Immagine"} className="w-full h-auto object-cover max-h-[500px]" />
            {alt && <span className="block text-xs text-center text-slate-500 py-2 italic font-serif">{alt}</span>}
          </span>
        );
      } else if (fullMatch.startsWith("[")) {
        // Link
        const label = match[2];
        const href = match[3];
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1b5b80] underline font-medium hover:text-[#0a1c2a] transition-colors"
          >
            {label}
          </a>
        );
      } else if (fullMatch.startsWith("**")) {
        // Grassetto
        const boldText = match[4];
        parts.push(
          <strong key={key++} className="font-bold text-[#0a1c2a]">
            {boldText}
          </strong>
        );
      } else if (fullMatch.startsWith("*") || fullMatch.startsWith("_")) {
        // Corsivo
        const italicText = match[5] || match[6];
        parts.push(
          <em key={key++} className="italic text-slate-800">
            {italicText}
          </em>
        );
      }

      remaining = remaining.substring(match.index + fullMatch.length);
    }

    return parts;
  };

  return (
    <div className={`space-y-6 leading-relaxed font-light text-slate-800 ${className}`}>
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Separatore orizzontale
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={blockIdx} className="my-8 border-t border-slate-200" />;
        }

        // Titolo H2 (## )
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={blockIdx}
              className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#0a1c2a] pt-6 pb-2 border-b border-slate-200 tracking-tight"
            >
              {renderInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Titolo H3 (### )
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={blockIdx}
              className="font-serif text-xl sm:text-2xl font-normal text-[#0a1c2a] pt-4 pb-1 border-b border-slate-200/60"
            >
              {renderInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Citazione (> )
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join(" ");
          return (
            <blockquote
              key={blockIdx}
              className="border-l-3 border-[#c99a45] pl-5 py-2 my-6 bg-[#fbfaf6] text-slate-800 italic font-serif text-lg sm:text-xl"
            >
              {renderInline(quoteLines)}
            </blockquote>
          );
        }

        // Elenco puntato (- o *)
        if (trimmed.split("\n").every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "))) {
          const items = trimmed.split("\n").map((line) => line.trim().replace(/^[-*]\s+/, ""));
          return (
            <ul key={blockIdx} className="space-y-2.5 my-4 pl-5 list-disc text-slate-700">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        // Elenco numerato (1. 2.)
        if (trimmed.split("\n").every((line) => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split("\n").map((line) => line.trim().replace(/^\d+\.\s+/, ""));
          return (
            <ol key={blockIdx} className="space-y-2.5 my-4 pl-5 list-decimal text-slate-700">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        // Paragrafo normale con gestione di eventuali ritorni a capo singoli
        const lines = trimmed.split("\n");
        return (
          <p key={blockIdx} className="leading-relaxed text-base sm:text-lg">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
