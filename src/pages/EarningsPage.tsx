import { useState } from 'react';
import {
  Wallet, Sparkles, Users, Bot, TrendingUp, ArrowDownLeft,
  ArrowUpRight, CreditCard, ChevronRight, MessageCircle,
  ShoppingBag, BarChart2, Clock,
} from 'lucide-react';

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK = {
  mainBalance: 4_287.50,
  pendingBalance: 820.00,
  aiCredits: 2_340,
  aiCreditsUsed: 660,
  aiCreditsTotal: 3_000,
  sellerBalance: 1_640.20,
  botStats: {
    activeConversations: 47,
    totalConversations: 1_283,
    salesFromBot: 32,
    revenueFromBot: 2_890,
    conversionRate: 18,
    avgResponseTime: '1.2 min',
  },
  transactions: [
    { id: 't1', type: 'income', label: 'Venta — Pack Entrenamiento', amount: 89, date: 'Hoy, 14:32', source: 'direct' },
    { id: 't2', type: 'income', label: 'Comisión vendedor — Carlos M.', amount: 45, date: 'Hoy, 11:18', source: 'seller' },
    { id: 't3', type: 'credit', label: 'Créditos IA — Plan Pro', amount: 500, date: 'Ayer', source: 'credits' },
    { id: 't4', type: 'income', label: 'Venta — Masterclass Business', amount: 199, date: 'Ayer', source: 'bot' },
    { id: 't5', type: 'payout', label: 'Retiro a cuenta bancaria', amount: -500, date: '03 Jun', source: 'payout' },
    { id: 't6', type: 'income', label: 'Venta — Coaching 1:1', amount: 149, date: '02 Jun', source: 'direct' },
    { id: 't7', type: 'income', label: 'Comisión vendedor — Andrés P.', amount: 28, date: '02 Jun', source: 'seller' },
    { id: 't8', type: 'income', label: 'Venta — Lookbook Primavera', amount: 29, date: '01 Jun', source: 'bot' },
  ],
  weeklyRevenue: [1200, 980, 1540, 870, 2100, 1760, 1420],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  direct:  { label: 'Directo',  cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',    icon: <ShoppingBag className="w-3 h-3" /> },
  seller:  { label: 'Vendedor', cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', icon: <Users className="w-3 h-3" /> },
  bot:     { label: 'Bot',      cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: <Bot className="w-3 h-3" /> },
  credits: { label: 'IA',       cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',  icon: <Sparkles className="w-3 h-3" /> },
  payout:  { label: 'Retiro',   cls: 'bg-red-500/10 text-red-500',                          icon: <ArrowUpRight className="w-3 h-3" /> },
};

// ── Mini bar chart ─────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <div className="flex items-end gap-1.5 h-12">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-[#6850E8]/40 dark:bg-[#6850E8]/50 transition-all"
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="text-[9px] text-gray-400 dark:text-white/25">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Circular progress ──────────────────────────────────────────────────────────

function CircleProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-gray-100 dark:text-white/[0.06]" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" />
    </svg>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type View = 'overview' | 'transactions' | 'bot';

export default function EarningsPage() {
  const [view, setView] = useState<View>('overview');

  const aiPct = Math.round((MOCK.aiCredits / MOCK.aiCreditsTotal) * 100);

  return (
    <div className="w-full space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6850E8] to-violet-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </span>
            Mis ingresos
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/30 mt-0.5">Balance, créditos IA y rendimiento de tu bot.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6850E8] text-white text-sm font-semibold hover:bg-[#5940d8] transition-colors shadow-sm shadow-[#6850E8]/30">
          <ArrowUpRight className="w-4 h-4" /> Retirar fondos
        </button>
      </div>

      {/* ── Top row: balance card + quick stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main balance — takes 2 cols */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6850E8] via-violet-600 to-indigo-700 p-7 text-white shadow-2xl shadow-violet-500/25">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm text-white/60 font-medium mb-1">Balance disponible</p>
            <p className="text-5xl font-bold tabular-nums tracking-tight">
              ${MOCK.mainBalance.toLocaleString('en', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/50 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              ${MOCK.pendingBalance.toLocaleString()} pendiente de acreditación
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold backdrop-blur-sm">
                <ArrowUpRight className="w-4 h-4" /> Retirar
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold backdrop-blur-sm">
                <ArrowDownLeft className="w-4 h-4" /> Historial
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats column */}
        <div className="flex flex-col gap-4">
          {/* AI Credits */}
          <div className="flex-1 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-gray-400 dark:text-white/35 font-medium">Créditos IA</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
                  {MOCK.aiCredits.toLocaleString()}
                </p>
              </div>
              <CircleProgress value={MOCK.aiCredits} max={MOCK.aiCreditsTotal} color="#6850E8" size={52} />
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-[#6850E8]" style={{ width: `${aiPct}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-white/25 mt-1">
              {MOCK.aiCreditsUsed.toLocaleString()} usados de {MOCK.aiCreditsTotal.toLocaleString()}
            </p>
            <button className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/[0.07] text-xs font-semibold text-gray-500 dark:text-white/35 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
              <CreditCard className="w-3 h-3" /> Recargar créditos
            </button>
          </div>

          {/* Weekly trend mini */}
          <div className="flex-1 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-white/35 font-medium">Esta semana</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                  ${MOCK.weeklyRevenue.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> +14%
              </span>
            </div>
            <MiniBarChart data={MOCK.weeklyRevenue} />
          </div>
        </div>
      </div>

      {/* ── Middle row: seller balance + bot overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Seller balance */}
        <div className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-white/35 font-medium">Ingresos de vendedores</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                ${MOCK.sellerBalance.toLocaleString('en', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Carlos M.', value: '$845', pct: 52, color: 'bg-violet-500' },
              { label: 'Andrés P.', value: '$490', pct: 30, color: 'bg-indigo-400' },
              { label: 'Otros',     value: '$305', pct: 18, color: 'bg-violet-300' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 dark:text-white/40 w-16 shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-[11px] text-gray-500 dark:text-white/40 w-10 text-right shrink-0">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bot quick stats */}
        {[
          { icon: <MessageCircle className="w-4 h-4" />, label: 'Conversaciones activas', value: MOCK.botStats.activeConversations, sub: 'en este momento', color: '#6850E8' },
          { icon: <ShoppingBag className="w-4 h-4" />, label: 'Ventas del bot', value: MOCK.botStats.salesFromBot, sub: `$${MOCK.botStats.revenueFromBot.toLocaleString()} generados`, color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-white/35 font-medium">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-white/25 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bot performance full stats ── */}
      <div className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Rendimiento del bot</p>
              <p className="text-xs text-gray-400 dark:text-white/30">Actividad de tu asistente IA</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-0 divide-x divide-y divide-gray-100 dark:divide-white/[0.04]">
          {[
            { icon: <MessageCircle className="w-4 h-4" />, label: 'Activas ahora',      value: MOCK.botStats.activeConversations, color: '#6850E8' },
            { icon: <BarChart2 className="w-4 h-4" />,    label: 'Total historial',     value: MOCK.botStats.totalConversations.toLocaleString(), color: '#3B82F6' },
            { icon: <ShoppingBag className="w-4 h-4" />,  label: 'Ventas generadas',    value: MOCK.botStats.salesFromBot, color: '#10B981' },
            { icon: <TrendingUp className="w-4 h-4" />,   label: 'Ingresos del bot',    value: `$${MOCK.botStats.revenueFromBot.toLocaleString()}`, color: '#10B981' },
            { icon: <BarChart2 className="w-4 h-4" />,    label: 'Conversión',          value: `${MOCK.botStats.conversionRate}%`, color: '#F59E0B' },
            { icon: <Clock className="w-4 h-4" />,        label: 'Resp. promedio',      value: MOCK.botStats.avgResponseTime, color: '#6B7280' },
          ].map(s => (
            <div key={s.label} className="flex items-start gap-3 px-4 py-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 dark:text-white/35 leading-snug">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Movimientos recientes</p>
          <button className="flex items-center gap-1 text-xs text-[#6850E8] font-semibold hover:underline">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {MOCK.transactions.map(tx => {
            const src = SOURCE_META[tx.source] ?? SOURCE_META.direct;
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${src.cls}`}>
                  {src.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-white/80 truncate">{tx.label}</p>
                  <p className="text-xs text-gray-400 dark:text-white/25">{tx.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}${Math.abs(tx.amount)}
                  </p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${src.cls}`}>{src.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
