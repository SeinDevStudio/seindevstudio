"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut, FileSpreadsheet } from "lucide-react";

interface OrderItem {
  id: string;
  category: string;
  estimated_price_min: number;
  estimated_price_max: number;
  actual_price: number;
  paid_amount: number;
  status: string;
  urgency: string;
  created_at: string;
  clients: {
    name: string;
    whatsapp_number: string;
  } | null;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Trigger manual untuk reload/refresh data
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDashboardData() {
      // 1. Verifikasi sesi aktif
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/admin/login");
        return;
      }

      // 2. Ambil data pesanan dan klien
      const { data, error } = await supabase
        .from("orders")
        .select("*, clients(name, whatsapp_number)")
        .order("created_at", { ascending: false });

      if (!isCancelled) {
        if (!error && data) {
          setOrders(data as unknown as OrderItem[]);
        }
        setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [router, refreshKey]);

  const metrics = useMemo(() => {
    const totalPotential = orders.reduce(
      (acc, curr) => acc + (curr.actual_price || curr.estimated_price_min),
      0,
    );
    const totalReceived = orders.reduce(
      (acc, curr) => acc + (curr.paid_amount || 0),
      0,
    );
    const pendingReceivable = totalPotential - totalReceived;
    return { totalPotential, totalReceived, pendingReceivable };
  }, [orders]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  const updatePayment = async (
    orderId: string,
    actualPrice: number,
    paidAmount: number,
  ) => {
    await supabase
      .from("orders")
      .update({ actual_price: actualPrice, paid_amount: paidAmount })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, actual_price: actualPrice, paid_amount: paidAmount }
          : o,
      ),
    );
  };

  const exportCSV = () => {
    const headers = [
      "Order ID,Nama Klien,WhatsApp,Kategori,Status,Total Disepakati,Uang Masuk,Tanggal",
    ];
    const rows = orders.map(
      (o) =>
        `"${o.id}","${o.clients?.name || "-"}","${o.clients?.whatsapp_number || "-"}","${o.category}","${o.status}",${o.actual_price || o.estimated_price_min},${o.paid_amount},"${o.created_at}"`,
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 p-12 font-mono">
        Memuat database pesanan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans space-y-8">
      {/* Bar Navigasi Admin */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">OWNER_COMMAND_CENTER</h1>
          <p className="text-xs text-zinc-400">
            Ringkasan Omzet & Manajemen Pesanan Masuk
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs flex items-center gap-1.5 hover:bg-zinc-800 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Ekspor CSV
          </button>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs flex items-center gap-1.5 hover:bg-zinc-800 cursor-pointer"
          >
            <RefreshCw size={14} /> Sinkronisasi
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs flex items-center gap-1.5 hover:bg-red-900 cursor-pointer"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      {/* Tiga Kartu Metrik Finansial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
          <span className="text-xs text-zinc-500 uppercase font-mono">
            Total Omzet / Potensi
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            Rp {metrics.totalPotential.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
          <span className="text-xs text-zinc-500 uppercase font-mono">
            Uang Masuk Riil (Kas)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            Rp {metrics.totalReceived.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
          <span className="text-xs text-zinc-500 uppercase font-mono">
            Piutang / Termin Berjalan
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            Rp {metrics.pendingReceivable.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Klien & Pesanan */}
      <div className="border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono">
            <tr>
              <th className="p-3">Klien</th>
              <th className="p-3">Kontak WA</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Estimasi Awal</th>
              <th className="p-3">Harga Real / Bayar</th>
              <th className="p-3">Status Proyek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-zinc-900/40">
                <td className="p-3 font-semibold">
                  {ord.clients?.name || "-"}
                </td>
                <td className="p-3 font-mono text-emerald-400">
                  {ord.clients?.whatsapp_number ? (
                    <a
                      href={`https://wa.me/${ord.clients.whatsapp_number}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ord.clients.whatsapp_number}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3 uppercase text-zinc-400">
                  {ord.category.replace("_", " ")}
                </td>
                <td className="p-3 font-mono">
                  Rp {ord.estimated_price_min.toLocaleString("id-ID")}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Harga Riil"
                      defaultValue={ord.actual_price || 0}
                      className="w-24 bg-zinc-950 border border-zinc-800 p-1 rounded font-mono text-xs"
                      onBlur={(e) =>
                        updatePayment(
                          ord.id,
                          Number(e.target.value),
                          ord.paid_amount,
                        )
                      }
                    />
                    <span>/</span>
                    <input
                      type="number"
                      placeholder="Terbayar"
                      defaultValue={ord.paid_amount || 0}
                      className="w-24 bg-zinc-950 border border-zinc-800 p-1 rounded font-mono text-xs text-emerald-400"
                      onBlur={(e) =>
                        updatePayment(
                          ord.id,
                          ord.actual_price,
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </td>
                <td className="p-3">
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded p-1 text-xs outline-none"
                  >
                    <option value="lead">Lead Baru</option>
                    <option value="in_progress">Pengerjaan</option>
                    <option value="review">Review / Testing</option>
                    <option value="completed">Selesai & Lunas</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
