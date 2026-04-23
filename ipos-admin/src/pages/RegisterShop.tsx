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
  ShieldCheck,
  CheckCircle2,
  Sparkles
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
  const [success, setSuccess] = useState(false);
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
      setSuccess(true);
      setTimeout(() => navigate('/login'), 5000);
    } catch (error) {
      alert('Failed to register. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-sidebar)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div className="animate-slide-up" style={{ maxWidth: '500px' }}>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            width: '100px', height: '100px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 32px',
            border: '2px solid var(--primary)',
            color: 'var(--primary)'
          }}>
            <CheckCircle2 size={50} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>Welcome Aboard!</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.7, lineHeight: 1.6, marginBottom: '40px' }}>
            Your account has been created. You are now the <strong>Primary Owner</strong>. 
            You can start managing your first shop and add more branches later!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary" 
              style={{ width: '100%', height: '60px', justifyContent: 'center' }}
            >
              Go to Login
            </button>
            <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Redirecting in 5 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px' 
    }}>
      <div className="animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '1000px', 
        background: '#fff', 
        borderRadius: '40px', 
        boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.2)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.5fr',
        overflow: 'hidden'
      }}>
        {/* Left Side: Branding */}
        <div style={{ 
          background: 'var(--bg-sidebar)', 
          padding: '60px 50px', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary), #059669)', 
              width: '64px', height: '64px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '40px',
              boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)'
            }}>
              <Sparkles size={32} />
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Empower Your <br/><span style={{ color: 'var(--primary)' }}>Business.</span>
            </h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '48px', fontWeight: 500 }}>
              One platform for all your branches. Register today and join the future of retail management.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: <ShieldCheck size={22} />, text: 'Enterprise Grade Security', sub: 'Your data is encrypted and safe' },
                { icon: <Layers size={22} />, text: 'Multi-Shop Infrastructure', sub: 'Scale from 1 to 100 branches' },
                { icon: <Store size={22} />, text: 'Real-time Synchronization', sub: 'Manage anywhere, anytime' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '2px' }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 800 }}>{item.text}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 500 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(40px)' }}></div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '60px 70px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <Link to="/login" style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              color: 'var(--text-muted)', textDecoration: 'none', 
              fontSize: '0.9rem', fontWeight: 800,
              transition: 'var(--transition)'
            }} className="btn-hover-premium">
              <ArrowLeft size={18} />
              <span>Sign In Instead</span>
            </Link>
            <div style={{ background: '#f1f5f9', padding: '6px 16px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>
              ACCOUNT REGISTRATION
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Initialize Your Account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontWeight: 500, fontSize: '1.05rem' }}>Enter your business details to get started.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>SHOP NAME</label>
                <div style={{ position: 'relative' }}>
                  <Store size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                  <input 
                    type="text" required placeholder="e.g. Galaxy Central"
                    value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>CONTACT PHONE</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                  <input 
                    type="text" required placeholder="+856 20..."
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>PRIMARY ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                <input 
                  type="text" required placeholder="Location of your first branch"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                />
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>OWNER IDENTITY</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                <input 
                  type="text" required placeholder="Legal Name"
                  value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>BUSINESS EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                <input 
                  type="email" required placeholder="owner@business.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                  <input 
                    type="password" required placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>CONFIRM</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.4 }} />
                  <input 
                    type="password" required placeholder="••••••••"
                    value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="input-premium" style={{ paddingLeft: '54px', height: '56px' }}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ marginTop: '20px', height: '64px', justifyContent: 'center', fontSize: '1.15rem', borderRadius: '18px' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
                  <span>Provisioning Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Owner Account</span>
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Layers = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

export default RegisterShop;
