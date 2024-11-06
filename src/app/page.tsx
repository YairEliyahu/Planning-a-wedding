// import Image from 'next/image';
// import Navbar from '../src/components/Navbar';
'use client';
import './globals.css';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
    {/* <div>
      <Navbar />
      /* <h1>Welcome to Our Website</h1>
      <Link href="/login">
        <button>Login</button>
      </Link>
      <Link href="/register">
        <button>Register</button>
      </Link>
    </div> */}
      <Navbar /> 
      <div className="background">
        <div className="overlay">
          <div className="content"></div>
        </div>
      </div>
    </>
  );
}
