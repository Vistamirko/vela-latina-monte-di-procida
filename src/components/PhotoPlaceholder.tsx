import { Camera } from "lucide-react";

interface PhotoPlaceholderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  aspect?: "auto" | "video" | "square" | "portrait";
}

export default function PhotoPlaceholder({
  title,
  subtitle,
  className = "",
  compact = false,
  aspect = "auto",
}: PhotoPlaceholderProps) {
  const aspectClass =
    aspect === "video"
      ? "aspect-video"
      : aspect === "square"
      ? "aspect-square"
      : aspect === "portrait"
      ? "aspect-[3/4]"
      : "";

  if (compact) {
    return (
      <div
        className={`bg-slate-100/80 border border-dashed border-slate-300 rounded-sm flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-slate-500 font-mono text-[10px] select-none ${aspectClass} ${className}`}
        title={title ? `Foto mancante: ${title}` : "Foto mancante"}
      >
        <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">
          Foto mancante
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full min-h-[140px] bg-gradient-to-br from-slate-50 via-slate-100/60 to-slate-100 border-2 border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center p-6 text-center select-none ${aspectClass} ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-2.5">
        <Camera className="w-5 h-5 text-slate-400 stroke-[1.5]" />
      </div>
      <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-slate-600">
        Foto mancante
      </span>
      {title && (
        <span className="font-serif italic text-xs text-slate-700 mt-1 max-w-xs line-clamp-1 font-semibold">
          {title}
        </span>
      )}
      {subtitle && (
        <span className="font-mono text-[10px] text-slate-500 mt-0.5 max-w-xs line-clamp-1">
          {subtitle}
        </span>
      )}
      <span className="font-mono text-[9px] text-slate-400 mt-1 tracking-wide">
        In attesa di caricamento
      </span>
    </div>
  );
}
