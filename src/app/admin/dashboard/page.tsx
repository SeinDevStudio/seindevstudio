"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  Layers,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Search,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface OrderItem {
  id: string;
  created_at: string;
  category: string;
  status: "lead" | "in_progress" | "review" | "completed" | "cancelled";
  urgency: string;
  estimated_price_min: number;
  estimated_price_max: number;
  estimated_days: number;
  notes: string | null;
  features: string[];
  database_required: boolean;
  clients: {
    id: string;
    name: string;
    whatsapp: string;
    tier: string;
  } | null;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, clients(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as OrderItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setOrders(data as OrderItem[]);
        }
        setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus as OrderItem["status"] }
            : o,
        ),
      );
    }
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter((order) => {
    const clientName = order.clients?.name?.toLowerCase() || "";
    const clientWa = order.clients?.whatsapp || "";
    const matchesSearch =
      clientName.includes(searchTerm.toLowerCase()) ||
      clientWa.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenueEst = orders.reduce(
    (acc, cur) => acc + (Number(cur.estimated_price_min) || 0),
    0,
  );

  const activeLeadsCount = orders.filter((o) => o.status === "lead").length;
  const inProgressCount = orders.filter(
    (o) => o.status === "in_progress",
  ).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans relative selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Animated Aurora Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-10 w-96 h-96 bg-orange-600/15 blur-[120px] rounded-full" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-teal-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header Console */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-white/6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-widest mb-1.5">
              <Sparkles size={14} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white font-mono">
              SeinDev<span className="text-orange-400">Studio</span> {"-"}{" "}
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Sync Database</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs font-mono hover:bg-zinc-200 transition shadow-lg shadow-white/5 flex items-center gap-1.5"
            >
              <span>Lihat Website</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </motion.div>

        {/* Metrik Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {[
            {
              title: "TOTAL PESANAN",
              value: orders.length,
              sub: "Sejak studio online",
              icon: Layers,
              color: "text-indigo-400",
            },
            {
              title: "LEAD BARU (WHATSAPP)",
              value: activeLeadsCount,
              sub: "Menunggu konfirmasi",
              icon: AlertCircle,
              color: "text-amber-400",
            },
            {
              title: "SEDANG PENGERJAAN",
              value: inProgressCount,
              sub: "Project active sprint",
              icon: Activity,
              color: "text-teal-400",
            },
            {
              title: "PIPELINE ESTIMASI",
              value: `Rp ${(totalRevenueEst / 1000).toLocaleString("id-ID")}k`,
              sub: "Total potensi revenue",
              icon: TrendingUp,
              color: "text-emerald-400",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl border border-white/6 bg-white/2 backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-mono tracking-widest uppercase">
                    {stat.title}
                  </span>
                  <Icon size={17} className={stat.color} />
                </div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{stat.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Filter & Toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Cari nama klien atau nomor WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/8 bg-white/3 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "lead", "in_progress", "review", "completed"].map(
              (statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    statusFilter === statusKey
                      ? "bg-white text-zinc-950 font-bold"
                      : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {statusKey}
                </button>
              ),
            )}
          </div>
        </motion.div>

        {/* Daftar Pesanan Interaktif */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className="animate-spin text-orange-400" />
                <span>Memuat data dari database...</span>
              </motion.div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/1"
              >
                <AlertCircle size={28} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-mono text-zinc-400">
                  Belum ada pesanan yang sesuai filter.
                </p>
              </motion.div>
            ) : (
              filteredOrders.map((order, idx) => {
                const client = order.clients;
                const formattedDate = new Date(
                  order.created_at,
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const waUrl = client?.whatsapp
                  ? `https://wa.me/${client.whatsapp.replace(/^0/, "62")}`
                  : null;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="p-6 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-md hover:border-white/20 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    {/* Info Klien & Track */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-white text-base font-mono">
                          {client?.name || "Anon Client"}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-orange-300">
                          {client?.tier === "student" ? "Mahasiswa" : "Bisnis"}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          • {formattedDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                          {order.category.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          Timeline:{" "}
                          <strong className="text-white">
                            ± {order.estimated_days} Hari
                          </strong>
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          Database:{" "}
                          <strong
                            className={
                              order.database_required
                                ? "text-teal-400"
                                : "text-zinc-500"
                            }
                          >
                            {order.database_required ? "YES" : "NO"}
                          </strong>
                        </span>
                      </div>

                      {order.features && order.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {order.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}

                      {order.notes && (
                        <p className="text-xs text-zinc-400 italic bg-white/1.5 p-2.5 rounded-xl border border-white/5 mt-2">
                          &quot;{order.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Estimasi Biaya, Status & Tindakan */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/6">
                      <div className="text-left lg:text-right">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">
                          Estimasi Range
                        </div>
                        <div className="text-lg font-bold font-mono text-orange-400">
                          Rp{" "}
                          {Number(
                            order.estimated_price_min || 0,
                          ).toLocaleString("id-ID")}
                          <span className="text-xs text-zinc-500">
                            {" "}
                            -{" "}
                            {Number(
                              order.estimated_price_max || 0,
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {/* Selector Ubah Status */}
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleUpdateStatus(order.id, e.target.value)
                          }
                          className="px-3 py-2 rounded-xl text-xs font-mono bg-zinc-900 border border-white/10 text-zinc-200 outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="lead">LEAD (BARU)</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="review">REVIEW</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>

                        {/* Direct Button ke WhatsApp Klien */}
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                          >
                            <MessageCircle size={14} />
                            <span>Chat</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
