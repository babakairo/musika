'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EcoCashPayment } from '@/components/checkout/EcoCashPayment';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

type DeliveryType = 'HOME_DELIVERY' | 'AGENT_PICKUP';
type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<CheckoutStep>('delivery');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('HOME_DELIVERY');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Harare');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const subtotal = totalPrice();
  const deliveryFee = subtotal > 100 ? 0 : 5.99;
  const total = subtotal + deliveryFee;

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-primary-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to checkout</h1>
        <p className="text-gray-500 mb-6">You need an account to complete your purchase.</p>
        <Link href="/login?redirect=/checkout">
          <Button size="lg" fullWidth>Sign In to Continue</Button>
        </Link>
        <p className="text-sm text-gray-500 mt-3">
          New?{' '}
          <Link href="/register" className="text-accent-600 font-medium hover:underline">Create account</Link>
        </p>
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <Link href="/products" className="text-accent-600 font-medium hover:underline">Continue shopping</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (deliveryType === 'HOME_DELIVERY' && !address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    setPlacing(true);
    try {
      const order = await ordersApi.create({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'HOME_DELIVERY' ? `${address}, ${city}, Zimbabwe` : undefined,
        agentLocationId: deliveryType === 'AGENT_PICKUP' ? undefined : undefined,
      }) as any;
      setOrderId(order.id);
      setStep('payment');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setStep('confirmation');
  };

  if (step === 'confirmation') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your order, {user?.firstName}.</p>
        <p className="text-sm text-gray-400 mb-8">
          You&apos;ll receive a confirmation SMS shortly. Track your order in your account.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/orders">
            <Button size="lg">View My Orders</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {['delivery', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className={`h-0.5 w-12 ${step === 'payment' ? 'bg-accent-500' : 'bg-gray-200'}`} />}
            <div className={`flex items-center gap-2 text-sm font-medium ${step === s ? 'text-accent-600' : step === 'payment' && s === 'delivery' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-accent-500 text-white' : step === 'payment' && s === 'delivery' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step === 'payment' && s === 'delivery' ? '✓' : i + 1}
              </div>
              <span className="capitalize hidden sm:block">{s}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {step === 'delivery' && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setDeliveryType('HOME_DELIVERY')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${deliveryType === 'HOME_DELIVERY' ? 'border-accent-500 bg-accent-50' : 'border-border hover:border-gray-300'}`}
                >
                  <Truck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${deliveryType === 'HOME_DELIVERY' ? 'text-accent-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Home Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">2–5 business days</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {subtotal > 100 ? 'FREE delivery' : formatCurrency(5.99)}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryType('AGENT_PICKUP')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${deliveryType === 'AGENT_PICKUP' ? 'border-accent-500 bg-accent-50' : 'border-border hover:border-gray-300'}`}
                >
                  <Package className={`w-5 h-5 mt-0.5 flex-shrink-0 ${deliveryType === 'AGENT_PICKUP' ? 'text-accent-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Agent Pickup</p>
                    <p className="text-xs text-gray-500 mt-0.5">Next business day</p>
                    <p className="text-xs text-green-600 font-medium mt-1">FREE</p>
                  </div>
                </button>
              </div>

              {deliveryType === 'HOME_DELIVERY' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-500" />
                    Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Street Address"
                      placeholder="e.g. 24 Chitepo Avenue"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    <Input
                      label="City"
                      placeholder="e.g. Harare"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {deliveryType === 'AGENT_PICKUP' && (
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select pickup location:</p>
                  <div className="space-y-2">
                    {[
                      'Musika Agent — Harare CBD',
                      'Musika Agent — Avondale',
                      'Musika Agent — Borrowdale',
                      'Musika Agent — Bulawayo CBD',
                    ].map((loc) => (
                      <label key={loc} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                        <input type="radio" name="agent" className="accent-accent-500" defaultChecked={loc.includes('Harare CBD')} />
                        <span className="text-sm text-gray-700">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                loading={placing}
                size="lg"
                fullWidth
                className="mt-6"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 'payment' && orderId && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Payment</h2>
              <EcoCashPayment
                orderId={orderId}
                amount={total}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                    <Image src={product.images[0] || 'https://via.placeholder.com/48'} alt={product.name} fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(Number(product.price) * quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
