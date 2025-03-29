import './globals.css';
import type { Metadata } from 'next';
import { Inter, Pacifico } from 'next/font/google';
import Navbar from '../components/Navbar'; // ייבוא ה-Navbar
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});
const pacifico = Pacifico({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});

export const metadata: Metadata = {
  title: 'Wedding Planner',
  description: 'תכנון החתונה המושלמת',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} ${pacifico.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
