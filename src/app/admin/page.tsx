"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  LogOut,
  ExternalLink,
  Database,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  Inbox,
  Phone,
  Mail,
  MessageSquare,
  Check,
  User,
  Users,
  Building2,
  X,
  Ship,
  Wrench,
  CheckSquare,
  Boxes,
  ShoppingCart,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Award,
  CreditCard,
  ChevronDown,
  Camera,
  Lock,
  Shield,
} from "lucide-react";
import { EventItem, BlogPost, CourseSession, ProjectItem, BookingRequest, SocioItem, AnagraficaAssociazione, AdminRole } from "@/lib/db/types";
import LibroSociManager from "@/components/admin/LibroSociManager";
import AnagraficaManager from "@/components/admin/AnagraficaManager";
import CruscottoManager from "@/components/admin/CruscottoManager";
import BarcheManager from "@/components/admin/BarcheManager";
import AttivitaManager from "@/components/admin/AttivitaManager";
import InventarioManager from "@/components/admin/InventarioManager";
import AccountManager from "@/components/admin/AccountManager";
import FundraisingManager from "@/components/admin/FundraisingManager";
import PartnerManager from "@/components/admin/PartnerManager";
import QuickPhotoUploaderModal from "@/components/admin/QuickPhotoUploaderModal";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

export interface RoleConfig {
  label: string;
  roleBadge: string;
  badgeClass: string;
  description: string;
  defaultTab: AdminTab;
  allowedTabs: AdminTab[];
}

export const ROLE_CONFIGS: Record<AdminRole, RoleConfig> = {
  superadmin: {
    label: "Presidente & Direttivo",
    roleBadge: "Superadmin",
    badgeClass: "bg-purple-950 text-purple-200 border-purple-700/70",
    description: "Accesso totale a tutti i 15 moduli del sistema, inclusi atti legali/RUNTS e database.",
    defaultTab: "cruscotto",
    allowedTabs: [
      "cruscotto",
      "richieste",
      "soci",
      "barche",
      "attivita",
      "inventario",
      "account",
      "fundraising",
      "partner",
      "corsi",
      "eventi",
      "progetti",
      "blog",
      "anagrafica",
      "db",
    ],
  },
  admin: {
    label: "Amministratore Generale",
    roleBadge: "Admin",
    badgeClass: "bg-blue-950 text-blue-200 border-blue-700/70",
    description: "Gestione operativa: soci, flotta, tesseramento, attività, corsi ed eventi.",
    defaultTab: "cruscotto",
    allowedTabs: [
      "cruscotto",
      "richieste",
      "soci",
      "barche",
      "attivita",
      "inventario",
      "account",
      "fundraising",
      "partner",
      "corsi",
      "eventi",
      "progetti",
      "blog",
    ],
  },
  segreteria: {
    label: "Segreteria Operativa & Soci",
    roleBadge: "Segreteria",
    badgeClass: "bg-emerald-950 text-emerald-200 border-emerald-700/70",
    description: "Gestione Libro Soci, quote sociali, iscrizioni corsi, flotta, inventario e partner.",
    defaultTab: "cruscotto",
    allowedTabs: [
      "cruscotto",
      "richieste",
      "soci",
      "barche",
      "attivita",
      "inventario",
      "account",
      "fundraising",
      "partner",
      "corsi",
      "eventi",
      "progetti",
      "blog",
    ],
  },
  editor: {
    label: "Ufficio Stampa & Comunicazione",
    roleBadge: "Editor Stampa",
    badgeClass: "bg-amber-950 text-amber-200 border-amber-700/70",
    description: "Cura dei contenuti pubblici: Notizie Blog, Calendario Eventi, Progetti 2027 e Partner.",
    defaultTab: "blog",
    allowedTabs: [
      "blog",
      "eventi",
      "progetti",
      "partner",
      "corsi",
      "account",
    ],
  },
  istruttore: {
    label: "Staff Istruttori & Capibarca",
    roleBadge: "Istruttori",
    badgeClass: "bg-cyan-950 text-cyan-200 border-cyan-700/70",
    description: "Gestione corsi di mare, allievi iscritti, stato flotta barche e manutenzioni.",
    defaultTab: "corsi",
    allowedTabs: [
      "corsi",
      "richieste",
      "barche",
      "attivita",
    ],
  },
};

export type AdminTab =
  | "cruscotto"
  | "barche"
  | "attivita"
  | "inventario"
  | "account"
  | "fundraising"
  | "partner"
  | "richieste"
  | "soci"
  | "anagrafica"
  | "eventi"
  | "blog"
  | "corsi"
  | "progetti"
  | "db";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab handling
  const VALID_TABS: Record<string, AdminTab> = {
    cruscotto: "cruscotto",
    dashboard: "cruscotto",
    barche: "barche",
    flotta: "barche",
    manutenzioni: "barche",
    attivita: "attivita",
    task: "attivita",
    inventario: "inventario",
    acquisti: "inventario",
    account: "account",
    whatsapp: "account",
    canali: "account",
    fundraising: "fundraising",
    partner: "partner",
    sponsor: "partner",
    partner_sostenitori: "partner",
    sostenitori: "partner",
    richieste: "richieste",
    iscrizioni: "richieste",
    soci: "soci",
    anagrafica: "anagrafica",
    eventi: "eventi",
    blog: "blog",
    corsi: "corsi",
    progetti: "progetti",
    db: "db",
  };

  const resolveTab = (param: string | null): AdminTab => {
    if (!param) return "cruscotto";
    return VALID_TABS[param.toLowerCase()] || "cruscotto";
  };

  const [userSelectedTab, setUserSelectedTab] = useState<AdminTab | null>(null);
  const activeTab = userSelectedTab ?? resolveTab(tabParam);
  const setActiveTab = (tab: AdminTab) => setUserSelectedTab(tab);

  const userRole: AdminRole = (currentUser?.role as AdminRole) || "admin";
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.admin;
  const isTabAllowed = useCallback((tab: AdminTab) => roleConfig.allowedTabs.includes(tab), [roleConfig]);

  // Se la sezione attuale non è consentita per il ruolo corrente, reindirizza alla sezione predefinita
  useEffect(() => {
    if (currentUser && !isTabAllowed(activeTab)) {
      setActiveTab(roleConfig.defaultTab);
    }
  }, [currentUser, activeTab, isTabAllowed, roleConfig.defaultTab]);

  // Modal invio email corso
  const [emailModalBooking, setEmailModalBooking] = useState<BookingRequest | null>(null);
  const [emailCustomMessage, setEmailCustomMessage] = useState("");
  const [emailDataLezione, setEmailDataLezione] = useState("");
  const [emailLuogo, setEmailLuogo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Data states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [courses, setCourses] = useState<CourseSession[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [soci, setSoci] = useState<SocioItem[]>([]);
  const [anagrafica, setAnagrafica] = useState<AnagraficaAssociazione | null>(null);
  const [bookingFilter, setBookingFilter] = useState<"tutte" | "nuova" | "in_attesa_pagamento" | "contattato" | "iscritto">("tutte");
  const [loadingData, setLoadingData] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [resEvt, resBlog, resCourses, resProj, resBookings, resSoci, resAnagrafica] = await Promise.all([
        fetch("/api/eventi?all=true"),
        fetch("/api/blog?all=true"),
        fetch("/api/corsi-calendar?all=true"),
        fetch("/api/progetti?all=true"),
        fetch("/api/iscrizioni"),
        fetch("/api/soci"),
        fetch("/api/anagrafica"),
      ]);

      if (resEvt.ok) {
        const d = await resEvt.json();
        setEvents(d.data || []);
      }
      if (resBlog.ok) {
        const d = await resBlog.json();
        setBlogPosts(d.data || []);
      }
      if (resCourses.ok) {
        const d = await resCourses.json();
        setCourses(d.data || []);
      }
      if (resProj.ok) {
        const d = await resProj.json();
        setProjects(d.data || []);
      }
      if (resBookings.ok) {
        const d = await resBookings.json();
        setBookings(d.data || []);
      }
      if (resSoci.ok) {
        const d = await resSoci.json();
        setSoci(d.data || []);
      }
      if (resAnagrafica.ok) {
        const d = await resAnagrafica.json();
        setAnagrafica(d.data || null);
      }
    } catch {
      showToast("error", "Errore nel caricamento dei dati");
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  const handleUpdateBookingStatus = async (id: string, status: BookingRequest["status"]) => {
    try {
      const res = await fetch("/api/iscrizioni", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Errore aggiornamento");
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      showToast("success", "Stato richiesta aggiornato");
    } catch {
      showToast("error", "Impossibile aggiornare lo stato");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa richiesta?")) return;
    try {
      const res = await fetch(`/api/iscrizioni?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showToast("success", "Richiesta eliminata");
    } catch {
      showToast("error", "Impossibile eliminare la richiesta");
    }
  };

  const handleSendCourseEmail = async () => {
    if (!emailModalBooking) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/iscrizioni/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: emailModalBooking.id,
          customMessage: emailCustomMessage.trim() || undefined,
          dataLezione: emailDataLezione.trim() || undefined,
          luogo: emailLuogo.trim() || undefined,
          updateStatus: emailModalBooking.status === "nuova" ? "contattato" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante l'invio dell'email");
      }
      showToast("success", `Email inviata con successo a ${emailModalBooking.email}!`);
      setEmailModalBooking(null);
      setEmailCustomMessage("");
      setEmailDataLezione("");
      setEmailLuogo("");
      loadAllData();
    } catch (err: any) {
      showToast("error", err.message || "Errore invio email");
    } finally {
      setSendingEmail(false);
    }
  };

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Non autenticato");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
          setAuthLoading(false);
          loadAllData();
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router, loadAllData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  /* ==============================================================
     EVENTI ACTIONS
  ============================================================== */
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'evento "${title}"?`)) return;
    try {
      const res = await fetch(`/api/eventi?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Evento eliminato");
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleToggleEventPublish = async (evt: EventItem) => {
    try {
      const res = await fetch("/api/eventi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...evt, published: !evt.published }),
      });
      if (!res.ok) throw new Error();
      loadAllData();
      showToast("success", evt.published ? "Evento nascosto (bozza)" : "Evento pubblicato");
    } catch {
      showToast("error", "Impossibile aggiornare lo stato di pubblicazione");
    }
  };

  /* ==============================================================
     BLOG ACTIONS
  ============================================================== */
  const handleDeleteBlogPost = async (id: string, title: string) => {
    if (!confirm(`Eliminare l'articolo "${title}"?`)) return;
    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Articolo eliminato");
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleToggleBlogPublish = async (post: BlogPost) => {
    try {
      const res = await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: !post.published }),
      });
      if (!res.ok) throw new Error();
      loadAllData();
      showToast("success", post.published ? "Articolo archiviato in bozza" : "Articolo visibile online");
    } catch {
      showToast("error", "Errore aggiornamento pubblicazione");
    }
  };

  /* ==============================================================
     CORSI ACTIONS
  ============================================================== */
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Eliminare la sessione "${title}"?`)) return;
    try {
      const res = await fetch(`/api/corsi-calendar?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Sessione eliminata");
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  /* ==============================================================
     PROGETTI ACTIONS
  ============================================================== */
  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il progetto "${title}"?`)) return;
    try {
      const res = await fetch(`/api/progetti?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
      showToast("success", "Progetto eliminato");
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  const handleToggleProjectPublish = async (proj: ProjectItem) => {
    try {
      const res = await fetch("/api/progetti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proj, published: !proj.published }),
      });
      if (!res.ok) throw new Error("Errore aggiornamento");
      showToast("success", proj.published ? "Progetto salvato in bozza" : "Progetto pubblicato");
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-slate-700">
        Verifica autenticazione amministratore...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0a1c2a] selection:bg-[#0a1c2a] selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma"
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-['Cinzel'] text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.2em] font-bold text-[#0a1c2a] block leading-tight truncate">
                Vela Latina MdP
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-slate-500 font-semibold block truncate">
                Pannello Amministrazione
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Utente e Badge Ruolo (Desktop) */}
            <div
              className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-50 px-2.5 py-1 sm:py-1.5 border border-slate-300 rounded-xs"
              title={`${roleConfig.label}: ${roleConfig.description}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[130px] font-semibold text-slate-900">
                {currentUser?.name || currentUser?.email}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleConfig.badgeClass}`}>
                {roleConfig.roleBadge}
              </span>
            </div>

            {/* Badge Ruolo compatto per schermi piccoli (Mobile) */}
            <div className="md:hidden flex items-center">
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleConfig.badgeClass}`}
                title={roleConfig.label}
              >
                {roleConfig.roleBadge}
              </span>
            </div>

            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-2.5 py-1 sm:py-1.5 bg-[#0a1c2a] hover:bg-[#1b5b80] text-white text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer rounded-xs shadow-2xs"
              title="Carica o scatta foto da cellulare"
            >
              <Camera className="w-3.5 h-3.5 text-[#c99a45]" />
              <span className="hidden xs:inline">Carica Foto</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="text-[11px] sm:text-xs font-mono text-slate-700 hover:text-[#0a1c2a] flex items-center gap-1 font-semibold px-2 py-1 sm:py-1.5 border border-slate-200 hover:border-slate-400 bg-slate-50 rounded-xs transition-colors"
              title="Vedi Sito Pubblico"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sito</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer rounded-xs"
              title="Esci dall'Amministrazione"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>

        {/* VISTA MOBILE (< md): Selettore Compatto + Scorrimento Orizzontale a 1 Riga (~70px totali) */}
        <div className="md:hidden border-t border-slate-200 bg-slate-50/95">
          {/* Selettore rapido a tendina */}
          <div className="px-3 py-1.5 flex items-center gap-2 border-b border-slate-200/60">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 shrink-0">Sezione:</span>
            <div className="relative flex-1">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold py-1 pl-2.5 pr-7 rounded-sm appearance-none focus:outline-none focus:border-[#0a1c2a]"
              >
                {(isTabAllowed("cruscotto") || isTabAllowed("soci") || isTabAllowed("barche") || isTabAllowed("attivita") || isTabAllowed("inventario") || isTabAllowed("account") || isTabAllowed("fundraising") || isTabAllowed("anagrafica") || isTabAllowed("db")) && (
                  <optgroup label="Gestionale & Operativo">
                    {isTabAllowed("cruscotto") && <option value="cruscotto">Cruscotto Operativo</option>}
                    {isTabAllowed("soci") && <option value="soci">Libro Soci ({soci.filter((s) => s.anno === 2026 || s.anno === 2024).length})</option>}
                    {isTabAllowed("barche") && <option value="barche">Flotta & Manutenzioni</option>}
                    {isTabAllowed("attivita") && <option value="attivita">Attività & Task</option>}
                    {isTabAllowed("inventario") && <option value="inventario">Inventario & Acquisti</option>}
                    {isTabAllowed("account") && <option value="account">Account & WhatsApp</option>}
                    {isTabAllowed("fundraising") && <option value="fundraising">Fundraising & Bandi</option>}
                    {isTabAllowed("anagrafica") && <option value="anagrafica">Anagrafica & RUNTS</option>}
                    {isTabAllowed("db") && <option value="db">Database & File JSON</option>}
                  </optgroup>
                )}
                {(isTabAllowed("partner") || isTabAllowed("richieste") || isTabAllowed("corsi") || isTabAllowed("eventi") || isTabAllowed("progetti") || isTabAllowed("blog")) && (
                  <optgroup label="Contenuti Sito Web">
                    {isTabAllowed("partner") && <option value="partner">Partner & Sostenitori</option>}
                    {isTabAllowed("richieste") && <option value="richieste">Iscrizioni & Tesseramento ({bookings.length})</option>}
                    {isTabAllowed("corsi") && <option value="corsi">Corsi di Mare ({courses.length})</option>}
                    {isTabAllowed("eventi") && <option value="eventi">Eventi & Regate ({events.length})</option>}
                    {isTabAllowed("progetti") && <option value="progetti">Progetti 2027 ({projects.length})</option>}
                    {isTabAllowed("blog") && <option value="blog">Articoli Blog ({blogPosts.length})</option>}
                  </optgroup>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Barra orizzontale scorrevole fluida (swipe touch) ad 1 sola riga */}
          <div className="px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {isTabAllowed("cruscotto") && (
              <button
                onClick={() => setActiveTab("cruscotto")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "cruscotto"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <LayoutDashboard className={`w-3 h-3 ${activeTab === "cruscotto" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Cruscotto</span>
              </button>
            )}

            {isTabAllowed("richieste") && (
              <button
                onClick={() => setActiveTab("richieste")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "richieste"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Inbox className={`w-3 h-3 ${activeTab === "richieste" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Iscrizioni</span>
                {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length > 0 && (
                  <span className="px-1 py-0.2 text-[8px] bg-amber-600 text-white rounded-full font-bold">
                    {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed("soci") && (
              <button
                onClick={() => setActiveTab("soci")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "soci"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Users className={`w-3 h-3 ${activeTab === "soci" ? "text-[#c99a45]" : "text-indigo-600"}`} />
                <span>Libro Soci</span>
                {soci.filter((s) => s.anno === 2026).length > 0 && (
                  <span className="px-1 py-0.2 text-[8px] bg-emerald-700 text-white rounded-full font-bold">
                    {soci.filter((s) => s.anno === 2026).length}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed("barche") && (
              <button
                onClick={() => setActiveTab("barche")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "barche"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Ship className={`w-3 h-3 ${activeTab === "barche" ? "text-[#c99a45]" : "text-blue-600"}`} />
                <span>Flotta</span>
              </button>
            )}

            {isTabAllowed("attivita") && (
              <button
                onClick={() => setActiveTab("attivita")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "attivita"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <CheckSquare className={`w-3 h-3 ${activeTab === "attivita" ? "text-[#c99a45]" : "text-emerald-600"}`} />
                <span>Attività</span>
              </button>
            )}

            {isTabAllowed("corsi") && (
              <button
                onClick={() => setActiveTab("corsi")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "corsi"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <GraduationCap className={`w-3 h-3 ${activeTab === "corsi" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Corsi</span>
              </button>
            )}

            {isTabAllowed("eventi") && (
              <button
                onClick={() => setActiveTab("eventi")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "eventi"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Calendar className={`w-3 h-3 ${activeTab === "eventi" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Eventi</span>
              </button>
            )}

            {isTabAllowed("progetti") && (
              <button
                onClick={() => setActiveTab("progetti")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "progetti"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Compass className={`w-3 h-3 ${activeTab === "progetti" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Progetti</span>
              </button>
            )}

            {isTabAllowed("partner") && (
              <button
                onClick={() => setActiveTab("partner")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "partner"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Award className={`w-3 h-3 ${activeTab === "partner" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                <span>Partner</span>
              </button>
            )}

            {isTabAllowed("blog") && (
              <button
                onClick={() => setActiveTab("blog")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "blog"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <BookOpen className={`w-3 h-3 ${activeTab === "blog" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Blog</span>
              </button>
            )}

            {isTabAllowed("inventario") && (
              <button
                onClick={() => setActiveTab("inventario")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "inventario"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Boxes className={`w-3 h-3 ${activeTab === "inventario" ? "text-[#c99a45]" : "text-purple-600"}`} />
                <span>Inventario</span>
              </button>
            )}

            {isTabAllowed("account") && (
              <button
                onClick={() => setActiveTab("account")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "account"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <MessageSquare className={`w-3 h-3 ${activeTab === "account" ? "text-[#c99a45]" : "text-emerald-500"}`} />
                <span>Account</span>
              </button>
            )}

            {isTabAllowed("fundraising") && (
              <button
                onClick={() => setActiveTab("fundraising")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "fundraising"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <DollarSign className={`w-3 h-3 ${activeTab === "fundraising" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Fundraising</span>
              </button>
            )}

            {isTabAllowed("anagrafica") && (
              <button
                onClick={() => setActiveTab("anagrafica")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "anagrafica"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Building2 className={`w-3 h-3 ${activeTab === "anagrafica" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Anagrafica</span>
              </button>
            )}

            {isTabAllowed("db") && (
              <button
                onClick={() => setActiveTab("db")}
                className={`shrink-0 px-2.5 py-1 text-[11px] font-mono font-bold rounded-sm flex items-center gap-1 transition-all ${
                  activeTab === "db"
                    ? "bg-[#0a1c2a] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Database className={`w-3 h-3 ${activeTab === "db" ? "text-[#c99a45]" : "text-slate-500"}`} />
                <span>Database</span>
              </button>
            )}
          </div>
        </div>

        {/* VISTA DESKTOP (>= md): Tab Navigation Organizzata in Due Livelli Visibili */}
        <div className="hidden md:block border-t border-slate-200 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col gap-2">
            {/* GRUPPO 1: CONTENUTI PUBBLICI DEL SITO */}
            {(isTabAllowed("corsi") || isTabAllowed("blog") || isTabAllowed("eventi") || isTabAllowed("progetti") || isTabAllowed("partner") || isTabAllowed("richieste")) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 mr-1.5 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b5b80]"></span>
                  <span>Contenuti Sito:</span>
                </span>

                {isTabAllowed("corsi") && (
                  <button
                    onClick={() => setActiveTab("corsi")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "corsi"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <GraduationCap className={`w-3.5 h-3.5 ${activeTab === "corsi" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Corsi ({courses.length})</span>
                  </button>
                )}

                {isTabAllowed("blog") && (
                  <button
                    onClick={() => setActiveTab("blog")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "blog"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${activeTab === "blog" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Blog ({blogPosts.length})</span>
                  </button>
                )}

                {isTabAllowed("eventi") && (
                  <button
                    onClick={() => setActiveTab("eventi")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "eventi"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${activeTab === "eventi" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Eventi ({events.length})</span>
                  </button>
                )}

                {isTabAllowed("progetti") && (
                  <button
                    onClick={() => setActiveTab("progetti")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "progetti"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Compass className={`w-3.5 h-3.5 ${activeTab === "progetti" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Progetti ({projects.length})</span>
                  </button>
                )}

                {isTabAllowed("partner") && (
                  <button
                    onClick={() => setActiveTab("partner")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "partner"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Award className={`w-3.5 h-3.5 ${activeTab === "partner" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Partner & Sostenitori</span>
                  </button>
                )}

                {isTabAllowed("richieste") && (
                  <button
                    onClick={() => setActiveTab("richieste")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "richieste"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Inbox className={`w-3.5 h-3.5 ${activeTab === "richieste" ? "text-[#c99a45]" : "text-[#1b5b80]"}`} />
                    <span>Iscrizioni ({bookings.length})</span>
                    {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-amber-600 text-white rounded-full font-bold">
                        {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* GRUPPO 2: GESTIONALE INTERNO ASSOCIAZIONE (EXCEL) */}
            {(isTabAllowed("cruscotto") || isTabAllowed("barche") || isTabAllowed("attivita") || isTabAllowed("inventario") || isTabAllowed("account") || isTabAllowed("fundraising") || isTabAllowed("soci") || isTabAllowed("anagrafica") || isTabAllowed("db")) && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-200/60">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#c99a45] mr-1.5 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c99a45]"></span>
                  <span>Gestionale & Excel:</span>
                </span>

                {isTabAllowed("cruscotto") && (
                  <button
                    onClick={() => setActiveTab("cruscotto")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "cruscotto"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#c99a45]" />
                    <span>Cruscotto</span>
                  </button>
                )}

                {isTabAllowed("barche") && (
                  <button
                    onClick={() => setActiveTab("barche")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "barche"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Ship className="w-3.5 h-3.5 text-blue-600" />
                    <span>Flotta & Lavori</span>
                  </button>
                )}

                {isTabAllowed("attivita") && (
                  <button
                    onClick={() => setActiveTab("attivita")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "attivita"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attività & Task</span>
                  </button>
                )}

                {isTabAllowed("inventario") && (
                  <button
                    onClick={() => setActiveTab("inventario")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "inventario"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5 text-purple-600" />
                    <span>Inventario & Acquisti</span>
                  </button>
                )}

                {isTabAllowed("account") && (
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "account"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Account & WhatsApp</span>
                  </button>
                )}

                {isTabAllowed("fundraising") && (
                  <button
                    onClick={() => setActiveTab("fundraising")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "fundraising"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-[#c99a45]" />
                    <span>Fundraising</span>
                  </button>
                )}

                {isTabAllowed("soci") && (
                  <button
                    onClick={() => setActiveTab("soci")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "soci"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Libro Soci ({soci.length})</span>
                    {soci.filter((s) => s.anno === 2026 || s.anno === 2024).length > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-emerald-700 text-white rounded-full font-bold">
                        {soci.filter((s) => s.anno === 2026 || s.anno === 2024).length}
                      </span>
                    )}
                  </button>
                )}

                {isTabAllowed("anagrafica") && (
                  <button
                    onClick={() => setActiveTab("anagrafica")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "anagrafica"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#c99a45]" />
                    <span>Anagrafica & RUNTS</span>
                  </button>
                )}

                {isTabAllowed("db") && (
                  <button
                    onClick={() => setActiveTab("db")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      activeTab === "db"
                        ? "bg-[#0a1c2a] text-white ring-1 ring-[#0a1c2a]"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Database</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[90vw]">
          <div
            className={`px-4 py-3 shadow-lg border text-xs font-mono font-semibold flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-[#0a1c2a] text-white border-slate-800"
                : "bg-red-700 text-white border-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span className="truncate">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        {!isTabAllowed(activeTab) ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto bg-white border border-slate-300 rounded-sm shadow-xs my-8 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold block">
              Controllo Accessi & Ruoli (RBAC)
            </span>
            <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl text-[#0a1c2a] font-light">
              Sezione Riservata
            </h3>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Il tuo profilo <strong>{roleConfig.label}</strong> non ha i permessi per accedere a questa sezione.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab(roleConfig.defaultTab)}
                className="px-4 py-2.5 bg-[#0a1c2a] text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#1b5b80] transition-colors cursor-pointer rounded-xs"
              >
                Torna a {roleConfig.defaultTab.toUpperCase()}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ==============================================================
               TAB CRUSCOTTO OPERATIVO
            ============================================================== */}
            {activeTab === "cruscotto" && (
              <CruscottoManager onNavigateTab={(tab) => setActiveTab(resolveTab(tab))} />
            )}

        {/* ==============================================================
           TAB BARCHE & MANUTENZIONI
        ============================================================== */}
        {activeTab === "barche" && <BarcheManager />}

        {/* ==============================================================
           TAB ATTIVITÀ & TASK OPERATIVI
        ============================================================== */}
        {activeTab === "attivita" && <AttivitaManager />}

        {/* ==============================================================
           TAB INVENTARIO & ACQUISTI
        ============================================================== */}
        {activeTab === "inventario" && <InventarioManager />}

        {/* ==============================================================
           TAB ACCOUNT & WHATSAPP
        ============================================================== */}
        {activeTab === "account" && <AccountManager />}

        {/* ==============================================================
           TAB FUNDRAISING, SPONSOR & BANDI
        ============================================================== */}
        {activeTab === "fundraising" && <FundraisingManager />}

        {/* ==============================================================
           TAB PARTNER & SOSTENITORI
        ============================================================== */}
        {activeTab === "partner" && <PartnerManager />}

        {/* ==============================================================
           TAB 0: ISCRIZIONI & RICHIESTE
        ============================================================== */}
        {activeTab === "richieste" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-4xl text-[#0a1c2a] font-light leading-tight">
                  Iscrizioni Corsi & Richieste Tesseramento
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1 line-clamp-2 sm:line-clamp-none">
                  Gestione candidature arrivate dal sito: contatta gli aspiranti marinai e soci su WhatsApp o via email e aggiorna lo stato.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAllData}
                  className="px-3 py-2 border border-slate-300 hover:border-slate-800 text-xs font-mono text-slate-700 hover:text-[#0a1c2a] flex items-center gap-1.5 transition-colors cursor-pointer bg-white shadow-2xs"
                  title="Aggiorna elenco richieste"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aggiorna</span>
                </button>
              </div>
            </div>

            {/* Filtri rapidi per stato */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-200 pb-4 text-xs font-mono">
              <button
                onClick={() => setBookingFilter("tutte")}
                className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
                  bookingFilter === "tutte"
                    ? "bg-[#0a1c2a] text-white border-[#0a1c2a] font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                Tutte ({bookings.length})
              </button>
              <button
                onClick={() => setBookingFilter("in_attesa_pagamento")}
                className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                  bookingFilter === "in_attesa_pagamento"
                    ? "bg-amber-600 text-white border-amber-600 font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                <span>In Attesa Pagamento ({bookings.filter((b) => b.status === "in_attesa_pagamento").length})</span>
                {bookings.filter((b) => b.status === "in_attesa_pagamento").length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
              <button
                onClick={() => setBookingFilter("nuova")}
                className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                  bookingFilter === "nuova"
                    ? "bg-sky-600 text-white border-sky-600 font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                <span>Nuove Corsi ({bookings.filter((b) => b.status === "nuova").length})</span>
                {bookings.filter((b) => b.status === "nuova").length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                )}
              </button>
              <button
                onClick={() => setBookingFilter("contattato")}
                className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
                  bookingFilter === "contattato"
                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                Contattati ({bookings.filter((b) => b.status === "contattato").length})
              </button>
              <button
                onClick={() => setBookingFilter("iscritto")}
                className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
                  bookingFilter === "iscritto"
                    ? "bg-emerald-700 text-white border-emerald-700 font-bold"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                }`}
              >
                Iscritti / Confermati ({bookings.filter((b) => b.status === "iscritto").length})
              </button>
            </div>

            {/* Elenco Richieste */}
            {(() => {
              const filtered = bookings.filter((b) =>
                bookingFilter === "tutte" ? true : b.status === bookingFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center bg-white border border-slate-200 space-y-3">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a]">
                      Nessuna richiesta trovata
                    </h3>
                    <p className="text-xs text-slate-700 max-w-sm mx-auto font-light">
                      {bookingFilter === "tutte"
                        ? "Non ci sono ancora richieste pervenute dal modulo corsi o tesseramento. Quando un utente invia il form, comparirà qui con tutti i dettagli e la notifica."
                        : `Nessuna richiesta nello stato "${bookingFilter}".`}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((item) => {
                    const cleanPhone = item.phone ? item.phone.replace(/[^0-9+]/g, "") : "";
                    const waLink = cleanPhone
                      ? `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
                          `Buongiorno ${item.name}, ti contatto dall'Associazione Vela Latina Monte di Procida in merito alla tua richiesta per "${item.itemTitle}".`
                        )}`
                      : "";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-6 bg-white border transition-all ${
                          item.status === "in_attesa_pagamento"
                            ? "border-amber-400 shadow-xs bg-amber-50/20"
                            : item.status === "nuova"
                            ? "border-sky-300 shadow-xs bg-sky-50/10"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-bold ${
                                item.type === "corso"
                                  ? "bg-[#0a1c2a] text-white"
                                  : "bg-[#b8860b] text-white"
                              }`}
                            >
                              {item.type === "corso" ? (
                                <>
                                  <GraduationCap className="w-3 h-3 text-[#c99a45]" />
                                  Corso di Mare
                                </>
                              ) : (
                                <>
                                  <Building2 className="w-3 h-3 text-white" />
                                  Tesseramento Socio
                                </>
                              )}
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold rounded-xs ${
                                item.status === "in_attesa_pagamento"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                                  : item.status === "nuova"
                                  ? "bg-sky-100 text-sky-900 border border-sky-300 font-bold"
                                  : item.status === "contattato"
                                  ? "bg-blue-100 text-blue-900 border border-blue-200"
                                  : item.status === "iscritto"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              ● {item.status === "in_attesa_pagamento" ? "IN ATTESA PAGAMENTO" : item.status.toUpperCase()}
                            </span>

                            <span className="text-[10px] font-mono text-slate-600">
                              {new Date(item.createdAt).toLocaleString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Selettore cambio stato rapido */}
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-600 text-[10px] uppercase">Stato:</span>
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateBookingStatus(item.id, e.target.value as any)
                              }
                              className="px-2.5 py-1 bg-[#fbfaf6] border border-slate-300 text-xs text-[#0a1c2a] font-semibold focus:border-[#0a1c2a] outline-none cursor-pointer"
                            >
                              <option value="in_attesa_pagamento">In attesa pagamento</option>
                              <option value="nuova">Nuova (Da contattare)</option>
                              <option value="contattato">Contattato</option>
                              <option value="iscritto">Iscritto / Confermato</option>
                              <option value="archiviata">Archiviata</option>
                            </select>

                            <button
                              onClick={() => handleDeleteBooking(item.id)}
                              className="p-1 text-slate-400 hover:text-red-700 transition-colors cursor-pointer ml-2"
                              title="Elimina richiesta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Corpo della richiesta */}
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          <div className="md:col-span-5 space-y-1">
                            <h4 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-medium leading-snug">
                              {item.name}
                            </h4>
                            <div className="text-xs font-mono font-bold text-[#1b5b80]">
                              {item.itemTitle}
                            </div>
                            {item.dataLuogoNascita && (
                              <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>Nascita:</span>
                                <span className="font-semibold text-slate-900">{item.dataLuogoNascita}</span>
                              </div>
                            )}
                            {item.codiceFiscale && (
                              <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
                                <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>C.F.:</span>
                                <span className="font-semibold text-slate-900 font-mono">{item.codiceFiscale}</span>
                              </div>
                            )}
                            {item.experience && (
                              <div className="text-[11px] font-mono text-slate-600">
                                Livello: <span className="capitalize">{item.experience}</span>
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-3 space-y-2 text-xs font-mono">
                            {item.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`tel:${item.phone}`}
                                  className="text-[#0a1c2a] hover:underline font-semibold"
                                >
                                  {item.phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <a
                                  href={`mailto:${item.email}`}
                                className="text-[#0a1c2a] hover:underline"
                              >
                                {item.email}
                              </a>
                            </div>
                          </div>

                          {/* Azioni Rapide Contatto & Approvazione */}
                          <div className="md:col-span-4 flex flex-wrap lg:justify-end gap-2 items-center">
                            {item.type === "tesseramento" && item.status !== "iscritto" && (
                              <Link
                                href={`/admin/iscrizioni/approva?id=${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b8860b] hover:bg-[#996f08] text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors cursor-pointer shadow-2xs"
                                title="Conferma pagamento quota e iscrivi al Libro Soci"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Conferma Pagamento & Iscrivi</span>
                              </Link>
                            )}

                            {item.type === "tesseramento" && item.status === "iscritto" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] uppercase font-mono tracking-wider font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Iscritto nel Libro Soci</span>
                              </span>
                            )}

                            {item.type === "corso" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailModalBooking(item);
                                  setEmailCustomMessage("");
                                  setEmailDataLezione("");
                                  setEmailLuogo("Porticciolo di Acquamorta, Banchina Pescatori (Monte di Procida)");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors cursor-pointer shadow-2xs"
                                title="Invia email ufficiale di riscontro per questo corso"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#c99a45]" />
                                <span>Invia Email Corso</span>
                              </button>
                            )}

                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors cursor-pointer shadow-2xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <a
                              href={`mailto:${item.email}?subject=${encodeURIComponent(
                                `Vela Latina Monte di Procida — Riscontro per ${item.itemTitle}`
                              )}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1c2a] hover:bg-[#b8860b] text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          </div>
                        </div>

                        {/* Messaggio o note */}
                        {item.message && (
                          <div className="mt-4 p-3 bg-[#fbfaf6] border border-slate-200 text-xs text-slate-700 font-light italic">
                            <span className="font-mono text-[10px] font-bold text-slate-600 uppercase not-italic block mb-0.5">
                              Note / Disponibilità indicate:
                            </span>
                            “{item.message}”
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ==============================================================
           TAB: LIBRO SOCI
        ============================================================== */}
        {activeTab === "soci" && (
          <LibroSociManager
            soci={soci}
            onReload={loadAllData}
            showToast={showToast}
          />
        )}

        {/* ==============================================================
           TAB: ANAGRAFICA & DOCUMENTI RUNTS
        ============================================================== */}
        {activeTab === "anagrafica" && (
          <AnagraficaManager
            initialData={anagrafica || ({} as any)}
            onReload={loadAllData}
            showToast={showToast}
          />
        )}

        {/* ==============================================================
           TAB 1: EVENTI
        ============================================================== */}
        {activeTab === "eventi" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                  Eventi & Palmarès della Flotta
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1">
                  Regate storiche, trofei vinti, manifestazioni e presenze nel cinema/TV.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllData}
                  disabled={loadingData}
                  className="p-2.5 border border-slate-300 bg-white hover:border-[#0a1c2a] text-slate-700 transition-colors cursor-pointer"
                  title="Ricarica"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/admin/eventi/editor"
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Evento</span>
                </Link>
              </div>
            </div>

            {/* Vista Mobile Cards (schermi piccoli < md) */}
            <div className="block md:hidden space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white border border-slate-300 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="uppercase text-[9px] px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 font-mono font-bold">
                        {evt.category}
                      </span>
                      {evt.badge && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-bold font-mono">
                          <Award className="w-3 h-3 text-amber-700" />
                          {evt.badge}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleEventPublish(evt)}
                      title={evt.published ? "Clicca per nascondere" : "Clicca per pubblicare"}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold border cursor-pointer shrink-0 font-mono ${
                        evt.published
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}
                    >
                      {evt.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{evt.published ? "Online" : "Bozza"}</span>
                    </button>
                  </div>

                  {/* Anteprima Foto o Placeholder Foto Mancante */}
                  <div className="rounded-xs overflow-hidden border border-slate-200">
                    {evt.imageUrl ? (
                      <div className="relative h-28 w-full">
                        <Image src={evt.imageUrl} alt={evt.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <PhotoPlaceholder title={evt.title} className="h-24 border-0" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0a1c2a] leading-snug">
                      {evt.title}
                    </h3>
                    {evt.description && (
                      <p className="text-slate-600 text-xs font-light line-clamp-2 mt-1">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-700 bg-[#fbfaf6] p-2 border border-slate-200 space-y-1">
                    <div className="font-bold text-[#0a1c2a] flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                    {evt.result && (
                      <div className="text-[#0a1c2a] font-semibold text-[10px] pt-1 border-t border-slate-200 mt-1 flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-[#c99a45]" />
                        <span>{evt.result}</span>
                      </div>
                    )}
                  </div>

                  {evt.articleSlug ? (
                    <Link
                      href={`/blog/${evt.articleSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#1b5b80] font-semibold underline"
                    >
                      <span>Articolo collegato</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/blog/editor?title=${encodeURIComponent(`Diario di Bordo: ${evt.title}`)}&category=Reportage+Regata`}
                      className="text-[10px] font-mono text-slate-700 hover:text-[#0a1c2a] font-bold underline cursor-pointer"
                    >
                      + Scrivi Articolo Blog
                    </Link>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Link
                      href={`/admin/eventi/editor?id=${evt.id}`}
                      className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="py-2 px-3 border border-slate-300 text-red-600 bg-white hover:bg-red-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="p-8 text-center text-slate-600 font-light bg-white border border-slate-200">
                  Nessun evento presente. Creane uno nuovo con il pulsante in alto.
                </div>
              )}
            </div>

            {/* List Table Desktop (>= md) */}
            <div className="hidden md:block bg-white border border-slate-300 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#fbfaf6] border-b border-slate-300 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Stato</th>
                      <th className="p-4">Titolo & Descrizione</th>
                      <th className="p-4">Data / Luogo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Risultato / Badge</th>
                      <th className="p-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleEventPublish(evt)}
                            title={evt.published ? "Clicca per nascondere" : "Clicca per pubblicare"}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border cursor-pointer ${
                              evt.published
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            {evt.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{evt.published ? "Online" : "Bozza"}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {evt.imageUrl ? (
                              <div className="relative w-12 h-10 rounded-xs overflow-hidden border border-slate-300 shrink-0">
                                <Image src={evt.imageUrl} alt={evt.title} fill className="object-cover" />
                              </div>
                            ) : (
                              <PhotoPlaceholder compact title={evt.title} className="w-fit shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-sans font-semibold text-sm text-[#0a1c2a]">
                                {evt.title}
                              </div>
                              <div className="text-slate-600 font-sans text-xs line-clamp-1 mt-0.5 font-light">
                                {evt.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          <div className="font-bold text-[#0a1c2a]">{evt.date}</div>
                          <div className="text-[10px] text-slate-600">{evt.location}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="uppercase text-[9px] px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300">
                            {evt.category}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {evt.badge && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#0a1c2a] font-bold">
                              <Award className="w-3 h-3 text-amber-700 shrink-0" />
                              <span>{evt.badge}</span>
                            </span>
                          )}
                          {evt.result && (
                            <span className="text-[9px] text-slate-600 font-sans block">
                              {evt.result}
                            </span>
                          )}
                          {evt.articleSlug ? (
                            <Link
                              href={`/blog/${evt.articleSlug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[9px] text-[#1b5b80] hover:text-[#0a1c2a] font-semibold underline mt-1"
                            >
                              <span>Articolo collegato</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/blog/editor?title=${encodeURIComponent(`Diario di Bordo: ${evt.title}`)}&category=Reportage+Regata`}
                              className="text-[9px] text-slate-700 hover:text-[#0a1c2a] font-bold underline mt-1 block cursor-pointer"
                            >
                              + Scrivi Articolo
                            </Link>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/eventi/editor?id=${evt.id}`}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer inline-flex items-center justify-center"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteEvent(evt.id, evt.title)}
                              className="p-1.5 border border-slate-300 hover:border-red-600 text-slate-700 hover:text-red-600 bg-white cursor-pointer"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-600 font-light">
                          Nessun evento presente. Creane uno nuovo con il pulsante in alto a destra.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
           TAB 2: BLOG & NOTIZIE
        ============================================================== */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                  Blog, Racconti & Rassegna Stampa
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1">
                  Articoli sulla tradizione dei maestri d&apos;ascia, diari di bordo e aggiornamenti.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllData}
                  disabled={loadingData}
                  className="p-2.5 border border-slate-300 bg-white hover:border-[#0a1c2a] text-slate-700 transition-colors cursor-pointer"
                  title="Ricarica"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/admin/blog/editor"
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Articolo</span>
                </Link>
              </div>
            </div>

            {/* Vista Mobile Cards (schermi piccoli < md) */}
            <div className="block md:hidden space-y-3">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-slate-300 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="uppercase text-[9px] px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 font-mono font-bold">
                      {post.category}
                    </span>
                    <button
                      onClick={() => handleToggleBlogPublish(post)}
                      title={post.published ? "Clicca per nascondere" : "Clicca per pubblicare"}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold border cursor-pointer shrink-0 font-mono ${
                        post.published
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}
                    >
                      {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{post.published ? "Online" : "Bozza"}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0a1c2a] leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5 truncate">
                      /blog/{post.slug}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-700 bg-[#fbfaf6] p-2 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[9px] block">Autore</span>
                      <span className="font-semibold text-[#0a1c2a]">{post.author}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[9px] block">Data</span>
                      <span className="text-slate-700">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1"
                      title="Apri sul sito"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Vedi</span>
                    </Link>
                    <Link
                      href={`/admin/blog/editor?id=${post.id}`}
                      className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteBlogPost(post.id, post.title)}
                      className="py-2 px-3 border border-slate-300 text-red-600 bg-white hover:bg-red-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              ))}

              {blogPosts.length === 0 && (
                <div className="p-8 text-center text-slate-600 font-light bg-white border border-slate-200">
                  Nessun articolo blog presente. Clicca su &quot;Nuovo Articolo&quot;.
                </div>
              )}
            </div>

            {/* List Table Desktop (>= md) */}
            <div className="hidden md:block bg-white border border-slate-300 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#fbfaf6] border-b border-slate-300 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Stato</th>
                      <th className="p-4">Titolo & Slug</th>
                      <th className="p-4">Autore / Categoria</th>
                      <th className="p-4">Data Pubblicazione</th>
                      <th className="p-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleBlogPublish(post)}
                            title={post.published ? "Clicca per nascondere" : "Clicca per pubblicare"}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border cursor-pointer ${
                              post.published
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{post.published ? "Online" : "Bozza"}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-sans font-semibold text-sm text-[#0a1c2a]">
                            {post.title}
                          </div>
                          <div className="text-slate-600 font-mono text-[10px] mt-0.5">
                            /blog/{post.slug}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          <div className="font-semibold text-[#0a1c2a]">{post.author}</div>
                          <div className="text-[10px] text-slate-600">{post.category}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                              title="Visualizza articolo sul sito"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/admin/blog/editor?id=${post.id}`}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer inline-flex items-center justify-center"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBlogPost(post.id, post.title)}
                              className="p-1.5 border border-slate-300 hover:border-red-600 text-slate-700 hover:text-red-600 bg-white cursor-pointer"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blogPosts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-600 font-light">
                          Nessun articolo blog presente. Clicca su &quot;Nuovo Articolo&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
           TAB 3: CALENDARIO CORSI
        ============================================================== */}
        {activeTab === "corsi" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-4xl text-[#0a1c2a] font-light leading-tight">
                  Calendario Corsi & Sessioni Formative
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1 line-clamp-2 sm:line-clamp-none">
                  Date di avvio, orari, istruttori e disponibilità posti per Voga in Piedi, Vela Latina e Progetto ROSA.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllData}
                  disabled={loadingData}
                  className="p-2.5 border border-slate-300 bg-white hover:border-[#0a1c2a] text-slate-700 transition-colors cursor-pointer"
                  title="Ricarica"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/admin/corsi/editor"
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuova Sessione</span>
                </Link>
              </div>
            </div>

            {/* Vista Mobile Cards (schermi piccoli < md) */}
            <div className="block md:hidden space-y-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-300 p-4 shadow-2xs space-y-3 overflow-hidden"
                >
                  {c.imageUrl ? (
                    <div className="relative w-full h-36 border-b border-slate-200 overflow-hidden bg-slate-100 -mt-4 -mx-4 mb-2">
                      <Image
                        src={c.imageUrl}
                        alt={c.courseTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="-mt-4 -mx-4 mb-2">
                      <PhotoPlaceholder title={c.courseTitle} className="h-28 border-0 border-b border-slate-200" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold border font-mono ${
                        c.status === "aperte"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : c.status === "in-esaurimento"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      ● {c.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 font-bold">
                      {c.availableSeats} / {c.totalSeats} posti
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0a1c2a] leading-snug">
                      {c.courseTitle}
                    </h3>
                    {(c.notes || c.price) && (
                      <p className="text-slate-600 text-xs font-light line-clamp-2 mt-1">
                        {c.notes || c.price}
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-700 bg-[#fbfaf6] p-2.5 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">Inizio:</span>
                      <span className="font-bold text-[#0a1c2a] inline-flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{c.startDate}</span>
                      </span>
                    </div>
                    {c.schedule && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 text-[10px] shrink-0">Orari:</span>
                        <span className="text-slate-700 text-right">{c.schedule}</span>
                      </div>
                    )}
                    {c.instructor && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-500 text-[10px]">Istruttore:</span>
                        <span className="text-[#0a1c2a] font-semibold">{c.instructor}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Link
                      href={`/admin/corsi/editor?id=${c.id}`}
                      className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.courseTitle)}
                      className="py-2 px-3 border border-slate-300 text-red-600 bg-white hover:bg-red-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="p-8 text-center text-slate-600 font-light bg-white border border-slate-200">
                  Nessuna sessione di corso configurata.
                </div>
              )}
            </div>

            {/* List Table Desktop (>= md) */}
            <div className="hidden md:block bg-white border border-slate-300 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#fbfaf6] border-b border-slate-300 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Stato Iscrizioni</th>
                      <th className="p-4">Percorso & Sessione</th>
                      <th className="p-4">Data Inizio / Orari</th>
                      <th className="p-4">Posti (Disponibili/Totali)</th>
                      <th className="p-4">Istruttore</th>
                      <th className="p-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border ${
                              c.status === "aperte"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {c.imageUrl ? (
                              <div className="relative w-12 h-9 shrink-0 border border-slate-300 bg-slate-100 overflow-hidden shadow-2xs">
                                <Image
                                  src={c.imageUrl}
                                  alt={c.courseTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <PhotoPlaceholder compact title={c.courseTitle} className="w-fit shrink-0" />
                            )}
                            <div>
                              <div className="font-sans font-semibold text-sm text-[#0a1c2a]">
                                {c.courseTitle}
                              </div>
                              <div className="text-slate-600 font-sans text-xs line-clamp-1 mt-0.5">
                                {c.notes || c.price}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          <div className="font-bold text-[#0a1c2a]">{c.startDate}</div>
                          <div className="text-[10px] text-slate-600">{c.schedule}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          <span className="font-bold text-[#0a1c2a] text-sm">
                            {c.availableSeats}
                          </span>
                          <span className="text-slate-500"> / {c.totalSeats} posti</span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-700 font-sans text-xs">
                          {c.instructor}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/corsi/editor?id=${c.id}`}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer inline-flex items-center justify-center"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.courseTitle)}
                              className="p-1.5 border border-slate-300 hover:border-red-600 text-slate-700 hover:text-red-600 bg-white cursor-pointer"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-600 font-light">
                          Nessuna sessione di corso configurata.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
           TAB: PROGETTI STRATEGICI & CANTIERI
        ============================================================== */}
        {activeTab === "progetti" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                  Progetti Strategici & Cantieri 2027
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1">
                  Gestione dei cantieri operativi, spedizioni (Saint-Tropez, America&apos;s Cup, Trieste) e partenariati.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllData}
                  disabled={loadingData}
                  className="p-2.5 border border-slate-300 bg-white hover:border-[#0a1c2a] text-slate-700 transition-colors cursor-pointer"
                  title="Ricarica"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/admin/progetti/editor"
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuovo Progetto</span>
                </Link>
              </div>
            </div>

            {/* Vista Mobile Cards (schermi piccoli < md) */}
            <div className="block md:hidden space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-300 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#0a1c2a] text-white">
                        #{proj.number}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-[9px] bg-slate-100 border border-slate-300 text-slate-800 font-mono font-bold">
                        {proj.category}
                      </span>
                      {proj.badge && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-bold font-mono">
                          <Award className="w-3 h-3 text-amber-700" />
                          {proj.badge}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleProjectPublish(proj)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold cursor-pointer shrink-0"
                      title="Clicca per invertire stato"
                    >
                      {proj.published ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 font-bold">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 border border-slate-300 px-2 py-0.5 font-bold">
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          Bozza
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Anteprima Foto o Placeholder Foto Mancante */}
                  <div className="rounded-xs overflow-hidden border border-slate-200">
                    {proj.imageUrl ? (
                      <div className="relative h-28 w-full">
                        <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <PhotoPlaceholder title={proj.title} className="h-24 border-0" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0a1c2a] leading-snug">
                      {proj.title}
                    </h3>
                    {proj.highlight && (
                      <p className="text-[11px] text-slate-600 italic font-serif mt-0.5">
                        {proj.highlight}
                      </p>
                    )}
                    {proj.partner && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">
                        Partner: {proj.partner}
                      </span>
                    )}
                  </div>

                  {/* Referente & Avanzamento */}
                  <div className="text-[11px] font-mono text-slate-700 bg-[#fbfaf6] p-2.5 border border-slate-200 space-y-2">
                    {proj.referente ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[9px] uppercase font-bold">Referente Progetto</span>
                          {proj.anagrafica?.codiceProgetto && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-[#0a1c2a] text-[#c99a45] font-bold">
                              {proj.anagrafica.codiceProgetto}
                            </span>
                          )}
                        </div>
                        <div className="font-sans font-bold text-xs text-[#0a1c2a] mt-0.5">
                          {proj.referente.nome}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate">
                          {proj.referente.ruolo}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-200 text-[10px]">
                          {proj.referente.telefono && (
                            <a
                              href={`tel:${proj.referente.telefono}`}
                              className="text-[#0a1c2a] hover:underline font-bold inline-flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{proj.referente.telefono}</span>
                            </a>
                          )}
                          {proj.referente.email && (
                            <a
                              href={`mailto:${proj.referente.email}`}
                              className="text-slate-600 hover:underline truncate max-w-[150px] inline-flex items-center gap-1.5"
                            >
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate">{proj.referente.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Referente non assegnato</span>
                    )}

                    {/* Stato & Progresso */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[9px] font-bold border ${
                            proj.status === "In Corso"
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : proj.status === "Completato"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {proj.status}
                        </span>
                        {typeof proj.anagrafica?.statoAvanzamento === "number" && (
                          <span className="text-[10px] text-slate-600 font-bold">
                            {proj.anagrafica.statoAvanzamento}%
                          </span>
                        )}
                      </div>
                      {typeof proj.anagrafica?.statoAvanzamento === "number" && (
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0a1c2a] h-full"
                            style={{ width: `${proj.anagrafica.statoAvanzamento}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Link
                      href={`/progetti/${proj.slug}`}
                      target="_blank"
                      className="py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1"
                      title="Visualizza pagina dedicata pubblica"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Vedi</span>
                    </Link>
                    <Link
                      href={`/admin/progetti/editor?id=${proj.id}`}
                      className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="py-2 px-3 border border-slate-300 text-rose-600 bg-white hover:bg-rose-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="p-8 text-center text-slate-600 font-light bg-white border border-slate-200">
                  Nessun progetto strategico configurato.
                </div>
              )}
            </div>

            {/* Tabella Progetti Desktop (>= md) */}
            <div className="hidden md:block bg-white border border-slate-300 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfaf6] border-b border-slate-300 text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold">
                    <tr>
                      <th className="p-4 w-12 text-center">N.</th>
                      <th className="p-4">Progetto & Traguardo</th>
                      <th className="p-4">Categoria & Badge</th>
                      <th className="p-4">Referente & Contatti</th>
                      <th className="p-4">Stato / Avanzamento</th>
                      <th className="p-4">Pubblicazione</th>
                      <th className="p-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-center font-bold text-[#0a1c2a]">
                          {proj.number}
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            {proj.imageUrl ? (
                              <div className="relative w-12 h-10 rounded-xs overflow-hidden border border-slate-300 shrink-0">
                                <Image src={proj.imageUrl} alt={proj.title} fill className="object-cover" />
                              </div>
                            ) : (
                              <PhotoPlaceholder compact title={proj.title} className="w-fit shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-sans font-semibold text-sm text-[#0a1c2a] block">
                                {proj.title}
                              </span>
                              <span className="text-[11px] text-slate-600 italic font-serif block">
                                {proj.highlight}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                                {proj.partner || "Campi Flegrei"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 text-[9px] bg-slate-100 border border-slate-300 text-slate-800 font-bold mb-1">
                            {proj.category}
                          </span>
                          {proj.badge && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-900 font-semibold">
                              <Award className="w-3 h-3 text-amber-700 shrink-0" />
                              <span>{proj.badge}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {proj.referente ? (
                            <div>
                              <span className="font-sans font-bold text-xs text-[#0a1c2a] block">
                                {proj.referente.nome}
                              </span>
                              <span className="text-[10px] text-slate-600 block truncate max-w-[200px]">
                                {proj.referente.ruolo}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                                <a
                                  href={`tel:${proj.referente.telefono}`}
                                  className="text-[#0a1c2a] hover:underline font-semibold"
                                >
                                  {proj.referente.telefono}
                                </a>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                                {proj.referente.email}
                              </div>
                              {proj.anagrafica?.codiceProgetto && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-[#0a1c2a] text-[#c99a45] font-mono font-bold">
                                  {proj.anagrafica.codiceProgetto}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Da assegnare</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold border ${
                              proj.status === "In Corso"
                                ? "bg-sky-50 text-sky-800 border-sky-300"
                                : proj.status === "Completato"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            {proj.status}
                          </span>
                          {typeof proj.anagrafica?.statoAvanzamento === "number" && (
                            <div className="mt-1.5 w-24">
                              <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-0.5">
                                <span>Progresso</span>
                                <span>{proj.anagrafica.statoAvanzamento}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#0a1c2a] h-full"
                                  style={{ width: `${proj.anagrafica.statoAvanzamento}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleProjectPublish(proj)}
                            className="inline-flex items-center gap-1.5 cursor-pointer group"
                            title="Clicca per invertire stato"
                          >
                            {proj.published ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 group-hover:underline">
                                <Eye className="w-3 h-3 text-emerald-600" />
                                Pubblicato
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 group-hover:underline">
                                <EyeOff className="w-3 h-3 text-slate-400" />
                                Bozza
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/progetti/${proj.slug}`}
                              target="_blank"
                              className="p-1.5 border border-slate-300 text-slate-700 hover:text-[#0a1c2a] hover:border-[#0a1c2a] transition-colors"
                              title="Visualizza Pagina Dedicata Pubblica"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/admin/progetti/editor?id=${proj.id}`}
                              className="p-1.5 border border-slate-300 text-slate-700 hover:text-[#0a1c2a] hover:border-[#0a1c2a] transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-1.5 border border-slate-300 text-rose-600 hover:text-rose-900 hover:border-rose-600 transition-colors cursor-pointer"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-600 font-light">
                          Nessun progetto strategico configurato.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
           TAB 4: CONFIGURAZIONE & DATABASE (NEON / VERCEL)
        ============================================================== */}
        {activeTab === "db" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                Infrastruttura Dati & Connessione Cloud
              </h2>
              <p className="text-xs text-slate-700 font-light mt-1">
                Stato della persistenza dei dati tra sviluppo locale e deployment Vercel.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-300 space-y-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-[#1b5b80] mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#0a1c2a]">
                    Architettura Ibrida: File Store Locale ⇄ Neon PostgreSQL
                  </h3>
                  <p className="text-xs text-slate-700 font-light mt-1 leading-relaxed">
                    Il backend è già predisposto per collegarsi direttamente a <strong>Neon / Vercel Postgres</strong>.
                    Quando la variabile d&apos;ambiente <code className="bg-slate-100 px-1.5 py-0.5 border text-slate-800">POSTGRES_URL</code> non è ancora presente, il sistema usa automaticamente la persistenza JSON sicura in <code className="bg-slate-100 px-1.5 py-0.5 border text-slate-800">data/content/</code> senza causare errori.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#fbfaf6] border border-slate-200 text-xs font-mono space-y-2">
                <div className="font-bold text-[#0a1c2a]">Come abilitare Neon Postgres su Vercel:</div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                  <li>Vai sulla dashboard del progetto su <strong>vercel.com</strong></li>
                  <li>Apri la scheda <strong>Storage</strong> e seleziona <strong>Postgres (Neon)</strong></li>
                  <li>Clicca su <strong>Create Database</strong> e collegalo al progetto</li>
                  <li>Vercel inietterà automaticamente la variabile <code className="text-[#0a1c2a] font-bold">POSTGRES_URL</code></li>
                  <li>Al primo avvio, le tabelle <code className="text-slate-900">eventi</code>, <code className="text-slate-900">blog_posts</code>, <code className="text-slate-900">corsi_calendar</code> e <code className="text-slate-900">admin_users</code> verranno create e popolate all&apos;istante!</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-slate-700 font-semibold">
                  Credenziali Admin Predefinite: admin@velalatinamontediprocida.it
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 font-bold">
                  Sistema Attivo & Pronto
                </span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Modal Invio Email Riscontro Corso */}
      {emailModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0a1c2a] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#c99a45]">
              <div>
                <span className="text-[10px] font-mono text-[#c99a45] uppercase tracking-widest font-bold block">
                  Comunicazione Allievo Corso
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-light">
                  Invia Email di Riscontro
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalBooking(null)}
                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs font-mono text-[11px] space-y-1">
                <div>
                  <strong className="text-slate-600">Allievo:</strong>{" "}
                  <span className="text-[#0a1c2a] font-bold">{emailModalBooking.name}</span> &lt;{emailModalBooking.email}&gt;
                </div>
                <div>
                  <strong className="text-slate-600">Corso:</strong>{" "}
                  <span className="text-[#1b5b80] font-semibold">{emailModalBooking.itemTitle}</span>
                </div>
                {emailModalBooking.phone && (
                  <div>
                    <strong className="text-slate-600">Telefono:</strong> {emailModalBooking.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 mb-1">
                  Data/Orario prima lezione o incontro (opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Es: Sabato prossimo ore 10:00"
                  value={emailDataLezione}
                  onChange={(e) => setEmailDataLezione(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs focus:border-[#0a1c2a] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 mb-1">
                  Luogo di ritrovo
                </label>
                <input
                  type="text"
                  value={emailLuogo}
                  onChange={(e) => setEmailLuogo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs focus:border-[#0a1c2a] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 mb-1">
                  Messaggio personalizzato per l&apos;allievo (opzionale)
                </label>
                <textarea
                  rows={4}
                  placeholder="Lascia vuoto per inviare il testo ufficiale predefinito, oppure scrivi indicazioni specifiche per l'allievo..."
                  value={emailCustomMessage}
                  onChange={(e) => setEmailCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs focus:border-[#0a1c2a] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEmailModalBooking(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-mono text-[11px] font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={handleSendCourseEmail}
                  className="px-5 py-2 bg-[#0a1c2a] hover:bg-[#b8860b] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{sendingEmail ? "Invio in corso..." : "Invia Email Ufficiale"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Caricamento Foto Rapido da Smartphone / Desktop */}
      <QuickPhotoUploaderModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoUploaded={() => {
          showToast("success", "Foto caricata con successo!");
          loadAllData();
        }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center p-6 text-xs font-mono text-slate-500">Caricamento pannello di amministrazione...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

