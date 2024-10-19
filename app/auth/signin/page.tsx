'use client';
import './signin.css';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // ניהול הרשמה למשתמש חדש
  };

  return (
    <div className="signin-container">
      <h1>Sign in to Your Account</h1>
      <div className="social-signin">
        <button onClick={() => signIn('google')} className="btn google">
          Sign in with Google
        </button>
        <button onClick={() => signIn('facebook')} className="btn facebook">
          Sign in with Facebook
        </button>
      </div>
      <div className="divider">or</div>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}
