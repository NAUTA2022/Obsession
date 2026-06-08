import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MessageCircle, Percent, Check, X, ChevronRight, Send,
  TrendingUp, DollarSign, Users, BarChart2, Eye, RefreshCw,
  Globe, Star, MessageSquare,
} from 'lucide-react';
import { chatService } from '../services/api/chat.service';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import Avatar from '../components/ui/Avatar';

// ── Types ──────────────────────────────────────────────────────────────────────

type CommissionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';
interface CommissionState { status: CommissionStatus; percentage: number; proposedBy?: string; }

interface SellerRow {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
  role: string;
  commission: number;
  salesThisMonth: number;
  revenueGenerated: number;
  conversionRate: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'paused';
}

// ── Rich mock data ─────────────────────────────────────────────────────────────

const MOCK_SELLERS: SellerRow[] = [
  {
    id: 's1', displayName: 'Carlos Mendez', username: 'carlos_sales',
    profilePicture: 'https://i.pravatar.cc/150?u=carlos_sales',
    role: 'vendedor', commission: 15,
    salesThisMonth: 23, revenueGenerated: 4280, conversionRate: 38, lastActive: 'Hace 2h', status: 'active',
  },
  {
    id: 's2', displayName: 'Andrés Pérez', username: 'andres_closer',
    profilePicture: 'https://i.pravatar.cc/150?u=andres_closer',
    role: 'vendedor', commission: 12,
    salesThisMonth: 17, revenueGenerated: 2940, conversionRate: 31, lastActive: 'Ayer', status: 'active',
  },
  {
    id: 's3', displayName: 'Marco Silva', username: 'marco_ventas',
    profilePicture: 'https://i.pravatar.cc/150?u=marco_ventas',
    role: 'vendedor', commission: 18,
    salesThisMonth: 9, revenueGenerated: 3600, conversionRate: 42, lastActive: 'Hace 5h', status: 'active',
  },
  {
    id: 's4', displayName: 'Valentina Cruz', username: 'vale_closer',
    profilePicture: 'https://i.pravatar.cc/150?u=vale_closer',
    role: 'vendedor', commission: 14,
    salesThisMonth: 0, revenueGenerated: 890, conversionRate: 22, lastActive: 'Hace 3 días', status: 'paused',
  },
];

const MOCK_PROPOSALS = [
  {
    id: 'p1', displayName: 'Diego Ramírez', username: 'diego_sales',
    profilePicture: 'https://i.pravatar.cc/150?u=diego_sales',
    proposedCommission: 20, message: 'Hola, me especializo en coaches y tengo una tasa de conversión del 41%. Me gustaría colaborar contigo.',
    receivedAt: 'Hace 1h',
  },
  {
    id: 'p2', displayName: 'Lucía Herrera', username: 'lucia_closer',
    profilePicture: 'https://i.pravatar.cc/150?u=lucia_closer',
    proposedCommission: 16, message: 'Trabajo con contenido premium. Tengo experiencia en productos de $99+.',
    receivedAt: 'Hace 4h',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<SellerRow['status'], { label: string; cls: string }> = {
  active:   { label: 'Activo',   cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  paused:   { label: 'Pausado',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  inactive: { label: 'Inactivo', cls: 'bg-gray-200 dark:bg-white/[0.06] text-gray-500 dark:text-white/40' },
};

// ── Commission proposal modal ──────────────────────────────────────────────────

function CommissionModal({
  seller, current, onPropose, onAccept, onDecline, onClose,
}: {
  seller: SellerRow;
  current: CommissionState;
  onPropose: (pct: number) => void;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(current.percentage || 15);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Avatar src={seller.profilePicture} name={seller.displayName} size={36} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{seller.displayName}</p>
              <p className="text-xs text-gray-400 dark:text-white/30">@{seller.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {current.status === 'accepted' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-1">Comisión activa</p>
            <p className="text-3xl font-bold text-[#6850E8] my-3">{current.percentage}%</p>
            <p className="text-xs text-gray-400 dark:text-white/30">Se aplica automáticamente a todas las ventas generadas.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-white/60 mb-4">
              Propone un nuevo porcentaje de comisión para renegociar con {seller.displayName}.
            </p>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Comisión propuesta</label>
                <span className="text-lg font-bold text-[#6850E8]">{value}%</span>
              </div>
              <input
                type="range" min={5} max={50} step={1} value={value}
                onChange={e => setValue(Number(e.target.value))}
                className="w-full accent-[#6850E8]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/25 mt-1">
                <span>5%</span><span>25%</span><span>50%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onDecline} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => onPropose(value)}
                className="flex-1 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Proponer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Metrics drawer ─────────────────────────────────────────────────────────────

function MetricsDrawer({ seller, onClose }: { seller: SellerRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar src={seller.profilePicture} name={seller.displayName} size={40} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white/90">{seller.displayName}</p>
              <p className="text-xs text-gray-400 dark:text-white/30">@{seller.username} · {seller.commission}% comisión</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: <DollarSign className="w-4 h-4" />, label: 'Ingresos generados', value: `$${seller.revenueGenerated.toLocaleString()}`, color: '#6850E8' },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Ventas este mes', value: seller.salesThisMonth, color: '#10B981' },
            { icon: <BarChart2 className="w-4 h-4" />, label: 'Tasa de conversión', value: `${seller.conversionRate}%`, color: '#3B82F6' },
            { icon: <RefreshCw className="w-4 h-4" />, label: 'Última actividad', value: seller.lastActive, color: '#F59E0B' },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ color: m.color }}>{m.icon}</span>
                <span className="text-xs text-gray-400 dark:text-white/35 truncate">{m.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] p-3.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2">Progreso mensual</p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-white/40">{seller.salesThisMonth} ventas</span>
            <span className="text-xs font-bold text-gray-700 dark:text-white/70">Meta: 30</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6850E8] transition-all duration-700"
              style={{ width: `${Math.min((seller.salesThisMonth / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Seller profile modal ───────────────────────────────────────────────────────

interface ProfileSubject {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
  commission?: number;
  message?: string;
  salesThisMonth?: number;
  revenueGenerated?: number;
  conversionRate?: number;
  lastActive?: string;
  status?: string;
}

function SellerProfileModal({ subject, onClose, onMessage }: {
  subject: ProfileSubject;
  onClose: () => void;
  onMessage: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
        {/* Cover + avatar anchored to bottom of banner */}
        <div className="h-28 bg-gradient-to-br from-[#6850E8]/30 to-violet-600/20 relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
          {/* Avatar sits at the bottom-left, half inside the banner */}
          <div className="absolute -bottom-10 left-5 w-20 h-20 rounded-2xl border-4 border-white dark:border-[#111118] overflow-hidden bg-gray-200 shadow-lg z-10">
            {subject.profilePicture
              ? <img src={subject.profilePicture} alt={subject.displayName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">{subject.displayName[0]}</div>
            }
          </div>
        </div>

        {/* Content — pt-12 leaves room for the avatar overflow */}
        <div className="px-5 pb-5 pt-12">
          <div className="flex items-center justify-between mb-3">
            <div />{/* spacer for avatar */}
            {subject.commission !== undefined && (
              <span className="flex items-center gap-1 text-sm font-bold text-[#6850E8] bg-[#6850E8]/10 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" />
                {subject.commission}% comisión
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{subject.displayName}</h2>
          <p className="text-sm text-gray-400 dark:text-white/35 flex items-center gap-1 mt-0.5">
            <Globe className="w-3 h-3" />@{subject.username}
          </p>

          {subject.message && (
            <p className="mt-3 text-sm text-gray-600 dark:text-white/50 leading-relaxed bg-gray-50 dark:bg-white/[0.04] rounded-xl p-3 italic">
              "{subject.message}"
            </p>
          )}

          {/* Stats grid if available */}
          {(subject.salesThisMonth !== undefined || subject.revenueGenerated !== undefined) && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'Ventas/mes', value: subject.salesThisMonth ?? '—' },
                { label: 'Ingresos', value: subject.revenueGenerated !== undefined ? `$${subject.revenueGenerated.toLocaleString()}` : '—' },
                { label: 'Conversión', value: subject.conversionRate !== undefined ? `${subject.conversionRate}%` : '—' },
              ].map(m => (
                <div key={m.label} className="rounded-xl bg-gray-50 dark:bg-white/[0.04] p-2.5 text-center">
                  <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{m.value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { onMessage(subject.id); onClose(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Enviar mensaje
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CollaborationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'sellers' | 'proposals'>('sellers');
  const [commissions, setCommissions] = useState<Record<string, CommissionState>>({});
  const [activeCommModal, setActiveCommModal] = useState<string | null>(null);
  const [activeMetrics, setActiveMetrics] = useState<string | null>(null);
  const [profileSubject, setProfileSubject] = useState<ProfileSubject | null>(null);

  useEffect(() => {
    const initial: Record<string, CommissionState> = {};
    MOCK_SELLERS.forEach(s => {
      initial[s.id] = { status: 'accepted', percentage: s.commission };
    });
    setCommissions(initial);
  }, []);

  const handleMessage = async (userId: string) => {
    try {
      const { conversationId } = await chatService.startConversationWith(userId);
      navigate(`${ROUTES['creator-inbox']}?c=${conversationId}`);
    } catch {
      toast.error('No se pudo abrir la conversación');
    }
  };

  const handlePropose = (sellerId: string, pct: number) => {
    setCommissions(p => ({ ...p, [sellerId]: { status: 'pending_sent', percentage: pct } }));
    setActiveCommModal(null);
    toast.success('Propuesta enviada');
  };

  const handleAcceptProposal = (id: string, pct: number) => {
    toast.success(`Colaboración con ${MOCK_PROPOSALS.find(p => p.id === id)?.displayName} aceptada`);
  };
  const handleDeclineProposal = (id: string) => {
    toast('Propuesta rechazada');
  };

  // Stats
  const totalRevenue = MOCK_SELLERS.reduce((s, v) => s + v.revenueGenerated, 0);
  const totalSales   = MOCK_SELLERS.reduce((s, v) => s + v.salesThisMonth, 0);
  const active       = MOCK_SELLERS.filter(s => s.status === 'active').length;

  const activeSeller   = MOCK_SELLERS.find(s => s.id === activeCommModal);
  const metricsSellerObj = MOCK_SELLERS.find(s => s.id === activeMetrics);

  return (
    <div className="w-full">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis vendedores</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">Gestiona tus colaboraciones, comisiones y rendimiento.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Users className="w-4 h-4" />, label: 'Vendedores activos', value: active, color: '#6850E8' },
          { icon: <DollarSign className="w-4 h-4" />, label: 'Ingresos generados', value: `$${totalRevenue.toLocaleString()}`, color: '#10B981' },
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Ventas este mes', value: totalSales, color: '#3B82F6' },
          { icon: <Percent className="w-4 h-4" />, label: 'Propuestas nuevas', value: MOCK_PROPOSALS.length, color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-white/35 truncate">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1 w-fit">
        {[
          { key: 'sellers', label: 'Mis vendedores' },
          { key: 'proposals', label: `Propuestas (${MOCK_PROPOSALS.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Sellers table ── */}
      {tab === 'sellers' && (
        <div className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06] text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
            <span>Vendedor</span>
            <span>Comisión</span>
            <span>Ventas</span>
            <span>Ingresos</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {/* Rows */}
          {MOCK_SELLERS.map((seller, i) => {
            const comm = commissions[seller.id];
            const { label: stLabel, cls: stCls } = STATUS_LABELS[seller.status];
            return (
              <div
                key={seller.id}
                className={`grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_auto] gap-4 items-center px-5 py-4 ${
                  i < MOCK_SELLERS.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''
                } hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors`}
              >
                {/* Name — clickable to open profile */}
                <button
                  className="flex items-center gap-3 text-left min-w-0 hover:opacity-80 transition-opacity"
                  onClick={() => setProfileSubject({ ...seller })}
                >
                  <Avatar src={seller.profilePicture} name={seller.displayName} size={38} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{seller.displayName}</p>
                    <p className="text-xs text-gray-400 dark:text-white/30">@{seller.username} · {seller.lastActive}</p>
                  </div>
                </button>

                {/* Commission */}
                <div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#6850E8]">
                    <Percent className="w-3.5 h-3.5" />
                    {comm?.percentage ?? seller.commission}%
                  </span>
                  {comm?.status === 'pending_sent' && (
                    <p className="text-[10px] text-amber-500 mt-0.5">Renegociando…</p>
                  )}
                </div>

                {/* Sales */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/80">{seller.salesThisMonth}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30">ventas / mes</p>
                </div>

                {/* Revenue */}
                <div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">${seller.revenueGenerated.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30">{seller.conversionRate}% conv.</p>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${stCls}`}>
                    {stLabel}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMessage(seller.id)}
                    title="Ir al chat"
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveMetrics(seller.id)}
                    title="Ver métricas"
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveCommModal(seller.id)}
                    title="Renegociar comisión"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#6850E8]/10 text-[#6850E8] hover:bg-[#6850E8]/20 transition-colors"
                  >
                    <Percent className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Proposals tab ── */}
      {tab === 'proposals' && (
        <div className="space-y-3">
          {MOCK_PROPOSALS.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-white/25 text-sm">
              No tienes propuestas pendientes.
            </div>
          ) : MOCK_PROPOSALS.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button className="flex items-center gap-3 text-left min-w-0 hover:opacity-80 transition-opacity flex-1"
                  onClick={() => setProfileSubject({ id: p.id, displayName: p.displayName, username: p.username, profilePicture: p.profilePicture, commission: p.proposedCommission, message: p.message })}>
                <Avatar src={p.profilePicture} name={p.displayName} size={44} className="flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{p.displayName}</p>
                    <span className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-2 py-0.5">
                      {p.proposedCommission}% propuesto
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-white/25">{p.receivedAt}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 line-clamp-2">{p.message}</p>
                </div>
                </button>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDeclineProposal(p.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <X className="w-4 h-4" /> Rechazar
                </button>
                <button
                  onClick={() => handleAcceptProposal(p.id, p.proposedCommission)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-sm font-semibold text-white transition-colors"
                >
                  <Check className="w-4 h-4" /> Aceptar
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {activeCommModal && activeSeller && commissions[activeCommModal] && (
        <CommissionModal
          seller={activeSeller}
          current={commissions[activeCommModal]}
          onPropose={(pct) => handlePropose(activeCommModal, pct)}
          onAccept={() => {
            setCommissions(p => ({ ...p, [activeCommModal]: { status: 'accepted', percentage: commissions[activeCommModal].percentage } }));
            setActiveCommModal(null);
          }}
          onDecline={() => setActiveCommModal(null)}
          onClose={() => setActiveCommModal(null)}
        />
      )}

      {activeMetrics && metricsSellerObj && (
        <MetricsDrawer seller={metricsSellerObj} onClose={() => setActiveMetrics(null)} />
      )}

      {profileSubject && (
        <SellerProfileModal
          subject={profileSubject}
          onClose={() => setProfileSubject(null)}
          onMessage={handleMessage}
        />
      )}
    </div>
  );
}
