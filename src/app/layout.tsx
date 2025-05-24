import './globals.css';
import type { Metadata } from 'next';
import { Inter, Pacifico, Shrikhand, Heebo } from 'next/font/google';
import Navbar from '../components/Navbar'; // ייבוא ה-Navbar
import { AuthProvider } from '@/contexts/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});

const shrikhand = Shrikhand({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-shrikhand',
});

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  display: 'swap',
  preload: true,
  variable: '--font-heebo',
});

export const metadata: Metadata = {
  title: 'Wedding Planner',
  description: 'כלי מקיף לתכנון חתונה מושלמת - נהלו את האורחים, הספקים, והתקציב שלכם בצורה קלה ואינטואיטיבית.',
  icons: {
    icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pinterest.svg',
    shortcut: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pinterest.svg',
    apple: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pinterest.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} ${pacifico.variable} ${shrikhand.variable} ${heebo.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Navbar />
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                fontFamily: 'var(--font-heebo)',
                background: '#fff',
                color: '#333',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '16px',
              },
              success: {
                icon: '✅',
                style: {
                  border: '1px solid #c7f9cc',
                },
              },
              error: {
                icon: '❌',
                style: {
                  border: '1px solid #ffccd5',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
