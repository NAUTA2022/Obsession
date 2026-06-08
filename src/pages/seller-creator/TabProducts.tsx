import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, Banknote, ExternalLink,
  X, Tag, ChevronDown, Check,
} from 'lucide-react';
import CardProducts from '../../components/ui/cards/CardProducts';
import { workTeamsService } from '../../services/api/work-teams.service';
import type { TouchAppCreatorProduct } from '../../services/api/work-teams.service';
import { MOCK_PRODUCTS, type MockProduct } from './mockData';
import toast from 'react-hot-toast';

interface Props {
  username: string;
  commission: number;
}

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

type CardType = 'Membresía' | 'Común' | 'Servicio' | 'Producto' | 'Paquete';
function mapType(raw: string): CardType {
  const map: Record<string, CardType> = {
    service: 'Servicio', package: 'Paquete', single: 'Producto',
    subscription: 'Membresía', membership: 'Membresía',
    Servicio: 'Servicio', Paquete: 'Paquete', Producto: 'Producto',
    Membresía: 'Membresía', Común: 'Común',
  };
  return map[raw] ?? 'Común';
}

type AnyProduct = MockProduct | TouchAppCreatorProduct;

function getTitle(p: AnyProduct)   { return (p as MockProduct).title ?? (p as TouchAppCreatorProduct).title ?? ''; }
function getDesc(p: AnyProduct)    { return (p as MockProduct).description ?? (p as TouchAppCreatorProduct).description ?? ''; }
function getThumb(p: AnyProduct)   { return (p as MockProduct).thumbnail ?? (p as TouchAppCreatorProduct).thumbnailUrl ?? null; }
function getPType(p: AnyProduct)   { return (p as MockProduct).type ?? (p as TouchAppCreatorProduct).type ?? 'Común'; }
function getPhotoCount(p: AnyProduct) { return (p as MockProduct).photoCount; }
function getVideoCount(p: AnyProduct) { return (p as MockProduct).videoCount; }

function getBaseLink(username: string, p: AnyProduct) {
  return (p as TouchAppCreatorProduct).productLink ?? `https://touch.vip/${username}/product/${p.id}`;
}

function getGiftLink(username: string, p: AnyProduct, sellerRef: string, discountPct: number) {
  const base = getBaseLink(username, p);
  return `${base}?ref=${sellerRef}&gift=true&discount=${discountPct}&price=${p.price ?? 0}&product=${encodeURIComponent(getTitle(p))}`;
}

// ── Send-to-contact modal ─────────────────────────────────────────────────────

function SendModal({ productTitle, onClose }: { productTitle: string; onClose: () => void }) {
  const contacts = ['Mariana García', 'Valentina Ríos', 'Andrea Morales', 'Camila Soto', 'Lucia Fernández'];
  const [sel, setSel] = useState<string | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
          <p className="text-sm font-bold text-gray-900 dark:text-white/90">Enviar a contacto</p>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5 truncate">{productTitle}</p>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.04] max-h-56 overflow-y-auto">
          {contacts.map(name => (
            <li key={name}>
              <button
                onClick={() => setSel(name)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left ${
                  sel === name ? 'bg-[#6850E8]/10 text-[#6850E8]' : 'text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{name[0]}</span>
                </div>
                <span className="flex-1">{name}</span>
                {sel === name && <Check className="w-3.5 h-3.5 text-[#6850E8]" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
            Cancelar
          </button>
          <button
            disabled={!sel}
            onClick={() => { toast.success(`Enviado a ${sel}`); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enviar link
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Discount picker ───────────────────────────────────────────────────────────

function DiscountPicker({
  price,
  productTitle,
  giftLink,
  onClose,
}: {
  price: number;
  productTitle: string;
  giftLink: (pct: number) => string;
  onClose: () => void;
}) {
  const [pct, setPct] = useState(10);
  const finalPrice = Math.round(price * (1 - pct / 100));
  const link = giftLink(pct);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Enviar con descuento</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5 truncate max-w-[220px]">{productTitle}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-5">
          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">Descuento</label>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-[#6850E8] dark:text-[#9277F5]">{pct}%</span>
                <span className="text-[10px] text-gray-400 dark:text-white/25">máx 20%</span>
              </div>
            </div>
            <input
              type="range" min={5} max={20} step={5} value={pct}
              onChange={e => setPct(Number(e.target.value))}
              className="w-full accent-[#6850E8]"
            />
            <div className="flex justify-between text-[10px] text-gray-300 dark:text-white/20 mt-1">
              <span>5%</span><span>10%</span><span>15%</span><span>20%</span>
            </div>
          </div>

          {/* Price preview */}
          <div className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-white/30">Precio original</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-white/40 line-through">{COP(price)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/[0.08]" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-white/30">Precio con descuento</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{COP(finalPrice)}</p>
            </div>
          </div>

          {/* Gift card link */}
          <div>
            <p className="text-[11px] text-gray-400 dark:text-white/30 mb-2">Link de regalo (abre pasarela de pago):</p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2">
              <p className="flex-1 text-[10px] font-mono text-[#6850E8] dark:text-[#9277F5] truncate">{link}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(link); toast.success('Link copiado'); }}
                className="text-[10px] font-semibold text-white bg-[#6850E8] px-2 py-1 rounded-lg hover:bg-[#5a44d4] transition-colors flex-shrink-0"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Open gift card */}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[#6850E8] to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir gift card con pasarela de pago
          </a>

          <p className="text-[10px] text-center text-gray-300 dark:text-white/20">
            El cliente verá el contenido protegido · Pago con tarjeta o cripto
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TabProducts({ username, commission }: Props) {
  const [products, setProducts] = useState<AnyProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [useMock,  setUseMock]  = useState(false);
  const [sendTarget,    setSendTarget]    = useState<string | null>(null);
  const [discountTarget, setDiscountTarget] = useState<AnyProduct | null>(null);

  useEffect(() => {
    workTeamsService.getCreatorProductsByName(username)
      .then(d => { if (d.length > 0) setProducts(d); else { setProducts(MOCK_PRODUCTS); setUseMock(true); } })
      .catch(() => { setProducts(MOCK_PRODUCTS); setUseMock(true); })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#6850E8]/40" />
        <span className="text-sm text-gray-400 dark:text-white/30">Cargando productos...</span>
      </div>
    );
  }

  const totalRevenue = products.reduce((s, p) => s + (p.price ?? 0), 0);
  const avgPrice = products.length ? Math.round(totalRevenue / products.length) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Demo banner */}
      {useMock && (
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-400/[0.08] border border-amber-200/60 dark:border-amber-400/20 rounded-xl px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400/90">
              Catálogo de ejemplo — aquí verás los productos reales de la creadora
            </p>
          </div>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 shrink-0 max-w-sm">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl p-2.5 text-center">
          <p className="text-base font-bold text-gray-900 dark:text-white/90">{products.length}</p>
          <p className="text-[9px] text-gray-400 dark:text-white/30">Productos</p>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl p-2.5 text-center">
          <p className="text-xs font-bold text-gray-900 dark:text-white/90 leading-tight">{COP(avgPrice)}</p>
          <p className="text-[9px] text-gray-400 dark:text-white/30">Precio prom.</p>
        </div>
        <div className="bg-[#6850E8]/[0.08] border border-[#6850E8]/20 rounded-xl p-2.5 text-center">
          <p className="text-base font-bold text-[#6850E8] dark:text-[#9277F5]">{commission}%</p>
          <p className="text-[9px] text-[#6850E8]/60 dark:text-[#9277F5]/50">Comisión</p>
        </div>
      </div>

      {/* Product grid — same CardProducts used by creator */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(p => {
            const earning  = Math.round((p.price ?? 0) * commission / 100);
            const title    = getTitle(p);
            const giftLink = (pct: number) => getGiftLink(username, p, 'seller', pct);

            return (
              <div key={p.id} className="flex flex-col gap-1.5">
                {/* Card — same as creator page, grows to fill row height */}
                <CardProducts
                  productImage={getThumb(p)}
                  title={title}
                  description={getDesc(p)}
                  price={p.price ?? 0}
                  type={mapType(getPType(p))}
                  photoCount={getPhotoCount(p)}
                  videoCount={getVideoCount(p)}
                  onCopyLink={() => { navigator.clipboard.writeText(getBaseLink(username, p)); toast.success('Link copiado'); }}
                  badge={`+${COP(earning)}`}
                  className="flex-1"
                />

                {/* Action bar */}
                <div className="flex items-center gap-1.5 px-0.5">
                  {/* Commission */}
                  <div className="flex items-center gap-1 bg-emerald-500/10 rounded-lg px-2 py-1 min-w-0">
                    <Banknote className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      {COP(earning)}
                    </span>
                  </div>
                  <div className="flex-1" />
                  {/* Send to contact */}
                  <button
                    onClick={() => setSendTarget(title)}
                    title="Enviar a contacto"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors flex-shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    Enviar
                  </button>
                  {/* Discount */}
                  <button
                    onClick={() => setDiscountTarget(p)}
                    title="Enviar con descuento"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors flex-shrink-0"
                  >
                    <Tag className="w-3 h-3" />
                    Descuento
                  </button>
                  {/* Gift card external */}
                  <a
                    href={giftLink(0)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir gift card"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send-to-contact modal */}
      <AnimatePresence>
        {sendTarget && <SendModal productTitle={sendTarget} onClose={() => setSendTarget(null)} />}
      </AnimatePresence>

      {/* Discount modal */}
      <AnimatePresence>
        {discountTarget && (
          <DiscountPicker
            price={discountTarget.price ?? 0}
            productTitle={getTitle(discountTarget)}
            giftLink={pct => getGiftLink(username, discountTarget, 'seller', pct)}
            onClose={() => setDiscountTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
