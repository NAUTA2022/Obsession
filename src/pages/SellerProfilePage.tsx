import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Edit3, Check, X, Trophy, TrendingUp, Star,
  Percent, FileText, Award, Target, Zap, Crown,
  BadgeCheck, Flame, DollarSign, Users, Save,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SellerStats {
  totalSales: number;
  totalRevenue: number;
  avgCommission: number;
  creatorsCount: number;
  topCreator: string;
  streak: number; // days active
}

interface Achievement {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  unlocked: boolean;
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_STATS: SellerStats = {
  totalSales: 47,
  totalRevenue: 6_850_000,
  avgCommission: 15,
  creatorsCount: 3,
  topCreator: 'Valentina López',
  streak: 12,
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sale',
    icon: <Star className="w-5 h-5" />,
    label: 'Primera venta',
    description: 'Cerraste tu primera venta con éxito',
    unlocked: true,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'ten_sales',
    icon: <TrendingUp className="w-5 h-5" />,
    label: '10 ventas',
    description: 'Alcanzaste 10 ventas cerradas',
    unlocked: true,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'streak_7',
    icon: <Flame className="w-5 h-5" />,
    label: 'Racha de 7 días',
    description: '7 días consecutivos de actividad',
    unlocked: true,
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'top_seller',
    icon: <Crown className="w-5 h-5" />,
    label: 'Top vendedor',
    description: 'Primer lugar en ventas del mes',
    unlocked: false,
    color: 'from-violet-400 to-purple-600',
  },
  {
    id: 'multi_creator',
    icon: <Users className="w-5 h-5" />,
    label: 'Multi-creadora',
    description: 'Colabora con 3 o más creadoras',
    unlocked: true,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'million',
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Primer millón',
    description: 'Superaste $1.000.000 en ventas',
    unlocked: true,
    color: 'from-emerald-500 to-green-600',
  },
  {
    id: 'fifty_sales',
    icon: <Trophy className="w-5 h-5" />,
    label: '50 ventas',
    description: 'Alcanzaste 50 ventas en total',
    unlocked: false,
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'verified',
    icon: <BadgeCheck className="w-5 h-5" />,
    label: 'Vendedor verificado',
    description: 'Perfil completado y verificado',
    unlocked: false,
    color: 'from-[#6850E8] to-purple-600',
  },
];

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE FIELD
// ─────────────────────────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  multiline = false,
  onSave,
  prefix,
  suffix,
  type = 'text',
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onSave: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const save = () => {
    onSave(draft);
    setEditing(false);
    toast.success('Guardado');
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">{label}</label>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-all"
          >
            <Edit3 className="w-3 h-3" />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {prefix && <span className="text-sm font-semibold text-gray-400 dark:text-white/30 flex-shrink-0">{prefix}</span>}
            {multiline ? (
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                autoFocus
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/[0.04] border border-[#6850E8]/40 rounded-xl text-gray-800 dark:text-white/80 outline-none focus:ring-2 focus:ring-[#6850E8]/30 resize-none transition-all"
              />
            ) : (
              <input
                type={type}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/[0.04] border border-[#6850E8]/40 rounded-xl text-gray-800 dark:text-white/80 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
              />
            )}
            {suffix && <span className="text-sm font-semibold text-gray-400 dark:text-white/30 flex-shrink-0">{suffix}</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-xs font-semibold rounded-xl hover:bg-[#5a44d4] transition-colors"
            >
              <Save className="w-3 h-3" /> Guardar
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className={`text-sm text-gray-800 dark:text-white/80 ${!value && 'italic text-gray-300 dark:text-white/20'}`}>
          {prefix && <span className="text-gray-400 dark:text-white/30">{prefix}</span>}
          {value || 'Sin definir'}
          {suffix && <span className="text-gray-400 dark:text-white/30"> {suffix}</span>}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SellerProfilePage() {
  const user = useAuthStore(s => s.user);

  const [commission, setCommission] = useState('15');
  const [bio, setBio] = useState('Vendedor especializado en contenido exclusivo. Me enfoco en crear conexiones genuinas entre creadoras y sus mejores clientes.');
  const [specialty, setSpecialty] = useState('Contenido premium, sesiones 1:1');
  const [whatsapp, setWhatsapp]   = useState('+57 300 000 0000');

  const stats = MOCK_STATS;
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6850E8] to-purple-700 p-6 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-10 right-8 w-28 h-28 rounded-full bg-white/[0.04]" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="relative">
            <Avatar src={user?.profilePicture} name={user?.firstName ?? 'Vendedor'} size={64} />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-lg font-bold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-white/15 rounded-full">
                <Zap className="w-2.5 h-2.5" /> Vendedor
              </span>
            </div>
            <p className="text-sm text-white/60 truncate">{user?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="text-center">
                <p className="text-xl font-bold">{stats.totalSales}</p>
                <p className="text-[10px] text-white/50">Ventas</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="text-center">
                <p className="text-xl font-bold">{stats.creatorsCount}</p>
                <p className="text-[10px] text-white/50">Creadoras</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="text-center">
                <p className="text-xl font-bold">{stats.streak}</p>
                <p className="text-[10px] text-white/50">Días activo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Revenue summary ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-white/30">Ventas totales</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white/90">{COP(stats.totalRevenue)}</p>
          <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">+{stats.totalSales} operaciones</p>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-[#6850E8]/10 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5 text-[#6850E8]" />
            </div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-white/30">Comisión promedio</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white/90">{stats.avgCommission}%</p>
          <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">sobre precio de venta</p>
        </div>
      </div>

      {/* ── Editable profile ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <User className="w-4 h-4 text-[#6850E8]" />
          <p className="text-sm font-bold text-gray-800 dark:text-white/80">Perfil de vendedor</p>
        </div>

        <div className="px-5 py-4 space-y-5 divide-y divide-gray-50 dark:divide-white/[0.04]">
          <EditableField
            label="Comisión principal"
            value={commission}
            onSave={setCommission}
            suffix="% sobre cada venta"
            type="number"
          />
          <div className="pt-4">
            <EditableField
              label="Descripción"
              value={bio}
              multiline
              onSave={setBio}
            />
          </div>
          <div className="pt-4">
            <EditableField
              label="Especialidad"
              value={specialty}
              onSave={setSpecialty}
            />
          </div>
          <div className="pt-4">
            <EditableField
              label="WhatsApp de contacto"
              value={whatsapp}
              onSave={setWhatsapp}
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* ── Commission tiers info ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <Target className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-bold text-gray-800 dark:text-white/80">Niveles de comisión</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { tier: 'Estándar',   range: '0 – 19 ventas',   pct: '10%', unlocked: true,  color: 'text-gray-500 dark:text-white/40',  bg: 'bg-gray-100 dark:bg-white/[0.06]' },
            { tier: 'Silver',     range: '20 – 49 ventas',  pct: '15%', unlocked: true,  color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { tier: 'Gold',       range: '50 – 99 ventas',  pct: '18%', unlocked: false, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { tier: 'Platino',    range: '100+ ventas',     pct: '22%', unlocked: false, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
          ].map((tier, i) => (
            <div key={tier.tier} className={`flex items-center gap-3 p-3 rounded-2xl border ${tier.unlocked ? 'border-transparent ' + tier.bg : 'border-gray-100 dark:border-white/[0.05] opacity-50'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tier.bg}`}>
                <span className="text-sm font-bold">{['🥉','🥈','🥇','💎'][i]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${tier.color}`}>{tier.tier}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/25">{tier.range}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className={`text-lg font-bold ${tier.color}`}>{tier.pct}</p>
                {tier.unlocked && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 bg-[#6850E8]/[0.07] rounded-xl px-3 py-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#6850E8] flex-shrink-0" />
            <p className="text-xs text-[#6850E8] dark:text-[#9277F5]">
              Tienes <strong>{stats.totalSales} ventas</strong> · te faltan <strong>{50 - stats.totalSales} más</strong> para alcanzar el nivel Gold
            </p>
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#6850E8]" />
            <p className="text-sm font-bold text-gray-800 dark:text-white/80">Logros</p>
          </div>
          <span className="text-[11px] font-semibold text-[#6850E8] dark:text-[#9277F5] bg-[#6850E8]/10 px-2.5 py-1 rounded-full">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map(a => (
            <motion.div
              key={a.id}
              whileHover={a.unlocked ? { y: -2 } : {}}
              className={`relative flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                a.unlocked
                  ? 'border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.03]'
                  : 'border-dashed border-gray-200 dark:border-white/[0.08] opacity-40 grayscale'
              }`}
            >
              <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0 shadow-sm text-white`}>
                {a.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 dark:text-white/80 leading-tight">{a.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5 leading-tight">{a.description}</p>
              </div>
              {a.unlocked && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Top creator ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-[#6850E8]" />
          <p className="text-sm font-bold text-gray-800 dark:text-white/80">Tu mejor colaboración</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-lg font-bold text-white">{stats.topCreator[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">{stats.topCreator}</p>
            <p className="text-xs text-gray-400 dark:text-white/30">Creadora con más ventas generadas</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-[#6850E8] dark:text-[#9277F5]">31</p>
            <p className="text-[10px] text-gray-400 dark:text-white/25">ventas</p>
          </div>
        </div>
      </div>

    </div>
  );
}
