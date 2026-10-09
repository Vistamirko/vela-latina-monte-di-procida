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
} from "lucide-react";
import { EventItem, BlogPost, CourseSession, ProjectItem, BookingRequest, SocioItem, AnagraficaAssociazione } from "@/lib/db/types";
import LibroSociManager from "@/components/admin/LibroSociManager";
import AnagraficaManager from "@/components/admin/AnagraficaManager";

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
  const VALID_TABS: Record<string, "richieste" | "soci" | "anagrafica" | "eventi" | "blog" | "corsi" | "progetti" | "db"> = {
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

  const resolveTab = (param: string | null) => {
    if (!param) return "richieste";
    return VALID_TABS[param.toLowerCase()] || "richieste";
  };

  const [activeTab, setActiveTab] = useState<"richieste" | "soci" | "anagrafica" | "eventi" | "blog" | "corsi" | "progetti" | "db">(() => resolveTab(tabParam));

  useEffect(() => {
    if (tabParam && VALID_TABS[tabParam.toLowerCase()]) {
      setActiveTab(VALID_TABS[tabParam.toLowerCase()]);
    }
  }, [tabParam]);

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
      <header className="bg-white border-b border-slate-300 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma"
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-['Cinzel'] text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-[#0a1c2a] block leading-tight truncate">
                Vela Latina Monte di Procida
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono tracking-wider sm:tracking-widest uppercase text-slate-700 font-semibold block truncate">
                Pannello API & Gestione
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-700 bg-[#fbfaf6] px-3 py-1.5 border border-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[140px]">{currentUser?.name || currentUser?.email}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-[11px] sm:text-xs font-mono text-slate-700 hover:text-[#0a1c2a] flex items-center gap-1 font-semibold px-2 py-1.5 border border-transparent hover:border-slate-300 transition-colors"
            >
              <span className="hidden xs:inline">Sito</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Esci</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 border-t border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("richieste")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "richieste"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Iscrizioni ({bookings.length})</span>
            {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-600 text-white rounded-full font-bold">
                {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("soci")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "soci"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Libro Soci ({soci.length})</span>
            {soci.filter((s) => s.anno === 2026).length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-700 text-white rounded-full font-bold">
                {soci.filter((s) => s.anno === 2026).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("anagrafica")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "anagrafica"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#c99a45]" />
            <span>Anagrafica & RUNTS</span>
            {anagrafica?.documenti && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-bold">
                {anagrafica.documenti.length} doc
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("eventi")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "eventi"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Eventi ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "blog"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Blog ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("corsi")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "corsi"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Corsi ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("progetti")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "progetti"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Progetti ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("db")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
              activeTab === "db"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database</span>
          </button>
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {/* ==============================================================
           TAB 0: ISCRIZIONI & RICHIESTE
        ============================================================== */}
        {activeTab === "richieste" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                  Iscrizioni Corsi & Richieste Tesseramento
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1">
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
                              className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-bold ${
                                item.type === "corso"
                                  ? "bg-[#0a1c2a] text-white"
                                  : "bg-[#b8860b] text-white"
                              }`}
                            >
                              {item.type === "corso" ? "⛵ Corso di Mare" : "🏛️ Tesseramento Socio"}
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
                              <div className="text-[11px] font-mono text-slate-700">
                                🎂 Nascita: <span className="font-semibold text-slate-900">{item.dataLuogoNascita}</span>
                              </div>
                            )}
                            {item.codiceFiscale && (
                              <div className="text-[11px] font-mono text-slate-700">
                                🪪 C.F.: <span className="font-semibold text-slate-900 font-mono">{item.codiceFiscale}</span>
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
                        <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-bold font-mono">
                          ★ {evt.badge}
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

                  <div className="text-[11px] font-mono text-slate-700 bg-[#fbfaf6] p-2 border border-slate-200 space-y-0.5">
                    <div className="font-bold text-[#0a1c2a]">📅 {evt.date}</div>
                    <div className="text-slate-600">📍 {evt.location}</div>
                    {evt.result && (
                      <div className="text-[#0a1c2a] font-semibold text-[10px] pt-1 border-t border-slate-200 mt-1">
                        🏆 {evt.result}
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
                          <div className="font-sans font-semibold text-sm text-[#0a1c2a]">
                            {evt.title}
                          </div>
                          <div className="text-slate-600 font-sans text-xs line-clamp-1 mt-0.5 font-light">
                            {evt.description}
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
                            <span className="text-[10px] text-[#0a1c2a] font-bold block">
                              ★ {evt.badge}
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl text-[#0a1c2a] font-light">
                  Calendario Corsi & Sessioni Formative
                </h2>
                <p className="text-xs text-slate-700 font-light mt-1">
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
                  {c.imageUrl && (
                    <div className="relative w-full h-36 border-b border-slate-200 overflow-hidden bg-slate-100 -mt-4 -mx-4 mb-2">
                      <Image
                        src={c.imageUrl}
                        alt={c.courseTitle}
                        fill
                        className="object-cover"
                      />
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
                      <span className="font-bold text-[#0a1c2a]">📅 {c.startDate}</span>
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
                            {c.imageUrl && (
                              <div className="relative w-12 h-9 shrink-0 border border-slate-300 bg-slate-100 overflow-hidden shadow-2xs">
                                <Image
                                  src={c.imageUrl}
                                  alt={c.courseTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
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
                        <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-bold font-mono">
                          ★ {proj.badge}
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
                              className="text-[#0a1c2a] hover:underline font-bold flex items-center gap-1"
                            >
                              📞 {proj.referente.telefono}
                            </a>
                          )}
                          {proj.referente.email && (
                            <a
                              href={`mailto:${proj.referente.email}`}
                              className="text-slate-600 hover:underline truncate max-w-[150px]"
                            >
                              ✉️ {proj.referente.email}
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
                          <span className="font-sans font-semibold text-sm text-[#0a1c2a] block">
                            {proj.title}
                          </span>
                          <span className="text-[11px] text-slate-600 italic font-serif block">
                            {proj.highlight}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                            {proj.partner || "Campi Flegrei"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 text-[9px] bg-slate-100 border border-slate-300 text-slate-800 font-bold mb-1">
                            {proj.category}
                          </span>
                          {proj.badge && (
                            <span className="block text-[10px] text-amber-900 font-semibold">
                              ★ {proj.badge}
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

