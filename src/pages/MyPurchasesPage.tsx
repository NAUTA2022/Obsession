import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { ShoppingBag } from 'lucide-react';
import PurchaseGalleryModal from '../components/ui/PurchaseGalleryModal';
import apiClient from '../services/api/client';

interface Purchase {
  id: string;
  productId: string;
  amount: number;
  status: string;
  purchaseDate: string;
  product?: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
  };
  creator?: {
    id: string;
    displayName?: string;
    username?: string;
  };
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    apiClient
      .get<Purchase[]>('/purchases/my-purchases')
      .then((res) => setPurchases(res.data ?? []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleViewContent = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setGalleryImages([]);
    setIsModalOpen(true);
    setLoadingContent(true);

    try {
      const res = await apiClient.get<{ files: { fileUrl: string; fileType: string }[] }>(
        `/purchases/${purchase.id}/content`,
      );
      const images = (res.data?.files ?? [])
        .filter((f) => f.fileType === 'image')
        .map((f) => f.fileUrl);
      setGalleryImages(images);
    } catch {
      setGalleryImages([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
    setGalleryImages([]);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress sx={{ color: '#7B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Mis compras</h1>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-white/30 gap-3">
          <ShoppingBag size={48} strokeWidth={1.2} />
          <p className="text-base">Aún no tienes compras</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] shadow-sm">
              <div className="w-full h-40 bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                {purchase.product?.thumbnailUrl ? (
                  <img
                    src={purchase.product.thumbnailUrl}
                    alt={purchase.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50 dark:bg-[#6850E8]/10">
                    <ShoppingBag size={32} className="text-purple-200 dark:text-[#6850E8]/40" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-white">
                  {purchase.product?.title ?? 'Producto'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-white/40 mb-3 line-clamp-2">
                  {purchase.product?.description ?? ''}
                </p>
                <div className="text-xs text-gray-500 dark:text-white/40 mb-3">
                  Creador/a:{' '}
                  <span className="text-purple-600 dark:text-[#6850E8]">
                    @{purchase.creator?.username ?? purchase.creator?.displayName ?? '—'}
                  </span>
                </div>
                <button
                  onClick={() => handleViewContent(purchase)}
                  className="w-full py-2 px-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors text-xs"
                >
                  Ver contenido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPurchase && (
        <PurchaseGalleryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            loadingContent
              ? 'Cargando...'
              : selectedPurchase.product?.title ?? 'Contenido'
          }
          images={galleryImages}
        />
      )}
    </div>
  );
}
