"use server";

import { orderSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";

export async function submitOrderAction(formData: unknown) {
  // 1. Validasi data form dengan Zod
  const parsed = orderSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal, periksa kembali input Anda.",
    };
  }

  const data = parsed.data;

  // 2. Proteksi Honeypot: jika input tersembunyi terisi, tolak (indikasi bot)
  if (data.website_url_hp && data.website_url_hp.length > 0) {
    return { success: false, error: "Aktivitas bot terdeteksi." };
  }

  // 3. Simpan Klien ke tabel `clients`
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      name: data.clientName,
      whatsapp_number: data.clientWhatsapp,
    })
    .select("id")
    .single();

  if (clientErr) {
    return {
      success: false,
      error: `Gagal menyimpan data klien: ${clientErr.message}`,
    };
  }

  // 4. Simpan Pesanan ke tabel `orders`
  const { error: orderErr } = await supabase.from("orders").insert({
    client_id: client.id,
    category: data.category,
    selected_features: data.features,
    estimated_price_min: data.estimatedPriceMin,
    estimated_price_max: data.estimatedPriceMax,
    estimated_days: data.estimatedDays,
    urgency: data.urgency,
    notes: data.notes || "",
  });

  if (orderErr) {
    return {
      success: false,
      error: `Gagal mencatat pesanan: ${orderErr.message}`,
    };
  }

  // 5. Tentukan label target klien
  const tierLabel =
    data.tier === "student"
      ? "Mahasiswa / Tugas Akhir / Skripsi"
      : "Bisnis / Komersial / Instansi";

  // 6. Format teks pesan WhatsApp
  const text = `*Halo, saya ingin memesan jasa di SeinDevStudio.*

*RINCIAN SPESIFIKASI:*
• *Nama Klien:* ${data.clientName}
• *Target Layanan:* ${tierLabel}
• *Kategori Jasa:* ${data.category.replace("_", " ").toUpperCase()}
• *Prioritas Waktu:* ${data.urgency.toUpperCase()}
• *Fitur Dipilih:* ${data.features.join(", ")}
• *Estimasi Anggaran:* Rp ${data.estimatedPriceMin.toLocaleString("id-ID")} - Rp ${data.estimatedPriceMax.toLocaleString("id-ID")}
• *Estimasi Waktu:* ± ${data.estimatedDays} Hari Kerja

*Catatan / Deskripsi:*
"${data.notes || "-"}"

──────────────────────
_Dibuat otomatis via kalkulator SeinDevStudio._`;

  // 7. Buat link WhatsApp langsung
  const phone = process.env.OWNER_WHATSAPP_NUMBER || "6281234567890";
  const cleanPhone = phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

  return { success: true, redirectUrl: waUrl };
}
