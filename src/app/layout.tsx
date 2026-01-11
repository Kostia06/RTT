import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/providers/CartProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Respect the Technique',
  description: 'Discover authentic Hakata-style ramen, handcrafted with 18 hours of patience. Shop ramen kits, take classes, and master the technique.',
  keywords: ['ramen', 'hakata', 'tonkotsu', 'calgary', 'japanese food', 'ramen classes'],
  icons: {
    icon: '/favicon/icon.png',
    apple: '/favicon/apple-icon.png',
  },
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
    <html lang="en" className={rubik.variable}>
      <body className={`${rubik.className} antialiased flex flex-col min-h-screen`}>
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

