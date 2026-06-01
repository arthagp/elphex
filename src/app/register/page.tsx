"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, AlertCircle, Tag } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    // Basic username validation: lowercase letters, numbers, underscores, at least 3 chars
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setError("Username harus 3-15 karakter, hanya huruf, angka, dan underscore");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, phone, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to OTP verification screen with email prefilled
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Pendaftaran gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1d] relative overflow-hidden p-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#0085FF]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-[440px] p-8 rounded-3xl glass-panel border border-slate-800/40 relative z-10 space-y-6 my-8"
      >
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0085FF] to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-2xl">🐘</span>
          </div>
          <h1 className="font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 mt-2">
            Pendaftaran Elphex
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Bergabung dengan kawanan produktif hari ini.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center space-x-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Username</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "").toLowerCase())}
                placeholder="Contoh: artha_gp"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">No. Telepon / WA</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 083848762736"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ulangi Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0085FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 font-bold text-xs shadow-lg shadow-blue-500/15 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-900">
          <span>Sudah punya akun? </span>
          <Link href="/login" className="text-[#0085FF] hover:underline font-bold">
            Masuk Sekarang
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
