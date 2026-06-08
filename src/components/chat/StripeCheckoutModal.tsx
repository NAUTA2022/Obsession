import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, Button } from '@mui/material';
import toast from 'react-hot-toast';

// Usar la public key de Stripe desde el enviroment. 
// Dejamos un valor por defecto solo para evitar crasheos si falta el env, pero debe ser pk_test_xxxx real o fallará.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_aBcdEfGhIjkLmnOpQrS');

const CheckoutForm = ({
  clientSecret,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    // Intentamos confirmar el pago sin redirigir fuera de la página
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    });

    if (error) {
      toast.error(error.message || 'Error en el pago con tarjeta');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      <PaymentElement />
      <div className="flex justify-end gap-3 mt-4">
        <Button onClick={onCancel} disabled={isProcessing} color="inherit" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || isProcessing}
          className="!bg-gradient-to-r !from-pink-500 !to-purple-600 !text-white !font-bold !rounded-xl !px-6"
          sx={{ textTransform: 'none' }}
        >
          {isProcessing ? 'Procesando Tarjeta...' : 'Pagar Ahora'}
        </Button>
      </div>
    </form>
  );
};

export const StripeCheckoutModal = ({
  open,
  clientSecret,
  onClose,
  onSuccess,
}: {
  open: boolean;
  clientSecret: string | null;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '20px', p: 1 }
      }}
    >
      <DialogContent>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Pasarela Segura
          </h2>
        </div>
        
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onClose} />
          </Elements>
        ) : (
          <div className="flex justify-center p-8 animate-pulse text-gray-500">
            Conectando con Stripe...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
