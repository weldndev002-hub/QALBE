import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Sparkles, Crown, Zap, Star, ArrowRight, X,
  ShieldCheck, Clock, Tag, Loader2, AlertCircle, PartyPopper
} from 'lucide-react';
import { getTiers, MembershipTier } from '../services/adminService';
import { createPayment, getPaymentMethods, checkPaymentStatus } from '../services/paymentService';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

// ─── Warna tiap level tier ───────────────────────────────────────────────────
const TIER_STYLES: Record<number, { gradient: string; badge: string; icon: JSX.Element; border: string; glow: string }> = {
  0: {
    gradient: 'from-slate-50 to-slate-100',
    badge: 'bg-slate-100 text-slate-600',
    icon: <Star size={20} className="text-slate-500" />,
    border: 'border-slate-200',
    glow: '',
  },
  1: {
    gradient: 'from-orange-50 to-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    icon: <Zap size={20} className="text-amber-500" />,
    border: 'border-amber-200',
    glow: 'shadow-amber-100',
  },
  2: {
    gradient: 'from-violet-50 to-purple-50',
    badge: 'bg-violet-100 text-violet-700',
    icon: <Sparkles size={20} className="text-violet-500" />,
    border: 'border-violet-200',
    glow: 'shadow-violet-100',
  },
  3: {
    gradient: 'from-[#7e3188]/10 to-pink-50',
    badge: 'bg-[#7e3188]/10 text-[#7e3188]',
    icon: <Crown size={20} className="text-[#7e3188]" />,
    border: 'border-[#7e3188]/30',
    glow: 'shadow-pink-100',
  },
};

// Fallback style untuk level > 3
function getTierStyle(level: number) {
  return TIER_STYLES[Math.min(level, 3)] ?? TIER_STYLES[3];
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// ─── Banner Sukses Pembayaran ─────────────────────────────────────────────────
function PaymentSuccessBanner({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4"
    >
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
        <PartyPopper size={20} className="text-emerald-600" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-emerald-800">Pembayaran Berhasil! 🎉</p>
        <p className="text-sm text-emerald-600 mt-0.5">Membership kamu sedang diaktifkan. ID Order: <code className="font-mono text-xs bg-emerald-100 px-1 rounded">{orderId}</code></p>
        <p className="text-xs text-emerald-500 mt-1">Jika membership belum aktif dalam 5 menit, hubungi support kami.</p>
      </div>
      <button onClick={onClose} className="text-emerald-400 hover:text-emerald-600"><X size={18} /></button>
    </motion.div>
  );
}

// ─── Modal Detail + Checkout ──────────────────────────────────────────────────
function PackageDetailModal({
  pkg, onClose, onBuy, loading
}: {
  pkg: MembershipTier;
  onClose: () => void;
  onBuy: (pkg: MembershipTier, billing: 'monthly' | 'yearly', paymentMethod: string) => void;
  loading: boolean;
}) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<string>(''); // Kosongkan awal
  const [availableMethods, setAvailableMethods] = useState<any[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);

  const style = getTierStyle(pkg.level);
  const price = billing === 'monthly' ? pkg.price_monthly : pkg.price_yearly;
  const isFree = pkg.price_monthly === 0;
  const yearlySaving = pkg.price_monthly * 12 - pkg.price_yearly;

  useEffect(() => {
    if (!isFree && price > 0) {
      setMethodsLoading(true);
      getPaymentMethods(price)
        .then(methods => {
          // Hanya E-Wallet (OVO, DANA, ShopeePay, LinkAja, QRIS, dll)
          const allowedWallets = ['SP', 'O1', 'DA', 'SA', 'LF', 'NQ', 'LQ', 'SQ'];
          const ewalletMethods = methods.filter((m: any) => allowedWallets.includes(m.paymentMethod));
          
          setAvailableMethods(ewalletMethods);
          if (ewalletMethods.length > 0 && !ewalletMethods.find((m: any) => m.paymentMethod === paymentMethod)) {
            setPaymentMethod(ewalletMethods[0].paymentMethod);
          } else if (ewalletMethods.length === 0) {
            setPaymentMethod('O1'); // Fallback default
          }
          setMethodsLoading(false);
        })
        .catch(() => setMethodsLoading(false));
    }
  }, [price, isFree]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${style.gradient} p-6 border-b ${style.border}`}>
          <div className="flex justify-between items-start mb-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
              {style.icon}
              {pkg.name}
            </div>
            <button onClick={onClose} disabled={loading} className="text-neutral-400 hover:text-neutral-600 bg-white/60 rounded-full p-1">
              <X size={18} />
            </button>
          </div>
          <p className="text-neutral-600 text-sm mt-2">{pkg.description || 'Paket membership Qalbie'}</p>

          {/* Billing toggle */}
          {!isFree && (
            <div className="mt-4 flex bg-white/60 rounded-xl p-1 gap-1 w-fit">
              {(['monthly', 'yearly'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={clsx(
                    'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                    billing === b ? 'bg-white shadow text-[#7e3188]' : 'text-neutral-500'
                  )}
                >
                  {b === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  {b === 'yearly' && yearlySaving > 0 && (
                    <span className="ml-1 text-emerald-600">Hemat {formatRupiah(yearlySaving)}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <p className="text-3xl font-black text-neutral-900">
              {isFree ? 'Gratis' : formatRupiah(price)}
            </p>
            {!isFree && (
              <p className="text-xs text-neutral-500 mt-1">
                /{billing === 'monthly' ? 'bulan' : 'tahun'}
                {billing === 'yearly' && pkg.price_monthly > 0 && (
                  <span className="ml-2 line-through text-neutral-400">{formatRupiah(pkg.price_monthly * 12)}</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="p-6 space-y-3 max-h-[220px] overflow-y-auto">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Yang kamu dapatkan</p>
          {pkg.features && pkg.features.length > 0 ? (
            pkg.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#7e3188] shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-700">{feat}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-400 italic">Tidak ada fitur yang dicantumkan.</p>
          )}
        </div>

        {/* Payment Method Selector */}
        {!isFree && (
          <div className="px-6 pb-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Metode Pembayaran</span>
              {methodsLoading && <Loader2 size={12} className="animate-spin text-neutral-400" />}
            </p>
            {methodsLoading ? (
              <div className="w-full bg-neutral-100 animate-pulse text-transparent text-sm rounded-xl px-4 py-2.5">
                Memuat metode...
              </div>
            ) : availableMethods.length > 0 ? (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading || methodsLoading}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7e3188]/30 transition-all appearance-none"
              >
                {availableMethods.map((method, idx) => (
                  <option key={idx} value={method.paymentMethod}>
                    {method.paymentName}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7e3188]/30 transition-all"
              >
                <optgroup label="E-Wallet & QRIS">
                  <option value="O1">OVO</option>
                  <option value="DA">DANA</option>
                  <option value="SP">ShopeePay</option>
                  <option value="SA">ShopeePay App</option>
                  <option value="LF">LinkAja</option>
                  <option value="NQ">QRIS</option>
                </optgroup>
              </select>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="p-6 pt-2">
          <button
            onClick={() => onBuy(pkg, billing, isFree ? '' : paymentMethod)}
            disabled={loading}
            className="w-full bg-[#7e3188] hover:bg-[#682870] disabled:opacity-70 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7e3188]/20"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Membuat Transaksi...</>
            ) : isFree ? (
              <>'Mulai Gratis' <ArrowRight size={18} /></>
            ) : (
              <>{`Bayar ${formatRupiah(price)}`} <ArrowRight size={18} /></>
            )}
          </button>

          {!isFree && (
            <p className="text-center text-xs text-neutral-400 mt-3">
              Kamu akan diarahkan ke halaman pembayaran Duitku
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><ShieldCheck size={13} /> Aman & Terenkripsi</span>
            <span className="flex items-center gap-1"><Clock size={13} /> Aktif Instan</span>
            <span className="flex items-center gap-1"><Tag size={13} /> Transparan</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PackageCard({ pkg, index, onSelect, currentTierId, currentTierLevel = 0 }: {
  pkg: MembershipTier;
  index: number;
  onSelect: (pkg: MembershipTier) => void;
  currentTierId?: number;
  currentTierLevel?: number;
}) {
  const style = getTierStyle(pkg.level);
  const isPopular = pkg.level === 2;
  const isPremium = pkg.level === 3;
  const isActive = pkg.id === currentTierId;
  const isLowerTier = !isActive && pkg.level < currentTierLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => {
        if (!isLowerTier) onSelect(pkg);
      }}
      className={clsx(
        'relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300',
        isLowerTier ? 'opacity-70 grayscale-[30%] cursor-not-allowed' : 'cursor-pointer group hover:-translate-y-1 hover:shadow-xl',
        style.border,
        isPremium && !isLowerTier && 'ring-2 ring-[#7e3188]/30',
        isActive && 'ring-2 ring-emerald-400',
        style.glow && !isLowerTier && `shadow-lg ${style.glow}`
      )}
    >
      {/* Badge */}
      {isActive && (
        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-br-xl uppercase tracking-wide">
          ✓ Aktif
        </div>
      )}
      {!isActive && isPopular && (
        <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wide">
          Terpopuler
        </div>
      )}
      {!isActive && isPremium && (
        <div className="absolute top-0 right-0 bg-[#7e3188] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wide">
          Terlengkap
        </div>
      )}

      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${style.gradient} p-5 pb-4 ${isActive ? 'pt-7' : ''}`}>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${style.badge}`}>
          {style.icon}
          {pkg.name}
        </div>
        <div>
          <p className="text-2xl font-black text-neutral-900">
            {pkg.price_monthly === 0 ? 'Gratis' : formatRupiah(pkg.price_monthly)}
          </p>
          {pkg.price_monthly > 0 && (
            <p className="text-xs text-neutral-500 mt-0.5">/bulan</p>
          )}
        </div>
      </div>

      {/* Fitur & CTA */}
      <div className="p-5 pt-4">
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
          {pkg.description || 'Paket membership Qalbie'}
        </p>

        <div className="space-y-2 mb-5">
          {(pkg.features || []).slice(0, 3).map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#7e3188] shrink-0" />
              <span className="text-xs text-neutral-600 truncate">{feat}</span>
            </div>
          ))}
          {(pkg.features || []).length > 3 && (
            <p className="text-xs text-neutral-400 pl-5">+{pkg.features.length - 3} fitur lainnya</p>
          )}
          {(!pkg.features || pkg.features.length === 0) && (
            <p className="text-xs text-neutral-400 italic">Lihat detail paket</p>
          )}
        </div>

        <button 
          disabled={isLowerTier}
          className={clsx(
          'w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
          isActive
            ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
            : isLowerTier
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : isPremium || isPopular
                ? 'bg-[#7e3188] text-white group-hover:bg-[#682870] shadow-md shadow-[#7e3188]/20'
                : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200'
        )}>
          {isActive ? '✓ Paket Aktif' : isLowerTier ? 'Paket Lebih Rendah' : pkg.price_monthly === 0 ? 'Mulai Gratis' : 'Pilih Paket'}
          {!isActive && !isLowerTier && <ArrowRight size={15} />}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function MembershipPage() {
  const [packages, setPackages] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<MembershipTier | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [activeTierId, setActiveTierId] = useState<number | undefined>(undefined);

  const { user } = useAuthStore() as any;

  // Cek return dari Duitku
  useEffect(() => {
    const fromPayment = searchParams.get('from_payment');
    const statusSuccess = searchParams.get('status'); // Fallback in case old URL is hit
    const orderId = searchParams.get('orderId');
    
    if ((fromPayment === 'true' || statusSuccess === 'success') && orderId) {
      // Cek status transaksi asli via Worker
      checkPaymentStatus(orderId).then((status) => {
        if (status === 'SUCCESS') {
          setShowSuccess(true);
          setSuccessOrderId(orderId);
          
          // Refresh membership
          if (user?.id) {
            import('../services/adminService').then(({ getMemberDetail }) => {
              getMemberDetail(user.id).then(detail => {
                if (detail?.membership?.status === 'active' && detail?.membership?.tier_id) {
                  setActiveTierId(detail.membership.tier_id);
                }
              }).catch(console.error);
            });
          }
        } else if (status === 'PENDING') {
          setPaymentError('Pembayaran kamu sedang diproses atau menunggu diselesaikan. Selesaikan pembayaran sesuai instruksi.');
        } else {
          setPaymentError('Pembayaran belum diselesaikan atau dibatalkan.');
        }
      }).catch(() => {
        // Fallback or ignore
      });
      
      // Bersihkan URL params
      setSearchParams({});
    }
  }, [user?.id, searchParams, setSearchParams]);

  useEffect(() => {
    import('../services/adminService').then(({ getTiers, getMemberDetail }) => {
      getTiers()
        .then(data => {
          setPackages(data.filter(p => p.is_active));
          setLoading(false);
        })
        .catch(() => setLoading(false));

      if (user?.id) {
        getMemberDetail(user.id).then(detail => {
          if (detail?.membership?.status === 'active' && detail?.membership?.tier_id) {
            setActiveTierId(detail.membership.tier_id);
          }
        }).catch(console.error);
      }
    });
  }, [user?.id]);

  const handleBuy = async (pkg: MembershipTier, billing: 'monthly' | 'yearly', paymentMethod: string) => {
    const price = billing === 'monthly' ? pkg.price_monthly : pkg.price_yearly;

    if (price === 0) {
      setSelectedPkg(null);
      return;
    }

    if (!user?.email) {
      setPaymentError('Kamu harus login terlebih dahulu untuk berlangganan.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const result = await createPayment({
        packageName: pkg.name,
        packageSlug: pkg.slug,
        tierId: pkg.id,
        amount: price,
        billing,
        email: user.email,
        customerName: user.user_metadata?.full_name || user.email.split('@')[0],
        userId: user.id,
        paymentMethod: paymentMethod || 'VC',
      });

      // Redirect ke halaman pembayaran Duitku
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan. Coba lagi.';
      setPaymentError(msg);
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f0fb] via-white to-white pb-32 md:pb-8">
      {/* Banner sukses pembayaran */}
      <AnimatePresence>
        {showSuccess && (
          <div className="max-w-5xl mx-auto pt-6">
            <PaymentSuccessBanner
              orderId={successOrderId}
              onClose={() => setShowSuccess(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7e3188]/8 via-transparent to-pink-50/50 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#7e3188]/10 text-[#7e3188] px-4 py-1.5 rounded-full text-xs font-bold mb-4"
          >
            <Sparkles size={14} />
            Mulai Perjalanan Sehatmu
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight mb-3"
          >
            Pilih Paket <span className="text-[#7e3188]">Membership</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 text-sm md:text-base leading-relaxed"
          >
            Akses fitur Qalbie sesuai kebutuhanmu. Batalkan kapan saja, tanpa syarat tersembunyi.
          </motion.p>
        </div>
      </div>

      {/* Error payment */}
      <AnimatePresence>
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-4 mb-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{paymentError}</p>
              <button onClick={() => setPaymentError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Paket */}
      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-neutral-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-neutral-500 font-medium">Belum ada paket tersedia.</p>
            <p className="text-neutral-400 text-sm mt-1">Admin akan segera menambahkan paket membership.</p>
          </div>
        ) : (
          <div className={clsx(
            'grid gap-4',
            packages.length === 1 && 'grid-cols-1 max-w-xs mx-auto',
            packages.length === 2 && 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto',
            packages.length === 3 && 'grid-cols-1 sm:grid-cols-3',
            packages.length >= 4 && 'grid-cols-2 lg:grid-cols-4',
          )}>
            {packages
              .sort((a, b) => a.level - b.level)
              .map((pkg, i) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  index={i}
                  onSelect={setSelectedPkg}
                  currentTierId={activeTierId}
                  currentTierLevel={packages.find(p => p.id === activeTierId)?.level || 0}
                />
              ))
            }
          </div>
        )}

        {/* Trust badges */}
        {!loading && packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-neutral-400"
          >
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> Pembayaran Aman via Duitku</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Aktif Instan</span>
            <span className="flex items-center gap-2"><Tag size={16} className="text-[#7e3188]" /> Harga Transparan</span>
          </motion.div>
        )}
      </div>

      {/* Modal detail */}
      <AnimatePresence>
        {selectedPkg && (
          <PackageDetailModal
            pkg={selectedPkg}
            onClose={() => !paymentLoading && setSelectedPkg(null)}
            onBuy={handleBuy}
            loading={paymentLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
