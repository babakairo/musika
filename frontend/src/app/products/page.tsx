import { Suspense } from 'react';
import ProductsContent from './_content';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
