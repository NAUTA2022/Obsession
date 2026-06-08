import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/ui/Modal';
import { PricingCard } from '../components/pricing/PricingCard';
import { PricingPlanForm } from '../components/pricing/PricingPlanForm';
import { pricingPlansService } from '../services/api/pricing-plans.service';
import type { PricingPlan } from '../types/pricing';

const MAX_ACTIVE = 3;

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await pricingPlansService.getAll();
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los paquetes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const activeCount = plans.filter((p) => p.status === 'active').length;

  const handleCreate = () => {
    setSelectedPlan(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleActivate = async (plan: PricingPlan) => {
    setActionError(null);
    try {
      await pricingPlansService.activate(plan.id);
      await fetchPlans();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al activar el paquete');
    }
  };

  const handleDeactivate = async (plan: PricingPlan) => {
    setActionError(null);
    try {
      await pricingPlansService.deactivate(plan.id);
      await fetchPlans();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al desactivar el paquete');
    }
  };

  const handleDelete = (plan: PricingPlan) => {
    setActionError(null);
    setPlanToDelete(plan);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await pricingPlansService.remove(planToDelete.id);
      setPlanToDelete(null);
      await fetchPlans();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al eliminar el paquete');
      setPlanToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    fetchPlans();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Paquetes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crea y administra los planes visibles para los usuarios</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#6F5AF6] to-[#3CA1FF] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear paquete
        </button>
      </div>

      {/* Active indicator */}
      {!isLoading && !error && (
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCount >= MAX_ACTIVE ? 'bg-[#21BB90]' : 'bg-amber-400'}`} />
          <span className="text-sm text-gray-700 font-medium">{activeCount} de {MAX_ACTIVE} paquetes activos</span>
          {activeCount < MAX_ACTIVE && (
            <span className="text-xs text-gray-400">
              — Activa {MAX_ACTIVE - activeCount} más para completar tu página de planes
            </span>
          )}
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#6F5AF6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-gray-500 text-sm">{error}</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-3">No hay paquetes creados aún</p>
          <button
            onClick={handleCreate}
            className="text-[#6F5AF6] text-sm font-medium hover:underline"
          >
            Crear el primer paquete
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              mode="admin"
              actions={{
                onEdit: () => handleEdit(plan),
                onActivate: plan.status === 'draft' ? () => handleActivate(plan) : undefined,
                onDeactivate: plan.status === 'active' ? () => handleDeactivate(plan) : undefined,
                onDelete: plan.status === 'draft' ? () => handleDelete(plan) : undefined,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal editar/crear */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} maxWidth="2xl">
        <PricingPlanForm
          plan={selectedPlan ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Modal confirmación eliminar */}
      <Modal isOpen={!!planToDelete} onClose={() => setPlanToDelete(null)} maxWidth="sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">¿Eliminar paquete?</h3>
            <p className="text-sm text-gray-500">
              Estás a punto de eliminar{' '}
              <span className="font-medium text-gray-700">"{planToDelete?.name}"</span>.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={() => setPlanToDelete(null)}
              disabled={isDeleting}
              className="flex-1 border border-gray-200 bg-white text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-500 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
