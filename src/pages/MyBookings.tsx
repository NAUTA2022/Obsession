import { useEffect, useState } from 'react';
import { Tabs, Tab, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Video, Phone, CalendarX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingsService from '../services/api/bookings.service';
import type { Booking } from '../types/bookings';

type TabValue = 'upcoming' | 'past';

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default function MyBookings() {
  const [tab, setTab] = useState<TabValue>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const load = async (filter: TabValue) => {
    setLoading(true);
    try {
      const data = await bookingsService.listMine({ as: 'client', filter });
      setBookings(data);
    } catch {
      setBookings([]);
      toast.error('No pudimos cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const handleCancel = async () => {
    if (!confirmId) return;
    setCancelling(true);
    try {
      await bookingsService.cancel(confirmId);
      toast.success('Reserva cancelada');
      setConfirmId(null);
      await load(tab);
    } catch {
      toast.error('No se pudo cancelar');
    } finally {
      setCancelling(false);
    }
  };

  const now = Date.now();

  const canCancel = (b: Booking) =>
    tab === 'upcoming' &&
    new Date(b.scheduledStart).getTime() > now + 24 * 60 * 60 * 1000 &&
    b.status !== 'cancelled';

  const canJoin = (b: Booking) => {
    const start = new Date(b.scheduledStart).getTime();
    const end = new Date(b.scheduledEnd).getTime();
    const grace = 5 * 60 * 1000;
    return now >= start - 5 * 60 * 1000 && now <= end + grace;
  };

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Mis reservas</h1>
        <p className="text-sm text-gray-500 mt-1">Tus llamadas agendadas con creadoras</p>
      </div>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
          '& .Mui-selected': { color: '#7B5CF6 !important' },
          '& .MuiTabs-indicator': { backgroundColor: '#7B5CF6' },
        }}
      >
        <Tab value="upcoming" label="Próximas" />
        <Tab value="past" label="Pasadas" />
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <CircularProgress sx={{ color: '#7B5CF6' }} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <CalendarX size={48} strokeWidth={1.2} />
          <p className="text-base">
            {tab === 'upcoming' ? 'No tienes reservas próximas' : 'No tienes reservas pasadas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {b.mode === 'video' ? <Video size={18} /> : <Phone size={18} />}
                  </div>
                  <div>
                    {/* TODO: fetch creator profile to show name/avatar instead of creatorId */}
                    <div className="text-sm font-medium text-gray-900">
                      Creadora: {b.creatorId.slice(0, 8)}…
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {b.mode === 'video' ? 'Videollamada' : 'Llamada de audio'}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                  {b.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-sm text-gray-700 mb-1">
                {formatDateTime(b.scheduledStart)}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Duración: {Math.round(b.durationSeconds / 60)} min · {formatPrice(b.priceCents, b.currency)}
              </div>

              <div className="flex gap-2">
                {canJoin(b) && (
                  <button
                    onClick={() => navigate(`/calls/${b.id}`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                  >
                    Entrar a la llamada
                  </button>
                )}
                {canCancel(b) && (
                  <button
                    onClick={() => setConfirmId(b.id)}
                    className="flex-1 py-2 px-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!confirmId} onClose={() => !cancelling && setConfirmId(null)}>
        <DialogTitle>¿Cancelar reserva?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            Se aplicará la política de reembolso. Esta acción no se puede deshacer.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)} disabled={cancelling}>
            Volver
          </Button>
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            sx={{ color: '#dc2626' }}
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
