"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, Compass, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "Presidente / Direttivo",
    subrole: "Accesso 100% · Tutte le 15 sezioni (RUNTS & DB inclusi)",
    email: "admin@velalatinamontediprocida.it",
    badge: "Superadmin",
    badgeClass: "bg-purple-950 text-purple-200 border-purple-700",
  },
  {
    role: "Segreteria Operativa",
    subrole: "Libro Soci, Flotta, Tesseramenti, Inventario (No RUNTS/DB)",
    email: "segreteria@velalatinamontediprocida.it",
    badge: "Segreteria",
    badgeClass: "bg-emerald-950 text-emerald-200 border-emerald-700",
  },
  {
    role: "Ufficio Stampa & Media",
    subrole: "Blog, Eventi, Progetti, Partner (No dati soci/conti)",
    email: "comunicazione@velalatinamontediprocida.it",
    badge: "Editor",
    badgeClass: "bg-amber-950 text-amber-200 border-amber-700",
  },
  {
    role: "Staff Istruttori & Tecnici",
    subrole: "Corsi mare, Allarmi Flotta, Iscrizioni allievi",
    email: "istruttori@velalatinamontediprocida.it",
    badge: "Istruttori",
    badgeClass: "bg-cyan-950 text-cyan-200 border-cyan-700",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectDemoAccount = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword("velalatina2026!");
    setError(null);
  };

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] flex flex-col justify-between py-8 px-4 sm:px-6 sail-grid selection:bg-[#0a1c2a] selection:text-white">
      {/* Top bar */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between text-xs font-mono text-slate-700">
        <Link href="/" className="hover:text-[#0a1c2a] flex items-center gap-1 font-semibold">
          <span>← Torna al sito</span>
        </Link>
        <span className="flex items-center gap-1.5 font-bold text-[#0a1c2a]">
          <Compass className="w-3.5 h-3.5 text-[#1b5b80]" />
          <span>PORTALE AMMINISTRATIVO</span>
        </span>
      </div>

      {/* Login Card */}
      <main className="max-w-xl mx-auto w-full bg-white border border-slate-300 p-6 sm:p-10 shadow-sm relative my-auto">
        <div className="text-center space-y-2 mb-6">
          <div className="relative w-12 h-12 mx-auto mb-1">
            <Image
              src="/images/stemma-vela-latina.jpg"
              alt="Stemma Vela Latina"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-700 font-bold block">
            Accesso con Profili Differenziati (RBAC)
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
            Portale di Gestione
          </h1>
          <p className="text-xs text-slate-700 font-light max-w-sm mx-auto">
            Accedi con le tue credenziali. Le sezioni visibili cambieranno in base al ruolo assegnato.
          </p>
        </div>

        {/* Quick Role Selection for Demo Testing */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700">
              Seleziona un Profilo di Test:
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              Password: <strong className="text-slate-800">velalatina2026!</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = email.toLowerCase() === acc.email.toLowerCase();
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  className={`p-2.5 text-left border transition-all cursor-pointer rounded-xs ${
                    isSelected
                      ? "border-[#0a1c2a] bg-[#0a1c2a] text-white shadow-xs"
                      : "border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold leading-tight truncate">
                      {acc.role}
                    </span>
                    <span
                      className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border font-bold ${
                        isSelected ? "bg-white/20 text-white border-white/40" : acc.badgeClass
                      }`}
                    >
                      {acc.badge}
                    </span>
                  </div>
                  <p className={`text-[10px] leading-tight line-clamp-1 ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                    {acc.subrole}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1"
            >
              Email Utente
            </label>
            <div className="relative">
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@velalatinamontediprocida.it"
                autoComplete="username"
                className="w-full pl-9 pr-4 py-2 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-4 py-2 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] focus:border-[#0a1c2a] outline-none font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-[#b8860b] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
            <span>Autenticazione protetta con Cookie HttpOnly & JWT (RBAC)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="max-w-xl mx-auto w-full text-center text-[10px] uppercase tracking-widest font-mono text-slate-700 font-bold">
        APS Vela Latina Monte di Procida · 40°47′N · 14°03′E
      </div>
    </div>
  );
}
