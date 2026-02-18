'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, ChevronDown, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

const NAV_LINKS = [
  { label: 'Electronics', href: '/products?category=electronics' },
  { label: 'Fashion', href: '/products?category=fashion' },
  { label: 'Home & Kitchen', href: '/products?category=home-kitchen' },
  { label: 'Sports', href: '/products?category=sports' },
  { label: 'Featured', href: '/products?featured=true' },
];

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-900 shadow-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">Musika</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 px-4 py-2 text-sm bg-white rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <button
                type="submit"
                className="px-4 bg-accent-500 hover:bg-accent-600 text-white rounded-r-lg transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 text-white hover:text-accent-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
              >
                <User size={20} />
                <span className="text-sm hidden md:block">{user ? user.firstName : 'Account'}</span>
                <ChevronDown size={14} className="hidden md:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-elevated border border-border overflow-hidden z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-surface border-b border-border">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-surface transition-colors"
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      {user.role === 'SELLER' && (
                        <Link
                          href="/dashboard/seller"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-surface transition-colors"
                        >
                          <LayoutDashboard size={16} /> Seller Dashboard
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/dashboard/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-surface transition-colors"
                        >
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-border"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-surface transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-surface transition-colors border-t border-border"
                      >
                        Create Account
                      </Link>
                      <Link
                        href="/sell"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-accent-600 font-medium hover:bg-accent-50 transition-colors border-t border-border"
                      >
                        Start Selling
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-white hover:text-accent-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Sell CTA */}
            <Link
              href="/sell"
              className="hidden lg:block text-sm font-medium text-accent-300 hover:text-accent-200 transition-colors px-2"
            >
              Sell
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-1"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Category Nav */}
        <nav className="hidden md:flex items-center gap-1 pb-2 -mt-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            All Products
          </Link>
        </nav>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-800 border-t border-white/10 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-gray-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
