"use client";

import { useState, useMemo, useTransition, useSyncExternalStore } from "react";
import { calculateEstimate, type ClientTier } from "@/lib/calculator";
import { submitOrderAction } from "@/app/actions/submitOrder";
import HoneypotInput from "@/components/HoneypotInput";
import {
  Terminal,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sun,
  Moon,
  Code2,
  Gamepad2,
  Cpu,
  Bug,
  FolderKanban,
  Sparkles,
  Layers,
  Database,
  Clock,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Building2,
  MessageCircle,
} from "lucide-react";
import type { OrderInput } from "@/lib/validation";

type ServiceCategory = OrderInput["category"];
type UrgencyLevel = OrderInput["urgency"];

interface CategoryConfig {
  id: ServiceCategory;
  title: string;
  tagline: string;
  icon: typeof Code2;
  techs: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "web_development",
    title: "Web & Enterprise App",
    tagline: "Modern, high-performance web applications & dashboards.",
    icon: Code2,
    techs: ["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL"],
  },
  {
    id: "game_development",
    title: "Game & Engine Logic",
    tagline: "Mechanics, prototypes, educational games & narrative logic.",
    icon: Gamepad2,
    techs: ["Unity", "C#", "State Machine", "Asset Integration", "2D/3D"],
  },
  {
    id: "system_custom",
    title: "Custom Backend & Architecture",
    tagline: "High-availability REST API, database design & microservices.",
    icon: Cpu,
    techs: ["Node.js", "Express", "Supabase", "Redis", "Docker"],
  },
  {
    id: "qa_tester_bugfix",
    title: "QA Testing & Bug Fix",
    tagline: "Bug triage, automated testing, stress tests & security audits.",
    icon: Bug,
    techs: ["Jest/Playwright", "Security Triage", "Load Testing", "Code Audit"],
  },
  {
    id: "other",
    title: "Tugas Lain / Non-IT / Riset",
    tagline: "Otomatisasi file, olah data Excel, asistensi tugas & konsultasi.",
    icon: FolderKanban,
    techs: [
      "Data / Excel",
      "Script Automation",
      "Custom Tools",
      "Bantuan Tugas",
    ],
  },
];

const AVAILABLE_FEATURES = [
  { id: "auth_rbac", label: "Auth & Role-Based Access (RBAC)" },
  { id: "payment", label: "Payment Gateway Integration" },
  { id: "realtime", label: "Real-time Webhook / WebSocket" },
  { id: "analytics", label: "Dashboard & Financial Analytics" },
  { id: "api_thirdparty", label: "Third-party API / Cloud Integration" },
  { id: "security_audit", label: "Hardened Security & Rate Limiting" },
];

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot(): "dark" | "light" {
  const saved = localStorage.getItem("seindev_theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getThemeServerSnapshot(): "dark" | "light" {
  return "dark";
}

export default function HomePage() {
  const currentTheme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const [activeTheme, setActiveTheme] = useState<"dark" | "light" | null>(null);
  const theme = activeTheme ?? currentTheme;

  const [tier, setTier] = useState<ClientTier>("student");
  const [category, setCategory] = useState<ServiceCategory>("web_development");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Auth & Role-Based Access (RBAC)",
  ]);
  const [hasDb, setHasDb] = useState(true);
  const [urgency, setUrgency] = useState<UrgencyLevel>("standard");
  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setActiveTheme(next);
    localStorage.setItem("seindev_theme", next);
  };

  const estimate = useMemo(() => {
    return calculateEstimate(
      category,
      selectedFeatures.length,
      hasDb,
      urgency,
      tier,
    );
  }, [category, selectedFeatures, hasDb, urgency, tier]);

  const toggleFeature = (featLabel: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featLabel)
        ? prev.filter((f) => f !== featLabel)
        : [...prev, featLabel],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (category !== "other" && selectedFeatures.length === 0) {
      setFormError("Pilih minimal 1 fitur atau modul.");
      return;
    }

    startTransition(async () => {
      const res = await submitOrderAction({
        clientName,
        clientWhatsapp,
        category,
        tier,
        features:
          category === "other" && selectedFeatures.length === 0
            ? ["Bantuan Tugas Umum / Non-IT"]
            : selectedFeatures,
        databaseRequired: category === "other" ? false : hasDb,
        urgency,
        estimatedPriceMin: estimate.priceMin,
        estimatedPriceMax: estimate.priceMax,
        estimatedDays: estimate.days,
        notes,
        website_url_hp: honeypot,
      });

      if (res.success && res.redirectUrl) {
        window.open(res.redirectUrl, "_blank");
      } else {
        setFormError(res.error || "Terjadi kendala saat memproses pesanan.");
      }
    });
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDark
          ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30"
          : "bg-zinc-50 text-zinc-900 selection:bg-emerald-600/20"
      }`}
    >
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark
            ? "opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"
            : "opacity-[0.04] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)]"
        } bg-size-[32px_32px]`}
      />

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
          isDark
            ? "border-zinc-800/80 bg-zinc-950/80"
            : "border-zinc-200 bg-white/80"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Terminal size={18} />
            </div>
            <div>
              <span className="font-mono font-bold tracking-tight text-base sm:text-lg">
                SeinDev<span className="text-emerald-500">Studio</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                v2.4 // ONLINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready for New Projects</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-amber-400 hover:border-zinc-700"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-12 sm:py-16 space-y-16">
        {/* Header Hero */}
        <header className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wide border border-emerald-500/30 bg-emerald-500/5 text-emerald-500">
            <Sparkles size={13} />
            <span>INDIE ENGINEERING // BESPOKE SOLUTIONS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Rekayasa Perangkat Lunak, Game, &amp; Solusi Tugas Berdaya Tinggi.
          </h1>

          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Membangun sistem web kustom, arsitektur backend, game interaktif,
            hingga bantuan tugas/skripsi non-IT dengan biaya ramah mahasiswa.
            Hitung estimasi ruang lingkup dan diskusikan langsung via WhatsApp.
          </p>
        </header>

        {/* Section Tracks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Core Capabilities
            </h2>
            <span className="text-xs font-mono text-emerald-500">
              5 Tracks Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                    isActive
                      ? isDark
                        ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/20"
                        : "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-500/5"
                      : isDark
                        ? "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg border transition ${
                          isActive
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                            : isDark
                              ? "border-zinc-800 bg-zinc-950 text-zinc-400 group-hover:text-zinc-200"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600 group-hover:text-zinc-900"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm mb-1">
                      {cat.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed mb-3 ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {cat.tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-800/40">
                    {cat.techs.map((tech) => (
                      <span
                        key={tech}
                        className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                          isDark
                            ? "bg-zinc-950 border border-zinc-800 text-zinc-400"
                            : "bg-zinc-100 border border-zinc-200 text-zinc-600"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Console Kalkulator & Order Form */}
        <section className="space-y-6 pt-4">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-zinc-800/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Project Scope &amp; Estimation Console
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Pilih target layanan dan spesifikasi kebutuhan untuk estimasi
                biaya transparan.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-500">
              <Layers size={14} />
              <span>LIVE_ENGINE // READY</span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <HoneypotInput value={honeypot} onChange={setHoneypot} />

            <div className="lg:col-span-7 space-y-8">
              {/* Pilihan Tier Klien */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Target Kategori Layanan
                </label>
                <div
                  className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
                    isDark
                      ? "bg-zinc-900/90 border-zinc-800"
                      : "bg-zinc-200/60 border-zinc-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setTier("student")}
                    className={`py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                      tier === "student"
                        ? "bg-emerald-500 text-zinc-950 shadow-md font-bold"
                        : isDark
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <GraduationCap size={18} />
                    <span>Mahasiswa / Pelajar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier("business")}
                    className={`py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                      tier === "business"
                        ? "bg-emerald-500 text-zinc-950 shadow-md font-bold"
                        : isDark
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <Building2 size={18} />
                    <span>Bisnis / Instansi / Startup</span>
                  </button>
                </div>
              </div>

              {/* Checklist Fitur / Modul (Hanya relevan jika IT murni, atau pilihan umum) */}
              {category !== "other" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      1. Modul &amp; Fitur Sistem
                    </label>
                    <span className="text-xs font-mono text-zinc-500">
                      {selectedFeatures.length} modul aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_FEATURES.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.label);
                      return (
                        <div
                          key={feat.id}
                          onClick={() => toggleFeature(feat.label)}
                          className={`p-3.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition flex items-center justify-between gap-3 select-none ${
                            isChecked
                              ? isDark
                                ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                                : "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium"
                              : isDark
                                ? "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                          }`}
                        >
                          <span>{feat.label}</span>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-zinc-950"
                                : isDark
                                  ? "border-zinc-700 bg-zinc-950"
                                  : "border-zinc-300 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <CheckCircle2 size={13} className="stroke-3" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isDark
                      ? "bg-zinc-900/40 border-zinc-800"
                      : "bg-emerald-50/50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs font-mono">
                    <MessageCircle size={15} />
                    <span>KATEGORI TUGAS UMUM / NON-IT DIPILIH</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    Tidak perlu memilih fitur teknis di bawah. Anda bisa
                    langsung menjelaskan instruksi tugas atau melampirkan file
                    dokumen saat terhubung ke WhatsApp. Biaya sangat terjangkau
                    (mulai Rp 50.000).
                  </p>
                </div>
              )}

              {/* Database & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <Database size={13} />
                    <span>Database &amp; Storage</span>
                  </label>
                  <select
                    disabled={category === "other"}
                    value={hasDb ? "yes" : "no"}
                    onChange={(e) => setHasDb(e.target.value === "yes")}
                    className={`w-full rounded-lg p-3 text-sm border outline-none transition font-sans disabled:opacity-50 ${
                      isDark
                        ? "bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-zinc-200"
                        : "bg-white border-zinc-200 focus:border-emerald-600 text-zinc-900"
                    }`}
                  >
                    <option value="yes">
                      Relational DB (Supabase / Postgres)
                    </option>
                    <option value="no">
                      Statik / Tanpa Database Persisten
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <Clock size={13} />
                    <span>Target Timeline</span>
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className={`w-full rounded-lg p-3 text-sm border outline-none transition font-sans ${
                      isDark
                        ? "bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-zinc-200"
                        : "bg-white border-zinc-200 focus:border-emerald-600 text-zinc-900"
                    }`}
                  >
                    <option value="standard">
                      Jadwal Standar (Normal Pace)
                    </option>
                    <option value="rush">Rush Order (Prioritas Tinggi)</option>
                    <option value="urgent">
                      Urgent / Critical (&lt; 3-7 Hari)
                    </option>
                  </select>
                </div>
              </div>

              {/* Kontak Pemesan */}
              <div
                className={`space-y-4 pt-6 border-t ${
                  isDark ? "border-zinc-800/80" : "border-zinc-200"
                }`}
              >
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  2. Informasi Kontak &amp; Deskripsi Tugas
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama Lengkap / Panggilan"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={`w-full rounded-lg p-3 text-sm border outline-none transition ${
                        isDark
                          ? "bg-zinc-900 border-zinc-800 focus:border-emerald-500 placeholder:text-zinc-600 text-zinc-100"
                          : "bg-white border-zinc-200 focus:border-emerald-600 placeholder:text-zinc-400 text-zinc-900"
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Nomor WA (contoh: 08123456789)"
                      required
                      value={clientWhatsapp}
                      onChange={(e) => setClientWhatsapp(e.target.value)}
                      className={`w-full rounded-lg p-3 text-sm border outline-none transition font-mono ${
                        isDark
                          ? "bg-zinc-900 border-zinc-800 focus:border-emerald-500 placeholder:text-zinc-600 text-zinc-100"
                          : "bg-white border-zinc-200 focus:border-emerald-600 placeholder:text-zinc-400 text-zinc-900"
                      }`}
                    />
                  </div>
                </div>

                <textarea
                  placeholder={
                    category === "other"
                      ? "Tuliskan jenis tugas yang perlu dibantu (misal: olah data Excel, pembuatan materi/slide, perbaikan format file, script simpel, dll)..."
                      : "Ceritakan kebutuhan proyek, alur sistem, atau referensi aplikasi yang diinginkan..."
                  }
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full rounded-lg p-3 text-sm border outline-none transition ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 focus:border-emerald-500 placeholder:text-zinc-600 text-zinc-100"
                      : "bg-white border-zinc-200 focus:border-emerald-600 placeholder:text-zinc-400 text-zinc-900"
                  }`}
                />
              </div>
            </div>

            {/* Kotak Estimasi Live */}
            <div className="lg:col-span-5">
              <div
                className={`sticky top-24 rounded-2xl p-6 sm:p-7 border space-y-6 shadow-xl transition-colors duration-300 ${
                  isDark
                    ? "bg-zinc-900/80 border-zinc-800/90 shadow-black/40"
                    : "bg-white border-zinc-200 shadow-zinc-200/50"
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="font-semibold tracking-wide">
                      ESTIMASI REAL-TIME
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {category === "other"
                      ? "HARGA FLEKSIBEL"
                      : tier === "student"
                        ? "TARIF AKADEMIK"
                        : "TARIF BISNIS"}
                  </span>
                </div>

                {/* Tampilan Harga Fleksibel jika Kategori Other */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-zinc-400">
                    Perkiraan Biaya
                  </span>
                  {category === "other" ? (
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                        Nego via WhatsApp
                      </div>
                      <div className="text-xs font-mono text-zinc-400">
                        Mulai Rp 50.000 (menyesuaikan tingkat kesulitan tugas)
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 tracking-tight">
                        Rp {estimate.priceMin.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs font-mono text-zinc-400">
                        hingga Rp {estimate.priceMax.toLocaleString("id-ID")}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-zinc-950/60 border-zinc-800/80"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-emerald-500" />
                    <span className="text-xs text-zinc-400">
                      Estimasi Durasi
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {category === "other"
                      ? "1 – 3 Hari (Fleksibel)"
                      : `± ${estimate.days} Hari Kerja`}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/40 pt-4">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {tier === "student"
                        ? "Mahasiswa / Pelajar"
                        : "Bisnis / Instansi"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kategori:</span>
                    <span className="font-mono text-zinc-300 font-semibold">
                      {CATEGORIES.find((c) => c.id === category)?.title}
                    </span>
                  </div>
                  {category !== "other" && (
                    <>
                      <div className="flex justify-between">
                        <span>Modul:</span>
                        <span className="font-mono text-zinc-300">
                          {selectedFeatures.length} Item
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database:</span>
                        <span className="font-mono text-zinc-300">
                          {hasDb ? "Integrated" : "None"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Prioritas:</span>
                    <span className="font-mono uppercase text-emerald-500">
                      {urgency}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-xs">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-150 text-sm cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menghubungkan ke WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <span>Pesan via WhatsApp</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-zinc-500 leading-relaxed">
                  Rincian tugas akan otomatis terformat rapi dan langsung
                  dikirimkan ke kontak WhatsApp SeinDevStudio.
                </p>
              </div>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer
          className={`pt-12 pb-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
            isDark
              ? "border-zinc-800 text-zinc-500"
              : "border-zinc-200 text-zinc-500"
          }`}
        >
          <div>&copy; 2026 SeinDevStudio. Engineered with precision.</div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/login"
              className="hover:text-emerald-500 transition flex items-center gap-1"
            >
              <span>Owner Portal</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
