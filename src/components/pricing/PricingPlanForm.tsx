import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PricingPlan, CreatePricingPlanDto, PricingPlanTier } from '../../types/pricing';
import { pricingPlansService } from '../../services/api/pricing-plans.service';
import { PricingCard } from './PricingCard';

interface FormState {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  tier: PricingPlanTier;
  features: string[];
  isFeatured: boolean;
  displayOrder: string;
}

function featureId(index: number) {
  return `feature-${index}`;
}

interface SortableFeatureProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

function SortableFeature({ id, value, onChange, onRemove }: SortableFeatureProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1.5">
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
        {...attributes}
        {...listeners}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="19" r="1" fill="currentColor" />
          <circle cx="15" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
        </svg>
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Característica..."
        className="flex-1 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 flex-shrink-0 p-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

const TIER_OPTIONS: { value: PricingPlanTier; label: string }[] = [
  { value: 'basic', label: 'Básico' },
  { value: 'mid', label: 'Medio' },
  { value: 'premium', label: 'Premium' },
];

interface PricingPlanFormProps {
  plan?: PricingPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PricingPlanForm({ plan, onSuccess, onCancel }: PricingPlanFormProps) {
  const [form, setForm] = useState<FormState>({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    price: plan?.price != null ? String(plan.price) : '',
    originalPrice: plan?.originalPrice != null ? String(plan.originalPrice) : '',
    tier: plan?.tier ?? 'basic',
    features: plan?.features && plan.features.length > 0 ? [...plan.features] : [''],
    isFeatured: plan?.isFeatured ?? false,
    displayOrder: plan?.displayOrder != null ? String(plan.displayOrder) : '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureIds = form.features.map((_, i) => featureId(i));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFeatureChange = (index: number, value: string) => {
    const next = [...form.features];
    next[index] = value;
    set('features', next);
  };

  const handleFeatureRemove = (index: number) => {
    set('features', form.features.filter((_, i) => i !== index));
  };

  const handleFeatureAdd = () => {
    set('features', [...form.features, '']);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featureIds.indexOf(active.id as string);
    const newIndex = featureIds.indexOf(over.id as string);
    set('features', arrayMove(form.features, oldIndex, newIndex));
  };

  const buildDto = (): CreatePricingPlanDto => ({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    price: parseFloat(form.price) || 0,
    originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
    tier: form.tier,
    features: form.features.filter((f) => f.trim()),
    isFeatured: form.isFeatured,
  });

  const isValid = form.name.trim() && form.price && parseFloat(form.price) >= 0;

  const handleSaveDraft = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const dto = buildDto();
      if (plan) {
        await pricingPlansService.update(plan.id, dto);
      } else {
        await pricingPlansService.create(dto);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const dto = buildDto();
      let savedId = plan?.id;
      if (plan) {
        await pricingPlansService.update(plan.id, dto);
      } else {
        const res = await pricingPlansService.create(dto);
        savedId = res.data.id;
      }
      if (savedId) {
        await pricingPlansService.activate(savedId);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar');
    } finally {
      setIsLoading(false);
    }
  };

  const previewPlan: Partial<PricingPlan> & { name: string; price: number; tier: PricingPlanTier } = {
    name: form.name || 'Nombre del plan',
    description: form.description || null,
    price: parseFloat(form.price) || 0,
    originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
    tier: form.tier,
    features: form.features.filter((f) => f.trim()),
    isFeatured: form.isFeatured,
    status: 'active',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">{plan ? 'Editar paquete' : 'Crear paquete'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Completa los campos y previsualiza en tiempo real</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body: 2 columns */}
      <div className="grid grid-cols-2 gap-0 flex-1 border border-gray-200 rounded-xl overflow-hidden min-h-0">
        {/* Left: Form */}
        <div className="p-5 overflow-y-auto border-r border-gray-200 bg-white">
          {/* Nombre */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre del plan</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Plan Pro"
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
            />
          </div>

          {/* Precio + Precio original */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Precio</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Precio original <span className="font-normal text-[10px]">(opcional)</span>
              </label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
                placeholder="Ej: 99"
                min={0}
                className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
              />
            </div>
          </div>

          {/* Tier */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tier</label>
            <select
              value={form.tier}
              onChange={(e) => set('tier', e.target.value as PricingPlanTier)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6] bg-white"
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción corta</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Ej: Ideal para comenzar"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
            />
          </div>

          {/* Características */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Características</label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={featureIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1.5 mb-2">
                  {form.features.map((feature, i) => (
                    <SortableFeature
                      key={featureIds[i]}
                      id={featureIds[i]}
                      value={feature}
                      onChange={(val) => handleFeatureChange(i, val)}
                      onRemove={() => handleFeatureRemove(i)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button
              type="button"
              onClick={handleFeatureAdd}
              className="w-full flex items-center justify-center gap-1.5 border border-dashed border-[#6F5AF6] bg-[#faf8ff] text-[#6F5AF6] text-xs font-medium py-1.5 rounded-md hover:bg-[#f3eeff] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar característica
            </button>
          </div>

          {/* Destacado toggle */}
          <div className="mb-4 bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F5AF6" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Marcar como destacado</div>
                  <div className="text-[10px] text-gray-400">Muestra el badge "Más popular"</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => set('isFeatured', !form.isFeatured)}
                className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none ${
                  form.isFeatured ? 'bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                    form.isFeatured ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Orden */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Orden de visualización</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => set('displayOrder', e.target.value)}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6F5AF6] focus:border-[#6F5AF6]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Número más bajo aparece primero. Ej: 0 = primera posición.</p>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="p-5 bg-gray-50 flex flex-col">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vista previa</div>
          <div className="flex-1 flex items-start justify-center">
            <div className="w-full max-w-xs">
              <PricingCard plan={previewPlan} mode="customer" />
            </div>
          </div>
          <div className={`mt-4 rounded-lg px-3 py-2 text-xs font-medium text-center ${
            isValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isValid ? 'Listo para guardar' : 'Completa los campos requeridos (nombre y precio)'}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Footer buttons */}
      <div className="flex gap-2.5 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border border-gray-200 bg-white text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={!isValid || isLoading}
          className="flex-1 border border-gray-300 bg-white text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          {isLoading ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button
          type="button"
          onClick={handleActivate}
          disabled={!isValid || isLoading}
          className="flex-1 bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF] text-white text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isLoading ? 'Guardando...' : plan?.status === 'active' ? 'Guardar cambios' : 'Activar paquete'}
        </button>
      </div>
    </div>
  );
}
