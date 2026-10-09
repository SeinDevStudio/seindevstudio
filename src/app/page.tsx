"use client";

import { useState, useMemo, useTransition } from "react";
import { motion } from "framer-motion";
import { calculateEstimate, type ClientTier } from "@/lib/calculator";
import { submitOrderAction } from "@/app/actions/submitOrder";
import HoneypotInput from "@/components/HoneypotInput";
import {
  Terminal,
  Code2,
  Gamepad2,
  Cpu,
  Bug,
  FolderKanban,
  Sparkles,
  Database,
  Clock,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Building2,
  ArrowRight,
  Loader2,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import type { OrderInput } from "@/lib/validation";

type ServiceCategory = OrderInput["category"];
type UrgencyLevel = OrderInput["urgency"];

interface CategoryConfig {
  id: ServiceCategory;
  num: string;
  title: string;
  tagline: string;
  icon: typeof Code2;
  gradient: string;
  techs: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "web_development",
    num: "01",
    title: "Web & Enterprise App",
    tagline:
      "Modern, high-performance web applications, responsive SaaS & intuitive dashboards.",
    icon: Code2,
    gradient: "from-amber-500/25 via-orange-500/15 to-transparent",
    techs: ["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL"],
  },
  {
    id: "game_development",
    num: "02",
    title: "Game & Engine Logic",
    tagline:
      "Mechanics, prototypes, educational games, finite state machine & narrative logic.",
    icon: Gamepad2,
    gradient: "from-rose-500/25 via-pink-500/15 to-transparent",
    techs: ["Unity", "C#", "State Machine", "Asset Integration", "2D/3D"],
  },
  {
    id: "system_custom",
    num: "03",
    title: "Custom Backend & Arch",
    tagline:
      "High-availability REST API, database schema optimization & microservice bridges.",
    icon: Cpu,
    gradient: "from-indigo-500/25 via-purple-500/15 to-transparent",
    techs: ["Node.js", "Express", "Supabase", "Redis", "Docker"],
  },
  {
    id: "qa_tester_bugfix",
    num: "04",
    title: "QA Testing & Bug Fix",
    tagline:
      "Bug triage, functional test cases, load stress validation & vulnerability code audit.",
    icon: Bug,
    gradient: "from-emerald-500/25 via-teal-500/15 to-transparent",
    techs: ["Jest/Playwright", "Security Triage", "Load Testing", "Code Audit"],
  },
  {
    id: "other",
    num: "05",
    title: "Tugas Lain / Non-IT / Riset",
    tagline:
      "Otomatisasi dokumen, olah data statistik, media interaktif & konsultasi tugas umum.",
    icon: FolderKanban,
    gradient: "from-cyan-500/25 via-blue-500/15 to-transparent",
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

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setFormError("Pilih minimal 1 modul fitur.");
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

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden font-sans relative">
      {/* Background Animated Aurora Mesh */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-180 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-30 left-[5%] w-145 h-130 bg-linear-to-br from-orange-600/30 via-rose-600/25 to-transparent blur-[130px] rounded-full animate-aurora-1" />
        <div className="absolute -top-25 right-[5%] w-150 h-135 bg-linear-to-bl from-teal-500/30 via-indigo-600/25 to-transparent blur-[140px] rounded-full animate-aurora-2" />
        <div className="absolute top-45 left-1/3 w-125 h-90 bg-purple-600/20 blur-[130px] rounded-full animate-aurora-3" />
      </div>

      {/* Floating Header Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/6 bg-[#07090e]/85">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between md:grid md:grid-cols-3">
          {/* Kolom Kiri: Brand SeinDevStudio */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-tight text-base text-white">
                SeinDev<span className="text-orange-400">Studio</span>
              </span>
              <span className="hidden lg:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 bg-white/5">
                v2.6
              </span>
            </div>
          </div>

          {/* Kolom Tengah Desktop: Navigasi Presisi di Tengah */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-xs font-mono tracking-wider text-zinc-400 uppercase">
            <a href="#tracks" className="hover:text-white transition-colors">
              Tracks
            </a>
            <a href="#console" className="hover:text-white transition-colors">
              Calculator
            </a>
            <a href="#stats" className="hover:text-white transition-colors">
              Method
            </a>
            <a
              href="/admin/login"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Portal <ExternalLink size={11} />
            </a>
          </nav>

          {/* Kolom Kanan Desktop: Tombol Start Project */}
          <div className="hidden md:flex justify-end">
            <a
              href="#console"
              className="px-5 py-2.5 rounded-full bg-white text-zinc-950 text-xs font-semibold tracking-wide hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 active:scale-95"
            >
              Start Project
            </a>
          </div>

          {/* Tampilan Mobile: Tombol Burger Menu */}
          <div className="flex md:hidden justify-end">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="p-2.5 rounded-xl border border-white/10 bg-white/3 text-zinc-300 hover:text-white hover:bg-white/8 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu Burger untuk Layar Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/8 bg-[#07090e]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
            <nav className="flex flex-col gap-4 text-sm font-mono tracking-wider text-zinc-300 uppercase">
              <a
                href="#tracks"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                Tracks
              </a>
              <a
                href="#console"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                Calculator
              </a>
              <a
                href="#stats"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                Method
              </a>
              <a
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-orange-400 flex items-center gap-2 transition"
              >
                <span>Portal Admin</span>
                <ExternalLink size={13} />
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase border border-white/10 bg-white/4 text-orange-300 mb-8 backdrop-blur-xs"
        >
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={13} className="text-orange-400" />
          </motion.div>
          <span>Bespoke Engineering &amp; Creative Code</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.03] text-white"
        >
          SeinDev
          <br />
          <span className="bg-linear-to-r from-orange-200 via-white to-teal-200 bg-clip-text text-transparent">
            Studio.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-8 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Studio rekayasa software kustom, logika game, arsitektur backend,
          serta solusi pengerjaan tugas &amp; riset mahasiswa dengan kalkulasi
          transparan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href="#console"
            className="px-7 py-3.5 rounded-full bg-white text-zinc-950 font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 flex items-center gap-2 cursor-pointer"
          >
            <span>Hitung Estimasi Proyek</span>
            <ArrowRight size={15} />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href="#tracks"
            className="px-6 py-3.5 rounded-full border border-white/10 bg-white/2 text-zinc-300 font-medium text-sm hover:border-white/20 hover:text-white transition-all cursor-pointer"
          >
            Eksplor Layanan
          </motion.a>
        </motion.div>
      </section>

      {/* Metric Stats Banner */}
      <section
        id="stats"
        className="relative z-10 border-y border-white/7 bg-white/1.5 py-8 backdrop-blur-xs"
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              Pace // Waktu
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
              1 – 7 Hari
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              Layanan // Tracks
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
              5 Domain
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              Biaya Tugas Umum
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400 mt-1">
              Mulai Rp 50k
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              Platform Status
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-teal-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              Online
            </div>
          </div>
        </div>
      </section>

      {/* What's in it for you? (Track Cards) */}
      <section
        id="tracks"
        className="relative z-10 py-24 max-w-6xl mx-auto px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-16 space-y-3"
        >
          <div className="w-1.5 h-1.5 mx-auto bg-orange-400 rotate-45 mb-4 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            What&apos;s in it for you?
          </h2>
          <p className="text-sm text-zinc-400">
            Pilih track spesialisasi yang sesuai dengan kebutuhan produk, sistem
            bisnis, atau tugas akademik Anda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => {
                  setCategory(cat.id);
                  const el = document.getElementById("console");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`relative rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? "border-orange-500/80 bg-white/8 shadow-2xl shadow-orange-500/15"
                    : "border-white/8 bg-white/2 hover:border-white/25 hover:bg-white/4"
                }`}
              >
                <div
                  className={`absolute -top-20 -right-20 w-44 h-44 bg-linear-to-br ${cat.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500 opacity-50`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white transition group-hover:scale-110 duration-200">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-2xl font-bold text-zinc-600 group-hover:text-zinc-300 transition">
                      {cat.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {cat.tagline}
                  </p>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-white/6 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 group-hover:text-orange-400 transition">
                    {isSelected ? "Selected Track" : "Choose Track"}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-zinc-500 group-hover:translate-x-1 group-hover:text-white transition duration-200"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Scope & Estimation Console */}
      <section
        id="console"
        className="relative z-10 py-20 border-t border-white/7 bg-white/1"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <div className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">
                Scope &amp; Estimation Console
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Rancang Proyek &amp; Estimasi Biaya
              </h2>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Track Aktif:{" "}
              <span className="text-white font-bold">
                {CATEGORIES.find((c) => c.id === category)?.title}
              </span>
            </div>
          </motion.div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <HoneypotInput value={honeypot} onChange={setHoneypot} />

            <div className="lg:col-span-7 space-y-8">
              {/* Target Peserta / Klien */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Target Peserta / Klien
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/3 border border-white/7">
                  <button
                    type="button"
                    onClick={() => setTier("student")}
                    className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                      tier === "student"
                        ? "bg-white text-zinc-950 font-bold shadow-lg"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <GraduationCap size={16} />
                    <span>Mahasiswa / Pelajar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier("business")}
                    className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                      tier === "business"
                        ? "bg-white text-zinc-950 font-bold shadow-lg"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Bisnis / Instansi</span>
                  </button>
                </div>
              </div>

              {/* Modul Spesifikasi */}
              {category !== "other" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      Modul Fitur Diperlukan
                    </label>
                    <span className="text-xs font-mono text-zinc-500">
                      {selectedFeatures.length} dipilih
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_FEATURES.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.label);
                      return (
                        <div
                          key={feat.id}
                          onClick={() => toggleFeature(feat.label)}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition flex items-center justify-between gap-3 select-none ${
                            isChecked
                              ? "border-orange-500/60 bg-orange-500/8 text-white font-medium"
                              : "border-white/6 bg-white/2 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                          }`}
                        >
                          <span>{feat.label}</span>
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                              isChecked
                                ? "bg-orange-500 border-orange-500 text-zinc-950"
                                : "border-zinc-700 bg-zinc-900"
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
                <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
                    <MessageCircle size={15} />
                    <span>KATEGORI TUGAS UMUM / NON-IT DIPILIH</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Tidak memerlukan pemilihan modul sistem rumit. Silakan
                    jelaskan detail tugas Anda di formulir catatan di bawah.
                    Biaya pengerjaan fleksibel dan ramah kantong mahasiswa
                    (mulai Rp 50.000).
                  </p>
                </div>
              )}

              {/* Database & Timeline Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <Database size={13} />
                    <span>Database &amp; Data Storage</span>
                  </label>
                  <select
                    disabled={category === "other"}
                    value={hasDb ? "yes" : "no"}
                    onChange={(e) => setHasDb(e.target.value === "yes")}
                    className="w-full rounded-xl p-3.5 text-xs sm:text-sm border border-white/8 bg-zinc-900 text-zinc-200 outline-none focus:border-orange-500 transition disabled:opacity-40"
                  >
                    <option value="yes">
                      Database Relasional (Supabase / Postgres)
                    </option>
                    <option value="no">Tanpa Database Eksternal</option>
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
                    className="w-full rounded-xl p-3.5 text-xs sm:text-sm border border-white/8 bg-zinc-900 text-zinc-200 outline-none focus:border-orange-500 transition"
                  >
                    <option value="standard">Jadwal Normal (Santai)</option>
                    <option value="rush">Prioritas Cepat (Rush)</option>
                    <option value="urgent">
                      Sangat Mendesak (&lt; 3-5 Hari)
                    </option>
                  </select>
                </div>
              </div>

              {/* Data Klien */}
              <div className="space-y-4 pt-4 border-t border-white/6">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Informasi Pemesan &amp; Catatan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Lengkap / Panggilan"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl p-3.5 text-xs sm:text-sm border border-white/8 bg-white/3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="text"
                    placeholder="Nomor WhatsApp (misal: 08123456789)"
                    required
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(e.target.value)}
                    className="w-full rounded-xl p-3.5 text-xs sm:text-sm border border-white/8 bg-white/3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-orange-500 font-mono transition"
                  />
                </div>
                <textarea
                  placeholder={
                    category === "other"
                      ? "Tuliskan deskripsi tugas yang ingin dibantu (misal: olah data spreadsheet, format dokumen skripsi, visualisasi materi, dll)..."
                      : "Ceritakan deskripsi proyek, referensi aplikasi, atau batasan sistem yang diinginkan..."
                  }
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl p-3.5 text-xs sm:text-sm border border-white/8 bg-white/3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Kotak Sticky Estimasi */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl p-7 border border-white/10 bg-white/3 backdrop-blur-2xl space-y-6 shadow-2xl shadow-black/80">
                <div className="flex items-center justify-between pb-4 border-b border-white/7">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                    <ShieldCheck size={16} className="text-orange-400" />
                    <span>LIVE ESTIMATION</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-orange-300">
                    {category === "other"
                      ? "Nego Santai"
                      : tier === "student"
                        ? "Harga Pelajar"
                        : "Bisnis"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
                    Perkiraan Biaya
                  </span>
                  {category === "other" ? (
                    <div>
                      <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                        Nego via WhatsApp
                      </div>
                      <div className="text-xs font-mono text-orange-400 mt-1">
                        Mulai Rp 50.000 (menyesuaikan tingkat kesulitan)
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                        Rp {estimate.priceMin.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-1">
                        hingga Rp {estimate.priceMax.toLocaleString("id-ID")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/2 border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-orange-400" />
                    <span className="text-xs text-zinc-400">
                      Estimasi Durasi
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-white">
                    {category === "other"
                      ? "1 – 3 Hari (Fleksibel)"
                      : `± ${estimate.days} Hari Kerja`}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-400 pt-2 border-t border-white/6">
                  <div className="flex justify-between">
                    <span>Track:</span>
                    <span className="text-white font-medium">
                      {CATEGORIES.find((c) => c.id === category)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="text-orange-300 font-medium">
                      {tier === "student"
                        ? "Mahasiswa / Pelajar"
                        : "Bisnis / Instansi"}
                    </span>
                  </div>
                  {category !== "other" && (
                    <div className="flex justify-between">
                      <span>Modul:</span>
                      <span className="text-white font-mono">
                        {selectedFeatures.length} Item
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Kecepatan:</span>
                    <span className="font-mono uppercase text-white">
                      {urgency}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                    {formError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 px-6 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-sm cursor-pointer shadow-xl shadow-white/5"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Menyiapkan Tiket WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <span>Diskusi via WhatsApp</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </motion.button>

                <p className="text-[11px] text-center text-zinc-500 leading-relaxed">
                  Rincian spesifikasi akan terformat otomatis dan langsung
                  diteruskan ke WhatsApp SeinDevStudio.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/7 bg-[#05070a]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-zinc-500">
          <div>&copy; 2026 SeinDevStudio. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#tracks" className="hover:text-zinc-300 transition">
              Tracks
            </a>
            <a href="#console" className="hover:text-zinc-300 transition">
              Console
            </a>
            <a
              href="/admin/login"
              className="hover:text-orange-400 transition flex items-center gap-1"
            >
              Portal Admin <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
