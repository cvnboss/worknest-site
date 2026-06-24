'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Building2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', department: 'Engineering' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const departments = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Management'];

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    return Math.min(score, 4);
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      department: form.department,
    });

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="auth-layout" data-testid="register-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1 data-testid="register-title" className="flex items-center gap-2 justify-center"><Building2 size={32} className="text-primary-600" /> WorkNest</h1>
          <p>Create your account to get started.</p>
        </div>

        {error && <div className="auth-error" data-testid="register-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} data-testid="register-form">
          <div className="auth-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-firstName">First Name <span className="required">*</span></label>
              <input id="reg-firstName" type="text" className="form-input" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} required data-testid="register-firstname" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lastName">Last Name <span className="required">*</span></label>
              <input id="reg-lastName" type="text" className="form-input" placeholder="Doe" value={form.lastName} onChange={e => update('lastName', e.target.value)} required data-testid="register-lastname" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email <span className="required">*</span></label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@worknest.com" value={form.email} onChange={e => update('email', e.target.value)} required data-testid="register-email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-department">Department</label>
            <select id="reg-department" className="form-input form-select" value={form.department} onChange={e => update('department', e.target.value)} data-testid="register-department">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password <span className="required">*</span></label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required data-testid="register-password" />
            {form.password && (
              <>
                <div className="password-strength" data-testid="password-strength">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`password-strength-bar ${strength >= i ? 'active' : ''} ${strength <= 1 ? 'weak' : strength <= 2 ? 'medium' : 'strong'}`} />
                  ))}
                </div>
                <span className="form-hint">{strengthLabel[strength]}</span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password <span className="required">*</span></label>
            <input id="reg-confirm" type="password" className="form-input" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required data-testid="register-confirm-password" />
          </div>

          <button type="submit" className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`} disabled={loading} data-testid="register-submit">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login" data-testid="login-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
