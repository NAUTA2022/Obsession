import React, { useState, useEffect } from 'react';
import { Gift, X, Package, ShoppingBag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { chatService } from '../../services/api/chat.service';
import { productsService, type Product, ProductStatus } from '../../services/api/products.service';
import { workTeamsService, type TouchAppCreatorProduct } from '../../services/api/work-teams.service';

interface ProductGiftSenderProps {
  conversationId: string;
  senderId: string;
  onMessageCreated?: () => void;
  delegatedCreatorId?: number;
  delegatedCreatorName?: string;
  delegatedCollaborationId?: number;
}

type AnyProduct = Product | TouchAppCreatorProduct;

export const ProductGiftSender: React.FC<ProductGiftSenderProps> = ({
  conversationId,
  senderId,
  onMessageCreated,
  delegatedCreatorId,
  delegatedCreatorName,
  delegatedCollaborationId,
}) => {
  const [open, setOpen]           = useState(false);
  const [products, setProducts]   = useState<AnyProduct[]>([]);
  const [loading, setLoading]     = useState(false);
  const [sending, setSending]     = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    if (delegatedCreatorId) {
      workTeamsService
        .getCreatorProducts(delegatedCreatorId)
        .then(setProducts)
        .catch(() => toast.error('No se pudieron cargar los productos de la creadora'))
        .finally(() => setLoading(false));
    } else if (delegatedCreatorName) {
      workTeamsService
        .getCreatorProductsByName(delegatedCreatorName)
        .then(setProducts)
        .catch(() => toast.error('No se pudieron cargar los productos de la creadora'))
        .finally(() => setLoading(false));
    } else {
      productsService
        .getMyProducts()
        .then((res) => {
          const active = (res.data ?? []).filter((p) => (p as Product).status === ProductStatus.ACTIVE);
          setProducts(active);
        })
        .catch(() => toast.error('No se pudieron cargar los productos'))
        .finally(() => setLoading(false));
    }
  }, [open, delegatedCreatorId, delegatedCreatorName]);

  const handleSend = async (product: AnyProduct) => {
    setSending(product.id);
    try {
      if ('source' in product && product.source === 'touchapp') {
        const tp = product as TouchAppCreatorProduct;
        console.log('[ProductGiftSender] sending:', { numericId: tp.numericId, uuid: tp.id, delegatedCollaborationId, delegatedCreatorName });
        let paymentUrl = '';
        if (tp.numericId) {
          try {
            let vndCode = '';
            if (delegatedCollaborationId) {
              vndCode = await workTeamsService.resolveVendorLink(delegatedCollaborationId, tp.numericId);
            } else if (delegatedCreatorName) {
              vndCode = await workTeamsService.resolveVendorLinkByName(delegatedCreatorName, tp.numericId);
            }
            if (vndCode) {
              paymentUrl = `https://paymments.touchup.space/?uuid=${tp.id}&ref=${vndCode}`;
            }
          } catch (err) {
            console.error('Failed to resolve vendor link:', err);
          }
        }
        await chatService.sendExternalProductAsGift(
          conversationId,
          senderId,
          tp.title,
          tp.price,
          tp.thumbnailUrl || '',
          tp.blurredThumbnailUrl || tp.thumbnailUrl || '',
          paymentUrl,
        );
      } else {
        await chatService.sendProductAsGift(product.id, conversationId, senderId);
      }
      toast.success(`"${product.title}" enviado al chat`);
      setOpen(false);
      onMessageCreated?.();
    } catch {
      toast.error('No se pudo enviar el producto');
    } finally {
      setSending(null);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        title="Enviar producto al chat"
        sx={{ color: '#8b5cf6', '&:hover': { bgcolor: '#f5f3ff' }, transition: 'all 0.2s' }}
      >
        <Gift size={22} />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: '24px', width: '100%', maxWidth: 520, overflow: 'hidden' },
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2.5">
                <ShoppingBag size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Enviar producto</h2>
                <p className="text-white/75 text-xs">El cliente verá el precio para desbloquearlo</p>
              </div>
            </div>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <X size={20} />
            </IconButton>
          </div>
        </div>

        <DialogContent sx={{ p: 3 }}>
          {loading ? (
            <div className="flex justify-center py-10">
              <CircularProgress size={32} sx={{ color: '#8b5cf6' }} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <Package size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No tienes productos activos</p>
              <p className="text-gray-400 text-xs mt-1">Crea un producto en la sección Productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSend(product)}
                  disabled={!!sending}
                  className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-60"
                >
                  {/* Thumbnail */}
                  <div className="relative h-32 bg-gray-100 overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-gray-300" />
                      </div>
                    )}
                    {/* Precio badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ${Number(product.price).toFixed(2)}
                    </div>
                    {/* Sending overlay */}
                    {sending === product.id && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <CircularProgress size={24} sx={{ color: '#8b5cf6' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">{product.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {product.description || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors pointer-events-none rounded-2xl" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
