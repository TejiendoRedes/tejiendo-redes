import { Fira_Sans } from 'next/font/google';

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-fira-sans',
});

export default function PrototipoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${firaSans.variable} font-sans bg-slate-50 min-h-screen`} style={{ fontFamily: 'var(--font-fira-sans), sans-serif' }}>
      {children}
    </div>
  );
}
