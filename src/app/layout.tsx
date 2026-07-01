import type { Metadata } from 'next';
import { Fira_Sans } from 'next/font/google';
import '@/app/globals.css';
import { Providers } from './providers';

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-fira-sans',
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
    <html lang="es" className={firaSans.variable}>
      <body className={`${firaSans.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
