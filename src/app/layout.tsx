import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/index.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sistema de Abordajes',
  description: 'Gestión de salud comunitaria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
