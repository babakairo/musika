'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart.store';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const inStock = (product.inventory?.quantityAvailable ?? 0) > 0;
  const discount = product.comparePrice ? calculateDiscount(product.comparePrice, product.price) : 0;
  const image = product.images?.[0] || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    setAdding(true);
    addItem(product);
    toast.success('Added to cart');
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          >
            <Heart size={14} className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.category && (
            <p className="text-xs text-gray-400 mb-1 truncate">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 leading-snug">{product.name}</h3>

          <div className="flex items-center gap-1 mb-2">
            <StarRating rating={4.2} size={12} />
            <span className="text-xs text-gray-400">(42)</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</span>
              {product.comparePrice && (
                <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.comparePrice)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart size={13} />
              {adding ? 'Added' : 'Add'}
            </button>
          </div>

          {product.seller && (
            <p className="text-xs text-gray-400 mt-1.5 truncate">by {product.seller.storeName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
