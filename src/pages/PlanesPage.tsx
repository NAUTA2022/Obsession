import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Zap, Crown, Star, CreditCard, Calendar,
  ArrowUpRight, Shield, Bot, Users, BarChart2,
  Download, X, Sparkles,
} from 'lucide-react';

// ── Types & data ───────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  color: string;
  bg: string;
  from: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
  features: string[];
  missing: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    description: 'Para explorar la plataforma sin compromiso.',
    color: '#6B7280',
    bg: '#6B728010',
    from: '#6B7280',
    to: '#9CA3AF',
    icon: <Zap className="w-5 h-5" />,
    features: ['5 productos activos', '1 vendedor colaborador', 'Chat IA básico', 'Estadísticas básicas'],
    missing: ['Bot de ventas IA', 'Studio AI', 'Reservas con código', 'Soporte prioritario'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    originalPrice: 49,
    description: 'El favorito de creadoras en crecimiento.',
    color: '#6850E8',
    bg: '#6850E810',
    from: '#6850E8',
    to: '#9277F5',
    icon: <Star className="w-5 h-5" />,
    badge: 'Más popular',
    features: ['Productos ilimitados', 'Hasta 5 vendedores', 'Chat IA avanzado', 'Bot de ventas IA', 'Studio AI · 1 000 créditos/mes', 'Reservas con código de sesión', 'Estadísticas completas'],
    missing: ['Soporte 24/7 + manager'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 79,
    description: 'Sin límites, con soporte dedicado.',
    color: '#F59E0B',
    bg: '#F59E0B10',
    from: '#F59E0B',
    to: '#FBBF24',
    icon: <Crown className="w-5 h-5" />,
    features: ['Productos ilimitados', 'Vendedores ilimitados', 'Chat IA sin límites', 'Bot de ventas con IA propia', 'Studio AI · créditos ilimitados', 'Reservas con código de sesión', 'Estadísticas + exportar datos', 'Soporte 24/7 + manager dedicado'],
    missing: [],
  },
];

const CURRENT_PLAN_ID = 'pro';

const BILLING = [
  { id: 'b1', date: '1 jun 2026', plan: 'Pro', amount: 29 },
  { id: 'b2', date: '1 may 2026', plan: 'Pro', amount: 29 },
  { id: 'b3', date: '1 abr 2026', plan: 'Pro', amount: 29 },
  { id: 'b4', date: '1 mar 2026', plan: 'Starter', amount: 0 },
];

// ── Upgrade modal ──────────────────────────────────────────────────────────────

function UpgradeModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.08] shadow-2xl overflow-hidden"
      >
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${plan.from}, ${plan.to})` }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${plan.from}, ${plan.to})` }}>
                {plan.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-white/30">Cambiar a</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-white/40">Nuevo precio</span>
              <span className="font-bold text-gray-900 dark:text-white">${plan.price}/mes</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500 dark:text-white/40">Próximo cargo</span>
              <span className="font-semibold text-gray-700 dark:text-white/70">1 jul 2026</span>
            </div>
          </div>
          <button
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all"
            style={{ background: `linear-gradient(135deg, ${plan.from}, ${plan.to})` }}
          >
            Confirmar cambio
          </button>
          <p className="text-center text-xs text-gray-400 dark:text-white/25 mt-3">Puedes cancelar en cualquier momento.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PlanesPage() {
  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null);
  const currentPlan = PLANS.find(p => p.id === CURRENT_PLAN_ID)!;

  const usage = [
    { icon: <Sparkles className="w-4 h-4" />, label: 'Créditos IA', value: 2340, cap: 3000, color: '#6850E8' },
    { icon: <Users className="w-4 h-4" />,    label: 'Vendedores',  value: 3,    cap: 5,    color: '#3B82F6' },
    { icon: <Bot className="w-4 h-4" />,      label: 'Mensajes bot',value: 1283, cap: null,  color: '#10B981' },
    { icon: <BarChart2 className="w-4 h-4" />,label: 'Productos',   value: 12,   cap: null,  color: '#F59E0B' },
  ];

  return (
    <div className="w-full flex flex-col gap-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membresía</h1>
        <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">
          Gestiona tu suscripción y funciones incluidas.
        </p>
      </div>

      {/* ── Plan activo banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden text-white p-7"
        style={{ background: `linear-gradient(135deg, ${currentPlan.from} 0%, ${currentPlan.to} 100%)` }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 w-40 h-24 rounded-full bg-white/[0.07] blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Left: plan info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/25 flex-shrink-0">
              {currentPlan.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-0.5">Plan actual</p>
              <h2 className="text-2xl font-black leading-tight">{currentPlan.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-white/60" />
                <span className="text-xs text-white/60">Activo · se renueva el 1 jul 2026</span>
              </div>
            </div>
          </div>

          {/* Right: billing chips */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2">
              <CreditCard className="w-3.5 h-3.5 text-white/60" />
              <span className="text-sm font-semibold">•••• 4242</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2">
              <Calendar className="w-3.5 h-3.5 text-white/60" />
              <span className="text-sm font-semibold">${currentPlan.price}/mes</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Uso del plan ── */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-4">Uso del plan</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {usage.map((s, i) => {
            const pct = s.cap ? Math.round((s.value / s.cap) * 100) : null;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                    {s.icon}
                  </div>
                  {pct !== null && (
                    <span className="text-xs font-semibold tabular-nums" style={{ color: s.color }}>{pct}%</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-white/30 mb-1">{s.label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                  {s.value.toLocaleString()}
                  {s.cap && <span className="text-xs font-medium text-gray-300 dark:text-white/20 ml-1">/ {s.cap.toLocaleString()}</span>}
                </p>
                {pct !== null && (
                  <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Planes ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Planes disponibles</h2>
          <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/[0.05] rounded-full px-3 py-1">Facturación mensual</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === CURRENT_PLAN_ID;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative flex flex-col rounded-3xl bg-white dark:bg-[#111118] border overflow-hidden transition-all ${
                  isCurrent
                    ? 'shadow-lg'
                    : 'border-gray-100 dark:border-white/[0.06] hover:shadow-md'
                }`}
                style={isCurrent ? {
                  borderColor: plan.color,
                  boxShadow: `0 0 0 2px ${plan.color}`,
                } : {}}
              >
                {/* accent bar */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${plan.from}, ${plan.to})` }} />

                {/* popular badge */}
                {plan.badge && (
                  <div
                    className="absolute top-4 right-4 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${plan.from}, ${plan.to})` }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1 gap-6">

                  {/* name + price */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${plan.from}, ${plan.to})` }}>
                        {plan.icon}
                      </div>
                      <span className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/35 leading-relaxed mb-4">{plan.description}</p>
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-300 dark:text-white/20 line-through">${plan.originalPrice}/mes</p>
                    )}
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">
                        {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && <span className="text-sm text-gray-400 dark:text-white/30 pb-1">/mes</span>}
                    </div>
                  </div>

                  {/* features */}
                  <ul className="flex-1 space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-white/70">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                        </span>
                        {f}
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300 dark:text-white/20">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                          <span className="w-1.5 h-0.5 rounded-full bg-current block" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-2xl text-center text-sm font-bold bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/30">
                      Plan actual ✓
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUpgradeTarget(plan)}
                      className="w-full py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${plan.from}, ${plan.to})`,
                        boxShadow: `0 6px 20px ${plan.from}35`,
                      }}
                    >
                      {plan.price > 0 ? 'Cambiar a' : 'Bajar a'} {plan.name}
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Historial ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Historial de pagos</h2>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#6850E8] hover:text-[#5940d8] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar todo
          </button>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm divide-y divide-gray-50 dark:divide-white/[0.04]">
          {BILLING.map(b => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/30'}`}>
                {b.amount > 0 ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/80">Plan {b.plan}</p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{b.date}</p>
              </div>
              <div className="text-right mr-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                  {b.amount === 0 ? '—' : `$${b.amount}`}
                </p>
                <span className={`text-[10px] font-semibold ${b.amount > 0 ? 'text-emerald-500' : 'text-gray-400 dark:text-white/25'}`}>
                  {b.amount > 0 ? 'Pagado' : 'Gratis'}
                </span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors flex-shrink-0">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-300 dark:text-white/20 text-center mt-4">
          Los cambios de plan se aplican inmediatamente · Cancela en cualquier momento
        </p>
      </section>

      {/* ── Upgrade modal ── */}
      <AnimatePresence>
        {upgradeTarget && (
          <UpgradeModal plan={upgradeTarget} onClose={() => setUpgradeTarget(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
