import { useState, useEffect } from 'react';
// Navigation and token handling without react-router-dom
const navigate = (path) => { window.location.assign(path); };
const token = window.location.pathname.split('/').pop();
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {

  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password !== confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      // Store new JWT and redirect to dashboard
      localStorage.setItem('token', data.token);
      toast('Password reset successful! Redirecting...', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast(err.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // If token missing, redirect home
  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        transition: 'background var(--transition-normal)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
          Set New Password
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={setPassword}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            required
            value={confirm}
            onChange={setConfirm}
          />
          <Button type="submit" loading={loading} style={{ width: '100%', padding: '12px' }}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
