import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Copy, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const Coupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    usage_limit: 100,
    expiry_date: '',
    status: 'active'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const shopId = user.shop_id;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons(shopId);
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({ ...newCoupon, shop_id: shopId, code: newCoupon.code.toUpperCase() });
      setShowAddModal(false);
      fetchCoupons();
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase: 0,
        usage_limit: 100,
        expiry_date: '',
        status: 'active'
      });
    } catch (error) {
      alert('Failed to create coupon. Code might already exist.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.deleteCoupon(id);
        fetchCoupons();
      } catch (error) {
        alert('Failed to delete coupon');
      }
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>Discount Vouchers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Create exclusive coupon codes for loyal customers</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={20} />
          <span>Generate Coupon</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {coupons.map((coupon) => (
            <div key={coupon.id} className="card-premium" style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary)', padding: '24px', color: '#fff', textAlign: 'center' }}>
                <Ticket size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>{coupon.code}</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700, marginTop: '4px' }}>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% DISCOUNT` : `${coupon.discount_value} ₭ DISCOUNT`}</p>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>REMAINING</p>
                    <p style={{ fontWeight: 900, fontSize: '1rem' }}>{coupon.usage_limit - coupon.used_count}</p>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>EXPIRES</p>
                    <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{new Date(coupon.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: coupon.status === 'active' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: '0.8rem' }}>
                      {coupon.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {coupon.status.toUpperCase()}
                   </div>
                   <button onClick={() => handleDelete(coupon.id)} style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="animate-scale-in" style={{ background: '#fff', width: '550px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Create Voucher</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 500 }}>Issue a new unique discount code</p>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="input-label">COUPON CODE</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="input-premium" style={{ flex: 1, textTransform: 'uppercase' }} required placeholder="E.G. WELCOME2024" />
                    <button type="button" onClick={generateCode} className="btn-secondary" style={{ width: '52px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="input-label">DISCOUNT TYPE</label>
                    <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="input-premium">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₭)</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">DISCOUNT VALUE</label>
                    <input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} className="input-premium" required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="input-label">MIN. PURCHASE (₭)</label>
                    <input type="number" value={newCoupon.min_purchase} onChange={e => setNewCoupon({...newCoupon, min_purchase: Number(e.target.value)})} className="input-premium" />
                  </div>
                  <div>
                    <label className="input-label">USAGE LIMIT</label>
                    <input type="number" value={newCoupon.usage_limit} onChange={e => setNewCoupon({...newCoupon, usage_limit: Number(e.target.value)})} className="input-premium" required />
                  </div>
                </div>

                <div>
                  <label className="input-label">EXPIRY DATE</label>
                  <input type="date" value={newCoupon.expiry_date} onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})} className="input-premium" required />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>Create Voucher</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input-label { display: block; fontSize: 0.75rem; fontWeight: 900; marginBottom: 8px; opacity: 0.6; }
      `}</style>
    </div>
  );
};

export default Coupons;
