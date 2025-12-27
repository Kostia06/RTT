import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/providers/CartProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Respect the Technique',
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
    <head>
        <link rel="icon" href="/favicon/icon.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-icon.png" sizes="180x180" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

