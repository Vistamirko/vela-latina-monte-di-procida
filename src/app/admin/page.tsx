"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
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
} from "lucide-react";
import { EventItem, BlogPost, CourseSession, ProjectItem, BookingRequest, SocioItem } from "@/lib/db/types";
import LibroSociManager from "@/components/admin/LibroSociManager";
import ApproveMemberModal from "@/components/admin/ApproveMemberModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab: 'richieste' | 'soci' | 'eventi' | 'blog' | 'corsi' | 'progetti' | 'db'
  const [activeTab, setActiveTab] = useState<"richieste" | "soci" | "eventi" | "blog" | "corsi" | "progetti" | "db">("richieste");

  // Data states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [courses, setCourses] = useState<CourseSession[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [soci, setSoci] = useState<SocioItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<"tutte" | "nuova" | "in_attesa_pagamento" | "contattato" | "iscritto">("tutte");
  const [loadingData, setLoadingData] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<EventItem> | null>(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<Partial<BlogPost> | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<CourseSession> | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<ProjectItem> | null>(null);

  // Approve member modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedBookingToApprove, setSelectedBookingToApprove] = useState<BookingRequest | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [resEvt, resBlog, resCourses, resProj, resBookings, resSoci] = await Promise.all([
        fetch("/api/eventi?all=true"),
        fetch("/api/blog?all=true"),
        fetch("/api/corsi-calendar?all=true"),
        fetch("/api/progetti?all=true"),
        fetch("/api/iscrizioni"),
        fetch("/api/soci"),
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
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent?.title || !currentEvent.date) return;

    try {
      const isNew = !currentEvent.id;
      const res = await fetch("/api/eventi", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEvent),
      });

      if (!res.ok) throw new Error("Errore nel salvataggio");
      showToast("success", isNew ? "Evento creato con successo" : "Evento aggiornato");
      setEventModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

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
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlogPost?.title || !currentBlogPost.content) return;

    try {
      const isNew = !currentBlogPost.id;
      const res = await fetch("/api/blog", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentBlogPost),
      });

      if (!res.ok) throw new Error("Errore nel salvataggio");
      showToast("success", isNew ? "Articolo pubblicato" : "Articolo aggiornato");
      setBlogModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

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
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse?.courseTitle || !currentCourse.startDate) return;

    try {
      const isNew = !currentCourse.id;
      const res = await fetch("/api/corsi-calendar", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentCourse),
      });

      if (!res.ok) throw new Error("Errore salvataggio corso");
      showToast("success", isNew ? "Sessione corso creata" : "Sessione corso aggiornata");
      setCourseModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

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
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      const isNew = !currentProject.id;
      const res = await fetch("/api/progetti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProject),
      });

      if (!res.ok) throw new Error("Errore salvataggio progetto");
      showToast("success", isNew ? "Progetto creato con successo" : "Progetto aggiornato");
      setProjectModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

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
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/images/stemma-vela-latina.jpg"
                alt="Stemma"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-['Cinzel'] text-xs uppercase tracking-[0.2em] font-bold text-[#0a1c2a] block leading-tight">
                Vela Latina Monte di Procida
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-700 font-semibold">
                Pannello API & Gestione Contenuti
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-700 bg-[#fbfaf6] px-3 py-1.5 border border-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentUser?.name || currentUser?.email}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-xs font-mono text-slate-700 hover:text-[#0a1c2a] flex items-center gap-1 font-semibold"
            >
              <span>Vedi Sito</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Esci</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 border-t border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("richieste")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "richieste"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Iscrizioni & Richieste ({bookings.length})</span>
            {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-600 text-white rounded-full font-bold">
                {bookings.filter((b) => b.status === "in_attesa_pagamento" || b.status === "nuova").length} attive
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("soci")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "soci"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Libro Soci ({soci.length})</span>
            {soci.filter((s) => s.anno === 2026).length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-700 text-white rounded-full font-bold">
                {soci.filter((s) => s.anno === 2026).length} (2026)
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("eventi")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "eventi"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Eventi & Palmarès ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "blog"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Blog & Racconti ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("corsi")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "corsi"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Calendario Corsi ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("progetti")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "progetti"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Progetti & Cantieri ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("db")}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "db"
                ? "border-[#0a1c2a] text-[#0a1c2a] bg-white"
                : "border-transparent text-slate-600 hover:text-[#0a1c2a]"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & Cloud</span>
          </button>
        </div>
      </header>

      {/* Notifications Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 shadow-lg border text-xs font-mono font-semibold flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-[#0a1c2a] text-white border-slate-800"
                : "bg-red-700 text-white border-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
                        className={`p-6 bg-white border transition-all ${
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
                              <button
                                onClick={() => {
                                  setSelectedBookingToApprove(item);
                                  setApproveModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b8860b] hover:bg-[#996f08] text-white text-[10px] uppercase font-mono tracking-wider font-bold transition-colors cursor-pointer shadow-2xs"
                                title="Conferma pagamento quota e iscrivi al Libro Soci"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Conferma Pagamento & Iscrivi</span>
                              </button>
                            )}

                            {item.type === "tesseramento" && item.status === "iscritto" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] uppercase font-mono tracking-wider font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Iscritto nel Libro Soci</span>
                              </span>
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
                <button
                  onClick={() => {
                    setCurrentEvent({
                      title: "",
                      date: "",
                      location: "Canale di Procida",
                      category: "regata",
                      description: "",
                      badge: "",
                      result: "",
                      imageUrl: "/images/hero-sailing.webp",
                      published: true,
                    });
                    setEventModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Evento</span>
                </button>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-xs">
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
                            <button
                              onClick={() => {
                                const slug = `racconto-${evt.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}`;
                                setCurrentBlogPost({
                                  title: `Diario di Bordo & Racconto: ${evt.title}`,
                                  slug,
                                  category: "Reportage Regata",
                                  author: currentUser?.name || "Vela Latina",
                                  excerpt: `Cronaca, emozioni e manovre dell'evento ${evt.title} a ${evt.location} (${evt.date}).`,
                                  content: `L'evento ${evt.title} si è svolto a ${evt.location}.\n\nLe imbarcazioni dell'Associazione Vela Latina Monte di Procida hanno preso parte alla manifestazione affrontando il vento e le correnti con determinazione.\n\n[Inserisci qui il racconto dettagliato delle prove in mare, impressioni dell'equipaggio e fotografie...]`,
                                  coverImage: evt.imageUrl || "/images/hero-sailing.webp",
                                  published: true,
                                });
                                setActiveTab("blog");
                                setBlogModalOpen(true);
                              }}
                              className="text-[9px] text-slate-700 hover:text-[#0a1c2a] font-bold underline mt-1 block cursor-pointer"
                            >
                              + Scrivi Articolo
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCurrentEvent(evt);
                                setEventModalOpen(true);
                              }}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
                <button
                  onClick={() => {
                    setCurrentBlogPost({
                      title: "",
                      slug: "",
                      excerpt: "",
                      content: "",
                      category: "Cultura & Mare",
                      author: currentUser?.name || "Vela Latina Redazione",
                      coverImage: "/images/janara-crew.jpeg",
                      published: true,
                    });
                    setBlogModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Articolo</span>
                </button>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-xs">
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
                            <button
                              onClick={() => {
                                setCurrentBlogPost(post);
                                setBlogModalOpen(true);
                              }}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
                <button
                  onClick={() => {
                    setCurrentCourse({
                      courseKey: "voga",
                      courseTitle: "Scuola di Voga Tradizionale Flegrea",
                      startDate: new Date().toISOString().split("T")[0],
                      schedule: "Sabato mattina ore 09:30 – 12:30",
                      totalSeats: 12,
                      availableSeats: 6,
                      status: "aperte",
                      instructor: "Maestri Vogatori Montesi",
                      notes: "Porticciolo di Acquamorta",
                      price: "Incluso con tesseramento socio",
                      published: true,
                    });
                    setCourseModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuova Sessione</span>
                </button>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-xs">
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
                                : c.status === "in-esaurimento"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-red-50 text-red-800 border-red-300"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-sans font-semibold text-sm text-[#0a1c2a]">
                            {c.courseTitle}
                          </div>
                          <div className="text-slate-600 font-sans text-xs line-clamp-1 mt-0.5">
                            {c.notes || c.price}
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
                            <button
                              onClick={() => {
                                setCurrentCourse(c);
                                setCourseModalOpen(true);
                              }}
                              className="p-1.5 border border-slate-300 hover:border-[#0a1c2a] text-slate-700 hover:text-[#0a1c2a] bg-white cursor-pointer"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
                <button
                  onClick={() => {
                    const nextNum = String(projects.length + 1).padStart(2, "0");
                    setCurrentProject({
                      number: nextNum,
                      title: "",
                      highlight: "",
                      category: "Regata Internazionale",
                      partner: "Campi Flegrei · Rete Partner",
                      status: "In Corso",
                      description: "",
                      published: true,
                    });
                    setProjectModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#0a1c2a] text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#b8860b] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuovo Progetto</span>
                </button>
              </div>
            </div>

            {/* Tabella Progetti */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfaf6] border-b border-slate-300 text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold">
                    <tr>
                      <th className="p-4 w-12 text-center">N.</th>
                      <th className="p-4">Progetto & Traguardo</th>
                      <th className="p-4">Categoria & Badge</th>
                      <th className="p-4">Stato Avanzamento</th>
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
                            <button
                              onClick={() => {
                                setCurrentProject(proj);
                                setProjectModalOpen(true);
                              }}
                              className="p-1.5 border border-slate-300 text-slate-700 hover:text-[#0a1c2a] hover:border-[#0a1c2a] transition-colors cursor-pointer"
                              title="Modifica"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
                        <td colSpan={6} className="p-8 text-center text-slate-600 font-light">
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

      {/* ==============================================================
         MODALE EVENTO
      ============================================================== */}
      {eventModalOpen && currentEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-light">
                {currentEvent.id ? "Modifica Evento" : "Nuovo Evento"}
              </h3>
              <button
                onClick={() => setEventModalOpen(false)}
                className="text-slate-500 hover:text-[#0a1c2a] text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Titolo dell&apos;Evento
                </label>
                <input
                  type="text"
                  required
                  value={currentEvent.title || ""}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  placeholder="Es. Les Voiles Latines de Saint-Tropez"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Data o Periodo
                  </label>
                  <input
                    type="text"
                    required
                    value={currentEvent.date || ""}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                    placeholder="Es. Maggio 2026 oppure 14-16 Giugno 2026"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Luogo / Bacino
                  </label>
                  <input
                    type="text"
                    required
                    value={currentEvent.location || ""}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                    placeholder="Es. Saint-Tropez, Costa Azzurra"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Categoria
                  </label>
                  <select
                    value={currentEvent.category || "regata"}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, category: e.target.value as EventItem["category"] })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="regata">Regata</option>
                    <option value="manifestazione">Manifestazione</option>
                    <option value="raduno">Raduno</option>
                    <option value="cultura">Cultura & TV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Badge / Evidenza
                  </label>
                  <input
                    type="text"
                    value={currentEvent.badge || ""}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, badge: e.target.value })}
                    placeholder="Es. 1° Posto Assoluto"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Risultato / Podio
                  </label>
                  <input
                    type="text"
                    value={currentEvent.result || ""}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, result: e.target.value })}
                    placeholder="Es. Vincitore Classe Gozzi"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <ImageUploader
                label="Immagine dell'Evento"
                value={currentEvent.imageUrl || ""}
                onChange={(url) => setCurrentEvent({ ...currentEvent, imageUrl: url })}
                placeholder="/images/hero-sailing.webp"
              />

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Descrizione dell&apos;Evento
                </label>
                <textarea
                  required
                  rows={4}
                  value={currentEvent.description || ""}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  placeholder="Racconto e dettagli dell'evento sportivo o culturale..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Articolo / Reportage Collegato nel Blog (Slug URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={currentEvent.articleSlug || ""}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, articleSlug: e.target.value })}
                    placeholder="Es. anima-di-legno-il-segreto-del-gozzo-flegreo"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono"
                  />
                  {blogPosts.length > 0 && (
                    <select
                      value={currentEvent.articleSlug || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCurrentEvent({ ...currentEvent, articleSlug: e.target.value });
                        }
                      }}
                      className="px-3 py-2 border border-slate-300 text-xs text-slate-700 bg-white outline-none shrink-0"
                    >
                      <option value="">Scegli articolo esistente...</option>
                      {blogPosts.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 font-mono mt-1 block">
                  Collega un articolo del blog per mostrare il pulsante &quot;Leggi il Racconto dell&apos;Evento&quot; nella pagina pubblica degli Eventi.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="evt-published"
                  checked={currentEvent.published !== false}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, published: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="evt-published" className="text-xs font-mono font-bold text-[#0a1c2a] cursor-pointer">
                  Pubblica immediatamente sul sito (visibile a tutti)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0a1c2a] text-white text-xs font-mono font-semibold hover:bg-[#b8860b] transition-colors cursor-pointer"
                >
                  Salva Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
         MODALE BLOG
      ============================================================== */}
      {blogModalOpen && currentBlogPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-light">
                {currentBlogPost.id ? "Modifica Articolo Blog" : "Nuovo Articolo"}
              </h3>
              <button
                onClick={() => setBlogModalOpen(false)}
                className="text-slate-500 hover:text-[#0a1c2a] text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Titolo Articolo
                </label>
                <input
                  type="text"
                  required
                  value={currentBlogPost.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setCurrentBlogPost({
                      ...currentBlogPost,
                      title,
                      slug: currentBlogPost.id ? currentBlogPost.slug : slug,
                    });
                  }}
                  placeholder="Es. Il fascino eterno del gozzo montese"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    required
                    value={currentBlogPost.slug || ""}
                    onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, slug: e.target.value })}
                    placeholder="il-fascino-eterno"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Autore
                  </label>
                  <input
                    type="text"
                    required
                    value={currentBlogPost.author || ""}
                    onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, author: e.target.value })}
                    placeholder="Antonio Pugliese"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={currentBlogPost.category || "Cultura & Mare"}
                    onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, category: e.target.value })}
                    placeholder="Cultura & Mare"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <ImageUploader
                label="Immagine di Copertina"
                value={currentBlogPost.coverImage || ""}
                onChange={(url) => setCurrentBlogPost({ ...currentBlogPost, coverImage: url })}
                placeholder="/images/janara-regatta.jpeg"
              />

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Estratto Breve (Sintesi anteprima)
                </label>
                <textarea
                  required
                  rows={2}
                  value={currentBlogPost.excerpt || ""}
                  onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, excerpt: e.target.value })}
                  placeholder="Breve sintesi di due righe che appare nella scheda del blog..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Contenuto Completo dell&apos;Articolo
                </label>
                <textarea
                  required
                  rows={8}
                  value={currentBlogPost.content || ""}
                  onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, content: e.target.value })}
                  placeholder="Testo completo dell'articolo o racconto marinaro..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="blog-published"
                  checked={currentBlogPost.published !== false}
                  onChange={(e) => setCurrentBlogPost({ ...currentBlogPost, published: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="blog-published" className="text-xs font-mono font-bold text-[#0a1c2a] cursor-pointer">
                  Articolo visibile pubblicamente sul sito
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0a1c2a] text-white text-xs font-mono font-semibold hover:bg-[#b8860b] transition-colors cursor-pointer"
                >
                  Salva Articolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
         MODALE CORSO
      ============================================================== */}
      {courseModalOpen && currentCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-light">
                {currentCourse.id ? "Modifica Sessione Corso" : "Nuova Sessione di Formazione"}
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-slate-500 hover:text-[#0a1c2a] text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Tipo di Corso
                  </label>
                  <select
                    value={currentCourse.courseKey || "voga"}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, courseKey: e.target.value as CourseSession["courseKey"] })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="voga">01 · Voga in Piedi Tradizionale</option>
                    <option value="vela">02 · Vela Latina Classica</option>
                    <option value="rosa">03 · Progetto ROSA (Femminile)</option>
                    <option value="inclusione">04 · Inclusione Mare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Stato Iscrizioni
                  </label>
                  <select
                    value={currentCourse.status || "aperte"}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, status: e.target.value as CourseSession["status"] })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="aperte">Iscrizioni Aperte</option>
                    <option value="in-esaurimento">Posti in Esaurimento</option>
                    <option value="sold-out">Sold Out / Al Completo</option>
                    <option value="concluso">Sessione Conclusa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Titolo Sessione / Percorso
                </label>
                <input
                  type="text"
                  required
                  value={currentCourse.courseTitle || ""}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, courseTitle: e.target.value })}
                  placeholder="Es. Corso Primaverile di Voga in Piedi"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Data di Inizio
                  </label>
                  <input
                    type="date"
                    required
                    value={currentCourse.startDate || ""}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Orari e Frequenza
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCourse.schedule || ""}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, schedule: e.target.value })}
                    placeholder="Es. Ogni Sabato ore 09:30 – 12:30"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Posti Totali
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={currentCourse.totalSeats || 10}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, totalSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Posti Rimasti
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentCourse.availableSeats || 0}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, availableSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Istruttore / Barca
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCourse.instructor || ""}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, instructor: e.target.value })}
                    placeholder="Es. San Michele Arcangelo"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Quota / Note Aggiuntive
                </label>
                <input
                  type="text"
                  value={currentCourse.notes || ""}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, notes: e.target.value })}
                  placeholder="Es. Riservato a soci · Requisiti di base al galleggiamento"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0a1c2a] text-white text-xs font-mono font-semibold hover:bg-[#b8860b] transition-colors cursor-pointer"
                >
                  Salva Sessione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
         MODALE PROGETTO
      ============================================================== */}
      {projectModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#0a1c2a] font-light">
                {currentProject.id ? "Modifica Progetto" : "Nuovo Progetto Strategico"}
              </h3>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="text-slate-500 hover:text-[#0a1c2a] text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Numero
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProject.number || "01"}
                    onChange={(e) => setCurrentProject({ ...currentProject, number: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] font-mono text-center font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Titolo del Progetto
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProject.title || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                    placeholder="Es. Progetto ROSA"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Highlight / Traguardo
                </label>
                <input
                  type="text"
                  required
                  value={currentProject.highlight || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, highlight: e.target.value })}
                  placeholder="Es. Saint-Tropez 2027 oppure Cerimonia d&apos;Apertura"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Categoria
                  </label>
                  <select
                    value={currentProject.category || "Regata Internazionale"}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        category: e.target.value as ProjectItem["category"],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="Regata Internazionale">Regata Internazionale</option>
                    <option value="Cultura & Scienza">Cultura & Scienza</option>
                    <option value="Inclusione">Inclusione</option>
                    <option value="Rotte Storiche">Rotte Storiche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Badge in Evidenza
                  </label>
                  <input
                    type="text"
                    value={currentProject.badge || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, badge: e.target.value })}
                    placeholder="Es. Equipaggio Femminile"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Stato
                  </label>
                  <select
                    value={currentProject.status || "In Corso"}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        status: e.target.value as ProjectItem["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  >
                    <option value="In Corso">In Corso</option>
                    <option value="In Programmazione">In Programmazione</option>
                    <option value="Completato">Completato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Slug URL Pagina Dedicata
                  </label>
                  <input
                    type="text"
                    value={currentProject.slug || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, slug: e.target.value })}
                    placeholder="Es. progetto-rosa-saint-tropez-2027"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-mono text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                    URL: /progetti/{currentProject.slug || "slug-automatico"}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Partner / Rete Territoriale
                  </label>
                  <input
                    type="text"
                    value={currentProject.partner || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, partner: e.target.value })}
                    placeholder="Es. Campi Flegrei · Rete Partner"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Orizzonte Temporale
                  </label>
                  <input
                    type="text"
                    value={currentProject.timeline || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, timeline: e.target.value })}
                    placeholder="Es. 2026 – 2027"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                    Teatro Operativo / Luogo
                  </label>
                  <input
                    type="text"
                    value={currentProject.location || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, location: e.target.value })}
                    placeholder="Es. Acquamorta & Saint-Tropez"
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a]"
                  />
                </div>
              </div>

              {/* Upload o inserimento Immagine di Copertina */}
              <ImageUploader
                label="Fotografia di Copertina del Progetto"
                value={currentProject.imageUrl || ""}
                onChange={(url) => setCurrentProject({ ...currentProject, imageUrl: url })}
                placeholder="/images/janara-crew.jpeg"
              />

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Sintesi Breve (Anteprima nelle Schede)
                </label>
                <textarea
                  required
                  rows={3}
                  value={currentProject.description || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  placeholder="Spiega in breve gli obiettivi del cantiere (mostrato nella griglia)..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-widest text-[#0a1c2a] font-bold mb-1">
                  Spiegazione Approfondita della Pagina Dedicata (/progetti/[slug])
                </label>
                <textarea
                  rows={8}
                  value={currentProject.content || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, content: e.target.value })}
                  placeholder="Inserisci la relazione dettagliata di cantiere: storia, percorso tecnico, imbarcazioni, obiettivi... Supporta titoli con '### ' ed elenchi puntati con '- '."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-[#0a1c2a] outline-none focus:border-[#0a1c2a] leading-relaxed font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="project-published"
                  checked={currentProject.published !== false}
                  onChange={(e) => setCurrentProject({ ...currentProject, published: e.target.checked })}
                  className="h-4 w-4 border-slate-300 text-[#0a1c2a] focus:ring-[#0a1c2a]"
                />
                <label htmlFor="project-published" className="text-xs font-mono text-slate-700">
                  Pubblica questo cantiere immediatamente nella pagina pubblica /progetti
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-mono font-semibold hover:border-slate-800 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0a1c2a] text-white text-xs font-mono font-semibold hover:bg-[#b8860b] transition-colors cursor-pointer"
                >
                  Salva Progetto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Approvazione Pagamento e Iscrizione Libro Soci */}
      <ApproveMemberModal
        isOpen={approveModalOpen}
        booking={selectedBookingToApprove}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedBookingToApprove(null);
        }}
        onSuccess={loadAllData}
        showToast={showToast}
      />
    </div>
  );
}
