import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Electronics', href: '/products?category=electronics' },
    { label: 'Fashion', href: '/products?category=fashion' },
    { label: 'Home & Kitchen', href: '/products?category=home-kitchen' },
    { label: 'Sports', href: '/products?category=sports' },
    { label: 'Featured Deals', href: '/products?featured=true' },
  ],
  Sell: [
    { label: 'Start Selling', href: '/sell' },
    { label: 'Seller Dashboard', href: '/dashboard/seller' },
    { label: 'Seller Guidelines', href: '/sell#guidelines' },
    { label: 'Pricing & Fees', href: '/sell#fees' },
  ],
  Help: [
    { label: 'Track Your Order', href: '/dashboard/orders' },
    { label: 'Returns Policy', href: '/returns' },
    { label: 'EcoCash Payments', href: '/payments' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="text-white font-bold text-xl">Musika</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Zimbabwe&apos;s premier online marketplace. Shop smart, sell easy, pay with EcoCash.
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} /> <span>Harare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={14} /> <span>+263 77 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} /> <span>hello@musika.co.zw</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-3 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Musika Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Payments secured by</span>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">EcoCash</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={16} /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
