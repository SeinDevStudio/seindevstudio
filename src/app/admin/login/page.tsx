"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4"
      >
        <div className="flex items-center gap-2 font-mono text-emerald-400 text-sm">
          <Lock size={16} />
          <span>OWNER_PORTAL</span>
        </div>
        <h2 className="text-xl font-bold">Admin Authentication</h2>

        {err && (
          <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800/40">
            {err}
          </p>
        )}

        <div>
          <label className="text-xs text-zinc-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-zinc-950 border border-zinc-800 p-2 rounded text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-zinc-950 border border-zinc-800 p-2 rounded text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold rounded text-sm transition"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
