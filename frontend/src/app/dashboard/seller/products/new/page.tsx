'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { productsApi } from '@/lib/api';
import { Category } from '@/types';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '',
    categoryId: '', sku: '', quantity: '0',
    featured: false, images: [] as string[],
  });
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    productsApi.getCategories().then((data: any) => setCategories(data || []));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const addImage = () => {
    if (newImage.trim() && form.images.length < 8) {
      setForm((f) => ({ ...f, images: [...f.images, newImage.trim()] }));
      setNewImage('');
    }
  };

  const removeImage = (i: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images.length) {
      toast.error('Add at least one product image URL');
      return;
    }
    setLoading(true);
    try {
      await productsApi.create({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        categoryId: form.categoryId,
        sku: form.sku,
        quantity: parseInt(form.quantity, 10),
        featured: form.featured,
        images: form.images,
      });
      toast.success('Product created successfully!');
      router.push('/dashboard/seller');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Information</h2>
          <Input label="Product Name" value={form.name} onChange={set('name')} placeholder="e.g. Samsung Galaxy A35" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe your product in detail (min. 20 characters)"
              rows={5}
              required
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={set('categoryId')}
              required
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-accent-500"
            />
            <span className="text-sm text-gray-700">Mark as featured product</span>
          </label>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Selling Price (USD)" type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} placeholder="0.00" required />
            <Input label="Compare-at Price (optional)" type="number" step="0.01" min="0.01" value={form.comparePrice} onChange={set('comparePrice')} placeholder="0.00" helperText="Show as crossed-out original price" />
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="e.g. TECH-001" required helperText="Unique stock keeping unit" />
            <Input label="Quantity in Stock" type="number" min="0" value={form.quantity} onChange={set('quantity')} required />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Images</h2>
          <p className="text-sm text-gray-500">Add image URLs (up to 8). Use direct image links ending in .jpg, .png, etc.</p>
          <div className="flex gap-2">
            <Input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <Button type="button" variant="outline" onClick={addImage} size="md" className="flex-shrink-0">
              <Plus size={16} />
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full aspect-square object-cover rounded-lg border border-border" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=Error'; }} />
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">Main</span>}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" fullWidth loading={loading}>Publish Product</Button>
        </div>
      </form>
    </div>
  );
}
