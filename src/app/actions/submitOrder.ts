"use server";

import { orderSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";

export async function submitOrderAction(rawInput: unknown) {
  try {
    const data = orderSchema.parse(rawInput);

    // Filter anti-bot honeypot
    if (data.website_url_hp && data.website_url_hp.length > 0) {
      return { success: true, redirectUrl: "#" };
    }

    // 1. Simpan data klien ke Supabase
    const { data: clientData, error: clientErr } = await supabase
      .from("clients")
      .upsert(
        {
          name: data.clientName,
          whatsapp: data.clientWhatsapp,
          tier: data.tier,
        },
        { onConflict: "whatsapp" },
      )
      .select("id")
      .single();

    if (clientErr) {
      console.error("Supabase Client Error:", clientErr);
    }

    // 2. Simpan order ke Supabase
    const { error: orderErr } = await supabase.from("orders").insert({
      client_id: clientData?.id,
      category: data.category,
      features: data.features,
      database_required: data.databaseRequired,
      urgency: data.urgency,
      estimated_price_min:
        data.category === "other" ? 50000 : data.estimatedPriceMin,
      estimated_price_max:
        data.category === "other" ? 0 : data.estimatedPriceMax,
      estimated_days: data.category === "other" ? 2 : data.estimatedDays,
      notes: data.notes || "",
      status: "lead",
    });

    if (orderErr) {
      console.error("Supabase Order Error:", orderErr);
    }

    // 3. Susun pesan WhatsApp
    const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER || "6282268255846";

    const priceText =
      data.category === "other"
        ? "Nego / Diskusi Santai via WA (Mulai Rp 50.000)"
        : `Rp ${data.estimatedPriceMin.toLocaleString("id-ID")} - Rp ${data.estimatedPriceMax.toLocaleString("id-ID")}`;

    const daysText =
      data.category === "other"
        ? "Fleksibel / Sesuai Deadline"
        : `± ${data.estimatedDays} Hari Kerja`;

    const text = `*HALO SEINDEVSTUDIO, SAYA INGIN KONSULTASI / ORDER*

*Data Pemesan:*
• Nama: ${data.clientName}
• Kategori: ${data.category.toUpperCase()}
• Tipe: ${data.tier === "student" ? "Mahasiswa / Akademik" : "Bisnis / Instansi"}

*Spesifikasi:*
• Modul / Kebutuhan: ${data.features.join(", ")}
• Database: ${data.databaseRequired ? "Ya" : "Tidak Perlu"}
• Timeline: ${data.urgency.toUpperCase()} (${daysText})
• Estimasi Biaya: ${priceText}

*Catatan / Detail Kebutuhan:*
${data.notes || "-"}

Mohon informasi ketersediaan dan diskusi kelanjutannya. Terima kasih!`;

    const redirectUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(text)}`;
    return { success: true, redirectUrl };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}
