import { useState, useEffect, useRef, useContext, createContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  rectSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Pencil, Copy, Check, Link2, X, AlertTriangle, MessageCircle,
  ShoppingBag, Heart, TrendingUp, DollarSign, Star, Package,
  Users, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight,
  MessageSquare, Handshake, Trophy, Sparkles, Activity, GripVertical,
} from "lucide-react";
import { env } from "../config/env";
import { authService, type TouchAppStatus } from "../services/api/auth.service";
import { sellerService, type SellerProfile } from "../services/api/seller.service";
import { Input, Button, ProfileImageUploader, Textarea, Switch } from "../components/ui";
import { useTranslation } from "../hooks/useTranslation";
import { useProfile } from "../hooks/useProfile";
import { useAuthStore } from "../store/auth";
import type { UpdateProfileRequest, PasswordChangeRequest } from "../types/auth";
import { USER_ROLES } from "../types/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

type ModalTab = "perfil" | "password" | "notis";

const ROLE_LABELS: Record<string, string> = {
  creator: "Creadora", customer: "Cliente", admin: "Admin",
  moderator: "Moderador", vendedor: "Vendedor",
};
const ROLE_COLORS: Record<string, string> = {
  creator: "bg-violet-500/15 text-violet-400",
  customer: "bg-blue-500/15 text-blue-400",
  admin: "bg-amber-500/15 text-amber-400",
  moderator: "bg-emerald-500/15 text-emerald-400",
  vendedor: "bg-cyan-500/15 text-cyan-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
function fmtCurrency(n: number) {
  return `$${n.toLocaleString("es", { minimumFractionDigits: 0 })}`;
}

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-pink-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];
function AvatarPlaceholder({ name, idx = 0, size = 36 }: { name: string; idx?: number; size?: number }) {
  const g = GRADIENTS[idx % GRADIENTS.length];
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${g} flex items-center justify-center flex-shrink-0 text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag handle context — avoids prop drilling through widget tree
// ─────────────────────────────────────────────────────────────────────────────

interface DragHandleCtx {
  listeners: React.HTMLAttributes<HTMLElement>;
  attributes: React.HTMLAttributes<HTMLElement>;
}
const DragHandleContext = createContext<DragHandleCtx | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Widget Card shell
// ─────────────────────────────────────────────────────────────────────────────

function WidgetCard({ title, icon, action, actionLabel, children }: {
  title: string;
  icon: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  const drag = useContext(DragHandleContext);

  return (
    <div className="h-full rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...(drag?.listeners ?? {})}
            {...(drag?.attributes ?? {})}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg text-gray-200 dark:text-white/10 hover:text-gray-400 dark:hover:text-white/25 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors touch-none select-none"
            aria-label="Arrastrar widget"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-xl bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8]">
            {icon}
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/80">{title}</h3>
        </div>
        {action && (
          <button
            onClick={action}
            className="flex items-center gap-1 text-xs text-[#6850E8] dark:text-[#9277F5] font-semibold hover:underline"
          >
            {actionLabel ?? "Ver todo"} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable wrapper
// ─────────────────────────────────────────────────────────────────────────────

function SortableWidget({ id, fullWidth, children }: {
  id: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <DragHandleContext.Provider value={{ listeners: listeners as React.HTMLAttributes<HTMLElement>, attributes: attributes as React.HTMLAttributes<HTMLElement> }}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={[
          "transition-all duration-200",
          fullWidth ? "sm:col-span-2" : "col-span-1",
          isDragging ? "opacity-40 scale-[0.97] z-50" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PURCHASES = [
  { id: "1", title: "Pack Exclusivo Premium",  price: 49, status: "Completado", daysAgo: 2,  thumb: `https://picsum.photos/seed/purch1/80/80` },
  { id: "2", title: "Sesión de Chat VIP",       price: 25, status: "Completado", daysAgo: 8,  thumb: `https://picsum.photos/seed/purch2/80/80` },
  { id: "3", title: "Video Personalizado",      price: 80, status: "Completado", daysAgo: 14, thumb: `https://picsum.photos/seed/purch3/80/80` },
  { id: "4", title: "Foto Firmada Digital",     price: 15, status: "Pendiente",  daysAgo: 1,  thumb: `https://picsum.photos/seed/purch4/80/80` },
];

const MOCK_LIKED_CREATORS = [
  { id: "1", name: "Valentina G.", category: "Fitness" },
  { id: "2", name: "Sofía R.",     category: "Arte" },
  { id: "3", name: "Camila L.",    category: "Música" },
  { id: "4", name: "Isabella M.",  category: "Cocina" },
  { id: "5", name: "Lucía H.",     category: "Moda" },
  { id: "6", name: "Daniela T.",   category: "Wellness" },
];

const MOCK_PENDING_CHATS = [
  { id: "1", name: "Valentina G.", preview: "Hola! Ya está listo tu pedido 🎉",       time: "Hace 10 min", unread: 2 },
  { id: "2", name: "Sofía R.",     preview: "¿Cuándo quieres agendar la sesión?",     time: "Hace 1 h",   unread: 1 },
  { id: "3", name: "Camila L.",    preview: "Gracias por tu compra, te mando pronto", time: "Ayer",       unread: 3 },
];

const MOCK_CREATOR_SALES = [
  { id: "1", buyer: "Carlos M.",  product: "Pack Premium",      amount: 49, daysAgo: 0 },
  { id: "2", buyer: "Andrés P.",  product: "Sesión VIP",        amount: 25, daysAgo: 1 },
  { id: "3", buyer: "Luis F.",    product: "Video Personal",    amount: 80, daysAgo: 3 },
  { id: "4", buyer: "Jorge R.",   product: "Foto Exclusiva",    amount: 15, daysAgo: 5 },
  { id: "5", buyer: "Miguel T.",  product: "Pack Premium",      amount: 49, daysAgo: 7 },
];

const MOCK_TOP_BUYERS = [
  { id: "1", name: "Carlos M.",  spent: 218, purchases: 5 },
  { id: "2", name: "Andrés P.",  spent: 175, purchases: 4 },
  { id: "3", name: "Luis F.",    spent: 130, purchases: 3 },
  { id: "4", name: "Jorge R.",   spent: 95,  purchases: 2 },
  { id: "5", name: "Miguel T.",  spent: 64,  purchases: 2 },
];

const MOCK_FANS = [
  { id: "1", name: "Carlos M." }, { id: "2", name: "Andrés P." },
  { id: "3", name: "Luis F." },   { id: "4", name: "Jorge R." },
  { id: "5", name: "Miguel T." }, { id: "6", name: "Pablo S." },
  { id: "7", name: "Diego R." },  { id: "8", name: "Marcos L." },
];

const MOCK_TOP_PRODUCTS = [
  { id: "1", title: "Pack Premium",    sales: 24, revenue: 1176, thumb: `https://picsum.photos/seed/prod1/60/60` },
  { id: "2", title: "Sesión VIP",      sales: 18, revenue: 450,  thumb: `https://picsum.photos/seed/prod2/60/60` },
  { id: "3", title: "Video Personal",  sales: 11, revenue: 880,  thumb: `https://picsum.photos/seed/prod3/60/60` },
  { id: "4", title: "Foto Exclusiva",  sales: 9,  revenue: 135,  thumb: `https://picsum.photos/seed/prod4/60/60` },
];

const MOCK_CREATOR_MOVEMENTS = [
  { id: "1", type: "in",  desc: "Venta · Pack Premium",      amount: 49,   daysAgo: 0 },
  { id: "2", type: "in",  desc: "Venta · Sesión VIP",         amount: 25,   daysAgo: 1 },
  { id: "3", type: "out", desc: "Retiro · Transferencia",    amount: -120, daysAgo: 3 },
  { id: "4", type: "in",  desc: "Venta · Video Personal",    amount: 80,   daysAgo: 4 },
  { id: "5", type: "in",  desc: "Venta · Foto Exclusiva",    amount: 15,   daysAgo: 5 },
  { id: "6", type: "out", desc: "Comisión plataforma 8%",    amount: -17,  daysAgo: 5 },
];

const MOCK_SELLER_SALES = [
  { id: "1", creator: "Valentina G.", product: "Pack Premium",   commission: 7.8, daysAgo: 0 },
  { id: "2", creator: "Sofía R.",     product: "Video Personal", commission: 12,  daysAgo: 1 },
  { id: "3", creator: "Camila L.",    product: "Sesión VIP",     commission: 4.5, daysAgo: 2 },
  { id: "4", creator: "Valentina G.", product: "Foto Exclusiva", commission: 2.4, daysAgo: 5 },
  { id: "5", creator: "Lucía H.",     product: "Pack Premium",   commission: 7.8, daysAgo: 6 },
];

const MOCK_COLLABORATIONS = [
  { id: "1", creator: "Valentina G.", status: "Activa",   since: "Ene 2025", monthlyEarnings: 380 },
  { id: "2", creator: "Sofía R.",     status: "Activa",   since: "Feb 2025", monthlyEarnings: 210 },
  { id: "3", creator: "Camila L.",    status: "Pausada",  since: "Mar 2025", monthlyEarnings: 95  },
  { id: "4", creator: "Lucía H.",     status: "Activa",   since: "Abr 2025", monthlyEarnings: 160 },
];

const MOCK_TOP_CREATORS = [
  { id: "1", name: "Valentina G.", totalSales: 48, myRevenue: 1240 },
  { id: "2", name: "Sofía R.",     totalSales: 34, myRevenue: 870  },
  { id: "3", name: "Camila L.",    totalSales: 21, myRevenue: 540  },
  { id: "4", name: "Lucía H.",     totalSales: 18, myRevenue: 460  },
];

const MOCK_INTERESTED_CREATORS = [
  { id: "1", name: "Isabella M.", specialty: "Fitness",  followers: "12k" },
  { id: "2", name: "Daniela T.",  specialty: "Arte",     followers: "8.5k" },
  { id: "3", name: "Mariana F.",  specialty: "Moda",     followers: "22k" },
];

const MOCK_SELLER_MOVEMENTS = [
  { id: "1", type: "in",  desc: "Comisión · Valentina G. → Pack Premium",    amount: 7.8, daysAgo: 0 },
  { id: "2", type: "in",  desc: "Comisión · Sofía R. → Video Personal",      amount: 12,  daysAgo: 1 },
  { id: "3", type: "in",  desc: "Comisión · Camila L. → Sesión VIP",         amount: 4.5, daysAgo: 2 },
  { id: "4", type: "out", desc: "Retiro · Transferencia bancaria",            amount: -80, daysAgo: 4 },
  { id: "5", type: "in",  desc: "Comisión · Valentina G. → Foto Exclusiva",  amount: 2.4, daysAgo: 5 },
];

const STATUS_COLLAB: Record<string, string> = {
  Activa:   "bg-emerald-500/10 text-emerald-500",
  Pausada:  "bg-amber-400/10 text-amber-500",
  Inactiva: "bg-gray-400/10 text-gray-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual widget content components
// ─────────────────────────────────────────────────────────────────────────────

function PurchasesWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Últimas compras" icon={<ShoppingBag className="w-3.5 h-3.5" />} action={() => navigate("/my-purchases")} actionLabel="Ver todas">
      <div className="flex flex-col gap-3">
        {MOCK_PURCHASES.map(p => (
          <div key={p.id} className="flex items-center gap-3">
            <img src={p.thumb} alt={p.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-white/[0.05]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80 truncate">{p.title}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">{fmtDate(p.daysAgo)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-gray-900 dark:text-white">{fmtCurrency(p.price)}</p>
              <span className={`text-[10px] font-semibold ${p.status === "Completado" ? "text-emerald-500" : "text-amber-500"}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function LikedCreatorsWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Mis me gusta" icon={<Heart className="w-3.5 h-3.5" />} action={() => navigate("/customer/creators")} actionLabel="Explorar">
      <div className="grid grid-cols-3 gap-2">
        {MOCK_LIKED_CREATORS.map((c, i) => (
          <motion.div key={c.id} whileHover={{ y: -2 }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
            <AvatarPlaceholder name={c.name} idx={i} size={44} />
            <p className="text-[10px] font-semibold text-gray-700 dark:text-white/60 text-center leading-tight">{c.name}</p>
            <span className="text-[9px] text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded-full">{c.category}</span>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}

function PendingChatsWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Chats sin contestar" icon={<MessageSquare className="w-3.5 h-3.5" />} action={() => navigate("/messages")} actionLabel="Ir a mensajes">
      <div className="flex flex-col gap-2">
        {MOCK_PENDING_CHATS.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="relative flex-shrink-0">
              <AvatarPlaceholder name={c.name} idx={i} size={40} />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#6850E8] text-white text-[9px] font-bold flex items-center justify-center">{c.unread}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-white/80">{c.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">{c.preview}</p>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-white/25 flex-shrink-0">{c.time}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function CreatorSalesWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Últimas ventas" icon={<TrendingUp className="w-3.5 h-3.5" />} action={() => navigate("/creator/earnings")}>
      <div className="flex flex-col gap-3">
        {MOCK_CREATOR_SALES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <AvatarPlaceholder name={s.buyer} idx={i} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{s.buyer}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">{s.product} · {fmtDate(s.daysAgo)}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm flex-shrink-0">
              <ArrowUpRight className="w-3 h-3" />{fmtCurrency(s.amount)}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function TopBuyersWidget() {
  const maxSpent = MOCK_TOP_BUYERS[0]?.spent ?? 1;
  return (
    <WidgetCard title="Mejores compradores" icon={<Trophy className="w-3.5 h-3.5" />}>
      <div className="flex flex-col gap-3">
        {MOCK_TOP_BUYERS.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3">
            <div className="w-5 text-xs font-black text-gray-300 dark:text-white/20 text-center flex-shrink-0">{i + 1}</div>
            <AvatarPlaceholder name={b.name} idx={i} size={34} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{b.name}</p>
              <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(b.spent / maxSpent) * 100}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="h-full rounded-full bg-[#6850E8]" style={{ opacity: 1 - i * 0.12 }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-gray-900 dark:text-white">{fmtCurrency(b.spent)}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25">{b.purchases} compras</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function FansWidget() {
  return (
    <WidgetCard title="Personas que me dieron me gusta" icon={<Heart className="w-3.5 h-3.5" />}>
      <div className="flex flex-wrap gap-2">
        {MOCK_FANS.map((f, i) => (
          <motion.div key={f.id} whileHover={{ scale: 1.08 }} className="flex flex-col items-center gap-1 cursor-pointer">
            <AvatarPlaceholder name={f.name} idx={i} size={40} />
            <p className="text-[9px] text-gray-400 dark:text-white/30 font-medium">{f.name.split(" ")[0]}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 dark:text-white/25 text-center">+{MOCK_FANS.length} más esta semana</p>
    </WidgetCard>
  );
}

function TopProductsWidget({ navigate }: { navigate: (p: string) => void }) {
  const maxSales = MOCK_TOP_PRODUCTS[0]?.sales ?? 1;
  return (
    <WidgetCard title="Top productos más vendidos" icon={<Package className="w-3.5 h-3.5" />} action={() => navigate("/creator/products")}>
      <div className="flex flex-col gap-3">
        {MOCK_TOP_PRODUCTS.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <img src={p.thumb} alt={p.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-white/[0.05]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-white/80 truncate">{p.title}</p>
                <span className="text-[10px] text-gray-400 dark:text-white/30 flex-shrink-0 ml-2">{p.sales} ventas</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(p.sales / maxSales) * 100}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="h-full rounded-full bg-emerald-500" style={{ opacity: 1 - i * 0.15 }}
                />
              </div>
            </div>
            <p className="text-xs font-black text-gray-900 dark:text-white flex-shrink-0">{fmtCurrency(p.revenue)}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function CreatorMovementsWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Movimientos" icon={<Activity className="w-3.5 h-3.5" />} action={() => navigate("/creator/earnings")}>
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.04]">
        {MOCK_CREATOR_MOVEMENTS.map(m => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.type === "in" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400"}`}>
              {m.type === "in" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/70 truncate">{m.desc}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{fmtDate(m.daysAgo)}</p>
            </div>
            <p className={`text-sm font-black flex-shrink-0 ${m.type === "in" ? "text-emerald-500" : "text-red-400"}`}>
              {m.type === "in" ? "+" : ""}{fmtCurrency(Math.abs(m.amount))}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function SellerSalesWidget() {
  return (
    <WidgetCard title="Últimas ventas" icon={<TrendingUp className="w-3.5 h-3.5" />}>
      <div className="flex flex-col gap-3">
        {MOCK_SELLER_SALES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <AvatarPlaceholder name={s.creator} idx={i} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{s.creator}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">{s.product} · {fmtDate(s.daysAgo)}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm flex-shrink-0">
              <ArrowUpRight className="w-3 h-3" />{fmtCurrency(s.commission)}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function CollaborationsWidget({ navigate }: { navigate: (p: string) => void }) {
  return (
    <WidgetCard title="Mis colaboraciones" icon={<Handshake className="w-3.5 h-3.5" />} action={() => navigate("/seller/creators")}>
      <div className="flex flex-col gap-3">
        {MOCK_COLLABORATIONS.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <AvatarPlaceholder name={c.creator} idx={i} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{c.creator}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">Desde {c.since}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLLAB[c.status]}`}>{c.status}</span>
              <p className="text-xs font-black text-gray-900 dark:text-white">{fmtCurrency(c.monthlyEarnings)}<span className="text-[9px] text-gray-400 dark:text-white/25 font-normal">/mes</span></p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function TopCreatorsWidget() {
  const maxRev = MOCK_TOP_CREATORS[0]?.myRevenue ?? 1;
  return (
    <WidgetCard title="Mis creadoras más exitosas" icon={<Star className="w-3.5 h-3.5" />}>
      <div className="flex flex-col gap-3">
        {MOCK_TOP_CREATORS.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <div className="w-5 text-xs font-black text-gray-300 dark:text-white/20 text-center flex-shrink-0">{i + 1}</div>
            <AvatarPlaceholder name={c.name} idx={i} size={34} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{c.name}</p>
              <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(c.myRevenue / maxRev) * 100}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="h-full rounded-full bg-[#6850E8]" style={{ opacity: 1 - i * 0.12 }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-gray-900 dark:text-white">{fmtCurrency(c.myRevenue)}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25">{c.totalSales} ventas</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function InterestedCreatorsWidget() {
  return (
    <WidgetCard title="Creadoras interesadas en colaborar" icon={<Sparkles className="w-3.5 h-3.5" />}>
      <div className="flex flex-col gap-3">
        {MOCK_INTERESTED_CREATORS.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
            <AvatarPlaceholder name={c.name} idx={i + 3} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-white/80">{c.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">{c.specialty} · {c.followers} seguidores</p>
            </div>
            <button className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-[#6850E8] text-white text-[11px] font-bold hover:bg-[#5940d8] transition-colors">
              Contactar
            </button>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function SellerMovementsWidget() {
  return (
    <WidgetCard title="Movimientos" icon={<Activity className="w-3.5 h-3.5" />}>
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.04]">
        {MOCK_SELLER_MOVEMENTS.map(m => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.type === "in" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400"}`}>
              {m.type === "in" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white/70 truncate">{m.desc}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/25 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{fmtDate(m.daysAgo)}</p>
            </div>
            <p className={`text-sm font-black flex-shrink-0 ${m.type === "in" ? "text-emerald-500" : "text-red-400"}`}>
              {m.type === "in" ? "+" : ""}{fmtCurrency(Math.abs(m.amount))}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget definitions per role
// ─────────────────────────────────────────────────────────────────────────────

type WidgetDef = { id: string; full?: boolean; node: (navigate: (p: string) => void) => React.ReactNode };

const CUSTOMER_WIDGETS: WidgetDef[] = [
  { id: "purchases", node: (nav) => <PurchasesWidget navigate={nav} /> },
  { id: "liked",     node: (nav) => <LikedCreatorsWidget navigate={nav} /> },
  { id: "chats",     full: true, node: (nav) => <PendingChatsWidget navigate={nav} /> },
];

const CREATOR_WIDGETS: WidgetDef[] = [
  { id: "sales",      node: (nav) => <CreatorSalesWidget navigate={nav} /> },
  { id: "buyers",     node: () => <TopBuyersWidget /> },
  { id: "fans",       node: () => <FansWidget /> },
  { id: "products",   node: (nav) => <TopProductsWidget navigate={nav} /> },
  { id: "movements",  full: true, node: (nav) => <CreatorMovementsWidget navigate={nav} /> },
];

const SELLER_WIDGETS: WidgetDef[] = [
  { id: "sales",       node: () => <SellerSalesWidget /> },
  { id: "collabs",     node: (nav) => <CollaborationsWidget navigate={nav} /> },
  { id: "top",         node: () => <TopCreatorsWidget /> },
  { id: "interested",  node: () => <InterestedCreatorsWidget /> },
  { id: "movements",   full: true, node: () => <SellerMovementsWidget /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sortable dashboard grid
// ─────────────────────────────────────────────────────────────────────────────

function SortableDashboard({ defs, navigate, storageKey }: {
  defs: WidgetDef[];
  navigate: (p: string) => void;
  storageKey: string;
}) {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`widget-order-${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        // Validate: all saved IDs exist, add any new ones at end
        const valid = parsed.filter(id => defs.some(d => d.id === id));
        const added = defs.filter(d => !valid.includes(d.id)).map(d => d.id);
        return [...valid, ...added];
      }
    } catch { /* ignore */ }
    return defs.map(d => d.id);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = order.indexOf(String(active.id));
      const newIdx = order.indexOf(String(over.id));
      const next = arrayMove(order, oldIdx, newIdx);
      setOrder(next);
      localStorage.setItem(`widget-order-${storageKey}`, JSON.stringify(next));
    }
  };

  const sorted = order
    .map(id => defs.find(d => d.id === id))
    .filter((d): d is WidgetDef => !!d);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          {sorted.map(w => (
            <SortableWidget key={w.id} id={w.id} fullWidth={w.full}>
              {w.node(navigate)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { t } = useTranslation();
  const { user, tokens } = useAuthStore();
  const { updateProfile, updateProfilePicture, changePassword, isLoading, fetchProfile } = useProfile();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen]         = useState(false);
  const [activeTab, setActiveTab]         = useState<ModalTab>("perfil");
  const [copied, setCopied]               = useState<string | null>(null);

  const [profileData, setProfileData]     = useState<UpdateProfileRequest>({
    username: "", firstName: "", lastName: "", email: "", phoneNumber: "", bio: "",
  });
  const [passwordData, setPasswordData]   = useState<PasswordChangeRequest>({ currentPassword: "", newPassword: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState({
    obsession: true, newConversation: false, successfulSale: true, calendar: false, tasks: true,
  });
  const [touchAppStatus, setTouchAppStatus] = useState<TouchAppStatus | null>(null);
  const [sellerProfile, setSellerProfile]   = useState<SellerProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage]     = useState<string | null>(null);
  const [usernameError, setUsernameError]   = useState<string | null>(null);
  const isLinkingRef = useRef(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "", firstName: user.firstName || "",
        lastName: user.lastName || "", email: user.email || "",
        phoneNumber: user.phoneNumber || "", bio: user.bio || "",
      });
      authService.getTouchAppStatus()
        .then(res => setTouchAppStatus(res.data ?? { linked: false, username: null }))
        .catch(() => setTouchAppStatus({ linked: false, username: null }));
      if (user.role === USER_ROLES.VENDEDOR) {
        sellerService.getMine().then(setSellerProfile).catch(() => setSellerProfile(null));
      }
    } else {
      fetchProfile().catch(console.error);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible" && isLinkingRef.current) {
        isLinkingRef.current = false;
        authService.getTouchAppStatus()
          .then(res => setTouchAppStatus(res.data ?? { linked: false, username: null }))
          .catch(() => setTouchAppStatus({ linked: false, username: null }));
      }
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [modalOpen]);

  const validateUsername = (v: string) => {
    if (v.length < 3) return "Mínimo 3 caracteres";
    if (v.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v)) return "Solo letras, números y guiones bajos.";
    return null;
  };

  const handleProfileChange = (field: keyof UpdateProfileRequest, value: string) => {
    setProfileData(p => ({ ...p, [field]: value }));
    setSuccessMessage(null); setErrorMessage(null);
    if (field === "username") setUsernameError(value ? validateUsername(value) : null);
  };

  const handleProfileSubmit = async () => {
    try {
      setSuccessMessage(null); setErrorMessage(null);
      await updateProfile(profileData);
      setSuccessMessage("Perfil actualizado");
      setTimeout(() => { setModalOpen(false); setSuccessMessage(null); }, 1200);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Error al actualizar perfil");
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setSuccessMessage(null); setErrorMessage(null);
      if (passwordData.newPassword !== confirmPassword) { setErrorMessage("Las contraseñas no coinciden"); return; }
      if (passwordData.newPassword.length < 6) { setErrorMessage("Mínimo 6 caracteres"); return; }
      await changePassword(passwordData);
      setSuccessMessage("Contraseña actualizada");
      setPasswordData({ currentPassword: "", newPassword: "" });
      setConfirmPassword("");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Error al cambiar contraseña");
    }
  };

  const handleLinkTouchApp = () => {
    if (!user) return;
    const data = btoa(JSON.stringify({
      obsession_user_id: user.id, obsession_username: user.username,
      token: tokens?.accessToken || localStorage.getItem("accessToken") || "",
    }));
    isLinkingRef.current = true;
    window.open(`${env.TOUCHAPP_URL}/auth/link-obsession?data=${encodeURIComponent(data)}`, "_blank", "noopener,noreferrer");
  };

  const copyLink = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayName = user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Usuario";

  const INFO_ROWS = [
    { label: "Usuario",  value: user?.username   || "—" },
    { label: "Correo",   value: user?.email       || "—" },
    { label: "Teléfono", value: user?.phoneNumber || "—" },
  ];

  const MODAL_TABS: { key: ModalTab; label: string }[] = [
    { key: "perfil",   label: "Perfil"         },
    { key: "password", label: "Contraseña"     },
    { key: "notis",    label: "Notificaciones" },
  ];

  const widgetsForRole =
    user?.role === USER_ROLES.CUSTOMER ? CUSTOMER_WIDGETS :
    user?.role === USER_ROLES.CREATOR  ? CREATOR_WIDGETS  :
    user?.role === USER_ROLES.VENDEDOR ? SELLER_WIDGETS   :
    null;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 pb-10 items-start">

      {/* ── LEFT: Profile card (sticky on desktop) ── */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-4">
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm">

          {/* Cover */}
          <div className="h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-teal-400" />

          {/* Avatar + name */}
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end justify-between mb-4">
              <div className="ring-4 ring-white dark:ring-[#111118] rounded-full">
                <ProfileImageUploader initialSrc={user?.profilePicture} size={72} hasEditButton={false} />
              </div>
              <button
                onClick={() => { setModalOpen(true); setActiveTab("perfil"); setSuccessMessage(null); setErrorMessage(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6850E8] text-white text-xs font-semibold hover:bg-[#5a42d4] transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Editar perfil
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-bold text-gray-900 dark:text-white/90">{displayName}</h2>
                <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${ROLE_COLORS[user?.role ?? ""] ?? "bg-gray-100 text-gray-500"}`}>
                  {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
                </span>
              </div>
              {user?.bio && <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{user.bio}</p>}
            </div>

            {/* Info rows */}
            <div className="space-y-2 border-t border-gray-100 dark:border-white/[0.06] pt-3 mb-3">
              {INFO_ROWS.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 dark:text-white/35">{label}</span>
                  <span className="text-[11px] font-medium text-gray-700 dark:text-white/70 truncate ml-2 max-w-[150px] text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Share links (creator) */}
            {user?.role === USER_ROLES.CREATOR && (
              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3 mb-3 space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-white/35 uppercase tracking-wide">Links para compartir</p>
                {[
                  { key: "profile", icon: <Link2 className="w-3 h-3 text-[#6850E8]" />,         label: "Perfil",       url: `${window.location.origin}/p/${user.username}` },
                  { key: "chat",    icon: <MessageCircle className="w-3 h-3 text-blue-500" />,   label: "Chat directo", url: `${window.location.origin}/p/${user.username}/chat` },
                ].map(({ key, icon, label, url }) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 bg-gray-50 dark:bg-white/[0.04] rounded-lg px-2.5 py-1.5 min-w-0">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-white/30 leading-none mb-0.5">{label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-white/40 truncate">{url}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyLink(key, url)}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${copied === key ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10"}`}
                    >
                      {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === key ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TouchApp */}
            <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-white/35 uppercase tracking-wide">TouchApp</p>
                {touchAppStatus?.linked && touchAppStatus.valid !== false && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <Check className="w-3 h-3" /> Vinculado
                  </span>
                )}
                {touchAppStatus?.linked && touchAppStatus.valid === false && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded-full px-2 py-0.5">
                    <AlertTriangle className="w-3 h-3" /> Expirado
                  </span>
                )}
              </div>
              {touchAppStatus?.linked && touchAppStatus.username && (
                <p className="text-[11px] text-gray-400 dark:text-white/30 mb-2">@{touchAppStatus.username}</p>
              )}
              <button
                onClick={handleLinkTouchApp}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-semibold border border-gray-200 dark:border-white/[0.07] text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                {touchAppStatus?.linked ? "Re-vincular" : "Vincular Touch"}
              </button>
            </div>

            {/* Seller profile section */}
            {user?.role === USER_ROLES.VENDEDOR && (
              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-white/35 uppercase tracking-wide">Perfil de vendedor</p>
                  <Link to="/become-seller" className="text-[11px] text-[#6850E8] font-semibold hover:underline">Editar</Link>
                </div>
                {sellerProfile ? (
                  <div className="space-y-2">
                    {[
                      { label: "País",     value: sellerProfile.nationality || "—" },
                      { label: "Comisión", value: `${sellerProfile.commissionPercentage}%` },
                      { label: "Espacios", value: String(sellerProfile.collaborationSlots) },
                      { label: "Estado",   value: sellerProfile.isActive ? "Activo" : "Inactivo" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-white/35">{label}</span>
                        <span className="text-[11px] font-medium text-gray-700 dark:text-white/70">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 dark:text-white/35">
                    No configurado. <Link to="/become-seller" className="text-[#6850E8]">Configurar</Link>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hint drag — solo se ve en desktop */}
        {widgetsForRole && (
          <p className="hidden lg:flex items-center gap-1.5 mt-3 ml-1 text-[11px] text-gray-300 dark:text-white/15">
            <GripVertical className="w-3.5 h-3.5" />
            Arrastra los widgets para reorganizarlos
          </p>
        )}
      </div>

      {/* ── RIGHT: Sortable widgets ── */}
      {widgetsForRole && (
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={user?.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SortableDashboard
                defs={widgetsForRole}
                navigate={navigate}
                storageKey={user?.role ?? "default"}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Edit modal (unchanged) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 px-3 sm:px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] flex flex-col max-h-[92dvh]">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white/90">Editar perfil</h3>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
              {MODAL_TABS.map(({ key, label }) => (
                <button key={key}
                  onClick={() => { setActiveTab(key); setSuccessMessage(null); setErrorMessage(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === key ? "bg-[#6850E8]/10 text-[#6850E8] dark:bg-[#6850E8]/20 dark:text-[#9277F5]" : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.05]"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(successMessage || errorMessage) && (
              <div className={`mx-5 mt-4 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 ${successMessage ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                {successMessage || errorMessage}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-0">
              {activeTab === "perfil" && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <ProfileImageUploader initialSrc={user?.profilePicture} size={80}
                      onImageChange={async (f) => {
                        try { await updateProfilePicture(f); setSuccessMessage("Foto actualizada"); }
                        catch (e) { setErrorMessage(e instanceof Error ? e.message : "Error"); }
                      }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Usuario</label>
                      <Input placeholder="usuario" value={profileData.username} onChange={e => handleProfileChange("username", e.target.value)} />
                      {usernameError && <p className="mt-1 text-xs text-red-400">{usernameError}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Nombre</label>
                      <Input placeholder="Nombre" value={profileData.firstName} onChange={e => handleProfileChange("firstName", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Apellido</label>
                      <Input placeholder="Apellido" value={profileData.lastName} onChange={e => handleProfileChange("lastName", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Correo</label>
                      <Input placeholder="correo@email.com" type="email" value={profileData.email} onChange={e => handleProfileChange("email", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Teléfono</label>
                      <Input placeholder="+00 000 000 0000" value={profileData.phoneNumber} onChange={e => handleProfileChange("phoneNumber", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Bio</label>
                      <Textarea placeholder="Cuéntanos sobre ti..." value={profileData.bio} onChange={e => handleProfileChange("bio", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="space-y-3">
                  {[
                    { label: "Contraseña actual", field: "currentPassword" as const, placeholder: "••••••••" },
                    { label: "Nueva contraseña",  field: "newPassword"      as const, placeholder: "Mínimo 6 caracteres" },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">{label}</label>
                      <Input type="password" placeholder={placeholder} value={passwordData[field]} onChange={e => setPasswordData(p => ({ ...p, [field]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Confirmar nueva contraseña</label>
                    <Input type="password" placeholder="Repite la contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
              )}

              {activeTab === "notis" && (
                <div className="space-y-2">
                  {[
                    { key: "obsession"       as const, label: t("profile.obsessionNotifications") },
                    { key: "newConversation" as const, label: t("profile.newConversation")         },
                    { key: "successfulSale"  as const, label: t("profile.successfulSale")          },
                    { key: "calendar"        as const, label: t("profile.calendarStatus")          },
                    { key: "tasks"           as const, label: t("profile.taskStatus")              },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.04]">
                      <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
                      <Switch checked={notifications[key]} onCheckedChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                Cancelar
              </button>
              <button
                onClick={activeTab === "perfil" ? handleProfileSubmit : activeTab === "password" ? handlePasswordSubmit : () => { setSuccessMessage("Preferencias guardadas"); setTimeout(() => setSuccessMessage(null), 2000); }}
                disabled={isLoading || (activeTab === "perfil" && !!usernameError)}
                className="flex-1 py-2.5 rounded-xl bg-[#6850E8] text-white text-sm font-semibold hover:bg-[#5a42d4] disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
