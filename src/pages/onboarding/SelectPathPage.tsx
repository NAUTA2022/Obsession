import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, Store } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

type Path = 'customer' | 'creator' | 'seller';

const OPTIONS: { id: Path; label: string; description: string; icon: typeof ShoppingBag }[] = [
  { id: 'customer', label: 'Comprar contenido', description: 'Explora creadoras, compra y reserva llamadas.', icon: ShoppingBag },
  { id: 'creator', label: 'Monetizar como creadora', description: 'Crea productos, contenido y experiencias.', icon: Sparkles },
  { id: 'seller', label: 'Vender y ganar comisiones', description: 'Distribuye y convierte leads de creadoras.', icon: Store },
];

/**
 * Pantalla "¿Qué quieres hacer?" del onboarding global (PDF: SELECT PATH).
 * Enruta a los wizards existentes según la elección.
 */
export default function SelectPathPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Path | null>(null);

  const handleContinue = () => {
    if (selected === 'creator') navigate(ROUTES['onboarding-creator']);
    else if (selected === 'seller') navigate(ROUTES['onboarding-seller']);
    else navigate(ROUTES['customer-creators']);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4">
      <h1 className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
        ¿Qué quieres hacer?
      </h1>

      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                active
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/30'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium text-gray-900 dark:text-gray-100">{opt.label}</span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={handleContinue}
        className="mt-8 w-full rounded-xl bg-primary-600 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}
