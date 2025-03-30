'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import NavbarProfile from '@/components/NavbarProfile';

interface ProfileLayoutProps {
  children: ReactNode;
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

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen"
    >
      <NavbarProfile />
      {children}
    </motion.div>
  );
} 