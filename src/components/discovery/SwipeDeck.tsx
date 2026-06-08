import { useRef, useState } from 'react';
import { Heart, X, MessageCircle, Sparkles, RotateCcw, User } from 'lucide-react';
import type { DiscoveryProfile } from '../../types/discovery';
import DiscoveryProfileCard from './DiscoveryProfileCard';

interface Props {
  profiles: DiscoveryProfile[];
  onLike: (profile: DiscoveryProfile) => void;
  onPass: (profile: DiscoveryProfile) => void;
  onMessage: (profile: DiscoveryProfile) => void;
  emptyLabel?: string;
  /** Mobile: fills parent container, overlays action buttons and top nav */
  fullscreen?: boolean;
  onClose?: () => void;
  onSecondChance?: () => void;
  onViewLiked?: () => void;
  onViewProfile?: (id: string) => void;
}

const SWIPE_THRESHOLD = 110;

export default function SwipeDeck({
  profiles,
  onLike,
  onPass,
  onMessage,
  emptyLabel = 'No hay más perfiles por ahora',
  fullscreen = false,
  onClose,
  onSecondChance,
  onViewLiked,
  onViewProfile,
}: Props) {
  const [index, setIndex] = useState(0);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<null | 'left' | 'right'>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const current = profiles[index];

  const commit = (dir: 'left' | 'right') => {
    if (!current || exiting) return;
    setExiting(dir);
    setDelta({ x: dir === 'right' ? window.innerWidth : -window.innerWidth, y: 0 });
    const profile = current;
    setTimeout(() => {
      if (dir === 'right') onLike(profile);
      else onPass(profile);
      setIndex((i) => i + 1);
      setDelta({ x: 0, y: 0 });
      setExiting(null);
    }, 280);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (exiting) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !start.current) return;
    setDelta({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    start.current = null;
    if (delta.x > SWIPE_THRESHOLD) commit('right');
    else if (delta.x < -SWIPE_THRESHOLD) commit('left');
    else setDelta({ x: 0, y: 0 });
  };

  const rotation = delta.x / 18;
  const likeOpacity = Math.max(0, Math.min(1, delta.x / SWIPE_THRESHOLD));
  const passOpacity = Math.max(0, Math.min(1, -delta.x / SWIPE_THRESHOLD));
  const next = profiles[index + 1];

  /* ── Empty state ── */
  if (!current) {
    return (
      <div className={`flex flex-col items-center justify-center gap-5 px-6 text-center ${fullscreen ? 'h-full bg-[#0D0D14]' : 'min-h-[300px]'}`}>
        <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#6850E8]/15 text-[#6850E8]">
          <Sparkles className="h-9 w-9" />
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#6850E8] text-white shadow-sm">
            <Heart className="h-3 w-3" />
          </span>
        </span>
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{emptyLabel}</p>
          <p className="mx-auto max-w-[16rem] text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Has revisado todos los perfiles disponibles. Vuelve más tarde para descubrir nuevos.
          </p>
        </div>
        {fullscreen && onClose && (
          <button onClick={onClose} className="mt-2 rounded-xl border border-white/10 px-5 py-2 text-sm text-white/60 hover:bg-white/[0.06]">
            Cerrar
          </button>
        )}
      </div>
    );
  }

  /* ── FULLSCREEN mobile layout ── */
  if (fullscreen) {
    const ACTION_HEIGHT = 140; // px space reserved for action buttons + bottom nav

    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* Background card (next) */}
        {next && (
          <div className="absolute inset-0 scale-[0.97] opacity-70 pointer-events-none">
            <DiscoveryProfileCard profile={next} interactive={false} />
          </div>
        )}

        {/* Current card — draggable */}
        <div
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translate(${delta.x}px, ${delta.y}px) rotate(${rotation}deg)`,
            transition: dragging ? 'none' : 'transform 0.28s ease-out',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <DiscoveryProfileCard profile={current} bottomOffset={ACTION_HEIGHT} />

          {/* LIKE / NOPE stamps */}
          <div
            className="pointer-events-none absolute left-5 top-16 rotate-[-18deg] rounded-lg border-4 border-green-400 px-3 py-1 text-2xl font-extrabold text-green-400"
            style={{ opacity: likeOpacity }}
          >
            ME INTERESA
          </div>
          <div
            className="pointer-events-none absolute right-5 top-16 rotate-[18deg] rounded-lg border-4 border-red-400 px-3 py-1 text-2xl font-extrabold text-red-400"
            style={{ opacity: passOpacity }}
          >
            PASO
          </div>
        </div>

        {/* ── Top overlay ── */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-28 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4 pb-2">
          {/* Left: segunda oportunidad + mis me gusta */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onSecondChance}
              title="Segunda oportunidad"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white/85 hover:bg-black/55 hover:scale-105 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onViewLiked}
              title="Mis me gusta"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-rose-400 hover:bg-black/55 hover:scale-105 transition-all"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
          {/* Right: ver perfil + close */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onViewProfile?.(current.id)}
              title="Ver perfil"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white/85 hover:bg-black/55 hover:scale-105 transition-all"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Cerrar"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white/85 hover:bg-black/55 hover:scale-105 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Bottom action buttons — overlaid on card ── */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-40 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-6 pb-20 pt-2">
          <button
            onClick={() => commit('left')}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-red-400 shadow-lg transition hover:scale-105 hover:bg-red-500/20"
            aria-label="Pasar"
          >
            <X className="h-7 w-7" />
          </button>
          <button
            onClick={() => onMessage(current)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-300 shadow-lg transition hover:scale-105 hover:bg-blue-500/20"
            aria-label="Mensaje"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button
            onClick={() => commit('right')}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6850E8]/80 backdrop-blur-sm border border-[#6850E8] text-white shadow-lg transition hover:scale-105 hover:bg-[#6850E8]"
            aria-label="Me interesa"
          >
            <Heart className="h-7 w-7" />
          </button>
        </div>
      </div>
    );
  }

  /* ── Regular (desktop sidebar) layout ── */
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative mx-auto h-[min(68vh,480px)] w-full max-w-[400px]">
        {next && (
          <div className="absolute inset-0 scale-[0.96] opacity-80">
            <DiscoveryProfileCard profile={next} interactive={false} />
          </div>
        )}
        <div
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translate(${delta.x}px, ${delta.y}px) rotate(${rotation}deg)`,
            transition: dragging ? 'none' : 'transform 0.28s ease-out',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <DiscoveryProfileCard profile={current} />
          <div
            className="pointer-events-none absolute left-5 top-6 rotate-[-18deg] rounded-lg border-4 border-green-400 px-3 py-1 text-2xl font-extrabold text-green-400"
            style={{ opacity: likeOpacity }}
          >
            ME INTERESA
          </div>
          <div
            className="pointer-events-none absolute right-5 top-6 rotate-[18deg] rounded-lg border-4 border-red-400 px-3 py-1 text-2xl font-extrabold text-red-400"
            style={{ opacity: passOpacity }}
          >
            PASO
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => commit('left')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-red-500 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 transition hover:scale-105 hover:bg-red-50 dark:hover:bg-red-900"
          aria-label="Pasar"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => onMessage(current)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-blue-500 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 transition hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900"
          aria-label="Mensaje"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        <button
          onClick={() => commit('right')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-green-500 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 transition hover:scale-105 hover:bg-green-50 dark:hover:bg-green-900"
          aria-label="Me interesa"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
