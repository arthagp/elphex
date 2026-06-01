"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ShieldCheck, AlertCircle } from "lucide-react";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Dev Simulator State
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [simulatedPhone, setSimulatedPhone] = useState("");
  const [showWaBubble, setShowWaBubble] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }

    // Fetch the generated OTP from dev-otp API (development helper)
    const fetchDevOtp = async () => {
      try {
        const res = await fetch(`/api/auth/dev-otp?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setSimulatedOtp(data.otpCode);
          setSimulatedPhone(data.phone);
          
          // Trigger the WhatsApp notification slide-in after 1s
          setTimeout(() => {
            setShowWaBubble(true);
          }, 1000);
        }
      } catch (err) {
        console.error("Failed to load dev OTP", err);
      }
    };

    fetchDevOtp();
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit angka");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        // Verification success! Redirect to home page
        window.location.href = "/";
      } else {
        setError(data.error || "Verifikasi gagal. Kode OTP salah.");
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

      {/* WhatsApp OTP Notification Simulator Bubble */}
      <AnimatePresence>
        {showWaBubble && simulatedOtp && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 max-w-sm w-full bg-[#075e54] text-white p-4 rounded-2xl shadow-2xl z-50 border border-emerald-500/20 flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white font-extrabold text-sm">
              💬
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs">WhatsApp OTP Simulator</span>
                <span className="text-[9px] opacity-75">Sekarang</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95">
                Mengirim pesan ke <strong className="text-emerald-200">{simulatedPhone}</strong>:
                <br />
                "Kode OTP Elphex Anda adalah: <strong className="text-yellow-300 tracking-wider text-xs">{simulatedOtp}</strong>. Harap masukkan kode ini untuk mengaktifkan akun Anda."
              </p>
              <button 
                onClick={() => setOtpCode(simulatedOtp)}
                className="mt-1.5 px-2.5 py-1 rounded bg-white text-emerald-900 font-black text-[9px] hover:bg-emerald-100 transition-colors uppercase cursor-pointer"
              >
                Auto-fill Kode OTP
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-[420px] p-8 rounded-3xl glass-panel border border-slate-800/40 relative z-10 space-y-6"
      >
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h1 className="font-extrabold text-xl tracking-wider text-slate-100 mt-2">
            Verifikasi OTP WA
          </h1>
          <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
            Kode verifikasi OTP 6 digit telah dikirim ke nomor WhatsApp Anda untuk email <span className="text-slate-200 font-bold">{email}</span>.
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
          <div className="space-y-2 text-center">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Masukkan 6 Digit OTP</label>
            <div className="relative max-w-[240px] mx-auto">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-center text-sm font-extrabold tracking-[0.4em]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-bold text-xs shadow-lg shadow-emerald-500/15 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-900 flex flex-col space-y-1">
          <p>Belum menerima kode OTP di WhatsApp?</p>
          <button 
            type="button"
            onClick={async () => {
              setError("");
              setShowWaBubble(false);
              // Trigger a resend by logging in again
              try {
                const res = await fetch("/api/auth/signin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password: "" }), // signing in triggers resend
                });
                const data = await res.json();
                if (data.needsVerification) {
                  setSimulatedOtp(data.otpCode);
                  setTimeout(() => setShowWaBubble(true), 1000);
                  setError("Kode OTP baru telah dikirim.");
                }
              } catch (e) {}
            }}
            className="text-emerald-500 hover:underline font-bold"
          >
            Kirim Ulang OTP
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1d] text-slate-400 text-xs font-semibold">
        Memuat Halaman Verifikasi...
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
