"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Dashboard.module.css';

export default function AccountPanel() {
  const { user, loading, authEnabled, login, signup, logout, error: sessionError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await (isSignUp ? signup : login)(email, password);
      setEmail('');
    } catch (failure) {
      const code = failure.code || failure.message;
      setError(code.includes('email-already-in-use') ? 'Email is already registered.' :
        code.includes('weak-password') ? 'Use a password with at least six characters.' :
        code.includes('invalid-credential') ? 'Invalid email or password.' : 'Unable to sign in. Please try again.');
    } finally { setPassword(''); setPending(false); }
  }

  if (!authEnabled) return <p role="status">Accounts are currently unavailable. You can still explore rivers and conditions.</p>;
  if (loading) return <p role="status">Checking your account…</p>;
  return <div className={styles.authContainer}>
    {user ? <div className={styles.userInfo}>
      <span className={styles.userEmail}>{user.email}</span>
      {user.isAdmin && <Link href="/admin/kanban">Admin board</Link>}
      <button type="button" className={styles.btnText} onClick={async () => {
        try { await logout(); } catch { setError('Unable to sign out. Please try again.'); }
      }}>Sign Out</button>
    </div> : <>
      <h3>{isSignUp ? 'Create Account' : 'Sign In to Save Spots'}</h3>
      <form onSubmit={submit} className={styles.authForm}>
        <label>Email<input type="email" value={email} autoComplete="email" required
          onChange={event => setEmail(event.target.value)} disabled={pending} /></label>
        <label>Password<input type="password" value={password} required minLength={6}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          onChange={event => setPassword(event.target.value)} disabled={pending} /></label>
        <button className={styles.authSubmitBtn} disabled={pending}>{pending ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Log In'}</button>
        <button type="button" className={styles.btnText} disabled={pending}
          onClick={() => { setIsSignUp(value => !value); setError(''); setPassword(''); }}>
          {isSignUp ? 'Already registered? Log In' : 'New here? Sign Up'}
        </button>
      </form>
    </>}
    {(error || sessionError) && <p role="alert" className={styles.authError}>{error || sessionError}</p>}
  </div>;
}
