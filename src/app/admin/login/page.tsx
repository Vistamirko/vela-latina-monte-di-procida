"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, Compass, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@velalatinamontediprocida.it");
  const [password, setPassword] = useState("velalatina2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenziali errate");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] flex flex-col justify-between py-12 px-6 sail-grid selection:bg-[#0a1c2a] selection:text-white">
      {/* Top bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between text-xs font-mono text-slate-700">
        <Link href="/" className="hover:text-[#0a1c2a] flex items-center gap-1 font-semibold">
          <span>← Torna al sito</span>
        </Link>
        <span className="flex items-center gap-1.5 font-bold text-[#0a1c2a]">
          <Compass className="w-3.5 h-3.5 text-[#1b5b80]" />
          <span>PORTALE AMMINISTRATIVO</span>
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-slate-300 p-8 sm:p-10 shadow-sm relative my-auto">
        <div className="text-center space-y-3 mb-8">
          <div className="relative w-14 h-14 mx-auto mb-2">
            <Image
              src="/images/stemma-vela-latina.jpg"
              alt="Stemma Vela Latina"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-700 font-bold block">
            Gestione Contenuti & API
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
            Accesso Backend
          </h1>
          <p className="text-xs text-slate-700 font-light max-w-xs mx-auto">
            Aggiorna Eventi, Palmarès, Articoli del Blog e Calendario dei Corsi di mare.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
              Email Amministratore
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Accesso in corso...</span>
            ) : (
              <>
                <span>Entra nel Pannello</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1b5b80]" />
            <span>Autenticazione protetta con Cookie HttpOnly & JWT</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center text-[10px] uppercase tracking-widest font-mono text-slate-700 font-bold">
        APS Vela Latina Monte di Procida · 40°47′N · 14°03′E
      </div>
    </div>
  );
}
