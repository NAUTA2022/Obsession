import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Users, TrendingUp, Star, Trophy,
  Zap, Award, Target, CheckCircle2, X, Send,
  Handshake, BadgeCheck, BarChart2, Calendar,
  MessageCircle, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Mock seller data (in real app would fetch by username) ────────────────────

const MOCK_SELLERS: Record<string, {
  name: string;
  username: string;
  bio: string;
  specialty: string;
  whatsapp: string;
  avatar: string | null;
  gradient: string;
  joinedDate: string;
  stats: { totalSales: number; creatorsActive: number; totalEarned: number; conversionRate: number; avgDeal: number; closedDeals: number };
  achievements: { id: string; icon: typeof Trophy; label: string; desc: string; unlocked: boolean; color: string }[];
  recentActivity: { label: string; count: number; period: string }[];
  topCreators: { name: string; gradient: string; sales: number }[];
}> = {
  dev_user: {
    name: 'Dev User',
    username: 'dev_user',
    bio: 'Vendedor especializado en contenido exclusivo y experiencias premium. 3 años generando resultados para creadoras de contenido en Latinoamérica.',
    specialty: 'Contenido premium · Fitness · Lifestyle',
    whatsapp: '+57 300 000 0000',
    avatar: null,
    gradient: 'from-[#6850E8] to-violet-600',
    joinedDate: 'Enero 2024',
    stats: {
      totalSales: 36,
      creatorsActive: 3,
      totalEarned: 682_200,
      conversionRate: 13,
      avgDeal: 149_900,
      closedDeals: 36,
    },
    achievements: [
      { id: 'first_sale',    icon: Star,        label: 'Primera venta',          desc: 'Cerraste tu primer trato',                   unlocked: true,  color: 'text-amber-400 bg-amber-400/10'   },
      { id: 'five_sales',    icon: TrendingUp,   label: '5 ventas',               desc: 'Alcanzaste 5 ventas cerradas',                unlocked: true,  color: 'text-blue-400 bg-blue-400/10'     },
      { id: 'ten_sales',     icon: Trophy,       label: '10 ventas',              desc: 'Alcanzaste 10 ventas cerradas',               unlocked: true,  color: 'text-violet-400 bg-violet-400/10' },
      { id: 'twenty_sales',  icon: Award,        label: '20 ventas',              desc: 'Alcanzaste 20 ventas cerradas',               unlocked: true,  color: 'text-emerald-400 bg-emerald-400/10'},
      { id: 'first_collab',  icon: Handshake,    label: 'Primera colaboración',   desc: 'Firmaste tu primera colaboración',            unlocked: true,  color: 'text-pink-400 bg-pink-400/10'     },
      { id: 'three_collabs', icon: Users,        label: '3 colaboraciones',       desc: 'Tienes 3 creadoras activas',                  unlocked: true,  color: 'text-indigo-400 bg-indigo-400/10' },
      { id: 'top_closer',    icon: Zap,          label: 'Top Closer',             desc: 'Cerraste 5 tratos en una semana',             unlocked: true,  color: 'text-amber-500 bg-amber-500/10'   },
      { id: 'fifty_sales',   icon: BadgeCheck,   label: '50 ventas',              desc: 'Alcanza 50 ventas para desbloquear',          unlocked: false, color: 'text-gray-400 bg-gray-400/10'     },
      { id: 'five_collabs',  icon: Target,       label: '5 colaboraciones',       desc: 'Necesitas 2 creadoras más',                   unlocked: false, color: 'text-gray-400 bg-gray-400/10'     },
      { id: 'diamond',       icon: Trophy,       label: 'Vendedor Diamante',      desc: 'Logra $2M en comisiones acumuladas',          unlocked: false, color: 'text-gray-400 bg-gray-400/10'     },
    ],
    recentActivity: [
      { label: 'Ventas este mes',        count: 8,  period: 'junio 2026'  },
      { label: 'Nuevos contactos',       count: 12, period: 'últimos 30d'  },
      { label: 'Tratos en pipeline',     count: 14, period: 'activos'      },
      { label: 'Mensajes enviados',      count: 47, period: 'esta semana'  },
    ],
    topCreators: [
      { name: 'Valentina López', gradient: 'from-violet-400 to-purple-600', sales: 18 },
      { name: 'Sofía Ramírez',   gradient: 'from-pink-400 to-rose-500',     sales: 11 },
      { name: 'Camila Torres',   gradient: 'from-blue-400 to-indigo-500',   sales: 7  },
    ],
  },
};

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Collaboration request modal ───────────────────────────────────────────────

function CollabModal({ sellerName, onClose }: { sellerName: string; onClose: () => void }) {
  const [name,    setName]    = useState('');
  const [profile, setProfile] = useState('');
  const [message, setMessage] = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSend = () => {
    if (!name.trim()) { toast.error('Ingresa tu nombre'); return; }
    setSent(true);
    setTimeout(() => {
      toast.success('Solicitud enviada correctamente');
      onClose();
    }, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Solicitar colaboración</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">con {sellerName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <p className="text-base font-bold text-gray-900 dark:text-white/90">¡Solicitud enviada!</p>
            <p className="text-sm text-gray-400 dark:text-white/30 mt-1">{sellerName} recibirá tu propuesta pronto.</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Tu nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de tu perfil o marca"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Tu perfil / red social</label>
              <input value={profile} onChange={e => setProfile(e.target.value)} placeholder="@usuario o link a tu perfil"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Mensaje (opcional)</label>
              <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Cuéntale de qué va tu contenido y por qué quieres colaborar..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSend}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors">
                <Send className="w-3.5 h-3.5" /> Enviar solicitud
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PublicSellerProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [collabOpen, setCollabOpen] = useState(false);

  const seller = MOCK_SELLERS[username ?? ''] ?? MOCK_SELLERS['dev_user'];
  const unlockedAchievements = seller.achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D14]">

      {/* Hero banner */}
      <div className="h-44 bg-gradient-to-r from-[#6850E8] via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-[#0D0D14] to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 pb-16 relative">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-6 shadow-xl mb-5"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${seller.gradient} flex items-center justify-center text-white text-2xl font-black flex-shrink-0 ring-4 ring-white dark:ring-[#111118]`}>
              {seller.name[0]}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">{seller.name}</h1>
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5]">
                  <BadgeCheck className="w-3 h-3" /> Vendedor verificado
                </span>
              </div>
              <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">@{seller.username} · desde {seller.joinedDate}</p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {seller.specialty.split(' · ').map(tag => (
                  <span key={tag} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA button */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setCollabOpen(true)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#6850E8] text-white text-sm font-bold rounded-2xl hover:bg-[#5a44d4] transition-colors shadow-lg shadow-[#6850E8]/25 flex-shrink-0"
            >
              <Handshake className="w-4 h-4" />
              Colaborar
            </motion.button>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-500 dark:text-white/50 mt-4 leading-relaxed">{seller.bio}</p>

          {/* Mobile CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setCollabOpen(true)}
            className="sm:hidden w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#6850E8] text-white text-sm font-bold rounded-2xl hover:bg-[#5a44d4] transition-colors"
          >
            <Handshake className="w-4 h-4" />
            Enviar solicitud de colaboración
          </motion.button>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5"
        >
          {[
            { label: 'Ventas cerradas',   value: seller.stats.totalSales,    icon: <ShoppingBag className="w-4 h-4" />, color: '#6850E8', bg: '#6850E810', fmt: (n: number) => String(n) },
            { label: 'Creadoras activas', value: seller.stats.creatorsActive, icon: <Users className="w-4 h-4" />,       color: '#F59E0B', bg: '#F59E0B10', fmt: (n: number) => String(n) },
            { label: 'Ingresos generados',value: seller.stats.totalEarned,   icon: <DollarSign className="w-4 h-4" />,  color: '#10B981', bg: '#10B98110', fmt: (n: number) => COP(n)     },
            { label: 'Tasa de conversión',value: seller.stats.conversionRate, icon: <Target className="w-4 h-4" />,      color: '#3B82F6', bg: '#3B82F610', fmt: (n: number) => `${n}%`    },
            { label: 'Valor medio deal',  value: seller.stats.avgDeal,       icon: <BarChart2 className="w-4 h-4" />,   color: '#8B5CF6', bg: '#8B5CF610', fmt: (n: number) => COP(n)     },
            { label: 'Logros desbloqueados', value: unlockedAchievements,    icon: <Trophy className="w-4 h-4" />,       color: '#EC4899', bg: '#EC489910', fmt: (n: number) => `${n} / ${seller.achievements.length}` },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums leading-none">{s.fmt(s.value)}</p>
              <p className="text-[11px] text-gray-400 dark:text-white/30 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-5 shadow-sm mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Actividad reciente</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {seller.recentActivity.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-3 text-center"
              >
                <p className="text-2xl font-black text-[#6850E8] dark:text-[#9277F5] tabular-nums">{a.count}</p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-white/40 mt-0.5 leading-tight">{a.label}</p>
                <p className="text-[9px] text-gray-300 dark:text-white/20 mt-0.5">{a.period}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hitos / Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-5 shadow-sm mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Hitos y logros</h2>
            <span className="ml-auto text-xs font-bold text-[#6850E8] dark:text-[#9277F5]">
              {unlockedAchievements}/{seller.achievements.length} desbloqueados
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {seller.achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  title={a.desc}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${
                    a.unlocked
                      ? 'border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]'
                      : 'border-dashed border-gray-200 dark:border-white/[0.04] opacity-40 grayscale'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.unlocked ? a.color : 'bg-gray-100 dark:bg-white/[0.04] text-gray-300 dark:text-white/15'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-600 dark:text-white/50 leading-tight">{a.label}</p>
                  {a.unlocked && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Top creadoras */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-5 shadow-sm mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8]">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Creadoras con las que colabora</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {seller.topCreators.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2.5 bg-gray-50 dark:bg-white/[0.03] rounded-2xl px-3 py-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-white/60">{c.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/25">{c.sales} ventas</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="bg-gradient-to-br from-[#6850E8]/10 to-violet-500/5 dark:from-[#6850E8]/15 dark:to-violet-500/10 border border-[#6850E8]/20 rounded-3xl p-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#6850E8] mx-auto mb-3 flex items-center justify-center shadow-lg shadow-[#6850E8]/30">
            <Handshake className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">¿Eres creadora de contenido?</h3>
          <p className="text-sm text-gray-500 dark:text-white/40 mb-4 leading-relaxed">
            Colabora con {seller.name} y deja que gestione tus ventas mientras tú creas.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCollabOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#6850E8] text-white font-bold rounded-2xl hover:bg-[#5a44d4] transition-colors shadow-lg shadow-[#6850E8]/25"
          >
            <Send className="w-4 h-4" />
            Enviar solicitud de colaboración
          </motion.button>
        </motion.div>
      </div>

      {/* Collab modal */}
      <AnimatePresence>
        {collabOpen && (
          <CollabModal sellerName={seller.name} onClose={() => setCollabOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
