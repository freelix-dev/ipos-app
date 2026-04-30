import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  Gift, 
  Info,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';

const Promotions = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_spend: 0,
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const shopId = user.shop_id;

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await api.getPromotions(shopId);
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPromotion({ ...newPromo, shop_id: shopId });
      setShowAddModal(false);
      fetchPromotions();
      setNewPromo({
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        min_spend: 0,
        start_date: '',
        end_date: '',
        status: 'active'
      });
    } catch (error) {
      alert('Failed to create promotion');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await api.deletePromotion(id);
        fetchPromotions();
      } catch (error) {
        alert('Failed to delete promotion');
      }
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>ແຄມເປນການຕະຫຼາດ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ເພີ່ມຍອດຂາຍດ້ວຍໂປຣໂມຊັ່ນ ແລະ ຂໍ້ສະເໜີພິເສດຕາມລະດູການ</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={20} />
          <span>ໂປຣໂມຊັ່ນໃໝ່</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {promotions.map((promo) => (
            <div key={promo.id} className="card-premium" style={{ background: '#fff', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                padding: '6px 12px', 
                borderRadius: '10px', 
                fontSize: '0.7rem', 
                fontWeight: 900,
                background: promo.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: promo.status === 'active' ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {promo.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {promo.status === 'active' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  padding: '12px', 
                  borderRadius: '14px' 
                }}>
                  {promo.type === 'percentage' ? <Percent size={24} /> : (promo.type === 'bogo' ? <Gift size={24} /> : <Tag size={24} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>{promo.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>{promo.description}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>ມູນຄ່າ</label>
                  <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>
                    {promo.type === 'percentage' ? `ຫຼຸດ ${promo.value}%` : (promo.type === 'bogo' ? 'ຊື້ 1 ແຖມ 1' : `ຫຼຸດ ${promo.value} ₭`)}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>ຂັ້ນຕ່ຳ</label>
                  <p style={{ fontWeight: 900, fontSize: '1rem' }}>{promo.min_spend > 0 ? `${promo.min_spend} ₭` : 'ບໍ່ມີຂັ້ນຕ່ຳ'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Calendar size={14} />
                  <span>{new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleDelete(promo.id)} style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="animate-scale-in" style={{ background: '#fff', width: '600px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>ສ້າງແຄມເປນໃໝ່</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 500 }}>ສ້າງຂໍ້ສະເໜີໂປຣໂມຊັ່ນໃໝ່ສຳລັບລູກຄ້າຂອງທ່ານ</p>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="input-label">ຊື່ແຄມເປນ</label>
                  <input type="text" value={newPromo.name} onChange={e => setNewPromo({...newPromo, name: e.target.value})} className="input-premium" required placeholder="ຕົວຢ່າງ: ໂປຣໂມຊັ່ນປີໃໝ່ 2024" />
                </div>
                
                <div>
                  <label className="input-label">ລາຍລະອຽດ</label>
                  <textarea value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})} className="input-premium" style={{ height: '80px', resize: 'none' }} placeholder="ລະບຸລາຍລະອຽດຂອງໂປຣໂມຊັ່ນ..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="input-label">ປະເພດໂປຣໂມຊັ່ນ</label>
                    <select value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value})} className="input-premium">
                      <option value="percentage">ສ່ວນຫຼຸດເປັນເປີເຊັນ (%)</option>
                      <option value="fixed">ສ່ວນຫຼຸດເປັນຈຳນວນເງິນ (₭)</option>
                      <option value="bogo">ຊື້ 1 ແຖມ 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">ມູນຄ່າ</label>
                    <input type="number" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: Number(e.target.value)})} className="input-premium" disabled={newPromo.type === 'bogo'} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="input-label">ວັນທີເລີ່ມຕົ້ນ</label>
                    <input type="date" value={newPromo.start_date} onChange={e => setNewPromo({...newPromo, start_date: e.target.value})} className="input-premium" required />
                  </div>
                  <div>
                    <label className="input-label">ວັນທີສິ້ນສຸດ</label>
                    <input type="date" value={newPromo.end_date} onChange={e => setNewPromo({...newPromo, end_date: e.target.value})} className="input-premium" required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>ຍົກເລີກ</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>ສ້າງແຄມເປນ</button>
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

export default Promotions;
