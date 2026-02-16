import type { Metadata } from 'next';
import '@/styles/index.css';
import { Providers } from './providers';

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
    <html lang="es">
      <head>
        {/* NX-05: Preconnect + preload Inter font to eliminate FOUT/CLS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
