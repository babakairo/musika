import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: "Musika — Zimbabwe's Online Marketplace",
    template: '%s | Musika',
  },
  description:
    'Shop from thousands of products. Verified Zimbabwean sellers. Delivered to your door or picked up at your nearest agent. Pay with EcoCash.',
  keywords: ['Zimbabwe', 'online shopping', 'marketplace', 'EcoCash', 'ecommerce'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '10px',
                background: '#1f2937',
                color: '#fff',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
