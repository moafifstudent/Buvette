'use client';

import { useEffect, useState } from 'react';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';

interface AuthPanelProps {
  onAuthChange: () => void;
}

export default function AuthPanel({ onAuthChange }: AuthPanelProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState(process.env.NEXT_PUBLIC_ADMIN_USERNAME || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAuth = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login failed');
        return;
      }

      setAuthenticated(true);
      setPassword('');
      onAuthChange();
    } catch {
      setError('Network error while logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    onAuthChange();
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <div className="header-actions" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} />
          Admin Access
        </h2>
        {authenticated && (
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>

      {!authenticated ? (
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto' }}>
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <p style={{ color: '#94a3b8' }}>You are authenticated. Create and delete actions are enabled.</p>
      )}
    </div>
  );
}
