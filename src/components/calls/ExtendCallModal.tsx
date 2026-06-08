import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, Button } from '@mui/material';
import toast from 'react-hot-toast';
import { bookingsService, type ExtendMinutes } from '../../services/api/bookings.service';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_aBcdEfGhIjkLmnOpQrS',
);

interface ExtendCallModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}

const PRESETS: ExtendMinutes[] = [5, 10, 15];

function formatPrice(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function PaymentStep({
  clientSecret,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message || 'No se pudo procesar el pago');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  // clientSecret se pasa vía Elements options en el padre; aquí solo lo usamos como key.
  void clientSecret;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <PaymentElement />
      <div className="flex justify-end gap-3 mt-4">
        <Button
          onClick={onCancel}
          disabled={isProcessing}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || isProcessing}
          className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-bold !rounded-xl !px-6"
          sx={{ textTransform: 'none' }}
        >
          {isProcessing ? 'Procesando…' : 'Pagar y extender'}
        </Button>
      </div>
    </form>
  );
}

export function ExtendCallModal({ open, onClose, bookingId }: ExtendCallModalProps) {
  const [selected, setSelected] = useState<ExtendMinutes | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('usd');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setSelected(null);
    setClientSecret(null);
    setPriceCents(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePick = async (minutes: ExtendMinutes) => {
    setSelected(minutes);
    setLoading(true);
    try {
      const res = await bookingsService.extend(bookingId, minutes);
      setClientSecret(res.clientSecret);
      setPriceCents(res.extension.priceCents);
      // currency no llega siempre en la extensión; asumimos USD por defecto.
      // TODO(backend): incluir `currency` en la respuesta de extend para mostrarlo aquí.
      setCurrency('usd');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo crear la extensión');
      reset();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Tiempo añadido');
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
    >
      <DialogContent>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            Extender llamada
          </h2>
        </div>

        {!clientSecret && (
          <>
            <p className="text-gray-600 text-sm mb-4">
              Elige cuántos minutos quieres añadir a tu llamada en curso.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map((m) => {
                const isSel = selected === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={loading}
                    onClick={() => handlePick(m)}
                    className={[
                      'rounded-2xl border-2 px-4 py-5 flex flex-col items-center justify-center transition',
                      isSel
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40',
                      loading ? 'opacity-60 cursor-wait' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="text-2xl font-bold text-gray-900">+{m}</div>
                    <div className="text-xs text-gray-500 mt-0.5">minutos</div>
                  </button>
                );
              })}
            </div>
            {loading && (
              <div className="text-center text-sm text-gray-500 mt-4 animate-pulse">
                Calculando precio…
              </div>
            )}
          </>
        )}

        {clientSecret && (
          <>
            <div className="mb-3 rounded-xl bg-purple-50 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Extensión de <strong>{selected} min</strong>
              </div>
              {priceCents != null && (
                <div className="text-lg font-bold text-purple-700">
                  {formatPrice(priceCents, currency)}
                </div>
              )}
            </div>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'stripe' } }}
            >
              <PaymentStep
                clientSecret={clientSecret}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </Elements>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ExtendCallModal;
