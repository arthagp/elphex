"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, CreditCard, Sparkles, Calendar, ShieldCheck, X } from "lucide-react";

export default function PaymentPage() {
  const { user, updateUserPlan, showXpGain } = useElphexStore();
  const [mounted, setMounted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const handleUpgrade = async () => {
    setPaymentStep("processing");

    // Simulate 2 seconds of payment processing
    setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/upgrade", { method: "POST" });
        if (res.ok) {
          updateUserPlan("PRO");
          setPaymentStep("success");
          showXpGain(100, "Paket PRO Diaktifkan!", true);
        } else {
          setPaymentStep("form");
          alert("Gagal memproses pembayaran mockup.");
        }
      } catch (err) {
        setPaymentStep("form");
        console.error("Payment upgrade error", err);
      }
    }, 2000);
  };

  const isPro = user.plan === "PRO";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Upgrade Layanan Elphex</h1>
          <p className="text-xs text-slate-500 font-medium">Buka fitur premium untuk meningkatkan produktivitas tim Anda.</p>
        </div>

        {/* Plan Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
          
          {/* FREE Plan Card */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800/40 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-400 uppercase tracking-wider">ELPHEX FREE</h3>
                <p className="text-[10px] text-slate-500 font-medium">Cocok untuk penggunaan personal dasar</p>
              </div>

              <div className="flex items-baseline text-slate-200">
                <span className="text-3xl font-black">Rp 0</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ selamanya</span>
              </div>

              <hr className="border-slate-800/40" />

              <ul className="space-y-3.5 text-xs text-slate-400 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-slate-500" />
                  <span>Ruang Kerja Personal</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-slate-500" />
                  <span>Kartu Kanban & Daftar Tugas</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-slate-500" />
                  <span>Pomodoro Fokus & Hewan Peliharaan Elphy</span>
                </li>
                <li className="flex items-center space-x-2.5 text-slate-600 line-through">
                  <X size={14} className="shrink-0" />
                  <span>Ruang Kerja Organisasi (Hingga 12 Anggota)</span>
                </li>
                <li className="flex items-center space-x-2.5 text-slate-600 line-through">
                  <X size={14} className="shrink-0" />
                  <span>Google / Looyal Calendar Integration</span>
                </li>
                <li className="flex items-center space-x-2.5 text-slate-600 line-through">
                  <X size={14} className="shrink-0" />
                  <span>Elephant Brain AI Assistant</span>
                </li>
              </ul>
            </div>

            <button
              disabled={!isPro}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                !isPro
                  ? "bg-slate-800 border border-slate-700 text-slate-400"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 cursor-pointer"
              }`}
            >
              {!isPro ? "Paket Aktif Anda" : "Kembali Ke Free"}
            </button>
          </div>

          {/* PRO Plan Card (Paid) */}
          <div className="p-8 rounded-3xl glass-panel-glow border border-[#0085FF]/20 relative overflow-hidden space-y-6 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0085FF]/10 to-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-base text-[#0085FF] uppercase tracking-wider">ELPHEX PRO</h3>
                    <span className="bg-[#0085FF]/10 border border-[#0085FF]/20 px-2 py-0.5 rounded-lg text-[9px] font-bold text-[#0085FF] flex items-center space-x-1 shrink-0">
                      <Sparkles size={10} className="fill-[#0085FF]" />
                      <span>Terbaik</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Buka kolaborasi tim & asisten kecerdasan AI</p>
                </div>
              </div>

              <div className="flex items-baseline text-slate-200">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">Rp 49.000</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ bulan</span>
              </div>

              <hr className="border-slate-800/40" />

              <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-[#0085FF]" />
                  <span>Semua Fitur Elphex Free</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-[#0085FF]" />
                  <span className="font-bold text-slate-200">Buat Ruang Kerja Organisasi (S.d 12 Orang)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-[#0085FF]" />
                  <span className="font-bold text-slate-200 flex items-center space-x-1">
                    <Calendar size={12} className="text-cyan-400" />
                    <span>Integrasi Kalender (Google & Looyal)</span>
                  </span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-[#0085FF]" />
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 flex items-center space-x-1">
                    <Sparkles size={12} className="text-cyan-400 fill-cyan-400 shrink-0" />
                    <span>Elephant Brain AI Assistant Unlocked</span>
                  </span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={14} className="text-[#0085FF]" />
                  <span>Mendapatkan bonus 100 XP instan saat aktivasi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (!isPro) {
                  setShowCheckoutModal(true);
                }
              }}
              disabled={isPro}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isPro
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-[#0085FF] hover:bg-blue-600 text-white shadow-blue-500/10 cursor-pointer"
              }`}
            >
              {isPro ? "Paket PRO Aktif" : "Upgrade Ke PRO Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {/* Mock Payment Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (paymentStep !== "processing") setShowCheckoutModal(false);
              }}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-[95%] max-w-[420px] h-fit bg-slate-900 border border-slate-800 shadow-2xl p-6 rounded-2xl z-50 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-100 font-extrabold text-sm">
                  <CreditCard size={18} className="text-[#0085FF]" />
                  <span>Simulasi Checkout Pembayaran</span>
                </div>
                {paymentStep !== "processing" && (
                  <button 
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setPaymentStep("form");
                    }} 
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <hr className="border-slate-850" />

              {paymentStep === "form" && (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ini adalah simulasi gerbang pembayaran mockup. Silakan masukkan nomor kartu kredit dummy apa saja untuk melakukan transaksi simulasi.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nomor Kartu Dummy</label>
                    <input 
                      type="text" 
                      required
                      placeholder="4111 2222 3333 4444" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Masa Berlaku</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="***" 
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#0085FF]/5 rounded-xl border border-[#0085FF]/10 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Total Pembayaran</span>
                    <span className="font-extrabold text-slate-200">Rp 49.000</span>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    className="w-full py-3 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Simulasikan Bayar Sekarang
                  </button>
                </div>
              )}

              {paymentStep === "processing" && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-[#0085FF] animate-spin"></div>
                  <div className="text-center space-y-1">
                    <p className="font-extrabold text-xs text-slate-200">Memproses Transaksi Mockup...</p>
                    <p className="text-[10px] text-slate-500">Menghubungkan ke bank simulasi</p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-100">Pembayaran Berhasil!</h4>
                    <p className="text-[10px] text-slate-400 max-w-[280px] leading-relaxed">
                      Selamat! Akun Anda telah berhasil di-upgrade ke paket <strong className="text-[#0085FF]">ELPHEX PRO</strong>. Semua fitur premium sekarang telah terbuka.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setPaymentStep("form");
                    }}
                    className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    Mulai Nikmati Fitur PRO
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
