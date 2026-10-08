import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel: string;
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export default function AdminPageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  onSave,
  isSaving,
  saveLabel = "Salva",
}: AdminPageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-300 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-[#0a1c2a] font-semibold mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
          <h1 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl text-[#0a1c2a] font-medium leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-light mt-0.5 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>

        {onSave && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={backHref}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-mono font-semibold transition-colors"
            >
              Annulla
            </Link>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Salvataggio..." : saveLabel}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
