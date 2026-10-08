"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, Anchor } from "lucide-react";

function AccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Password di accesso non corretta");
      }

      // Reindirizza alla pagina richiesta o alla home
      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Password errata. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07131d] text-white flex flex-col justify-between selection:bg-[#c99a45] selection:text-[#0a1c2a] relative overflow-hidden">
      {/* Texture nautica di sfondo */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Header minimale */}
      <header className="p-6 sm:p-10 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0a1c2a] border border-[#c99a45]/40 flex items-center justify-center text-[#c99a45]">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c99a45] font-bold block">
              Vela Latina Monte di Procida APS
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              Acquamorta · Campi Flegrei
            </span>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-[#c99a45] transition-colors"
        >
          Area Gestione →
        </Link>
      </header>

      {/* Box centrale sblocco */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="max-w-md w-full bg-[#0a1c2a]/90 backdrop-blur-md border border-white/10 p-8 sm:p-10 shadow-2xl relative">
          <div className="absolute -top-3 left-8 px-3 py-0.5 bg-[#c99a45] text-[#0a1c2a] text-[9px] font-mono uppercase tracking-widest font-bold">
            Anteprima Riservata
          </div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c99a45] mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl font-light text-white leading-tight">
              Sito in Allestimento
            </h1>
            <p className="text-xs text-slate-300 font-light mt-3 leading-relaxed">
              Il portale ufficiale dell&apos;Associazione è temporaneamente protetto in vista del lancio pubblico. Inserisci la chiave per visualizzare l&apos;anteprima.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-mono text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="site-password"
                className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-2"
              >
                Chiave d&apos;Accesso
              </label>
              <div className="relative">
                <input
                  id="site-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la password..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 outline-none focus:border-[#c99a45] transition-colors font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#c99a45] hover:bg-[#b8860b] text-[#0a1c2a] text-[11px] font-mono uppercase tracking-[0.25em] font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{loading ? "Verifica in corso..." : "Sblocca Anteprima"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400 font-light leading-relaxed">
              Per informazioni o per ricevere l&apos;accesso direttivo, contatta la segreteria a{" "}
              <a href="mailto:vistamirko@gmail.com" className="text-[#c99a45] hover:underline">
                vistamirko@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimale */}
      <footer className="p-6 sm:p-10 text-center border-t border-white/5 relative z-10 text-[10px] font-mono text-slate-400">
        Associazione Vela Latina Monte di Procida APS · C.F. 96024970634 · D.D. n. 239/2020 Patrimonio Immateriale
      </footer>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07131d] flex items-center justify-center text-slate-400 font-mono text-xs">
          Caricamento...
        </div>
      }
    >
      <AccessForm />
    </Suspense>
  );
}
