'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Building2, Eye, EyeOff } from 'lucide-react';

const demoAccounts = [
  { email: 'admin@worknest.com', password: 'admin123', role: 'Admin' },
  { email: 'manager@worknest.com', password: 'manager123', role: 'Manager' },
  { email: 'john@worknest.com', password: 'password123', role: 'Employee' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="auth-layout" data-testid="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1 data-testid="login-title" className="flex items-center gap-2 justify-center"><Building2 size={32} className="text-primary-600" /> WorkNest</h1>
          <p>Welcome back! Sign in to your portal.</p>
        </div>

        {error && <div className="auth-error" data-testid="login-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@worknest.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              data-testid="login-email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                data-testid="login-password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-checkbox-group">
            <input type="checkbox" id="remember" className="form-checkbox" data-testid="login-remember" />
            <label htmlFor="remember" className="form-checkbox-label">Remember me</label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            data-testid="login-submit"
          >
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" data-testid="register-link">Create one</Link>
        </div>

        <details className="demo-accounts" data-testid="demo-accounts">
          <summary>Demo Accounts</summary>
          <div className="demo-accounts-list">
            {demoAccounts.map(account => (
              <div
                key={account.email}
                className="demo-account-item"
                onClick={() => fillDemo(account)}
                data-testid={`demo-${account.role.toLowerCase()}`}
              >
                <span>{account.email}</span>
                <span className="demo-role">{account.role}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
