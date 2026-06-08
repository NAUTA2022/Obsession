import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../constants/routes';

const DISMISS_KEY = 'becomeCreatorBannerDismissed';

/**
 * Aviso para clientes (rol por defecto al crear cuenta) invitándolos a
 * convertirse en creadora. Descartable y persistente vía localStorage.
 */
export default function BecomeCreatorBanner() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  // Solo para clientes que nunca completaron el onboarding de creadora.
  if (user?.role !== 'customer' || user?.creatorOnboarded || dismissed) return null;

  const dismiss = () => {
    if (typeof window !== 'undefined') localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 p-4 dark:border-primary-900/40 dark:from-primary-950/30 dark:to-blue-950/20">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Conviértete en creadora
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Crea productos, contenido y experiencias, y empieza a monetizar tu audiencia.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate(ROUTES['onboarding-creator'])}
        className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Empezar
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/60 hover:text-gray-600 dark:hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
