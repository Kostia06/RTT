import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Respect the Technique - Authentic Hakata Ramen',
  description: 'Discover authentic Hakata-style ramen, handcrafted with 18 hours of patience. Shop ramen kits, take classes, and master the technique.',
  keywords: ['ramen', 'hakata', 'tonkotsu', 'calgary', 'japanese food', 'ramen classes'],
  openGraph: {
    title: 'Respect the Technique - Authentic Hakata Ramen',
    description: 'Discover authentic Hakata-style ramen, handcrafted with 18 hours of patience.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <SessionProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
