import type { PricingPlan } from '../../types/pricing';

const TIER_LABELS: Record<PricingPlan['tier'], string> = {
  basic: 'Básico',
  mid: 'Medio',
  premium: 'Premium',
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="7" fill="#21BB90" fillOpacity="0.15" />
      <path d="M4 7L6 9L10 5" stroke="#21BB90" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface AdminActions {
  onEdit: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
}

interface PricingCardProps {
  plan: Partial<PricingPlan> & { name: string; price: number | string; tier: PricingPlan['tier'] };
  mode: 'admin' | 'customer';
  actions?: AdminActions;
}

export function PricingCard({ plan, mode, actions }: PricingCardProps) {
  const isDraft = plan.status === 'draft' || !plan.status;
  const isFeatured = plan.isFeatured ?? false;
  const features = plan.features ?? [];
  const tierLabel = TIER_LABELS[plan.tier] ?? plan.tier;

  const cardBorder = isFeatured
    ? 'border-2 border-[#6F5AF6]'
    : isDraft
    ? 'border border-dashed border-gray-300'
    : 'border border-gray-200';

  const cardOpacity = isDraft && mode === 'admin' ? 'opacity-75' : '';

  return (
    <div className={`bg-white rounded-xl overflow-hidden flex flex-col ${cardBorder} ${cardOpacity}`}>
      {isFeatured && mode === 'customer' ? (
        <div className="bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF] px-4 py-1.5 text-center">
          <span className="text-white text-xs font-bold tracking-wide">MÁS POPULAR</span>
        </div>
      ) : (
        <div className={`h-1 ${isDraft && mode === 'admin' ? 'bg-gray-200' : 'bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF]'}`} />
      )}

      <div className={`p-4 flex flex-col flex-1 ${mode === 'customer' ? 'text-center' : ''}`}>
        {/* Tier + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div>
            {isFeatured && mode === 'admin' && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-[#6F5AF6] tracking-widest uppercase">{tierLabel}</span>
                <span className="bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">MÁS POPULAR</span>
              </div>
            )}
            {(!isFeatured || mode === 'customer') && (
              <span className={`text-[10px] font-bold tracking-widest uppercase ${isDraft && mode === 'admin' ? 'text-gray-400' : 'text-[#6F5AF6]'}`}>
                {tierLabel}
              </span>
            )}
          </div>
          {mode === 'admin' && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isDraft
                ? 'bg-gray-100 text-gray-400'
                : 'bg-green-50 text-green-600'
            }`}>
              {isDraft ? '○ Borrador' : '● Activo'}
            </span>
          )}
        </div>

        {/* Price */}
        <div className={mode === 'customer' ? 'mb-4' : 'mb-3'}>
          <div className={`font-extrabold text-gray-900 ${mode === 'customer' ? 'text-4xl mb-1' : 'text-2xl'}`}>
            ${typeof plan.price === 'number' ? plan.price : plan.price}
            {mode === 'admin' && (
              <span className="text-sm font-normal text-gray-400">/mes</span>
            )}
          </div>
          {plan.originalPrice && (
            <div className="text-xs text-gray-400 line-through">
              Antes ${plan.originalPrice}/mes
            </div>
          )}
          {mode === 'customer' && (
            <div className="text-xs text-gray-400">por mes</div>
          )}
        </div>

        {/* Description */}
        {plan.description && mode === 'admin' && (
          <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className={`border-t border-gray-100 pt-3 mb-3 flex-1 ${mode === 'customer' ? 'text-left' : ''}`}>
            <ul className="space-y-1.5">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckIcon />
                  <span className={`text-xs text-gray-700 leading-tight`}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admin actions */}
        {mode === 'admin' && actions && (
          <div className="flex gap-1.5 mt-auto pt-3 border-t border-gray-50">
            <button
              onClick={actions.onEdit}
              className="flex-1 border border-gray-200 bg-white text-gray-600 text-xs py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              Editar
            </button>
            {isDraft ? (
              <>
                {actions.onActivate && (
                  <button
                    onClick={actions.onActivate}
                    className="flex-1 bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF] text-white text-xs py-1.5 rounded-md hover:opacity-90 transition-opacity"
                  >
                    Activar
                  </button>
                )}
                {actions.onDelete && (
                  <button
                    onClick={actions.onDelete}
                    className="flex-1 border border-red-100 bg-white text-red-400 text-xs py-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </>
            ) : (
              actions.onDeactivate && (
                <button
                  onClick={actions.onDeactivate}
                  className="flex-1 border border-red-100 bg-white text-red-500 text-xs py-1.5 rounded-md hover:bg-red-50 transition-colors"
                >
                  Desactivar
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
