'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import NavbarProfile from '@/components/NavbarProfile';
import { SyncProvider } from '@/contexts/SyncContext';
import { SyncIndicator } from '@/components/SyncIndicator';

interface ProfileLayoutProps {
  children: ReactNode;
  params: { id: string };
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

export default function ProfileLayout({ children, params }: ProfileLayoutProps) {
  return (
    <SyncProvider userId={params.id}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen"
      >
        <NavbarProfile />
        {children}
        <SyncIndicator />
      </motion.div>
    </SyncProvider>
  );
} 