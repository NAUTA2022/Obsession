import React, { useState, useRef } from 'react';
import { Gift, X, ImagePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/api/client';

interface LockedContentSenderProps {
  conversationId: string;
  senderId: string;
  onMessageCreated?: () => void;
}

export const LockedContentSender: React.FC<LockedContentSenderProps> = ({
  conversationId,
  senderId,
  onMessageCreated,
}) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleClose = () => {
    setOpen(false);
    setPrice('');
    setFile(null);
    setPreview(null);
  };

  const handleSend = async () => {
    if (!price || !file) {
      toast.error('Selecciona una imagen y define el precio');
      return;
    }

    try {
      setIsSending(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      formData.append('senderId', senderId);
      formData.append('price', price);

      const res = await apiClient.uploadFile('/chat/monetization/upload-locked', formData);

      if (!res.success) throw new Error('Error al enviar');

      toast.success('Gift Card enviada al chat!');
      handleClose();
      onMessageCreated?.();
    } catch {
      toast.error('No se pudo enviar el contenido bloqueado');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        title="Enviar Gift Card / Contenido Bloqueado"
        sx={{ color: '#8b5cf6', '&:hover': { bgcolor: '#f5f3ff' }, transition: 'all 0.2s' }}
      >
        <Gift size={22} />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: '24px', width: '100%', maxWidth: 480, overflow: 'hidden' } }}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2.5">
                <Gift size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Gift Card Exclusiva</h2>
                <p className="text-white/75 text-sm">El blur se genera automáticamente</p>
              </div>
            </div>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
              <X size={20} />
            </IconButton>
          </div>
        </div>

        <DialogContent sx={{ pt: 4, px: 4, pb: 4 }} className="space-y-4">
          {/* File picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-200 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
            ) : (
              <div className="py-6 flex flex-col items-center gap-2 text-purple-400">
                <ImagePlus size={32} />
                <p className="text-sm font-medium">Toca para seleccionar imagen</p>
                <p className="text-xs text-gray-400">JPG, PNG o WebP — máx. 20 MB</p>
              </div>
            )}
          </div>

          <TextField
            fullWidth
            label="Precio de desbloqueo"
            type="number"
            placeholder="15.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          />

          <Button
            fullWidth
            variant="contained"
            disabled={isSending || !price || !file}
            onClick={handleSend}
            className="!bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-2xl !py-3 !text-white !font-bold !shadow-lg hover:!shadow-pink-500/40"
            sx={{ textTransform: 'none' }}
          >
            {isSending ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Enviar Gift Card al chat'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
