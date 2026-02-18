'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Truck, Shield, RefreshCw, MapPin, Plus, Minus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { useCartStore } from '@/store/cart.store';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.getBySlug(slug) as any;
        setProduct(data);
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = (product.inventory?.quantityAvailable ?? 0) > 0;
  const maxQty = product.inventory?.quantityAvailable ?? 99;
  const images = product.images?.length ? product.images : ['https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image'];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x "${product.name}" added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-border mb-3">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${selectedImage === i ? 'border-accent-500' : 'border-border hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <p className="text-sm text-gray-400 mb-1">{product.category.name}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={4.2} />
            <span className="text-sm text-gray-400">4.2 (42 reviews)</span>
            {product.seller && (
              <span className="text-sm text-gray-400">
                by <span className="font-medium text-gray-700">{product.seller.storeName}</span>
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-black text-gray-900">{formatCurrency(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                <Badge variant="accent">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-5">
            {inStock ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm text-green-700 font-medium">
                  In Stock ({product.inventory?.quantityAvailable} available)
                </span>
              </div>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-surface transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-surface transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button size="lg" fullWidth onClick={handleAddToCart} disabled={!inStock}>
              <ShoppingCart size={18} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <button className="px-4 py-2.5 border border-border rounded-lg text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Delivery info */}
          <div className="bg-surface rounded-xl p-4 space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Truck size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Home Delivery</p>
                <p className="text-xs text-gray-500">$5 flat fee · 2-5 business days across Zimbabwe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Agent Pickup</p>
                <p className="text-xs text-gray-500">Free · Collect from 6+ locations nationwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Buyer Protection</p>
                <p className="text-xs text-gray-500">Full refund if item not received or not as described</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">7-Day Returns</p>
                <p className="text-xs text-gray-500">Easy returns for items in original condition</p>
              </div>
            </div>
          </div>

          {/* SKU & Inventory */}
          {product.inventory?.sku && (
            <p className="text-xs text-gray-400">SKU: {product.inventory.sku}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
        <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
      </div>

      {/* Seller Info */}
      {product.seller && (
        <div className="mt-10 p-6 bg-surface border border-border rounded-xl max-w-2xl">
          <h3 className="font-semibold text-gray-900 mb-1">Sold by {product.seller.storeName}</h3>
          {product.seller.description && (
            <p className="text-sm text-gray-500">{product.seller.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
