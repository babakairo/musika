import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  cols?: 2 | 3 | 4 | 5;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

const colClass = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
};

export function ProductGrid({ products, loading, cols = 4 }: ProductGridProps) {
  if (loading) {
    return (
      <div className={`grid ${colClass[cols]} gap-4`}>
        {Array.from({ length: cols * 2 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
        <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass[cols]} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
