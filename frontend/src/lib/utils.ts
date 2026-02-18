import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

export function getOrderStatusConfig(status: string) {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    PAID: { label: 'Paid', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    PACKED: { label: 'Packed', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    SHIPPED: { label: 'Shipped', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    DELIVERED: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  };
  return configs[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
}

export function getStockStatus(quantity: number): { label: string; color: string } {
  if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600' };
  if (quantity <= 5) return { label: `Only ${quantity} left`, color: 'text-amber-600' };
  return { label: 'In Stock', color: 'text-green-600' };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
