'use client';
import { useState } from 'react';
import { Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paymentsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

type Stage = 'form' | 'pending' | 'success' | 'failed';

interface EcoCashPaymentProps {
  orderId: string;
  amount: number;
  onSuccess: (orderId: string) => void;
}

export function EcoCashPayment({ orderId, amount, onSuccess }: EcoCashPaymentProps) {
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [paymentId, setPaymentId] = useState<string>('');
  const [reference, setReference] = useState('');

  const handleInitiate = async () => {
    if (!phone.match(/^07[0-9]{8}$/)) {
      toast.error('Enter a valid Zimbabwean mobile number (07xxxxxxxx)');
      return;
    }
    try {
      setStage('pending');
      const res = await paymentsApi.initiateEcoCash({ orderId, method: 'ECOCASH', phoneNumber: phone }) as any;
      setPaymentId(res.paymentId);
      setReference(res.reference);

      // In production: poll /payments/:id/status — for demo, auto-simulate after 3s
      setTimeout(async () => {
        try {
          await paymentsApi.simulate(res.paymentId);
          setStage('success');
          onSuccess(orderId);
        } catch {
          setStage('failed');
        }
      }, 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment');
      setStage('form');
    }
  };

  if (stage === 'form') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">EcoCash Payment</p>
            <p className="text-xs text-gray-500">You will receive a USSD prompt on your phone</p>
          </div>
        </div>

        <Input
          label="EcoCash Mobile Number"
          placeholder="0771234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          leftIcon={<Smartphone size={16} />}
        />

        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="font-medium text-gray-700">Total to pay</span>
          <span className="text-lg font-bold text-accent-600">{formatCurrency(amount)}</span>
        </div>

        <Button fullWidth size="lg" onClick={handleInitiate}>
          Pay {formatCurrency(amount)} via EcoCash
        </Button>
      </div>
    );
  }

  if (stage === 'pending') {
    return (
      <div className="flex flex-col items-center py-8 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
        <div>
          <p className="font-semibold text-gray-900">Waiting for payment approval...</p>
          <p className="text-sm text-gray-500 mt-1">Check your phone for the EcoCash prompt</p>
          {reference && <p className="text-xs text-gray-400 mt-2">Ref: {reference}</p>}
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="flex flex-col items-center py-8 text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <div>
          <p className="text-xl font-bold text-gray-900">Payment Successful!</p>
          <p className="text-sm text-gray-500 mt-1">Your order is confirmed and being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 text-center space-y-4">
      <XCircle className="w-16 h-16 text-red-500" />
      <div>
        <p className="text-xl font-bold text-gray-900">Payment Failed</p>
        <p className="text-sm text-gray-500 mt-1">Please try again or use a different method.</p>
      </div>
      <Button variant="outline" onClick={() => setStage('form')}>Try Again</Button>
    </div>
  );
}
