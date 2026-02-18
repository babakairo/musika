'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const subtotal = totalPrice();
  const deliveryFee = subtotal > 100 ? 0 : 5.99;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-24 h-24 bg-surface border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add products to your cart to get started.</p>
        <Link href="/products">
          <Button size="lg">
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({totalItems()} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-xl border border-border p-4 flex gap-4">
              <Link href={`/products/${product.slug}`} className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                <Image
                  src={product.images[0] || 'https://via.placeholder.com/100'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-accent-600 transition-colors line-clamp-2 mb-1">
                  {product.name}
                </Link>
                {product.seller && (
                  <p className="text-xs text-gray-500 mb-2">by {product.seller.storeName}</p>
                )}
                {(product.inventory?.quantityAvailable ?? 0) > 0 ? (
                  <p className="text-xs text-green-600 font-medium mb-3">In Stock</p>
                ) : (
                  <p className="text-xs text-red-500 font-medium mb-3">Out of Stock</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= (product.inventory?.quantityAvailable ?? 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-r-lg transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(Number(product.price) * quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalItems()} items)</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg p-2">
                  Add {formatCurrency(100 - subtotal)} more for free delivery!
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button fullWidth size="lg" className="mb-3">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="outline" fullWidth size="md">
                Continue Shopping
              </Button>
            </Link>

            {/* Promo code */}
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-surface">
                  <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                EcoCash
              </div>
              <span className="text-xs text-gray-400">Accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
