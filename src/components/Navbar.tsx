'use client';

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <Link href="/" style={styles.link}>
        Home
      </Link>
      <Link href="/login" style={styles.link}>
        Login
      </Link>
      <Link href="/register" style={styles.link}>
        Register
      </Link>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
  },
};

export default Navbar;
