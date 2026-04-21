import React, { useState } from 'react';
import { ShoppingCart, Lock, Mail, Eye, EyeOff, Loader2, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      localStorage.setItem('user', JSON.stringify(res.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'radial-gradient(circle at top left, #1e293b, #0f172a, #020617)', 
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--primary-glow), transparent 70%)', opacity: 0.3, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)', opacity: 0.2, pointerEvents: 'none' }}></div>

      <div className="animate-slide-up" style={{ 
        width: '100%', maxWidth: '440px', background: 'rgba(255, 255, 255, 0.03)', 
        padding: '48px', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), #059669)', 
            width: '64px', height: '64px', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 24px',
            boxShadow: '0 12px 32px var(--primary-glow)',
            transform: 'rotate(-4deg)'
          }}>
            <ShoppingCart size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Welcome Back</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontSize: '1rem', fontWeight: 500 }}>Global iPOS Network Control</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(220, 38, 38, 0.1)', color: '#f87171', padding: '14px 20px', 
            borderRadius: '16px', fontSize: '0.9rem', marginBottom: '28px', 
            border: '1px solid rgba(220, 38, 38, 0.2)', textAlign: 'center',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>WORK EMAIL</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@ipos-pro.com"
                className="login-input"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>ACCESS KEY</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', 
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                  transition: 'var(--transition)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '12px', 
              background: 'linear-gradient(135deg, var(--primary), #059669)', 
              color: '#fff', 
              padding: '16px', 
              borderRadius: '16px', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'var(--transition)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              boxShadow: '0 8px 24px var(--primary-glow)'
            }}
            className="login-btn"
          >
            {loading ? <Loader2 size={22} className="animate-spin" /> : (
              <>
                <span>Secure Access</span>
                <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Missing credentials? <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Help Center</span>
        </p>
      </div>

      <style>{`
        .login-input {
          width: 100%;
          padding: 16px 20px 16px 54px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          outline: none;
          transition: var(--transition);
          font-size: 1rem;
        }
        .login-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px var(--primary-glow);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};


export default Login;
