import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

const RegisterShop = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    phone: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      setLoading(true);
      await api.registerShop(formData);
      alert('Registration successful! You can now login.');
      navigate('/login');
    } catch (error) {
      alert('Failed to register. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px' 
    }}>
      <div className="animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '900px', 
        background: '#fff', 
        borderRadius: '32px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        overflow: 'hidden'
      }}>
        {/* Left Side: Branding */}
        <div style={{ 
          background: 'var(--bg-sidebar)', 
          padding: '60px 40px', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <Store size={32} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>Join iPOS <br/><span style={{ color: 'var(--primary)' }}>Network.</span></h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '40px' }}>
              Scale your business with our premium POS infrastructure. Multi-shop ready, real-time analytics, and secure data sync.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: <ShieldCheck size={20} />, text: 'Enterprise Grade Security' },
                { icon: <Layers size={20} />, text: 'Multi-Shop Management' },
                { icon: <Database size={20} />, text: 'Automatic Cloud Sync' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600 }}>
                  <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative Circle */}
          <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}></div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>STEP 01/01</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text-main)' }}>Register Your Shop</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 500 }}>Let's get your business set up on the platform.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>SHOP NAME</label>
                <div style={{ position: 'relative' }}>
                  <Store size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" required placeholder="e.g. Vientiane Branch"
                    value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>PHONE NUMBER</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" required placeholder="+856 20..."
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>SHOP ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" required placeholder="City, District, Province"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>OWNER NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" required placeholder="Full Name"
                  value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>ADMIN EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" required placeholder="owner@email.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" required placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>CONFIRM</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" required placeholder="••••••••"
                    value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ marginTop: '16px', height: '60px', justifyContent: 'center', fontSize: '1.1rem' }}
            >
              {loading ? 'Processing...' : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reuse icons from Sidebar for the left panel
const Database = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;
const Layers = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

export default RegisterShop;
