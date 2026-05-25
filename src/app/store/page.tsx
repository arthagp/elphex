"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Lock,
  Coins
} from "lucide-react";

export default function StorePage() {
  const { rewardItems, purchasedRewards, user, purchaseReward } = useElphexStore();
  const [mounted, setMounted] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const handlePurchase = async (rewardId: string) => {
    setPurchasingId(rewardId);
    try {
      await purchaseReward(rewardId);
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasingId(null);
    }
  };

  // Group items by category
  const categories = [
    { type: "UI_THEME", name: "Tema UI Kustom", desc: "Ubah warna aksen dan neon antarmuka pengguna Anda." },
    { type: "PET_COLOR", name: "Skin Elph Pet", desc: "Beri warna baru yang megah untuk gajah virtual Anda." },
    { type: "AVATAR_FRAME", name: "Bingkai Avatar", desc: "Tunjukkan level Anda dengan bingkai foto profil eksklusif." },
    { type: "BADGE", name: "Lencana Profil", desc: "Lencana kehormatan yang dipajang di kartu profil Anda." },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel relative overflow-hidden border border-slate-800/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-[#0085FF]/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Toko Hadiah</h1>
            <p className="text-xs text-slate-500 font-medium">Tukarkan XP jerih payah produktivitas Anda dengan kustomisasi eksklusif.</p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-950/80 border border-slate-900 px-5 py-3 rounded-2xl shrink-0 relative z-10 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 text-glow-purple">
              <Coins size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tabungan XP Anda</p>
              <p className="font-extrabold text-slate-200 mt-0.5 text-glow-purple">{user.totalXp} XP</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = rewardItems.filter((item) => item.type === cat.type);
            if (items.length === 0) return null;

            return (
              <div key={cat.type} className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-200 tracking-tight">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{cat.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => {
                    const isUnlocked = purchasedRewards.includes(item.id);
                    const canAfford = user.totalXp >= item.xpCost;
                    
                    return (
                      <div 
                        key={item.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between h-48 transition-all ${
                          isUnlocked 
                            ? "bg-slate-900/10 border-slate-800/30" 
                            : "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-900 font-bold uppercase">
                              {item.type.replace("_", " ")}
                            </span>
                            {item.isExclusive && (
                              <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded uppercase font-black">
                                Eksklusif
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-200 text-sm leading-snug">{item.name}</h4>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-slate-400">{item.xpCost}</span>
                            <span className="text-[10px] text-slate-500 font-bold">XP</span>
                          </div>

                          {isUnlocked ? (
                            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase shrink-0">
                              <Check size={12} />
                              <span>Terbuka</span>
                            </div>
                          ) : (
                            <button
                              disabled={!canAfford || purchasingId === item.id}
                              onClick={() => handlePurchase(item.id)}
                              className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0 ${
                                canAfford 
                                  ? "bg-[#0085FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/10" 
                                  : "bg-slate-950 text-slate-650 border border-slate-900 cursor-not-allowed opacity-50"
                              }`}
                            >
                              {purchasingId === item.id ? "Memproses..." : canAfford ? "Tukar XP" : "XP Tidak Cukup"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
