"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  X,
  Megaphone,
  Ship,
  Users,
  Settings,
  Calendar,
} from "lucide-react";
import { AccountDigitaleItem, GruppoWhatsAppItem } from "@/lib/db/types";

function renderGruppoIcon(icona?: string) {
  switch (icona) {
    case "megaphone":
      return <Megaphone className="w-5 h-5 text-amber-600" />;
    case "ship":
      return <Ship className="w-5 h-5 text-[#1b5b80]" />;
    case "users":
      return <Users className="w-5 h-5 text-indigo-600" />;
    case "settings":
      return <Settings className="w-5 h-5 text-slate-700" />;
    case "calendar":
      return <Calendar className="w-5 h-5 text-emerald-600" />;
    default:
      return <MessageSquare className="w-5 h-5 text-emerald-600" />;
  }
}

export default function AccountManager() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "account">("whatsapp");
  const [accounts, setAccounts] = useState<AccountDigitaleItem[]>([]);
  const [gruppi, setGruppi] = useState<GruppoWhatsAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [modalAccount, setModalAccount] = useState<Partial<AccountDigitaleItem> | null>(null);
  const [modalGruppo, setModalGruppo] = useState<Partial<GruppoWhatsAppItem> | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    // loading
    try {
      const res = await fetch("/api/account");
      const json = await res.json();
      if (json.success && json.data) {
        setAccounts(json.data.accounts || []);
        setGruppi(json.data.gruppiWhatsApp || []);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei dati account e canali");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/account")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setAccounts(json.data.accounts || []);
          setGruppi(json.data.gruppiWhatsApp || []);
        }
      })
      .catch(() => {
        if (!ignore) showToast("error", "Errore caricamento account");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Account actions
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAccount || !modalAccount.servizio) return;

    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "account", ...modalAccount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio account");
      showToast("success", "Account salvato con successo");
      setModalAccount(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo account?")) return;
    try {
      const res = await fetch(`/api/account?type=account&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Account eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare l'account");
    }
  };

  // WhatsApp actions
  const handleSaveGruppo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalGruppo || !modalGruppo.nome) return;

    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp", ...modalGruppo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Errore salvataggio gruppo");
      showToast("success", "Gruppo WhatsApp salvato con successo");
      setModalGruppo(null);
      loadData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDeleteGruppo = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo gruppo WhatsApp?")) return;
    try {
      const res = await fetch(`/api/account?type=whatsapp&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Gruppo eliminato");
      loadData();
    } catch {
      showToast("error", "Impossibile eliminare il gruppo");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", `${label} copiato negli appunti!`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c99a45] border-t-transparent rounded-full animate-spin"></div>
        <span>Caricamento dati in corso...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-mono font-semibold shadow-lg border rounded flex items-center gap-2 ${
            toast.type === "success" ? "bg-[#0a1c2a] text-white border-slate-700" : "bg-red-700 text-white border-red-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-white" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "whatsapp" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Gruppi WhatsApp Ufficiali ({gruppi.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "account" ? "bg-[#0a1c2a] text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Account Digitali & Servizi ({accounts.length})</span>
          </button>
        </div>

        <div>
          {activeTab === "whatsapp" ? (
            <button
              onClick={() =>
                setModalGruppo({
                  icona: "whatsapp",
                  nome: "",
                  funzione: "",
                  link: "",
                  amministratori: ["Petrone Michele", "Mancino Antonio"],
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Gruppo WhatsApp</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setModalAccount({
                  servizio: "",
                  emailUsername: "",
                  owner: "Associazione Vela Latina",
                  statoRevisione: "Attivo",
                  amministratori: [],
                })
              }
              className="px-3.5 py-2 bg-[#c99a45] hover:bg-[#d8a852] text-[#0a1c2a] text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Account</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: WHATSAPP */}
      {activeTab === "whatsapp" && (
        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 leading-relaxed font-mono">
            <strong>Canali di Comunicazione Ufficiali della Community:</strong> Qui sono censiti i gruppi WhatsApp ufficiali con i rispettivi amministratori nominati e i link di invito diretti per i soci e la cittadinanza.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gruppi.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        {renderGruppoIcon(g.icona)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-slate-900">{g.nome}</h3>
                        <span className="text-[10px] font-mono text-slate-400">{g.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModalGruppo(g)}
                        className="p-1.5 text-slate-400 hover:text-[#0a1c2a] hover:bg-slate-100 rounded"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGruppo(g.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-sans">
                    {g.funzione}
                  </p>

                  <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Amministratori del gruppo:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.amministratori.map((adm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-mono text-[11px] rounded"
                        >
                          {adm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => copyToClipboard(g.link, `Link ${g.nome}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Link</span>
                  </button>

                  {g.link && (
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Apri Gruppo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT DIGITALI */}
      {activeTab === "account" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Codice</th>
                <th className="py-3 px-4 font-sans">Servizio / Piattaforma</th>
                <th className="py-3 px-4">Email / URL</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Amministratori</th>
                <th className="py-3 px-4">Stato Revisione</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{acc.id}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">{acc.servizio}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                    {acc.emailUsername.startsWith("http") ? (
                      <a
                        href={acc.emailUsername}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0a1c2a] hover:underline flex items-center gap-1 font-sans"
                      >
                        <span className="truncate">{acc.emailUsername}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      acc.emailUsername || "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{acc.owner || "-"}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="truncate block max-w-xs">
                      {acc.amministratori && acc.amministratori.length > 0
                        ? acc.amministratori.join(", ")
                        : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.statoRevisione.toLowerCase().includes("attivo")
                          ? "bg-emerald-100 text-emerald-800"
                          : acc.statoRevisione.toLowerCase().includes("sospeso")
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {acc.statoRevisione}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModalAccount(acc)}
                        className="p-1 text-slate-500 hover:text-[#0a1c2a] hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL ACCOUNT */}
      {modalAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#c99a45]" />
                <span>{modalAccount.id ? "Modifica Account" : "Nuovo Account / Servizio"}</span>
              </h3>
              <button onClick={() => setModalAccount(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Nome Servizio / Piattaforma *</label>
                <input
                  type="text"
                  required
                  value={modalAccount.servizio || ""}
                  onChange={(e) => setModalAccount({ ...modalAccount, servizio: e.target.value })}
                  placeholder="Es. Gmail, Facebook, Instagram..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Email / Username / URL</label>
                <input
                  type="text"
                  value={modalAccount.emailUsername || ""}
                  onChange={(e) => setModalAccount({ ...modalAccount, emailUsername: e.target.value })}
                  placeholder="Es. velalatinamontediprocida@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Owner / Referente</label>
                  <input
                    type="text"
                    value={modalAccount.owner || ""}
                    onChange={(e) => setModalAccount({ ...modalAccount, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 mb-1 font-semibold">Stato Revisione</label>
                  <input
                    type="text"
                    value={modalAccount.statoRevisione || "Attivo"}
                    onChange={(e) => setModalAccount({ ...modalAccount, statoRevisione: e.target.value })}
                    placeholder="Es. Attivo, Da verificare..."
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Note / Password Manager</label>
                <input
                  type="text"
                  value={modalAccount.note || ""}
                  onChange={(e) => setModalAccount({ ...modalAccount, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAccount(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded"
                >
                  Salva Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GRUPPO WHATSAPP */}
      {modalGruppo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scaleIn">
            <div className="p-4 bg-[#0a1c2a] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{modalGruppo.id ? "Modifica Gruppo WhatsApp" : "Nuovo Gruppo WhatsApp"}</span>
              </h3>
              <button onClick={() => setModalGruppo(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGruppo} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Nome Gruppo *</label>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={modalGruppo.nome || ""}
                    onChange={(e) => setModalGruppo({ ...modalGruppo, nome: e.target.value })}
                    placeholder="Es. Bacheca Ufficiale"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Finalità / Funzione</label>
                <textarea
                  rows={2}
                  value={modalGruppo.funzione || ""}
                  onChange={(e) => setModalGruppo({ ...modalGruppo, funzione: e.target.value })}
                  placeholder="Descrivi lo scopo del gruppo per i membri..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">Link di Invito WhatsApp</label>
                <input
                  type="text"
                  value={modalGruppo.link || ""}
                  onChange={(e) => setModalGruppo({ ...modalGruppo, link: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 mb-1 font-semibold">
                  Amministratori (separati da virgola)
                </label>
                <input
                  type="text"
                  value={(modalGruppo.amministratori || []).join(", ")}
                  onChange={(e) =>
                    setModalGruppo({
                      ...modalGruppo,
                      amministratori: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Petrone Michele, Mancino Antonio..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalGruppo(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-mono rounded"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0a1c2a] text-white font-mono font-bold rounded"
                >
                  Salva Gruppo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
