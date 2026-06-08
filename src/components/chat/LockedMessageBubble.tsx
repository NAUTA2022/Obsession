import React, { useState } from 'react';
import { Lock, Unlock, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@mui/material';
import toast from 'react-hot-toast';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { useAuthStore } from '../../store/auth';

interface LockedMessageProps {
  messageId: string;
  price: number;
  blurredUrl: string;
  mediaUrl?: string;
  isUnlockedInitially?: boolean;
  onUnlockSubmit: (messageId: string, transactionId: string) => Promise<string>;
  paymentUrl?: string;
}

const PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+PC9zdmc+';

export const LockedMessageBubble: React.FC<LockedMessageProps> = ({
  messageId,
  price,
  blurredUrl,
  mediaUrl,
  isUnlockedInitially = false,
  onUnlockSubmit,
  paymentUrl,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitially);
  const [actualMediaUrl, setActualMediaUrl] = useState<string | undefined>(mediaUrl);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);

  const handleUnlock = () => {
    if (paymentUrl) {
      const link = document.createElement('a');
      link.href = paymentUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    handleOpenStripe();
  };

  const handleOpenStripe = async () => {
    try {
      setIsUnlocking(true);
      if (!user?.id) throw new Error('Usuario no autenticado');

      const res = await fetch(`http://localhost:3000/api/v1/chat/monetization/stripe-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken ?? ''}`,
        },
        body: JSON.stringify({ messageId, userId: user.id, price: Number(price) }),
      });

      if (!res.ok) throw new Error('No se pudo inicializar la pasarela');
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setShowStripeModal(true);
    } catch {
      toast.error('Error al abrir la pasarela segura');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setShowStripeModal(false);
      setIsUnlocking(true);
      const url = await onUnlockSubmit(messageId, transactionId);
      setActualMediaUrl(url);
      setIsUnlocked(true);
      toast.success('Contenido desbloqueado con éxito ✨', { icon: '🔓' });
    } catch {
      toast.error('Error al registrar el desbloqueo');
    } finally {
      setIsUnlocking(false);
    }
  };

  // ── Estado DESBLOQUEADO ─────────────────────────────────────────────────────
  if (isUnlocked && actualMediaUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden w-72 shadow-xl border border-white/10 group">
        <img
          src={actualMediaUrl}
          alt="Contenido desbloqueado"
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-white text-xs font-semibold shadow-lg">
          <Unlock size={12} />
          Desbloqueado
        </div>
      </div>
    );
  }

  // ── Detectar si la URL del blur es válida o se usa el gradiente puro ───────
  const useFallbackGradient =
    imgFailed ||
    !blurredUrl ||
    blurredUrl.includes('placeholder.com') ||
    blurredUrl.startsWith('data:');

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden w-72 shadow-2xl border border-white/10 group cursor-pointer"
        onClick={!isUnlocking ? handleUnlock : undefined}
      >
        {/* Fondo: imagen difuminada o gradiente premium */}
        {useFallbackGradient ? (
          <div className="w-full h-52 bg-gradient-to-br from-[#1a0533] via-[#2d0a4e] to-[#0d1b4b]" />
        ) : (
          <img
            src={blurredUrl}
            alt="Vista previa bloqueada"
            onError={() => setImgFailed(true)}
            className="w-full h-52 object-cover filter blur-lg brightness-50 scale-110 transition-all duration-500 group-hover:blur-xl"
          />
        )}

        {/* Overlay con contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5">
          {/* Ícono animado */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/25 rounded-full p-4 shadow-2xl">
              <Lock className="text-white" size={26} strokeWidth={2.5} />
            </div>
          </div>

          {/* Texto */}
          <div className="text-center">
            <p className="text-white font-bold text-base drop-shadow-lg tracking-wide">
              Contenido Exclusivo
            </p>
            <p className="text-white/65 text-xs mt-0.5">
              Solo para ti · Contenido privado
            </p>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
            <Sparkles size={13} className="text-pink-300" />
            <span className="text-white font-bold text-sm">
              {Number(price) > 0 ? `$${Number(price).toFixed(2)}` : 'Gratis'}
            </span>
          </div>
        </div>

        {/* Botón de desbloqueo en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleUnlock(); }}
            disabled={isUnlocking}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white
              bg-gradient-to-r from-pink-500 to-purple-600
              hover:from-pink-400 hover:to-purple-500
              active:scale-95 transition-all duration-200
              shadow-lg shadow-pink-500/30
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CreditCard size={16} />
            {isUnlocking
              ? 'Abriendo pasarela...'
              : Number(price) > 0
              ? `Desbloquear por $${Number(price).toFixed(2)}`
              : 'Ver contenido'}
          </button>
        </div>
      </div>

      <StripeCheckoutModal
        open={showStripeModal}
        clientSecret={clientSecret}
        onClose={() => setShowStripeModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};
